import { db } from '../utils/firestore';
import { Timestamp, FieldPath } from 'firebase-admin/firestore';
import { isValidCalendarDate } from '../ai/schemas';

/**
 * Safe, idempotent, cursor-paginated migration for invoice due dates.
 * Only processes invoices owned by the calling landlord to prevent data leaks.
 */
export async function runInvoicesMigration(
  uid: string,
  limit: number = 200,
  startAfterId?: string,
  dryRun: boolean = false
): Promise<any> {
  let queryRef = db.collection('invoices')
    .where('ownerId', '==', uid)
    .orderBy(FieldPath.documentId());

  if (startAfterId) {
    const startDoc = await db.collection('invoices').doc(startAfterId).get();
    if (startDoc.exists) {
      queryRef = queryRef.startAfter(startDoc);
    }
  }

  const snapshot = await queryRef.limit(limit).get();

  let scanned = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const failures: Array<{ invoiceId: string; reason: string }> = [];

  const batch = db.batch();
  let batchCount = 0;

  for (const doc of snapshot.docs) {
    scanned++;
    const invoiceId = doc.id;
    const data = doc.data() || {};
    const dueDate = data.dueDate;

    // 1. If dueDate is already a Timestamp, skip
    if (dueDate instanceof Timestamp) {
      skipped++;
      continue;
    }

    let parsedDate: Date | null = null;
    let failureReason = '';

    // 2. Try parsing if dueDate is a string
    if (dueDate && typeof dueDate === 'string') {
      const trimmed = dueDate.trim();

      // Format: DD/MM/YYYY
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const d = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const y = Number(parts[2]);

        if (!isNaN(d) && !isNaN(m) && !isNaN(y) && isValidCalendarDate(d, m, y)) {
          parsedDate = new Date(y, m, d);
        } else {
          failureReason = `Ngày không tồn tại trên lịch: ${trimmed}`;
        }
      } else {
        // Format: ISO/Others
        const dateObj = new Date(trimmed);
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj;
        } else {
          failureReason = `Không đúng định dạng ngày tháng: ${trimmed}`;
        }
      }
    }

    // 3. Compute default due date if missing based on invoice month
    if (!dueDate) {
      const month = data.month || ''; // MM/YYYY
      const parts = month.split('/');
      if (parts.length === 2) {
        const m = Number(parts[0]) - 1;
        const y = Number(parts[1]);
        if (!isNaN(m) && !isNaN(y) && m >= 0 && m <= 11) {
          parsedDate = new Date(y, m, 10); // Default to 10th of that billing month
        }
      }
    }

    // If we cannot parse or calculate a valid date, mark doc for review and add to failures
    if (!parsedDate) {
      failed++;
      const reason = failureReason || 'Thiếu cả trường dueDate lẫn tháng thanh toán hợp lệ.';
      failures.push({ invoiceId, reason });

      if (!dryRun) {
        batch.update(doc.ref, {
          migrationStatus: 'needs_review',
          migrationReason: reason,
          updatedAt: Timestamp.now()
        });
        batchCount++;
      }
      continue;
    }

    // 4. Set update fields
    if (!dryRun) {
      batch.update(doc.ref, {
        dueDate: Timestamp.fromDate(parsedDate),
        migrationStatus: 'completed',
        updatedAt: Timestamp.now()
      });
      batchCount++;
    } else {
      migrated++; // Count successfully verified for dry run
    }
  }

  // Commit batch if there's any updates queued
  if (!dryRun && batchCount > 0) {
    await batch.commit();
    migrated += (scanned - skipped - failed); // Update successfully migrated count
  }

  const nextCursorId = snapshot.docs.length === limit ? snapshot.docs[snapshot.docs.length - 1].id : null;

  return {
    scanned,
    migrated,
    skipped,
    failed,
    failures,
    nextCursorId
  };
}
