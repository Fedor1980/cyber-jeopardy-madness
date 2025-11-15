// Theme Switcher for NexusOS Documentation
class ThemeSwitcher {
  constructor() {
    this.currentTheme = this.getStoredTheme() || this.getPreferredTheme();
    this.init();
  }

  init() {
    // Apply theme immediately to prevent flash
    this.applyTheme(this.currentTheme);

    // Create theme toggle button
    this.createToggleButton();

    // Listen for system theme changes
    this.watchSystemTheme();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem('nexusos-theme');
    } catch (e) {
      return null;
    }
  }

  getPreferredTheme() {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  }

  applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.currentTheme = theme;

    try {
      localStorage.setItem('nexusos-theme', theme);
    } catch (e) {
      // localStorage not available
    }

    // Update toggle button if it exists
    this.updateToggleButton();
  }

  toggleTheme() {
    const newTheme = this.currentTheme === 'dark' ? 'light' : 'dark';
    this.applyTheme(newTheme);

    // Track theme change
    if (window.gtag) {
      gtag('event', 'theme_change', { theme: newTheme });
    }
  }

  createToggleButton() {
    // Check if button already exists
    if (document.getElementById('theme-toggle')) return;

    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.setAttribute('aria-label', 'Toggle dark mode');
    button.setAttribute('title', 'Toggle dark mode');

    button.innerHTML = `
      <svg class="theme-icon sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>
      <svg class="theme-icon moon-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>
    `;

    button.addEventListener('click', () => this.toggleTheme());

    // Insert after search container or at top of body
    const searchContainer = document.getElementById('doc-search-container');
    if (searchContainer) {
      searchContainer.appendChild(button);
    } else {
      document.body.insertBefore(button, document.body.firstChild);
    }

    this.toggleButton = button;
    this.updateToggleButton();
  }

  updateToggleButton() {
    if (!this.toggleButton) return;

    const isDark = this.currentTheme === 'dark';
    this.toggleButton.setAttribute('aria-pressed', isDark);

    // Update icon visibility
    const sunIcon = this.toggleButton.querySelector('.sun-icon');
    const moonIcon = this.toggleButton.querySelector('.moon-icon');

    if (sunIcon && moonIcon) {
      sunIcon.style.display = isDark ? 'none' : 'block';
      moonIcon.style.display = isDark ? 'block' : 'none';
    }
  }

  watchSystemTheme() {
    if (!window.matchMedia) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    // Listen for system theme changes
    mediaQuery.addEventListener('change', (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!this.getStoredTheme()) {
        this.applyTheme(e.matches ? 'dark' : 'light');
      }
    });
  }
}

// Initialize theme switcher as early as possible
(function() {
  // Apply theme immediately from localStorage to prevent flash
  const storedTheme = localStorage.getItem('nexusos-theme');
  if (storedTheme) {
    document.documentElement.setAttribute('data-theme', storedTheme);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new ThemeSwitcher();
  });
} else {
  new ThemeSwitcher();
}
