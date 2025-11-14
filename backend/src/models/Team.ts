import { query } from '../config/database';
import { Team } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class TeamModel {
  /**
   * Create a new team
   */
  static async create(
    sessionId: string,
    name: string,
    color: string,
    orderPosition: number
  ): Promise<Team> {
    const id = uuidv4();
    const sql = `
      INSERT INTO teams (id, session_id, name, color, score, order_position)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const teams = await query<Team>(sql, [id, sessionId, name, color, 0, orderPosition]);
    return teams[0];
  }

  /**
   * Find team by ID
   */
  static async findById(id: string): Promise<Team | null> {
    const sql = 'SELECT * FROM teams WHERE id = $1';
    const teams = await query<Team>(sql, [id]);
    return teams[0] || null;
  }

  /**
   * Find all teams in a session
   */
  static async findBySession(sessionId: string): Promise<Team[]> {
    const sql = 'SELECT * FROM teams WHERE session_id = $1 ORDER BY order_position ASC';
    return query<Team>(sql, [sessionId]);
  }

  /**
   * Update team score
   */
  static async updateScore(id: string, scoreChange: number): Promise<Team | null> {
    const sql = `
      UPDATE teams
      SET score = score + $2
      WHERE id = $1
      RETURNING *
    `;

    const teams = await query<Team>(sql, [id, scoreChange]);
    return teams[0] || null;
  }

  /**
   * Set team score directly
   */
  static async setScore(id: string, score: number): Promise<Team | null> {
    const sql = `
      UPDATE teams
      SET score = $2
      WHERE id = $1
      RETURNING *
    `;

    const teams = await query<Team>(sql, [id, score]);
    return teams[0] || null;
  }

  /**
   * Get team rankings for a session
   */
  static async getRankings(sessionId: string): Promise<Team[]> {
    const sql = `
      SELECT * FROM teams
      WHERE session_id = $1
      ORDER BY score DESC, name ASC
    `;
    return query<Team>(sql, [sessionId]);
  }

  /**
   * Delete team
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM teams WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  /**
   * Delete all teams in a session
   */
  static async deleteBySession(sessionId: string): Promise<boolean> {
    const sql = 'DELETE FROM teams WHERE session_id = $1';
    await query(sql, [sessionId]);
    return true;
  }
}
