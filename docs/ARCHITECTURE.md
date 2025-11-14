# System Architecture

## Overview

Cyber Jeopardy Madness is built using a modern, scalable three-tier architecture designed for enterprise deployment.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                   Load Balancer                     │
└─────────────────────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
┌────────▼─────────┐          ┌─────────▼─────────┐
│   Frontend SPA   │          │   Frontend SPA    │
│  (React/Vite)    │          │  (React/Vite)     │
│   Port 80/443    │          │   Port 80/443     │
└────────┬─────────┘          └─────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         │ REST API
         ┌───────────────▼───────────────┐
         │                               │
┌────────▼─────────┐          ┌─────────▼─────────┐
│  Backend API     │          │  Backend API      │
│ (Express/Node)   │          │ (Express/Node)    │
│   Port 3001      │          │   Port 3001       │
└────────┬─────────┘          └─────────┬─────────┘
         │                               │
         └───────────────┬───────────────┘
                         │
              ┌──────────▼──────────┐
              │   PostgreSQL DB     │
              │     Port 5432       │
              │   (Primary/Replica) │
              └─────────────────────┘
```

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 5
- **State Management**: Zustand
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **UI/Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Language**: TypeScript 5
- **Database**: PostgreSQL 15
- **ORM**: Native pg driver (raw SQL)
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, CORS, bcrypt
- **Logging**: Winston

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Web Server**: Nginx (frontend)
- **Process Manager**: Node.js native
- **Database Migrations**: Custom TypeScript scripts

## Core Components

### 1. Frontend Application

#### Screens
- `SetupScreen` - Game configuration and team creation
- `GameScreen` - Main game board and gameplay
- `FinalJeopardyScreen` - Final round with wagering
- `GameOverScreen` - Results and winner announcement

#### State Management
```typescript
GameStore (Zustand)
├── Session State
│   ├── session: GameSession
│   ├── teams: Team[]
│   └── currentQuestion: Question
├── Board State
│   ├── categories: Category[]
│   ├── questions: Question[]
│   └── attemptedQuestions: Set<string>
└── UI State
    ├── modals (question, result, final jeopardy, game over)
    └── aiApiKey
```

#### Services
- `ApiService` - HTTP client with interceptors
- `GameService` - Game operations (sessions, answers, rounds)
- `AIService` - AI hint and explanation generation

### 2. Backend API

#### Layer Architecture

```
Routes → Controllers → Services → Models → Database
  │          │            │          │         │
  │          │            │          │         │
  └─ Validation          └─ Business    └─ Data Access
     Middleware             Logic
```

#### API Endpoints

**Authentication** (`/api/v1/auth`)
- `POST /register` - User registration
- `POST /login` - User authentication
- `GET /me` - Get current user
- `POST /refresh` - Refresh access token

**Game** (`/api/v1/game`)
- `POST /sessions` - Create game session
- `GET /sessions/:id` - Get session details
- `GET /sessions/:id/board` - Get game board
- `GET /questions/:id` - Get question details
- `POST /answer` - Submit answer
- `POST /sessions/:id/advance` - Advance round
- `POST /final-jeopardy` - Submit Final Jeopardy
- `POST /sessions/:id/complete` - Complete game
- `PATCH /sessions/:id/current-team` - Update turn

**AI** (`/api/v1/ai`)
- `POST /hint` - Get AI hint
- `POST /explain/:questionId` - Get explanation

**Health** (`/api/v1/health`)
- `GET /health` - System health check

#### Middleware Pipeline

```
Request
  ↓
Rate Limiter
  ↓
CORS
  ↓
Helmet (Security Headers)
  ↓
Body Parser
  ↓
Authentication (if required)
  ↓
Validation
  ↓
Route Handler
  ↓
Error Handler
  ↓
Response
```

### 3. Database Schema

#### Entity Relationship

```
users ─┬─> game_sessions ─┬─> teams
       │                   │
       │                   └─> question_attempts
       │
       └─> audit_logs

industry_packs ─> categories ─> questions ─> ai_hints_cache
                                     │
                                     └─> question_attempts

