# 🔥 Cyber Jeopardy Madness

## Enterprise-Grade Cybersecurity Training Platform

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](.)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)
[![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)](https://nodejs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)

> **Complete rewrite - Enterprise-grade cybersecurity training platform** built for Federal Credit Unions with FAANG-level engineering standards.

## ✨ System Overview

**Cyber Jeopardy Madness v2.0** is a **complete, production-ready** cybersecurity training platform featuring:

✅ **Full-Stack TypeScript** (React + Node.js + PostgreSQL)
✅ **Multi-Round Jeopardy** (Round 1, Round 2, Final Jeopardy)
✅ **Industry-Specific Content** (NCUA, PCI-DSS, HIPAA, FERPA, etc.)
✅ **AI Integration** (OpenAI GPT-4 & Anthropic Claude)
✅ **Enterprise Security** (JWT auth, rate limiting, audit logs)
✅ **Docker Deployment** (Complete containerization)
✅ **CI/CD Pipeline** (GitHub Actions)
✅ **Comprehensive Tests** (Unit + Integration)

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

## 🎯 Key Features

**Multi-Round Gameplay**
- Round 1 & 2: 6 categories × 5 questions
- Final Jeopardy with wagering
- Real-time scoring

**Industry Training Packs**
- Federal Credit Union (NCUA/FFIEC) 🏦
- Finance (PCI-DSS/SOX) 💰
- Healthcare (HIPAA) 🏥
- Education (FERPA) 🎓
- Manufacturing (ICS/SCADA) 🏭
- Retail & Corporate 🛒

**AI-Powered Learning**
- Intelligent hints
- Answer explanations
- Compliance references

**Enterprise Features**
- JWT authentication
- PostgreSQL database
- Audit trails
- Rate limiting
- Input validation
- Docker deployment

## 📊 Project Structure

```
├── backend/          # Node.js/TypeScript API
├── frontend/         # React/TypeScript SPA
├── question-packs/   # Industry content
├── docs/             # Documentation
├── .github/          # CI/CD
└── docker-compose.yml
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
