/**
 * Advanced Search Filters for NexusOS Documentation Platform
 *
 * Enhances search with faceted filtering, date ranges, sorting, and advanced queries
 */

class AdvancedSearch {
  constructor(config = {}) {
    this.config = {
      searchIndexUrl: config.searchIndexUrl || '/search-index.json',
      enableFilters: config.enableFilters !== false,
      enableDateFilter: config.enableDateFilter !== false,
      enableAuthorFilter: config.enableAuthorFilter !== false,
      enableTagFilter: config.enableTagFilter !== false,
      enableTypeFilter: config.enableTypeFilter !== false,
      enableSorting: config.enableSorting !== false,
      enableSavedSearches: config.enableSavedSearches !== false,
      minScore: config.minScore || 0.3,
      resultsPerPage: config.resultsPerPage || 20
    };

    this.searchIndex = null;
    this.results = [];
    this.filters = {
      dateRange: { from: null, to: null },
      authors: [],
      tags: [],
      types: [],
      version: null
    };
    this.sortBy = 'relevance'; // relevance, date, title, popularity
    this.currentPage = 1;

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

    // Load search index
    await this.loadSearchIndex();

    // Setup advanced search UI
    this.setupAdvancedSearchUI();

    // Enhance existing search
    this.enhanceSearch();

    this.log('Advanced Search initialized');
  }

  async loadSearchIndex() {
    try {
      const response = await fetch(this.config.searchIndexUrl);
      this.searchIndex = await response.json();
      this.log('Search index loaded:', this.searchIndex.documents?.length, 'documents');
    } catch (error) {
      this.log('Failed to load search index', error);
    }
  }

