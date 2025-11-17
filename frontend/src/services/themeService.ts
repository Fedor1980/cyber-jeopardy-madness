/**
 * Theme Service for Cyber Jeopardy
 * Manages dark/light themes and cyber-styled colors
 */

export type ThemeMode = 'dark' | 'light' | 'cyber-dark' | 'cyber-light';

export interface Theme {
  mode: ThemeMode;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    border: string;
    accent: string;
    neon: string;
  };
  fonts: {
    primary: string;
    monospace: string;
  };
}

const themes: Record<ThemeMode, Theme> = {
  'dark': {
    mode: 'dark',
    colors: {
      primary: '#004E7C',
      secondary: '#5FC742',
      background: '#0a0e1a',
      surface: '#151a2d',
      text: '#ffffff',
      textSecondary: '#a0aec0',
      success: '#5FC742',
      error: '#f56565',
      warning: '#ed8936',
      info: '#4299e1',
      border: '#2d3748',
      accent: '#00d4ff',
      neon: '#00ffff',
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      monospace: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    },
  },
  'light': {
    mode: 'light',
    colors: {
      primary: '#004E7C',
      secondary: '#5FC742',
      background: '#ffffff',
      surface: '#f7fafc',
      text: '#1a202c',
      textSecondary: '#4a5568',
      success: '#48bb78',
      error: '#f56565',
      warning: '#ed8936',
      info: '#4299e1',
      border: '#e2e8f0',
      accent: '#0080ff',
      neon: '#00aacc',
    },
    fonts: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      monospace: '"JetBrains Mono", "Fira Code", "Courier New", monospace',
    },
  },
  'cyber-dark': {
    mode: 'cyber-dark',
    colors: {
      primary: '#00d4ff',
      secondary: '#5FC742',
      background: '#000000',
      surface: '#0a0a0a',
      text: '#00ffff',
      textSecondary: '#00aacc',
      success: '#00ff41',
      error: '#ff0055',
      warning: '#ffaa00',
      info: '#00d4ff',
      border: '#004e7c',
      accent: '#ff00ff',
      neon: '#00ffff',
    },
    fonts: {
      primary: '"Rajdhani", "Orbitron", sans-serif',
      monospace: '"Share Tech Mono", "JetBrains Mono", monospace',
    },
  },
  'cyber-light': {
    mode: 'cyber-light',
    colors: {
      primary: '#004E7C',
      secondary: '#5FC742',
      background: '#f0f8ff',
      surface: '#ffffff',
      text: '#003366',
      textSecondary: '#336699',
      success: '#00cc44',
      error: '#cc0044',
      warning: '#ff8800',
      info: '#0099ff',
      border: '#99ccff',
      accent: '#6600ff',
      neon: '#0088cc',
    },
    fonts: {
      primary: '"Rajdhani", "Roboto", sans-serif',
      monospace: '"Share Tech Mono", "Courier New", monospace',
    },
  },
};

class ThemeService {
  private currentTheme: ThemeMode = 'cyber-dark';
  private listeners: Set<(theme: Theme) => void> = new Set();

  constructor() {
    // Load saved theme from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      if (saved && this.isValidTheme(saved)) {
        this.currentTheme = saved as ThemeMode;
      }
      this.applyTheme();
    }
  }

  /**
   * Check if theme mode is valid
   */
  private isValidTheme(mode: string): boolean {
    return mode in themes;
  }

  /**
   * Get current theme
   */
  getTheme(): Theme {
    return themes[this.currentTheme];
  }

  /**
   * Get current theme mode
   */
  getMode(): ThemeMode {
    return this.currentTheme;
  }

  /**
   * Set theme mode
   */
  setTheme(mode: ThemeMode): void {
    if (!this.isValidTheme(mode)) {
      console.error(`Invalid theme mode: ${mode}`);
      return;
    }

    this.currentTheme = mode;
    this.applyTheme();
    this.saveTheme();
    this.notifyListeners();
  }

  /**
   * Toggle between dark and light
   */
  toggleDarkLight(): void {
    const isDark = this.currentTheme.includes('dark');
    const isCyber = this.currentTheme.includes('cyber');

    if (isCyber) {
      this.setTheme(isDark ? 'cyber-light' : 'cyber-dark');
    } else {
      this.setTheme(isDark ? 'light' : 'dark');
    }
  }

  /**
   * Toggle cyber mode
   */
  toggleCyber(): void {
    const isDark = this.currentTheme.includes('dark');
    const isCyber = this.currentTheme.includes('cyber');

    if (isCyber) {
      this.setTheme(isDark ? 'dark' : 'light');
    } else {
      this.setTheme(isDark ? 'cyber-dark' : 'cyber-light');
    }
  }

  /**
   * Apply theme to DOM
   */
  private applyTheme(): void {
    if (typeof window === 'undefined') return;

    const theme = this.getTheme();
    const root = document.documentElement;

    // Apply CSS variables
    Object.entries(theme.colors).forEach(([key, value]) => {
      root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
    });

    // Apply font variables
    root.style.setProperty('--font-primary', theme.fonts.primary);
    root.style.setProperty('--font-monospace', theme.fonts.monospace);

    // Set data attribute for theme mode
    root.setAttribute('data-theme', theme.mode);

    // Add cyber class if cyber theme
    if (theme.mode.includes('cyber')) {
      root.classList.add('cyber-theme');
    } else {
      root.classList.remove('cyber-theme');
    }
  }

  /**
   * Convert camelCase to kebab-case
   */
  private kebabCase(str: string): string {
    return str.replace(/([a-z])([A-Z])/g, '$1-$2').toLowerCase();
  }

  /**
   * Save theme to localStorage
   */
  private saveTheme(): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', this.currentTheme);
    }
  }

  /**
   * Subscribe to theme changes
   */
  subscribe(listener: (theme: Theme) => void): () => void {
    this.listeners.add(listener);

    // Return unsubscribe function
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners
   */
  private notifyListeners(): void {
    const theme = this.getTheme();
    this.listeners.forEach((listener) => listener(theme));
  }

  /**
   * Get all available themes
   */
  getAvailableThemes(): ThemeMode[] {
    return Object.keys(themes) as ThemeMode[];
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.currentTheme.includes('dark');
  }

  /**
   * Check if current theme is cyber
   */
  isCyber(): boolean {
    return this.currentTheme.includes('cyber');
  }

  /**
   * Get theme colors for a specific mode
   */
  getThemeColors(mode: ThemeMode): Theme['colors'] {
    return themes[mode].colors;
  }

  /**
   * Apply custom branding colors
   */
  applyBranding(colors: Partial<Theme['colors']>): void {
    if (typeof window === 'undefined') return;

    const root = document.documentElement;
    Object.entries(colors).forEach(([key, value]) => {
      if (value) {
        root.style.setProperty(`--color-${this.kebabCase(key)}`, value);
      }
    });
  }
}

// Export singleton instance
export const themeService = new ThemeService();
