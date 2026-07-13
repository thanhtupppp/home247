import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, sendError } from '../_lib/auth';
import { checkAndIncrementQuota } from '../_lib/rateLimit';
import { callOpenRouter, OpenRouterModels, ChatMessage } from '../_lib/openrouter';
import { SYSTEM_TICKET_PROMPT } from '../ai/prompts';
import { supportRequestSchema } from '../ai/schemas';
import { adminDb } from '../_lib/firebaseAdmin';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  const { ticketId } = req.body || {};
  if (!ticketId) return sendError(res, 400, 'Missing ticketId.');

  try {
    await checkAndIncrementQuota(uid, 'ticket');

    const docRef = adminDb.collection('supportRequests').doc(ticketId);
    const snap = await docRef.get();
    if (!snap.exists) return sendError(res, 404, 'Ticket not found.');

    const ticketData = snap.data() || {};

    // Security: ensure caller owns this support request
    if (ticketData.ownerId !== uid) {
      return sendError(res, 403, 'Bạn không có quyền truy cập yêu cầu này.');
    }

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_TICKET_PROMPT },
      { role: 'user', content: `Tiêu đề: ${ticketData.title}\nNội dung: ${ticketData.description}` },
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT,
      response_format: { type: 'json_object' },
      timeoutMs: 30000,
      zdr: true,
    });

    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const validation = supportRequestSchema.safeParse(parsed);

    if (!validation.success) {
      console.error('[process-ticket] Validation failed:', validation.error.format());
      return sendError(res, 500, 'Dữ liệu phân tích phản ánh từ AI không hợp lệ.');
    }

    return res.status(200).json(validation.data);
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    console.error('[process-ticket] Error:', err);
    return sendError(res, 500, err.message || 'Không thể phân tích phản ánh lúc này.');
  }
}
