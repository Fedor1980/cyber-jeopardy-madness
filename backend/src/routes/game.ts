import { Router } from 'express';
import { GameController } from '../controllers/GameController';
import { optionalAuth } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Session management
router.post('/sessions', optionalAuth, asyncHandler(GameController.createSession));
router.get('/sessions/:sessionId', asyncHandler(GameController.getSession));

// Game board
router.get('/sessions/:sessionId/board', asyncHandler(GameController.getGameBoard));

// Questions
router.get('/questions/:questionId', asyncHandler(GameController.getQuestion));

// Gameplay
router.post('/answer', asyncHandler(GameController.submitAnswer));
router.post('/sessions/:sessionId/advance', asyncHandler(GameController.advanceRound));
router.post('/final-jeopardy', asyncHandler(GameController.submitFinalJeopardy));
router.post('/sessions/:sessionId/complete', asyncHandler(GameController.completeGame));

// Team management
router.patch('/sessions/:sessionId/current-team', asyncHandler(GameController.updateCurrentTeam));

export default router;
