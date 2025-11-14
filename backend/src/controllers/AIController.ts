import { Request, Response } from 'express';
import { AIService } from '../services/AIService';
import { validate } from '../utils/validators';
import { aiHintSchema } from '../utils/validators';
import { SuccessResponse } from '../types';

export class AIController {
  /**
   * Get AI hint for a question
   */
  static async getHint(req: Request, res: Response): Promise<void> {
    const data = validate(aiHintSchema)(req.body);

    const hint = await AIService.generateHint(data);

    const response: SuccessResponse<{ hint: string }> = {
      success: true,
      data: { hint },
    };

    res.status(200).json(response);
  }

  /**
   * Get AI explanation for an answer
   */
  static async getExplanation(req: Request, res: Response): Promise<void> {
    const { questionId } = req.params;
    const { selectedAnswer, apiKey } = req.body;

    const explanation = await AIService.explainAnswer(
      questionId,
      selectedAnswer,
      apiKey
    );

    const response: SuccessResponse<{ explanation: string }> = {
      success: true,
      data: { explanation },
    };

    res.status(200).json(response);
  }
}
