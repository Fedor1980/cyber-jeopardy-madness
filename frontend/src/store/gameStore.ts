import { create } from 'zustand';
import {
  GameSession,
  Team,
  Category,
  Question,
  GameRound,
  SessionStatus,
} from '../types';

interface GameState {
  // Session state
  session: GameSession | null;
  teams: Team[];
  categories: Category[];
  questions: Question[];
  attemptedQuestions: Set<string>;
  currentQuestion: Question | null;

  // UI state
  selectedQuestionId: string | null;
  showQuestionModal: boolean;
  showResultModal: boolean;
  showFinalJeopardyModal: boolean;
  showGameOverModal: boolean;

  // AI state
  aiApiKey: string | null;

  // Actions
  setSession: (session: GameSession) => void;
  setTeams: (teams: Team[]) => void;
  updateTeam: (team: Team) => void;
  setCategories: (categories: Category[]) => void;
  setQuestions: (questions: Question[]) => void;
  setAttemptedQuestions: (questionIds: string[]) => void;
  addAttemptedQuestion: (questionId: string) => void;
  setCurrentQuestion: (question: Question | null) => void;
  setSelectedQuestionId: (id: string | null) => void;
  setShowQuestionModal: (show: boolean) => void;
  setShowResultModal: (show: boolean) => void;
  setShowFinalJeopardyModal: (show: boolean) => void;
  setShowGameOverModal: (show: boolean) => void;
  setAiApiKey: (key: string | null) => void;
  advanceRound: () => void;
  reset: () => void;
}

export const useGameStore = create<GameState>((set) => ({
  // Initial state
  session: null,
  teams: [],
  categories: [],
  questions: [],
  attemptedQuestions: new Set(),
  currentQuestion: null,
  selectedQuestionId: null,
  showQuestionModal: false,
  showResultModal: false,
  showFinalJeopardyModal: false,
  showGameOverModal: false,
  aiApiKey: localStorage.getItem('ai_api_key'),

  // Actions
  setSession: (session) => set({ session }),

  setTeams: (teams) => set({ teams }),

  updateTeam: (updatedTeam) =>
    set((state) => ({
      teams: state.teams.map((team) =>
        team.id === updatedTeam.id ? updatedTeam : team
      ),
    })),

  setCategories: (categories) => set({ categories }),

  setQuestions: (questions) => set({ questions }),

  setAttemptedQuestions: (questionIds) =>
    set({ attemptedQuestions: new Set(questionIds) }),

  addAttemptedQuestion: (questionId) =>
    set((state) => ({
      attemptedQuestions: new Set([...state.attemptedQuestions, questionId]),
    })),

  setCurrentQuestion: (question) => set({ currentQuestion: question }),

  setSelectedQuestionId: (id) => set({ selectedQuestionId: id }),

  setShowQuestionModal: (show) => set({ showQuestionModal: show }),

  setShowResultModal: (show) => set({ showResultModal: show }),

  setShowFinalJeopardyModal: (show) => set({ showFinalJeopardyModal: show }),

  setShowGameOverModal: (show) => set({ showGameOverModal: show }),

  setAiApiKey: (key) => {
    if (key) {
      localStorage.setItem('ai_api_key', key);
    } else {
      localStorage.removeItem('ai_api_key');
    }
    set({ aiApiKey: key });
  },

  advanceRound: () =>
    set((state) => {
      if (!state.session) return state;

      let newRound: GameRound;
      let newStatus: SessionStatus;

      switch (state.session.current_round) {
        case GameRound.ROUND_1:
          newRound = GameRound.ROUND_2;
          newStatus = SessionStatus.ROUND_2;
          break;
        case GameRound.ROUND_2:
          newRound = GameRound.FINAL_JEOPARDY;
          newStatus = SessionStatus.FINAL_JEOPARDY;
          break;
        default:
          return state;
      }

      return {
        session: {
          ...state.session,
          current_round: newRound,
          status: newStatus,
        },
      };
    }),

  reset: () =>
    set({
      session: null,
      teams: [],
      categories: [],
      questions: [],
      attemptedQuestions: new Set(),
      currentQuestion: null,
      selectedQuestionId: null,
      showQuestionModal: false,
      showResultModal: false,
      showFinalJeopardyModal: false,
      showGameOverModal: false,
    }),
}));
