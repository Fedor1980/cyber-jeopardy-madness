import { query } from '../config/database';
import { GameSession, SessionStatus, GameRound, SessionSettings } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class SessionModel {
  /**
   * Create a new game session
   */
  static async create(
    name: string,
    industryPack: string,
    settings: SessionSettings,
    createdBy: string
  ): Promise<GameSession> {
    const id = uuidv4();
    const sql = `
      INSERT INTO game_sessions (id, name, industry_pack, current_round, status, settings, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;

    const sessions = await query<GameSession>(sql, [
      id,
      name,
      industryPack,
      GameRound.ROUND_1,
      SessionStatus.ROUND_1,
      JSON.stringify(settings),
      createdBy,
    ]);

    const session = sessions[0];
    session.settings = settings;
    return session;
  }

  /**
   * Find session by ID
   */
  static async findById(id: string): Promise<GameSession | null> {
    const sql = 'SELECT * FROM game_sessions WHERE id = $1';
    const sessions = await query<GameSession>(sql, [id]);

    if (sessions[0]) {
      sessions[0].settings = typeof sessions[0].settings === 'string'
        ? JSON.parse(sessions[0].settings as unknown as string)
        : sessions[0].settings;
    }

    return sessions[0] || null;
  }

  /**
   * Get all sessions
   */
  static async findAll(): Promise<GameSession[]> {
    const sql = 'SELECT * FROM game_sessions ORDER BY created_at DESC';
    const sessions = await query<GameSession>(sql);

    return sessions.map(session => ({
      ...session,
      settings: typeof session.settings === 'string'
        ? JSON.parse(session.settings as unknown as string)
        : session.settings
    }));
  }

  /**
   * Update session round and status
   */
  static async updateRound(
    id: string,
    round: GameRound,
    status: SessionStatus
  ): Promise<GameSession | null> {
    const sql = `
      UPDATE game_sessions
      SET current_round = $2, status = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const sessions = await query<GameSession>(sql, [id, round, status]);

    if (sessions[0]) {
      sessions[0].settings = typeof sessions[0].settings === 'string'
        ? JSON.parse(sessions[0].settings as unknown as string)
        : sessions[0].settings;
    }

    return sessions[0] || null;
  }

  /**
   * Update current team
   */
  static async updateCurrentTeam(
    id: string,
    teamId: string | null
  ): Promise<GameSession | null> {
    const sql = `
      UPDATE game_sessions
      SET current_team_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const sessions = await query<GameSession>(sql, [id, teamId]);

    if (sessions[0]) {
      sessions[0].settings = typeof sessions[0].settings === 'string'
        ? JSON.parse(sessions[0].settings as unknown as string)
        : sessions[0].settings;
    }

    return sessions[0] || null;
  }

  /**
   * Complete session
   */
  static async complete(id: string): Promise<GameSession | null> {
    const sql = `
      UPDATE game_sessions
      SET status = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;

    const sessions = await query<GameSession>(sql, [id, SessionStatus.COMPLETED]);

    if (sessions[0]) {
      sessions[0].settings = typeof sessions[0].settings === 'string'
        ? JSON.parse(sessions[0].settings as unknown as string)
        : sessions[0].settings;
    }

    return sessions[0] || null;
  }

  /**
   * Delete session
   */
  static async delete(id: string): Promise<boolean> {
    const sql = 'DELETE FROM game_sessions WHERE id = $1';
    await query(sql, [id]);
    return true;
  }

  /**
   * Get sessions by creator
   */
  static async findByCreator(createdBy: string): Promise<GameSession[]> {
    const sql = 'SELECT * FROM game_sessions WHERE created_by = $1 ORDER BY created_at DESC';
    const sessions = await query<GameSession>(sql, [createdBy]);

    return sessions.map(session => ({
      ...session,
      settings: typeof session.settings === 'string'
        ? JSON.parse(session.settings as unknown as string)
        : session.settings
    }));
  }
}
