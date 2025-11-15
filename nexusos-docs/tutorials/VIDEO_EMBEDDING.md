# Video Embedding Guide
## NexusOS Documentation Platform

Add videos to your documentation with zero configuration.

---

## Supported Platforms

- ✅ YouTube
- ✅ Vimeo
- ✅ Loom
- ✅ Google Drive
- ✅ Any platform (with custom HTML)

---

## Quick Start

### Method 1: Automatic Embedding (Easiest)

Just add a link with `[video]` in the text:

```markdown
[video] Watch the tutorial: https://www.youtube.com/watch?v=dQw4w9WgxcQ
```

Or use the `embed-video` class:

```markdown
<a href="https://www.youtube.com/watch?v=dQw4w9WgxcQ" class="embed-video">Tutorial Video</a>
```

### Method 2: Markdown Image Syntax

Use the image syntax with `video` in the alt text:

```markdown
![video](https://www.youtube.com/watch?v=dQw4w9WgxcQ)
```

### Method 3: Manual HTML (Most Control)

```html
<div class="video-container">
  <a href="https://www.youtube.com/watch?v=dQw4w9WgxcQ" class="embed-video">
    Watch the Tutorial
  </a>
</div>
```

---

## Platform-Specific Examples

### YouTube

```markdown
[video] https://www.youtube.com/watch?v=dQw4w9WgxcQ
```

Or short URL:
```markdown
[video] https://youtu.be/dQw4w9WgxcQ
```

**Renders as:**
- Responsive 16:9 iframe
- Lazy-loaded
- Full playback controls

### Vimeo

```markdown
[video] https://vimeo.com/123456789
```

**Features:**
- Clean player interface
- Customizable controls
- Privacy options respected

### Loom

Perfect for screen recordings and tutorials:

```markdown
[video] https://www.loom.com/share/abc123def456
```

**Benefits:**
- Fast loading
- Timestamp navigation
- Call-to-action support

### Google Drive

For team-internal videos:

```markdown
[video] https://drive.google.com/file/d/1ABC-def_GHI123/view
```

**Requirements:**
- Video must be shared (link access)
- Works best with "Anyone with the link can view"

---

## Advanced Usage

### Custom Aspect Ratios

Default is 16:9, but you can customize:

```html
<div class="video-embed aspect-4-3">
  <iframe src="..."></iframe>
</div>
```

Available classes:
- `aspect-16-9` (default)
- `aspect-4-3` (old school)
- `aspect-1-1` (square)
- `aspect-21-9` (ultrawide)

### Playlist Embeds

YouTube playlists:

```markdown
[video] https://www.youtube.com/playlist?list=PLrAXtmErZgOeiKm4sgNOknGvNjby9efdf
```

### Timestamps

Start at specific time:

```markdown
[video] https://www.youtube.com/watch?v=dQw4w9WgxcQ&t=42s
```

### Autoplay (Use Sparingly!)

Add autoplay to YouTube:

```markdown
[video] https://www.youtube.com/watch?v=dQw4w9WgxcQ&autoplay=1&mute=1
```

**Note:** Browsers require mute for autoplay.

---

## Styling & Customization

### Override Default Styles

Add to your custom CSS:

```css
.video-embed-wrapper {
  margin: 3rem auto;
  max-width: 800px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
}

.video-embed {
  border: 4px solid var(--color-accent);
}
```

### Dark Mode Support

Automatically handled! Video players adapt to theme.

### Mobile Optimization

Videos are fully responsive:
- Full-width on mobile
- Maintains aspect ratio
- Touch-friendly controls

---

## Best Practices

### 1. **Use Descriptive Link Text**

Good:
```markdown
[video] Watch how to install: https://...
```

Bad:
```markdown
[video] https://...
```

### 2. **Provide Fallback Content**

```markdown
Watch the installation tutorial:

[video] https://www.youtube.com/watch?v=...

Can't watch? Read the [text guide](./installation.md) instead.
```

### 3. **Optimize Loading**

Videos are lazy-loaded by default (load when scrolled into view).

### 4. **Consider Bandwidth**

Add text alternatives for users on slow connections:

```markdown
## Video Tutorial

[video] https://www.youtube.com/watch?v=...

**Prefer reading?** Check out the steps below:

1. Download the package
2. Install dependencies
3. Run the setup command
```

