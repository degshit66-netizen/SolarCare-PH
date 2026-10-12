import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const sqliteUrl = process.env.DATABASE_URL || 'file:local.db';
export const sqliteClient = createClient({
    url: sqliteUrl,
});
export const db = drizzle(sqliteClient, { schema });
