import { Router } from 'express';
import { db } from '../db/index.js';
import { warranties } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const warrantyRouter = Router();
warrantyRouter.use(authenticate);
warrantyRouter.get('/', async (req, res) => {
    const userId = req.user.id;
    const result = await db.select().from(warranties)
        .where(eq(warranties.userId, userId))
        .orderBy(desc(warranties.createdAt));
    res.json(result);
});
warrantyRouter.post('/', async (req, res) => {
    const userId = req.user.id;
    const id = `WAR-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { installationId, equipmentId, provider, type, referenceNumber, description, startDate, endDate, terms, status, notes } = req.body;
    const [created] = await db.insert(warranties).values({
        id,
        uuid,
        userId,
        installationId,
        equipmentId,
        provider,
        type,
        referenceNumber,
        description,
        startDate,
        endDate,
        terms,
        status: status || 'Active',
        notes,
    }).returning();
    res.status(201).json(created);
});
warrantyRouter.get('/:id', async (req, res) => {
    const userId = req.user.id;
    const result = await db.select().from(warranties)
        .where(and(eq(warranties.id, req.params.id), eq(warranties.userId, userId)))
        .limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
warrantyRouter.put('/:id', async (req, res) => {
    const userId = req.user.id;
    const { provider, type, referenceNumber, description, startDate, endDate, terms, status, notes } = req.body;
    await db.update(warranties).set({
        provider,
        type,
        referenceNumber,
        description,
        startDate,
        endDate,
        terms,
        status,
        notes,
    }).where(and(eq(warranties.id, req.params.id), eq(warranties.userId, userId)));
    res.json({ success: true });
});
warrantyRouter.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    await db.delete(warranties).where(and(eq(warranties.id, req.params.id), eq(warranties.userId, userId)));
    res.json({ success: true });
});
