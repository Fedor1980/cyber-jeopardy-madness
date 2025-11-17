# 🔥 Cyber Jeopardy Madness

## Complete Multi-Version Cybersecurity Training Game Suite

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](.)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-blue.svg)](https://reactjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)

> **🎯 The Ultimate Cybersecurity Training Platform** — Three game versions, full-stack TypeScript, real-time multiplayer, AI-powered hints, and enterprise-grade security. Built for Federal Credit Unions, Financial Institutions, Healthcare, and all industries.

## ✨ System Overview

**Cyber Jeopardy Madness v2.0** is the **most comprehensive cybersecurity training game suite** ever built, featuring:

### 🎮 Three Complete Game Versions

1. **Ultimate Cyber Jeopardy ∞** — Standalone HTML5 Jeopardy-style game with Capital Technology Group branding
2. **CyberClarity Quiz System** — Card-based quiz game for all industries
3. **Enterprise React App** — Full-stack TypeScript application with advanced features

### 🚀 Core Technologies

✅ **Full-Stack TypeScript** — React + Vite + Node.js + Express + PostgreSQL
✅ **Real-Time Multiplayer** — WebSocket support with Socket.IO
✅ **AI-Powered Hints** — OpenAI GPT-4 & Anthropic Claude integration
✅ **State Management** — Zustand for predictable state updates
✅ **Modern Styling** — Tailwind CSS + Framer Motion animations
✅ **Enterprise Security** — JWT auth, rate limiting, audit logs, CORS, Helmet
✅ **Complete Testing** — Jest, Vitest, Supertest (Unit + Integration)
✅ **Docker Deployment** — Multi-container orchestration
✅ **CI/CD Pipeline** — GitHub Actions with automated testing
✅ **Accessibility** — WCAG 2.1 AA compliant with TTS support

## 🚀 Quick Start

```bash
# Clone & configure
git clone https://github.com/yourusername/cyber-jeopardy-madness.git
cd cyber-jeopardy-madness
cp .env.example .env

# Start with Docker
docker-compose up -d
docker-compose exec backend npm run migrate
docker-compose exec backend npm run seed

# Access at http://localhost
```

**Default Login:** `admin` / `admin123`

## 📖 Documentation

- **[Complete README](docs/README.md)** - Full documentation
- **[Architecture](docs/ARCHITECTURE.md)** - System design
- **[Security](docs/SECURITY.md)** - Security controls
- **[Deployment](docs/DEPLOYMENT.md)** - Production deployment

## 🏗️ Architecture

```
Frontend (React/TS) ←REST→ Backend (Node/TS) ←→ PostgreSQL
     ↓                          ↓
  Vite/Tailwind            Express/JWT
  Zustand State            Rate Limiting
  AI Integration           Audit Logging
```

## 🎯 Complete Feature Set

### 🎮 Game Features

**Multi-Round Jeopardy Gameplay**
- Round 1: 200-1000 point questions (6 categories × 5 questions)
- Round 2: 400-2000 point questions (Double Jeopardy)
- Final Jeopardy: Wagering and climactic finish
- Zero-Day Events (Daily Doubles with 2x scoring)
- Real-time buzz-in system with WebSocket
- Turn-based and competitive modes
- 2-4 player support

**Visual & Audio Experience**
- Neon cyber-styled UI with glitch effects
- Canvas-based animated cyber grid backgrounds
- Procedural sound effects (buzzer, correct/incorrect, timer)
- Tile flip animations and question reveals
- Theme switcher (Dark/Light/Cyber Dark/Cyber Light)
- Mobile-responsive design
- High contrast mode

**Accessibility Features**
- Text-to-Speech (TTS) question narration
- Keyboard navigation support
- Reduced motion mode
- High contrast mode
- Screen reader compatible
- WCAG 2.1 AA compliant

### 🏭 Industry Training Packs

**Comprehensive Coverage Across All Industries:**

- 🏦 **Federal Credit Union** — NCUA Part 748, FFIEC CAT, GLBA
- 💰 **Finance & Banking** — PCI-DSS, SOX, FINRA
- 🏥 **Healthcare** — HIPAA, HITECH Act
- 🎓 **Education** — FERPA, COPPA
- 🏭 **Manufacturing** — ICS/SCADA security, OT/IT convergence
- 🛒 **Retail & E-Commerce** — PCI-DSS, data privacy
- 🏢 **Corporate/Enterprise** — NIST CSF, ISO 27001, SOC 2
- ⚖️ **Legal & Government** — FedRAMP, FISMA

Each pack includes 330+ questions across 30+ categories covering:
- Phishing & Social Engineering
- Malware & Ransomware
- Password Security & MFA
- Data Privacy & GDPR
- Network Security
- Cloud Security
- Insider Threats
- Zero-Day Vulnerabilities
- Incident Response
- Compliance Frameworks

### 🤖 AI-Powered Learning

**Intelligent Assistance (Optional)**
- OpenAI GPT-4 integration for dynamic hints
- Anthropic Claude 3.5 Sonnet for explanations
- Contextual hints based on difficulty level
- Detailed answer explanations
- Real-time compliance references
- Adaptive learning suggestions
- Session-only API keys (no server storage)

### 🔐 Enterprise Security & Compliance

**Security Controls**
- JWT access & refresh tokens
- bcrypt password hashing (12 rounds)
- Rate limiting with Redis support
- CORS protection with configurable origins
- Helmet.js security headers
- Input validation with Joi schemas
- SQL injection prevention via parameterized queries
- XSS protection
- CSRF token support
- Audit logging for all actions

**Compliance Alignment**
- NCUA Part 748 (Federal Credit Unions)
- FFIEC Cybersecurity Assessment Tool
- GLBA (Gramm-Leach-Bliley Act)
- PCI-DSS Level 1
- HIPAA Security Rule
- NIST Cybersecurity Framework
- ISO 27001 controls
- SOC 2 Type II
- GDPR Article 32 (Security of Processing)

### 🌐 Real-Time Multiplayer

**WebSocket Features**
- Live buzz-in system
- Real-time score updates
- Game state synchronization
- Question selection broadcasting
- Round advancement notifications
- Automatic reconnection handling
- Session persistence

## 📊 Complete Project Structure

```
cyber-jeopardy-madness/
│
├── 🎮 STANDALONE GAMES (No installation required)
│   ├── ultimate-cyber-jeopardy.html      # Ultimate Cyber Jeopardy ∞
│   ├── cyberclarity.html                 # CyberClarity Quiz System
│   └── index.html                        # Landing page
│
├── 🚀 BACKEND (Node.js + Express + PostgreSQL)
│   ├── src/
│   │   ├── controllers/                  # Route controllers
│   │   │   ├── AIController.ts           # AI hint endpoints
│   │   │   ├── AuthController.ts         # Authentication
│   │   │   ├── GameController.ts         # Game logic
│   │   │   └── LeaderboardController.ts  # Leaderboard
│   │   ├── middleware/                   # Express middleware
│   │   │   ├── auth.ts                   # JWT verification
│   │   │   ├── rateLimiter.ts            # Rate limiting
│   │   │   ├── errorHandler.ts           # Error handling
│   │   │   └── validation.ts             # Input validation
│   │   ├── models/                       # Data models
│   │   │   ├── User.ts
│   │   │   ├── Team.ts
│   │   │   ├── Question.ts
│   │   │   ├── Session.ts
│   │   │   └── QuestionAttempt.ts
│   │   ├── routes/                       # API routes
│   │   │   ├── auth.ts                   # /api/v1/auth/*
│   │   │   ├── game.ts                   # /api/v1/game/*
│   │   │   ├── ai.ts                     # /api/v1/ai/*
│   │   │   ├── leaderboard.ts            # /api/v1/leaderboard/*
│   │   │   ├── buzz.ts                   # /api/v1/buzz/*
│   │   │   └── index.ts                  # Route aggregator
│   │   ├── services/                     # Business logic
│   │   │   ├── AIService.ts              # OpenAI/Anthropic integration
│   │   │   ├── AuthService.ts            # Authentication logic
│   │   │   ├── GameService.ts            # Game mechanics
│   │   │   ├── LeaderboardService.ts     # Leaderboard logic
│   │   │   └── WebSocketService.ts       # Real-time events
│   │   ├── config/                       # Configuration
│   │   │   ├── env.ts                    # Environment variables
│   │   │   └── database.ts               # PostgreSQL setup
│   │   ├── utils/                        # Utilities
│   │   │   ├── logger.ts                 # Winston logging
│   │   │   ├── errors.ts                 # Custom errors
│   │   │   ├── validators.ts             # Joi schemas
│   │   │   └── encryption.ts             # Crypto utilities
│   │   ├── types/                        # TypeScript types
│   │   │   └── index.ts
│   │   └── index.ts                      # Server entry point
│   ├── migrations/                       # Database migrations
│   │   ├── 001_initial_schema.sql
│   │   ├── run.ts
│   │   └── seed.ts
│   ├── tests/                            # Test suites
│   ├── Dockerfile                        # Backend container
│   ├── package.json
│   └── tsconfig.json
│
├── 💻 FRONTEND (React + TypeScript + Vite)
│   ├── src/
│   │   ├── components/                   # React components
│   │   │   ├── GameBoard.tsx             # Question grid
│   │   │   ├── Scoreboard.tsx            # Score display
│   │   │   ├── QuestionModal.tsx         # Question popup
│   │   │   └── ResultModal.tsx           # Results
│   │   ├── screens/                      # Page screens
│   │   │   ├── SetupScreen.tsx           # Game setup
│   │   │   └── GameScreen.tsx            # Main game
│   │   ├── services/                     # API services
│   │   │   ├── api.ts                    # Axios instance
│   │   │   ├── gameService.ts            # Game API calls
│   │   │   ├── aiService.ts              # AI API calls
│   │   │   ├── websocketService.ts       # WebSocket client
│   │   │   ├── audioService.ts           # Sound effects
│   │   │   └── themeService.ts           # Theme management
│   │   ├── store/                        # Zustand stores
│   │   │   └── gameStore.ts              # Global state
│   │   ├── hooks/                        # Custom hooks
│   │   │   └── useGameLogic.ts
│   │   ├── utils/                        # Utilities
│   │   │   ├── colors.ts
│   │   │   └── industryPacks.ts
│   │   ├── types/                        # TypeScript types
│   │   │   └── index.ts
│   │   ├── styles/                       # CSS
│   │   │   └── index.css
│   │   ├── App.tsx                       # Main app
│   │   └── main.tsx                      # Entry point
│   ├── public/                           # Static assets
│   ├── Dockerfile                        # Frontend container
│   ├── package.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── tsconfig.json
│
├── 📦 QUESTION PACKS
│   ├── game_questions.json               # Main question database (330+ questions)
│   └── federal-credit-union.json         # Industry-specific pack
│
├── 📚 DOCUMENTATION
│   ├── docs/
│   │   ├── API.md                        # API documentation
│   │   ├── DEPLOYMENT.md                 # Deployment guide
│   │   ├── SECURITY.md                   # Security guide
│   │   └── ARCHITECTURE.md               # System architecture
│   ├── README.md                         # This file
│   ├── ULTIMATE-README.md                # Extended documentation
│   ├── CHANGELOG.md                      # Version history
│   └── CONTRIBUTING.md                   # Contribution guidelines
│
├── 🔧 INFRASTRUCTURE
│   ├── .github/workflows/                # CI/CD pipelines
│   │   ├── ci.yml                        # Testing & linting
│   │   └── deploy.yml                    # Deployment
│   ├── docker-compose.yml                # Multi-container orchestration
│   ├── .env.example                      # Environment template
│   └── vercel.json                       # Vercel deployment config
│
└── 📄 CONFIG FILES
    ├── .editorconfig                     # Editor configuration
    ├── .gitignore                        # Git ignore rules
    └── LICENSE                           # MIT License
```

## 🔐 Security

- JWT authentication (access + refresh tokens)
- bcrypt password hashing (12 rounds)
- Rate limiting (API protection)
- Input validation (Joi schemas)
- SQL injection prevention
- CORS + Helmet security headers
- Audit logging

**Compliance:** NCUA Part 748, FFIEC CAT, GLBA

## 🧪 Development

```bash
# Backend
cd backend && npm install
npm run dev

# Frontend
cd frontend && npm install
npm run dev

# Tests
npm test
npm run test:coverage
```

## 📦 Deployment

See [DEPLOYMENT.md](docs/DEPLOYMENT.md) for:
- Docker Compose production
- Cloud deployment (AWS/Azure/GCP)
- SSL/TLS configuration
- Scaling strategies

## 🤝 Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push and open PR

## 📄 License

MIT License - See [LICENSE](LICENSE)

## 🙏 Acknowledgments

Built for Federal Credit Unions and Financial Institutions

**System Ready - Version 2.0.0**
