import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { QuestionModel } from '../models/Question';
import { AIHintRequest, HintType } from '../types';
import { NotFoundError, ValidationError } from '../utils/errors';
import { logger } from '../utils/logger';

export class AIService {
  /**
   * Generate a hint using AI
   */
  static async generateHint(request: AIHintRequest): Promise<string> {
    const question = await QuestionModel.findById(request.question_id);
    if (!question) {
      throw new NotFoundError('Question');
    }

    // If no API key provided, return a basic hint
    if (!request.api_key) {
      return this.generateBasicHint(question.question_text, request.hint_type);
    }

    try {
      // Detect which AI provider based on key format
      if (request.api_key.startsWith('sk-ant-')) {
        return await this.generateAnthropicHint(
          request.api_key,
          question.question_text,
          question.correct_answer,
          request.hint_type
        );
      } else if (request.api_key.startsWith('sk-')) {
        return await this.generateOpenAIHint(
          request.api_key,
          question.question_text,
          question.correct_answer,
          request.hint_type
        );
      } else {
        throw new ValidationError('Invalid API key format');
      }
    } catch (error) {
      logger.error('AI hint generation failed', { error });
      // Fallback to basic hint
      return this.generateBasicHint(question.question_text, request.hint_type);
    }
  }

  /**
   * Generate hint using OpenAI
   */
  private static async generateOpenAIHint(
    apiKey: string,
    questionText: string,
    correctAnswer: string,
    hintType: HintType
  ): Promise<string> {
    const prompt = this.buildPrompt(questionText, correctAnswer, hintType);

    const openai = new OpenAI({ apiKey });

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a cybersecurity training assistant helping students learn. Provide clear, concise, and educational hints.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });

    return completion.choices[0]?.message?.content || 'Unable to generate hint at this time.';
  }

  /**
   * Generate hint using Anthropic Claude
   */
  private static async generateAnthropicHint(
    apiKey: string,
    questionText: string,
    correctAnswer: string,
    hintType: HintType
  ): Promise<string> {
    const prompt = this.buildPrompt(questionText, correctAnswer, hintType);

    const anthropic = new Anthropic({ apiKey });

    const message = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 200,
      messages: [
        {
          role: 'user',
          content: `You are a cybersecurity training assistant. ${prompt}`,
        },
      ],
    });

    const content = message.content[0];
    return content.type === 'text' ? content.text : 'Unable to generate hint at this time.';
  }

  /**
   * Build prompt for AI
   */
  private static buildPrompt(
    questionText: string,
    correctAnswer: string,
    hintType: HintType
  ): string {
    switch (hintType) {
      case HintType.BASIC:
        return `Question: "${questionText}"\n\nProvide a brief hint (1-2 sentences) to help answer this cybersecurity question, without giving away the answer directly.`;

      case HintType.DETAILED:
        return `Question: "${questionText}"\nCorrect Answer: "${correctAnswer}"\n\nProvide a detailed hint (2-3 sentences) that guides toward the answer, explaining key concepts without revealing the exact answer.`;

      case HintType.EXPLANATION:
        return `Question: "${questionText}"\nCorrect Answer: "${correctAnswer}"\n\nProvide a comprehensive explanation of why this is the correct answer, including relevant cybersecurity concepts, best practices, and real-world context.`;

      default:
        return `Provide guidance for: "${questionText}"`;
    }
  }

  /**
   * Generate basic hint without AI
   */
  private static generateBasicHint(_questionText: string, hintType: HintType): string {
    switch (hintType) {
      case HintType.BASIC:
        return 'Think about the fundamental security principles: Confidentiality, Integrity, and Availability. Which one applies here?';

      case HintType.DETAILED:
        return 'Consider the context of the question. What security controls or compliance requirements are most relevant? Think about industry best practices.';

      case HintType.EXPLANATION:
        return 'This question tests your understanding of cybersecurity fundamentals. Review the key concepts and consider how they apply to real-world scenarios.';

      default:
        return 'Review the question carefully and consider the security implications.';
    }
  }

  /**
   * Generate explanation for an answer
   */
  static async explainAnswer(
    questionId: string,
    selectedAnswer: string,
    apiKey?: string
  ): Promise<string> {
    const question = await QuestionModel.findById(questionId);
    if (!question) {
      throw new NotFoundError('Question');
    }

    const isCorrect = selectedAnswer.trim().toLowerCase() ===
                      question.correct_answer.trim().toLowerCase();

    // Return stored explanation if available
    if (question.explanation) {
      return question.explanation;
    }

    // Generate AI explanation if key provided
    if (apiKey) {
      try {
        if (apiKey.startsWith('sk-ant-')) {
          return await this.generateAnthropicHint(
            apiKey,
            question.question_text,
            question.correct_answer,
            HintType.EXPLANATION
          );
        } else {
          return await this.generateOpenAIHint(
            apiKey,
            question.question_text,
            question.correct_answer,
            HintType.EXPLANATION
          );
        }
      } catch (error) {
        logger.error('AI explanation generation failed', { error });
      }
    }

    // Fallback explanation
    return isCorrect
      ? 'Correct! This answer aligns with cybersecurity best practices.'
      : `The correct answer is: ${question.correct_answer}. Review the related security concepts to understand why.`;
  }
}
