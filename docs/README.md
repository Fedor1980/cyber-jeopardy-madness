# Cyber Jeopardy Madness 🔥

## Enterprise-Grade Cybersecurity Training Platform for Federal Credit Unions

![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Node](https://img.shields.io/badge/node-18+-brightgreen.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)

**Cyber Jeopardy Madness** is a production-ready, FAANG-level cybersecurity training platform designed specifically for financial institutions, with a focus on Federal Credit Unions and NCUA compliance.

## 🎯 Key Features

### Multi-Round Jeopardy Gameplay
- **Round 1 & 2**: Traditional Jeopardy board with 6 categories
- **Final Jeopardy**: High-stakes wagering round
- **Real-time scoring** and team management
- **Automatic round progression** with validation

### Industry-Specific Content
- ✅ Federal Credit Union (NCUA/FFIEC)
- ✅ Finance (PCI-DSS, SOX, GLBA)
- ✅ Healthcare (HIPAA)
- ✅ Education (FERPA)
- ✅ Manufacturing (ICS/SCADA)
- ✅ Retail (PCI-DSS)
- ✅ Corporate Security Awareness

### AI-Powered Learning
- **Intelligent hints** using OpenAI GPT-4 or Anthropic Claude
- **Detailed explanations** for correct and incorrect answers
- **Adaptive learning** outcomes

### Enterprise Architecture
- **Microservices architecture** with Docker
- **PostgreSQL database** with migrations
- **REST API** with TypeScript/Express
- **React SPA** with TypeScript/Vite
- **Full authentication** and authorization
- **Rate limiting** and security controls

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm 9+
- Docker and Docker Compose
- PostgreSQL 15+ (or use Docker)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/cyber-jeopardy-madness.git
   cd cyber-jeopardy-madness
   ```

2. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start with Docker Compose** (Recommended)
   ```bash
   docker-compose up -d
   ```

4. **Or run locally**

   **Backend:**
   ```bash
   cd backend
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

   **Frontend:**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - API Docs: http://localhost:3001/api/v1/health

## 📖 Documentation

- [Architecture Guide](./ARCHITECTURE.md) - System design and technical architecture
- [Security Documentation](./SECURITY.md) - Security controls and best practices
- [Threat Model](./THREAT_MODEL.md) - Security analysis and risk assessment
- [Admin Guide](./ADMIN_GUIDE.md) - Administrative operations
- [Question Packs](./QUESTION_PACKS.md) - Creating custom question content

## 🏗️ Project Structure

```
cyber-jeopardy-madness/
├── backend/                 # Node.js/TypeScript API
│   ├── src/
│   │   ├── config/         # Configuration and environment
│   │   ├── controllers/    # Request handlers
│   │   ├── models/         # Database models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Express middleware
│   │   ├── utils/          # Utilities
│   │   └── types/          # TypeScript types
│   ├── migrations/         # Database migrations
│   ├── tests/              # Unit and integration tests
│   └── Dockerfile
├── frontend/               # React/TypeScript SPA
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── screens/       # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management (Zustand)
│   │   ├── hooks/         # Custom React hooks
│   │   ├── types/         # TypeScript types
│   │   └── utils/         # Utilities
│   └── Dockerfile
├── question-packs/         # Industry question content
├── docs/                   # Documentation
├── .github/workflows/      # CI/CD pipelines
└── docker-compose.yml      # Container orchestration
```

## 🔐 Security Features

- **JWT-based authentication** with refresh tokens
- **bcrypt password hashing** (12 rounds)
- **Rate limiting** on all endpoints
- **Helmet.js security headers**
- **Input validation** with Joi
- **SQL injection prevention** with parameterized queries
- **CORS configuration**
- **Audit logging** for all actions

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test
npm run test:coverage

# Frontend tests
cd frontend
npm test
npm run test:ui
```

## 📦 Deployment

### Production Build

```bash
# Build all services
docker-compose -f docker-compose.yml build

# Deploy
docker-compose up -d
```

### Environment Configuration

See `.env.example` for all configuration options. Key variables:

- `DB_PASSWORD` - Database password
- `JWT_SECRET` - JWT signing key (min 32 chars)
- `CORS_ORIGIN` - Allowed frontend origin
- `OPENAI_API_KEY` - Optional OpenAI integration
- `ANTHROPIC_API_KEY` - Optional Claude integration

## 👥 Team Management

Teams can be configured during setup:
- Minimum: 2 teams
- Maximum: 6 teams
- Custom names and colors
- Score tracking with negative score support (optional)

## 🎓 Educational Focus

This platform is designed for:
- **Security Awareness Training**
- **Compliance Education** (NCUA, FFIEC, PCI-DSS, HIPAA, etc.)
- **Team Building** exercises
- **Knowledge Assessment**
- **Incident Response** training

## 📊 Reporting & Analytics

- Real-time scoreboards
- Question difficulty tracking
- Learning outcome mapping
- Team performance metrics
- Compliance framework coverage

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Capital Technology Group
- NCUA Cybersecurity Resources
- FFIEC Cybersecurity Assessment Tool
- The open-source community

## 📞 Support

For issues, questions, or feature requests:
- Open an issue on GitHub
- Contact: support@cyberjeopardymadness.com

---

**Built with ❤️ for Federal Credit Unions and Financial Institutions**

*Securing the financial sector, one question at a time.*
