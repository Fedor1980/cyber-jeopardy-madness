import { CheckCircle, XCircle, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { SubmitAnswerResponse } from '../types';

interface ResultModalProps {
  result: SubmitAnswerResponse;
  showExplanation: boolean;
  onClose: () => void;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  result,
  showExplanation,
  onClose,
}) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content max-w-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Result header */}
        <div className="text-center mb-8">
          {result.isCorrect ? (
            <>
              <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-green-500 mb-2">Correct!</h2>
              <p className="text-2xl text-jeopardy-gold">
                +${Math.abs(result.pointsAwarded)}
              </p>
            </>
          ) : (
            <>
              <XCircle className="w-24 h-24 text-red-500 mx-auto mb-4" />
              <h2 className="text-4xl font-bold text-red-500 mb-2">Incorrect</h2>
              <p className="text-2xl text-red-400">
                {result.pointsAwarded < 0 ? `-$${Math.abs(result.pointsAwarded)}` : '$0'}
              </p>
            </>
          )}
        </div>

        {/* Correct answer */}
        {!result.isCorrect && (
          <div className="bg-slate-700 rounded-lg p-4 mb-6">
            <p className="text-sm text-slate-400 mb-2">Correct Answer:</p>
            <p className="text-xl font-semibold text-green-400">
              {result.correctAnswer}
            </p>
          </div>
        )}

        {/* Explanation */}
        {showExplanation && result.explanation && (
          <div className="bg-blue-900 border-2 border-blue-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Info className="w-5 h-5 text-blue-400 mt-1" />
              <div>
                <p className="text-sm font-semibold text-blue-400 mb-2">
                  Explanation:
                </p>
                <p className="text-sm leading-relaxed">{result.explanation}</p>
              </div>
            </div>
          </div>
        )}

        {/* Team update */}
        <div className="bg-slate-700 rounded-lg p-4 mb-6">
          <p className="text-sm text-slate-400 mb-2">
            {result.updatedTeam.name} Score:
          </p>
          <p className="text-3xl font-bold text-jeopardy-gold">
            ${result.updatedTeam.score.toLocaleString()}
          </p>
        </div>

        <button onClick={onClose} className="btn-primary w-full">
          Continue
        </button>
      </motion.div>
    </div>
  );
};
