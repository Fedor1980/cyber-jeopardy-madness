// Core type definitions for the Cyber Jeopardy platform

export interface User {
  id: string;
  username: string;
  email: string;
  password_hash: string;
  role: UserRole;
  created_at: Date;
  updated_at: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  PLAYER = 'player',
  FACILITATOR = 'facilitator'
}

export interface Team {
  id: string;
  session_id: string;
  name: string;
  color: string;
  score: number;
  order_position: number;
  created_at: Date;
}

export interface GameSession {
  id: string;
  name: string;
  industry_pack: string;
  current_round: GameRound;
  current_team_id: string | null;
  status: SessionStatus;
  settings: SessionSettings;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export enum SessionStatus {
  SETUP = 'setup',
  ROUND_1 = 'round_1',
  ROUND_2 = 'round_2',
  FINAL_JEOPARDY = 'final_jeopardy',
  COMPLETED = 'completed'
}

export enum GameRound {
  SETUP = 0,
  ROUND_1 = 1,
  ROUND_2 = 2,
  FINAL_JEOPARDY = 3
}

export interface SessionSettings {
  time_per_question: number;
  show_explanations: boolean;
  enable_ai_hints: boolean;
  allow_negative_scores: boolean;
}

export interface Question {
  id: string;
  category_id: string;
  industry_pack: string;
  round: number;
  point_value: number;
  question_text: string;
  correct_answer: string;
  distractors: string[];
  explanation: string;
  compliance_reference: string | null;
  difficulty: QuestionDifficulty;
  learning_outcome: string;
  metadata: QuestionMetadata;
  created_at: Date;
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert'
}

export interface QuestionMetadata {
  tags: string[];
  source: string;
  last_updated: string;
}

export interface Category {
  id: string;
  name: string;
  industry_pack: string;
  round: number;
  description: string;
  order_position: number;
}

export interface IndustryPack {
  id: string;
  name: string;
  description: string;
  industry_type: IndustryType;
  compliance_frameworks: string[];
  icon: string;
  is_active: boolean;
  created_at: Date;
}

export enum IndustryType {
  FEDERAL_CREDIT_UNION = 'federal_credit_union',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  MANUFACTURING = 'manufacturing',
  RETAIL = 'retail',
  CORPORATE = 'corporate'
}

export interface QuestionAttempt {
  id: string;
  session_id: string;
  team_id: string;
  question_id: string;
  selected_answer: string;
  is_correct: boolean;
  points_awarded: number;
  time_taken: number;
  hint_used: boolean;
  created_at: Date;
}

export interface FinalJeopardyWager {
  id: string;
  session_id: string;
  team_id: string;
  wager_amount: number;
  answer: string | null;
  is_correct: boolean | null;
  created_at: Date;
}

export interface AIHintCache {
  id: string;
  question_id: string;
  hint_type: HintType;
  content: string;
  created_at: Date;
}

export enum HintType {
  BASIC = 'basic',
  DETAILED = 'detailed',
  EXPLANATION = 'explanation'
}

export interface AuditLog {
  id: string;
  user_id: string | null;
  action: string;
  resource_type: string;
  resource_id: string | null;
  details: Record<string, unknown>;
  ip_address: string;
  user_agent: string;
  created_at: Date;
}

// API Request/Response types
export interface CreateSessionRequest {
  name: string;
  industry_pack: string;
  teams: CreateTeamRequest[];
  settings: SessionSettings;
}

export interface CreateTeamRequest {
  name: string;
  color: string;
}

export interface SubmitAnswerRequest {
  session_id: string;
  team_id: string;
  question_id: string;
  selected_answer: string;
  time_taken: number;
}

export interface SubmitFinalJeopardyRequest {
  session_id: string;
  team_id: string;
  wager_amount: number;
  answer: string;
}

export interface AIHintRequest {
  question_id: string;
  hint_type: HintType;
  api_key?: string;
}

export interface GameBoardState {
  categories: Category[];
  questions: Question[];
  attempted_questions: Set<string>;
  current_team: Team | null;
  teams: Team[];
}

export interface ErrorResponse {
  error: string;
  message: string;
  code: string;
  details?: Record<string, unknown>;
}

export interface SuccessResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

// JWT Payload
export interface JWTPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat: number;
  exp: number;
}

// Environment variables
export interface EnvConfig {
  NODE_ENV: string;
  PORT: number;
  API_VERSION: string;
  DB_HOST: string;
  DB_PORT: number;
  DB_NAME: string;
  DB_USER: string;
  DB_PASSWORD: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  JWT_REFRESH_SECRET: string;
  JWT_REFRESH_EXPIRES_IN: string;
  CORS_ORIGIN: string;
  RATE_LIMIT_WINDOW_MS: number;
  RATE_LIMIT_MAX_REQUESTS: number;
  OPENAI_API_KEY?: string;
  ANTHROPIC_API_KEY?: string;
  LOG_LEVEL: string;
  BCRYPT_ROUNDS: number;
}
