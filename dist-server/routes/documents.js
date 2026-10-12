import { Router } from 'express';
import { db } from '../db/index.js';
import { documents } from '../db/schema.js';
import { eq, desc } from 'drizzle-orm';
import { v4 as uuidv4 } from 'uuid';
import { authenticate } from '../middleware/auth.js';
import multer from 'multer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_DIR = path.resolve(__dirname, '../../storage');
if (!fs.existsSync(STORAGE_DIR)) {
    fs.mkdirSync(STORAGE_DIR, { recursive: true });
}
export const documentRouter = Router();
documentRouter.use(authenticate);
// Configure multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, STORAGE_DIR);
    },
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        cb(null, `${uuidv4()}${ext}`);
    }
});
const upload = multer({ storage });
documentRouter.get('/', async (req, res) => {
    const result = await db.select().from(documents).orderBy(desc(documents.createdAt));
    res.json(result);
});
documentRouter.post('/upload', upload.single('document'), async (req, res) => {
    if (!req.file)
        return res.status(400).json({ error: 'No file uploaded' });
    const id = `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
    const uuid = uuidv4();
    const { type, installationId, equipmentId, warrantyId, claimId, serviceRequestId } = req.body;
    await db.insert(documents).values({
        id,
        uuid,
        type,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
        installationId,
        equipmentId,
        warrantyId,
        claimId,
        serviceRequestId,
        uploadedById: req.user.id,
    });
    res.json({ id });
});
documentRouter.get('/download/:id', async (req, res) => {
    const docResult = await db.select().from(documents).where(eq(documents.id, req.params.id)).limit(1);
    const doc = docResult[0];
    if (!doc)
        return res.status(404).json({ error: 'Document not found' });
    const filepath = path.join(STORAGE_DIR, doc.filename);
    if (!fs.existsSync(filepath))
        return res.status(404).json({ error: 'File not found on disk' });
    res.download(filepath, doc.originalName);
});
documentRouter.delete('/:id', async (req, res) => {
    const docResult = await db.select().from(documents).where(eq(documents.id, req.params.id)).limit(1);
    const doc = docResult[0];
    if (!doc)
        return res.status(404).json({ error: 'Document not found' });
    // Delete from disk
    const filepath = path.join(STORAGE_DIR, doc.filename);
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }
    // Delete from db
    await db.delete(documents).where(eq(documents.id, req.params.id));
    res.json({ success: true });
});