teams ─> final_jeopardy_wagers
```

#### Key Tables

**users**
- Authentication and authorization
- Roles: admin, player, facilitator

**game_sessions**
- Session configuration
- Current round and status
- Settings (time limits, scoring rules)

**teams**
- Team information
- Real-time scoring
- Order/turn management

**categories**
- Question groupings
- Industry pack association
- Round assignment

**questions**
- Question content
- Answer options (correct + distractors)
- Compliance references
- Difficulty levels
- Learning outcomes

**question_attempts**
- Answer history
- Time tracking
- Points awarded
- Hint usage

**final_jeopardy_wagers**
- Wagering amounts
- Final answers
- Results

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Backend validates credentials
   ↓
3. Generate JWT (access + refresh tokens)
   ↓
4. Client stores tokens (localStorage)
   ↓
5. Client includes token in Authorization header
   ↓
6. Backend validates JWT on protected routes
   ↓
7. Access granted/denied
```

### Authorization Levels

- **Anonymous**: Can create and play games
- **Player**: Full game access
- **Facilitator**: Game management + reporting
- **Admin**: Full system access + user management

### Data Protection

- Passwords: bcrypt (12 rounds)
- Database: Parameterized queries (SQL injection prevention)
- API: Rate limiting, input validation
- Transport: HTTPS required in production
- Sessions: JWT with expiration

## Scalability Considerations

### Horizontal Scaling

**Frontend**
- Stateless React SPA
- CDN distribution
- Nginx load balancing

**Backend**
- Stateless API servers
- JWT-based auth (no session storage)
- Database connection pooling

**Database**
- PostgreSQL read replicas
- Connection pooling (20 connections per instance)
- Prepared statements

### Performance Optimizations

**Frontend**
- Code splitting
- Lazy loading
- Asset optimization
- Service worker (PWA ready)

**Backend**
- Query optimization with indexes
- Response compression
- Caching strategy (ready for Redis)

### Monitoring & Observability

- Winston logging (structured logs)
- Health check endpoints
- Audit logging
- Error tracking (ready for Sentry)

## Deployment Architecture

### Development
```
localhost:5173 (Frontend) → localhost:3001 (API) → localhost:5432 (DB)
```

### Production
```
CDN → Nginx → Backend Cluster → PostgreSQL Primary/Replica
      ↓
   SSL/TLS
```

### Docker Deployment

```yaml
services:
  - database (PostgreSQL)
  - backend (Node.js API)
  - frontend (Nginx + React build)

networks:
  - cyber-jeopardy-network (bridge)

volumes:
  - postgres_data (persistent)
  - backend_logs (persistent)
```

## API Design Principles

1. **RESTful** - Resource-oriented URLs
2. **Versioned** - `/api/v1/`
3. **Stateless** - No server-side sessions
4. **Consistent** - Standard response formats
5. **Secure** - Authentication on sensitive endpoints
6. **Validated** - Input validation on all requests
7. **Documented** - OpenAPI/Swagger ready

## Database Design Principles

1. **Normalized** - 3NF normalization
2. **Indexed** - Strategic indexing for performance
3. **Constrained** - Foreign keys and constraints
4. **Auditable** - Audit logs for all changes
5. **Timestamped** - created_at/updated_at on all tables
6. **UUID Primary Keys** - Distributed system ready

## Error Handling Strategy

```typescript
AppError (Base)
  ├── ValidationError (400)
  ├── AuthenticationError (401)
  ├── AuthorizationError (403)
  ├── NotFoundError (404)
  ├── ConflictError (409)
  ├── RateLimitError (429)
  └── InternalServerError (500)
```

## Future Enhancements

1. **WebSocket support** for real-time gameplay
2. **Redis caching** for improved performance
3. **Kubernetes deployment** for auto-scaling
4. **GraphQL API** as alternative to REST
5. **Mobile apps** (React Native)
6. **Admin dashboard** (React Admin)
7. **Analytics platform** (integration with data warehouse)
8. **Multi-language support** (i18n)

---

*This architecture is designed to support thousands of concurrent users while maintaining security and performance standards required by financial institutions.*
