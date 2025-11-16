/**
 * Multi-language (i18n) Support for NexusOS Documentation Platform
 * Layer 14: Complete internationalization system
 *
 * Features:
 * - Auto-detect user language
 * - Language switcher UI
 * - RTL support for Arabic, Hebrew, etc.
 * - Dynamic content loading
 * - LocalStorage persistence
 * - URL-based language selection
 * - Fallback to default language
 */

class InternationalizationManager {
  constructor(config = {}) {
    this.config = {
      defaultLanguage: config.defaultLanguage || 'en',
      supportedLanguages: config.supportedLanguages || ['en', 'es', 'fr', 'de', 'ja', 'zh', 'ar', 'ru'],
      autoDetect: config.autoDetect !== false,
      persistChoice: config.persistChoice !== false,
      fallbackLanguage: config.fallbackLanguage || 'en',
      translationsPath: config.translationsPath || '/i18n',
      rtlLanguages: config.rtlLanguages || ['ar', 'he', 'fa', 'ur']
    };

    this.currentLanguage = null;
    this.translations = {};
    this.observers = [];

    this.init();
  }

  async init() {
    // Determine initial language
    this.currentLanguage = this.detectLanguage();

    // Load translations
    await this.loadTranslations(this.currentLanguage);

    // Apply language to document
    this.applyLanguage(this.currentLanguage);

    // Create language switcher UI
    this.createLanguageSwitcher();

    // Set up dynamic content observers
    this.setupDynamicContentObserver();

    console.log('[i18n] Initialized with language:', this.currentLanguage);
  }

  detectLanguage() {
    // Priority order:
    // 1. URL parameter (?lang=es)
    // 2. LocalStorage
    // 3. Browser language
    // 4. Default language

    // Check URL parameter
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang');
    if (urlLang && this.isSupported(urlLang)) {
      return urlLang;
    }

    // Check localStorage
    if (this.config.persistChoice) {
      const storedLang = localStorage.getItem('nexusos-language');
      if (storedLang && this.isSupported(storedLang)) {
        return storedLang;
      }
    }

    // Check browser language
    if (this.config.autoDetect) {
      const browserLang = (navigator.language || navigator.userLanguage).split('-')[0];
      if (this.isSupported(browserLang)) {
        return browserLang;
      }
    }

    // Fallback to default
    return this.config.defaultLanguage;
  }

  isSupported(lang) {
    return this.config.supportedLanguages.includes(lang);
  }

  async loadTranslations(lang) {
    try {
      // Load translation file
      const response = await fetch(`${this.config.translationsPath}/${lang}.json`);

      if (!response.ok) {
        throw new Error(`Failed to load translations for ${lang}`);
      }

      this.translations[lang] = await response.json();
      console.log(`[i18n] Loaded translations for ${lang}`);

      return true;
    } catch (error) {
      console.error(`[i18n] Error loading ${lang}:`, error);

      // Try to load fallback language
      if (lang !== this.config.fallbackLanguage) {
        console.log(`[i18n] Loading fallback language: ${this.config.fallbackLanguage}`);
        return this.loadTranslations(this.config.fallbackLanguage);
      }

      return false;
    }
  }

  translate(key, params = {}) {
    const lang = this.currentLanguage;

    // Get translation from current language
    let translation = this.getNestedTranslation(this.translations[lang], key);

    // Fallback to default language
    if (!translation && lang !== this.config.fallbackLanguage) {
      translation = this.getNestedTranslation(
        this.translations[this.config.fallbackLanguage],
        key
      );
    }

    // Fallback to key itself
    if (!translation) {
      console.warn(`[i18n] Missing translation for key: ${key}`);
      return key;
    }

    // Replace parameters
    return this.replaceParams(translation, params);
  }

  getNestedTranslation(obj, key) {
    return key.split('.').reduce((o, k) => (o || {})[k], obj);
  }

  replaceParams(text, params) {
    return Object.keys(params).reduce((result, key) => {
      return result.replace(new RegExp(`{{${key}}}`, 'g'), params[key]);
    }, text);
  }

  async switchLanguage(lang) {
    if (!this.isSupported(lang)) {
      console.error(`[i18n] Language not supported: ${lang}`);
      return false;
    }

    // Load translations if not already loaded
    if (!this.translations[lang]) {
      await this.loadTranslations(lang);
    }

    // Update current language
    this.currentLanguage = lang;

    // Save to localStorage
    if (this.config.persistChoice) {
      localStorage.setItem('nexusos-language', lang);
    }

    // Apply to document
    this.applyLanguage(lang);

    // Notify observers
    this.notifyObservers(lang);

    // Update URL if needed
    this.updateURL(lang);

    console.log(`[i18n] Switched to language: ${lang}`);
    return true;
  }

