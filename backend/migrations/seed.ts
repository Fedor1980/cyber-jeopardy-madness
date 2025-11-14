import { Pool } from 'pg';
import { config } from '../src/config/env';
import { hashPassword } from '../src/utils/encryption';

const pool = new Pool({
  host: config.DB_HOST,
  port: config.DB_PORT,
  database: config.DB_NAME,
  user: config.DB_USER,
  password: config.DB_PASSWORD,
});

async function seedDatabase(): Promise<void> {
  try {
    console.log('Starting database seeding...');

    // Create admin user
    const adminPasswordHash = await hashPassword('admin123');
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ('admin', 'admin@cyberjeopardy.com', $1, 'admin')
       ON CONFLICT (username) DO NOTHING`,
      [adminPasswordHash]
    );
    console.log('✓ Admin user created');

    // Create demo player
    const playerPasswordHash = await hashPassword('player123');
    await pool.query(
      `INSERT INTO users (username, email, password_hash, role)
       VALUES ('demo_player', 'player@cyberjeopardy.com', $1, 'player')
       ON CONFLICT (username) DO NOTHING`,
      [playerPasswordHash]
    );
    console.log('✓ Demo player created');

    console.log('\nDatabase seeded successfully!');
    console.log('\nDefault credentials:');
    console.log('Admin - Username: admin, Password: admin123');
    console.log('Player - Username: demo_player, Password: player123');

    await pool.end();
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

seedDatabase();
