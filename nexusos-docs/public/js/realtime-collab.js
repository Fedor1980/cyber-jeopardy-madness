/**
 * Real-Time Collaboration for NexusOS Documentation Platform
 *
 * WebSocket-based real-time features: live cursors, presence, instant updates
 * Works with Socket.IO, native WebSocket, or long-polling fallback
 */

class RealtimeCollaboration {
  constructor(config = {}) {
    this.config = {
      websocketUrl: config.websocketUrl || this.getDefaultWebSocketUrl(),
      enablePresence: config.enablePresence !== false,
      enableLiveCursors: config.enableLiveCursors !== false,
      enableLiveUpdates: config.enableLiveUpdates !== false,
      enableTypingIndicators: config.enableTypingIndicators !== false,
      enableActivityFeed: config.enableActivityFeed !== false,
      currentUser: config.currentUser || this.getAnonymousUser(),
      reconnectAttempts: config.reconnectAttempts || 5,
      reconnectDelay: config.reconnectDelay || 2000,
      heartbeatInterval: config.heartbeatInterval || 30000,
      useSocketIO: config.useSocketIO !== false,
      fallbackToPolling: config.fallbackToPolling !== false,
      pollingInterval: config.pollingInterval || 5000
    };

    this.socket = null;
    this.connected = false;
    this.reconnectCount = 0;
    this.heartbeatTimer = null;
    this.currentPage = this.getPageId();
    this.activeUsers = new Map();
    this.cursors = new Map();
    this.recentActivity = [];

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  async setup() {
    this.injectStyles();

    // Try WebSocket connection
    await this.connect();

    // Setup UI components
    if (this.config.enablePresence) {
      this.createPresenceIndicator();
    }

    if (this.config.enableActivityFeed) {
      this.createActivityFeed();
    }

    // Setup event listeners
    this.setupEventListeners();

    this.log('Real-time Collaboration initialized');
  }

  async connect() {
    if (this.config.useSocketIO && window.io) {
      await this.connectSocketIO();
    } else {
      await this.connectWebSocket();
    }

    if (!this.connected && this.config.fallbackToPolling) {
      this.log('WebSocket failed, falling back to polling');
      this.startPolling();
    }
  }

  async connectSocketIO() {
    try {
      this.socket = io(this.config.websocketUrl, {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: this.config.reconnectAttempts,
        reconnectionDelay: this.config.reconnectDelay
      });

      this.socket.on('connect', () => this.onConnect());
      this.socket.on('disconnect', () => this.onDisconnect());
      this.socket.on('user-joined', (data) => this.onUserJoined(data));
      this.socket.on('user-left', (data) => this.onUserLeft(data));
      this.socket.on('cursor-move', (data) => this.onCursorMove(data));
      this.socket.on('content-update', (data) => this.onContentUpdate(data));
      this.socket.on('typing', (data) => this.onTyping(data));
      this.socket.on('activity', (data) => this.onActivity(data));

      this.connected = true;
    } catch (error) {
      this.log('Socket.IO connection failed', error);
      this.connected = false;
    }
  }

  async connectWebSocket() {
    try {
      this.socket = new WebSocket(this.config.websocketUrl);

      this.socket.onopen = () => this.onConnect();
      this.socket.onclose = () => this.onDisconnect();
      this.socket.onerror = (error) => this.log('WebSocket error', error);
      this.socket.onmessage = (event) => this.handleMessage(event);

      this.connected = true;
    } catch (error) {
      this.log('WebSocket connection failed', error);
      this.connected = false;
    }
  }

  onConnect() {
    this.log('Connected to real-time server');
    this.connected = true;
    this.reconnectCount = 0;

    // Join current page room
    this.send('join-page', {
      pageId: this.currentPage,
      user: this.config.currentUser
    });

    // Start heartbeat
    this.startHeartbeat();

    // Update UI
    this.updateConnectionStatus(true);
  }

  onDisconnect() {
    this.log('Disconnected from real-time server');
    this.connected = false;

    // Stop heartbeat
    this.stopHeartbeat();

    // Update UI
    this.updateConnectionStatus(false);

    // Attempt reconnection
    if (this.reconnectCount < this.config.reconnectAttempts) {
      setTimeout(() => {
        this.reconnectCount++;
        this.log(`Reconnection attempt ${this.reconnectCount}`);
        this.connect();
      }, this.config.reconnectDelay);
    }
  }

  handleMessage(event) {
    try {
      const message = JSON.parse(event.data);
      const { type, data } = message;

      switch (type) {
        case 'user-joined':
          this.onUserJoined(data);
          break;
        case 'user-left':
          this.onUserLeft(data);
          break;
        case 'cursor-move':
          this.onCursorMove(data);
          break;
        case 'content-update':
          this.onContentUpdate(data);
          break;
        case 'typing':
          this.onTyping(data);
          break;
        case 'activity':
          this.onActivity(data);
          break;
        default:
          this.log('Unknown message type:', type);
      }
    } catch (error) {
      this.log('Failed to parse message', error);
    }
  }

  send(type, data) {
    if (!this.connected || !this.socket) {
      this.log('Cannot send, not connected');
      return;
    }

    const message = { type, data, timestamp: Date.now() };

    if (this.config.useSocketIO && this.socket.emit) {
      this.socket.emit(type, data);
    } else if (this.socket.send) {
      this.socket.send(JSON.stringify(message));
    }
  }

  onUserJoined(data) {
    const { user } = data;
    this.activeUsers.set(user.id, user);

    this.log('User joined:', user.name);

    // Update presence UI
    this.updatePresenceUI();

    // Show notification
    this.showNotification(`${user.name} joined the page`, 'join');

    // Add to activity feed
    this.addActivity({
      type: 'join',
      user: user,
      timestamp: Date.now()
    });
  }

  onUserLeft(data) {
    const { userId } = data;
    const user = this.activeUsers.get(userId);

    if (user) {
      this.activeUsers.delete(userId);
      this.cursors.delete(userId);

      this.log('User left:', user.name);

      // Update presence UI
      this.updatePresenceUI();

      // Remove cursor
      this.removeCursor(userId);

      // Add to activity feed
      this.addActivity({
        type: 'leave',
        user: user,
        timestamp: Date.now()
      });
    }
  }

  onCursorMove(data) {
    const { userId, x, y } = data;

    if (userId === this.config.currentUser.id) return;

    this.cursors.set(userId, { x, y, timestamp: Date.now() });
    this.updateCursor(userId, x, y);
  }

  onContentUpdate(data) {
    const { userId, type, content } = data;

    if (userId === this.config.currentUser.id) return;

    this.log('Content update:', type, content);

    // Handle different update types
    switch (type) {
      case 'comment':
        this.handleCommentUpdate(content);
        break;
      case 'edit':
        this.handleContentEdit(content);
        break;
      case 'annotation':
        this.handleAnnotationUpdate(content);
        break;
    }

    // Add to activity feed
    const user = this.activeUsers.get(userId);
    if (user) {
      this.addActivity({
        type: 'update',
        user: user,
        updateType: type,
        timestamp: Date.now()
      });
    }
  }

  onTyping(data) {
    const { userId, isTyping } = data;

    if (userId === this.config.currentUser.id) return;

    const user = this.activeUsers.get(userId);
    if (!user) return;

    if (isTyping) {
      this.showTypingIndicator(user);
    } else {
      this.hideTypingIndicator(userId);
    }
  }

  onActivity(data) {
    this.addActivity(data);
  }

  createPresenceIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'realtime-presence-indicator';
    indicator.innerHTML = `
      <div class="presence-avatars" title="Active users">
        <div class="presence-count">0</div>
      </div>
    `;

    document.body.appendChild(indicator);

    // Click to show details
    indicator.addEventListener('click', () => {
      this.showPresencePanel();
    });
  }

