---
title: NexusOS Documentation Platform
version: 1.0.0
last_updated: 2025-01-15
---

# 📚 NexusOS Documentation Platform

> **Beautiful, searchable documentation from markdown. Zero configuration.**

Transform your markdown files into stunning HTML sites, branded PDFs, presentations, and diagrams in seconds.

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

---

## ✨ New Features

### 🔍 **Interactive Search** *(NEW!)*
- Real-time fuzzy search across all documentation
- Keyboard shortcuts (`/` to focus, `↑↓` to navigate, `Esc` to clear)
- Relevance scoring and highlighted results
- Beautiful dropdown UI
- Client-side (no backend required)

### 🌙 **Dark Mode** *(NEW!)*
- Automatic system theme detection
- Manual toggle button (fixed top-right)
- localStorage persistence across sessions
- Smooth transitions
- Accessibility features (reduced motion, high contrast)
- Print-optimized (forces light theme)

### 📄 **Branded PDF Export** *(NEW - Premium!)*
- Professional cover pages with custom branding
- Custom colors, logos, and company information
- Headers and footers on every page
- Page numbers and document classification
- Optional watermarks for sensitive docs
- White-label ready for clients

### 💰 **Business Infrastructure** *(NEW - Premium!)*
- Professional sales landing page
- License key generation system
- Multi-tier pricing (Free, Professional, Enterprise)
- Email templates for customer onboarding
- Marketing and sales playbook

---

## 🚀 Quick Start

### Installation

```bash
# Clone repository
git clone https://github.com/nexusos/docs-platform.git
cd docs-platform

# Install dependencies
npm install

# Build everything
npm run build
```

### Your First Documentation

1. **Add markdown files** to `docs/`:

```bash
docs/
├── 01_getting_started/
│   ├── README.md
│   └── installation.md
├── 02_guides/
│   └── tutorial.md
└── 03_api/
    └── reference.md
```

2. **Build your documentation:**

```bash
npm run build
```

3. **View the output:**

```bash
# Open in browser (with search and dark mode!)
open outputs/html/01_getting_started/README.html

# Or serve with any static server
npx serve outputs/html
```

That's it! 🎉

**Try the search:** Press `/` to focus, type to search, use arrow keys to navigate results!

---

## 📋 Commands

### Build Commands

```bash
# Full build (everything)
npm run build              # Lint, diagrams, HTML, PDF, slides, search index

# Premium build (with branded PDFs)
npm run build-premium      # Uses custom branding from branding/config.json

# Individual outputs
npm run html               # Generate HTML with search & dark mode
npm run pdf                # Generate basic PDFs
npm run pdf-branded        # Generate branded PDFs (Premium)
npm run diagrams           # Render Mermaid diagrams to SVG
npm run slides             # Create presentation decks (Marp)
npm run index              # Build search index + table of contents

# Quality & validation
npm run lint               # Check markdown quality
npm run audit              # Content quality audit
npm run validate           # Validate documentation structure
```

---

## 📁 Repository Structure

```
nexusos-docs/
├── docs/                          # 📝 Your markdown source files
│   ├── 01_api_documentation/      # API docs (4 files)
│   ├── 02_user_guides/            # User guides (4 files)
│   ├── 03_admin_manual/           # Admin guides + incident playbooks
│   ├── 04_workflow_diagrams/      # Mermaid diagram sources
│   ├── 05_training_materials/     # Slides, exercises, quizzes
│   ├── 06_quick_references/       # Cheat sheets (7 files)
│   ├── 07_integration_guides/     # Platform integrations (5 files)
│   ├── 08_templates/              # Document templates (8 files)
│   ├── 10_branding/               # Brand assets & guidelines
│   └── 11_appendices/             # Glossary, SLAs, contacts (6 files)
│
├── outputs/                       # 📦 Generated documentation
│   ├── html/                      # HTML with search & dark mode
│   ├── pdf/                       # Basic PDFs
│   ├── pdf-branded/               # Branded PDFs (Premium)
│   ├── diagrams/                  # Rendered SVG diagrams
│   ├── slides/                    # Presentation decks
│   ├── search-index.json          # Lunr.js search index
│   └── manifest.json              # Table of contents
│
├── public/                        # 🌐 Static assets
│   ├── css/
│   │   ├── themes.css             # Dark/light theme system
│   │   └── search.css             # Search UI styling
│   └── js/
│       ├── theme-switcher.js      # Theme switching logic
│       └── search.js              # Search functionality
│
├── branding/                      # 🎨 Branding (Premium)
│   ├── config.json                # Company info, colors, logo
│   └── README.md                  # Branding guide
│
├── business/                      # 💰 Monetization (Premium)
│   ├── SALES_PAGE.html            # Product landing page
│   ├── license-generator.mjs      # License key management
│   └── README.md                  # Sales & marketing playbook
│
├── build/                         # 🔧 Build scripts
│   ├── render_html.mjs            # HTML generation with search
│   ├── render_pdfs.mjs            # Basic PDF generation
│   ├── render_pdf_branded.mjs     # Branded PDF generation (Premium)
│   ├── render_diagrams.mjs        # Mermaid diagram rendering
│   ├── render_slides.mjs          # Marp slide generation
│   ├── search_indexer.mjs         # Lunr.js indexing
│   ├── toc_generator.mjs          # Manifest generation
│   └── audit_content.py           # Content quality auditor
│
└── deployment/                    # 🚀 Deployment automation
    └── deployment_scripts/        # Deploy to Confluence, GitBook, etc.
```

