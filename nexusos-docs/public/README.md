# Public Assets

This directory contains static assets that are copied to the HTML output during the build process.

## Search Feature

The interactive search functionality is powered by:

### Files
- `js/search.js` - Search functionality using Lunr.js
- `css/search.css` - Search UI styling

### Features
- ⚡ **Instant Search** - Real-time search results as you type
- 🎯 **Fuzzy Matching** - Finds results even with typos
- ⌨️ **Keyboard Shortcuts**
  - Press `/` to focus search
  - Use `↑` `↓` to navigate results
  - Press `Enter` to open selected result
  - Press `Esc` to close search
- 📱 **Mobile Responsive** - Works great on all devices
- 🌙 **Dark Mode** - Automatic dark theme support
- 🔍 **Highlighted Results** - Search terms highlighted in results
- 📊 **Relevance Scoring** - Results ranked by match quality

### How It Works

1. **Search Index** - Built from all markdown files using Lunr.js
2. **Manifest** - Maps search results to actual documents
3. **UI** - Beautiful, accessible search interface
4. **Navigation** - Keyboard and mouse navigation support

### Customization

To customize the search UI, edit:
- `css/search.css` - Change colors, fonts, layout
- `js/search.js` - Modify search behavior, result formatting

### Adding More Assets

Add new files to this directory structure:
```
public/
├── js/
│   ├── search.js
│   └── your-script.js
├── css/
│   ├── search.css
│   └── your-styles.css
└── images/
    └── your-image.png
```

Then update `build/render_html.mjs` to copy your new assets during the build.