  updatePresenceUI() {
    const indicator = document.querySelector('.realtime-presence-indicator');
    if (!indicator) return;

    const count = this.activeUsers.size;
    const countEl = indicator.querySelector('.presence-count');

    if (countEl) {
      countEl.textContent = count;
      countEl.classList.toggle('has-users', count > 0);
    }

    // Update avatars
    const avatarsContainer = indicator.querySelector('.presence-avatars');
    const existingAvatars = avatarsContainer.querySelectorAll('.user-avatar');

    // Remove old avatars
    existingAvatars.forEach(avatar => {
      if (!this.activeUsers.has(avatar.dataset.userId)) {
        avatar.remove();
      }
    });

    // Add new avatars
    this.activeUsers.forEach((user, userId) => {
      if (!avatarsContainer.querySelector(`[data-user-id="${userId}"]`)) {
        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.dataset.userId = userId;
        avatar.title = user.name;
        avatar.style.background = this.getUserColor(userId);

        if (user.avatar) {
          avatar.style.backgroundImage = `url(${user.avatar})`;
          avatar.style.backgroundSize = 'cover';
        } else {
          avatar.textContent = user.name.charAt(0).toUpperCase();
        }

        avatarsContainer.insertBefore(avatar, countEl);
      }
    });
  }

  showPresencePanel() {
    const panel = document.createElement('div');
    panel.className = 'presence-panel';
    panel.innerHTML = `
      <div class="presence-panel-header">
        <h3>👥 Active Users (${this.activeUsers.size})</h3>
        <button class="close-panel-btn">✕</button>
      </div>
      <div class="presence-panel-body">
        ${Array.from(this.activeUsers.values()).map(user => `
          <div class="presence-user-item">
            <div class="user-avatar-large" style="background: ${this.getUserColor(user.id)}">
              ${user.avatar ? `<img src="${user.avatar}" alt="${user.name}">` : user.name.charAt(0)}
            </div>
            <div class="user-info">
              <div class="user-name">${user.name}</div>
              <div class="user-status">Viewing this page</div>
            </div>
            <div class="user-indicator active"></div>
          </div>
        `).join('')}
      </div>
    `;

    document.body.appendChild(panel);

    const closeBtn = panel.querySelector('.close-panel-btn');
    closeBtn.addEventListener('click', () => {
      panel.remove();
    });

    // Close on outside click
    panel.addEventListener('click', (e) => {
      if (e.target === panel) {
        panel.remove();
      }
    });
  }

