import { Router } from 'express';
import { db } from '../db/index.js';
import { installations } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
export const installationRouter = Router();
installationRouter.use(authenticate);
installationRouter.get('/', async (req, res) => {
    const result = await db.select().from(installations).orderBy(desc(installations.createdAt));
    res.json(result);
});
installationRouter.post('/', async (req, res) => {
    const id = `INST-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { customerId, projectName, siteAddress, capacityKwp, systemType, status, notes } = req.body;
    await db.insert(installations).values({
        id,
        uuid,
        customerId,
        projectName,
        siteAddress,
        capacityKwp,
        systemType,
        status,
        notes,
    });
    res.json({ id });
});
installationRouter.get('/:id', async (req, res) => {
    const result = await db.select().from(installations).where(eq(installations.id, req.params.id)).limit(1);
    if (!result[0])
        return res.status(404).json({ error: 'Not found' });
    res.json(result[0]);
});
installationRouter.put('/:id', async (req, res) => {
    const { projectName, siteAddress, capacityKwp, systemType, status, notes, startDate, completionDate, commissioningDate, turnoverDate } = req.body;
    await db.update(installations).set({
        projectName,
        siteAddress,
        capacityKwp,
        systemType,
        status,
        notes,
        startDate,
        completionDate,
        commissioningDate,
        turnoverDate,
        statusUpdatedAt: sql `CURRENT_TIMESTAMP`
    }).where(eq(installations.id, req.params.id));
    res.json({ success: true });
});
