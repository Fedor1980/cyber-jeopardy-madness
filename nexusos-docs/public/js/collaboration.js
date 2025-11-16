/**
 * Collaboration Features for NexusOS Documentation Platform
 *
 * Enables team collaboration with comments, annotations, mentions, and suggestions
 * Perfect for teams working on documentation together
 */

class CollaborationManager {
  constructor(config = {}) {
    this.config = {
      apiEndpoint: config.apiEndpoint || '/api/collaboration',
      enableComments: config.enableComments !== false,
      enableAnnotations: config.enableAnnotations !== false,
      enableSuggestions: config.enableSuggestions !== false,
      enableMentions: config.enableMentions !== false,
      enableReactions: config.enableReactions !== false,
      currentUser: config.currentUser || this.getAnonymousUser(),
      moderators: config.moderators || [],
      storageKey: 'nexusos-collab-data',
      autoSave: config.autoSave !== false,
      maxCommentLength: config.maxCommentLength || 5000
    };

    this.comments = [];
    this.annotations = [];
    this.suggestions = [];
    this.activeThread = null;

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

    // Load existing data
    await this.loadCollaborationData();

    // Setup features
    if (this.config.enableComments) {
      this.setupCommentSystem();
    }

    if (this.config.enableAnnotations) {
      this.setupAnnotations();
    }

    if (this.config.enableSuggestions) {
      this.setupSuggestions();
    }

    this.log('Collaboration Manager initialized');
  }

  async loadCollaborationData() {
    const pageId = this.getPageId();

    try {
      // Try to load from API
      const response = await fetch(`${this.config.apiEndpoint}/page/${pageId}`);

      if (response.ok) {
        const data = await response.json();
        this.comments = data.comments || [];
        this.annotations = data.annotations || [];
        this.suggestions = data.suggestions || [];
      } else {
        // Fallback to localStorage
        this.loadFromStorage();
      }
    } catch (error) {
      this.log('Failed to load from API, using localStorage', error);
      this.loadFromStorage();
    }
  }

  loadFromStorage() {
    try {
      const pageId = this.getPageId();
      const key = `${this.config.storageKey}-${pageId}`;
      const data = localStorage.getItem(key);

      if (data) {
        const parsed = JSON.parse(data);
        this.comments = parsed.comments || [];
        this.annotations = parsed.annotations || [];
        this.suggestions = parsed.suggestions || [];
      }
    } catch (error) {
      this.log('Failed to load from storage', error);
    }
  }

