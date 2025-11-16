/**
 * AI-Powered Chatbot Assistant for NexusOS Documentation
 * Layer 15: Intelligent documentation assistant
 *
 * Features:
 * - Context-aware responses
 * - Natural language understanding
 * - Code examples generation
 * - Multi-provider support (OpenAI, Anthropic, local models)
 * - Conversation history
 * - Suggested questions
 * - Copy code snippets
 * - Feedback system
 */

class AIChatbot {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'openai', // 'openai', 'anthropic', 'local'
      apiKey: config.apiKey || '',
      apiEndpoint: config.apiEndpoint || '',
      model: config.model || 'gpt-3.5-turbo',
      maxTokens: config.maxTokens || 500,
      temperature: config.temperature || 0.7,
      systemPrompt: config.systemPrompt || this.getDefaultSystemPrompt(),
      suggestedQuestions: config.suggestedQuestions || this.getDefaultQuestions(),
      position: config.position || 'bottom-right', // 'bottom-right', 'bottom-left'
      primaryColor: config.primaryColor || '#6366f1',
      enableFeedback: config.enableFeedback !== false,
      enableCodeCopy: config.enableCodeCopy !== false,
      maxHistory: config.maxHistory || 10
    };

    this.messages = [];
    this.isOpen = false;
    this.isLoading = false;

    this.init();
  }

  init() {
    this.createChatInterface();
    this.loadHistory();
    this.setupEventListeners();

    console.log('[AI Chatbot] Initialized');
  }

  getDefaultSystemPrompt() {
    return `You are a helpful documentation assistant for NexusOS Documentation Platform.
Your role is to help users understand the documentation, find information quickly, and provide code examples.

Guidelines:
- Be concise and helpful
- Provide code examples when relevant
- Link to relevant documentation pages
- If you don't know something, admit it and suggest where to look
- Format code with markdown code blocks
- Be friendly and professional

Current page: ${window.location.pathname}
Documentation site: ${window.location.origin}`;
  }

  getDefaultQuestions() {
    return [
      "How do I get started?",
      "How do I add search to my docs?",
      "How do I enable dark mode?",
      "How do I deploy to GitHub Pages?",
      "Show me code examples"
    ];
  }

  createChatInterface() {
    const chatbot = document.createElement('div');
    chatbot.className = `ai-chatbot ${this.config.position}`;
    chatbot.innerHTML = `
      <!-- Chat Toggle Button -->
      <button class="chat-toggle-button" aria-label="Open AI assistant">
        <svg class="chat-icon" width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg class="close-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" style="display: none;">
          <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="notification-dot" style="display: none;"></span>
      </button>

      <!-- Chat Window -->
      <div class="chat-window" style="display: none;">
        <!-- Header -->
        <div class="chat-header">
          <div class="chat-header-content">
            <div class="bot-avatar">🤖</div>
            <div>
              <h3 class="chat-title">AI Assistant</h3>
              <p class="chat-status">Online • Ready to help</p>
            </div>
          </div>
          <button class="chat-minimize" aria-label="Minimize chat">
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M4 10h12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="chat-messages">
          <div class="welcome-message">
            <div class="bot-avatar-small">🤖</div>
            <div class="message-content">
              <p>Hi! I'm your AI documentation assistant. How can I help you today?</p>
              <div class="suggested-questions">
                ${this.config.suggestedQuestions.map(q => `
                  <button class="suggested-question" data-question="${q}">${q}</button>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Input -->
        <div class="chat-input-container">
          <textarea
            class="chat-input"
            placeholder="Ask me anything about the documentation..."
            rows="1"
            aria-label="Chat message"
          ></textarea>
          <button class="chat-send" aria-label="Send message" disabled>
            <svg width="20" height="20" viewBox="0 0 20 20">
              <path d="M18 2L9 11M18 2l-6 16-3-7-7-3 16-6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- Powered by -->
        <div class="chat-footer">
          <small>Powered by ${this.config.provider === 'openai' ? 'OpenAI' : this.config.provider === 'anthropic' ? 'Claude' : 'AI'}</small>
        </div>
      </div>
    `;

    document.body.appendChild(chatbot);
    this.chatbot = chatbot;
    this.injectStyles();
  }

  setupEventListeners() {
    const toggleBtn = this.chatbot.querySelector('.chat-toggle-button');
    const minimizeBtn = this.chatbot.querySelector('.chat-minimize');
    const sendBtn = this.chatbot.querySelector('.chat-send');
    const input = this.chatbot.querySelector('.chat-input');

    // Toggle chat
    toggleBtn.addEventListener('click', () => this.toggleChat());
    minimizeBtn.addEventListener('click', () => this.toggleChat());

    // Send message
    sendBtn.addEventListener('click', () => this.sendMessage());

    // Input handling
    input.addEventListener('input', (e) => {
      sendBtn.disabled = !e.target.value.trim();

      // Auto-resize textarea
      e.target.style.height = 'auto';
      e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        if (e.target.value.trim()) {
          this.sendMessage();
        }
      }
    });

    // Suggested questions
    this.chatbot.addEventListener('click', (e) => {
      if (e.target.classList.contains('suggested-question')) {
        const question = e.target.getAttribute('data-question');
        input.value = question;
        sendBtn.disabled = false;
        this.sendMessage();
      }

      // Copy code button
      if (e.target.closest('.copy-code-btn')) {
        const btn = e.target.closest('.copy-code-btn');
        const code = btn.parentElement.querySelector('code').textContent;
        navigator.clipboard.writeText(code);
        btn.textContent = '✓ Copied';
        setTimeout(() => btn.textContent = 'Copy', 2000);
      }

      // Feedback buttons
      if (e.target.closest('.feedback-btn')) {
        const btn = e.target.closest('.feedback-btn');
        const messageId = btn.closest('.assistant-message').dataset.messageId;
        const isPositive = btn.classList.contains('positive');
        this.submitFeedback(messageId, isPositive);
      }
    });
  }

  toggleChat() {
    this.isOpen = !this.isOpen;

    const chatWindow = this.chatbot.querySelector('.chat-window');
    const chatIcon = this.chatbot.querySelector('.chat-icon');
    const closeIcon = this.chatbot.querySelector('.close-icon');

    if (this.isOpen) {
      chatWindow.style.display = 'flex';
      chatIcon.style.display = 'none';
      closeIcon.style.display = 'block';
      this.chatbot.querySelector('.chat-input').focus();
      this.hideNotification();
    } else {
      chatWindow.style.display = 'none';
      chatIcon.style.display = 'block';
      closeIcon.style.display = 'none';
    }
  }

  async sendMessage() {
    const input = this.chatbot.querySelector('.chat-input');
    const sendBtn = this.chatbot.querySelector('.chat-send');
    const userMessage = input.value.trim();

    if (!userMessage || this.isLoading) return;

    // Add user message to UI
    this.addMessage('user', userMessage);

    // Clear input
    input.value = '';
    input.style.height = 'auto';
    sendBtn.disabled = true;

    // Show loading
    this.isLoading = true;
    const loadingId = this.addMessage('assistant', '...', true);

    try {
      // Get AI response
      const response = await this.getAIResponse(userMessage);

      // Remove loading message
      this.removeMessage(loadingId);

      // Add AI response
      this.addMessage('assistant', response);

      // Save to history
      this.saveToHistory();

    } catch (error) {
      console.error('[AI Chatbot] Error:', error);

      // Remove loading
      this.removeMessage(loadingId);

      // Show error
      this.addMessage('assistant', 'Sorry, I encountered an error. Please try again.');
    } finally {
      this.isLoading = false;
    }
  }

  async getAIResponse(userMessage) {
    // Add message to conversation history
    this.messages.push({
      role: 'user',
      content: userMessage
    });

    // Prepare messages for API
    const apiMessages = [
      { role: 'system', content: this.config.systemPrompt },
      ...this.messages.slice(-this.config.maxHistory)
    ];

    // Call appropriate provider
    let response;

    if (this.config.provider === 'openai') {
      response = await this.callOpenAI(apiMessages);
    } else if (this.config.provider === 'anthropic') {
      response = await this.callAnthropic(apiMessages);
    } else if (this.config.provider === 'local' || this.config.apiEndpoint) {
      response = await this.callCustomAPI(apiMessages);
    } else {
      throw new Error('No AI provider configured');
    }

    // Add response to history
    this.messages.push({
      role: 'assistant',
      content: response
    });

    return response;
  }

  async callOpenAI(messages) {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.config.apiKey}`
      },
      body: JSON.stringify({
        model: this.config.model,
        messages: messages,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error('OpenAI API error');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(messages) {
    // Extract system prompt
    const systemPrompt = messages.find(m => m.role === 'system')?.content || '';
    const conversationMessages = messages.filter(m => m.role !== 'system');

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: this.config.model || 'claude-3-haiku-20240307',
        max_tokens: this.config.maxTokens,
        system: systemPrompt,
        messages: conversationMessages
      })
    });

    if (!response.ok) {
      throw new Error('Anthropic API error');
    }

    const data = await response.json();
    return data.content[0].text;
  }

  async callCustomAPI(messages) {
    const response = await fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messages: messages,
        model: this.config.model,
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature
      })
    });

    if (!response.ok) {
      throw new Error('Custom API error');
    }

    const data = await response.json();
    return data.response || data.message || data.content;
  }

  addMessage(role, content, isLoading = false) {
    const messagesContainer = this.chatbot.querySelector('.chat-messages');
    const messageId = `msg-${Date.now()}`;

    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${role}-message ${isLoading ? 'loading' : ''}`;
    messageDiv.dataset.messageId = messageId;

    if (role === 'user') {
      messageDiv.innerHTML = `
        <div class="message-content">
          <p>${this.escapeHTML(content)}</p>
        </div>
        <div class="user-avatar">👤</div>
      `;
    } else {
      const formattedContent = this.formatMarkdown(content);

      messageDiv.innerHTML = `
        <div class="bot-avatar-small">🤖</div>
        <div class="message-content">
          ${formattedContent}
          ${this.config.enableFeedback && !isLoading ? `
            <div class="message-feedback">
              <button class="feedback-btn positive" title="Helpful">👍</button>
              <button class="feedback-btn negative" title="Not helpful">👎</button>
            </div>
          ` : ''}
        </div>
      `;
    }

    messagesContainer.appendChild(messageDiv);

    // Scroll to bottom
    messagesContainer.scrollTop = messagesContainer.scrollHeight;

    return messageId;
  }

  removeMessage(messageId) {
    const message = this.chatbot.querySelector(`[data-message-id="${messageId}"]`);
    if (message) {
      message.remove();
    }
  }

  formatMarkdown(text) {
    // Simple markdown formatting
    // Code blocks
    text = text.replace(/```(\w+)?\n([\s\S]*?)```/g, (match, lang, code) => {
      return `
        <div class="code-block">
          ${this.config.enableCodeCopy ? '<button class="copy-code-btn">Copy</button>' : ''}
          <pre><code class="language-${lang || 'text'}">${this.escapeHTML(code.trim())}</code></pre>
        </div>
      `;
    });

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Bold
    text = text.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');

    // Italic
    text = text.replace(/\*([^*]+)\*/g, '<em>$1</em>');

    // Links
    text = text.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // Paragraphs
    text = text.split('\n\n').map(p => `<p>${p.trim()}</p>`).join('');

    return text;
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  submitFeedback(messageId, isPositive) {
    // Send feedback to analytics
    if (window.analytics) {
      window.analytics.track('chatbot_feedback', {
        message_id: messageId,
        feedback: isPositive ? 'positive' : 'negative'
      });
    }

    // Update UI
    const message = this.chatbot.querySelector(`[data-message-id="${messageId}"]`);
    const feedbackButtons = message.querySelectorAll('.feedback-btn');

    feedbackButtons.forEach(btn => btn.disabled = true);

    // Show thank you message
    const feedbackDiv = message.querySelector('.message-feedback');
    feedbackDiv.innerHTML = '<small style="color: #10b981;">Thanks for your feedback!</small>';
  }

  saveToHistory() {
    if (this.config.persistChoice !== false) {
      localStorage.setItem('chatbot-history', JSON.stringify(this.messages.slice(-this.config.maxHistory)));
    }
  }

  loadHistory() {
    try {
      const history = localStorage.getItem('chatbot-history');
      if (history) {
        this.messages = JSON.parse(history);
      }
    } catch (e) {
      console.error('[AI Chatbot] Error loading history:', e);
    }
  }

  clearHistory() {
    this.messages = [];
    localStorage.removeItem('chatbot-history');

    // Clear UI
    const messagesContainer = this.chatbot.querySelector('.chat-messages');
    messagesContainer.innerHTML = `
      <div class="welcome-message">
        <div class="bot-avatar-small">🤖</div>
        <div class="message-content">
          <p>Hi! I'm your AI documentation assistant. How can I help you today?</p>
        </div>
      </div>
    `;
  }

  showNotification() {
    const dot = this.chatbot.querySelector('.notification-dot');
    dot.style.display = 'block';
  }

  hideNotification() {
    const dot = this.chatbot.querySelector('.notification-dot');
    dot.style.display = 'none';
  }

  injectStyles() {
    if (document.getElementById('chatbot-styles')) return;

    const style = document.createElement('style');
    style.id = 'chatbot-styles';
    style.textContent = `
      .ai-chatbot {
        position: fixed;
        z-index: 9999;
      }

      .ai-chatbot.bottom-right {
        bottom: 2rem;
        right: 2rem;
      }

      .ai-chatbot.bottom-left {
        bottom: 2rem;
        left: 2rem;
      }

      .chat-toggle-button {
        position: relative;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        background: ${this.config.primaryColor};
        border: none;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        transition: all 0.3s;
      }

      .chat-toggle-button:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
      }

      .notification-dot {
        position: absolute;
        top: 8px;
        right: 8px;
        width: 12px;
        height: 12px;
        background: #ef4444;
        border: 2px solid white;
        border-radius: 50%;
        animation: pulse 2s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }

      .chat-window {
        position: absolute;
        bottom: 80px;
        right: 0;
        width: 400px;
        height: 600px;
        background: white;
        border-radius: 16px;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .ai-chatbot.bottom-left .chat-window {
        left: 0;
        right: auto;
      }

      .chat-header {
        padding: 1rem 1.5rem;
        background: ${this.config.primaryColor};
        color: white;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .chat-header-content {
        display: flex;
        align-items: center;
        gap: 0.75rem;
      }

      .bot-avatar {
        font-size: 2rem;
        line-height: 1;
      }

      .chat-title {
        margin: 0;
        font-size: 1rem;
        font-weight: 600;
      }

      .chat-status {
        margin: 0;
        font-size: 0.75rem;
        opacity: 0.9;
      }

      .chat-minimize {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: rgba(255, 255, 255, 0.2);
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background 0.2s;
      }

      .chat-minimize:hover {
        background: rgba(255, 255, 255, 0.3);
      }

      .chat-messages {
        flex: 1;
        padding: 1.5rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        background: #f9fafb;
      }

      .message {
        display: flex;
        gap: 0.75rem;
        animation: messageSlideIn 0.3s;
      }

      @keyframes messageSlideIn {
        from {
          opacity: 0;
          transform: translateY(10px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }

      .user-message {
        flex-direction: row-reverse;
      }

      .message-content {
        flex: 1;
        padding: 0.75rem 1rem;
        border-radius: 12px;
        max-width: 80%;
      }

      .assistant-message .message-content {
        background: white;
        border: 1px solid #e5e7eb;
      }

      .user-message .message-content {
        background: ${this.config.primaryColor};
        color: white;
        margin-left: auto;
      }

      .bot-avatar-small {
        font-size: 1.5rem;
        line-height: 1;
      }

      .user-avatar {
        font-size: 1.5rem;
        line-height: 1;
      }

      .message-content p {
        margin: 0;
        line-height: 1.5;
      }

      .message-content code {
        background: rgba(0, 0, 0, 0.05);
        padding: 2px 6px;
        border-radius: 4px;
        font-family: monospace;
        font-size: 0.875rem;
      }

      .code-block {
        position: relative;
        margin: 0.5rem 0;
        border-radius: 8px;
        overflow: hidden;
      }

      .code-block pre {
        margin: 0;
        padding: 1rem;
        background: #1e293b;
        color: #e2e8f0;
        overflow-x: auto;
      }

      .copy-code-btn {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        padding: 0.25rem 0.5rem;
        background: rgba(255, 255, 255, 0.1);
        border: 1px solid rgba(255, 255, 255, 0.2);
        border-radius: 4px;
        color: white;
        font-size: 0.75rem;
        cursor: pointer;
        transition: background 0.2s;
      }

      .copy-code-btn:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .suggested-questions {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
      }

      .suggested-question {
        padding: 0.5rem 0.75rem;
        background: #f3f4f6;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        text-align: left;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .suggested-question:hover {
        background: #e5e7eb;
        border-color: ${this.config.primaryColor};
      }

      .message-feedback {
        display: flex;
        gap: 0.5rem;
        margin-top: 0.5rem;
        padding-top: 0.5rem;
        border-top: 1px solid #f3f4f6;
      }

      .feedback-btn {
        padding: 0.25rem 0.5rem;
        background: transparent;
        border: 1px solid #e5e7eb;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        transition: all 0.2s;
      }

      .feedback-btn:hover:not(:disabled) {
        background: #f9fafb;
        border-color: ${this.config.primaryColor};
      }

      .feedback-btn:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .loading .message-content {
        position: relative;
        padding-left: 3rem;
      }

      .loading .message-content::before {
        content: '';
        position: absolute;
        left: 1rem;
        top: 50%;
        transform: translateY(-50%);
        width: 24px;
        height: 24px;
        border: 2px solid #e5e7eb;
        border-top-color: ${this.config.primaryColor};
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: translateY(-50%) rotate(360deg); }
      }

      .chat-input-container {
        padding: 1rem;
        background: white;
        border-top: 1px solid #e5e7eb;
        display: flex;
        gap: 0.5rem;
      }

      .chat-input {
        flex: 1;
        padding: 0.75rem;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        font-family: inherit;
        font-size: 0.875rem;
        resize: none;
        max-height: 120px;
      }

      .chat-input:focus {
        outline: none;
        border-color: ${this.config.primaryColor};
      }

      .chat-send {
        width: 40px;
        height: 40px;
        border-radius: 8px;
        border: none;
        background: ${this.config.primaryColor};
        color: white;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
      }

      .chat-send:hover:not(:disabled) {
        background: ${this.adjustColor(this.config.primaryColor, -20)};
      }

      .chat-send:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      .chat-footer {
        padding: 0.5rem 1rem;
        background: #f9fafb;
        border-top: 1px solid #e5e7eb;
        text-align: center;
        color: #6b7280;
      }

      @media (max-width: 768px) {
        .chat-window {
          width: 100vw;
          height: 100vh;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 0;
        }

        .ai-chatbot.bottom-right,
        .ai-chatbot.bottom-left {
          bottom: 1rem;
          right: 1rem;
        }
      }
    `;

    document.head.appendChild(style);
  }

  adjustColor(color, amount) {
    const num = parseInt(color.replace('#', ''), 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
  }
}

// Auto-initialize if config is provided
if (window.chatbotConfig) {
  window.chatbot = new AIChatbot(window.chatbotConfig);
}

// Make class available globally
window.AIChatbot = AIChatbot;

/* Example Usage:

<script>
window.chatbotConfig = {
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo',
  position: 'bottom-right',
  primaryColor: '#6366f1',
  suggestedQuestions: [
    "How do I get started?",
    "Show me code examples",
    "How do I deploy?"
  ]
};
</script>
<script src="/js/ai-chatbot.js"></script>

*/
