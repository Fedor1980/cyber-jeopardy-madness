/**
 * Version Control & Versioning for NexusOS Documentation Platform
 *
 * Enables document versioning, version switching, diff viewing, and change tracking
 * Integrates with Git for version management
 */

class VersionControl {
  constructor(config = {}) {
    this.config = {
      versionsEndpoint: config.versionsEndpoint || '/api/versions',
      currentVersion: config.currentVersion || 'latest',
      availableVersions: config.availableVersions || [],
      enableVersionSwitcher: config.enableVersionSwitcher !== false,
      enableDiffViewer: config.enableDiffViewer !== false,
      enableChangeTracking: config.enableChangeTracking !== false,
      showDeprecationNotices: config.showDeprecationNotices !== false,
      versionFormat: config.versionFormat || 'semver', // semver, date, custom
      storageKey: 'nexusos-selected-version',
      defaultVersion: config.defaultVersion || 'latest'
    };

    this.currentVersion = this.loadSelectedVersion();
    this.versions = [];
    this.versionMetadata = new Map();

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

    // Load available versions
    await this.loadVersions();

    // Setup version switcher UI
    if (this.config.enableVersionSwitcher) {
      this.createVersionSwitcher();
    }

    // Show deprecation notices
    if (this.config.showDeprecationNotices) {
      this.showDeprecationNotice();
    }

    // Track changes if enabled
    if (this.config.enableChangeTracking) {
      this.trackPageChanges();
    }

    this.log('Version Control initialized', {
      current: this.currentVersion,
      available: this.versions.length
    });
  }

  async loadVersions() {
    try {
      // Try to load versions from API
      const response = await fetch(this.config.versionsEndpoint);

      if (response.ok) {
        const data = await response.json();
        this.versions = data.versions || [];
        this.parseVersionMetadata(data);
      } else {
        // Fallback to config versions
        this.versions = this.config.availableVersions;
      }
    } catch (error) {
      this.log('Failed to load versions from API, using config', error);
      this.versions = this.config.availableVersions;
    }

    // Ensure current version is in the list
    if (this.versions.length === 0) {
      this.versions = [this.currentVersion];
    }
  }

  parseVersionMetadata(data) {
    if (data.metadata) {
      Object.keys(data.metadata).forEach(version => {
        this.versionMetadata.set(version, data.metadata[version]);
      });
    }
  }

  createVersionSwitcher() {
    const switcher = document.createElement('div');
    switcher.className = 'version-switcher';
    switcher.innerHTML = `
      <button class="version-switcher-btn" title="Switch version">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
          <path d="M8 2v12M8 2l3 3M8 2L5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <span class="current-version-label">${this.formatVersionLabel(this.currentVersion)}</span>
        <svg class="dropdown-icon" width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div class="version-dropdown">
        <div class="version-dropdown-header">
          <span>Select Version</span>
          ${this.config.enableDiffViewer ? '<button class="compare-versions-btn">Compare</button>' : ''}
        </div>
        <div class="version-list">
          ${this.renderVersionList()}
        </div>
      </div>
    `;

    document.body.appendChild(switcher);

    this.setupSwitcherEvents(switcher);
  }

  renderVersionList() {
    return this.versions.map(version => {
      const metadata = this.versionMetadata.get(version) || {};
      const isCurrent = version === this.currentVersion;
      const isLatest = version === 'latest' || version === this.versions[0];
      const isDeprecated = metadata.deprecated || false;

      return `
        <div class="version-item ${isCurrent ? 'current' : ''} ${isDeprecated ? 'deprecated' : ''}"
             data-version="${version}">
          <div class="version-info">
            <div class="version-name">
              ${this.formatVersionLabel(version)}
              ${isLatest ? '<span class="version-badge latest">Latest</span>' : ''}
              ${isDeprecated ? '<span class="version-badge deprecated">Deprecated</span>' : ''}
              ${isCurrent ? '<span class="version-badge current">Current</span>' : ''}
            </div>
            ${metadata.releaseDate ? `<div class="version-date">${this.formatDate(metadata.releaseDate)}</div>` : ''}
            ${metadata.description ? `<div class="version-description">${metadata.description}</div>` : ''}
          </div>
          ${!isCurrent ? '<button class="switch-version-btn">Switch</button>' : ''}
        </div>
      `;
    }).join('');
  }

