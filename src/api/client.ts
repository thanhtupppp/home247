/**
 * Centralized API client for the Vercel backend.
 * Replaces Firebase httpsCallable — all AI functions now go through REST.
 *
 * Base URL is configured via EXPO_PUBLIC_API_URL env var:
 *   - Development: http://192.168.2.6:3001  (vercel dev)
 *   - Production:  https://home247-api.vercel.app
 */
import { auth } from '../firebase';

const BASE_URL =
  (process.env.EXPO_PUBLIC_API_URL || 'https://home247-api.vercel.app').replace(/\/$/, '');

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

async function callAPI<T = any>(endpoint: string, body: Record<string, any> = {}): Promise<T> {
  const user = auth.currentUser;
  if (!user) throw new ApiError(401, 'Chưa đăng nhập. Vui lòng đăng nhập lại.');

  // Firebase ID token — valid for 1h, auto-refreshed by SDK
  const token = await user.getIdToken();

  const response = await fetch(`${BASE_URL}/api/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    let message = `API Error ${response.status}`;
    try {
      const err = await response.json();
      message = err.message || message;
    } catch {}

    // Map HTTP status to human-readable errors
    if (response.status === 429) {
      throw new ApiError(429, 'Bạn đã vượt quá giới hạn sử dụng AI cho tính năng này hôm nay.');
    }
    if (response.status === 401) {
      throw new ApiError(401, 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
    }
    throw new ApiError(response.status, message);
  }

  return response.json() as Promise<T>;
}

// ── Exported API methods (mirrors the old httpsCallable interface) ─────────────

export const api = {
  /** Stage 1: Generate AI dashboard summary */
  getAISummary: () =>
    callAPI<{ summary: string }>('ai-summary'),

  /** Stage 1/2: AI analyze a support request ticket */
  processSupportRequest: (ticketId: string) =>
    callAPI('process-ticket', { ticketId }),

  /** Stage 2: OCR utility meter from base64 image */
  ocrUtilityMeter: (imageBase64: string, type: string) =>
    callAPI('ocr-meter', { imageBase64, type }),

  /** Stage 2: Extract contract info from a scanned image */
  summarizeContract: (contractDocBase64: string) =>
    callAPI('summarize-contract', { contractDocBase64 }),

  /** Stage 3: Run AI agent chat with tool calling */
  runAIAgent: (userMessage: string, history: Array<{ role: 'user' | 'assistant'; content: string }> = []) =>
    callAPI<{ content: string; history?: any[] }>('run-agent', { userMessage, history }),

  /** Admin: Migrate old invoice due dates */
  migrateOldInvoices: (params: { dryRun?: boolean; limit?: number; startAfterId?: string }) =>
    callAPI('migrate-invoices', params),
};

export { ApiError };
