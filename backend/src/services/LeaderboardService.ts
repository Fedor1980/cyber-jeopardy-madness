import { query } from '../config/database';
import { logger } from '../utils/logger';

export interface LeaderboardEntry {
  teamId: string;
  teamName: string;
  score: number;
  sessionId: string;
  sessionName: string;
  industryPack: string;
  completedAt: Date;
  rank: number;
}

export interface LeaderboardFilters {
  industryPack?: string;
  limit?: number;
  offset?: number;
}

export class LeaderboardService {
  /**
   * Get global leaderboard
   */
  static async getGlobalLeaderboard(filters: LeaderboardFilters = {}): Promise<LeaderboardEntry[]> {
    const limit = filters.limit || 100;
    const offset = filters.offset || 0;

    let sql = `
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.score,
        gs.id as session_id,
        gs.name as session_name,
        gs.industry_pack,
        gs.updated_at as completed_at,
        ROW_NUMBER() OVER (ORDER BY t.score DESC, gs.updated_at ASC) as rank
      FROM teams t
      JOIN game_sessions gs ON t.session_id = gs.id
      WHERE gs.status = 'completed'
    `;

    const params: any[] = [];

    if (filters.industryPack) {
      sql += ` AND gs.industry_pack = $${params.length + 1}`;
      params.push(filters.industryPack);
    }

    sql += `
      ORDER BY t.score DESC, gs.updated_at ASC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limit, offset);

    try {
      const result = await query(sql, params);

      return result.rows.map((row) => ({
        teamId: row.team_id,
        teamName: row.team_name,
        score: row.score,
        sessionId: row.session_id,
        sessionName: row.session_name,
        industryPack: row.industry_pack,
        completedAt: row.completed_at,
        rank: parseInt(row.rank),
      }));
    } catch (error) {
      logger.error('Failed to fetch global leaderboard', { error, filters });
      throw error;
    }
  }

  /**
   * Get session leaderboard
   */
  static async getSessionLeaderboard(sessionId: string): Promise<LeaderboardEntry[]> {
    const sql = `
      SELECT
        t.id as team_id,
        t.name as team_name,
        t.score,
        gs.id as session_id,
        gs.name as session_name,
        gs.industry_pack,
        gs.updated_at as completed_at,
        ROW_NUMBER() OVER (ORDER BY t.score DESC) as rank
      FROM teams t
      JOIN game_sessions gs ON t.session_id = gs.id
      WHERE gs.id = $1
      ORDER BY t.score DESC
    `;

    try {
      const result = await query(sql, [sessionId]);

      return result.rows.map((row) => ({
        teamId: row.team_id,
        teamName: row.team_name,
        score: row.score,
        sessionId: row.session_id,
        sessionName: row.session_name,
        industryPack: row.industry_pack,
        completedAt: row.completed_at,
        rank: parseInt(row.rank),
      }));
    } catch (error) {
      logger.error('Failed to fetch session leaderboard', { error, sessionId });
      throw error;
    }
  }

  /**
   * Get team statistics
   */
  static async getTeamStats(teamId: string): Promise<{
    totalGames: number;
    totalScore: number;
    averageScore: number;
    bestScore: number;
    worstScore: number;
    totalCorrect: number;
    totalIncorrect: number;
    accuracy: number;
  }> {
    const sql = `
      SELECT
        COUNT(DISTINCT t.session_id) as total_games,
        SUM(t.score) as total_score,
        AVG(t.score) as average_score,
        MAX(t.score) as best_score,
        MIN(t.score) as worst_score,
        COUNT(CASE WHEN qa.is_correct = true THEN 1 END) as total_correct,
        COUNT(CASE WHEN qa.is_correct = false THEN 1 END) as total_incorrect
      FROM teams t
      LEFT JOIN question_attempts qa ON t.id = qa.team_id
      WHERE t.id = $1
      GROUP BY t.id
    `;

    try {
      const result = await query(sql, [teamId]);

      if (result.rows.length === 0) {
        return {
          totalGames: 0,
          totalScore: 0,
          averageScore: 0,
          bestScore: 0,
          worstScore: 0,
          totalCorrect: 0,
          totalIncorrect: 0,
          accuracy: 0,
        };
      }

      const row = result.rows[0];
      const totalAttempts = row.total_correct + row.total_incorrect;
      const accuracy = totalAttempts > 0 ? (row.total_correct / totalAttempts) * 100 : 0;

      return {
        totalGames: parseInt(row.total_games) || 0,
        totalScore: parseInt(row.total_score) || 0,
        averageScore: parseFloat(row.average_score) || 0,
        bestScore: parseInt(row.best_score) || 0,
        worstScore: parseInt(row.worst_score) || 0,
        totalCorrect: parseInt(row.total_correct) || 0,
        totalIncorrect: parseInt(row.total_incorrect) || 0,
        accuracy: Math.round(accuracy * 100) / 100,
      };
    } catch (error) {
      logger.error('Failed to fetch team stats', { error, teamId });
      throw error;
    }
  }

  /**
   * Get industry pack statistics
   */
  static async getIndustryPackStats(industryPack: string): Promise<{
    totalGames: number;
    totalPlayers: number;
    averageScore: number;
    topScore: number;
  }> {
    const sql = `
      SELECT
        COUNT(DISTINCT gs.id) as total_games,
        COUNT(DISTINCT t.id) as total_players,
        AVG(t.score) as average_score,
        MAX(t.score) as top_score
      FROM game_sessions gs
      JOIN teams t ON gs.id = t.session_id
      WHERE gs.industry_pack = $1 AND gs.status = 'completed'
    `;

    try {
      const result = await query(sql, [industryPack]);

      if (result.rows.length === 0) {
        return {
          totalGames: 0,
          totalPlayers: 0,
          averageScore: 0,
          topScore: 0,
        };
      }

      const row = result.rows[0];

      return {
        totalGames: parseInt(row.total_games) || 0,
        totalPlayers: parseInt(row.total_players) || 0,
        averageScore: parseFloat(row.average_score) || 0,
        topScore: parseInt(row.top_score) || 0,
      };
    } catch (error) {
      logger.error('Failed to fetch industry pack stats', { error, industryPack });
      throw error;
    }
  }
}
