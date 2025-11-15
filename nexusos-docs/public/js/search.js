// NexusOS Documentation Search
class DocumentationSearch {
  constructor() {
    this.index = null;
    this.documents = [];
    this.searchInput = null;
    this.resultsContainer = null;
    this.init();
  }

  async init() {
    await this.loadSearchData();
    this.setupUI();
    this.attachEventListeners();
  }

  async loadSearchData() {
    try {
      // Load search index
      const indexResponse = await fetch('/search-index.json');
      const indexData = await indexResponse.json();
      this.index = lunr.Index.load(indexData);

      // Load document manifest for metadata
      const manifestResponse = await fetch('/manifest.json');
      const manifestData = await manifestResponse.json();
      this.documents = manifestData.files;

      console.log('✓ Search index loaded:', this.documents.length, 'documents');
    } catch (error) {
      console.error('Failed to load search data:', error);
    }
  }

  setupUI() {
    // Create search container if it doesn't exist
    if (!document.getElementById('doc-search-container')) {
      const container = document.createElement('div');
      container.id = 'doc-search-container';
      container.innerHTML = `
        <div class="search-wrapper">
          <div class="search-input-wrapper">
            <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            <input
              type="text"
              id="doc-search-input"
              placeholder="Search documentation... (Press '/' to focus)"
              autocomplete="off"
            />
            <kbd class="search-shortcut">/</kbd>
          </div>
          <div id="search-results" class="search-results hidden"></div>
        </div>
      `;

      // Insert at the top of the page
      const body = document.body;
      body.insertBefore(container, body.firstChild);
    }

    this.searchInput = document.getElementById('doc-search-input');
    this.resultsContainer = document.getElementById('search-results');
  }

  attachEventListeners() {
    // Search input
    this.searchInput.addEventListener('input', (e) => {
      this.handleSearch(e.target.value);
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Press '/' to focus search
      if (e.key === '/' && document.activeElement !== this.searchInput) {
        e.preventDefault();
        this.searchInput.focus();
      }

      // Press 'Escape' to clear search
      if (e.key === 'Escape') {
        this.clearSearch();
      }
    });

    // Click outside to close results
    document.addEventListener('click', (e) => {
      if (!e.target.closest('#doc-search-container')) {
        this.hideResults();
      }
    });

    // Focus input to show results if there's a query
    this.searchInput.addEventListener('focus', () => {
      if (this.searchInput.value.trim()) {
        this.handleSearch(this.searchInput.value);
      }
    });
  }

  handleSearch(query) {
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      this.hideResults();
      return;
    }

    if (trimmedQuery.length < 2) {
      this.showResults([]);
      return;
    }

    try {
      // Search the index
      const results = this.index.search(trimmedQuery);

      // Map results to documents
      const mappedResults = results.slice(0, 10).map(result => {
        const doc = this.documents[result.ref];
        return {
          ...doc,
          score: result.score,
          matches: result.matchData.metadata
        };
      });

      this.showResults(mappedResults, trimmedQuery);
    } catch (error) {
      console.error('Search error:', error);
      this.showResults([]);
    }
  }

  showResults(results, query = '') {
    if (!results || results.length === 0) {
      this.resultsContainer.innerHTML = `
        <div class="search-no-results">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p>No results found for "${query}"</p>
          <span class="search-tip">Try different keywords or check spelling</span>
        </div>
      `;
      this.resultsContainer.classList.remove('hidden');
      return;
    }

    const resultsHTML = results.map((result, index) => {
      const category = this.formatCategory(result.category);
      const excerpt = this.generateExcerpt(result, query);

      return `
        <a href="/${result.path.replace('.md', '.html')}" class="search-result-item" data-index="${index}">
          <div class="search-result-header">
            <span class="search-result-category">${category}</span>
            <span class="search-result-score">${Math.round(result.score * 100)}% match</span>
          </div>
          <h3 class="search-result-title">${this.highlightText(result.title, query)}</h3>
          <p class="search-result-excerpt">${excerpt}</p>
          <div class="search-result-path">${result.path}</div>
        </a>
      `;
    }).join('');

    this.resultsContainer.innerHTML = `
      <div class="search-results-header">
        Found ${results.length} result${results.length === 1 ? '' : 's'}
      </div>
      ${resultsHTML}
      <div class="search-results-footer">
        <kbd>↑</kbd><kbd>↓</kbd> to navigate • <kbd>Enter</kbd> to select • <kbd>Esc</kbd> to close
      </div>
    `;

    this.resultsContainer.classList.remove('hidden');
    this.attachResultsNavigation();
  }

  hideResults() {
    this.resultsContainer.classList.add('hidden');
  }

  clearSearch() {
    this.searchInput.value = '';
    this.hideResults();
    this.searchInput.blur();
  }

  formatCategory(category) {
    if (!category) return 'Documentation';

    const categoryMap = {
      '01_api_documentation': 'API',
      '02_user_guides': 'User Guides',
      '03_admin_manual': 'Admin',
      '04_workflow_diagrams': 'Diagrams',
      '05_training_materials': 'Training',
      '06_quick_references': 'Quick Ref',
      '07_integration_guides': 'Integration',
      '08_templates': 'Templates',
      '09_scripts': 'Scripts',
      '10_branding': 'Branding',
      '11_appendices': 'Appendices'
    };

    return categoryMap[category] || category.replace(/_/g, ' ');
  }

  generateExcerpt(doc, query) {
    // Simple excerpt generation
    // In a real implementation, this would extract relevant snippets
    return `Documentation for ${doc.title}...`;
  }

  highlightText(text, query) {
    if (!query) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  }

  attachResultsNavigation() {
    const results = this.resultsContainer.querySelectorAll('.search-result-item');
    let currentIndex = -1;

    this.searchInput.addEventListener('keydown', (e) => {
      if (results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        currentIndex = (currentIndex + 1) % results.length;
        this.highlightResult(results, currentIndex);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        currentIndex = currentIndex <= 0 ? results.length - 1 : currentIndex - 1;
        this.highlightResult(results, currentIndex);
      } else if (e.key === 'Enter' && currentIndex >= 0) {
        e.preventDefault();
        results[currentIndex].click();
      }
    });
  }

  highlightResult(results, index) {
    results.forEach((r, i) => {
      if (i === index) {
        r.classList.add('active');
        r.scrollIntoView({ block: 'nearest' });
      } else {
        r.classList.remove('active');
      }
    });
  }
}

// Initialize search when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    new DocumentationSearch();
  });
} else {
  new DocumentationSearch();
}
