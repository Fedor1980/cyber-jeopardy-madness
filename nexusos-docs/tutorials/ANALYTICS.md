# Analytics Setup Guide
## NexusOS Documentation Platform

Track how users interact with your documentation while respecting privacy.

---

## Supported Providers

- ✅ **Google Analytics 4** (most popular)
- ✅ **Plausible** (privacy-first, recommended)
- ✅ **Fathom** (simple, privacy-focused)
- ✅ **Custom endpoint** (your own analytics)
- ✅ **None** (no tracking)

---

## Quick Start

### Step 1: Choose a Provider

**Recommended for most:** Plausible (GDPR-compliant, no cookies)
**Free option:** Google Analytics 4

### Step 2: Add Configuration

Edit your HTML template or create `public/analytics-config.js`:

```javascript
window.analyticsConfig = {
  provider: 'plausible',
  domain: 'docs.yoursite.com',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true,
  respectDNT: true,
  debug: false
};
```

### Step 3: Include Analytics Script

The analytics script is already included in generated HTML!

Just configure it and rebuild:

```bash
npm run html
```

---

## Provider Setup

### Plausible (Recommended)

**Why Plausible?**
- Privacy-first (no cookies, GDPR-compliant)
- Lightweight (< 1KB script)
- Simple dashboard
- Open source option available

**Setup:**