  setupAdvancedSearchUI() {
    // Find existing search input
    const searchInput = document.querySelector('#doc-search-input, input[type="search"]');
    if (!searchInput) return;

    // Add advanced search toggle
    const container = searchInput.parentElement;
    const toggleBtn = document.createElement('button');
    toggleBtn.className = 'advanced-search-toggle';
    toggleBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M2 4h5M11 4h3M2 8h3M9 8h5M2 12h3M9 12h5" stroke="currentColor" stroke-width="2"/>
        <circle cx="8" cy="4" r="2" fill="currentColor"/>
        <circle cx="6" cy="8" r="2" fill="currentColor"/>
        <circle cx="6" cy="12" r="2" fill="currentColor"/>
      </svg>
      Filters
    `;
    toggleBtn.title = 'Advanced Filters';

    container.appendChild(toggleBtn);

    toggleBtn.addEventListener('click', () => {
      this.openFilterPanel();
    });

    // Add search suggestions
    this.setupSearchSuggestions(searchInput);
  }

  openFilterPanel() {
    const panel = document.createElement('div');
    panel.className = 'advanced-search-panel';
    panel.innerHTML = `
      <div class="search-panel-container">
        <div class="search-panel-header">
          <h3>🔍 Advanced Search</h3>
          <button class="close-panel-btn">✕</button>
        </div>

        <div class="search-panel-body">
          <!-- Query Builder -->
          <div class="search-section">
            <h4>Search Query</h4>
            <input type="text" class="advanced-search-input" placeholder="Enter search terms...">
            <div class="query-options">
              <label>
                <input type="checkbox" class="exact-match-cb"> Exact phrase
              </label>
              <label>
                <input type="checkbox" class="case-sensitive-cb"> Case sensitive
              </label>
            </div>
          </div>

          ${this.config.enableTypeFilter ? this.renderTypeFilter() : ''}
          ${this.config.enableDateFilter ? this.renderDateFilter() : ''}
          ${this.config.enableTagFilter ? this.renderTagFilter() : ''}
          ${this.config.enableAuthorFilter ? this.renderAuthorFilter() : ''}
          ${this.config.enableSorting ? this.renderSortingOptions() : ''}

          <!-- Active Filters -->
          <div class="search-section">
            <h4>Active Filters</h4>
            <div class="active-filters-list">
              ${this.renderActiveFilters()}
            </div>
          </div>
        </div>

        <div class="search-panel-footer">
          <button class="clear-filters-btn">Clear All</button>
          <button class="apply-search-btn">Search</button>
        </div>
      </div>
    `;

    document.body.appendChild(panel);

    this.setupFilterPanelEvents(panel);

    // Animate in
    requestAnimationFrame(() => {
      panel.classList.add('active');
    });
  }

  renderTypeFilter() {
    const types = this.getAvailableTypes();

    return `
      <div class="search-section">
        <h4>Content Type</h4>
        <div class="filter-options">
          ${types.map(type => `
            <label class="filter-checkbox">
              <input type="checkbox" value="${type}" class="type-filter">
              <span>${this.formatTypeName(type)}</span>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderDateFilter() {
    return `
      <div class="search-section">
        <h4>Date Range</h4>
        <div class="date-filter">
          <input type="date" class="date-from-input" placeholder="From">
          <span>to</span>
          <input type="date" class="date-to-input" placeholder="To">
        </div>
        <div class="date-presets">
          <button class="preset-btn" data-range="7">Last 7 days</button>
          <button class="preset-btn" data-range="30">Last month</button>
          <button class="preset-btn" data-range="365">Last year</button>
        </div>
      </div>
    `;
  }

  renderTagFilter() {
    const tags = this.getAvailableTags();

    return `
      <div class="search-section">
        <h4>Tags</h4>
        <div class="filter-tags">
          ${tags.slice(0, 10).map(tag => `
            <button class="tag-filter-btn" data-tag="${tag}">
              ${tag}
            </button>
          `).join('')}
        </div>
        ${tags.length > 10 ? '<button class="show-more-tags">Show more...</button>' : ''}
      </div>
    `;
  }

  renderAuthorFilter() {
    const authors = this.getAvailableAuthors();

    return `
      <div class="search-section">
        <h4>Author</h4>
        <select class="author-filter-select" multiple>
          ${authors.map(author => `
            <option value="${author}">${author}</option>
          `).join('')}
        </select>
      </div>
    `;
  }

  renderSortingOptions() {
    return `
      <div class="search-section">
        <h4>Sort By</h4>
        <select class="sort-select">
          <option value="relevance">Relevance</option>
          <option value="date">Date (newest first)</option>
          <option value="date-asc">Date (oldest first)</option>
          <option value="title">Title (A-Z)</option>
          <option value="title-desc">Title (Z-A)</option>
          <option value="popularity">Popularity</option>
        </select>
      </div>
    `;
  }

  renderActiveFilters() {
    const active = [];

    if (this.filters.types.length > 0) {
      active.push(...this.filters.types.map(t => ({ type: 'type', value: t })));
    }

    if (this.filters.tags.length > 0) {
      active.push(...this.filters.tags.map(t => ({ type: 'tag', value: t })));
    }

    if (this.filters.authors.length > 0) {
      active.push(...this.filters.authors.map(a => ({ type: 'author', value: a })));
    }

    if (this.filters.dateRange.from || this.filters.dateRange.to) {
      const from = this.filters.dateRange.from || 'any';
      const to = this.filters.dateRange.to || 'any';
      active.push({ type: 'date', value: `${from} to ${to}` });
    }

    if (active.length === 0) {
      return '<p class="no-filters">No filters applied</p>';
    }

    return active.map(filter => `
      <div class="active-filter-tag" data-type="${filter.type}" data-value="${filter.value}">
        <span>${filter.type}: ${filter.value}</span>
        <button class="remove-filter-btn">✕</button>
      </div>
    `).join('');
  }

  setupFilterPanelEvents(panel) {
    const closeBtn = panel.querySelector('.close-panel-btn');
    const applyBtn = panel.querySelector('.apply-search-btn');
    const clearBtn = panel.querySelector('.clear-filters-btn');
    const searchInput = panel.querySelector('.advanced-search-input');

    // Close panel
    const closePanel = () => {
      panel.classList.remove('active');
      setTimeout(() => panel.remove(), 300);
    };

    closeBtn.addEventListener('click', closePanel);

    // Apply search
    applyBtn.addEventListener('click', () => {
      const query = searchInput.value.trim();
      this.performAdvancedSearch(query);
      closePanel();
    });

    // Clear filters
    clearBtn.addEventListener('click', () => {
      this.clearFilters();
      this.refreshFilterPanel(panel);
    });

    // Type filters
    panel.querySelectorAll('.type-filter').forEach(cb => {
      cb.addEventListener('change', (e) => {
        if (e.target.checked) {
          this.filters.types.push(e.target.value);
        } else {
          this.filters.types = this.filters.types.filter(t => t !== e.target.value);
        }
        this.refreshFilterPanel(panel);
      });
    });

    // Tag filters
    panel.querySelectorAll('.tag-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tag = e.target.dataset.tag;
        if (this.filters.tags.includes(tag)) {
          this.filters.tags = this.filters.tags.filter(t => t !== tag);
          e.target.classList.remove('active');
        } else {
          this.filters.tags.push(tag);
          e.target.classList.add('active');
        }
        this.refreshFilterPanel(panel);
      });
    });

    // Date filters
    const dateFrom = panel.querySelector('.date-from-input');
    const dateTo = panel.querySelector('.date-to-input');

    if (dateFrom && dateTo) {
      dateFrom.addEventListener('change', (e) => {
        this.filters.dateRange.from = e.target.value;
        this.refreshFilterPanel(panel);
      });

      dateTo.addEventListener('change', (e) => {
        this.filters.dateRange.to = e.target.value;
        this.refreshFilterPanel(panel);
      });

      // Date presets
      panel.querySelectorAll('.preset-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const days = parseInt(e.target.dataset.range);
          const to = new Date();
          const from = new Date();
          from.setDate(from.getDate() - days);

          dateFrom.value = from.toISOString().split('T')[0];
          dateTo.value = to.toISOString().split('T')[0];

          this.filters.dateRange.from = dateFrom.value;
          this.filters.dateRange.to = dateTo.value;
          this.refreshFilterPanel(panel);
        });
      });
    }

    // Sort select
    const sortSelect = panel.querySelector('.sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.sortBy = e.target.value;
      });
    }

    // Remove active filter
    panel.querySelectorAll('.remove-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterTag = e.target.closest('.active-filter-tag');
        const type = filterTag.dataset.type;
        const value = filterTag.dataset.value;

        this.removeFilter(type, value);
        this.refreshFilterPanel(panel);
      });
    });
  }

  refreshFilterPanel(panel) {
    const activeFiltersEl = panel.querySelector('.active-filters-list');
    activeFiltersEl.innerHTML = this.renderActiveFilters();

    // Re-setup remove buttons
    activeFiltersEl.querySelectorAll('.remove-filter-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filterTag = e.target.closest('.active-filter-tag');
        this.removeFilter(filterTag.dataset.type, filterTag.dataset.value);
        this.refreshFilterPanel(panel);
      });
    });
  }

  removeFilter(type, value) {
    if (type === 'type') {
      this.filters.types = this.filters.types.filter(t => t !== value);
    } else if (type === 'tag') {
      this.filters.tags = this.filters.tags.filter(t => t !== value);
    } else if (type === 'author') {
      this.filters.authors = this.filters.authors.filter(a => a !== value);
    } else if (type === 'date') {
      this.filters.dateRange = { from: null, to: null };
    }
  }

  clearFilters() {
    this.filters = {
      dateRange: { from: null, to: null },
      authors: [],
      tags: [],
      types: [],
      version: null
    };
    this.sortBy = 'relevance';
  }

  performAdvancedSearch(query) {
    if (!this.searchIndex || !this.searchIndex.documents) {
      this.log('Search index not loaded');
      return;
    }

    // Filter documents
    let results = this.searchIndex.documents.filter(doc => {
      // Text match
      if (query) {
        const searchText = (doc.title + ' ' + doc.content).toLowerCase();
        if (!searchText.includes(query.toLowerCase())) {
          return false;
        }
      }

      // Type filter
      if (this.filters.types.length > 0 && !this.filters.types.includes(doc.type)) {
        return false;
      }

      // Tag filter
      if (this.filters.tags.length > 0) {
        const docTags = doc.tags || [];
        if (!this.filters.tags.some(tag => docTags.includes(tag))) {
          return false;
        }
      }

      // Author filter
      if (this.filters.authors.length > 0 && !this.filters.authors.includes(doc.author)) {
        return false;
      }

      // Date filter
      if (this.filters.dateRange.from || this.filters.dateRange.to) {
        const docDate = new Date(doc.last_updated || doc.date);

        if (this.filters.dateRange.from) {
          const fromDate = new Date(this.filters.dateRange.from);
          if (docDate < fromDate) return false;
        }

        if (this.filters.dateRange.to) {
          const toDate = new Date(this.filters.dateRange.to);
          if (docDate > toDate) return false;
        }
      }

      return true;
    });

    // Sort results
    results = this.sortResults(results, query);

    // Display results
    this.displayResults(results, query);

    this.results = results;
  }

  sortResults(results, query) {
    switch (this.sortBy) {
      case 'relevance':
        return this.sortByRelevance(results, query);

      case 'date':
        return results.sort((a, b) => {
          const dateA = new Date(a.last_updated || a.date || 0);
          const dateB = new Date(b.last_updated || b.date || 0);
          return dateB - dateA;
        });

      case 'date-asc':
        return results.sort((a, b) => {
          const dateA = new Date(a.last_updated || a.date || 0);
          const dateB = new Date(b.last_updated || b.date || 0);
          return dateA - dateB;
        });

      case 'title':
        return results.sort((a, b) => a.title.localeCompare(b.title));

      case 'title-desc':
        return results.sort((a, b) => b.title.localeCompare(a.title));

      case 'popularity':
        return results.sort((a, b) => (b.views || 0) - (a.views || 0));

      default:
        return results;
    }
  }

  sortByRelevance(results, query) {
    if (!query) return results;

    return results.map(doc => {
      let score = 0;
      const lowerQuery = query.toLowerCase();
      const lowerTitle = doc.title.toLowerCase();
      const lowerContent = (doc.content || '').toLowerCase();

      // Title exact match
      if (lowerTitle === lowerQuery) score += 100;
      // Title contains
      else if (lowerTitle.includes(lowerQuery)) score += 50;

      // Content match frequency
      const matches = (lowerContent.match(new RegExp(lowerQuery, 'g')) || []).length;
      score += matches * 5;

      return { ...doc, _score: score };
    }).sort((a, b) => b._score - a._score);
  }

  displayResults(results, query) {
    // Create or find results container
    let container = document.querySelector('.search-results-container');

    if (!container) {
      container = document.createElement('div');
      container.className = 'search-results-container';
      document.body.appendChild(container);
    }

    container.innerHTML = `
      <div class="search-results-header">
        <h2>Search Results</h2>
        <p>${results.length} result${results.length !== 1 ? 's' : ''} found for "${query}"</p>
        <button class="close-results-btn">✕</button>
      </div>

      <div class="search-results-list">
        ${results.slice(0, this.config.resultsPerPage).map(doc => this.renderSearchResult(doc)).join('')}
      </div>

      ${results.length > this.config.resultsPerPage ? `
        <div class="search-pagination">
          <button class="load-more-btn">Load More</button>
        </div>
      ` : ''}
    `;

    container.classList.add('active');

    // Close button
    container.querySelector('.close-results-btn').addEventListener('click', () => {
      container.classList.remove('active');
    });
  }

  renderSearchResult(doc) {
    return `
      <div class="search-result-item">
        <div class="result-header">
          <a href="${doc.url}" class="result-title">${this.highlightText(doc.title)}</a>
          ${doc.type ? `<span class="result-type">${this.formatTypeName(doc.type)}</span>` : ''}
        </div>
        <p class="result-snippet">${this.getSnippet(doc)}</p>
        <div class="result-meta">
          ${doc.author ? `<span>👤 ${doc.author}</span>` : ''}
          ${doc.last_updated ? `<span>📅 ${this.formatDate(doc.last_updated)}</span>` : ''}
          ${doc.tags ? `<span>🏷️ ${doc.tags.slice(0, 3).join(', ')}</span>` : ''}
        </div>
      </div>
    `;
  }

  highlightText(text) {
    // Simplified highlighting
    return this.escapeHTML(text);
  }

  getSnippet(doc) {
    const content = doc.content || doc.description || '';
    return content.substring(0, 200) + (content.length > 200 ? '...' : '');
  }

  setupSearchSuggestions(searchInput) {
    let timeout;

    searchInput.addEventListener('input', (e) => {
      clearTimeout(timeout);

      timeout = setTimeout(() => {
        const query = e.target.value.trim();
        if (query.length >= 2) {
          this.showSuggestions(query, searchInput);
        }
      }, 300);
    });
  }

  showSuggestions(query, searchInput) {
    // Simple suggestions based on indexed content
    const suggestions = this.getSuggestions(query);

    let dropdown = document.querySelector('.search-suggestions-dropdown');

    if (!dropdown) {
      dropdown = document.createElement('div');
      dropdown.className = 'search-suggestions-dropdown';
      searchInput.parentElement.appendChild(dropdown);
    }

    if (suggestions.length === 0) {
      dropdown.remove();
      return;
    }

    dropdown.innerHTML = suggestions.slice(0, 5).map(sugg => `
      <div class="suggestion-item" data-query="${sugg}">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="2"/>
          <path d="M9 9l3 3" stroke="currentColor" stroke-width="2"/>
        </svg>
        ${sugg}
      </div>
    `).join('');

    // Click suggestion
    dropdown.querySelectorAll('.suggestion-item').forEach(item => {
      item.addEventListener('click', () => {
        searchInput.value = item.dataset.query;
        dropdown.remove();
        this.performAdvancedSearch(item.dataset.query);
      });
    });
  }

  getSuggestions(query) {
    if (!this.searchIndex || !this.searchIndex.documents) return [];

    const lowerQuery = query.toLowerCase();
    const suggestions = new Set();

    this.searchIndex.documents.forEach(doc => {
      if (doc.title.toLowerCase().includes(lowerQuery)) {
        suggestions.add(doc.title);
      }

      (doc.tags || []).forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    });

    return Array.from(suggestions);
  }

  enhanceSearch() {
    // Enhance existing search functionality
    const existingSearch = window.docSearch || window.search;

    if (existingSearch && typeof existingSearch.search === 'function') {
      const originalSearch = existingSearch.search.bind(existingSearch);

      existingSearch.search = (query) => {
        // Use advanced search if filters are active
        const hasActiveFilters = this.filters.types.length > 0 ||
                                  this.filters.tags.length > 0 ||
                                  this.filters.authors.length > 0 ||
                                  this.filters.dateRange.from ||
                                  this.filters.dateRange.to;

        if (hasActiveFilters) {
          this.performAdvancedSearch(query);
        } else {
          originalSearch(query);
        }
      };
    }
  }

  getAvailableTypes() {
    if (!this.searchIndex || !this.searchIndex.documents) return [];

    const types = new Set();
    this.searchIndex.documents.forEach(doc => {
      if (doc.type) types.add(doc.type);
    });

    return Array.from(types);
  }

  getAvailableTags() {
    if (!this.searchIndex || !this.searchIndex.documents) return [];

    const tags = new Set();
    this.searchIndex.documents.forEach(doc => {
      (doc.tags || []).forEach(tag => tags.add(tag));
    });

    return Array.from(tags).sort();
  }

  getAvailableAuthors() {
    if (!this.searchIndex || !this.searchIndex.documents) return [];

    const authors = new Set();
    this.searchIndex.documents.forEach(doc => {
      if (doc.author) authors.add(doc.author);
    });

    return Array.from(authors).sort();
  }

  formatTypeName(type) {
    return type.charAt(0).toUpperCase() + type.slice(1).replace(/-/g, ' ');
  }

  formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  escapeHTML(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  injectStyles() {
    if (document.getElementById('advanced-search-styles')) return;

    const style = document.createElement('style');
    style.id = 'advanced-search-styles';
    style.textContent = `
      .advanced-search-toggle {
        margin-left: 10px;
        padding: 6px 12px;
        display: flex;
        align-items: center;
        gap: 6px;
        background: var(--color-bg-secondary, #1e293b);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        font-size: 13px;
        cursor: pointer;
        transition: all 0.2s;
      }

      .advanced-search-toggle:hover {
        border-color: var(--color-accent, #6366f1);
      }

      .advanced-search-panel {
        position: fixed;
        top: 0;
        right: 0;
        width: 400px;
        height: 100vh;
        background: var(--color-bg-secondary, #1e293b);
        box-shadow: -5px 0 20px rgba(0, 0, 0, 0.3);
        z-index: 10002;
        transform: translateX(100%);
        transition: transform 0.3s;
        display: flex;
        flex-direction: column;
      }

      .advanced-search-panel.active {
        transform: translateX(0);
      }

      .search-panel-container {
        display: flex;
        flex-direction: column;
        height: 100%;
      }

      .search-panel-header {
        padding: 20px;
        border-bottom: 1px solid var(--color-border, #334155);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .search-panel-header h3 {
        margin: 0;
      }

      .search-panel-body {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .search-section {
        margin-bottom: 24px;
      }

      .search-section h4 {
        margin: 0 0 12px 0;
        font-size: 14px;
        font-weight: 600;
        color: var(--color-text-secondary, #94a3b8);
      }

      .advanced-search-input {
        width: 100%;
        padding: 10px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
      }

      .query-options {
        margin-top: 8px;
        display: flex;
        gap: 12px;
        font-size: 13px;
      }

      .filter-options,
      .filter-tags {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .filter-checkbox {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
      }

      .tag-filter-btn {
        padding: 6px 12px;
        background: var(--color-bg-primary, #0f172a);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        color: var(--color-text-primary, #f1f5f9);
        cursor: pointer;
        transition: all 0.2s;
      }

      .tag-filter-btn.active {
        background: var(--color-accent, #6366f1);
        border-color: var(--color-accent, #6366f1);
        color: white;
      }

      .date-filter {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .date-filter input {
        flex: 1;
        padding: 8px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
      }

      .date-presets {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .preset-btn {
        padding: 6px 12px;
        background: var(--color-bg-primary, #0f172a);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
        font-size: 12px;
        cursor: pointer;
        color: var(--color-text-primary, #f1f5f9);
      }

      .sort-select,
      .author-filter-select {
        width: 100%;
        padding: 8px;
        background: var(--color-bg-primary, #0f172a);
        color: var(--color-text-primary, #f1f5f9);
        border: 1px solid var(--color-border, #334155);
        border-radius: 6px;
      }

      .active-filters-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
      }

      .active-filter-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        background: var(--color-accent, #6366f1);
        color: white;
        border-radius: 6px;
        font-size: 12px;
      }

      .remove-filter-btn {
        background: transparent;
        border: none;
        color: white;
        cursor: pointer;
        font-size: 14px;
      }

      .search-panel-footer {
        padding: 20px;
        border-top: 1px solid var(--color-border, #334155);
        display: flex;
        gap: 12px;
      }

      .clear-filters-btn,
      .apply-search-btn {
        flex: 1;
        padding: 10px;
        border: none;
        border-radius: 6px;
        font-weight: 600;
        cursor: pointer;
      }

      .clear-filters-btn {
        background: transparent;
        color: var(--color-text-secondary, #94a3b8);
        border: 1px solid var(--color-border, #334155);
      }

      .apply-search-btn {
        background: var(--color-accent, #6366f1);
        color: white;
      }

      .search-results-container {
        position: fixed;
        top: 80px;
        left: 50%;
        transform: translateX(-50%);
        width: 90%;
        max-width: 800px;
        max-height: 80vh;
        background: var(--color-bg-secondary, #1e293b);
        border-radius: 12px;
        box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s;
        z-index: 10003;
        display: flex;
        flex-direction: column;
      }

      .search-results-container.active {
        opacity: 1;
        visibility: visible;
      }

      .search-results-header {
        padding: 20px;
        border-bottom: 1px solid var(--color-border, #334155);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .search-results-list {
        flex: 1;
        overflow-y: auto;
        padding: 20px;
      }

      .search-result-item {
        padding: 16px;
        background: var(--color-bg-primary, #0f172a);
        border-radius: 8px;
        margin-bottom: 12px;
      }

      .result-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
      }

      .result-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--color-accent, #6366f1);
        text-decoration: none;
      }

      .result-type {
        padding: 2px 8px;
        background: var(--color-bg-secondary, #1e293b);
        border: 1px solid var(--color-border, #334155);
        border-radius: 4px;
        font-size: 11px;
        text-transform: uppercase;
      }

      .result-snippet {
        font-size: 14px;
        color: var(--color-text-secondary, #94a3b8);
        margin: 8px 0;
      }

      .result-meta {
        display: flex;
        gap: 16px;
        font-size: 12px;
        color: var(--color-text-secondary, #64748b);
      }

      @media (max-width: 768px) {
        .advanced-search-panel {
          width: 100%;
        }
      }
    `;

    document.head.appendChild(style);
  }

  log(...args) {
    console.log('[AdvancedSearch]', ...args);
  }
}

// Auto-initialize
window.advancedSearch = new AdvancedSearch(window.advancedSearchConfig || {});
window.AdvancedSearch = AdvancedSearch;
