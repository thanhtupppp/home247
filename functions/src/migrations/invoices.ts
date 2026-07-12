import { db } from '../utils/firestore';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Idempotent, batched, dry-run capable migration for invoice due dates.
 * Only processes invoices owned by the calling landlord to prevent data leaks.
 */
export async function runInvoicesMigration(uid: string, dryRun: boolean = false): Promise<any> {
  const snapshot = await db.collection('invoices')
    .where('ownerId', '==', uid)
    .get();

  let scanned = 0;
  let migrated = 0;
  let skipped = 0;
  let failed = 0;
  const failures: Array<{ invoiceId: string; reason: string }> = [];

  const batchSize = 200;
  let currentBatch = db.batch();
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

    // 2. Try parsing if dueDate is a string
    if (dueDate && typeof dueDate === 'string') {
      const trimmed = dueDate.trim();

      // Format: DD/MM/YYYY
      const parts = trimmed.split('/');
      if (parts.length === 3) {
        const d = Number(parts[0]);
        const m = Number(parts[1]) - 1;
        const y = Number(parts[2]);
        const dateObj = new Date(y, m, d);
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj;
        }
      }

      // Format: ISO/Others
      if (!parsedDate) {
        const dateObj = new Date(trimmed);
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj;
        }
      }
    }

    // 3. Compute default due date if missing based on invoice month or creation date
    if (!dueDate) {
      const month = data.month || ''; // MM/YYYY
      const parts = month.split('/');
      if (parts.length === 2) {
        const m = Number(parts[0]) - 1;
        const y = Number(parts[1]);
        const dateObj = new Date(y, m, 10); // Default to 10th of that billing month
        if (!isNaN(dateObj.getTime())) {
          parsedDate = dateObj;
        }
      }

      // Fallback: 10 days from creation timestamp
      if (!parsedDate) {
        const created = data.createdAt 
          ? (data.createdAt.toDate ? data.createdAt.toDate() : new Date(data.createdAt))
          : new Date();
        const fallbackDate = new Date(created);
        fallbackDate.setDate(fallbackDate.getDate() + 10);
        parsedDate = fallbackDate;
      }
    }

    if (!parsedDate) {
      failed++;
      failures.push({
        invoiceId,
        reason: `Could not parse or calculate date from value: ${dueDate || 'missing'}`
      });
      continue;
    }

    // 4. Batch write updates (idempotent, won't duplicate if already Timestamp)
    if (!dryRun) {
      currentBatch.update(doc.ref, {
        dueDate: Timestamp.fromDate(parsedDate)
      });
      batchCount++;
      migrated++;

      if (batchCount >= batchSize) {
        await currentBatch.commit();
        currentBatch = db.batch();
        batchCount = 0;
      }
    } else {
      migrated++; // Dry run just reports it would migrate
    }
  }

  // Commit any remaining writes
  if (!dryRun && batchCount > 0) {
    await currentBatch.commit();
  }

  return {
    scanned,
    migrated,
    skipped,
    failed,
    failures
  };
}
