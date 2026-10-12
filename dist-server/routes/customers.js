import { Router } from 'express';
import { db } from '../db/index.js';
import { customers } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const customerRouter = Router();
customerRouter.use(authenticate);
customerRouter.get('/', async (req, res) => {
    const result = await db.select().from(customers).orderBy(desc(customers.createdAt));
    res.json(result);
});
customerRouter.post('/', async (req, res) => {
    const id = `CUST-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { type, name, contactPerson, phone, email, address, city, province, postalCode, notes } = req.body;
    await db.insert(customers).values({
        id,
        uuid,
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
    });
    res.json({ id });
});
customerRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(customers).where(eq(customers.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
customerRouter.put('/:id', async (req, res) => {
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
        updatedAt: sql `CURRENT_TIMESTAMP`
    }).where(eq(customers.id, req.params.id));
    res.json({ success: true });
});
