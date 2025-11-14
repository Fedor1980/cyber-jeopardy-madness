import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { GameBoard } from '../components/GameBoard';
import { Scoreboard } from '../components/Scoreboard';
import { QuestionModal } from '../components/QuestionModal';
import { ResultModal } from '../components/ResultModal';
import { useGameStore } from '../store/gameStore';
import { useGameLogic } from '../hooks/useGameLogic';
import { gameService } from '../services/gameService';
import { Question } from '../types';
import { ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export const GameScreen: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const [loading, setLoading] = useState(true);

  const {
    session,
    teams,
    categories,
    questions,
    currentQuestion,
    showQuestionModal,
    showResultModal,
    setSession,
    setTeams,
    setCategories,
    setQuestions,
    setAttemptedQuestions,
    setCurrentQuestion,
    setShowQuestionModal,
    setShowResultModal,
  } = useGameStore();

  const {
    answerResult,
    submitAnswer,
    nextTeam,
    isRoundComplete,
    advanceToNextRound,
  } = useGameLogic();

  // Load game data
  useEffect(() => {
    const loadGame = async () => {
      if (!sessionId) return;

      try {
        const [sessionData, boardData] = await Promise.all([
          gameService.getSession(sessionId),
          gameService.getGameBoard(sessionId, 1),
        ]);

        setSession(sessionData.session);
        setTeams(sessionData.teams);
        setCategories(boardData.categories);
        setQuestions(boardData.questions);
        setAttemptedQuestions(boardData.attemptedQuestions);
      } catch (error) {
        console.error('Failed to load game:', error);
        toast.error('Failed to load game');
      } finally {
        setLoading(false);
      }
    };

    loadGame();
  }, [sessionId]);

  const handleQuestionSelect = (question: Question) => {
    setCurrentQuestion(question);
    setShowQuestionModal(true);
  };

  const handleAnswerSubmit = async (answer: string, timeTaken: number) => {
    await submitAnswer(answer, timeTaken);
    await nextTeam();
  };

  const handleResultClose = () => {
    setShowResultModal(false);
  };

  const handleAdvanceRound = async () => {
    await advanceToNextRound();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-jeopardy-gold">Loading game...</div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl text-red-500">Session not found</div>
      </div>
    );
  }

  const roundComplete = isRoundComplete();

  return (
    <div className="min-h-screen p-4">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex justify-between items-center bg-gradient-to-r from-jeopardy-darkBlue to-jeopardy-blue rounded-xl p-6 border-4 border-jeopardy-gold">
          <div>
            <h1 className="text-3xl font-bold text-jeopardy-gold">
              {session.name}
            </h1>
            <p className="text-slate-300">
              Round {session.current_round} / Status: {session.status}
            </p>
          </div>
          {roundComplete && session.current_round < 3 && (
            <button onClick={handleAdvanceRound} className="btn-success">
              <ArrowRight className="w-5 h-5 inline mr-2" />
              Next Round
            </button>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Game Board */}
        <div className="lg:col-span-3">
          <GameBoard
            categories={categories}
            questions={questions.filter((q) => q.round === session.current_round)}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>

        {/* Scoreboard */}
        <div className="lg:col-span-1">
          <Scoreboard teams={teams} currentTeamId={session.current_team_id} />
        </div>
      </div>

      {/* Modals */}
      {showQuestionModal && currentQuestion && (
        <QuestionModal
          question={currentQuestion}
          timeLimit={session.settings.time_per_question}
          onSubmit={handleAnswerSubmit}
          onClose={() => setShowQuestionModal(false)}
        />
      )}

      {showResultModal && answerResult && (
        <ResultModal
          result={answerResult}
          showExplanation={session.settings.show_explanations}
          onClose={handleResultClose}
        />
      )}
    </div>
  );
};
