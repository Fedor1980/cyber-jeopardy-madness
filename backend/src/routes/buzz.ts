import { Router } from 'express';
import { Request, Response } from 'express';
import { webSocketService } from '../services/WebSocketService';
import { SuccessResponse } from '../types';

const router = Router();

/**
 * Get buzz queue for a session
 */
router.get('/sessions/:sessionId/queue', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  const queue = webSocketService.getBuzzQueue(sessionId);

  const response: SuccessResponse<{ queue: typeof queue }> = {
    success: true,
    data: { queue },
  };

  res.status(200).json(response);
});

/**
 * Clear buzz queue for a session
 */
router.post('/sessions/:sessionId/clear', (req: Request, res: Response) => {
  const { sessionId } = req.params;
  webSocketService.clearBuzzQueue(sessionId);

  const response: SuccessResponse<{ message: string }> = {
    success: true,
    data: { message: 'Buzz queue cleared' },
  };

  res.status(200).json(response);
});

export default router;
