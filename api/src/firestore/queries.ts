import { adminDb } from '../_lib/firebaseAdmin';
import { Timestamp } from 'firebase-admin/firestore';

/**
 * Firestore query helpers — adapted from functions/src/utils/firestore.ts
 * Uses firebase-admin instead of firebase-functions
 */

export async function getLandlordInvoices(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('invoices')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getOverdueInvoices(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('invoices')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .where('dueDate', '<', Timestamp.now())
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordContracts(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('contracts')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'active')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordTenants(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('tenants')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getExpiringContracts(ownerId: string, withinDays = 30): Promise<any[]> {
  const snap = await adminDb.collection('contracts')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'active')
    .get();
  const today = new Date();
  const result: any[] = [];
  for (const d of snap.docs) {
    const c = { id: d.id, ...d.data() } as any;
    if (c.endDate) {
      const parts = c.endDate.split('/');
      if (parts.length === 3) {
        const endD = new Date(Number(parts[2]), Number(parts[1]) - 1, Number(parts[0]));
        const diffDays = Math.ceil((endD.getTime() - today.getTime()) / 86400000);
        if (diffDays >= 0 && diffDays <= withinDays) {
          result.push({ id: c.id, tenantName: c.tenantName, roomCode: c.roomCode, buildingName: c.buildingName, endDate: c.endDate, diffDays });
        }
      }
    }
  }
  return result;
}

export async function getLandlordSupportRequests(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('supportRequests')
    .where('ownerId', '==', ownerId)
    .where('status', '==', 'pending')
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordBuildings(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('buildings')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordRooms(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('rooms')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllLandlordInvoices(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('invoices')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getAllLandlordUtilityReadings(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('utilityReadings')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordServices(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('services')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export async function getLandlordDevices(ownerId: string): Promise<any[]> {
  const snap = await adminDb.collection('devices')
    .where('ownerId', '==', ownerId)
    .get();
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}
