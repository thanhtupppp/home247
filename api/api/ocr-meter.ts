import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, sendError } from '../src/_lib/auth';
import { checkAndIncrementQuota } from '../src/_lib/rateLimit';
import { callOpenRouter, OpenRouterModels, ChatMessage } from '../src/_lib/openrouter';
import { SYSTEM_OCR_PROMPT } from '../src/ai/prompts';
import { ocrUtilityMeterSchema } from '../src/ai/schemas';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  const { imageBase64, type } = req.body || {};
  if (!imageBase64) return sendError(res, 400, 'Missing imageBase64.');
  if (imageBase64.length > 7_000_000) {
    return sendError(res, 400, 'Ảnh vượt quá dung lượng cho phép (tối đa 5MB).');
  }

  try {
    await checkAndIncrementQuota(uid, 'ocr');

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_OCR_PROMPT },
      {
        role: 'user',
        content: [
          { type: 'text', text: `Hãy đọc chỉ số cho công tơ loại: ${type || 'điện'}` },
          {
            type: 'image_url',
            image_url: {
              url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
            },
          },
        ],
      },
    ];

    const result = await callOpenRouter(messages, {
      model: OpenRouterModels.VISION,
      response_format: { type: 'json_object' },
      timeoutMs: 45000,
    });

    const content = result.choices?.[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);
    const validation = ocrUtilityMeterSchema.safeParse(parsed);

    if (!validation.success) {
      return sendError(res, 500, 'Chỉ số công tơ nhận dạng từ AI không hợp lệ.');
    }

    return res.status(200).json(validation.data);
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    console.error('[ocr-meter] Error:', err);
    return sendError(res, 500, err.message || 'Không thể nhận diện công tơ. Vui lòng chụp lại ảnh rõ nét hoặc tự nhập thủ công.');
  }
}
