import { query } from '../config/database';
import { QuestionAttempt, FinalJeopardyWager } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class QuestionAttemptModel {
  /**
   * Create a new question attempt
   */
  static async create(
    sessionId: string,
    teamId: string,
    questionId: string,
    selectedAnswer: string,
    isCorrect: boolean,
    pointsAwarded: number,
    timeTaken: number,
    hintUsed: boolean
  ): Promise<QuestionAttempt> {
    const id = uuidv4();
    const sql = `
      INSERT INTO question_attempts (
        id, session_id, team_id, question_id, selected_answer,
        is_correct, points_awarded, time_taken, hint_used
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const attempts = await query<QuestionAttempt>(sql, [
      id,
      sessionId,
      teamId,
      questionId,
      selectedAnswer,
      isCorrect,
      pointsAwarded,
      timeTaken,
      hintUsed,
    ]);
    return attempts[0];
  }

  /**
   * Find attempts by session
   */
  static async findBySession(sessionId: string): Promise<QuestionAttempt[]> {
    const sql = 'SELECT * FROM question_attempts WHERE session_id = $1 ORDER BY created_at ASC';
    return query<QuestionAttempt>(sql, [sessionId]);
  }

  /**
   * Find attempts by team
   */
  static async findByTeam(teamId: string): Promise<QuestionAttempt[]> {
    const sql = 'SELECT * FROM question_attempts WHERE team_id = $1 ORDER BY created_at ASC';
    return query<QuestionAttempt>(sql, [teamId]);
  }

  /**
   * Check if question already attempted in session
   */
  static async isAttempted(sessionId: string, questionId: string): Promise<boolean> {
    const sql = `
      SELECT COUNT(*) as count
      FROM question_attempts
      WHERE session_id = $1 AND question_id = $2
    `;
    const results = await query<{ count: string }>(sql, [sessionId, questionId]);
    return parseInt(results[0].count) > 0;
  }

  /**
   * Get session statistics
   */
  static async getSessionStats(sessionId: string): Promise<{
    totalAttempts: number;
    correctAnswers: number;
    incorrectAnswers: number;
    averageTime: number;
  }> {
    const sql = `
      SELECT
        COUNT(*) as total_attempts,
        SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) as correct_answers,
        SUM(CASE WHEN NOT is_correct THEN 1 ELSE 0 END) as incorrect_answers,
        AVG(time_taken) as average_time
      FROM question_attempts
      WHERE session_id = $1
    `;
    const results = await query<{
      total_attempts: string;
      correct_answers: string;
      incorrect_answers: string;
      average_time: string;
    }>(sql, [sessionId]);

    return {
      totalAttempts: parseInt(results[0].total_attempts),
      correctAnswers: parseInt(results[0].correct_answers),
      incorrectAnswers: parseInt(results[0].incorrect_answers),
      averageTime: parseFloat(results[0].average_time),
    };
  }
}

export class FinalJeopardyWagerModel {
  /**
   * Create a Final Jeopardy wager
   */
  static async create(
    sessionId: string,
    teamId: string,
    wagerAmount: number
  ): Promise<FinalJeopardyWager> {
    const id = uuidv4();
    const sql = `
      INSERT INTO final_jeopardy_wagers (id, session_id, team_id, wager_amount)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;

    const wagers = await query<FinalJeopardyWager>(sql, [id, sessionId, teamId, wagerAmount]);
    return wagers[0];
  }

  /**
   * Submit Final Jeopardy answer
   */
  static async submitAnswer(
    id: string,
    answer: string,
    isCorrect: boolean
  ): Promise<FinalJeopardyWager | null> {
    const sql = `
      UPDATE final_jeopardy_wagers
      SET answer = $2, is_correct = $3
      WHERE id = $1
      RETURNING *
    `;

    const wagers = await query<FinalJeopardyWager>(sql, [id, answer, isCorrect]);
    return wagers[0] || null;
  }

  /**
   * Find wager by team and session
   */
  static async findByTeamAndSession(
    teamId: string,
    sessionId: string
  ): Promise<FinalJeopardyWager | null> {
    const sql = 'SELECT * FROM final_jeopardy_wagers WHERE team_id = $1 AND session_id = $2';
    const wagers = await query<FinalJeopardyWager>(sql, [teamId, sessionId]);
    return wagers[0] || null;
  }

  /**
   * Find all wagers for a session
   */
  static async findBySession(sessionId: string): Promise<FinalJeopardyWager[]> {
    const sql = 'SELECT * FROM final_jeopardy_wagers WHERE session_id = $1';
    return query<FinalJeopardyWager>(sql, [sessionId]);
  }
}