**67 Documentation Files** | **7 Diagrams** | **50 Slides** | **8 Templates** | **Fully Searchable**

---

## 🌟 Features in Detail

### Multi-Format Output

Write your documentation **once in Markdown**, generate:

- ✅ **HTML Sites** - Responsive, searchable, with dark mode
- ✅ **PDFs** - Professional exports (basic or branded)
- ✅ **Presentations** - Marp-powered slide decks
- ✅ **Diagrams** - Auto-rendered from Mermaid code
- ✅ **Search Index** - Client-side Lunr.js search

### Interactive Search

```markdown
Press / to search
Type to find
↑↓ to navigate
Enter to visit
Esc to clear
```

Features:
- Fuzzy matching (finds results even with typos)
- Relevance scoring
- Category badges
- Highlighted terms in excerpts
- Mobile responsive
- Keyboard-first UX

### Dark Mode

- Detects system preference (`prefers-color-scheme`)
- Manual toggle button (sun/moon icons)
- Saves preference in `localStorage`
- 16+ CSS custom properties
- Smooth transitions
- Accessibility support
- Forces light mode for printing

### Branded PDFs *(Premium)*

Professional features:
- **Cover Pages** - Gradient background, company logo, category badge, title, tagline, classification label
- **Brand Colors** - Custom primary/secondary colors throughout
- **Typography** - Professional font hierarchy
- **Headers/Footers** - Company name, category, document title, classification, date, page numbers
- **Watermarks** - Optional "CONFIDENTIAL" or custom text
- **Classification** - Public, Internal, Confidential levels
- **White-label** - Easy client customization

Configure in `branding/config.json`:

```json
{
  "companyName": "Your Company",
  "tagline": "Your Slogan",
  "website": "www.yourcompany.com",
  "email": "support@yourcompany.com",
  "logoUrl": "./branding/logo.png",
  "primaryColor": "#6366f1",
  "secondaryColor": "#1e293b",
  "classification": "Internal Use Only",
  "watermark": "CONFIDENTIAL",
  "showWatermark": false,
  "version": "1.0"
}
```

### Diagram Rendering

Supports **Mermaid.js** for:
- Flowcharts
- Sequence diagrams
- State diagrams
- Entity-relationship diagrams
- Gantt charts
- Git graphs
- Class diagrams
- User journeys

Auto-renders to high-quality SVG.

---

## 💰 Pricing

### Free
**$0** - Perfect for open source projects

- HTML generation
- Interactive search
- Dark mode
- Diagram rendering
- Basic PDFs
- Slides generation
- Community support

### Professional
**$99 one-time** - For commercial teams

All Free features, plus:

- ✅ **Branded PDFs** with custom covers
- ✅ **White-label** customization
- ✅ **Watermark** support
- ✅ **Priority email** support
- ✅ **Commercial license**
- ✅ **Lifetime updates**

### Enterprise
**$499 one-time** - For large organizations

All Professional features, plus:

- ✅ **Custom integrations**
- ✅ **On-premise deployment** support
- ✅ **SLA guarantees**
- ✅ **Training sessions** (2 hours)
- ✅ **White-glove onboarding**
- ✅ **Unlimited installs**
- ✅ **Phone support**

[View Full Pricing →](business/SALES_PAGE.html) | [Contact Sales →](mailto:sales@nexusos.com)

---

## 🎯 Use Cases

### 📘 API Documentation
- REST API reference with endpoints
- Authentication guides (OAuth, API keys)
- Rate limiting documentation
- Code examples
- Quick reference cards

**Example:** `docs/01_api_documentation/`

### 📗 User Manuals
- Getting started guides
- Step-by-step tutorials
- FAQs (40+ questions)
- Onboarding checklists
- Troubleshooting

