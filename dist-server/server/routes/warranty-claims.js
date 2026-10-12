import { Router } from 'express';
import { db } from '../db/index.js';
import { warrantyClaims } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const warrantyClaimRouter = Router();
warrantyClaimRouter.use(authenticate);
warrantyClaimRouter.get('/', async (req, res) => {
    const userId = req.user.id;
    const result = await db.select().from(warrantyClaims)
        .where(eq(warrantyClaims.userId, userId))
        .orderBy(desc(warrantyClaims.createdAt));
    res.json(result);
});
warrantyClaimRouter.post('/', async (req, res) => {
    const userId = req.user.id;
    const id = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { warrantyId, equipmentId, dateReported, problemDescription, providerReference, status, resolutionNotes, resolutionDate } = req.body;
    const [created] = await db.insert(warrantyClaims).values({
        id,
        uuid,
        userId,
        warrantyId,
        equipmentId,
        dateReported,
        problemDescription,
        providerReference,
        status: status || 'Draft',
        assignedStaffId: userId,
        resolutionNotes,
        resolutionDate,
    }).returning();
    res.status(201).json(created);
});
warrantyClaimRouter.get('/:id', async (req, res) => {
    const userId = req.user.id;
    const result = await db.select().from(warrantyClaims)
        .where(and(eq(warrantyClaims.id, req.params.id), eq(warrantyClaims.userId, userId)))
        .limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
warrantyClaimRouter.put('/:id', async (req, res) => {
    const userId = req.user.id;
    const { status, providerReference, resolutionNotes, resolutionDate } = req.body;
    await db.update(warrantyClaims).set({
        status,
        providerReference,
        resolutionNotes,
        resolutionDate,
    }).where(and(eq(warrantyClaims.id, req.params.id), eq(warrantyClaims.userId, userId)));
    res.json({ success: true });
});
warrantyClaimRouter.delete('/:id', async (req, res) => {
    const userId = req.user.id;
    await db.delete(warrantyClaims).where(and(eq(warrantyClaims.id, req.params.id), eq(warrantyClaims.userId, userId)));
    res.json({ success: true });
});
