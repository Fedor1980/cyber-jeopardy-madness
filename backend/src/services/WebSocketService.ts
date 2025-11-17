import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import { logger } from '../utils/logger';
import { config } from '../config/env';

interface BuzzEvent {
  sessionId: string;
  teamId: string;
  teamName: string;
  timestamp: number;
}

interface GameEvent {
  sessionId: string;
  type: 'question_selected' | 'answer_submitted' | 'round_advanced' | 'game_completed';
  data: any;
}

export class WebSocketService {
  private io: Server | null = null;
  private buzzQueue: Map<string, BuzzEvent[]> = new Map();

  /**
   * Initialize WebSocket server
   */
  initialize(httpServer: HTTPServer): void {
    this.io = new Server(httpServer, {
      cors: {
        origin: config.CORS_ORIGIN,
        methods: ['GET', 'POST'],
        credentials: true,
      },
      pingTimeout: 60000,
      pingInterval: 25000,
    });

    this.io.on('connection', (socket: Socket) => {
      logger.info('Client connected', { socketId: socket.id });

      this.setupEventHandlers(socket);

      socket.on('disconnect', (reason) => {
        logger.info('Client disconnected', { socketId: socket.id, reason });
      });
    });

    logger.info('WebSocket server initialized');
  }

  /**
   * Setup event handlers for a socket
   */
  private setupEventHandlers(socket: Socket): void {
    // Join session room
    socket.on('join_session', (sessionId: string) => {
      socket.join(`session:${sessionId}`);
      logger.info('Client joined session', { socketId: socket.id, sessionId });

      // Send current buzz queue
      const queue = this.buzzQueue.get(sessionId) || [];
      socket.emit('buzz_queue', queue);
    });

    // Leave session room
    socket.on('leave_session', (sessionId: string) => {
      socket.leave(`session:${sessionId}`);
      logger.info('Client left session', { socketId: socket.id, sessionId });
    });

    // Handle buzz-in
    socket.on('buzz_in', (data: { sessionId: string; teamId: string; teamName: string }) => {
      const buzzEvent: BuzzEvent = {
        ...data,
        timestamp: Date.now(),
      };

      // Add to queue
      if (!this.buzzQueue.has(data.sessionId)) {
        this.buzzQueue.set(data.sessionId, []);
      }
      this.buzzQueue.get(data.sessionId)!.push(buzzEvent);

      // Broadcast to all clients in session
      this.io?.to(`session:${data.sessionId}`).emit('buzz_received', buzzEvent);

      logger.info('Buzz received', buzzEvent);
    });

    // Clear buzz queue
    socket.on('clear_buzzes', (sessionId: string) => {
      this.buzzQueue.delete(sessionId);
      this.io?.to(`session:${sessionId}`).emit('buzz_queue_cleared');
      logger.info('Buzz queue cleared', { sessionId });
    });

    // Handle game events
    socket.on('game_event', (event: GameEvent) => {
      this.io?.to(`session:${event.sessionId}`).emit('game_update', event);
      logger.info('Game event broadcast', { type: event.type, sessionId: event.sessionId });
    });
  }

  /**
   * Broadcast question selected
   */
  broadcastQuestionSelected(sessionId: string, questionId: string, teamId: string): void {
    this.io?.to(`session:${sessionId}`).emit('question_selected', {
      questionId,
      teamId,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast answer result
   */
  broadcastAnswerResult(
    sessionId: string,
    teamId: string,
    isCorrect: boolean,
    pointsAwarded: number
  ): void {
    this.io?.to(`session:${sessionId}`).emit('answer_result', {
      teamId,
      isCorrect,
      pointsAwarded,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast score update
   */
  broadcastScoreUpdate(sessionId: string, teamId: string, newScore: number): void {
    this.io?.to(`session:${sessionId}`).emit('score_update', {
      teamId,
      newScore,
      timestamp: Date.now(),
    });
  }

  /**
   * Broadcast round advance
   */
  broadcastRoundAdvance(sessionId: string, newRound: number): void {
    this.io?.to(`session:${sessionId}`).emit('round_advanced', {
      round: newRound,
      timestamp: Date.now(),
    });

    // Clear buzz queue for new round
    this.buzzQueue.delete(sessionId);
  }

  /**
   * Broadcast game completion
   */
  broadcastGameComplete(sessionId: string, winner: { teamId: string; teamName: string; score: number }): void {
    this.io?.to(`session:${sessionId}`).emit('game_completed', {
      winner,
      timestamp: Date.now(),
    });
  }

  /**
   * Get buzz queue for session
   */
  getBuzzQueue(sessionId: string): BuzzEvent[] {
    return this.buzzQueue.get(sessionId) || [];
  }

  /**
   * Clear buzz queue for session
   */
  clearBuzzQueue(sessionId: string): void {
    this.buzzQueue.delete(sessionId);
  }

  /**
   * Get Socket.IO instance
   */
  getIO(): Server | null {
    return this.io;
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService();
