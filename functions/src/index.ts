import * as functions from 'firebase-functions';
import { db } from './utils/firestore';
import { 
  callOpenRouter, 
  OpenRouterModels, 
  ChatMessage 
} from './ai/openrouter';
import { 
  SYSTEM_SUMMARY_PROMPT, 
  SYSTEM_TICKET_PROMPT, 
  SYSTEM_OCR_PROMPT, 
  SYSTEM_CONTRACT_PROMPT, 
  SYSTEM_AGENT_PROMPT 
} from './ai/prompts';
import { agentTools, executeTool } from './ai/tools';
import { 
  getOverdueInvoices, 
  getExpiringContracts, 
  getLandlordSupportRequests,
  getLandlordBuildings,
  getLandlordRooms,
  getAllLandlordInvoices
} from './utils/firestore';
import { 
  ocrUtilityMeterSchema, 
  summarizeContractSchema, 
  supportRequestSchema,
  migrationInputSchema
} from './ai/schemas';
import { checkAndIncrementQuota } from './ai/rateLimit';
import { runInvoicesMigration } from './migrations/invoices';
import { z } from 'zod';

/**
 * Zod Schema for chat history validation
 */
const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1, "Nội dung tin nhắn không được trống").max(4000, "Nội dung tin nhắn tối đa 4000 ký tự"),
});

const historySchema = z.array(historyMessageSchema).max(20, "Lịch sử tối đa 20 tin nhắn");

/**
 * Helper to check authenticated caller
 */
function verifyAuth(context: functions.https.CallableContext): string {
  const uid = context.auth?.uid;
  if (!uid) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }
  return uid;
}

/**
 * helper to format rate limit errors nicely
 */
function handleAIError(err: any, defaultMsg: string): never {
  if (err instanceof functions.https.HttpsError) {
    throw err;
  }
  if (err.message && err.message.startsWith('QUOTA_EXCEEDED')) {
    throw new functions.https.HttpsError(
      'resource-exhausted',
      'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.'
    );
  }
  throw new functions.https.HttpsError('unavailable', err.message || defaultMsg);
}

/**
 * 0. migrateOldInvoices - (P0 Invoice Migration Helper)
 */
export const migrateOldInvoices = functions.region('asia-east1').https.onCall(async (data, context) => {
  const uid = verifyAuth(context);

  try {
    // 1. Validate migration input params strictly using Zod
    const validation = migrationInputSchema.safeParse(data);
    if (!validation.success) {
      throw new functions.https.HttpsError(
        'invalid-argument', 
        `Tham số di cư dữ liệu không hợp lệ: ${JSON.stringify(validation.error.format())}`
      );
    }
    const { dryRun, limit, startAfterId } = validation.data;

    // 2. Apply quota (increased limit to 20 for batch transitions)
    await checkAndIncrementQuota(uid, 'migration');

    const result = await runInvoicesMigration(uid, limit, startAfterId, dryRun);
    return result;
  } catch (err: any) {
    handleAIError(err, 'Lỗi trong quá trình di cư dữ liệu hóa đơn.');
  }
});

/**
 * 1. getAISummary - Stage 1
 */
export const getAISummary = functions.region('asia-east1').https.onCall(async (data, context) => {
  const uid = verifyAuth(context);

  try {
    // 1. Quota check
    await checkAndIncrementQuota(uid, 'summary');

    const [allInvoices, overdueInvoices, expiringContracts, supportRequests, buildings, rooms] = await Promise.all([
      getAllLandlordInvoices(uid),
      getOverdueInvoices(uid),
      getExpiringContracts(uid, 30),
      getLandlordSupportRequests(uid),
      getLandlordBuildings(uid),
      getLandlordRooms(uid),
    ]);

    // Calculate billing/revenue metrics
    const totalBillingAmount = allInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const paidBillingAmount = allInvoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const pendingBillingAmount = allInvoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const collectionRate = totalBillingAmount > 0 ? Math.round((paidBillingAmount / totalBillingAmount) * 100) : 0;

    const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const emptyRooms = rooms.filter(r => r.status === 'empty').length;

    // Sanitize stats: remove tenant names to protect privacy
    const statsText = `
    Quy mô hệ thống phòng của chủ nhà:
    - Tổng số tòa nhà đang quản lý: ${buildings.length}
    - Tổng số phòng trọ: ${totalRooms} (Phòng đang cho thuê/đang ở: ${occupiedRooms}, Phòng còn trống: ${emptyRooms})

    Thống kê doanh số và dòng tiền:
    - Tổng doanh số hóa đơn phát sinh: ${totalBillingAmount} VND
    - Doanh thu thực tế đã thu: ${paidBillingAmount} VND
    - Doanh thu còn nợ (chưa thanh toán): ${pendingBillingAmount} VND (Trong đó nợ quá hạn: ${totalOverdueAmount} VND)
    - Tỷ lệ thu hồi dòng tiền: ${collectionRate}%

    Dữ liệu thô vận hành hiện tại:
    - Tổng số hóa đơn trễ hạn: ${overdueInvoices.length}
    - Các hóa đơn trễ hạn (phòng, tháng, số tiền): ${JSON.stringify(overdueInvoices.map(i => ({ room: i.roomCode, month: i.month, amount: i.amount })))}
    - Số hợp đồng sẽ hết hạn trong 30 ngày: ${expiringContracts.length}
    - Các phòng có hợp đồng hết hạn: ${JSON.stringify(expiringContracts.map(c => ({ room: c.roomCode, endDate: c.endDate })))}
    - Số phản ánh đang chờ xử lý: ${supportRequests.length}
    - Các phản ánh: ${JSON.stringify(supportRequests.map(r => ({ room: r.roomCode, title: r.title, level: r.level })))}
    `;

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_SUMMARY_PROMPT },
      { role: 'user', content: statsText }
    ];

    const result = await callOpenRouter(messages, { 
      model: OpenRouterModels.DEFAULT,
      temperature: 0.3,
      timeoutMs: 20000 // 20s timeout limit
    });

    return { 
      summary: result.choices?.[0]?.message?.content || 'Không thể tạo tóm tắt.' 
    };
  } catch (err: any) {
    if (err.message === 'OPENROUTER_API_KEY_NOT_CONFIGURED') {
      throw new functions.https.HttpsError('failed-precondition', 'API Key OpenRouter chưa được cấu hình.');
    }
    handleAIError(err, 'Hệ thống AI hiện chưa khả dụng.');
  }
});

