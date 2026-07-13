import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, sendError } from '../src/_lib/auth';
import { checkAndIncrementQuota } from '../src/_lib/rateLimit';
import { callOpenRouter, OpenRouterModels, ChatMessage } from '../src/_lib/openrouter';
import { SYSTEM_CONTRACT_PROMPT } from '../src/ai/prompts';
import { summarizeContractSchema } from '../src/ai/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  const { contractDocBase64 } = req.body || {};
  if (!contractDocBase64) return sendError(res, 400, 'Missing contractDocBase64.');
  if (contractDocBase64.length > 7_000_000) {
    return sendError(res, 400, 'Tài liệu ảnh vượt quá dung lượng cho phép (tối đa 5MB).');
  }

  try {
    await checkAndIncrementQuota(uid, 'contract');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_CONTRACT_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: 'Trích xuất thông tin hợp đồng này:' },
          {
            type: 'image_url',
            image_url: {
              url: contractDocBase64.startsWith('data:')
                ? contractDocBase64
                : `data:image/jpeg;base64,${contractDocBase64}`,
            },
          },
        ],
      },
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.AGENT,
      response_format: { type: 'json_object' },
      timeoutMs: 45000,
      zdr: true,
    });

    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const validation = summarizeContractSchema.safeParse(parsed);

    if (!validation.success) {
      return sendError(res, 500, 'Dữ liệu trích xuất hợp đồng từ AI không đúng cấu trúc hợp lệ.');
    }

    return res.status(200).json(validation.data);
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    console.error('[summarize-contract] Error:', err);
    return sendError(res, 500, err.message || 'Không thể trích xuất thông tin hợp đồng tự động.');
  }
}
