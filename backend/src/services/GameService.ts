import { SessionModel } from '../models/Session';
import { TeamModel } from '../models/Team';
import { QuestionModel, CategoryModel } from '../models/Question';
import { QuestionAttemptModel, FinalJeopardyWagerModel } from '../models/QuestionAttempt';
import {
  CreateSessionRequest,
  GameSession,
  Team,
  Question,
  Category,
  GameRound,
  SessionStatus,
  SubmitAnswerRequest,
  SubmitFinalJeopardyRequest,
} from '../types';
import { NotFoundError, ValidationError, ConflictError } from '../utils/errors';

export class GameService {
  /**
   * Create a new game session with teams
   */
  static async createSession(
    request: CreateSessionRequest,
    createdBy: string
  ): Promise<{
    session: GameSession;
    teams: Team[];
  }> {
    // Validate team count
    if (request.teams.length < 2 || request.teams.length > 6) {
      throw new ValidationError('Session must have between 2 and 6 teams');
    }

    // Create session and teams in transaction
    const session = await SessionModel.create(
      request.name,
      request.industry_pack,
      request.settings,
      createdBy
    );

    const teams: Team[] = [];
    for (let i = 0; i < request.teams.length; i++) {
      const team = await TeamModel.create(
        session.id,
        request.teams[i].name,
        request.teams[i].color,
        i
      );
      teams.push(team);
    }

    // Set first team as current team
    if (teams.length > 0) {
      await SessionModel.updateCurrentTeam(session.id, teams[0].id);
      session.current_team_id = teams[0].id;
    }

    return { session, teams };
  }

  /**
   * Get game board for a session and round
   */
  static async getGameBoard(
    sessionId: string,
    round: number
  ): Promise<{
    categories: Category[];
    questions: Question[];
    attemptedQuestions: string[];
  }> {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    const categories = await CategoryModel.findByPackAndRound(
      session.industry_pack,
      round
    );

    const questions = await QuestionModel.findByPackAndRound(
      session.industry_pack,
      round
    );

    const attempts = await QuestionAttemptModel.findBySession(sessionId);
    const attemptedQuestions = attempts.map(a => a.question_id);

    return { categories, questions, attemptedQuestions };
  }

  /**
   * Submit an answer to a question
   */
  static async submitAnswer(
    request: SubmitAnswerRequest
  ): Promise<{
    isCorrect: boolean;
    pointsAwarded: number;
    correctAnswer: string;
    explanation: string;
    updatedTeam: Team;
  }> {
    // Validate session exists
    const session = await SessionModel.findById(request.session_id);
    if (!session) {
      throw new NotFoundError('Session');
    }

    // Check if question already attempted
    const alreadyAttempted = await QuestionAttemptModel.isAttempted(
      request.session_id,
      request.question_id
    );
    if (alreadyAttempted) {
      throw new ConflictError('Question already attempted');
    }

    // Get question
    const question = await QuestionModel.findById(request.question_id);
    if (!question) {
      throw new NotFoundError('Question');
    }

    // Get team
    const team = await TeamModel.findById(request.team_id);
    if (!team) {
      throw new NotFoundError('Team');
    }

    // Check answer
    const isCorrect = request.selected_answer.trim().toLowerCase() ===
                      question.correct_answer.trim().toLowerCase();

    // Calculate points
    let pointsAwarded = 0;
    if (isCorrect) {
      pointsAwarded = question.point_value;
    } else if (session.settings.allow_negative_scores) {
      pointsAwarded = -question.point_value;
    }

    // Record attempt
    await QuestionAttemptModel.create(
      request.session_id,
      request.team_id,
      request.question_id,
      request.selected_answer,
      isCorrect,
      pointsAwarded,
      request.time_taken,
      false
    );

    // Update team score
    const updatedTeam = await TeamModel.updateScore(request.team_id, pointsAwarded);
    if (!updatedTeam) {
      throw new NotFoundError('Team');
    }

    return {
      isCorrect,
      pointsAwarded,
      correctAnswer: question.correct_answer,
      explanation: question.explanation,
      updatedTeam,
    };
  }

  /**
   * Advance to next round
   */
  static async advanceRound(sessionId: string): Promise<GameSession> {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    let newRound: GameRound;
    let newStatus: SessionStatus;

    switch (session.current_round) {
      case GameRound.ROUND_1:
        newRound = GameRound.ROUND_2;
        newStatus = SessionStatus.ROUND_2;
        break;
      case GameRound.ROUND_2:
        newRound = GameRound.FINAL_JEOPARDY;
        newStatus = SessionStatus.FINAL_JEOPARDY;
        break;
      default:
        throw new ValidationError('Cannot advance from current round');
    }

    const updatedSession = await SessionModel.updateRound(sessionId, newRound, newStatus);
    if (!updatedSession) {
      throw new NotFoundError('Session');
    }

    return updatedSession;
  }

  /**
   * Submit Final Jeopardy wager and answer
   */
  static async submitFinalJeopardy(
    request: SubmitFinalJeopardyRequest,
    _questionId: string,
    isCorrect: boolean
  ): Promise<{
    isCorrect: boolean;
    pointsAwarded: number;
    updatedTeam: Team;
  }> {
    // Get or create wager
    let wager = await FinalJeopardyWagerModel.findByTeamAndSession(
      request.team_id,
      request.session_id
    );

    if (!wager) {
      wager = await FinalJeopardyWagerModel.create(
        request.session_id,
        request.team_id,
        request.wager_amount
      );
    }

    // Submit answer
    await FinalJeopardyWagerModel.submitAnswer(wager.id, request.answer, isCorrect);

    // Calculate points
    const pointsAwarded = isCorrect ? wager.wager_amount : -wager.wager_amount;

    // Update team score
    const updatedTeam = await TeamModel.updateScore(request.team_id, pointsAwarded);
    if (!updatedTeam) {
      throw new NotFoundError('Team');
    }

    return {
      isCorrect,
      pointsAwarded,
      updatedTeam,
    };
  }

  /**
   * Complete game and get final rankings
   */
  static async completeGame(sessionId: string): Promise<{
    session: GameSession;
    rankings: Team[];
  }> {
    const session = await SessionModel.complete(sessionId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    const rankings = await TeamModel.getRankings(sessionId);

    return { session, rankings };
  }

  /**
   * Get session details with teams
   */
  static async getSessionDetails(sessionId: string): Promise<{
    session: GameSession;
    teams: Team[];
  }> {
    const session = await SessionModel.findById(sessionId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    const teams = await TeamModel.findBySession(sessionId);

    return { session, teams };
  }

  /**
   * Update current team (for turn rotation)
   */
  static async updateCurrentTeam(
    sessionId: string,
    teamId: string
  ): Promise<GameSession> {
    const session = await SessionModel.updateCurrentTeam(sessionId, teamId);
    if (!session) {
      throw new NotFoundError('Session');
    }

    return session;
  }
}
