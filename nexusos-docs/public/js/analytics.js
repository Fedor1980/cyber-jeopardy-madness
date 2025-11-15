/**
 * Analytics Tracking for NexusOS Documentation Platform
 *
 * Privacy-first analytics that respects user preferences
 * Supports: Google Analytics, Plausible, Fathom, custom endpoints
 */

class DocumentationAnalytics {
  constructor(config = {}) {
    this.config = {
      provider: config.provider || 'none', // 'ga4', 'plausible', 'fathom', 'custom', 'none'
      trackingId: config.trackingId || '',
      domain: config.domain || window.location.hostname,
      apiEndpoint: config.apiEndpoint || '',
      respectDNT: config.respectDNT !== false, // Respect Do Not Track by default
      trackPageViews: config.trackPageViews !== false,
      trackSearches: config.trackSearches !== false,
      trackDownloads: config.trackDownloads !== false,
      trackOutboundLinks: config.trackOutboundLinks !== false,
      trackScrollDepth: config.trackScrollDepth || false,
      debug: config.debug || false
    };

    this.init();
  }

  init() {
    // Check if tracking is allowed
    if (!this.canTrack()) {
      this.log('Tracking disabled (DNT or consent)');
      return;
    }

    // Initialize provider
    this.initializeProvider();

    // Set up event listeners
    if (this.config.trackPageViews) {
      this.trackPageView();
    }

    if (this.config.trackSearches) {
      this.setupSearchTracking();
    }

    if (this.config.trackDownloads) {
      this.setupDownloadTracking();
    }

    if (this.config.trackOutboundLinks) {
      this.setupOutboundLinkTracking();
    }

    if (this.config.trackScrollDepth) {
      this.setupScrollDepthTracking();
    }

    this.log('Analytics initialized', this.config);
  }

  canTrack() {
    // Respect Do Not Track
    if (this.config.respectDNT && navigator.doNotTrack === '1') {
      return false;
    }

    // Check for consent (if you're using a consent management platform)
    if (window.localStorage && localStorage.getItem('analytics-consent') === 'false') {
      return false;
    }

    return true;
  }

  initializeProvider() {
    switch (this.config.provider) {
      case 'ga4':
        this.initializeGA4();
        break;

      case 'plausible':
        this.initializePlausible();
        break;

      case 'fathom':
        this.initializeFathom();
        break;

      case 'custom':
        // Custom analytics endpoint ready
        this.log('Custom analytics endpoint:', this.config.apiEndpoint);
        break;

      default:
        this.log('No analytics provider configured');
    }
  }

