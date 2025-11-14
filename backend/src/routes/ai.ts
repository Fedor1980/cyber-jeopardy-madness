import { Router } from 'express';
import { AIController } from '../controllers/AIController';
import { aiLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// AI endpoints (with stricter rate limiting)
router.post('/hint', aiLimiter, asyncHandler(AIController.getHint));
router.post('/explain/:questionId', aiLimiter, asyncHandler(AIController.getExplanation));

export default router;
