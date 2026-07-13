import type { VercelRequest, VercelResponse } from '@vercel/node';
import { adminAuth } from './firebaseAdmin';

/**
 * Extract and verify Firebase ID token from Authorization header.
 * Returns the uid if valid, throws a 401 error otherwise.
 */
export async function verifyAuth(req: VercelRequest, res: VercelResponse): Promise<string | null> {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Bạn chưa đăng nhập. Vui lòng đăng nhập lại.' });
    return null;
  }

  const token = authHeader.split('Bearer ')[1];
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    return decoded.uid;
  } catch {
    res.status(401).json({ message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.' });
    return null;
  }
}

/**
 * Helper to send a standardized API error response
 */
export function sendError(
  res: VercelResponse,
  status: number,
  message: string
): void {
  res.status(status).json({ message });
}
