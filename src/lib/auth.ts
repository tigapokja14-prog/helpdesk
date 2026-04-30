import jwt from 'jsonwebtoken';

export interface JwtPayload {
  username: string;
  role:     string;
  nama:     string;
}

export function verifyToken(request: Request): JwtPayload | null {
  const jwtSecret = process.env.JWT_SECRET || process.env.ADMIN_SECRET_TOKEN || '';
  const authHeader = request.headers.get('Authorization') ?? '';
  const token      = authHeader.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : authHeader.trim();

  if (!token || !jwtSecret) return null;

  try {
    const decoded = jwt.verify(token, jwtSecret) as JwtPayload;
    return decoded;
  } catch {
    return null;  // Token invalid atau expired
  }
}

export function requireAuth(request: Request): JwtPayload | Response {
  const payload = verifyToken(request);
  if (!payload) {
    return new Response(JSON.stringify({ error: 'Token tidak valid atau sudah expired. Silakan login ulang.' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return payload;
}