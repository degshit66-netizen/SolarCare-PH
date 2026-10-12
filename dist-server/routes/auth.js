import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { users } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const authRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_change_in_production';
authRouter.post('/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password)
        return res.status(400).json({ error: 'Email and password required' });
    const userRes = await db.select().from(users).where(eq(users.email, email)).limit(1);
    const user = userRes[0];
    if (!user || !user.isActive) {
        return res.status(401).json({ error: 'Invalid credentials or inactive user' });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { httpOnly: true, secure: process.env.NODE_ENV === 'production' });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});
authRouter.post('/logout', (req, res) => {
    res.clearCookie('token');
    res.json({ success: true });
});
authRouter.get('/me', authenticate, async (req, res) => {
    const userRes = await db.select().from(users).where(eq(users.id, req.user.id)).limit(1);
    const user = userRes[0];
    if (!user)
        return res.status(404).json({ error: 'User not found' });
    res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
});
// Setup admin if none exists
authRouter.post('/setup', async (req, res) => {
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length > 0) {
        return res.status(400).json({ error: 'System already initialized' });
    }
    const { email, password, name } = req.body;
    const hash = await bcrypt.hash(password, 10);
    const id = uuidv4();
    await db.insert(users).values({
        id,
        email,
        passwordHash: hash,
        name,
        role: 'admin',
    });
    res.json({ success: true });
});
