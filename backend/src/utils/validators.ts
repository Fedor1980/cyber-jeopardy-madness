import Joi from 'joi';
import {
  CreateSessionRequest,
  SubmitAnswerRequest,
  SubmitFinalJeopardyRequest,
  AIHintRequest,
  HintType,
  SessionSettings,
} from '../types';

// Session validation
export const createSessionSchema = Joi.object<CreateSessionRequest>({
  name: Joi.string().min(3).max(100).required(),
  industry_pack: Joi.string().required(),
  teams: Joi.array()
    .items(
      Joi.object({
        name: Joi.string().min(2).max(50).required(),
        color: Joi.string()
          .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
          .required(),
      })
    )
    .min(2)
    .max(6)
    .required(),
  settings: Joi.object<SessionSettings>({
    time_per_question: Joi.number().min(10).max(300).required(),
    show_explanations: Joi.boolean().required(),
    enable_ai_hints: Joi.boolean().required(),
    allow_negative_scores: Joi.boolean().required(),
  }).required(),
});

// Answer submission validation
export const submitAnswerSchema = Joi.object<SubmitAnswerRequest>({
  session_id: Joi.string().uuid().required(),
  team_id: Joi.string().uuid().required(),
  question_id: Joi.string().uuid().required(),
  selected_answer: Joi.string().min(1).max(500).required(),
  time_taken: Joi.number().min(0).required(),
});

// Final Jeopardy validation
export const submitFinalJeopardySchema = Joi.object<SubmitFinalJeopardyRequest>({
  session_id: Joi.string().uuid().required(),
  team_id: Joi.string().uuid().required(),
  wager_amount: Joi.number().min(0).required(),
  answer: Joi.string().min(1).max(500).required(),
});

// AI Hint validation
export const aiHintSchema = Joi.object<AIHintRequest>({
  question_id: Joi.string().uuid().required(),
  hint_type: Joi.string()
    .valid(...Object.values(HintType))
    .required(),
  api_key: Joi.string().optional(),
});

// User registration validation
export const registerUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128).required(),
  role: Joi.string().valid('admin', 'player', 'facilitator').default('player'),
});

// Login validation
export const loginSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().required(),
});

// Update session round validation
export const updateRoundSchema = Joi.object({
  session_id: Joi.string().uuid().required(),
  round: Joi.number().integer().min(1).max(3).required(),
});

// Validation middleware helper
export const validate = <T>(schema: Joi.ObjectSchema<T>) => {
  return (data: unknown): T => {
    const { error, value } = schema.validate(data, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      throw new Error(`Validation error: ${errorMessage}`);
    }

    return value as T;
  };
};
