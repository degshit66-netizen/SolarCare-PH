import { Router } from 'express';
import { db } from '../db/index.js';
import { equipment } from '../db/schema.js';
import { eq, desc, and } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';

export const equipmentRouter = Router();

equipmentRouter.use(authenticate);

equipmentRouter.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(equipment)
    .where(eq(equipment.userId, userId))
    .orderBy(desc(equipment.createdAt));
  res.json(result);
});

equipmentRouter.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const id = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
  const uuid = uuidv4();
  const { installationId, category, brand, model, serialNumber, quantity, unit, specifications, supplier, purchaseDate, installationDate, status, notes } = req.body;
  
  const [created] = await db.insert(equipment).values({
    id,
    uuid,
    userId,
    installationId,
    category,
    brand,
    model,
    serialNumber,
    quantity: Number(quantity) || 1,
    unit: unit || 'pcs',
    specifications,
    supplier,
    purchaseDate,
    installationDate,
    status: status || 'Operational',
    notes,
  }).returning();
  
  res.status(201).json(created);
});

equipmentRouter.get('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(equipment)
    .where(and(eq(equipment.id, req.params.id), eq(equipment.userId, userId)))
    .limit(1);
  if (!result[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

equipmentRouter.put('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { category, brand, model, serialNumber, quantity, unit, specifications, supplier, purchaseDate, installationDate, status, notes } = req.body;
  await db.update(equipment).set({
    category,
    brand,
    model,
    serialNumber,
    quantity: Number(quantity),
    unit,
    specifications,
    supplier,
    purchaseDate,
    installationDate,
    status,
    notes,
  }).where(and(eq(equipment.id, req.params.id), eq(equipment.userId, userId)));
  res.json({ success: true });
});

equipmentRouter.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  await db.delete(equipment).where(and(eq(equipment.id, req.params.id), eq(equipment.userId, userId)));
  res.json({ success: true });
});
