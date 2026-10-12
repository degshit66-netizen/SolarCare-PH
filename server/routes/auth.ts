import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../../src/db/index.js';
import { users } from '../../src/db/schema.js';
import { eq, or } from 'drizzle-orm';
import { authenticate } from '../middleware/auth.js';

export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'solarcare_ph_jwt_secret_key_2026';

authRouter.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  // Support demo credentials or existing user
  if (email === 'admin@solarcare.ph' && password === 'admin123') {
    const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
    let userId = 'admin-demo';
    if (existing.length === 0) {
      await db.insert(users).values({
        uid: 'admin-demo',
        email,
        name: 'Admin User',
        role: 'admin',
      });
    } else {
      userId = existing[0].uid;
    }

    const token = jwt.sign({ id: userId, email, role: 'admin' }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
    });
    return res.json({ token, user: { id: userId, email, name: 'Admin User', role: 'admin' } });
  }

  // Check database users
  const userRes = await db.select().from(users).where(eq(users.email, email)).limit(1);
  const user = userRes[0];

  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials or inactive user' });
  }

  const token = jwt.sign({ id: user.uid, email: user.email, role: user.role || 'admin' }, JWT_SECRET, { expiresIn: '1d' });
  res.cookie('token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ token, user: { id: user.uid, email: user.email, name: user.name || 'User', role: user.role || 'admin' } });
});

authRouter.post('/logout', (req, res) => {
  res.clearCookie('token', {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
  });
  res.json({ success: true });
});

authRouter.get('/me', authenticate, async (req: any, res) => {
  const userRes = await db.select().from(users).where(
    or(eq(users.uid, req.user.id), req.user.email ? eq(users.email, req.user.email) : undefined)
  ).limit(1);

  const user = userRes[0];
  if (!user) {
    return res.json({
      user: {
        id: req.user.id,
        email: req.user.email || 'user@solarcare.ph',
        name: req.user.name || 'Solar Specialist',
        role: req.user.role || 'admin',
      }
    });
  }
  res.json({ user: { id: user.uid, email: user.email, name: user.name, role: user.role } });
});
