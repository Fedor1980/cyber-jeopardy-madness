# NexusOS Documentation Platform

**Production-Ready Documentation System for Modern Teams**

Transform your markdown documentation into beautiful, searchable, multi-format output with zero configuration.

---

## 🎯 What You Get

A complete documentation platform that generates:

- **📄 HTML Sites** - Beautiful, responsive documentation websites
- **🔍 Interactive Search** - Real-time search with keyboard shortcuts
- **🌙 Dark Mode** - Automatic theme switching with persistence
- **📱 Mobile Responsive** - Perfect on all devices
- **📊 Mermaid Diagrams** - Auto-rendered flowcharts, sequences, ERDs
- **🎨 Branded PDFs** - Professional PDFs with custom branding *(Premium)*
- **🎓 Training Slides** - Marp-powered presentation decks
- **📑 Table of Contents** - Auto-generated navigation

---

## 💰 Pricing

### Free Tier
**$0/month** - Perfect for open source projects

✅ HTML generation
✅ Interactive search
✅ Dark mode
✅ Diagram rendering
✅ Basic PDFs
✅ Slides
✅ Community support

### Professional
**$99/one-time** - For commercial teams

Everything in Free, plus:

✅ **Branded PDFs** with custom covers
✅ **White-label** customization
✅ **Watermark** support
✅ **Priority email** support
✅ **Commercial license**
✅ **Lifetime updates**

### Enterprise
**$499/one-time** - For large organizations

Everything in Professional, plus:

✅ **Custom integrations**
✅ **On-premise deployment** support
✅ **SLA guarantees**
✅ **Training sessions** (2 hours)
✅ **White-glove onboarding**
✅ **Unlimited installs**
✅ **Phone support**

---

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/your-org/nexusos-docs
cd nexusos-docs
npm install
```

### Usage

```bash
# Build everything
npm run build

# Build specific outputs
npm run html          # HTML documentation site
npm run pdf           # Basic PDFs
npm run pdf-branded   # Branded PDFs (Professional+)
npm run diagrams      # Mermaid diagrams
npm run slides        # Presentation decks
npm run index         # Search index + TOC

# Development
npm run lint          # Lint markdown files
npm run audit         # Content quality audit
npm run validate      # Validate documentation structure
```

### Your First Documentation

1. Add markdown files to `docs/`
2. Run `npm run build`
3. Open `outputs/html/index.html`

That's it! 🎉

---

## 📁 Project Structure

```
nexusos-docs/
├── docs/                    # Your markdown documentation
│   ├── 01_api_documentation/
│   ├── 02_user_guides/
│   ├── 03_admin_manual/
│   └── ...
├── outputs/                 # Generated files
│   ├── html/               # HTML documentation site
│   ├── pdf/                # PDF exports
│   ├── pdf-branded/        # Branded PDFs (Professional+)
│   ├── diagrams/           # SVG diagrams
│   └── slides/             # Presentation decks
├── branding/               # Brand customization (Professional+)
│   ├── config.json         # Branding settings
│   └── README.md           # Branding guide
├── build/                  # Build scripts
└── package.json            # Dependencies & scripts
```

---

## 🎨 Features in Detail

### Interactive Search

- **Real-time results** as you type
- **Fuzzy matching** finds results even with typos
- **Keyboard shortcuts**: Press `/` to focus, `↑↓` to navigate
- **Highlighted terms** in results
- **Relevance scoring**
- **Mobile responsive**

### Dark Mode

- **Auto-detection** of system preference
- **Manual toggle** button (top-right)
- **localStorage persistence** across sessions
- **Smooth transitions**
- **Accessibility friendly**
- **Print optimization** (forces light mode)

### Branded PDFs *(Professional+ only)*

- **Custom cover pages** with your logo
- **Brand colors** throughout
- **Headers & footers** on every page
- **Page numbers**
- **Document classification** labels
- **Optional watermarks**
- **White-label ready**

### Diagram Rendering

- **Mermaid.js** support for:
  - Flowcharts
  - Sequence diagrams
  - State diagrams
  - Entity-relationship diagrams
  - Gantt charts
  - Git graphs
  - And more!
- **Auto-generated SVGs**
- **High-quality output**

### Training Slides

- **Marp-powered** presentations
- **Beautiful themes**
- **PDF export**
- **Speaker notes**
- **Code highlighting**

---

## 🔧 Configuration

### Branding *(Professional+ only)*

Edit `branding/config.json`:

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
  "version": "1.0"
}
```

### Search Customization

Modify `public/js/search.js` and `public/css/search.css` to customize:
- Colors and fonts
- Result formatting
- Number of results
- Search behavior

### Theme Customization

Edit `public/css/themes.css` to customize:
- Color palettes
- Typography
- Shadows and borders
- Animations

---

## 📊 Use Cases

### API Documentation
Perfect for API reference docs with:
- Endpoint listings
- Authentication guides
- Code examples
- Quick reference cards

### User Manuals
Create comprehensive user guides with:
- Step-by-step tutorials
- Screenshots
- FAQs
- Troubleshooting

### Admin Manuals
Document admin processes with:
- Runbooks
- Incident playbooks
- Configuration guides
- SLA definitions

### Training Materials
Build training content with:
- Presentation slides
- Exercises and quizzes
- Certification programs
- Speaker notes

### Internal Wikis
Knowledge base for teams:
- Process documentation
- Templates
- Best practices
- Team guidelines

---

## 🏆 Why Choose NexusOS Docs?

### ✅ Zero Configuration
Works out of the box. No complex setup, no configuration hell.

### ✅ Multiple Formats
One source → HTML, PDF, slides, diagrams. Write once, publish everywhere.

### ✅ Beautiful Output
Professional, modern design that your team and customers will love.

### ✅ Fast & Lightweight
Client-side search, no database required. Fast on all devices.

### ✅ Developer Friendly
Markdown-first, Git-based workflow. Integrates with your existing tools.

### ✅ Customizable
White-label ready. Make it yours with custom branding and themes.

### ✅ Production Ready
Used by enterprise teams. Battle-tested, reliable, maintainable.

---

## 🤝 Support

### Free Tier
- Community Discord
- GitHub Issues
- Documentation

### Professional
- Priority email support
- 48-hour response time
- Bug fix guarantees

### Enterprise
- Phone support
- Dedicated account manager
- Custom SLA
- Training sessions
- White-glove onboarding

---

## 📜 License

### Free Tier
MIT License - Use freely for any purpose

### Professional
Commercial License - Remove attribution, white-label, unlimited projects

### Enterprise
Enterprise License - Includes indemnification, SLA guarantees, custom terms

---

## 🎓 Learning Resources

- **Quick Start Guide**: `/docs/quick_start.md`
- **API Reference**: `/docs/01_api_documentation/`
- **Branding Guide**: `/branding/README.md`
- **Video Tutorials**: Coming soon!
- **Blog**: Best practices and tips

---

## 📞 Contact

- **Sales**: sales@nexusos.com
- **Support**: support@nexusos.com
- **Website**: www.nexusos.com
- **Twitter**: @nexusos
- **Discord**: discord.gg/nexusos

---

## 🚀 Get Started Today

1. **Download** the platform
2. **Add** your markdown files
3. **Run** `npm run build`
4. **Ship** beautiful documentation

[Get Started →](#quick-start) | [View Pricing →](#pricing) | [Contact Sales →](mailto:sales@nexusos.com)

---

*Made with ❤️ by the NexusOS Team*