**Example:** `docs/02_user_guides/`

### 📕 Admin Documentation
- System architecture
- Deployment guides
- Incident playbooks (P0, P1, P2, Security, DR)
- Runbooks and SOPs
- Configuration guides

**Example:** `docs/03_admin_manual/`

### 📙 Training Materials
- Presentation slides (50+ slides)
- Hands-on exercises (4 labs)
- Certification quizzes (25 questions)
- Answer keys
- Speaker notes

**Example:** `docs/05_training_materials/`

### 📓 Knowledge Base
- Team processes
- Best practices
- Templates (incident reports, change requests)
- Internal wikis
- Quick references

**Example:** `docs/06_quick_references/`

---

## 🎨 Customization

### Themes

Edit `public/css/themes.css`:

```css
/* Light theme */
:root, :root[data-theme="light"] {
  --color-bg-primary: #ffffff;
  --color-text-primary: #111827;
  --color-accent: #6366f1;
  --color-code-bg: #f5f5f5;
  /* ... 16+ variables */
}

/* Dark theme */
:root[data-theme="dark"] {
  --color-bg-primary: #0f172a;
  --color-text-primary: #f1f5f9;
  --color-accent: #818cf8;
  --color-code-bg: #1e293b;
  /* ... */
}
```

### Search

Customize `public/js/search.js` and `public/css/search.css`:
- Result count
- UI colors
- Keyboard shortcuts
- Search behavior

### Branding

See `branding/README.md` for complete guide:
- Logo specifications
- Color scheme recommendations
- Document classification options
- Watermark usage
- White-label examples

---

## 🛠️ Deployment

### Supported Platforms

- **GitHub Pages** - Static site hosting
- **Confluence** - Import to Confluence spaces
- **GitBook** - Sync to GitBook
- **Notion** - Export to Notion workspace
- **Custom** - Self-hosted documentation portal

### Deploy Commands

```bash
# Deploy to all platforms
npm run deploy

# Dry run (preview changes)
npm run deploy:dry-run

# Platform-specific
bash deployment/deployment_scripts/scripts/deploy_github_pages.sh
bash deployment/deployment_scripts/scripts/deploy_confluence.sh
bash deployment/deployment_scripts/scripts/deploy_gitbook.sh
python deployment/deployment_scripts/scripts/deploy_notion.py
```

---

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

### Development

```bash
# Fork and clone
git clone https://github.com/YOUR_USERNAME/nexusos-docs
cd nexusos-docs

# Create branch
git checkout -b feature/your-feature

# Make changes, build, test
npm run build
npm run lint
npm run validate

# Commit and push
git commit -m "Add feature"
git push origin feature/your-feature

# Open Pull Request
```

### Documentation Standards

- Use front-matter (YAML) in all Markdown files
- Follow naming conventions (lowercase, hyphens)
- Include version and last_updated
- Write in clear, concise language
- Use code blocks with language tags
- Validate links before committing

---

## 📝 License

### Free Tier
MIT License - See [LICENSE](LICENSE)

### Professional & Enterprise
Commercial licenses available at business/SALES_PAGE.html

---

## 🆘 Support

### Community (Free)
- [GitHub Issues](https://github.com/nexusos/docs-platform/issues)
- [Discussions](https://github.com/nexusos/docs-platform/discussions)
- [Discord](https://discord.gg/nexusos)

### Professional
- Priority email: support@nexusos.com
- 48-hour response time
- Bug fix guarantees

### Enterprise
- Phone: +1-XXX-XXX-XXXX
- Dedicated account manager
- SLA guarantees
- Custom training sessions

---

## 🔗 Links

- **Website**: https://www.nexusos.com
- **Documentation**: https://docs.nexusos.com
- **Sales**: sales@nexusos.com
- **Support**: support@nexusos.com
- **Twitter**: [@nexusos](https://twitter.com/nexusos)

---

## 🙏 Acknowledgments

Built with:
- [Marked](https://marked.js.org/) - Markdown parser
- [Mermaid](https://mermaid.js.org/) - Diagram rendering
- [Marp](https://marp.app/) - Presentation slides
- [Lunr.js](https://lunrjs.com/) - Search indexing
- [Playwright](https://playwright.dev/) - PDF generation

---

## ⭐ Star History

If you find this project useful, please give it a star! ⭐

---

**Made with ❤️ by the NexusOS Team**

**Version**: 1.0.0
**Last Updated**: 2025-01-15
**Status**: Production Ready

[Get Started →](#quick-start) | [View Examples →](#use-cases) | [Pricing →](#pricing)
