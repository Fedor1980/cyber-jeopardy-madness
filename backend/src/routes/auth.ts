import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticate } from '../middleware/auth';
import { authLimiter } from '../middleware/rateLimiter';
import { asyncHandler } from '../middleware/errorHandler';

const router = Router();

// Public routes (with rate limiting)
router.post('/register', authLimiter, asyncHandler(AuthController.register));
router.post('/login', authLimiter, asyncHandler(AuthController.login));

// Protected routes
router.get('/me', authenticate, asyncHandler(AuthController.getCurrentUser));
router.post('/refresh', authenticate, asyncHandler(AuthController.refreshToken));

export default router;
