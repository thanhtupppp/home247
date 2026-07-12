import * as admin from 'firebase-admin';
import { Timestamp } from 'firebase-admin/firestore';

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
 * Safely fetch pending invoices owned by landlord that are overdue (dueDate < today)
 */
export async function getOverdueInvoices(ownerId: string): Promise<any[]> {
  const snapshot = await db.collection('invoices')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .where('dueDate', '<', Timestamp.now())
    .get();
  
  return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
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
 * Safely fetch active contracts owned by landlord that are expiring within target days
 */
export async function getExpiringContracts(ownerId: string, withinDays: number = 30): Promise<any[]> {
  const snapshot = await db.collection('contracts')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'active')
    .get();

  const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  const today = new Date();
  const expiring = [];

  for (const c of contracts) {
    if (c.endDate) {
      const parts = c.endDate.split('/');
      if (parts.length === 3) {
        const endD = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        const diffDays = Math.ceil((endD.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays >= 0 && diffDays <= withinDays) {
          expiring.push({
            id: c.id,
            tenantName: c.tenantName,
            roomCode: c.roomCode,
            buildingName: c.buildingName,
            endDate: c.endDate,
            diffDays
          });
        }
      }
    }
  }
  return expiring;
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
