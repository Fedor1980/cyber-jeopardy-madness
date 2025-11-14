import { useState, useCallback } from 'react';
import { useGameStore } from '../store/gameStore';
import { gameService } from '../services/gameService';
import { SubmitAnswerResponse } from '../types';
import toast from 'react-hot-toast';

export const useGameLogic = () => {
  const [loading, setLoading] = useState(false);
  const [answerResult, setAnswerResult] = useState<SubmitAnswerResponse | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(0);

  const {
    session,
    currentQuestion,
    setShowQuestionModal,
    setShowResultModal,
    updateTeam,
    addAttemptedQuestion,
  } = useGameStore();

  /**
   * Submit answer to a question
   */
  const submitAnswer = useCallback(
    async (selectedAnswer: string, timeTaken: number) => {
      if (!session || !currentQuestion) return;

      const currentTeam = useGameStore.getState().teams.find(
        (t) => t.id === session.current_team_id
      );

      if (!currentTeam) {
        toast.error('No current team selected');
        return;
      }

      setLoading(true);
      try {
        const result = await gameService.submitAnswer({
          session_id: session.id,
          team_id: currentTeam.id,
          question_id: currentQuestion.id,
          selected_answer: selectedAnswer,
          time_taken: timeTaken,
        });

        setAnswerResult(result);
        updateTeam(result.updatedTeam);
        addAttemptedQuestion(currentQuestion.id);
        setShowQuestionModal(false);
        setShowResultModal(true);

        if (result.isCorrect) {
          toast.success(`Correct! +${result.pointsAwarded} points`);
        } else {
          toast.error(`Incorrect. ${result.pointsAwarded} points`);
        }
      } catch (error) {
        console.error('Error submitting answer:', error);
      } finally {
        setLoading(false);
      }
    },
    [session, currentQuestion, setShowQuestionModal, setShowResultModal, updateTeam, addAttemptedQuestion]
  );

  /**
   * Move to next team
   */
  const nextTeam = useCallback(async () => {
    if (!session) return;

    const teams = useGameStore.getState().teams;
    const currentIndex = teams.findIndex((t) => t.id === session.current_team_id);
    const nextIndex = (currentIndex + 1) % teams.length;
    const nextTeamId = teams[nextIndex].id;

    try {
      await gameService.updateCurrentTeam(session.id, nextTeamId);
      useGameStore.getState().setSession({
        ...session,
        current_team_id: nextTeamId,
      });
    } catch (error) {
      console.error('Error updating current team:', error);
    }
  }, [session]);

  /**
   * Check if round is complete
   */
  const isRoundComplete = useCallback(() => {
    const { questions, attemptedQuestions } = useGameStore.getState();
    const currentRoundQuestions = questions.filter(
      (q) => q.round === session?.current_round
    );
    return currentRoundQuestions.every((q) => attemptedQuestions.has(q.id));
  }, [session]);

  /**
   * Advance to next round
   */
  const advanceToNextRound = useCallback(async () => {
    if (!session) return;

    setLoading(true);
    try {
      const updatedSession = await gameService.advanceRound(session.id);
      useGameStore.getState().setSession(updatedSession);

      // Load new round data
      const boardData = await gameService.getGameBoard(
        session.id,
        updatedSession.current_round
      );
      useGameStore.getState().setCategories(boardData.categories);
      useGameStore.getState().setQuestions(boardData.questions);
      useGameStore.getState().setAttemptedQuestions(boardData.attemptedQuestions);

      toast.success(`Advanced to Round ${updatedSession.current_round}`);
    } catch (error) {
      console.error('Error advancing round:', error);
    } finally {
      setLoading(false);
    }
  }, [session]);

  return {
    loading,
    answerResult,
    timeRemaining,
    setTimeRemaining,
    submitAnswer,
    nextTeam,
    isRoundComplete,
    advanceToNextRound,
  };
};
