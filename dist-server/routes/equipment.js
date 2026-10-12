import { Router } from 'express';
import { db } from '../db/index.js';
import { equipment } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const equipmentRouter = Router();
equipmentRouter.use(authenticate);
equipmentRouter.get('/', async (req, res) => {
    const result = await db.select().from(equipment).orderBy(desc(equipment.createdAt));
    res.json(result);
});
equipmentRouter.post('/', async (req, res) => {
    const id = `EQ-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { installationId, category, brand, model, serialNumber, quantity, unit, specifications, supplier, purchaseDate, installationDate, status, notes } = req.body;
    await db.insert(equipment).values({
        id,
        uuid,
        installationId,
        category,
        brand,
        model,
        serialNumber,
        quantity,
        unit,
        specifications,
        supplier,
        purchaseDate,
        installationDate,
        status,
        notes,
    });
    res.json({ id });
});
equipmentRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(equipment).where(eq(equipment.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
equipmentRouter.put('/:id', async (req, res) => {
    const { category, brand, model, serialNumber, quantity, unit, specifications, supplier, purchaseDate, installationDate, status, notes } = req.body;
    await db.update(equipment).set({
        category,
        brand,
        model,
        serialNumber,
        quantity,
        unit,
        specifications,
        supplier,
        purchaseDate,
        installationDate,
        status,
        notes,
    }).where(eq(equipment.id, req.params.id));
    res.json({ success: true });
});
