import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function runMigration(migrationFile) {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🔌 Connecting to database...');
    await client.connect();
    console.log('✓ Connected\n');

    // Read migration file
    const migrationPath = path.join(__dirname, '../db/migrations', migrationFile);
    const migration = fs.readFileSync(migrationPath, 'utf8');

    console.log(`📝 Running migration: ${migrationFile}`);
    await client.query(migration);
    console.log('✓ Migration completed successfully\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Get migration file from command line argument or use default
const migrationFile = process.argv[2] || '001_add_email_fields.sql';
runMigration(migrationFile);
