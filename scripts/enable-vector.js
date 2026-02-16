const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

// Read .env manually
const envPath = path.resolve(__dirname, '..', '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const dbUrlMatch = envContent.match(/DATABASE_URL=(.+)/);
const connectionString = dbUrlMatch ? dbUrlMatch[1].trim() : null;

if (!connectionString) {
    console.error('DATABASE_URL not found in .env');
    process.exit(1);
}

const client = new Client({
    connectionString: connectionString,
});

async function main() {
    try {
        await client.connect();
        console.log('Connected to DB.');
        await client.query('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('Vector extension enabled!');
        await client.end();
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

main();
