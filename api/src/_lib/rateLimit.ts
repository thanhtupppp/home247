import { adminDb } from './firebaseAdmin';
import { FieldValue } from 'firebase-admin/firestore';

// Unified quota limits per user per day (identical to Firebase Functions)
const QUOTA_LIMITS = {
  summary: 100,
  chat: 100,
  ocr: 50,
  contract: 100,
  ticket: 100,
  migration: 20,
} as const;

export type QuotaFeature = keyof typeof QUOTA_LIMITS;

/**
 * Check and increment daily quota for a specific feature using Firestore transactions.
 * Throws an error string 'QUOTA_EXCEEDED:<feature>' if quota is exceeded.
 */
export async function checkAndIncrementQuota(
  uid: string,
  feature: QuotaFeature
): Promise<void> {
  const todayStr = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Ho_Chi_Minh',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());

  const docRef = adminDb
    .collection('aiUsage')
    .doc(uid)
    .collection('days')
    .doc(todayStr);

  await adminDb.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    const data = doc.exists ? doc.data() || {} : {};
    const currentCount = Number(data[feature]) || 0;
    const limit = QUOTA_LIMITS[feature];

    if (currentCount >= limit) {
      throw new Error(`QUOTA_EXCEEDED:${feature}`);
    }

    transaction.set(
      docRef,
      {
        ...data,
        [feature]: currentCount + 1,
        lastUsedAt: FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
  });
}
