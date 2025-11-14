import { Pool, PoolConfig } from 'pg';
import { config } from './env';
import { logger } from '../utils/logger';

const poolConfig: PoolConfig = {
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
};

export const pool = new Pool(poolConfig);

// Test database connection
pool.on('connect', () => {
  logger.info('Database connection established');
});

pool.on('error', (err) => {
  logger.error('Unexpected database error', { error: err.message });
});

// Graceful shutdown
export const closeDatabase = async (): Promise<void> => {
  try {
    await pool.end();
    logger.info('Database pool closed');
  } catch (error) {
    logger.error('Error closing database pool', { error });
    throw error;
  }
};

// Query helper with logging
export const query = async <T>(
  text: string,
  params?: unknown[]
): Promise<T[]> => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Query executed', {
      query: text,
      duration,
      rows: result.rowCount,
    });
    return result.rows as T[];
  } catch (error) {
    logger.error('Query error', { query: text, error });
    throw error;
  }
};

// Transaction helper
export const transaction = async <T>(
  callback: (client: Pool) => Promise<T>
): Promise<T> => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client as unknown as Pool);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Transaction rolled back', { error });
    throw error;
  } finally {
    client.release();
  }
};

// Health check
export const checkDatabaseHealth = async (): Promise<boolean> => {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    logger.error('Database health check failed', { error });
    return false;
  }
};
