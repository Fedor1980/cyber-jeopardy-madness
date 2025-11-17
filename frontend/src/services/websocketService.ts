import { io, Socket } from 'socket.io-client';

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

type EventCallback = (data: any) => void;

class WebSocketService {
  private socket: Socket | null = null;
  private currentSessionId: string | null = null;
  private eventCallbacks: Map<string, Set<EventCallback>> = new Map();

  /**
   * Connect to WebSocket server
   */
  connect(url: string = import.meta.env.VITE_WS_URL || 'http://localhost:3001'): void {
    if (this.socket?.connected) {
      console.log('WebSocket already connected');
      return;
    }

    this.socket = io(url, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    });

    this.socket.on('connect', () => {
      console.log('WebSocket connected', this.socket?.id);

      // Rejoin session if previously connected
      if (this.currentSessionId) {
        this.joinSession(this.currentSessionId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('WebSocket disconnected', reason);
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket connection error', error);
    });

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Setup event listeners
   */
  private setupEventListeners(): void {
    if (!this.socket) return;

    this.socket.on('buzz_received', (data: BuzzEvent) => {
      this.emit('buzz_received', data);
    });

    this.socket.on('buzz_queue', (queue: BuzzEvent[]) => {
      this.emit('buzz_queue', queue);
    });

    this.socket.on('buzz_queue_cleared', () => {
      this.emit('buzz_queue_cleared', null);
    });

    this.socket.on('question_selected', (data) => {
      this.emit('question_selected', data);
    });

    this.socket.on('answer_result', (data) => {
      this.emit('answer_result', data);
    });

    this.socket.on('score_update', (data) => {
      this.emit('score_update', data);
    });

    this.socket.on('round_advanced', (data) => {
      this.emit('round_advanced', data);
    });

    this.socket.on('game_completed', (data) => {
      this.emit('game_completed', data);
    });

    this.socket.on('game_update', (data: GameEvent) => {
      this.emit('game_update', data);
    });
  }

  /**
   * Emit event to callbacks
   */
  private emit(event: string, data: any): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.forEach((callback) => callback(data));
    }
  }

  /**
   * Disconnect from WebSocket server
   */
  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentSessionId = null;
    }
  }

  /**
   * Join a game session
   */
  joinSession(sessionId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot join session: WebSocket not connected');
      return;
    }

    this.currentSessionId = sessionId;
    this.socket.emit('join_session', sessionId);
  }

  /**
   * Leave current game session
   */
  leaveSession(): void {
    if (!this.socket?.connected || !this.currentSessionId) {
      return;
    }

    this.socket.emit('leave_session', this.currentSessionId);
    this.currentSessionId = null;
  }

  /**
   * Send buzz-in event
   */
  buzzIn(sessionId: string, teamId: string, teamName: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot buzz in: WebSocket not connected');
      return;
    }

    this.socket.emit('buzz_in', {
      sessionId,
      teamId,
      teamName,
    });
  }

  /**
   * Clear buzz queue
   */
  clearBuzzes(sessionId: string): void {
    if (!this.socket?.connected) {
      console.warn('Cannot clear buzzes: WebSocket not connected');
      return;
    }

    this.socket.emit('clear_buzzes', sessionId);
  }

  /**
   * Send game event
   */
  sendGameEvent(event: GameEvent): void {
    if (!this.socket?.connected) {
      console.warn('Cannot send game event: WebSocket not connected');
      return;
    }

    this.socket.emit('game_event', event);
  }

  /**
   * Subscribe to an event
   */
  on(event: string, callback: EventCallback): () => void {
    if (!this.eventCallbacks.has(event)) {
      this.eventCallbacks.set(event, new Set());
    }

    this.eventCallbacks.get(event)!.add(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = this.eventCallbacks.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  /**
   * Unsubscribe from an event
   */
  off(event: string, callback: EventCallback): void {
    const callbacks = this.eventCallbacks.get(event);
    if (callbacks) {
      callbacks.delete(callback);
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  /**
   * Get current session ID
   */
  getCurrentSessionId(): string | null {
    return this.currentSessionId;
  }
}

// Export singleton instance
export const websocketService = new WebSocketService();
