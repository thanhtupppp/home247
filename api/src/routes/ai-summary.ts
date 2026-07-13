import type { VercelRequest, VercelResponse } from '@vercel/node';
import { verifyAuth, sendError } from '../_lib/auth';
import { checkAndIncrementQuota } from '../_lib/rateLimit';
import { callOpenRouter, OpenRouterModels, ChatMessage } from '../_lib/openrouter';
import { SYSTEM_SUMMARY_PROMPT } from '../ai/prompts';
import {
  getAllLandlordInvoices,
  getOverdueInvoices,
  getExpiringContracts,
  getLandlordSupportRequests,
  getLandlordBuildings,
  getLandlordRooms,
} from '../firestore/queries';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  try {
    await checkAndIncrementQuota(uid, 'summary');

    const [allInvoices, overdueInvoices, expiringContracts, supportRequests, buildings, rooms] =
      await Promise.all([
        getAllLandlordInvoices(uid),
        getOverdueInvoices(uid),
        getExpiringContracts(uid, 30),
        getLandlordSupportRequests(uid),
        getLandlordBuildings(uid),
        getLandlordRooms(uid),
      ]);

    const totalBillingAmount = allInvoices.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const paidBillingAmount = allInvoices.filter((i: any) => i.status === 'paid').reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const pendingBillingAmount = allInvoices.filter((i: any) => i.status === 'pending').reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const collectionRate = totalBillingAmount > 0 ? Math.round((paidBillingAmount / totalBillingAmount) * 100) : 0;
    const totalOverdueAmount = overdueInvoices.reduce((s: number, i: any) => s + (Number(i.amount) || 0), 0);
    const totalRooms = rooms.length;
    const occupiedRooms = rooms.filter((r: any) => r.status === 'occupied').length;
    const emptyRooms = rooms.filter((r: any) => r.status === 'empty').length;

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
- Các hóa đơn trễ hạn (phòng, tháng, số tiền): ${JSON.stringify(overdueInvoices.map((i: any) => ({ room: i.roomCode, month: i.month, amount: i.amount })))}
- Số hợp đồng sẽ hết hạn trong 30 ngày: ${expiringContracts.length}
- Các phòng có hợp đồng hết hạn: ${JSON.stringify(expiringContracts.map((c: any) => ({ room: c.roomCode, endDate: c.endDate })))}
- Số phản ánh đang chờ xử lý: ${supportRequests.length}
- Các phản ánh: ${JSON.stringify(supportRequests.map((r: any) => ({ room: r.roomCode, title: r.title, level: r.level })))}
    `;

    const messages: ChatMessage[] = [
      { role: 'system', content: SYSTEM_SUMMARY_PROMPT },
      { role: 'user', content: statsText },
    ];

    const result = await callOpenRouter(messages, { model: OpenRouterModels.DEFAULT, temperature: 0.3, timeoutMs: 20000 });
    return res.status(200).json({ summary: result.choices?.[0]?.message?.content || 'Không thể tạo tóm tắt.' });
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    if (err.message === 'OPENROUTER_API_KEY_NOT_CONFIGURED') {
      return sendError(res, 500, 'API Key OpenRouter chưa được cấu hình.');
    }
    console.error('[ai-summary] Error:', err);
    return sendError(res, 500, err.message || 'Hệ thống AI hiện chưa khả dụng.');
  }
}