### 5. **Accessibility**

Always provide:
- Descriptive titles
- Captions/subtitles (on video platform)
- Text alternatives

---

## Troubleshooting

### Video Not Embedding?

**Checklist:**
1. Is the URL correct?
2. Is the video public/shared?
3. Did you include `[video]` text or class?
4. Is JavaScript enabled?
5. Is `video-embed.js` loaded?

### Blocked by CORS?

Some platforms restrict embedding. Check:
- Video platform's embedding policies
- Your site's domain is allowed

### Performance Issues?

Too many videos on one page?

**Solution:** Use thumbnails with click-to-load:

```html
<div class="video-thumbnail" data-video-url="https://...">
  <img src="thumbnail.jpg" alt="Click to play">
  <button>▶ Play Video</button>
</div>
```

---

## Privacy & GDPR

### Respect User Privacy

Videos load iframes from third-party domains. Consider:

1. **Cookie Consent**
   - Inform users about third-party cookies
   - Use cookie consent banners if required

2. **Privacy-Enhanced Mode**

YouTube example:
```markdown
[video] https://www.youtube-nocookie.com/embed/dQw4w9WgxcQ
```

3. **Opt-In Loading**

Show thumbnail, load video on click:

```javascript
document.querySelectorAll('.video-opt-in').forEach(el => {
  el.addEventListener('click', () => {
    // Load video iframe
  });
});
```

---

## Examples

### Tutorial Series

```markdown
# Getting Started

## Part 1: Installation

[video] https://www.youtube.com/watch?v=video1

## Part 2: Configuration

[video] https://www.youtube.com/watch?v=video2

## Part 3: First Project

[video] https://www.youtube.com/watch?v=video3
```

### Product Demo

```markdown
# Product Demo

See our product in action:

[video] https://www.loom.com/share/demo-video

Key features shown:
- ✅ Easy setup (0:30)
- ✅ Core functionality (2:15)
- ✅ Advanced features (4:20)
```

### Support Videos

```markdown
# Troubleshooting

Having issues? Watch these:

### Can't connect?
[video] https://www.youtube.com/watch?v=connection-help

### Installation fails?
[video] https://www.youtube.com/watch?v=install-help
```

---

## Configuration

### Enable/Disable Video Embedding

Edit `build/render_html.mjs`:

```javascript
const includeVideoEmbed = true; // Set to false to disable

if (includeVideoEmbed) {
  // Include video-embed.js
}
```

### Custom Video Platforms

Add support for custom platforms:

Edit `public/js/video-embed.js`:

```javascript
getEmbedHTML(url) {
  // Add your custom platform
  if (url.includes('custom-platform.com')) {
    return this.createCustomEmbed(url);
  }

  // ...existing platforms
}

createCustomEmbed(url) {
  const videoId = this.extractCustomId(url);

  return `
    <div class="video-embed">
      <iframe
        src="https://custom-platform.com/embed/${videoId}"
        frameborder="0"
        allowfullscreen
      ></iframe>
    </div>
  `;
}
```

---

## API Reference

### VideoEmbedder Class

```javascript
const embedder = new VideoEmbedder();

// Manually embed a video
embedder.convertToEmbed(linkElement);

// Get embed HTML
const html = embedder.getEmbedHTML('https://youtube.com/...');

// Extract video ID
const id = embedder.extractYouTubeId(url);
```

---

## FAQ

**Q: Can I embed videos from my own server?**
A: Yes! Use standard HTML5 video tags:

```html
<video controls width="100%">
  <source src="/videos/tutorial.mp4" type="video/mp4">
  Your browser doesn't support video.
</video>
```

**Q: Do videos slow down page load?**
A: No. Videos use lazy-loading (load when scrolled into view).

**Q: Can I customize the player?**
A: Platform-dependent. YouTube and Vimeo support URL parameters for customization.

**Q: Are embedded videos SEO-friendly?**
A: Yes. Search engines can index embedded videos and understand context.

---

## Next Steps

- [Add analytics to track video views](./ANALYTICS.md)
- [Optimize for mobile devices](./MOBILE_OPTIMIZATION.md)
- [Create video transcripts for accessibility](./ACCESSIBILITY.md)

---

**Need help?** Open an issue on GitHub or contact support@nexusos.com

Happy video embedding! 🎥