1. Sign up at [plausible.io](https://plausible.io)

2. Add your site domain

3. Configure:

```javascript
window.analyticsConfig = {
  provider: 'plausible',
  domain: 'docs.yoursite.com',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true,
  respectDNT: true
};
```

**Cost:** $9/mo for 10k monthly pageviews

**Self-hosted option:** Free!

### Google Analytics 4

**Why GA4?**
- Free
- Powerful reporting
- Integration with Google tools
- Industry standard

**Setup:**

1. Create account at [analytics.google.com](https://analytics.google.com)

2. Create property, get Measurement ID (G-XXXXXXXXXX)

3. Configure:

```javascript
window.analyticsConfig = {
  provider: 'ga4',
  trackingId: 'G-XXXXXXXXXX',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true,
  trackOutboundLinks: true,
  respectDNT: true
};
```

**Cost:** Free

**Note:** Requires cookie consent in EU

### Fathom

**Why Fathom?**
- Super simple
- Privacy-focused
- Beautiful dashboard
- No cookie consent needed

**Setup:**

1. Sign up at [usefathom.com](https://usefathom.com)

2. Add your site, get Site ID

3. Configure:

```javascript
window.analyticsConfig = {
  provider: 'fathom',
  trackingId: 'ABCDEFGH',
  trackPageViews: true,
  respectDNT: true
};
```

**Cost:** $14/mo for 100k pageviews

### Custom Analytics

Have your own analytics server?

**Setup:**

```javascript
window.analyticsConfig = {
  provider: 'custom',
  apiEndpoint: 'https://yoursite.com/api/analytics',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true
};
```

**Data sent:**

```json
{
  "event": "page_view",
  "data": {
    "page_path": "/guides/tutorial",
    "page_title": "Tutorial Guide"
  },
  "timestamp": "2024-01-15T10:30:00Z",
  "page": "/guides/tutorial",
  "referrer": "https://google.com"
}
```

---

## What Gets Tracked

### Page Views (Default: ON)

Tracks when users visit pages:

- Page path
- Page title
- Referrer
- Timestamp

**Privacy:** No personal data

### Search Queries (Default: ON)

Tracks documentation searches:

- Search term (first 20 chars)
- Number of results
- Query length

**Example:**

```javascript
{
  event: 'search',
  search_term: 'how to install',
  results_count: 5
}
```

**Privacy:** Search terms truncated, no user identification

### Downloads (Default: ON)

Tracks file downloads:

- File URL
- File type (pdf, zip, etc.)
- File name

**Example:**

```javascript
{
  event: 'file_download',
  file_type: 'pdf',
  file_name: 'api-guide.pdf'
}
```

### Outbound Links (Default: ON)

Tracks clicks to external sites:

- Link URL
- Link text (first 50 chars)
- Destination domain

**Example:**

```javascript
{
  event: 'outbound_link',
  link_url: 'https://github.com/...',
  link_domain: 'github.com'
}
```

### Scroll Depth (Default: OFF)

Tracks how far users scroll:

- Thresholds: 25%, 50%, 75%, 90%, 100%

**Enable:**

```javascript
window.analyticsConfig = {
  // ...
  trackScrollDepth: true
};
```

---

## Privacy & Compliance

### Respect "Do Not Track"

Enabled by default:

```javascript
window.analyticsConfig = {
  respectDNT: true // Default
};
```

If user has DNT enabled, **no tracking occurs**.

### Cookie Consent

For GDPR compliance:

1. **Use cookie-less providers** (Plausible, Fathom) - no consent needed!

2. **Or implement consent:**

```javascript
// Check consent before initializing
if (userConsented()) {
  window.analyticsConfig = { /* config */ };
  new DocumentationAnalytics(window.analyticsConfig);
} else {
  // Show consent banner
}

function userConsented() {
  return localStorage.getItem('analytics-consent') === 'true';
}
```

### GDPR Compliance

**Best practices:**

1. **Use privacy-first providers** (Plausible, Fathom)
2. **Anonymize IPs** (GA4 does this by default)
3. **No PII** (personally identifiable information)
4. **Respect DNT** (Do Not Track)
5. **Provide opt-out** (let users disable tracking)

### Data Retention

**Plausible:** 2 years (configurable)
**Fathom:** Forever (anonymized)
**GA4:** 14 months (default, configurable)

---

## Custom Events

Track custom interactions:

```javascript
// Track button click
document.getElementById('get-started').addEventListener('click', () => {
  window.analytics.track('button_click', {
    button_name: 'Get Started',
    location: 'hero_section'
  });
});

// Track feature usage
window.analytics.track('feature_used', {
  feature_name: 'dark_mode',
  feature_value: 'enabled'
});

// Track errors
window.addEventListener('error', (e) => {
  window.analytics.track('javascript_error', {
    error_message: e.message,
    error_file: e.filename,
    error_line: e.lineno
  });
});
```

---

## Dashboard & Reporting

### Key Metrics to Watch

1. **Page Views**
   - Which pages are most popular?
   - Where do users enter?

2. **Search Terms**
   - What are users looking for?
   - Are they finding it?

3. **Time on Page**
   - Which content is engaging?
   - Where do users drop off?

4. **Downloads**
   - Which resources are valuable?
   - PDF vs code examples?

5. **Outbound Links**
   - Where do users go next?
   - Which external resources are useful?

### Sample Questions to Answer

- "What are the top 10 most viewed pages?"
- "What do users search for most?"
- "How many users download the API guide?"
- "Which external links are most clicked?"
- "What's the average time on documentation pages?"

---

## Advanced Configuration

### Environment-Specific Tracking

```javascript
const isDev = window.location.hostname === 'localhost';

window.analyticsConfig = {
  provider: isDev ? 'none' : 'plausible',
  domain: isDev ? 'localhost' : 'docs.yoursite.com',
  debug: isDev
};
```

### A/B Testing

Track which version users see:

```javascript
const variant = Math.random() < 0.5 ? 'A' : 'B';

window.analytics.track('experiment_view', {
  experiment_name: 'new_homepage',
  variant: variant
});
```

### Performance Monitoring

```javascript
window.addEventListener('load', () => {
  const perfData = performance.timing;
  const loadTime = perfData.loadEventEnd - perfData.navigationStart;

  window.analytics.track('page_performance', {
    load_time_ms: loadTime,
    page_path: window.location.pathname
  });
});
```

---

## Debugging

### Enable Debug Mode

```javascript
window.analyticsConfig = {
  // ...
  debug: true
};
```

**Console output:**

```
[Analytics] Analytics initialized {provider: "plausible", ...}
[Analytics] Page view tracked: /guides/tutorial
[Analytics] Event tracked: search {search_term: "install", results: 3}
```

### Test Analytics

1. Enable debug mode
2. Open browser console
3. Navigate pages, search, download files
4. Verify events in console
5. Check your analytics dashboard

### Common Issues

**Analytics not working?**

Checklist:
- [ ] Is config correctly set?
- [ ] Is provider script loaded?
- [ ] Is ad blocker enabled? (try incognito)
- [ ] Check browser console for errors
- [ ] Verify tracking ID/domain

**Events not showing up?**

- Some dashboards have delay (5-30 minutes)
- Check dashboard filters
- Verify event name matches

---

## Performance

### Script Size

| Provider | Script Size | Impact |
|----------|-------------|--------|
| Plausible | < 1 KB | Minimal |
| Fathom | ~1 KB | Minimal |
| GA4 | ~17 KB | Low |
| Custom | Varies | Depends |

### Page Load Impact

**Best practices:**

1. **Load async/defer:**
   ```html
   <script defer src="analytics.js"></script>
   ```

2. **Lazy-load analytics:**
   ```javascript
   // Load after page interactive
   if (document.readyState === 'complete') {
     initAnalytics();
   } else {
     window.addEventListener('load', initAnalytics);
   }
   ```

3. **Use CDN** for faster delivery

---

## Examples

### E-commerce Documentation

```javascript
window.analyticsConfig = {
  provider: 'ga4',
  trackingId: 'G-XXXXXXXXXX',
  trackPageViews: true,
  trackSearches: true,
  trackDownloads: true
};

// Track product views in docs
window.analytics.track('product_view', {
  product_id: 'api-tier-pro',
  product_name: 'Professional API Tier'
});
```

### Open Source Project

```javascript
window.analyticsConfig = {
  provider: 'plausible',
  domain: 'docs.yourproject.org',
  trackPageViews: true,
  trackDownloads: true,
  respectDNT: true
};
```

### Internal Documentation

```javascript
window.analyticsConfig = {
  provider: 'custom',
  apiEndpoint: 'https://internal.company.com/analytics',
  trackPageViews: true,
  trackSearches: true
};
```

---

## Migration

### From GA Universal to GA4

1. Create new GA4 property
2. Get new Measurement ID (G-XXXXXXXXXX)
3. Update config:

```javascript
window.analyticsConfig = {
  provider: 'ga4',
  trackingId: 'G-XXXXXXXXXX', // New GA4 ID
  // ... rest of config
};
```

4. Run both in parallel during transition
5. Validate data
6. Sunset UA property

### From Google Analytics to Plausible

1. Sign up for Plausible
2. Add site
3. Update config:

```javascript
// Old
{
  provider: 'ga4',
  trackingId: 'G-XXXXXXXXXX'
}

// New
{
  provider: 'plausible',
  domain: 'docs.yoursite.com'
}
```

4. Rebuild docs
5. Compare data for 30 days
6. Fully switch

---

## FAQ

**Q: Do I need cookie consent with Plausible/Fathom?**
A: No! They're cookie-less and GDPR-compliant by default.

**Q: Can I use multiple analytics providers?**
A: Yes! Initialize multiple instances or send to custom endpoint + provider.

**Q: Does tracking slow down my docs?**
A: Minimal impact (< 1KB for privacy-first providers).

**Q: Can I self-host analytics?**
A: Yes! Plausible offers self-hosted option (free, open source).

**Q: How do I opt out?**
A: Set `localStorage.setItem('analytics-consent', 'false')` or enable DNT.

---

## Next Steps

- [Set up conversion tracking](./CONVERSIONS.md)
- [Create custom dashboards](./DASHBOARDS.md)
- [Export analytics data](./DATA_EXPORT.md)

---

**Need help?** Contact support@nexusos.com or check our [community forum](https://community.nexusos.com).

Happy analyzing! 📊
