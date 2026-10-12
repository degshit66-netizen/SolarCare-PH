import { Router } from 'express';
import { db } from '../db/index.js';
import { warranties } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const warrantyRouter = Router();
warrantyRouter.use(authenticate);
warrantyRouter.get('/', async (req, res) => {
    const result = await db.select().from(warranties).orderBy(desc(warranties.createdAt));
    res.json(result);
});
warrantyRouter.post('/', async (req, res) => {
    const id = `WAR-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { installationId, equipmentId, provider, type, referenceNumber, description, startDate, endDate, terms, status, notes } = req.body;
    await db.insert(warranties).values({
        id,
        uuid,
        installationId,
        equipmentId,
        provider,
        type,
        referenceNumber,
        description,
        startDate,
        endDate,
        terms,
        status,
        notes,
    });
    res.json({ id });
});
warrantyRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(warranties).where(eq(warranties.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
warrantyRouter.put('/:id', async (req, res) => {
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
    }).where(eq(warranties.id, req.params.id));
    res.json({ success: true });
});
