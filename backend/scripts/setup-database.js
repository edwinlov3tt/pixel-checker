import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const { Client } = pg;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function setupDatabase() {
  const client = new Client({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
  });

  try {
    console.log('🔌 Connecting to database...');
    console.log(`   Host: ${process.env.DB_HOST}`);
    console.log(`   Database: ${process.env.DB_NAME}`);
    console.log(`   User: ${process.env.DB_USER}`);

    await client.connect();
    console.log('✓ Connected to database\n');

    // Read schema file
    const schemaPath = path.join(__dirname, '../db/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📝 Running database schema...');
    await client.query(schema);
    console.log('✓ Schema created successfully\n');

    // Verify tables were created
    const result = await client.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('📊 Created tables:');
    result.rows.forEach(row => {
      console.log(`   - ${row.table_name}`);
    });

    // Check if default organization exists
    const orgResult = await client.query('SELECT * FROM organizations LIMIT 1');
    if (orgResult.rows.length > 0) {
      console.log('\n✓ Default organization created');
      console.log(`   ID: ${orgResult.rows[0].id}`);
      console.log(`   Name: ${orgResult.rows[0].name}`);
    }

    console.log('\n🎉 Database setup complete!');

  } catch (error) {
    console.error('❌ Database setup failed:', error.message);
    if (error.code) {
      console.error(`   Error code: ${error.code}`);
    }
    process.exit(1);

  } finally {
    await client.end();
  }
}

setupDatabase();
