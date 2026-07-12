import { db } from '../utils/firestore';
import { FieldValue } from 'firebase-admin/firestore';

// Unified limits per user ID (uid) per day
const QUOTA_LIMITS = {
  summary: 20,
  chat: 100,
  ocr: 50,
  contract: 20,
  ticket: 100,
  migration: 2,
};

/**
 * Check and increment daily quota for a specific feature using transactions to prevent race conditions.
 * Throws an error if quota is exceeded.
 */
export async function checkAndIncrementQuota(
  uid: string,
  feature: keyof typeof QUOTA_LIMITS
): Promise<void> {
  // Get date in GTM+7 / Local format or safe ISO UTC string
  const todayStr = new Date().toISOString().split('T')[0]; // yyyy-MM-dd
  
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