  initializeGA4() {
    if (!this.config.trackingId) {
      this.log('GA4 tracking ID not provided');
      return;
    }

    // Load GA4 script
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.config.trackingId}`;
    document.head.appendChild(script);

    // Initialize dataLayer
    window.dataLayer = window.dataLayer || [];
    window.gtag = function() { dataLayer.push(arguments); };

    gtag('js', new Date());
    gtag('config', this.config.trackingId, {
      'anonymize_ip': true,
      'cookie_flags': 'SameSite=None;Secure'
    });

    this.log('GA4 initialized');
  }

  initializePlausible() {
    const script = document.createElement('script');
    script.defer = true;
    script.dataset.domain = this.config.domain;
    script.src = 'https://plausible.io/js/script.js';
    document.head.appendChild(script);

    this.log('Plausible initialized');
  }

  initializeFathom() {
    if (!this.config.trackingId) {
      this.log('Fathom site ID not provided');
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://cdn.usefathom.com/script.js';
    script.dataset.site = this.config.trackingId;
    script.defer = true;
    document.head.appendChild(script);

    this.log('Fathom initialized');
  }

  trackPageView(path = window.location.pathname) {
    this.trackEvent('page_view', {
      page_path: path,
      page_title: document.title,
      page_location: window.location.href
    });

    this.log('Page view tracked:', path);
  }

  trackEvent(eventName, eventData = {}) {
    switch (this.config.provider) {
      case 'ga4':
        if (window.gtag) {
          gtag('event', eventName, eventData);
        }
        break;

      case 'plausible':
        if (window.plausible) {
          plausible(eventName, { props: eventData });
        }
        break;

      case 'fathom':
        if (window.fathom) {
          fathom.trackGoal(eventName, eventData.value || 0);
        }
        break;

      case 'custom':
        this.sendToCustomEndpoint(eventName, eventData);
        break;
    }

    this.log('Event tracked:', eventName, eventData);
  }

  sendToCustomEndpoint(eventName, eventData) {
    if (!this.config.apiEndpoint) return;

    const payload = {
      event: eventName,
      data: eventData,
      timestamp: new Date().toISOString(),
      page: window.location.pathname,
      referrer: document.referrer
    };

    fetch(this.config.apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => this.log('Analytics error:', err));
  }

  setupSearchTracking() {
    // Track when users search
    document.addEventListener('search-performed', (e) => {
      this.trackEvent('search', {
        search_term: e.detail.query,
        results_count: e.detail.results?.length || 0
      });
    });

    // Also listen for input in search boxes
    const searchInputs = document.querySelectorAll('input[type="search"], #doc-search-input');

    searchInputs.forEach(input => {
      let searchTimeout;

      input.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);

        searchTimeout = setTimeout(() => {
          if (e.target.value.length >= 3) {
            this.trackEvent('search_query', {
              query_length: e.target.value.length,
              partial_query: e.target.value.substring(0, 20) // First 20 chars only
            });
          }
        }, 1000); // Debounce 1 second
      });
    });

    this.log('Search tracking enabled');
  }

  setupDownloadTracking() {
    // Track PDF, ZIP, etc. downloads
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');

      if (link && link.href) {
        const ext = link.href.split('.').pop().toLowerCase();
        const downloadableExts = ['pdf', 'zip', 'tar', 'gz', 'dmg', 'exe', 'msi'];

        if (downloadableExts.includes(ext)) {
          this.trackEvent('file_download', {
            file_url: link.href,
            file_type: ext,
            file_name: link.href.split('/').pop()
          });
        }
      }
    });

    this.log('Download tracking enabled');
  }

  setupOutboundLinkTracking() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');

      if (link && link.href) {
        const isOutbound = !link.href.includes(window.location.hostname) &&
                           link.href.startsWith('http');

        if (isOutbound) {
          this.trackEvent('outbound_link', {
            link_url: link.href,
            link_text: link.textContent.substring(0, 50),
            link_domain: new URL(link.href).hostname
          });
        }
      }
    });

    this.log('Outbound link tracking enabled');
  }

  setupScrollDepthTracking() {
    const thresholds = [25, 50, 75, 90, 100];
    const reached = new Set();

    const checkScrollDepth = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      const scrollPercent = ((scrollTop + windowHeight) / documentHeight) * 100;

      thresholds.forEach(threshold => {
        if (scrollPercent >= threshold && !reached.has(threshold)) {
          reached.add(threshold);

          this.trackEvent('scroll_depth', {
            percent: threshold,
            page: window.location.pathname
          });
        }
      });
    };

    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(checkScrollDepth, 500);
    });

    this.log('Scroll depth tracking enabled');
  }

  // Track custom events from outside
  track(eventName, eventData) {
    this.trackEvent(eventName, eventData);
  }

  // Utility: log only in debug mode
  log(...args) {
    if (this.config.debug) {
      console.log('[Analytics]', ...args);
    }
  }
}

// Auto-initialize if config is provided
if (window.analyticsConfig) {
  window.analytics = new DocumentationAnalytics(window.analyticsConfig);
} else {
  // Create instance without tracking (can be initialized later)
  window.analytics = {
    track: () => console.log('[Analytics] Not initialized. Set window.analyticsConfig first.')
  };
}

// Make class available globally
window.DocumentationAnalytics = DocumentationAnalytics;

// Example configuration (add to your HTML):
/*
<script>
window.analyticsConfig = {
  provider: 'plausible',  // or 'ga4', 'fathom', 'custom'
  domain: 'docs.yoursite.com',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true,
  trackOutboundLinks: true,
  trackScrollDepth: true,
  respectDNT: true,
  debug: false
};
</script>
<script src="/js/analytics.js"></script>
*/
