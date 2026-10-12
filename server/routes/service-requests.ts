import { Router } from 'express';
import { db } from '../db/index.js';
import { serviceRequests } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';

export const serviceRequestRouter = Router();

serviceRequestRouter.use(authenticate);

serviceRequestRouter.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(serviceRequests)
    .where(eq(serviceRequests.userId, userId))
    .orderBy(desc(serviceRequests.createdAt));
  res.json(result);
});

serviceRequestRouter.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const id = `SRV-${Math.floor(1000 + Math.random() * 9000)}`;
  const uuid = uuidv4();
  const { installationId, dateReported, problemCategory, description, priority, scheduledVisitDate, status, workPerformed, partsReplaced, completionNotes } = req.body;
  
  const [created] = await db.insert(serviceRequests).values({
    id,
    uuid,
    userId,
    installationId,
    dateReported,
    problemCategory,
    description,
    priority: priority || 'Medium',
    scheduledVisitDate,
    status: status || 'Open',
    workPerformed,
    partsReplaced,
    completionNotes,
  }).returning();
  
  res.status(201).json(created);
});

serviceRequestRouter.get('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(serviceRequests)
    .where(and(eq(serviceRequests.id, req.params.id), eq(serviceRequests.userId, userId)))
    .limit(1);
  if (!result[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

serviceRequestRouter.put('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { priority, scheduledVisitDate, status, workPerformed, partsReplaced, completionNotes, assignedTechnicianId } = req.body;
  await db.update(serviceRequests).set({
    priority,
    scheduledVisitDate,
    status,
    workPerformed,
    partsReplaced,
    completionNotes,
    assignedTechnicianId,
  }).where(and(eq(serviceRequests.id, req.params.id), eq(serviceRequests.userId, userId)));
  res.json({ success: true });
});

serviceRequestRouter.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  await db.delete(serviceRequests).where(and(eq(serviceRequests.id, req.params.id), eq(serviceRequests.userId, userId)));
  res.json({ success: true });
});
