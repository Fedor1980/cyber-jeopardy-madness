// Frontend type definitions matching backend types

export interface Team {
  id: string;
  session_id: string;
  name: string;
  color: string;
  score: number;
  order_position: number;
  created_at: string;
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
  created_at: string;
  updated_at: string;
}

export enum SessionStatus {
  SETUP = 'setup',
  ROUND_1 = 'round_1',
  ROUND_2 = 'round_2',
  FINAL_JEOPARDY = 'final_jeopardy',
  COMPLETED = 'completed',
}

export enum GameRound {
  SETUP = 0,
  ROUND_1 = 1,
  ROUND_2 = 2,
  FINAL_JEOPARDY = 3,
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
  created_at: string;
}

export enum QuestionDifficulty {
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  EXPERT = 'expert',
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
}

export enum IndustryType {
  FEDERAL_CREDIT_UNION = 'federal_credit_union',
  FINANCE = 'finance',
  HEALTHCARE = 'healthcare',
  EDUCATION = 'education',
  MANUFACTURING = 'manufacturing',
  RETAIL = 'retail',
  CORPORATE = 'corporate',
}

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

export interface SubmitAnswerResponse {
  isCorrect: boolean;
  pointsAwarded: number;
  correctAnswer: string;
  explanation: string;
  updatedTeam: Team;
}

export interface GameBoardData {
  categories: Category[];
  questions: Question[];
  attemptedQuestions: string[];
}

export interface FinalJeopardyWager {
  session_id: string;
  team_id: string;
  wager_amount: number;
  answer: string;
}

export enum HintType {
  BASIC = 'basic',
  DETAILED = 'detailed',
  EXPLANATION = 'explanation',
}

export interface AIHintRequest {
  question_id: string;
  hint_type: HintType;
  api_key?: string;
}
