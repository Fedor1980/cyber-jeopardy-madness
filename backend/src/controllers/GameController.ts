import { Request, Response } from 'express';
import { GameService } from '../services/GameService';
import { QuestionModel } from '../models/Question';
import { validate } from '../utils/validators';
import {
  createSessionSchema,
  submitAnswerSchema,
  submitFinalJeopardySchema,
} from '../utils/validators';
import { SuccessResponse } from '../types';

export class GameController {
  /**
   * Create a new game session
   */
  static async createSession(req: Request, res: Response): Promise<void> {
    const data = validate(createSessionSchema)(req.body);

    const userId = req.user?.userId || 'anonymous';
    const result = await GameService.createSession(data, userId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Session created successfully',
    };

    res.status(201).json(response);
  }

  /**
   * Get session details
   */
  static async getSession(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const result = await GameService.getSessionDetails(sessionId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  }

  /**
   * Get game board for a session
   */
  static async getGameBoard(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const round = parseInt(req.query.round as string) || 1;

    const result = await GameService.getGameBoard(sessionId, round);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  }

  /**
   * Get a specific question
   */
  static async getQuestion(req: Request, res: Response): Promise<void> {
    const { questionId } = req.params;

    const question = await QuestionModel.findById(questionId);

    const response: SuccessResponse<typeof question> = {
      success: true,
      data: question,
    };

    res.status(200).json(response);
  }

  /**
   * Submit an answer
   */
  static async submitAnswer(req: Request, res: Response): Promise<void> {
    const data = validate(submitAnswerSchema)(req.body);

    const result = await GameService.submitAnswer(data);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  }

  /**
   * Advance to next round
   */
  static async advanceRound(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const result = await GameService.advanceRound(sessionId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Advanced to next round',
    };

    res.status(200).json(response);
  }

  /**
   * Submit Final Jeopardy answer
   */
  static async submitFinalJeopardy(req: Request, res: Response): Promise<void> {
    const data = validate(submitFinalJeopardySchema)(req.body);
    const { questionId } = req.body;

    // Get question and check answer
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      res.status(404).json({ error: 'Question not found' });
      return;
    }

    const isCorrect = data.answer.trim().toLowerCase() ===
                      question.correct_answer.trim().toLowerCase();

    const result = await GameService.submitFinalJeopardy(data, questionId, isCorrect);

    const response: SuccessResponse<typeof result & { correctAnswer: string }> = {
      success: true,
      data: {
        ...result,
        correctAnswer: question.correct_answer,
      },
    };

    res.status(200).json(response);
  }

  /**
   * Complete game
   */
  static async completeGame(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;

    const result = await GameService.completeGame(sessionId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
      message: 'Game completed',
    };

    res.status(200).json(response);
  }

  /**
   * Update current team
   */
  static async updateCurrentTeam(req: Request, res: Response): Promise<void> {
    const { sessionId } = req.params;
    const { teamId } = req.body;

    const result = await GameService.updateCurrentTeam(sessionId, teamId);

    const response: SuccessResponse<typeof result> = {
      success: true,
      data: result,
    };

    res.status(200).json(response);
  }
}
