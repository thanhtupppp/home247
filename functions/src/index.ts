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
  getLandlordInvoices, 
  getExpiringContracts, 
  getLandlordSupportRequests 
} from './utils/firestore';

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
 * 1. getAISummary - Stage 1
 */
export const getAISummary = functions.region('asia-east1').https.onCall(async (data, context) => {
  const uid = verifyAuth(context);

  try {
    const [invoices, expiringContracts, supportRequests] = await Promise.all([
      getLandlordInvoices(uid),
      getExpiringContracts(uid, 30),
      getLandlordSupportRequests(uid),
    ]);

    // Filter to only invoices that are pending AND overdue
    const today = new Date();
    const overdueInvoices = invoices.filter(i => {
      if (!i.dueDate) return false;
      const parts = i.dueDate.split('/');
      if (parts.length === 3) {
        const dueD = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        return dueD.getTime() < today.getTime();
      }
      return false;
    });

    const totalOverdueAmount = overdueInvoices.reduce((sum, i) => sum + (Number(i.amount) || 0), 0);

    // Sanitize stats: remove tenant name to protect privacy
    const statsText = `
    Dữ liệu thô vận hành hiện tại:
    - Tổng số hóa đơn trễ hạn: ${overdueInvoices.length}
    - Tổng số tiền trễ hạn cần thu hồi: ${totalOverdueAmount} VND
    - Các hóa đơn trễ hạn (phòng, tháng): ${JSON.stringify(overdueInvoices.map(i => ({ room: i.roomCode, month: i.month, amount: i.amount })))}
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
      temperature: 0.3 
    });

    return { 
      summary: result.choices?.[0]?.message?.content || 'Không thể tạo tóm tắt.' 
    };
  } catch (err: any) {
    if (err.message === 'OPENROUTER_API_KEY_NOT_CONFIGURED') {
      throw new functions.https.HttpsError('failed-precondition', 'API Key OpenRouter chưa được cấu hình.');
    }
    throw new functions.https.HttpsError('unavailable', err.message || 'Hệ thống AI hiện chưa khả dụng.');
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
      model: OpenRouterModels.DEFAULT,
      response_format: { type: 'json_object' }
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (err: any) {
    if (err.status) throw err; // Re-throw HttpsError directly
    throw new functions.https.HttpsError('unavailable', err.message || 'Không thể phân tích phản ánh lúc này.');
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

  try {
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
      response_format: { type: 'json_object' }
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    
    if (parsed.reading === undefined || isNaN(parsed.reading)) {
      throw new Error('Chỉ số nhận diện không hợp lệ.');
    }
    
    return parsed;
  } catch (err: any) {
    throw new functions.https.HttpsError(
      'unavailable',
      'Không thể nhận diện công tơ. Vui lòng chụp lại ảnh rõ nét hoặc tự nhập thủ công.'
    );
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

  try {
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
      model: OpenRouterModels.VISION,
      response_format: { type: 'json_object' }
    });
    
    const content = result.choices?.[0]?.message?.content || '{}';
    return JSON.parse(content);
  } catch (err: any) {
    throw new functions.https.HttpsError(
      'unavailable',
      'Không thể trích xuất thông tin hợp đồng tự động. Vui lòng tự nhập thủ công.'
    );
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

  try {
    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_AGENT_PROMPT },
      ...history.slice(-20), // Quota limit: only process last 20 messages for context window stability
      { role: 'user', content: userMessage }
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT,
      tools: agentTools,
      temperature: 0.1
    });

    const responseMsg = result.choices?.[0]?.message;
    if (!responseMsg) {
      return { content: 'Không nhận được câu trả lời từ trợ lý.' };
    }

    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      messages.push(responseMsg);

      const toolCall = responseMsg.tool_calls[0];
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

      const secondCallResult = await callOpenRouter(messages, {
        model: OpenRouterModels.AGENT,
        temperature: 0.1
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
    throw new functions.https.HttpsError('unavailable', err.message || 'Trợ lý AI hiện đang bận.');
  }
});
