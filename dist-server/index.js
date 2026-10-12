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
    app.get('/api/stats', async (req, res) => {
        // Simple mock stats for now
        res.json({
            customers: 12,
            installations: 5,
            activeWarranties: 8
        });
    });
    const isProduction = process.env.NODE_ENV === 'production';
    if (!isProduction) {
        // Create Vite server in middleware mode
        const vite = await createViteServer({
            server: { middlewareMode: true },
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
