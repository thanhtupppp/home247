import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuth, sendError } from '../src/_lib/auth';
import { checkAndIncrementQuota } from '../src/_lib/rateLimit';
import { callOpenRouter, OpenRouterModels, ChatMessage } from '../src/_lib/openrouter';
import { SYSTEM_AGENT_PROMPT } from '../src/ai/prompts';
import { agentTools, executeTool } from '../src/ai/tools';
import { getLandlordBuildings, getLandlordRooms } from '../src/firestore/queries';

const historyMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});
const historySchema = z.array(historyMessageSchema).max(20);

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  const { userMessage, history = [] } = req.body || {};
  if (!userMessage) return sendError(res, 400, 'Missing userMessage.');
  if (userMessage.length > 4000) return sendError(res, 400, 'Tin nhắn quá dài (vượt quá 4.000 ký tự).');

  try {
    await checkAndIncrementQuota(uid, 'chat');

    const validation = historySchema.safeParse(history);
    if (!validation.success) {
      return sendError(res, 400, 'Lịch sử cuộc hội thoại không đúng định dạng hợp lệ.');
    }
    const cleanHistory = validation.data;

    const [buildings, rooms] = await Promise.all([
      getLandlordBuildings(uid),
      getLandlordRooms(uid),
    ]);
    const occupiedRooms = rooms.filter((r: any) => r.status === 'occupied').length;
    const emptyRooms = rooms.filter((r: any) => r.status === 'empty').length;

    const contextPrompt = `${SYSTEM_AGENT_PROMPT}\n\nThông tin danh mục quản lý thực tế hiện tại của chủ nhà:\n- Tổng số tòa nhà đang quản lý: ${buildings.length}\n- Tổng số phòng trọ: ${rooms.length} (Đang ở/Có người thuê: ${occupiedRooms}, Phòng còn trống: ${emptyRooms}).`;

    const messages: ChatMessage[] = [
      { role: 'system', content: contextPrompt },
      ...cleanHistory,
      { role: 'user', content: userMessage },
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT,
      tools: agentTools,
      temperature: 0.1,
      timeoutMs: 30000,
    });

    const responseMsg = result.choices?.[0]?.message;
    if (!responseMsg) {
      return res.status(200).json({ content: 'Không nhận được câu trả lời từ trợ lý.' });
    }

    // Handle tool calls (agentic loop)
    if (responseMsg.tool_calls && responseMsg.tool_calls.length > 0) {
      messages.push(responseMsg);

      for (const toolCall of responseMsg.tool_calls) {
        let toolArgs = {};
        try {
          toolArgs = typeof toolCall.function.arguments === 'string'
            ? JSON.parse(toolCall.function.arguments)
            : toolCall.function.arguments;
        } catch {}

        const toolResult = await executeTool(toolCall.function.name, toolArgs, uid);
        messages.push({
          role: 'tool',
          tool_call_id: toolCall.id,
          name: toolCall.function.name,
          content: JSON.stringify(toolResult),
        });
      }

      const secondResult = await callOpenRouter(messages, {
        model: OpenRouterModels.AGENT,
        temperature: 0.1,
        timeoutMs: 30000,
      });

      return res.status(200).json({
        content: secondResult.choices?.[0]?.message?.content || 'Lỗi xử lý kết quả tra cứu.',
        history: messages.slice(1),
      });
    }

    messages.push(responseMsg);
    return res.status(200).json({
      content: responseMsg.content || 'Trợ lý không phản hồi.',
      history: messages.slice(1),
    });
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    console.error('[run-agent] Error:', err);
    return sendError(res, 500, err.message || 'Trợ lý AI hiện đang bận.');
  }
}
