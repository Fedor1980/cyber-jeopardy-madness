import { api } from './api';
import { AIHintRequest } from '../types';

export const aiService = {
  /**
   * Get AI hint for a question
   */
  async getHint(request: AIHintRequest): Promise<string> {
    const response = await api.post<{ hint: string }>('/ai/hint', request);
    return response.hint;
  },

  /**
   * Get AI explanation for an answer
   */
  async getExplanation(
    questionId: string,
    selectedAnswer: string,
    apiKey?: string
  ): Promise<string> {
    const response = await api.post<{ explanation: string }>(
      `/ai/explain/${questionId}`,
      {
        selectedAnswer,
        apiKey,
      }
    );
    return response.explanation;
  },
};
