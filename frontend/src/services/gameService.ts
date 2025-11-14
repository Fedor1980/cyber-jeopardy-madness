import { api } from './api';
import {
  CreateSessionRequest,
  GameSession,
  Team,
  GameBoardData,
  Question,
  SubmitAnswerRequest,
  SubmitAnswerResponse,
  FinalJeopardyWager,
} from '../types';

export const gameService = {
  /**
   * Create a new game session
   */
  async createSession(
    request: CreateSessionRequest
  ): Promise<{ session: GameSession; teams: Team[] }> {
    return api.post('/game/sessions', request);
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<{ session: GameSession; teams: Team[] }> {
    return api.get(`/game/sessions/${sessionId}`);
  },

  /**
   * Get game board for current round
   */
  async getGameBoard(sessionId: string, round: number): Promise<GameBoardData> {
    return api.get(`/game/sessions/${sessionId}/board`, { round });
  },

  /**
   * Get a specific question
   */
  async getQuestion(questionId: string): Promise<Question> {
    return api.get(`/game/questions/${questionId}`);
  },

  /**
   * Submit an answer
   */
  async submitAnswer(request: SubmitAnswerRequest): Promise<SubmitAnswerResponse> {
    return api.post('/game/answer', request);
  },

  /**
   * Advance to next round
   */
  async advanceRound(sessionId: string): Promise<GameSession> {
    return api.post(`/game/sessions/${sessionId}/advance`);
  },

  /**
   * Submit Final Jeopardy wager and answer
   */
  async submitFinalJeopardy(
    wager: FinalJeopardyWager,
    questionId: string
  ): Promise<SubmitAnswerResponse> {
    return api.post('/game/final-jeopardy', { ...wager, questionId });
  },

  /**
   * Complete game
   */
  async completeGame(
    sessionId: string
  ): Promise<{ session: GameSession; rankings: Team[] }> {
    return api.post(`/game/sessions/${sessionId}/complete`);
  },

  /**
   * Update current team
   */
  async updateCurrentTeam(sessionId: string, teamId: string): Promise<GameSession> {
    return api.patch(`/game/sessions/${sessionId}/current-team`, { teamId });
  },
};
