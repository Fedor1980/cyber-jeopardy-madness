import { Pool } from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import { config } from '../src/config/env';

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
});

async function runMigrations(): Promise<void> {
  try {
    console.log('Starting database migrations...');

    const migrationFile = join(__dirname, '001_initial_schema.sql');
    const sql = readFileSync(migrationFile, 'utf-8');

    await pool.query(sql);

    console.log('✓ Migration 001_initial_schema.sql completed successfully');
    console.log('Database schema created successfully!');

    await pool.end();
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
