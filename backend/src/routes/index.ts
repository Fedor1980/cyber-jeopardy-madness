import { Router } from 'express';
import authRoutes from './auth';
import gameRoutes from './game';
import aiRoutes from './ai';
import { checkDatabaseHealth } from '../config/database';

const router = Router();

// Health check endpoint
router.get('/health', async (_req, res) => {
  const dbHealthy = await checkDatabaseHealth();

  res.status(dbHealthy ? 200 : 503).json({
    status: dbHealthy ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    database: dbHealthy ? 'connected' : 'disconnected',
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/game', gameRoutes);
router.use('/ai', aiRoutes);

export default router;
