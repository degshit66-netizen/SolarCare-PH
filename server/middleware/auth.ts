import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../../src/lib/firebase-admin.js';
import { getOrCreateUser } from '../../src/db/users.js';

const JWT_SECRET = process.env.JWT_SECRET || 'solarcare_ph_jwt_secret_key_2026';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    role: string;
    email?: string;
  };
}

// In-memory token cache to make API calls instantaneous
const tokenCache = new Map<string, { id: string; email?: string; role: string; exp: number }>();
const syncedUsers = new Set<string>();

export const authenticate = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token' });
  }

  // 1. Check in-memory token cache first for 0ms verification
  const cached = tokenCache.get(token);
  if (cached && cached.exp > Math.floor(Date.now() / 1000)) {
    req.user = { id: cached.id, role: cached.role, email: cached.email };
    return next();
  }

  // 2. Try Firebase ID token verification
  try {
    const decodedFirebase = await adminAuth.verifyIdToken(token);
    const userId = decodedFirebase.uid;
    const email = decodedFirebase.email || '';
    const role = 'admin';

    req.user = { id: userId, role, email };
    tokenCache.set(token, { id: userId, email, role, exp: decodedFirebase.exp });

    // Sync user asynchronously without blocking API request
    if (userId && !syncedUsers.has(userId)) {
      syncedUsers.add(userId);
      getOrCreateUser(userId, email, decodedFirebase.name).catch(() => {});
    }

    return next();
  } catch {
    // Fall back to local JWT token
  }

  // 3. Fall back to local JWT token
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, role: decoded.role || 'admin', email: decoded.email };
    tokenCache.set(token, {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role || 'admin',
      exp: decoded.exp || Math.floor(Date.now() / 1000) + 86400,
    });
    return next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
};

export const requireRole = (roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    next();
  };
};
