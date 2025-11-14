import { useState, useEffect } from 'react';
import { Question, HintType } from '../types';
import { X, Clock, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { aiService } from '../services/aiService';
import toast from 'react-hot-toast';
import { useGameStore } from '../store/gameStore';

interface QuestionModalProps {
  question: Question;
  timeLimit: number;
  onSubmit: (answer: string, timeTaken: number) => void;
  onClose: () => void;
}

export const QuestionModal: React.FC<QuestionModalProps> = ({
  question,
  timeLimit,
  onSubmit,
  onClose,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [timeRemaining, setTimeRemaining] = useState(timeLimit);
  const [hint, setHint] = useState<string>('');
  const [loadingHint, setLoadingHint] = useState(false);
  const aiApiKey = useGameStore((state) => state.aiApiKey);

  // All answer options (correct + distractors), shuffled
  const [answerOptions] = useState(() => {
    const options = [question.correct_answer, ...question.distractors];
    return options.sort(() => Math.random() - 0.5);
  });

  // Timer
  useEffect(() => {
    if (timeRemaining <= 0) {
      handleSubmit();
      return;
    }

    const timer = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining]);

  const handleSubmit = () => {
    const timeTaken = timeLimit - timeRemaining;
    if (!selectedAnswer) {
      toast.error('Please select an answer');
      return;
    }
    onSubmit(selectedAnswer, timeTaken);
  };

  const requestHint = async () => {
    if (loadingHint) return;

    setLoadingHint(true);
    try {
      const hintText = await aiService.getHint({
        question_id: question.id,
        hint_type: HintType.BASIC,
        api_key: aiApiKey || undefined,
      });
      setHint(hintText);
      toast.success('Hint received!');
    } catch (error) {
      console.error('Failed to get hint:', error);
    } finally {
      setLoadingHint(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <motion.div
        className="modal-content"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-start mb-6">
          <h2 className="text-2xl font-bold text-jeopardy-gold">
            ${question.point_value} Question
          </h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Timer */}
        <div className="flex items-center gap-2 mb-6 text-xl">
          <Clock className="w-6 h-6" />
          <span className={timeRemaining <= 10 ? 'text-red-500 font-bold' : ''}>
            {timeRemaining}s
          </span>
        </div>

        {/* Question */}
        <div className="bg-slate-700 rounded-lg p-6 mb-6">
          <p className="text-xl leading-relaxed">{question.question_text}</p>
        </div>

        {/* Answer options */}
        <div className="space-y-3 mb-6">
          {answerOptions.map((option, index) => (
            <button
              key={index}
              onClick={() => setSelectedAnswer(option)}
              className={`w-full p-4 rounded-lg text-left transition-all ${
                selectedAnswer === option
                  ? 'bg-jeopardy-blue border-2 border-jeopardy-gold'
                  : 'bg-slate-700 border-2 border-slate-600 hover:border-slate-500'
              }`}
            >
              <span className="font-semibold mr-2">
                {String.fromCharCode(65 + index)}.
              </span>
              {option}
            </button>
          ))}
        </div>

        {/* Hint section */}
        {hint && (
          <div className="bg-blue-900 border-2 border-blue-600 rounded-lg p-4 mb-6">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-5 h-5 text-yellow-400 mt-1" />
              <p className="text-sm">{hint}</p>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button onClick={requestHint} className="btn-secondary" disabled={loadingHint}>
            <Lightbulb className="w-4 h-4 inline mr-2" />
            {loadingHint ? 'Loading...' : 'Get Hint'}
          </button>
          <button
            onClick={handleSubmit}
            className="btn-primary flex-1"
            disabled={!selectedAnswer}
          >
            Submit Answer
          </button>
        </div>
      </motion.div>
    </div>
  );
};
