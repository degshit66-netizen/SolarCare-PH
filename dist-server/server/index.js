import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { authRouter } from './routes/auth.js';
import { customerRouter } from './routes/customers.js';
import { installationRouter } from './routes/installations.js';
import { equipmentRouter } from './routes/equipment.js';
import { warrantyRouter } from './routes/warranties.js';
import { backupRouter } from './routes/backup.js';
import { warrantyClaimRouter } from './routes/warranty-claims.js';
import { serviceRequestRouter } from './routes/service-requests.js';
import { documentRouter } from './routes/documents.js';
import { authenticate } from './middleware/auth.js';
import { db } from './db/index.js';
import { customers, installations, warranties, equipment, warrantyClaims, serviceRequests } from './db/schema.js';
import { count, eq, and } from 'drizzle-orm';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
async function startServer() {
    const app = express();
    app.use(cors());
    app.use(express.json());
    app.use(cookieParser());
    // API Routes
    app.use('/api/auth', authRouter);
    app.use('/api/customers', customerRouter);
    app.use('/api/installations', installationRouter);
    app.use('/api/equipment', equipmentRouter);
    app.use('/api/warranties', warrantyRouter);
    app.use('/api/backup', backupRouter);
    app.use('/api/claims', warrantyClaimRouter);
    app.use('/api/services', serviceRequestRouter);
    app.use('/api/documents', documentRouter);
    app.get('/api/search', authenticate, async (req, res) => {
        try {
            const userId = req.user.id;
            const q = (req.query.q || '').trim().toLowerCase();
            if (!q)
                return res.json({ results: [] });
            const allCustomers = await db.select().from(customers).where(eq(customers.userId, userId));
            const allInstallations = await db.select().from(installations).where(eq(installations.userId, userId));
            const allEquipment = await db.select().from(equipment).where(eq(equipment.userId, userId));
            const allWarranties = await db.select().from(warranties).where(eq(warranties.userId, userId));
            const matchedCustomers = allCustomers.filter(c => c.name.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))).slice(0, 4);
            const matchedInstallations = allInstallations.filter(i => i.projectName.toLowerCase().includes(q) || i.id.toLowerCase().includes(q) || i.siteAddress.toLowerCase().includes(q)).slice(0, 4);
            const matchedEquipment = allEquipment.filter(e => (e.serialNumber && e.serialNumber.toLowerCase().includes(q)) ||
                e.brand.toLowerCase().includes(q) ||
                e.model.toLowerCase().includes(q) ||
                e.id.toLowerCase().includes(q)).slice(0, 4);
            const matchedWarranties = allWarranties.filter(w => w.id.toLowerCase().includes(q) || w.provider.toLowerCase().includes(q) || (w.referenceNumber && w.referenceNumber.toLowerCase().includes(q))).slice(0, 4);
            res.json({
                customers: matchedCustomers,
                installations: matchedInstallations,
                equipment: matchedEquipment,
                warranties: matchedWarranties,
            });
        }
        catch (err) {
            console.error('Search error:', err);
            res.status(500).json({ error: 'Search failed' });
        }
    });
    app.get('/api/stats', authenticate, async (req, res) => {
        try {
            const userId = req.user.id;
            const [custCount] = await db.select({ value: count() }).from(customers).where(eq(customers.userId, userId));
            const [instCount] = await db.select({ value: count() }).from(installations).where(eq(installations.userId, userId));
            const [equipCount] = await db.select({ value: count() }).from(equipment).where(eq(equipment.userId, userId));
            const [warCount] = await db.select({ value: count() }).from(warranties).where(and(eq(warranties.userId, userId), eq(warranties.status, 'Active')));
            const [claimCount] = await db.select({ value: count() }).from(warrantyClaims).where(eq(warrantyClaims.userId, userId));
            const [srvCount] = await db.select({ value: count() }).from(serviceRequests).where(and(eq(serviceRequests.userId, userId), eq(serviceRequests.status, 'Open')));
            const recentInstallations = await db.select().from(installations).where(eq(installations.userId, userId)).limit(5);
            res.json({
                customers: custCount?.value || 0,
                installations: instCount?.value || 0,
                equipment: equipCount?.value || 0,
                activeWarranties: warCount?.value || 0,
                openClaims: claimCount?.value || 0,
                pendingServices: srvCount?.value || 0,
                recentInstallations: recentInstallations || [],
            });
        }
        catch (err) {
            console.error('Stats query error:', err);
            res.status(500).json({ error: 'Failed to calculate stats' });
        }
    });
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
        // Create Vite server in middleware mode with HMR disabled for AI Studio iframe environment
        const vite = await createViteServer({
            server: {
                middlewareMode: true,
                hmr: false,
            },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    }
    else {
        // Serve static files from dist
        const distPath = path.resolve(__dirname, '../dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.resolve(distPath, 'index.html'));
        });
    }
    const port = process.env.PORT || 3000;
    app.listen(port, () => {
        console.log(`Server started on port ${port}`);
    });
}
startServer();
