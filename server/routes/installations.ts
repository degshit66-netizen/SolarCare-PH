import { Router } from 'express';
import { db } from '../db/index.js';
import { installations } from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';

export const installationRouter = Router();

installationRouter.use(authenticate);

installationRouter.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(installations)
    .where(eq(installations.userId, userId))
    .orderBy(desc(installations.createdAt));
  res.json(result);
});

installationRouter.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const id = `INST-${Math.floor(1000 + Math.random() * 9000)}`;
  const uuid = uuidv4();
  const { customerId, projectName, siteAddress, capacityKwp, systemType, status, notes } = req.body;
  
  const [created] = await db.insert(installations).values({
    id,
    uuid,
    userId,
    customerId,
    projectName,
    siteAddress,
    capacityKwp: Number(capacityKwp) || 5.0,
    systemType: systemType || 'grid-tied',
    status: status || 'Draft',
    notes,
  }).returning();
  
  res.status(201).json(created);
});

installationRouter.get('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(installations)
    .where(and(eq(installations.id, req.params.id), eq(installations.userId, userId)))
    .limit(1);
  if (!result[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

installationRouter.put('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { projectName, siteAddress, capacityKwp, systemType, status, notes, startDate, completionDate, commissioningDate, turnoverDate } = req.body;
  await db.update(installations).set({
    projectName,
    siteAddress,
    capacityKwp: Number(capacityKwp),
    systemType,
    status,
    notes,
    startDate,
    completionDate,
    commissioningDate,
    turnoverDate,
    statusUpdatedAt: sql`CURRENT_TIMESTAMP`
  }).where(and(eq(installations.id, req.params.id), eq(installations.userId, userId)));
  res.json({ success: true });
});

installationRouter.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  await db.delete(installations).where(and(eq(installations.id, req.params.id), eq(installations.userId, userId)));
  res.json({ success: true });
});
