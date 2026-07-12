import * as admin from 'firebase-admin';

// Initialize firebase admin if not already done
if (admin.apps.length === 0) {
  admin.initializeApp();
}

const db = admin.firestore();

export { db };

/**
 * Safely fetch pending invoices owned by landlord
 */
export async function getLandlordInvoices(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('invoices')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Safely fetch active contracts owned by landlord
 */
export async function getLandlordContracts(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('contracts')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'active')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Safely fetch pending support requests owned by landlord
 */
export async function getLandlordSupportRequests(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('supportRequests')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Safely fetch buildings owned by landlord
 */
export async function getLandlordBuildings(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('buildings')
    .where('ownerId', '==', ownerId)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Safely fetch rooms owned by landlord
 */
export async function getLandlordRooms(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('rooms')
    .where('ownerId', '==', ownerId)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

/**
 * Safely fetch utility readings owned by landlord for a specific month
 */
export async function getLandlordUtilityReadings(ownerId: string, month: string): Promise<any[]> {
  const snapshot = await db.collection('utilityReadings')
    .where('ownerId', '==', ownerId)
    .where('month', '==', month)
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