  updateCursor(userId, x, y) {
    if (!this.config.enableLiveCursors) return;

    const user = this.activeUsers.get(userId);
    if (!user) return;

    let cursorEl = document.querySelector(`[data-cursor-id="${userId}"]`);

    if (!cursorEl) {
      cursorEl = document.createElement('div');
      cursorEl.className = 'realtime-cursor';
      cursorEl.dataset.cursorId = userId;
      cursorEl.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 20 20" fill="${this.getUserColor(userId)}">
          <path d="M0 0l6 18 4-8 8-4z"/>
        </svg>
        <div class="cursor-label">${user.name}</div>
      `;
      document.body.appendChild(cursorEl);
    }

    cursorEl.style.left = `${x}px`;
    cursorEl.style.top = `${y}px`;
    cursorEl.style.display = 'block';

    // Hide cursor after inactivity
    clearTimeout(cursorEl.hideTimeout);
    cursorEl.hideTimeout = setTimeout(() => {
      cursorEl.style.display = 'none';
    }, 5000);
  }

  removeCursor(userId) {
    const cursorEl = document.querySelector(`[data-cursor-id="${userId}"]`);
    if (cursorEl) {
      cursorEl.remove();
    }
  }

  showTypingIndicator(user) {
    let indicator = document.querySelector(`.typing-indicator[data-user-id="${user.id}"]`);

    if (!indicator) {
      indicator = document.createElement('div');
      indicator.className = 'typing-indicator';
      indicator.dataset.userId = user.id;
      indicator.textContent = `${user.name} is typing...`;

      const container = document.querySelector('.collaboration-container') || document.body;
      container.appendChild(indicator);
    }
  }

  hideTypingIndicator(userId) {
    const indicator = document.querySelector(`.typing-indicator[data-user-id="${userId}"]`);
    if (indicator) {
      indicator.remove();
    }
  }

  createActivityFeed() {
    const feed = document.createElement('button');
    feed.className = 'realtime-activity-feed-btn';
    feed.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="8" stroke="currentColor" stroke-width="2"/>
        <path d="M10 6v4l3 2" stroke="currentColor" stroke-width="2"/>
      </svg>
      ${this.recentActivity.length > 0 ? `<span class="activity-badge">${this.recentActivity.length}</span>` : ''}
    `;
    feed.title = 'Recent Activity';

    document.body.appendChild(feed);

    feed.addEventListener('click', () => {
      this.showActivityPanel();
    });
  }

  showActivityPanel() {
    const panel = document.createElement('div');
    panel.className = 'activity-panel';
    panel.innerHTML = `
      <div class="activity-panel-header">
        <h3>🕐 Recent Activity</h3>
        <button class="close-panel-btn">✕</button>
      </div>
      <div class="activity-panel-body">
        ${this.recentActivity.length === 0 ? '<p class="no-activity">No recent activity</p>' : ''}
        ${this.recentActivity.slice(0, 50).map(activity => this.renderActivity(activity)).join('')}
      </div>
    `;

    document.body.appendChild(panel);

    const closeBtn = panel.querySelector('.close-panel-btn');
    closeBtn.addEventListener('click', () => {
      panel.remove();
    });
  }

  renderActivity(activity) {
    const icon = this.getActivityIcon(activity.type);
    const time = this.formatTimeAgo(activity.timestamp);

    return `
      <div class="activity-item">
        <div class="activity-icon">${icon}</div>
        <div class="activity-content">
          <div class="activity-text">${this.getActivityText(activity)}</div>
          <div class="activity-time">${time}</div>
        </div>
      </div>
    `;
  }

  getActivityIcon(type) {
    const icons = {
      'join': '👋',
      'leave': '👋',
      'update': '✏️',
      'comment': '💬',
      'like': '❤️'
    };
    return icons[type] || '📌';
  }

  getActivityText(activity) {
    const userName = activity.user?.name || 'Someone';

    switch (activity.type) {
      case 'join':
        return `${userName} joined the page`;
      case 'leave':
        return `${userName} left the page`;
      case 'update':
        return `${userName} made an update`;
      case 'comment':
        return `${userName} added a comment`;
      default:
        return `${userName} performed an action`;
    }
  }

  addActivity(activity) {
    this.recentActivity.unshift(activity);

    // Keep only last 100 activities
    if (this.recentActivity.length > 100) {
      this.recentActivity = this.recentActivity.slice(0, 100);
    }

    // Update badge
    const badge = document.querySelector('.activity-badge');
    if (badge) {
      badge.textContent = this.recentActivity.length;
    }
  }

  setupEventListeners() {
    // Track cursor movement
    if (this.config.enableLiveCursors) {
      let cursorTimeout;

      document.addEventListener('mousemove', (e) => {
        clearTimeout(cursorTimeout);

        cursorTimeout = setTimeout(() => {
          this.send('cursor-move', {
            userId: this.config.currentUser.id,
            x: e.clientX + window.scrollX,
            y: e.clientY + window.scrollY
          });
        }, 100);
      });
    }

    // Track typing in inputs/textareas
    if (this.config.enableTypingIndicators) {
      document.addEventListener('input', (e) => {
        if (e.target.matches('textarea, input[type="text"]')) {
          this.sendTypingIndicator(true);

          clearTimeout(this.typingTimeout);
          this.typingTimeout = setTimeout(() => {
            this.sendTypingIndicator(false);
          }, 2000);
        }
      });
    }

    // Page visibility change
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.send('user-inactive', { userId: this.config.currentUser.id });
      } else {
        this.send('user-active', { userId: this.config.currentUser.id });
      }
    });

    // Unload event
    window.addEventListener('beforeunload', () => {
      this.send('leave-page', {
        pageId: this.currentPage,
        userId: this.config.currentUser.id
      });
    });
  }

  sendTypingIndicator(isTyping) {
    this.send('typing', {
      userId: this.config.currentUser.id,
      isTyping: isTyping
    });
  }

  startHeartbeat() {
    this.heartbeatTimer = setInterval(() => {
      this.send('heartbeat', {
        userId: this.config.currentUser.id,
        pageId: this.currentPage
      });
    }, this.config.heartbeatInterval);
  }

  stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }

  startPolling() {
    this.pollingTimer = setInterval(async () => {
      try {
        const response = await fetch(`/api/presence/${this.currentPage}`);
        const data = await response.json();

        // Update active users
        this.activeUsers.clear();
        data.users.forEach(user => {
          this.activeUsers.set(user.id, user);
        });

        this.updatePresenceUI();
      } catch (error) {
        this.log('Polling failed', error);
      }
    }, this.config.pollingInterval);
  }

  updateConnectionStatus(connected) {
    const indicator = document.querySelector('.realtime-presence-indicator');
    if (indicator) {
      indicator.classList.toggle('connected', connected);
      indicator.classList.toggle('disconnected', !connected);
    }
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `realtime-notification ${type}`;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.classList.add('show');
    }, 10);

    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  handleCommentUpdate(content) {
    // Trigger event for collaboration module
    document.dispatchEvent(new CustomEvent('realtime-comment', {
      detail: content
    }));
  }

  handleContentEdit(content) {
    document.dispatchEvent(new CustomEvent('realtime-edit', {
      detail: content
    }));
  }

  handleAnnotationUpdate(content) {
    document.dispatchEvent(new CustomEvent('realtime-annotation', {
      detail: content
    }));
  }

  getDefaultWebSocketUrl() {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    return `${protocol}//${window.location.host}/ws`;
  }

  getPageId() {
    return window.location.pathname;
  }

  getAnonymousUser() {
    const id = localStorage.getItem('anonymous-user-id') || this.generateId();
    localStorage.setItem('anonymous-user-id', id);

    return {
      id: id,
      name: 'Anonymous ' + id.substring(0, 4),
      avatar: null
    };
  }

  getUserColor(userId) {
    const colors = [
      '#6366f1', '#ec4899', '#10b981', '#f59e0b',
      '#8b5cf6', '#14b8a6', '#f43f5e', '#3b82f6'
    ];

    const hash = userId.split('').reduce((acc, char) => {
      return char.charCodeAt(0) + ((acc << 5) - acc);
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatTimeAgo(timestamp) {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;

    return new Date(timestamp).toLocaleDateString();
  }

  injectStyles() {
    if (document.getElementById('realtime-collab-styles')) return;

    const style = document.createElement('style');
    style.id = 'realtime-collab-styles';
    style.textContent = `
      .realtime-presence-indicator {
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 998;
        cursor: pointer;
      }

      .presence-avatars {
        display: flex;
        align-items: center;
        gap: 4px;
        padding: 8px;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 20px;
        transition: all 0.2s;
      }

      .realtime-presence-indicator.connected {
        border-color: #10b981;
      }

      .realtime-presence-indicator.disconnected {
        border-color: #ef4444;
        opacity: 0.5;
      }

      .user-avatar {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 12px;
        border: 2px solid white;
      }

      .presence-count {
        min-width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: var(--color-accent, #6366f1);
        color: white;
        border-radius: 12px;
        font-size: 12px;
        font-weight: bold;
        padding: 0 8px;
      }

      .presence-count.has-users {
        background: #10b981;
      }

      .realtime-cursor {
        position: absolute;
        pointer-events: none;
        z-index: 9999;
        transition: all 0.1s ease-out;
      }

      .cursor-label {
        position: absolute;
        top: 20px;
        left: 10px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 4px 8px;
        border-radius: 4px;
        font-size: 12px;
        white-space: nowrap;
      }

      .typing-indicator {
        position: fixed;
        bottom: 20px;
        left: 20px;
        padding: 8px 16px;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 20px;
        font-size: 13px;
        color: var(--color-text-secondary, #94a3b8);
        animation: fadeIn 0.3s;
      }

      .realtime-notification {
        position: fixed;
        top: 80px;
        right: 20px;
        padding: 12px 20px;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        opacity: 0;
        transform: translateX(100%);
        transition: all 0.3s;
      }

      .realtime-notification.show {
        opacity: 1;
        transform: translateX(0);
      }

      .presence-panel,
      .activity-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 350px;
        height: 100vh;
        background: var(--color-bg-secondary, #1e293b);
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
        z-index: 10001;
        display: flex;
        flex-direction: column;
      }

      .presence-panel-header,
      .activity-panel-header {
        padding: 20px;
        border-bottom: 1px solid var(--color-border, #334155);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .presence-panel-body,
      .activity-panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .presence-user-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px;
        background: var(--color-bg-primary, #0f172a);
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .user-avatar-large {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
      }

      .user-avatar-large img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }

      .user-info {
        flex: 1;
      }

      .user-name {
        font-weight: 600;
        margin-bottom: 2px;
      }

      .user-status {
        font-size: 12px;
        color: var(--color-text-secondary, #64748b);
      }

      .user-indicator {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: #10b981;
      }

      .realtime-activity-feed-btn {
        position: fixed;
        bottom: 2rem;
        left: 2rem;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        color: var(--color-text-primary, #f1f5f9);
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 999;
      }

      .activity-badge {
        position: absolute;
        top: -5px;
        right: -5px;
        background: #ef4444;
        color: white;
        font-size: 11px;
        font-weight: bold;
        padding: 3px 7px;
        border-radius: 12px;
      }

      .activity-item {
        display: flex;
        gap: 12px;
        padding: 12px;
        background: var(--color-bg-primary, #0f172a);
        border-radius: 8px;
        margin-bottom: 8px;
      }

      .activity-icon {
        font-size: 20px;
      }

      .activity-content {
        flex: 1;
      }

      .activity-text {
        font-size: 14px;
        margin-bottom: 4px;
      }

      .activity-time {
        font-size: 12px;
        color: var(--color-text-secondary, #64748b);
      }

      @keyframes fadeIn {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
      }

      @media (max-width: 768px) {
        .presence-panel,
        .activity-panel {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  log(...args) {
    console.log('[RealtimeCollab]', ...args);
  }
}

// Auto-initialize
window.realtimeCollab = new RealtimeCollaboration(window.realtimeConfig || {});
window.RealtimeCollaboration = RealtimeCollaboration;

/*
<script>
window.realtimeConfig = {
  websocketUrl: 'wss://your-server.com/ws',
  currentUser: {
    id: 'user123',
    name: 'John Doe',
    avatar: '/avatars/john.jpg'
  },
  enablePresence: true,
  enableLiveCursors: true,
  enableLiveUpdates: true,
  enableTypingIndicators: true,
  enableActivityFeed: true,
  useSocketIO: true  // or use native WebSocket
};
</script>
<script src="/js/realtime-collab.js"></script>
*/
