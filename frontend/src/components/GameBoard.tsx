import { Category, Question } from '../types';
import { useGameStore } from '../store/gameStore';

interface GameBoardProps {
  categories: Category[];
  questions: Question[];
  onQuestionSelect: (question: Question) => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  categories,
  questions,
  onQuestionSelect,
}) => {
  const attemptedQuestions = useGameStore((state) => state.attemptedQuestions);

  // Group questions by category
  const questionsByCategory = categories.map((category) => ({
    category,
    questions: questions
      .filter((q) => q.category_id === category.id)
      .sort((a, b) => a.point_value - b.point_value),
  }));

  return (
    <div className="w-full max-w-7xl mx-auto p-4">
      <div className="grid grid-cols-6 gap-2">
        {/* Category headers */}
        {categories.map((category) => (
          <div key={category.id} className="jeopardy-category">
            <span className="text-shadow">{category.name}</span>
          </div>
        ))}

        {/* Question tiles */}
        {[0, 1, 2, 3, 4].map((rowIndex) => (
          questionsByCategory.map(({ questions: catQuestions }) => {
            const question = catQuestions[rowIndex];
            if (!question) return <div key={`empty-${rowIndex}`} />;

            const isAttempted = attemptedQuestions.has(question.id);

            return (
              <button
                key={question.id}
                onClick={() => !isAttempted && onQuestionSelect(question)}
                className={`jeopardy-tile ${isAttempted ? 'jeopardy-tile-used' : ''}`}
                disabled={isAttempted}
              >
                <span className="text-shadow">
                  ${question.point_value}
                </span>
              </button>
            );
          })
        ))}
      </div>
    </div>
  );
};
