/**
 * Interactive Code Playground for NexusOS Documentation Platform
 *
 * Allows users to run code examples directly in the documentation
 * Supports: JavaScript, Python, HTML/CSS/JS, and more
 */

class CodePlayground {
  constructor(config = {}) {
    this.config = {
      supportedLanguages: config.supportedLanguages || ['javascript', 'python', 'html', 'css'],
      enableSharing: config.enableSharing !== false,
      enableSaving: config.enableSaving !== false,
      enableFullscreen: config.enableFullscreen !== false,
      pythonRuntime: config.pythonRuntime || 'pyodide', // pyodide, skulpt, or API
      apiEndpoint: config.apiEndpoint || '',
      maxExecutionTime: config.maxExecutionTime || 5000,
      theme: config.theme || 'dark',
      autoConvertCodeBlocks: config.autoConvertCodeBlocks !== false,
      storageKey: 'nexusos-code-snippets'
    };

    this.activePlayground = null;
    this.pyodideLoaded = false;
    this.pyodide = null;
    this.savedSnippets = this.loadSnippets();

    this.init();
  }

  init() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.setup());
    } else {
      this.setup();
    }
  }

  setup() {
    this.injectStyles();

    if (this.config.autoConvertCodeBlocks) {
      this.convertCodeBlocks();
    }

    this.setupEventListeners();
    this.log('Code Playground initialized');
  }

  convertCodeBlocks() {
    // Find all code blocks and add "Try it" buttons
    const codeBlocks = document.querySelectorAll('pre code');

    codeBlocks.forEach((codeElement, index) => {
      const language = this.detectLanguage(codeElement);

      if (this.isSupported(language)) {
        const code = codeElement.textContent;
        const tryButton = this.createTryButton(code, language, index);

        // Insert button before the pre element
        const preElement = codeElement.parentElement;
        preElement.style.position = 'relative';
        preElement.insertBefore(tryButton, preElement.firstChild);
      }
    });
  }

  detectLanguage(codeElement) {
    // Check class names for language
    const classes = Array.from(codeElement.classList);

    for (const className of classes) {
      if (className.startsWith('language-')) {
        return className.replace('language-', '').toLowerCase();
      }
      if (className.startsWith('lang-')) {
        return className.replace('lang-', '').toLowerCase();
      }
    }

    // Check parent pre element
    const preClasses = Array.from(codeElement.parentElement.classList);
    for (const className of preClasses) {
      if (className.startsWith('language-')) {
        return className.replace('language-', '').toLowerCase();
      }
    }

    return 'plaintext';
  }

  isSupported(language) {
    const normalized = this.normalizeLanguage(language);
    return this.config.supportedLanguages.includes(normalized);
  }

  normalizeLanguage(lang) {
    const mappings = {
      'js': 'javascript',
      'py': 'python',
      'htm': 'html',
      'jsx': 'javascript',
      'tsx': 'javascript',
      'ts': 'javascript'
    };

    return mappings[lang] || lang;
  }

  createTryButton(code, language, index) {
    const button = document.createElement('button');
    button.className = 'code-try-button';
    button.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M3 3l10 5-10 5V3z" fill="currentColor"/>
      </svg>
      <span>Try it</span>
    `;
    button.dataset.code = code;
    button.dataset.language = language;
    button.dataset.index = index;

    button.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      this.openPlayground(code, language);
    });

    return button;
  }

  openPlayground(code = '', language = 'javascript') {
    // Create playground modal
    const playground = document.createElement('div');
    playground.className = 'code-playground-modal';
    playground.innerHTML = `
      <div class="code-playground-container">
        <div class="code-playground-header">
          <div class="playground-title">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 3l14 7-14 7V3z" fill="currentColor"/>
            </svg>
            <span>Code Playground</span>
          </div>
          <div class="playground-controls">
            <select class="language-selector">
              <option value="javascript" ${language === 'javascript' ? 'selected' : ''}>JavaScript</option>
              <option value="python" ${language === 'python' ? 'selected' : ''}>Python</option>
              <option value="html" ${language === 'html' ? 'selected' : ''}>HTML/CSS/JS</option>
            </select>
            ${this.config.enableSaving ? '<button class="playground-btn save-btn" title="Save snippet">💾</button>' : ''}
            ${this.config.enableSharing ? '<button class="playground-btn share-btn" title="Share code">🔗</button>' : ''}
            ${this.config.enableFullscreen ? '<button class="playground-btn fullscreen-btn" title="Fullscreen">⛶</button>' : ''}
            <button class="playground-btn close-btn" title="Close">✕</button>
          </div>
        </div>

        <div class="code-playground-body">
          <div class="code-editor-panel">
            <div class="panel-header">
              <span>Code Editor</span>
              <button class="run-code-btn">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M2 2l10 5-10 5V2z" fill="currentColor"/>
                </svg>
                Run
              </button>
            </div>
            <textarea class="code-editor" spellcheck="false">${this.escapeHTML(code)}</textarea>
          </div>

          <div class="code-output-panel">
            <div class="panel-header">
              <span>Output</span>
              <button class="clear-output-btn">Clear</button>
            </div>
            <div class="code-output"></div>
          </div>
        </div>

        <div class="code-playground-footer">
          <div class="playground-status">Ready</div>
          <div class="playground-tips">
            <span>💡 Tip: Press Ctrl+Enter to run code</span>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(playground);
    this.activePlayground = playground;

    // Setup playground controls
    this.setupPlaygroundControls(playground, language);

    // Focus editor
    const editor = playground.querySelector('.code-editor');
    editor.focus();

    // Animate in
    requestAnimationFrame(() => {
      playground.classList.add('active');
    });
  }

  setupPlaygroundControls(playground, initialLanguage) {
    const editor = playground.querySelector('.code-editor');
    const output = playground.querySelector('.code-output');
    const runBtn = playground.querySelector('.run-code-btn');
    const clearBtn = playground.querySelector('.clear-output-btn');
    const closeBtn = playground.querySelector('.close-btn');
    const languageSelector = playground.querySelector('.language-selector');
    const shareBtn = playground.querySelector('.share-btn');
    const saveBtn = playground.querySelector('.save-btn');
    const fullscreenBtn = playground.querySelector('.fullscreen-btn');
    const status = playground.querySelector('.playground-status');

    let currentLanguage = initialLanguage;

    // Run code
    const runCode = async () => {
      const code = editor.value;
      output.innerHTML = '';
      status.textContent = 'Running...';

      try {
        await this.executeCode(code, currentLanguage, output, status);
        status.textContent = 'Execution complete';
      } catch (error) {
        this.displayError(output, error);
        status.textContent = 'Error occurred';
      }
    };

    runBtn.addEventListener('click', runCode);

    // Keyboard shortcut: Ctrl+Enter to run
    editor.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        runCode();
      }
    });

    // Clear output
    clearBtn.addEventListener('click', () => {
      output.innerHTML = '';
      status.textContent = 'Output cleared';
    });

    // Close playground
    const closePlg = () => {
      playground.classList.remove('active');
      setTimeout(() => {
        playground.remove();
        this.activePlayground = null;
      }, 300);
    };

    closeBtn.addEventListener('click', closePlg);
    playground.addEventListener('click', (e) => {
      if (e.target === playground) {
        closePlg();
      }
    });

    // Language change
    languageSelector.addEventListener('change', (e) => {
      currentLanguage = e.target.value;
      status.textContent = `Switched to ${currentLanguage}`;
    });

    // Share code
    if (shareBtn) {
      shareBtn.addEventListener('click', () => {
        this.shareCode(editor.value, currentLanguage);
        status.textContent = 'Link copied to clipboard!';
      });
    }

    // Save snippet
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.saveSnippet(editor.value, currentLanguage);
        status.textContent = 'Snippet saved!';
      });
    }

    // Fullscreen
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        playground.classList.toggle('fullscreen');
        fullscreenBtn.textContent = playground.classList.contains('fullscreen') ? '⛶' : '⛶';
      });
    }

    // Escape to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activePlayground) {
        closePlg();
      }
    });
  }

  async executeCode(code, language, outputElement, statusElement) {
    switch (language) {
      case 'javascript':
        await this.executeJavaScript(code, outputElement);
        break;

      case 'python':
        await this.executePython(code, outputElement, statusElement);
        break;

      case 'html':
        await this.executeHTML(code, outputElement);
        break;

      default:
        this.displayError(outputElement, new Error(`Language ${language} not supported`));
    }
  }

  async executeJavaScript(code, outputElement) {
    // Create sandboxed console
    const logs = [];
    const sandboxConsole = {
      log: (...args) => logs.push({ type: 'log', args }),
      error: (...args) => logs.push({ type: 'error', args }),
      warn: (...args) => logs.push({ type: 'warn', args }),
      info: (...args) => logs.push({ type: 'info', args })
    };

    try {
      // Execute code with sandboxed console
      const func = new Function('console', code);
      const result = func(sandboxConsole);

      // Display console logs
      logs.forEach(log => {
        const logLine = document.createElement('div');
        logLine.className = `console-${log.type}`;
        logLine.textContent = log.args.map(arg => this.stringify(arg)).join(' ');
        outputElement.appendChild(logLine);
      });

      // Display return value if any
      if (result !== undefined) {
        const resultLine = document.createElement('div');
        resultLine.className = 'console-result';
        resultLine.textContent = '→ ' + this.stringify(result);
        outputElement.appendChild(resultLine);
      }

      if (logs.length === 0 && result === undefined) {
        outputElement.innerHTML = '<div class="console-info">No output (code executed successfully)</div>';
      }

    } catch (error) {
      this.displayError(outputElement, error);
    }
  }

  async executePython(code, outputElement, statusElement) {
    if (this.config.pythonRuntime === 'pyodide') {
      await this.executePyodide(code, outputElement, statusElement);
    } else if (this.config.apiEndpoint) {
      await this.executeViaAPI(code, 'python', outputElement);
    } else {
      this.displayError(outputElement, new Error('Python runtime not configured'));
    }
  }

  async executePyodide(code, outputElement, statusElement) {
    // Load Pyodide if not loaded
    if (!this.pyodideLoaded) {
      statusElement.textContent = 'Loading Python runtime... (first run only)';

      try {
        if (!window.loadPyodide) {
          // Load Pyodide script
          await this.loadScript('https://cdn.jsdelivr.net/pyodide/v0.24.1/full/pyodide.js');
        }

        this.pyodide = await loadPyodide({
          indexURL: 'https://cdn.jsdelivr.net/pyodide/v0.24.1/full/'
        });

        this.pyodideLoaded = true;
        statusElement.textContent = 'Python ready! Running code...';
      } catch (error) {
        this.displayError(outputElement, new Error('Failed to load Python runtime'));
        return;
      }
    }

    try {
      // Capture stdout
      let output_text = '';

      this.pyodide.setStdout({
        batched: (text) => {
          output_text += text + '\n';
        }
      });

      // Run Python code
      await this.pyodide.runPythonAsync(code);

      // Display output
      if (output_text.trim()) {
        const outputLine = document.createElement('div');
        outputLine.className = 'console-log';
        outputLine.textContent = output_text.trim();
        outputElement.appendChild(outputLine);
      } else {
        outputElement.innerHTML = '<div class="console-info">No output (code executed successfully)</div>';
      }

    } catch (error) {
      this.displayError(outputElement, error);
    }
  }

  async executeHTML(code, outputElement) {
    // Create iframe for HTML execution
    const iframe = document.createElement('iframe');
    iframe.className = 'html-preview-iframe';
    iframe.sandbox = 'allow-scripts';

    outputElement.innerHTML = '';
    outputElement.appendChild(iframe);

    // Write HTML to iframe
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(code);
    iframeDoc.close();
  }

  async executeViaAPI(code, language, outputElement) {
    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          code: code,
          language: language,
          timeout: this.config.maxExecutionTime
        })
      });

      if (!response.ok) {
        throw new Error('API execution failed');
      }

      const result = await response.json();

      if (result.error) {
        this.displayError(outputElement, new Error(result.error));
      } else {
        const outputLine = document.createElement('div');
        outputLine.className = 'console-log';
        outputLine.textContent = result.output || result.stdout || 'No output';
        outputElement.appendChild(outputLine);
      }

    } catch (error) {
      this.displayError(outputElement, error);
    }
  }

  displayError(outputElement, error) {
    const errorLine = document.createElement('div');
    errorLine.className = 'console-error';
    errorLine.innerHTML = `
      <strong>Error:</strong><br>
      ${this.escapeHTML(error.message || String(error))}
    `;
    outputElement.appendChild(errorLine);
  }

  stringify(obj) {
    if (obj === null) return 'null';
    if (obj === undefined) return 'undefined';
    if (typeof obj === 'string') return obj;
    if (typeof obj === 'function') return obj.toString();

    try {
      return JSON.stringify(obj, null, 2);
    } catch {
      return String(obj);
    }
  }

  shareCode(code, language) {
    // Create shareable URL with code
    const encoded = btoa(encodeURIComponent(code));
    const url = `${window.location.origin}${window.location.pathname}?playground=${language}&code=${encoded}`;

    // Copy to clipboard
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    } else {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    }
  }

  saveSnippet(code, language) {
    const snippet = {
      id: Date.now(),
      code: code,
      language: language,
      timestamp: new Date().toISOString(),
      title: `${language} snippet ${this.savedSnippets.length + 1}`
    };

    this.savedSnippets.push(snippet);

    try {
      localStorage.setItem(this.config.storageKey, JSON.stringify(this.savedSnippets));
    } catch (error) {
      console.warn('Failed to save snippet:', error);
    }
  }

  loadSnippets() {
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  setupEventListeners() {
    // Check for shared code in URL
    const urlParams = new URLSearchParams(window.location.search);
    const sharedCode = urlParams.get('code');
    const language = urlParams.get('playground');

    if (sharedCode && language) {
      try {
        const decoded = decodeURIComponent(atob(sharedCode));
        this.openPlayground(decoded, language);
      } catch (error) {
        console.error('Failed to load shared code:', error);
      }
    }
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  injectStyles() {
    if (document.getElementById('code-playground-styles')) return;

    const style = document.createElement('style');
    style.id = 'code-playground-styles';
    style.textContent = `
      /* Try It Button */
      .code-try-button {
        position: absolute;
        top: 8px;
        right: 8px;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
        z-index: 10;
      }

      .code-try-button:hover {
        background: var(--color-accent-hover, #4f46e5);
        transform: translateY(-1px);
        box-shadow: 0 4px 8px rgba(99, 102, 241, 0.3);
      }

      .code-try-button svg {
        width: 14px;
        height: 14px;
      }

      /* Playground Modal */
      .code-playground-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        opacity: 0;
        transition: opacity 0.3s;
        padding: 20px;
      }

      .code-playground-modal.active {
        opacity: 1;
      }

      .code-playground-container {
        width: 100%;
        max-width: 1400px;
        height: 90vh;
        max-height: 900px;
        background: var(--color-bg-secondary, #1e293b);
        border-radius: 12px;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
      }

      .code-playground-modal.fullscreen .code-playground-container {
        max-width: 100%;
        max-height: 100vh;
        height: 100vh;
        border-radius: 0;
      }

      /* Header */
      .code-playground-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--color-bg-primary, #0f172a);
        border-bottom: 1px solid var(--color-border, #334155);
      }

      .playground-title {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 16px;
        font-weight: 600;
        color: var(--color-text-primary, #f1f5f9);
      }

      .playground-controls {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .language-selector {
        padding: 8px 12px;
        background: var(--color-bg-secondary, #1e293b);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        font-size: 14px;
        cursor: pointer;
      }

      .playground-btn {
        width: 36px;
        height: 36px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        color: var(--color-text-secondary, #94a3b8);
        cursor: pointer;
        transition: all 0.2s;
        font-size: 18px;
      }

      .playground-btn:hover {
        background: var(--color-bg-secondary, #1e293b);
        color: var(--color-text-primary, #f1f5f9);
        border-color: var(--color-accent, #6366f1);
      }

      /* Body */
      .code-playground-body {
        flex: 1;
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 0;
        overflow: hidden;
      }

      .code-editor-panel,
      .code-output-panel {
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }

      .code-editor-panel {
        border-right: 1px solid var(--color-border, #334155);
      }

      .panel-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        background: var(--color-bg-primary, #0f172a);
        border-bottom: 1px solid var(--color-border, #334155);
        font-size: 13px;
        font-weight: 600;
        color: var(--color-text-secondary, #94a3b8);
      }

      .run-code-btn {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 12px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .run-code-btn:hover {
        background: var(--color-accent-hover, #4f46e5);
      }

      .clear-output-btn {
        padding: 4px 10px;
        background: transparent;
        color: var(--color-text-secondary, #94a3b8);
        border: 1px solid var(--color-border, #334155);
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .clear-output-btn:hover {
        color: var(--color-text-primary, #f1f5f9);
        border-color: var(--color-accent, #6366f1);
      }

      .code-editor {
        flex: 1;
        padding: 16px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: none;
        outline: none;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        line-height: 1.6;
        resize: none;
        tab-size: 2;
      }

      .code-output {
        flex: 1;
        padding: 16px;
        overflow-y: auto;
        font-family: 'Courier New', Courier, monospace;
        font-size: 14px;
        line-height: 1.6;
      }

      .console-log,
      .console-info,
      .console-warn,
      .console-error,
      .console-result {
        padding: 4px 0;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
      }

      .console-log {
        color: var(--color-text-primary, #f1f5f9);
      }

      .console-info {
        color: var(--color-text-secondary, #94a3b8);
      }

      .console-warn {
        color: #fbbf24;
      }

      .console-error {
        color: #ef4444;
      }

      .console-result {
        color: #10b981;
        font-weight: 500;
      }

      .html-preview-iframe {
        width: 100%;
        height: 100%;
        border: none;
        background: white;
      }

      /* Footer */
      .code-playground-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 20px;
        background: var(--color-bg-primary, #0f172a);
        border-top: 1px solid var(--color-border, #334155);
        font-size: 13px;
      }

      .playground-status {
        color: var(--color-text-secondary, #94a3b8);
      }

      .playground-tips {
        color: var(--color-text-secondary, #64748b);
        font-size: 12px;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .code-playground-body {
          grid-template-columns: 1fr;
          grid-template-rows: 1fr 1fr;
        }

        .code-editor-panel {
          border-right: none;
          border-bottom: 1px solid var(--color-border, #334155);
        }

        .playground-controls {
          flex-wrap: wrap;
        }
      }
    `;

    document.head.appendChild(style);
  }

  log(...args) {
    console.log('[CodePlayground]', ...args);
  }
}

// Auto-initialize if config provided
if (window.playgroundConfig) {
  window.codePlayground = new CodePlayground(window.playgroundConfig);
} else {
  // Initialize with defaults
  window.codePlayground = new CodePlayground();
}

// Make class available globally
window.CodePlayground = CodePlayground;

// Example configuration (add to your HTML):
/*
<script>
window.playgroundConfig = {
  supportedLanguages: ['javascript', 'python', 'html'],
  enableSharing: true,
  enableSaving: true,
  enableFullscreen: true,
  pythonRuntime: 'pyodide',
  autoConvertCodeBlocks: true
};
</script>
<script src="/js/code-playground.js"></script>
*/
