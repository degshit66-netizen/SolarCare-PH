import { Router } from 'express';
import { db } from '../db/index.js';
import { serviceRequests } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const serviceRequestRouter = Router();
serviceRequestRouter.use(authenticate);
serviceRequestRouter.get('/', async (req, res) => {
    const result = await db.select().from(serviceRequests).orderBy(desc(serviceRequests.createdAt));
    res.json(result);
});
serviceRequestRouter.post('/', async (req, res) => {
    const id = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { installationId, dateReported, problemCategory, description, priority, scheduledVisitDate, status, workPerformed, partsReplaced, completionNotes } = req.body;
    await db.insert(serviceRequests).values({
        id,
        uuid,
        installationId,
        dateReported,
        problemCategory,
        description,
        priority,
        scheduledVisitDate,
        status,
        workPerformed,
        partsReplaced,
        completionNotes,
    });
    res.json({ id });
});
serviceRequestRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(serviceRequests).where(eq(serviceRequests.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
serviceRequestRouter.put('/:id', async (req, res) => {
    const { priority, scheduledVisitDate, status, workPerformed, partsReplaced, completionNotes, assignedTechnicianId } = req.body;
    await db.update(serviceRequests).set({
        priority,
        scheduledVisitDate,
        status,
        workPerformed,
        partsReplaced,
        completionNotes,
        assignedTechnicianId,
    }).where(eq(serviceRequests.id, req.params.id));
    res.json({ success: true });
});
