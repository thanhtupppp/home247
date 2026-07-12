"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.db = void 0;
exports.getLandlordInvoices = getLandlordInvoices;
exports.getLandlordContracts = getLandlordContracts;
exports.getExpiringContracts = getExpiringContracts;
exports.getLandlordSupportRequests = getLandlordSupportRequests;
exports.getLandlordBuildings = getLandlordBuildings;
exports.getLandlordRooms = getLandlordRooms;
exports.getLandlordUtilityReadings = getLandlordUtilityReadings;
const admin = __importStar(require("firebase-admin"));
// Initialize firebase admin if not already done
if (admin.apps.length === 0) {
    admin.initializeApp();
}
const db = admin.firestore();
exports.db = db;
/**
 * Safely fetch pending invoices owned by landlord
 */
async function getLandlordInvoices(ownerId) {
    const snapshot = await db.collection('invoices')
        .where('ownerId', '==', ownerId)
        .where('status', '==', 'pending')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Safely fetch active contracts owned by landlord
 */
async function getLandlordContracts(ownerId) {
    const snapshot = await db.collection('contracts')
        .where('ownerId', '==', ownerId)
        .where('status', '==', 'active')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Safely fetch active contracts owned by landlord that are expiring within target days
 */
async function getExpiringContracts(ownerId, withinDays = 30) {
    const snapshot = await db.collection('contracts')
        .where('ownerId', '==', ownerId)
        .where('status', '==', 'active')
        .get();
    const contracts = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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
async function getLandlordSupportRequests(ownerId) {
    const snapshot = await db.collection('supportRequests')
        .where('ownerId', '==', ownerId)
        .where('status', '==', 'pending')
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Safely fetch buildings owned by landlord
 */
async function getLandlordBuildings(ownerId) {
    const snapshot = await db.collection('buildings')
        .where('ownerId', '==', ownerId)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Safely fetch rooms owned by landlord
 */
async function getLandlordRooms(ownerId) {
    const snapshot = await db.collection('rooms')
        .where('ownerId', '==', ownerId)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
/**
 * Safely fetch utility readings owned by landlord for a specific month
 */
async function getLandlordUtilityReadings(ownerId, month) {
    const snapshot = await db.collection('utilityReadings')
        .where('ownerId', '==', ownerId)
        .where('month', '==', month)
        .get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}
//# sourceMappingURL=firestore.js.map