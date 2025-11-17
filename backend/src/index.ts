import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import 'express-async-errors';

import { config } from './config/env';
import { closeDatabase } from './config/database';
import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimiter';
import routes from './routes';
import { webSocketService } from './services/WebSocketService';

const app = express();
const httpServer = createServer(app);

// Initialize WebSocket server
webSocketService.initialize(httpServer);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: config.CORS_ORIGIN,
  credentials: true,
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compression
app.use(compression());

// Rate limiting
app.use(apiLimiter);

// API routes
app.use(`/api/${config.API_VERSION}`, routes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = httpServer.listen(config.PORT, () => {
  logger.info(`Server running on port ${config.PORT}`, {
    environment: config.NODE_ENV,
    apiVersion: config.API_VERSION,
    webSocket: 'enabled',
  });
});

// Graceful shutdown
const gracefulShutdown = async (signal: string): Promise<void> => {
  logger.info(`${signal} received, starting graceful shutdown`);

  server.close(async () => {
    logger.info('HTTP server closed');

    try {
      await closeDatabase();
      logger.info('Graceful shutdown completed');
      process.exit(0);
    } catch (error) {
      logger.error('Error during graceful shutdown', { error });
      process.exit(1);
    }
  });

  // Force shutdown after 30 seconds
  setTimeout(() => {
    logger.error('Forced shutdown due to timeout');
    process.exit(1);
  }, 30000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