/**
 * 2. processSupportRequest - Stage 1/2
 */
export const processSupportRequest = functions.region('asia-east1').https.onCall(async (data, context) => {
  const uid = verifyAuth(context);
  const { ticketId } = data;
  if (!ticketId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing ticketId.');
  }

  try {
    // 1. Quota check
    await checkAndIncrementQuota(uid, 'ticket');

    const docRef = db.collection('supportRequests').doc(ticketId);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new functions.https.HttpsError('not-found', 'Ticket not found.');
    }
    
    const ticketData = snap.data() || {};

    // P0 SECURITY AUDIT CHECK: Ensure caller owns the support request
    if (ticketData.ownerId !== uid) {
      throw new functions.https.HttpsError(
        'permission-denied',
        'Bạn không có quyền truy cập yêu cầu này.'
      );
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_TICKET_PROMPT },
      { role: 'user', content: `Tiêu đề: ${ticketData.title}\nNội dung: ${ticketData.description}` }
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT, // GPT-4o Mini supports ZDR compliant endpoints
      response_format: { type: 'json_object' },
      timeoutMs: 30000, // 30s timeout limit
      zdr: true // Sensitive resident data: enforce ZDR
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    // Strict schema check using Zod
    const validation = supportRequestSchema.safeParse(parsed);
    if (!validation.success) {
      functions.logger.error('Ticket Output validation failed:', validation.error.format());
      throw new functions.https.HttpsError('internal', 'Dữ liệu phân tích phản ánh từ AI không hợp lệ.');
    }

    return validation.data;
  } catch (err: any) {
    handleAIError(err, 'Không thể phân tích phản ánh lúc này.');
  }
});

/**
 * 3. ocrUtilityMeter - Stage 2
 */
