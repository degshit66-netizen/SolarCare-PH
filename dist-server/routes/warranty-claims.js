import { Router } from 'express';
import { db } from '../db/index.js';
import { warrantyClaims } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const warrantyClaimRouter = Router();
warrantyClaimRouter.use(authenticate);
warrantyClaimRouter.get('/', async (req, res) => {
    const result = await db.select().from(warrantyClaims).orderBy(desc(warrantyClaims.createdAt));
    res.json(result);
});
warrantyClaimRouter.post('/', async (req, res) => {
    const id = `CLM-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { warrantyId, equipmentId, dateReported, problemDescription, providerReference, status, resolutionNotes, resolutionDate } = req.body;
    await db.insert(warrantyClaims).values({
        id,
        uuid,
        warrantyId,
        equipmentId,
        dateReported,
        problemDescription,
        providerReference,
        status,
        assignedStaffId: req.user.id,
        resolutionNotes,
        resolutionDate,
    });
    res.json({ id });
});
warrantyClaimRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(warrantyClaims).where(eq(warrantyClaims.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
warrantyClaimRouter.put('/:id', async (req, res) => {
    const { status, providerReference, resolutionNotes, resolutionDate } = req.body;
    await db.update(warrantyClaims).set({
        status,
        providerReference,
        resolutionNotes,
        resolutionDate,
    }).where(eq(warrantyClaims.id, req.params.id));
    res.json({ success: true });
});
