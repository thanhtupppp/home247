import type { VercelRequest, VercelResponse } from '@vercel/node';
import { z } from 'zod';
import { verifyAuth, sendError } from '../_lib/auth';
import { checkAndIncrementQuota } from '../_lib/rateLimit';
import { adminDb } from '../_lib/firebaseAdmin';
import { Timestamp, FieldPath } from 'firebase-admin/firestore';
import { isValidCalendarDate } from '../ai/schemas';

const migrationInputSchema = z.object({
  dryRun: z.preprocess((val) => {
    if (typeof val === 'string') return val.toLowerCase() === 'true';
    if (typeof val === 'boolean') return val;
    return true;
  }, z.boolean()).default(true),
  limit: z.coerce.number().int().min(1).max(200).default(200),
  startAfterId: z.string().min(1).max(200).optional(),
});

async function runInvoicesMigration(uid: string, limit: number, startAfterId?: string, dryRun = false) {
  let queryRef: any = adminDb.collection('invoices')
    .where('ownerId', '==', uid)
    .orderBy(FieldPath.documentId());

  if (startAfterId) {
    const startDoc = await adminDb.collection('invoices').doc(startAfterId).get();
    if (startDoc.exists) queryRef = queryRef.startAfter(startDoc);
  }

  const snapshot = await queryRef.limit(limit).get();
  let scanned = 0, migrated = 0, skipped = 0, failed = 0;
  const failures: Array<{ invoiceId: string; reason: string }> = [];
  const batch = adminDb.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    scanned++;
    const data = doc.data() || {};
    const dueDate = data.dueDate;

    if (dueDate instanceof Timestamp) { skipped++; continue; }

    let parsedDate: Date | null = null;
    let failureReason = '';

    if (dueDate && typeof dueDate === 'string') {
      const parts = dueDate.trim().split('/');
      if (parts.length === 3) {
        const d = Number(parts[0]), m = Number(parts[1]) - 1, y = Number(parts[2]);
        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && isValidCalendarDate(d, m, y)) {
          parsedDate = new Date(y, m, d);
        } else {
          failureReason = `Ngày không tồn tại trên lịch: ${dueDate}`;
        }
      } else {
        const dateObj = new Date(dueDate.trim());
        if (!isNaN(dateObj.getTime())) { parsedDate = dateObj; }
        else { failureReason = `Không đúng định dạng ngày tháng: ${dueDate}`; }
      }
    }

    if (!dueDate) {
      const parts = (data.month || '').split('/');
      if (parts.length === 2) {
        const m = Number(parts[0]) - 1, y = Number(parts[1]);
        if (!isNaN(m) && !isNaN(y) && m >= 0 && m <= 11) parsedDate = new Date(y, m, 10);
      }
    }

    if (!parsedDate) {
      failed++;
      const reason = failureReason || 'Thiếu cả trường dueDate lẫn tháng thanh toán hợp lệ.';
      failures.push({ invoiceId: doc.id, reason });
      if (!dryRun) { batch.update(doc.ref, { migrationStatus: 'needs_review', migrationReason: reason, updatedAt: Timestamp.now() }); batchCount++; }
      continue;
    }

    if (!dryRun) {
      batch.update(doc.ref, { dueDate: Timestamp.fromDate(parsedDate), migrationStatus: 'completed', updatedAt: Timestamp.now() });
      batchCount++;
    } else {
      migrated++;
    }
  }

  if (!dryRun && batchCount > 0) {
    await batch.commit();
    migrated += scanned - skipped - failed;
  }

  return {
    scanned, migrated, skipped, failed, failures,
    nextCursorId: snapshot.docs.length === limit ? snapshot.docs[snapshot.docs.length - 1].id : null,
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' });

  const uid = await verifyAuth(req, res);
  if (!uid) return;

  const validation = migrationInputSchema.safeParse(req.body || {});
  if (!validation.success) {
    return sendError(res, 400, `Tham số di cư dữ liệu không hợp lệ: ${JSON.stringify(validation.error.format())}`);
  }

  const { dryRun, limit, startAfterId } = validation.data;

  try {
    await checkAndIncrementQuota(uid, 'migration');
    const result = await runInvoicesMigration(uid, limit, startAfterId, dryRun);
    return res.status(200).json(result);
  } catch (err: any) {
    if (err.message?.startsWith('QUOTA_EXCEEDED')) {
      return sendError(res, 429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    console.error('[migrate-invoices] Error:', err);
    return sendError(res, 500, err.message || 'Lỗi trong quá trình di cư dữ liệu hóa đơn.');
  }
}
