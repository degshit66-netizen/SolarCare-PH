import { Router } from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import AdmZip from 'adm-zip';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import multer from 'multer';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.resolve(__dirname, '../../local.db');
const BACKUP_DIR = path.resolve(__dirname, '../../backups');
if (!fs.existsSync(BACKUP_DIR)) {
    fs.mkdirSync(BACKUP_DIR, { recursive: true });
}
export const backupRouter = Router();
backupRouter.use(authenticate);
backupRouter.use(requireRole(['admin']));
// Create backup
backupRouter.post('/create', async (req, res) => {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupName = `backup-${timestamp}.zip`;
        const backupPath = path.join(BACKUP_DIR, backupName);
        const zip = new AdmZip();
        // Add the database file
        if (fs.existsSync(DB_PATH)) {
            zip.addLocalFile(DB_PATH);
        }
        else {
            return res.status(500).json({ error: 'Database file not found.' });
        }
        // Add metadata manifest
        const manifest = {
            version: '1.0',
            createdAt: new Date().toISOString(),
            files: ['local.db'],
        };
        zip.addFile('manifest.json', Buffer.from(JSON.stringify(manifest, null, 2), 'utf8'));
        zip.writeZip(backupPath);
        res.json({ success: true, filename: backupName });
    }
    catch (err) {
        console.error('Backup error:', err);
        res.status(500).json({ error: 'Failed to create backup.' });
    }
});
// Download backup
backupRouter.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    // Basic path traversal prevention
    if (filename.includes('/') || filename.includes('..')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }
    const filepath = path.join(BACKUP_DIR, filename);
    if (!fs.existsSync(filepath)) {
        return res.status(404).json({ error: 'Backup not found' });
    }
    res.download(filepath);
});
// Upload and restore backup
const upload = multer({ dest: 'uploads/' });
backupRouter.post('/restore', upload.single('backupFile'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded.' });
    }
    try {
        const zip = new AdmZip(req.file.path);
        const zipEntries = zip.getEntries();
        const manifestEntry = zipEntries.find(entry => entry.entryName === 'manifest.json');
        if (!manifestEntry) {
            return res.status(400).json({ error: 'Invalid backup: missing manifest.json' });
        }
        const dbEntry = zipEntries.find(entry => entry.entryName === 'local.db');
        if (!dbEntry) {
            return res.status(400).json({ error: 'Invalid backup: missing local.db' });
        }
        // Create safety backup of current DB
        const safetyBackupName = `safety-backup-${Date.now()}.db`;
        if (fs.existsSync(DB_PATH)) {
            fs.copyFileSync(DB_PATH, path.join(BACKUP_DIR, safetyBackupName));
        }
        // Overwrite existing DB
        zip.extractEntryTo('local.db', path.dirname(DB_PATH), false, true);
        // Cleanup uploaded file
        fs.unlinkSync(req.file.path);
        res.json({ success: true, message: 'Restore completed successfully.' });
    }
    catch (err) {
        console.error('Restore error:', err);
        // Cleanup uploaded file
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        res.status(500).json({ error: 'Failed to restore backup.' });
    }
});