export const ocrUtilityMeter = functions.region('asia-east1').https.onCall(async (data, context) => {
  verifyAuth(context);
  const { imageBase64, type } = data;
  if (!imageBase64) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing imageBase64.');
  }

  // P0 INPUT LIMIT: Block base64 string larger than ~5MB (about 7 million base64 characters)
  if (imageBase64.length > 7000000) {
    throw new functions.https.HttpsError('invalid-argument', 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB).');
  }

  try {
    // 1. Quota check
    const uid = verifyAuth(context);
    await checkAndIncrementQuota(uid, 'ocr');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_OCR_PROMPT },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: `Hãy đọc chỉ số cho công tơ loại: ${type || 'điện'}` },
          { 
            type: 'image_url', 
            image_url: { url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}` } 
          }
        ] 
      }
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.VISION,
      response_format: { type: 'json_object' },
      timeoutMs: 45000 // 45s timeout limit for Vision processing
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    // Strict schema check using Zod
    const validation = ocrUtilityMeterSchema.safeParse(parsed);
    if (!validation.success) {
      functions.logger.error('OCR Output validation failed:', validation.error.format());
      throw new functions.https.HttpsError('internal', 'Chỉ số công tơ nhận dạng từ AI không hợp lệ.');
    }

    return validation.data;
  } catch (err: any) {
    handleAIError(err, 'Không thể nhận diện công tơ. Vui lòng chụp lại ảnh rõ nét hoặc tự nhập thủ công.');
  }
});

/**
 * 4. summarizeContract - Stage 2
 */
export const summarizeContract = functions.region('asia-east1').https.onCall(async (data, context) => {
  verifyAuth(context);
  const { contractDocBase64 } = data;
  if (!contractDocBase64) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing contractDocBase64.');
  }

  // P0 INPUT LIMIT: Block base64 string larger than ~5MB (about 7 million base64 characters)
  if (contractDocBase64.length > 7000000) {
    throw new functions.https.HttpsError('invalid-argument', 'Tài liệu ảnh vượt quá dung lượng cho phép (tối đa 5MB).');
  }

  try {
    // 1. Quota check
    const uid = verifyAuth(context);
    await checkAndIncrementQuota(uid, 'contract');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_CONTRACT_PROMPT },
      { 
        role: 'user', 
        content: [
          { type: 'text', text: 'Trích xuất thông tin hợp đồng này:' },
          { 
            type: 'image_url', 
            image_url: { url: contractDocBase64.startsWith('data:') ? contractDocBase64 : `data:image/jpeg;base64,${contractDocBase64}` } 
          }
        ] 
      }
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT, // GPT-4o Mini is multimodal and ZDR compliant
      response_format: { type: 'json_object' },
      timeoutMs: 45000, // 45s timeout limit for Vision processing
      zdr: true // Sensitive resident data: enforce ZDR
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    // Strict schema check using Zod
    const validation = summarizeContractSchema.safeParse(parsed);
    if (!validation.success) {
      functions.logger.error('Contract Output validation failed:', validation.error.format());
      throw new functions.https.HttpsError('internal', 'Dữ liệu trích xuất hợp đồng từ AI không đúng cấu trúc hợp lệ.');
    }

    return validation.data;
  } catch (err: any) {
    handleAIError(err, 'Không thể trích xuất thông tin hợp đồng tự động. Vui lòng tự nhập thủ công.');
  }
});

/**
 * 5. speechToIntent - Stage 2 (Disabled in Production/Beta)
 */
export const speechToIntent = functions.region('asia-east1').https.onCall(async (data, context) => {
  verifyAuth(context);
  throw new functions.https.HttpsError(
    'unimplemented',
    'Chức năng giọng nói hiện chưa khả dụng trên môi trường này.'
  );
});

/**
 * 6. runAIAgent - Stage 3 (Agentic workflow loop)
 */
export const runAIAgent = functions.region('asia-east1').https.onCall(async (data, context) => {
  const uid = verifyAuth(context);
  const { userMessage, history = [] } = data;
  if (!userMessage) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing userMessage.');
  }

  // P0 INPUT LIMITS: Block tin nhắn dài hơn 4.000 ký tự
  if (userMessage.length > 4000) {
    throw new functions.https.HttpsError('invalid-argument', 'Tin nhắn quá dài (vượt quá 4.000 ký tự).');
  }

  try {
    // 1. Quota check
    await checkAndIncrementQuota(uid, 'chat');

    // Sanitize and strictly validate history using Zod Schema to block structural injections
    const validation = historySchema.safeParse(history);
    if (!validation.success) {
      functions.logger.error('History validation failed:', validation.error.format());
      throw new functions.https.HttpsError('invalid-argument', 'Lịch sử cuộc hội thoại không đúng định dạng hợp lệ.');
    }
    const cleanHistory = validation.data;

    // Get current landlord buildings and rooms context to feed into prompt
    const [buildings, rooms] = await Promise.all([
      getLandlordBuildings(uid),
      getLandlordRooms(uid)
    ]);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter(r => r.status === 'occupied').length;
    const emptyRooms = rooms.filter(r => r.status === 'empty').length;

    const contextPrompt = `${SYSTEM_AGENT_PROMPT}\n\nThông tin danh mục quản lý thực tế hiện tại của chủ nhà:\n- Tổng số tòa nhà đang quản lý: ${buildings.length}\n- Tổng số phòng trọ: ${totalRooms} (Đang ở/Có người thuê: ${occupiedRooms}, Phòng còn trống: ${emptyRooms}).`;

    const messages: ChatMessage[] = [
      { role: 'system', content: contextPrompt },
      ...cleanHistory,
      { role: 'user', content: userMessage }
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT,
      tools: agentTools,
      temperature: 0.1,
      timeoutMs: 30000 // 30s timeout limit
    });

    const responseMsg = result.choices?.[0]?.message;
    if (!responseMsg) {
      return { content: 'Không nhận được câu trả lời từ trợ lý.' };
    }

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      messages.push(responseMsg);

      // Loop through all tool calls returned by the model sequentially to support parallel tool execution
      for (const toolCall of responseMsg.tool_calls) {
        let toolArgs = {};
        try {
          toolArgs = typeof toolCall.function.arguments === 'string' 
            ? JSON.parse(toolCall.function.arguments) 
            : toolCall.function.arguments;
        } catch (e) {}

        const toolResult = await executeTool(toolCall.function.name, toolArgs, uid);

        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(toolResult)
        });
      }

      // Recall OpenRouter to interpret all executed tools outputs
      const secondCallResult = await callOpenRouter(messages, {
        model: OpenRouterModels.AGENT,
        temperature: 0.1,
        timeoutMs: 30000
      });

      return {
        content: secondCallResult.choices?.[0]?.message?.content || 'Lỗi xử lý kết quả tra cứu.',
        history: messages.slice(1)
      };
    }

    messages.push(responseMsg);
    return {
      content: responseMsg.content || 'Trợ lý không phản hồi.',
      history: messages.slice(1)
    };
  } catch (err: any) {
    handleAIError(err, 'Trợ lý AI hiện đang bận.');
  }
});
