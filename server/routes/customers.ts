import { Router } from 'express';
import { db } from '../db/index.js';
import { customers } from '../db/schema.js';
import { eq, desc, and, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';

export const customerRouter = Router();

customerRouter.use(authenticate);

customerRouter.get('/', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(customers)
    .where(eq(customers.userId, userId))
    .orderBy(desc(customers.createdAt));
  res.json(result);
});

customerRouter.post('/', async (req: any, res) => {
  const userId = req.user.id;
  const id = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
  const uuid = uuidv4();
  const { type, name, contactPerson, phone, email, address, city, province, postalCode, notes } = req.body;
  
  const [created] = await db.insert(customers).values({
    id,
    uuid,
    userId,
    type: type || 'residential',
    name,
    contactPerson,
    phone,
    email,
    address,
    city,
    province,
    postalCode,
    notes,
    status: 'active',
  }).returning();
  
  res.status(201).json(created);
});

customerRouter.get('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const result = await db.select().from(customers)
    .where(and(eq(customers.id, req.params.id), eq(customers.userId, userId)))
    .limit(1);
  if (!result[0]) return res.status(404).json({ error: 'Not found' });
  res.json(result[0]);
});

customerRouter.put('/:id', async (req: any, res) => {
  const userId = req.user.id;
  const { type, name, contactPerson, phone, email, address, city, province, postalCode, notes, status } = req.body;
  await db.update(customers).set({
    type,
    name,
    contactPerson,
    phone,
    email,
    address,
    city,
    province,
    postalCode,
    notes,
    status,
    updatedAt: sql`CURRENT_TIMESTAMP`
  }).where(and(eq(customers.id, req.params.id), eq(customers.userId, userId)));
  res.json({ success: true });
});

customerRouter.delete('/:id', async (req: any, res) => {
  const userId = req.user.id;
  await db.delete(customers).where(and(eq(customers.id, req.params.id), eq(customers.userId, userId)));
  res.json({ success: true });
});
