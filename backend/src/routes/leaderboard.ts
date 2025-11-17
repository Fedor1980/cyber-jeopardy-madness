import { Router } from 'express';
import { LeaderboardController } from '../controllers/LeaderboardController';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Global leaderboard
router.get('/', asyncHandler(LeaderboardController.getGlobalLeaderboard));

// Session leaderboard
router.get('/sessions/:sessionId', asyncHandler(LeaderboardController.getSessionLeaderboard));

// Team stats
router.get('/teams/:teamId/stats', asyncHandler(LeaderboardController.getTeamStats));

// Industry pack stats
router.get('/industry/:industryPack/stats', asyncHandler(LeaderboardController.getIndustryPackStats));

export default router;
