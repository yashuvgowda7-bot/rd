import * as dotenv from 'dotenv';
dotenv.config();
import { db } from '../src/lib/db';
import { sql } from 'drizzle-orm';

async function main() {
    console.log('Enabling vector extension...');
    try {
        await db.execute(sql`CREATE EXTENSION IF NOT EXISTS vector;`);
        console.log('Vector extension enabled successfully!');
    } catch (error) {
        console.error('Error enabling vector extension:', error);
    }
    process.exit(0);
}

main();
