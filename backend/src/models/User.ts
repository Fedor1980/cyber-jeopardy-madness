import { query } from '../config/database';
import { User, UserRole } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class UserModel {
  /**
   * Create a new user
   */
  static async create(
    username: string,
    email: string,
    passwordHash: string,
    role: UserRole = UserRole.PLAYER
  ): Promise<User> {
    const id = uuidv4();
    const sql = `
      INSERT INTO users (id, username, email, password_hash, role)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const users = await query<User>(sql, [id, username, email, passwordHash, role]);
    return users[0];
  }

  /**
   * Find user by username
   */
  static async findByUsername(username: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE username = $1';
    const users = await query<User>(sql, [username]);
    return users[0] || null;
  }

  /**
   * Find user by email
   */
  static async findByEmail(email: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE email = $1';
    const users = await query<User>(sql, [email]);
    return users[0] || null;
  }

  /**
   * Find user by ID
   */
  static async findById(id: string): Promise<User | null> {
    const sql = 'SELECT * FROM users WHERE id = $1';
    const users = await query<User>(sql, [id]);
    return users[0] || null;
  }

  /**
   * Get all users
   */
  static async findAll(): Promise<User[]> {
    const sql = 'SELECT * FROM users ORDER BY created_at DESC';
    return query<User>(sql);
  }

  /**
   * Update user
   */
  static async update(id: string, updates: Partial<User>): Promise<User | null> {
    const fields = Object.keys(updates)
      .map((key, index) => `${key} = $${index + 2}`)
      .join(', ');

    const sql = `
      UPDATE users
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const values = [id, ...Object.values(updates)];
    const users = await query<User>(sql, values);
    return users[0] || null;
  }

  /**
   * Delete user
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM users WHERE id = $1';
    await query(sql, [id]);
    return true;
  }
}
