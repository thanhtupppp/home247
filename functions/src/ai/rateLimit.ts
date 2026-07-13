import { db } from '../utils/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// Unified limits per user ID (uid) per day
const QUOTA_LIMITS = {
  summary: 100,
  chat: 100,
  ocr: 50,
  contract: 100,
  ticket: 100,
  migration: 100,
};

/**
 * Check and increment daily quota for a specific feature using transactions to prevent race conditions.
 * Throws an error if quota is exceeded.
 */
export async function checkAndIncrementQuota(
  uid: string,
  feature: keyof typeof QUOTA_LIMITS
): Promise<void> {
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  
  const docRef = db
    .collection('aiUsage')
    .doc(uid)
    .collection('days')
    .doc(todayStr);

  await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const data = doc.exists ? doc.data() || {} : {};
    const currentCount = Number(data[feature]) || 0;
    const limit = QUOTA_LIMITS[feature];

    if (currentCount >= limit) {
      throw new Error(`QUOTA_EXCEEDED:${feature}`);
    }

    transaction.set(docRef, {
      ...data,
      [feature]: currentCount + 1,
      lastUsedAt: FieldValue.serverTimestamp(),
    }, { merge: true });
  });
}
