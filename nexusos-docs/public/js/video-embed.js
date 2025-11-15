/**
 * Video Embedding Support for NexusOS Documentation Platform
 *
 * Automatically converts video links into responsive embeds
 * Supports: YouTube, Vimeo, Loom, Google Drive
 */

class VideoEmbedder {
  constructor() {
    this.init();
  }

  init() {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.embedVideos());
    } else {
      this.embedVideos();
    }
  }

  embedVideos() {
    // Find all links that should be video embeds
    const videoLinks = document.querySelectorAll('a[href*="youtube.com"], a[href*="youtu.be"], a[href*="vimeo.com"], a[href*="loom.com"], a[href*="drive.google.com"]');

    videoLinks.forEach(link => {
      // Check if link text indicates it should be embedded
      if (link.textContent.toLowerCase().includes('[video]') ||
          link.classList.contains('embed-video') ||
          link.parentElement.classList.contains('video-container')) {
        this.convertToEmbed(link);
      }
    });

    // Also look for markdown-style video syntax: ![video](url)
    this.convertMarkdownVideos();
  }

  convertToEmbed(link) {
    const url = link.href;
    const embedHTML = this.getEmbedHTML(url);

    if (embedHTML) {
      // Create wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'video-embed-wrapper';
      wrapper.innerHTML = embedHTML;

      // Replace link with embed
      link.parentNode.replaceChild(wrapper, link);
    }
  }

  getEmbedHTML(url) {
    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      const videoId = this.extractYouTubeId(url);
      return this.createYouTubeEmbed(videoId);
    }

    // Vimeo
    if (url.includes('vimeo.com')) {
      const videoId = this.extractVimeoId(url);
      return this.createVimeoEmbed(videoId);
    }

    // Loom
    if (url.includes('loom.com')) {
      const videoId = this.extractLoomId(url);
      return this.createLoomEmbed(videoId);
    }

    // Google Drive
    if (url.includes('drive.google.com')) {
      const fileId = this.extractGoogleDriveId(url);
      return this.createGoogleDriveEmbed(fileId);
    }

    return null;
  }

  extractYouTubeId(url) {
    // Handle youtu.be links
    if (url.includes('youtu.be/')) {
      return url.split('youtu.be/')[1].split('?')[0];
    }

    // Handle youtube.com links
    const urlParams = new URLSearchParams(new URL(url).search);
    return urlParams.get('v');
  }

  extractVimeoId(url) {
    // Extract numeric ID from Vimeo URL
    const match = url.match(/vimeo\.com\/(\d+)/);
    return match ? match[1] : null;
  }

  extractLoomId(url) {
    // Extract ID from Loom share URL
    const match = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
    return match ? match[1] : null;
  }

  extractGoogleDriveId(url) {
    // Extract file ID from various Google Drive URL formats
    const patterns = [
      /\/file\/d\/([^/]+)/,
      /id=([^&]+)/,
      /\/open\?id=([^&]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    return null;
  }

  createYouTubeEmbed(videoId) {
    if (!videoId) return null;

    return `
      <div class="video-embed video-embed-youtube">
        <iframe
          src="https://www.youtube.com/embed/${videoId}"
          frameborder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowfullscreen
          loading="lazy"
          title="YouTube video"
        ></iframe>
      </div>
    `;
  }

  createVimeoEmbed(videoId) {
    if (!videoId) return null;

    return `
      <div class="video-embed video-embed-vimeo">
        <iframe
          src="https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0"
          frameborder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowfullscreen
          loading="lazy"
          title="Vimeo video"
        ></iframe>
      </div>
    `;
  }

  createLoomEmbed(videoId) {
    if (!videoId) return null;

    return `
      <div class="video-embed video-embed-loom">
        <iframe
          src="https://www.loom.com/embed/${videoId}"
          frameborder="0"
          webkitallowfullscreen
          mozallowfullscreen
          allowfullscreen
          loading="lazy"
          title="Loom video"
        ></iframe>
      </div>
    `;
  }

  createGoogleDriveEmbed(fileId) {
    if (!fileId) return null;

    return `
      <div class="video-embed video-embed-gdrive">
        <iframe
          src="https://drive.google.com/file/d/${fileId}/preview"
          frameborder="0"
          allow="autoplay"
          allowfullscreen
          loading="lazy"
          title="Google Drive video"
        ></iframe>
      </div>
    `;
  }

  convertMarkdownVideos() {
    // Find images with video in alt text and convert to embeds
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      const alt = img.alt.toLowerCase();
      const src = img.src;

      if (alt.includes('video') || alt.includes('embed')) {
        // Check if src is a video platform URL
        if (src.includes('youtube.com') || src.includes('youtu.be') ||
            src.includes('vimeo.com') || src.includes('loom.com') ||
            src.includes('drive.google.com')) {

          const embedHTML = this.getEmbedHTML(src);

          if (embedHTML) {
            const wrapper = document.createElement('div');
            wrapper.className = 'video-embed-wrapper';
            wrapper.innerHTML = embedHTML;

            img.parentNode.replaceChild(wrapper, img);
          }
        }
      }
    });
  }
}

// Initialize when script loads
new VideoEmbedder();

// CSS for responsive video embeds (inject into page)
if (!document.getElementById('video-embed-styles')) {
  const style = document.createElement('style');
  style.id = 'video-embed-styles';
  style.textContent = `
    .video-embed-wrapper {
      margin: 2rem 0;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .video-embed {
      position: relative;
      padding-bottom: 56.25%; /* 16:9 aspect ratio */
      height: 0;
      overflow: hidden;
      background: #000;
    }

    .video-embed iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border: none;
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .video-embed-wrapper {
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
      }
    }

    /* Different aspect ratios */
    .video-embed.aspect-4-3 {
      padding-bottom: 75%; /* 4:3 */
    }

    .video-embed.aspect-1-1 {
      padding-bottom: 100%; /* 1:1 */
    }

    .video-embed.aspect-21-9 {
      padding-bottom: 42.857%; /* 21:9 */
    }

    /* Mobile optimization */
    @media (max-width: 768px) {
      .video-embed-wrapper {
        margin: 1.5rem -20px;
        border-radius: 0;
      }
    }

    /* Loading state */
    .video-embed::before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 50px;
      height: 50px;
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: video-loading 1s linear infinite;
    }

    @keyframes video-loading {
      to { transform: translate(-50%, -50%) rotate(360deg); }
    }

    .video-embed iframe {
      z-index: 1;
    }

    /* Focus styles for accessibility */
    .video-embed iframe:focus {
      outline: 2px solid var(--color-accent, #6366f1);
      outline-offset: 4px;
    }
  `;

  document.head.appendChild(style);
}