  setupSwitcherEvents(switcher) {
    const btn = switcher.querySelector('.version-switcher-btn');
    const dropdown = switcher.querySelector('.version-dropdown');
    const compareBtn = switcher.querySelector('.compare-versions-btn');

    // Toggle dropdown
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.classList.toggle('active');
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!switcher.contains(e.target)) {
        dropdown.classList.remove('active');
      }
    });

    // Version switch
    switcher.querySelectorAll('.switch-version-btn').forEach(switchBtn => {
      switchBtn.addEventListener('click', (e) => {
        const versionItem = e.target.closest('.version-item');
        const version = versionItem.dataset.version;
        this.switchToVersion(version);
      });
    });

    // Compare versions
    if (compareBtn) {
      compareBtn.addEventListener('click', () => {
        this.openDiffViewer();
        dropdown.classList.remove('active');
      });
    }
  }

  switchToVersion(version) {
    if (version === this.currentVersion) return;

    // Save selection
    this.currentVersion = version;
    this.saveSelectedVersion(version);

    // Redirect to versioned URL
    const newUrl = this.getVersionedUrl(version);
    window.location.href = newUrl;
  }

  getVersionedUrl(version) {
    const url = new URL(window.location.href);

    // Handle different versioning URL patterns
    if (version === 'latest') {
      // Remove version from path
      url.pathname = url.pathname.replace(/\/v[\d.]+\//, '/');
      url.searchParams.delete('version');
    } else {
      // Add version to path or query
      if (url.pathname.includes('/v')) {
        url.pathname = url.pathname.replace(/\/v[\d.]+\//, `/v${version}/`);
      } else {
        url.searchParams.set('version', version);
      }
    }

    return url.toString();
  }

  openDiffViewer() {
    const viewer = document.createElement('div');
    viewer.className = 'diff-viewer-modal';
    viewer.innerHTML = `
      <div class="diff-viewer-container">
        <div class="diff-viewer-header">
          <h3>Compare Versions</h3>
          <button class="close-diff-btn">✕</button>
        </div>

        <div class="diff-viewer-controls">
          <div class="version-selector">
            <label>From:</label>
            <select class="from-version-select">
              ${this.versions.map(v => `<option value="${v}">${this.formatVersionLabel(v)}</option>`).join('')}
            </select>
          </div>
          <div class="version-selector">
            <label>To:</label>
            <select class="to-version-select">
              ${this.versions.map(v =>
                `<option value="${v}" ${v === this.currentVersion ? 'selected' : ''}>${this.formatVersionLabel(v)}</option>`
              ).join('')}
            </select>
          </div>
          <button class="compare-btn">Compare</button>
        </div>

        <div class="diff-viewer-content">
          <div class="diff-loading">
            <div class="spinner"></div>
            <p>Select versions to compare</p>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(viewer);

    this.setupDiffViewerEvents(viewer);

    // Animate in
    requestAnimationFrame(() => {
      viewer.classList.add('active');
    });
  }

  setupDiffViewerEvents(viewer) {
    const closeBtn = viewer.querySelector('.close-diff-btn');
    const compareBtn = viewer.querySelector('.compare-btn');
    const fromSelect = viewer.querySelector('.from-version-select');
    const toSelect = viewer.querySelector('.to-version-select');
    const content = viewer.querySelector('.diff-viewer-content');

    // Close
    const closeDiff = () => {
      viewer.classList.remove('active');
      setTimeout(() => viewer.remove(), 300);
    };

    closeBtn.addEventListener('click', closeDiff);
    viewer.addEventListener('click', (e) => {
      if (e.target === viewer) closeDiff();
    });

    // Compare
    compareBtn.addEventListener('click', async () => {
      const fromVersion = fromSelect.value;
      const toVersion = toSelect.value;

      content.innerHTML = '<div class="diff-loading"><div class="spinner"></div><p>Loading diff...</p></div>';

      try {
        const diff = await this.fetchDiff(fromVersion, toVersion);
        this.renderDiff(content, diff, fromVersion, toVersion);
      } catch (error) {
        content.innerHTML = `
          <div class="diff-error">
            <p>Failed to load diff</p>
            <small>${error.message}</small>
          </div>
        `;
      }
    });
  }

  async fetchDiff(fromVersion, toVersion) {
    // Try to fetch diff from API
    try {
      const response = await fetch(
        `${this.config.versionsEndpoint}/diff?from=${fromVersion}&to=${toVersion}&page=${encodeURIComponent(window.location.pathname)}`
      );

      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      this.log('API diff failed, using client-side diff', error);
    }

    // Fallback: client-side diff
    return this.generateClientSideDiff(fromVersion, toVersion);
  }

  async generateClientSideDiff(fromVersion, toVersion) {
    // Fetch both versions of the page
    const fromUrl = this.getVersionedContentUrl(fromVersion);
    const toUrl = this.getVersionedContentUrl(toVersion);

    const [fromResponse, toResponse] = await Promise.all([
      fetch(fromUrl),
      fetch(toUrl)
    ]);

    const fromText = await fromResponse.text();
    const toText = await toResponse.text();

    // Simple line-by-line diff
    return this.computeLineDiff(fromText, toText);
  }

  getVersionedContentUrl(version) {
    return this.getVersionedUrl(version);
  }

  computeLineDiff(fromText, toText) {
    const fromLines = fromText.split('\n');
    const toLines = toText.split('\n');

    const diff = [];
    let i = 0, j = 0;

    while (i < fromLines.length || j < toLines.length) {
      if (i >= fromLines.length) {
        // Added lines
        diff.push({ type: 'added', content: toLines[j], lineNum: j + 1 });
        j++;
      } else if (j >= toLines.length) {
        // Removed lines
        diff.push({ type: 'removed', content: fromLines[i], lineNum: i + 1 });
        i++;
      } else if (fromLines[i] === toLines[j]) {
        // Unchanged
        diff.push({ type: 'unchanged', content: fromLines[i], lineNum: i + 1 });
        i++;
        j++;
      } else {
        // Changed
        diff.push({ type: 'removed', content: fromLines[i], lineNum: i + 1 });
        diff.push({ type: 'added', content: toLines[j], lineNum: j + 1 });
        i++;
        j++;
      }
    }

    return { changes: diff };
  }

  renderDiff(container, diff, fromVersion, toVersion) {
    const changes = diff.changes || [];

    container.innerHTML = `
      <div class="diff-summary">
        <div class="diff-stats">
          <span class="stat added">
            +${changes.filter(c => c.type === 'added').length} additions
          </span>
          <span class="stat removed">
            -${changes.filter(c => c.type === 'removed').length} deletions
          </span>
        </div>
      </div>

      <div class="diff-content">
        ${changes.map(change => `
          <div class="diff-line diff-${change.type}">
            <span class="line-num">${change.lineNum || ''}</span>
            <span class="line-indicator">${this.getDiffIndicator(change.type)}</span>
            <span class="line-content">${this.escapeHTML(change.content)}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  getDiffIndicator(type) {
    switch (type) {
      case 'added': return '+';
      case 'removed': return '-';
      case 'unchanged': return ' ';
      default: return ' ';
    }
  }

  showDeprecationNotice() {
    const metadata = this.versionMetadata.get(this.currentVersion);

    if (metadata && metadata.deprecated) {
      const notice = document.createElement('div');
      notice.className = 'deprecation-notice';
      notice.innerHTML = `
        <div class="deprecation-content">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 2L2 18h16L10 2z" stroke="currentColor" stroke-width="2"/>
            <path d="M10 8v4M10 14v1" stroke="currentColor" stroke-width="2"/>
          </svg>
          <div class="deprecation-text">
            <strong>This version (${this.formatVersionLabel(this.currentVersion)}) is deprecated</strong>
            <p>${metadata.deprecationMessage || 'Please upgrade to the latest version.'}</p>
            ${metadata.sunsetDate ? `<p><small>End of support: ${this.formatDate(metadata.sunsetDate)}</small></p>` : ''}
          </div>
          <button class="upgrade-version-btn">View Latest</button>
        </div>
        <button class="close-notice-btn">✕</button>
      `;

      document.body.insertBefore(notice, document.body.firstChild);

      // Upgrade button
      notice.querySelector('.upgrade-version-btn').addEventListener('click', () => {
        this.switchToVersion('latest');
      });

      // Close notice
      notice.querySelector('.close-notice-btn').addEventListener('click', () => {
        notice.remove();
      });
    }
  }

  trackPageChanges() {
    const metadata = this.versionMetadata.get(this.currentVersion);

    if (metadata && metadata.changelog) {
      this.showChangeIndicators(metadata.changelog);
    }
  }

  showChangeIndicators(changelog) {
    // Mark changed sections with indicators
    changelog.forEach(change => {
      if (change.elementSelector) {
        const elements = document.querySelectorAll(change.elementSelector);

        elements.forEach(el => {
          const indicator = document.createElement('span');
          indicator.className = 'change-indicator';
          indicator.title = `${change.type}: ${change.description}`;
          indicator.innerHTML = change.type === 'new' ? '🆕' : '✏️';

          el.style.position = 'relative';
          el.appendChild(indicator);
        });
      }
    });
  }

  formatVersionLabel(version) {
    if (version === 'latest') return 'Latest';
    if (this.config.versionFormat === 'semver') {
      return `v${version}`;
    }
    return version;
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  loadSelectedVersion() {
    // Check URL first
    const urlParams = new URLSearchParams(window.location.search);
    const urlVersion = urlParams.get('version');
    if (urlVersion) return urlVersion;

    // Check path for version
    const pathMatch = window.location.pathname.match(/\/v([\d.]+)\//);
    if (pathMatch) return pathMatch[1];

    // Check localStorage
    try {
      const saved = localStorage.getItem(this.config.storageKey);
      if (saved) return saved;
    } catch (error) {
      this.log('Failed to load version from storage', error);
    }

    return this.config.currentVersion || this.config.defaultVersion;
  }

  saveSelectedVersion(version) {
    try {
      localStorage.setItem(this.config.storageKey, version);
    } catch (error) {
      this.log('Failed to save version to storage', error);
    }
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  injectStyles() {
    if (document.getElementById('version-control-styles')) return;

    const style = document.createElement('style');
    style.id = 'version-control-styles';
    style.textContent = `
      /* Version Switcher */
      .version-switcher {
        position: fixed;
        top: 1rem;
        right: 10rem;
        z-index: 1000;
      }

      .version-switcher-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 8px 16px;
        background: var(--color-bg-secondary, #1e293b);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .version-switcher-btn:hover {
        background: var(--color-bg-primary, #0f172a);
        border-color: var(--color-accent, #6366f1);
      }

      .dropdown-icon {
        transition: transform 0.2s;
      }

      .version-dropdown.active ~ .version-switcher-btn .dropdown-icon {
        transform: rotate(180deg);
      }

      .version-dropdown {
        position: absolute;
        top: calc(100% + 8px);
        right: 0;
        width: 400px;
        max-height: 500px;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 8px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
        opacity: 0;
        visibility: hidden;
        transform: translateY(-10px);
        transition: all 0.2s;
        overflow: hidden;
      }

      .version-dropdown.active {
        opacity: 1;
        visibility: visible;
        transform: translateY(0);
      }

      .version-dropdown-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border, #334155);
        font-weight: 600;
        font-size: 14px;
      }

      .compare-versions-btn {
        padding: 4px 12px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }

      .version-list {
        max-height: 400px;
        overflow-y: auto;
      }

      .version-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 16px;
        border-bottom: 1px solid var(--color-border, #334155);
        transition: background 0.2s;
      }

      .version-item:hover {
        background: var(--color-bg-primary, #0f172a);
      }

      .version-item.current {
        background: rgba(99, 102, 241, 0.1);
      }

      .version-item.deprecated {
        opacity: 0.6;
      }

      .version-info {
        flex: 1;
      }

      .version-name {
        display: flex;
        align-items: center;
        gap: 8px;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 4px;
      }

      .version-badge {
        padding: 2px 8px;
        border-radius: 4px;
        font-size: 11px;
        font-weight: 600;
        text-transform: uppercase;
      }

      .version-badge.latest {
        background: #10b981;
        color: white;
      }

      .version-badge.deprecated {
        background: #ef4444;
        color: white;
      }

      .version-badge.current {
        background: var(--color-accent, #6366f1);
        color: white;
      }

      .version-date,
      .version-description {
        font-size: 12px;
        color: var(--color-text-secondary, #94a3b8);
        margin-top: 2px;
      }

      .switch-version-btn {
        padding: 6px 14px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 6px;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .switch-version-btn:hover {
        background: var(--color-accent-hover, #4f46e5);
      }

      /* Deprecation Notice */
      .deprecation-notice {
        position: sticky;
        top: 0;
        z-index: 999;
        background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
        color: #1e293b;
        padding: 16px 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      .deprecation-content {
        display: flex;
        align-items: center;
        gap: 16px;
        max-width: 1200px;
        margin: 0 auto;
      }

      .deprecation-text {
        flex: 1;
      }

      .deprecation-text strong {
        display: block;
        margin-bottom: 4px;
      }

      .deprecation-text p {
        margin: 0;
        font-size: 14px;
      }

      .upgrade-version-btn {
        padding: 8px 20px;
        background: #1e293b;
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
        white-space: nowrap;
      }

      .close-notice-btn {
        padding: 4px 8px;
        background: transparent;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: #1e293b;
      }

      /* Diff Viewer */
      .diff-viewer-modal {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10001;
        opacity: 0;
        transition: opacity 0.3s;
        padding: 20px;
      }

      .diff-viewer-modal.active {
        opacity: 1;
      }

      .diff-viewer-container {
        width: 100%;
        max-width: 1200px;
        height: 90vh;
        background: var(--color-bg-secondary, #1e293b);
        border-radius: 12px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }

      .diff-viewer-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 16px 20px;
        background: var(--color-bg-primary, #0f172a);
        border-bottom: 1px solid var(--color-border, #334155);
      }

      .diff-viewer-controls {
        display: flex;
        align-items: center;
        gap: 16px;
        padding: 16px 20px;
        background: var(--color-bg-primary, #0f172a);
        border-bottom: 1px solid var(--color-border, #334155);
      }

      .version-selector {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .version-selector select {
        padding: 6px 12px;
        background: var(--color-bg-secondary, #1e293b);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
      }

      .compare-btn {
        padding: 6px 20px;
        background: var(--color-accent, #6366f1);
        color: white;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }

      .diff-viewer-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .diff-summary {
        margin-bottom: 20px;
      }

      .diff-stats {
        display: flex;
        gap: 16px;
        font-size: 14px;
        font-weight: 600;
      }

      .stat.added {
        color: #10b981;
      }

      .stat.removed {
        color: #ef4444;
      }

      .diff-content {
        font-family: 'Courier New', monospace;
        font-size: 13px;
        line-height: 1.6;
      }

      .diff-line {
        display: flex;
        align-items: center;
        padding: 2px 8px;
      }

      .diff-line.diff-added {
        background: rgba(16, 185, 129, 0.15);
        color: #10b981;
      }

      .diff-line.diff-removed {
        background: rgba(239, 68, 68, 0.15);
        color: #ef4444;
      }

      .line-num {
        width: 50px;
        text-align: right;
        color: var(--color-text-secondary, #64748b);
        margin-right: 16px;
      }

      .line-indicator {
        width: 20px;
        font-weight: bold;
      }

      .line-content {
        flex: 1;
        white-space: pre-wrap;
      }

      .spinner {
        width: 40px;
        height: 40px;
        border: 4px solid rgba(255, 255, 255, 0.1);
        border-top-color: var(--color-accent, #6366f1);
        border-radius: 50%;
        animation: spin 1s linear infinite;
      }

      @keyframes spin {
        to { transform: rotate(360deg); }
      }

      .diff-loading,
      .diff-error {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 60px 20px;
        text-align: center;
      }

      /* Change Indicators */
      .change-indicator {
        position: absolute;
        top: -8px;
        right: -8px;
        font-size: 16px;
        cursor: help;
      }

      /* Mobile responsiveness */
      @media (max-width: 768px) {
        .version-switcher {
          right: 1rem;
        }

        .version-dropdown {
          width: 300px;
        }

        .diff-viewer-controls {
          flex-direction: column;
          align-items: stretch;
        }
      }
    `;

    document.head.appendChild(style);
  }

  log(...args) {
    console.log('[VersionControl]', ...args);
  }
}

// Auto-initialize if config provided
if (window.versionConfig) {
  window.versionControl = new VersionControl(window.versionConfig);
} else {
  // Initialize with defaults
  window.versionControl = new VersionControl();
}

// Make class available globally
window.VersionControl = VersionControl;

// Example configuration (add to your HTML):
/*
<script>
window.versionConfig = {
  currentVersion: '2.1.0',
  availableVersions: ['latest', '2.1.0', '2.0.0', '1.5.0'],
  versionsEndpoint: '/api/versions',
  enableVersionSwitcher: true,
  enableDiffViewer: true,
  enableChangeTracking: true,
  showDeprecationNotices: true
};
</script>
<script src="/js/version-control.js"></script>
*/