  applyLanguage(lang) {
    // Set document language
    document.documentElement.lang = lang;

    // Set direction for RTL languages
    if (this.config.rtlLanguages.includes(lang)) {
      document.documentElement.dir = 'rtl';
      document.body.classList.add('rtl');
    } else {
      document.documentElement.dir = 'ltr';
      document.body.classList.remove('rtl');
    }

    // Translate all elements with data-i18n attribute
    this.translateElements();

    // Dispatch event
    window.dispatchEvent(new CustomEvent('languagechanged', {
      detail: { language: lang }
    }));
  }

  translateElements() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(element => {
      const key = element.getAttribute('data-i18n');
      const params = this.getElementParams(element);

      const translation = this.translate(key, params);

      // Update text content
      if (element.getAttribute('data-i18n-target') === 'placeholder') {
        element.placeholder = translation;
      } else if (element.getAttribute('data-i18n-target') === 'title') {
        element.title = translation;
      } else if (element.getAttribute('data-i18n-target') === 'aria-label') {
        element.setAttribute('aria-label', translation);
      } else {
        element.textContent = translation;
      }
    });
  }

  getElementParams(element) {
    const paramsAttr = element.getAttribute('data-i18n-params');
    if (!paramsAttr) return {};

    try {
      return JSON.parse(paramsAttr);
    } catch (e) {
      return {};
    }
  }

  createLanguageSwitcher() {
    // Create language switcher dropdown
    const switcher = document.createElement('div');
    switcher.className = 'language-switcher';
    switcher.innerHTML = `
      <button class="language-switcher-button" aria-label="Change language">
        <span class="current-language-flag">${this.getLanguageFlag(this.currentLanguage)}</span>
        <span class="current-language-code">${this.currentLanguage.toUpperCase()}</span>
        <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12">
          <path d="M2 4l4 4 4-4" stroke="currentColor" fill="none" stroke-width="2"/>
        </svg>
      </button>
      <div class="language-dropdown">
        ${this.config.supportedLanguages.map(lang => `
          <button
            class="language-option ${lang === this.currentLanguage ? 'active' : ''}"
            data-lang="${lang}"
            aria-label="Switch to ${this.getLanguageName(lang)}"
          >
            <span class="language-flag">${this.getLanguageFlag(lang)}</span>
            <span class="language-name">${this.getLanguageName(lang)}</span>
            ${lang === this.currentLanguage ? '<span class="checkmark">✓</span>' : ''}
          </button>
        `).join('')}
      </div>
    `;

    // Add to page (top-right, next to theme toggle)
    document.body.appendChild(switcher);

    // Toggle dropdown
    const button = switcher.querySelector('.language-switcher-button');
    const dropdown = switcher.querySelector('.language-dropdown');

    button.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      dropdown.classList.remove('open');
    });

    // Language selection
    switcher.querySelectorAll('.language-option').forEach(option => {
      option.addEventListener('click', async (e) => {
        const lang = e.currentTarget.getAttribute('data-lang');
        await this.switchLanguage(lang);

        // Update UI
        switcher.querySelector('.current-language-flag').textContent = this.getLanguageFlag(lang);
        switcher.querySelector('.current-language-code').textContent = lang.toUpperCase();

        // Update active state
        switcher.querySelectorAll('.language-option').forEach(opt => {
          opt.classList.remove('active');
          opt.querySelector('.checkmark')?.remove();
        });

        e.currentTarget.classList.add('active');
        e.currentTarget.insertAdjacentHTML('beforeend', '<span class="checkmark">✓</span>');

        dropdown.classList.remove('open');
      });
    });

    this.injectStyles();
  }

  getLanguageFlag(lang) {
    const flags = {
      en: '🇬🇧', es: '🇪🇸', fr: '🇫🇷', de: '🇩🇪',
      ja: '🇯🇵', zh: '🇨🇳', ar: '🇸🇦', ru: '🇷🇺',
      pt: '🇵🇹', it: '🇮🇹', ko: '🇰🇷', nl: '🇳🇱',
      pl: '🇵🇱', tr: '🇹🇷', hi: '🇮🇳', he: '🇮🇱'
    };
    return flags[lang] || '🌐';
  }

  getLanguageName(lang) {
    const names = {
      en: 'English', es: 'Español', fr: 'Français', de: 'Deutsch',
      ja: '日本語', zh: '中文', ar: 'العربية', ru: 'Русский',
      pt: 'Português', it: 'Italiano', ko: '한국어', nl: 'Nederlands',
      pl: 'Polski', tr: 'Türkçe', hi: 'हिन्दी', he: 'עברית'
    };
    return names[lang] || lang;
  }

  updateURL(lang) {
    const url = new URL(window.location);
    url.searchParams.set('lang', lang);
    window.history.pushState({}, '', url);
  }

  setupDynamicContentObserver() {
    // Observe DOM changes and translate new elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) { // Element node
            if (node.hasAttribute && node.hasAttribute('data-i18n')) {
              this.translateElements();
            }

            // Check children
            const i18nElements = node.querySelectorAll?.('[data-i18n]');
            if (i18nElements && i18nElements.length > 0) {
              this.translateElements();
            }
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // Subscribe to language changes
  subscribe(callback) {
    this.observers.push(callback);
  }

  notifyObservers(lang) {
    this.observers.forEach(callback => callback(lang));
  }

  injectStyles() {
    if (document.getElementById('i18n-styles')) return;

    const style = document.createElement('style');
    style.id = 'i18n-styles';
    style.textContent = `
      .language-switcher {
        position: fixed;
        top: 1rem;
        right: 5rem;
        z-index: 1001;
      }

      .language-switcher-button {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.5rem 1rem;
        background: var(--color-bg-secondary, #f9fafb);
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 0.5rem;
        cursor: pointer;
        font-size: 0.875rem;
        font-weight: 500;
        color: var(--color-text-primary, #1e293b);
        transition: all 0.2s;
      }

      .language-switcher-button:hover {
        background: var(--color-bg-primary, #ffffff);
        border-color: var(--color-accent, #6366f1);
        box-shadow: 0 2px 8px rgba(99, 102, 241, 0.1);
      }

      .current-language-flag {
        font-size: 1.25rem;
        line-height: 1;
      }

      .dropdown-icon {
        transition: transform 0.2s;
      }

      .language-dropdown.open ~ .language-switcher-button .dropdown-icon {
        transform: rotate(180deg);
      }

      .language-dropdown {
        position: absolute;
        top: calc(100% + 0.5rem);
        right: 0;
        min-width: 200px;
        background: var(--color-bg-primary, #ffffff);
        border: 1px solid var(--color-border, #e5e7eb);
        border-radius: 0.5rem;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s;
        max-height: 400px;
        overflow-y: auto;
      }

      .language-dropdown.open {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .language-option {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        width: 100%;
        padding: 0.75rem 1rem;
        border: none;
        background: transparent;
        cursor: pointer;
        font-size: 0.875rem;
        color: var(--color-text-primary, #1e293b);
        transition: background 0.2s;
        text-align: left;
      }

      .language-option:hover {
        background: var(--color-bg-secondary, #f9fafb);
      }

      .language-option.active {
        background: var(--color-accent-light, #eef2ff);
        color: var(--color-accent, #6366f1);
        font-weight: 600;
      }

      .language-flag {
        font-size: 1.25rem;
        line-height: 1;
      }

      .language-name {
        flex: 1;
      }

      .checkmark {
        color: var(--color-accent, #6366f1);
        font-weight: 700;
      }

      /* RTL support */
      .rtl {
        direction: rtl;
      }

      .rtl .language-switcher {
        right: auto;
        left: 5rem;
      }

      .rtl .language-dropdown {
        right: auto;
        left: 0;
      }

      /* Mobile responsive */
      @media (max-width: 768px) {
        .language-switcher {
          top: auto;
          bottom: 1rem;
          right: 1rem;
        }

        .rtl .language-switcher {
          left: 1rem;
          right: auto;
        }

        .current-language-code {
          display: none;
        }

        .language-dropdown {
          right: 0;
          left: auto;
        }

        .rtl .language-dropdown {
          left: 0;
          right: auto;
        }
      }

      /* Dark mode */
      @media (prefers-color-scheme: dark) {
        .language-switcher-button {
          background: var(--color-bg-secondary, #1e293b);
          border-color: var(--color-border, #374151);
        }

        .language-dropdown {
          background: var(--color-bg-primary, #0f172a);
          border-color: var(--color-border, #374151);
        }
      }
    `;

    document.head.appendChild(style);
  }

  // Helper method to get current language
  getLanguage() {
    return this.currentLanguage;
  }

  // Helper method for templates
  t(key, params) {
    return this.translate(key, params);
  }
}

// Auto-initialize if config is provided
if (window.i18nConfig) {
  window.i18n = new InternationalizationManager(window.i18nConfig);
}

// Make class available globally
window.InternationalizationManager = InternationalizationManager;

// Helper function for quick translations
window.t = function(key, params) {
  return window.i18n?.translate(key, params) || key;
};

/* Example Usage:

HTML:
<h1 data-i18n="welcome.title">Welcome</h1>
<p data-i18n="welcome.description" data-i18n-params='{"name":"User"}'>Hello {{name}}</p>
<button data-i18n="actions.click_here">Click Here</button>
<input data-i18n="search.placeholder" data-i18n-target="placeholder" placeholder="Search...">

JavaScript:
window.i18nConfig = {
  defaultLanguage: 'en',
  supportedLanguages: ['en', 'es', 'fr', 'de', 'ja', 'zh'],
  autoDetect: true,
  persistChoice: true
};

Translation file (i18n/en.json):
{
  "welcome": {
    "title": "Welcome to NexusOS",
    "description": "Hello {{name}}"
  },
  "actions": {
    "click_here": "Click Here"
  },
  "search": {
    "placeholder": "Search documentation..."
  }
}

*/
