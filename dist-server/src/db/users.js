import { db } from './index.js';
import { users } from './schema.js';
import { eq } from 'drizzle-orm';
export async function getOrCreateUser(uid, email, name) {
    try {
        const existing = await db.select().from(users).where(eq(users.uid, uid)).limit(1);
        if (existing.length > 0) {
            return existing[0];
        }
        const inserted = await db.insert(users).values({
            uid,
            email,
            name: name || email.split('@')[0],
            role: 'admin',
        }).returning();
        return inserted[0];
    }
    catch (err) {
        console.error('getOrCreateUser error:', err);
        return null;
    }
}