  async saveCollaborationData() {
    const pageId = this.getPageId();
    const data = {
      pageId,
      comments: this.comments,
      annotations: this.annotations,
      suggestions: this.suggestions,
      lastUpdated: new Date().toISOString()
    };

    try {
      // Try to save to API
      const response = await fetch(`${this.config.apiEndpoint}/page/${pageId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('API save failed');
      }
    } catch (error) {
      this.log('API save failed, using localStorage', error);

      // Fallback to localStorage
      try {
        const key = `${this.config.storageKey}-${pageId}`;
        localStorage.setItem(key, JSON.stringify(data));
      } catch (storageError) {
        this.log('Failed to save to storage', storageError);
      }
    }
  }

  setupCommentSystem() {
    // Create floating comment button
    const commentBtn = document.createElement('button');
    commentBtn.className = 'collab-comment-btn';
    commentBtn.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <path d="M2 2h16v12H6l-4 4V2z" stroke="currentColor" stroke-width="2"/>
      </svg>
      ${this.comments.length > 0 ? `<span class="comment-count">${this.comments.length}</span>` : ''}
    `;
    commentBtn.title = 'Comments';

    document.body.appendChild(commentBtn);

    commentBtn.addEventListener('click', () => {
      this.openCommentPanel();
    });

    // Render existing comments on page
    this.renderPageComments();
  }

  openCommentPanel() {
    const panel = document.createElement('div');
    panel.className = 'collab-comment-panel';
    panel.innerHTML = `
      <div class="comment-panel-header">
        <h3>
          💬 Comments
          <span class="comment-count-badge">${this.comments.length}</span>
        </h3>
        <button class="close-panel-btn">✕</button>
      </div>

      <div class="comment-panel-tabs">
        <button class="tab-btn active" data-tab="all">All</button>
        <button class="tab-btn" data-tab="open">Open</button>
        <button class="tab-btn" data-tab="resolved">Resolved</button>
      </div>

      <div class="comment-panel-body">
        ${this.renderCommentsList()}
      </div>

      <div class="comment-panel-footer">
        <textarea class="new-comment-input" placeholder="Add a comment..." maxlength="${this.config.maxCommentLength}"></textarea>
        <div class="comment-actions">
          <button class="post-comment-btn">Post Comment</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    this.setupCommentPanelEvents(panel);

    // Animate in
    requestAnimationFrame(() => {
      panel.classList.add('active');
    });
  }

  renderCommentsList(filter = 'all') {
    let filteredComments = this.comments;

    if (filter === 'open') {
      filteredComments = this.comments.filter(c => !c.resolved);
    } else if (filter === 'resolved') {
      filteredComments = this.comments.filter(c => c.resolved);
    }

    if (filteredComments.length === 0) {
      return '<div class="no-comments">No comments yet. Be the first to comment!</div>';
    }

    return filteredComments.map(comment => this.renderComment(comment)).join('');
  }

  renderComment(comment) {
    const isAuthor = comment.author.id === this.config.currentUser.id;
    const canModerate = this.isModerator(this.config.currentUser.id);

    return `
      <div class="comment-thread ${comment.resolved ? 'resolved' : ''}" data-comment-id="${comment.id}">
        <div class="comment-item">
          <div class="comment-avatar">
            ${comment.author.avatar ? `<img src="${comment.author.avatar}" alt="${comment.author.name}">` : comment.author.name[0]}
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <strong class="comment-author">${comment.author.name}</strong>
              <span class="comment-time">${this.formatTimeAgo(comment.timestamp)}</span>
            </div>
            <div class="comment-body">${this.formatCommentText(comment.text)}</div>
            <div class="comment-footer">
              ${this.config.enableReactions ? this.renderReactions(comment) : ''}
              <button class="reply-btn" data-comment-id="${comment.id}">Reply</button>
              ${!comment.resolved ? `<button class="resolve-btn" data-comment-id="${comment.id}">Resolve</button>` : ''}
              ${isAuthor || canModerate ? `<button class="delete-btn" data-comment-id="${comment.id}">Delete</button>` : ''}
            </div>
          </div>
        </div>

        ${comment.replies && comment.replies.length > 0 ? `
          <div class="comment-replies">
            ${comment.replies.map(reply => this.renderReply(reply, comment.id)).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  renderReply(reply, parentId) {
    return `
      <div class="comment-item reply">
        <div class="comment-avatar">
          ${reply.author.avatar ? `<img src="${reply.author.avatar}" alt="${reply.author.name}">` : reply.author.name[0]}
        </div>
        <div class="comment-content">
          <div class="comment-header">
            <strong class="comment-author">${reply.author.name}</strong>
            <span class="comment-time">${this.formatTimeAgo(reply.timestamp)}</span>
          </div>
          <div class="comment-body">${this.formatCommentText(reply.text)}</div>
        </div>
      </div>
    `;
  }

  renderReactions(comment) {
    const reactions = comment.reactions || {};
    const userReaction = comment.userReaction || null;

    return `
      <div class="comment-reactions">
        <button class="reaction-btn ${userReaction === '👍' ? 'active' : ''}" data-reaction="👍">
          👍 ${reactions['👍'] || ''}
        </button>
        <button class="reaction-btn ${userReaction === '❤️' ? 'active' : ''}" data-reaction="❤️">
          ❤️ ${reactions['❤️'] || ''}
        </button>
        <button class="reaction-btn ${userReaction === '🎉' ? 'active' : ''}" data-reaction="🎉">
          🎉 ${reactions['🎉'] || ''}
        </button>
      </div>
    `;
  }

  setupCommentPanelEvents(panel) {
    const closeBtn = panel.querySelector('.close-panel-btn');
    const postBtn = panel.querySelector('.post-comment-btn');
    const input = panel.querySelector('.new-comment-input');
    const tabBtns = panel.querySelectorAll('.tab-btn');

    // Close panel
    const closePanel = () => {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    };

    closeBtn.addEventListener('click', closePanel);

    // Post comment
    postBtn.addEventListener('click', () => {
      const text = input.value.trim();
      if (text) {
        this.addComment(text);
        input.value = '';
        this.refreshCommentPanel(panel);
      }
    });

    // Enter to post (Ctrl+Enter for multiline)
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        postBtn.click();
      }
    });

    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.tab;
        const body = panel.querySelector('.comment-panel-body');
        body.innerHTML = this.renderCommentsList(filter);
        this.setupCommentActions(body);
      });
    });

    // Setup comment actions
    this.setupCommentActions(panel.querySelector('.comment-panel-body'));
  }

  setupCommentActions(container) {
    // Reply buttons
    container.querySelectorAll('.reply-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.target.dataset.commentId;
        this.showReplyInput(commentId, container);
      });
    });

    // Resolve buttons
    container.querySelectorAll('.resolve-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.target.dataset.commentId;
        this.resolveComment(commentId);
        this.refreshCommentPanel(container.closest('.collab-comment-panel'));
      });
    });

    // Delete buttons
    container.querySelectorAll('.delete-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const commentId = e.target.dataset.commentId;
        if (confirm('Delete this comment?')) {
          this.deleteComment(commentId);
          this.refreshCommentPanel(container.closest('.collab-comment-panel'));
        }
      });
    });

    // Reaction buttons
    if (this.config.enableReactions) {
      container.querySelectorAll('.reaction-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const thread = e.target.closest('.comment-thread');
          const commentId = thread.dataset.commentId;
          const reaction = e.target.dataset.reaction;
          this.toggleReaction(commentId, reaction);
          this.refreshCommentPanel(container.closest('.collab-comment-panel'));
        });
      });
    }
  }

  addComment(text, parentId = null) {
    const comment = {
      id: this.generateId(),
      text: text,
      author: this.config.currentUser,
      timestamp: new Date().toISOString(),
      resolved: false,
      reactions: {},
      replies: []
    };

    if (parentId) {
      const parent = this.comments.find(c => c.id === parentId);
      if (parent) {
        parent.replies.push(comment);
      }
    } else {
      this.comments.push(comment);
    }

    this.saveCollaborationData();
  }

  resolveComment(commentId) {
    const comment = this.comments.find(c => c.id === commentId);
    if (comment) {
      comment.resolved = true;
      this.saveCollaborationData();
    }
  }

  deleteComment(commentId) {
    this.comments = this.comments.filter(c => c.id !== commentId);
    this.saveCollaborationData();
  }

  toggleReaction(commentId, reaction) {
    const comment = this.comments.find(c => c.id === commentId);
    if (!comment) return;

    comment.reactions = comment.reactions || {};

    // Toggle reaction
    if (comment.userReaction === reaction) {
      comment.reactions[reaction] = Math.max(0, (comment.reactions[reaction] || 0) - 1);
      comment.userReaction = null;
    } else {
      // Remove old reaction
      if (comment.userReaction) {
        comment.reactions[comment.userReaction] = Math.max(0, (comment.reactions[comment.userReaction] || 0) - 1);
      }
      // Add new reaction
      comment.reactions[reaction] = (comment.reactions[reaction] || 0) + 1;
      comment.userReaction = reaction;
    }

    this.saveCollaborationData();
  }

  setupAnnotations() {
    // Allow users to select text and add annotations
    document.addEventListener('mouseup', (e) => {
      const selection = window.getSelection();
      const text = selection.toString().trim();

      if (text.length > 0 && !e.target.closest('.annotation-popup')) {
        this.showAnnotationPopup(selection, text);
      }
    });

    // Render existing annotations
    this.renderAnnotations();
  }

  showAnnotationPopup(selection, text) {
    // Remove existing popup
    const existingPopup = document.querySelector('.annotation-popup');
    if (existingPopup) existingPopup.remove();

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();

    const popup = document.createElement('div');
    popup.className = 'annotation-popup';
    popup.style.top = `${rect.bottom + window.scrollY + 10}px`;
    popup.style.left = `${rect.left + window.scrollX}px`;
    popup.innerHTML = `
      <button class="annotate-btn" title="Add annotation">
        📝 Annotate
      </button>
      <button class="suggest-btn" title="Suggest edit">
        ✏️ Suggest
      </button>
    `;

    document.body.appendChild(popup);

    popup.querySelector('.annotate-btn').addEventListener('click', () => {
      this.createAnnotation(text, range);
      popup.remove();
    });

    popup.querySelector('.suggest-btn').addEventListener('click', () => {
      this.createSuggestion(text, range);
      popup.remove();
    });

    // Close on click outside
    setTimeout(() => {
      document.addEventListener('click', function closePopup(e) {
        if (!popup.contains(e.target)) {
          popup.remove();
          document.removeEventListener('click', closePopup);
        }
      });
    }, 100);
  }

  createAnnotation(text, range) {
    const note = prompt('Add your annotation:');
    if (!note) return;

    const annotation = {
      id: this.generateId(),
      text: text,
      note: note,
      author: this.config.currentUser,
      timestamp: new Date().toISOString(),
      xpath: this.getXPath(range.commonAncestorContainer)
    };

    this.annotations.push(annotation);
    this.saveCollaborationData();
    this.renderAnnotations();
  }

  createSuggestion(originalText, range) {
    const suggested = prompt('Suggest replacement text:', originalText);
    if (!suggested || suggested === originalText) return;

    const suggestion = {
      id: this.generateId(),
      original: originalText,
      suggested: suggested,
      author: this.config.currentUser,
      timestamp: new Date().toISOString(),
      status: 'pending', // pending, accepted, rejected
      xpath: this.getXPath(range.commonAncestorContainer)
    };

    this.suggestions.push(suggestion);
    this.saveCollaborationData();
    this.renderSuggestions();
  }

  renderAnnotations() {
    this.annotations.forEach(annotation => {
      // Find the text node and wrap it with annotation marker
      // This is a simplified version - production would need more robust text matching
    });
  }

  renderSuggestions() {
    // Similar to annotations
  }

  setupSuggestions() {
    // Render existing suggestions
    this.renderSuggestions();
  }

  renderPageComments() {
    // Show comment count indicators on the page
    const sections = document.querySelectorAll('h1, h2, h3');

    sections.forEach(section => {
      const sectionId = section.id;
      const sectionComments = this.comments.filter(c => c.sectionId === sectionId);

      if (sectionComments.length > 0) {
        const indicator = document.createElement('span');
        indicator.className = 'section-comment-indicator';
        indicator.textContent = sectionComments.length;
        indicator.title = `${sectionComments.length} comment${sectionComments.length > 1 ? 's' : ''}`;

        section.appendChild(indicator);
      }
    });
  }

  refreshCommentPanel(panel) {
    const activeTab = panel.querySelector('.tab-btn.active').dataset.tab;
    const body = panel.querySelector('.comment-panel-body');
    body.innerHTML = this.renderCommentsList(activeTab);
    this.setupCommentActions(body);

    // Update count badge
    panel.querySelector('.comment-count-badge').textContent = this.comments.length;
  }

  formatCommentText(text) {
    // Simple formatting with mention support
    let formatted = this.escapeHTML(text);

    if (this.config.enableMentions) {
      formatted = formatted.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
    }

    // URLs
    formatted = formatted.replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank">$1</a>');

    // Line breaks
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  }

  formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;

    return date.toLocaleDateString();
  }

  getPageId() {
    return window.location.pathname;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getAnonymousUser() {
    return {
      id: 'anonymous',
      name: 'Anonymous User',
      avatar: null
    };
  }

  isModerator(userId) {
    return this.config.moderators.includes(userId);
  }

  getXPath(node) {
    // Simplified XPath generation
    if (node.id) return `//*[@id="${node.id}"]`;

    let path = '';
    while (node && node.nodeType === Node.ELEMENT_NODE) {
      let index = 0;
      let sibling = node.previousSibling;

      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && sibling.nodeName === node.nodeName) {
          index++;
        }
        sibling = sibling.previousSibling;
      }

      const tagName = node.nodeName.toLowerCase();
      path = `/${tagName}[${index + 1}]${path}`;
      node = node.parentNode;
    }

    return path;
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  showReplyInput(commentId, container) {
    const thread = container.querySelector(`[data-comment-id="${commentId}"]`);
    const existing = thread.querySelector('.reply-input-container');

    if (existing) {
      existing.remove();
      return;
    }

    const replyInput = document.createElement('div');
    replyInput.className = 'reply-input-container';
    replyInput.innerHTML = `
      <textarea class="reply-input" placeholder="Write a reply..."></textarea>
      <div class="reply-actions">
        <button class="cancel-reply-btn">Cancel</button>
        <button class="post-reply-btn">Reply</button>
      </div>
    `;

    thread.appendChild(replyInput);

    const textarea = replyInput.querySelector('.reply-input');
    const postBtn = replyInput.querySelector('.post-reply-btn');
    const cancelBtn = replyInput.querySelector('.cancel-reply-btn');

    textarea.focus();

    postBtn.addEventListener('click', () => {
      const text = textarea.value.trim();
      if (text) {
        this.addComment(text, commentId);
        this.refreshCommentPanel(container.closest('.collab-comment-panel'));
      }
    });

    cancelBtn.addEventListener('click', () => {
      replyInput.remove();
    });
  }

  injectStyles() {
    if (document.getElementById('collaboration-styles')) return;

    const style = document.createElement('style');
    style.id = 'collaboration-styles';
    style.textContent = `
      /* Comment Button */
      .collab-comment-btn {
        position: fixed;
        bottom: 2rem;
        right: 6rem;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
        cursor: pointer;
        transition: all 0.3s;
        z-index: 999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .collab-comment-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(99, 102, 241, 0.5);
      }

      .collab-comment-btn .comment-count {
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

      /* Comment Panel */
      .collab-comment-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 450px;
        height: 100vh;
        background: var(--color-bg-secondary, #1e293b);
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
        z-index: 10000;
        display: flex;
        flex-direction: column;
        transform: translateX(100%);
        transition: transform 0.3s;
      }

      .collab-comment-panel.active {
        transform: translateX(0);
      }

      .comment-panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20px;
        border-bottom: 1px solid var(--color-border, #334155);
      }

      .comment-panel-header h3 {
        margin: 0;
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .comment-count-badge {
        background: var(--color-accent, #6366f1);
        color: white;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
      }

      .close-panel-btn {
        background: transparent;
        border: none;
        font-size: 24px;
        cursor: pointer;
        color: var(--color-text-secondary, #94a3b8);
      }

      .comment-panel-tabs {
        display: flex;
        gap: 8px;
        padding: 12px 20px;
        border-bottom: 1px solid var(--color-border, #334155);
      }

      .tab-btn {
        padding: 6px 16px;
        background: transparent;
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        color: var(--color-text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
      }

      .tab-btn.active {
        background: var(--color-accent, #6366f1);
        border-color: var(--color-accent, #6366f1);
        color: white;
      }

      .comment-panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .comment-thread {
        margin-bottom: 24px;
        padding: 16px;
        background: var(--color-bg-primary, #0f172a);
        border-radius: 8px;
      }

      .comment-thread.resolved {
        opacity: 0.6;
      }

      .comment-item {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }

      .comment-item.reply {
        margin-left: 40px;
        margin-top: 12px;
      }

      .comment-avatar {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: var(--color-accent, #6366f1);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        flex-shrink: 0;
      }

      .comment-avatar img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
      }

      .comment-content {
        flex: 1;
      }

      .comment-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 6px;
      }

      .comment-author {
        font-size: 14px;
      }

      .comment-time {
        font-size: 12px;
        color: var(--color-text-secondary, #64748b);
      }

      .comment-body {
        font-size: 14px;
        line-height: 1.6;
        margin-bottom: 8px;
      }

      .mention {
        color: var(--color-accent, #6366f1);
        font-weight: 500;
      }

      .comment-footer {
        display: flex;
        align-items: center;
        gap: 12px;
        font-size: 13px;
      }

      .comment-footer button {
        padding: 4px 10px;
        background: transparent;
        border: 1px solid var(--color-border, #334155);
        border-radius: 4px;
        color: var(--color-text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
      }

      .comment-footer button:hover {
        border-color: var(--color-accent, #6366f1);
        color: var(--color-accent, #6366f1);
      }

      .comment-reactions {
        display: flex;
        gap: 4px;
      }

      .reaction-btn {
        padding: 4px 8px !important;
        background: var(--color-bg-secondary, #1e293b) !important;
      }

      .reaction-btn.active {
        background: var(--color-accent, #6366f1) !important;
        border-color: var(--color-accent, #6366f1) !important;
        color: white !important;
      }

      .comment-panel-footer {
        padding: 20px;
        border-top: 1px solid var(--color-border, #334155);
      }

      .new-comment-input {
        width: 100%;
        min-height: 80px;
        padding: 12px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        font-size: 14px;
        resize: vertical;
        margin-bottom: 12px;
      }

      .comment-actions {
        display: flex;
        justify-content: flex-end;
      }

      .post-comment-btn {
        padding: 8px 20px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }

      .reply-input-container {
        margin-top: 12px;
        padding: 12px;
        background: var(--color-bg-secondary, #1e293b);
        border-radius: 6px;
      }

      .reply-input {
        width: 100%;
        min-height: 60px;
        padding: 8px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 4px;
        font-size: 13px;
        resize: vertical;
        margin-bottom: 8px;
      }

      .reply-actions {
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }

      .post-reply-btn,
      .cancel-reply-btn {
        padding: 6px 14px;
        border: none;
        border-radius: 4px;
        font-size: 13px;
        cursor: pointer;
      }

      .post-reply-btn {
        background: var(--color-accent, #6366f1);
        color: white;
      }

      .cancel-reply-btn {
        background: transparent;
        color: var(--color-text-secondary, #94a3b8);
        border: 1px solid var(--color-border, #334155);
      }

      .no-comments {
        text-align: center;
        padding: 40px 20px;
        color: var(--color-text-secondary, #64748b);
      }

      /* Annotation Popup */
      .annotation-popup {
        position: absolute;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        padding: 8px;
        display: flex;
        gap: 4px;
        z-index: 9999;
      }

      .annotation-popup button {
        padding: 6px 12px;
        background: var(--color-bg-primary, #0f172a);
        border: 1px solid var(--color-border, #334155);
        border-radius: 4px;
        color: var(--color-text-primary, #f1f5f9);
        cursor: pointer;
        font-size: 13px;
        white-space: nowrap;
      }

      .annotation-popup button:hover {
        background: var(--color-accent, #6366f1);
        border-color: var(--color-accent, #6366f1);
      }

      /* Section Comment Indicator */
      .section-comment-indicator {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 20px;
        height: 20px;
        background: var(--color-accent, #6366f1);
        color: white;
        font-size: 11px;
        font-weight: bold;
        border-radius: 50%;
        margin-left: 8px;
        cursor: pointer;
      }

      /* Mobile */
      @media (max-width: 768px) {
        .collab-comment-panel {
          width: 100%;
        }

        .collab-comment-btn {
          right: 2rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  log(...args) {
    console.log('[Collaboration]', ...args);
  }
}

// Auto-initialize
if (window.collaborationConfig) {
  window.collaboration = new CollaborationManager(window.collaborationConfig);
} else {
  window.collaboration = new CollaborationManager();
}

window.CollaborationManager = CollaborationManager;

/*
<script>
window.collaborationConfig = {
  currentUser: {
    id: 'user123',
    name: 'John Doe',
    avatar: '/avatars/john.jpg'
  },
  enableComments: true,
  enableAnnotations: true,
  enableSuggestions: true,
  enableMentions: true,
  enableReactions: true,
  moderators: ['admin1', 'admin2']
};
</script>
<script src="/js/collaboration.js"></script>
*/
