# 📡 Cyber Jeopardy Madness - API Documentation

## Base URL

```
http://localhost:3001/api/v1
```

Production: `https://your-domain.com/api/v1`

## Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE",
    "details": { ... }
  }
}
```

---

## 🔐 Authentication Endpoints

### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "username": "string",
  "email": "string",
  "password": "string",
  "role": "player" | "facilitator" | "admin"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid",
      "username": "string",
      "email": "string",
      "role": "string"
    },
    "accessToken": "string",
    "refreshToken": "string"
  }
}
```

### Login
```http
POST /auth/login
Content-Type: application/json

{
  "username": "string",
  "password": "string"
}
```

**Response:** Same as Register

### Refresh Token
```http
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "accessToken": "string"
  }
}
```

### Get Current User
```http
GET /auth/me
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "username": "string",
    "email": "string",
    "role": "string",
    "createdAt": "datetime"
  }
}
```

---

## 🎮 Game Endpoints

### Create Game Session
```http
POST /game/sessions
Content-Type: application/json
Authorization: Bearer <token> (optional)

{
  "name": "string",
  "industryPack": "federal-credit-union",
  "teams": [
    {
      "name": "Team Red",
      "color": "#ff0000"
    },
    {
      "name": "Team Blue",
      "color": "#0000ff"
    }
  ],
  "settings": {
    "timerSeconds": 30,
    "difficulty": "intermediate",
    "enableAI": true,
    "enableBuzzIn": true
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "name": "string",
    "industryPack": "string",
    "currentRound": 1,
    "status": "setup",
    "teams": [
      {
        "id": "uuid",
        "name": "string",
        "color": "string",
        "score": 0,
        "orderPosition": 1
      }
    ],
    "createdAt": "datetime"
  }
}
```

### Get Game Session
```http
GET /game/sessions/:sessionId
```

**Response:** Same as Create Session

### Get Game Board
```http
GET /game/sessions/:sessionId/board
```

**Response:**
```json
{
  "success": true,
  "data": {
    "round": 1,
    "categories": [
      {
        "id": "uuid",
        "name": "Phishing",
        "questions": [
          {
            "id": "uuid",
            "points": 200,
            "isAnswered": false,
            "isDailyDouble": false
          },
          // ... more questions
        ]
      },
      // ... more categories
    ]
  }
}
```

### Get Question
```http
GET /game/questions/:questionId
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "questionText": "string",
    "options": ["string", "string", "string", "string"],
    "pointValue": 200,
    "difficulty": "medium",
    "complianceReference": "NCUA Part 748",
    "categoryName": "Phishing"
  }
}
```

### Submit Answer
```http
POST /game/answer
Content-Type: application/json

{
  "sessionId": "uuid",
  "teamId": "uuid",
  "questionId": "uuid",
  "selectedAnswer": "string",
  "timeTaken": 15
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isCorrect": true,
    "pointsAwarded": 200,
    "correctAnswer": "string",
    "explanation": "string",
    "newScore": 200,
    "teamId": "uuid"
  }
}
```

### Advance Round
```http
POST /game/sessions/:sessionId/advance
```

**Response:**
```json
{
  "success": true,
  "data": {
    "newRound": 2,
    "status": "round_2"
  }
}
```

### Submit Final Jeopardy
```http
POST /game/final-jeopardy
Content-Type: application/json

{
  "sessionId": "uuid",
  "wagers": [
    {
      "teamId": "uuid",
      "wagerAmount": 500,
      "answer": "string"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "teamId": "uuid",
        "isCorrect": true,
        "pointsAwarded": 500,
        "finalScore": 1500
      }
    ],
    "winner": {
      "teamId": "uuid",
      "teamName": "Team Red",
      "finalScore": 1500
    }
  }
}
```

### Complete Game
```http
POST /game/sessions/:sessionId/complete
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sessionId": "uuid",
    "status": "completed",
    "winner": {
      "teamId": "uuid",
      "teamName": "string",
      "score": 1500
    },
    "finalScores": [...]
  }
}
```

### Update Current Team
```http
PATCH /game/sessions/:sessionId/current-team
Content-Type: application/json

{
  "teamId": "uuid"
}
```

---

## 🤖 AI Endpoints

### Get Hint
```http
POST /ai/hint
Content-Type: application/json

{
  "questionId": "uuid",
  "hintType": "basic" | "detailed" | "explanation",
  "apiKey": "sk-..." (optional, for OpenAI/Anthropic)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "hint": "string"
  }
}
```

### Get Answer Explanation
```http
POST /ai/explanation/:questionId
Content-Type: application/json

{
  "selectedAnswer": "string",
  "apiKey": "sk-..." (optional)
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "explanation": "string"
  }
}
```

---

## 🏆 Leaderboard Endpoints

### Get Global Leaderboard
```http
GET /leaderboard?industryPack=federal-credit-union&limit=100&offset=0
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "teamId": "uuid",
      "teamName": "string",
      "score": 2500,
      "sessionId": "uuid",
      "sessionName": "string",
      "industryPack": "string",
      "completedAt": "datetime",
      "rank": 1
    },
    // ... more entries
  ]
}
```

### Get Session Leaderboard
```http
GET /leaderboard/sessions/:sessionId
```

**Response:** Same format as Global Leaderboard

### Get Team Statistics
```http
GET /leaderboard/teams/:teamId/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGames": 10,
    "totalScore": 15000,
    "averageScore": 1500,
    "bestScore": 2500,
    "worstScore": 800,
    "totalCorrect": 45,
    "totalIncorrect": 15,
    "accuracy": 75.0
  }
}
```

### Get Industry Pack Statistics
```http
GET /leaderboard/industry/:industryPack/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalGames": 100,
    "totalPlayers": 400,
    "averageScore": 1450,
    "topScore": 2800
  }
}
```

---

## 🔔 Buzz-In Endpoints

### Get Buzz Queue
```http
GET /buzz/sessions/:sessionId/queue
```

**Response:**
```json
{
  "success": true,
  "data": {
    "queue": [
      {
        "sessionId": "uuid",
        "teamId": "uuid",
        "teamName": "Team Red",
        "timestamp": 1234567890
      },
      // ... more buzzes in order
    ]
  }
}
```

### Clear Buzz Queue
```http
POST /buzz/sessions/:sessionId/clear
```

**Response:**
```json
{
  "success": true,
  "data": {
    "message": "Buzz queue cleared"
  }
}
```

---

## 🌐 WebSocket Events

### Connect
```javascript
const socket = io('http://localhost:3001');
```

### Client Events (Emit)

**Join Session:**
```javascript
socket.emit('join_session', sessionId);
```

**Leave Session:**
```javascript
socket.emit('leave_session', sessionId);
```

**Buzz In:**
```javascript
socket.emit('buzz_in', {
  sessionId: 'uuid',
  teamId: 'uuid',
  teamName: 'Team Red'
});
```

**Clear Buzzes:**
```javascript
socket.emit('clear_buzzes', sessionId);
```

**Send Game Event:**
```javascript
socket.emit('game_event', {
  sessionId: 'uuid',
  type: 'question_selected',
  data: { ... }
});
```

### Server Events (Listen)

**Buzz Received:**
```javascript
socket.on('buzz_received', (data) => {
  // { sessionId, teamId, teamName, timestamp }
});
```

**Buzz Queue:**
```javascript
socket.on('buzz_queue', (queue) => {
  // Array of buzz events
});
```

**Buzz Queue Cleared:**
```javascript
socket.on('buzz_queue_cleared', () => {
  // Queue has been cleared
});
```

**Question Selected:**
```javascript
socket.on('question_selected', (data) => {
  // { questionId, teamId, timestamp }
});
```

**Answer Result:**
```javascript
socket.on('answer_result', (data) => {
  // { teamId, isCorrect, pointsAwarded, timestamp }
});
```

**Score Update:**
```javascript
socket.on('score_update', (data) => {
  // { teamId, newScore, timestamp }
});
```

**Round Advanced:**
```javascript
socket.on('round_advanced', (data) => {
  // { round, timestamp }
});
```

**Game Completed:**
```javascript
socket.on('game_completed', (data) => {
  // { winner: { teamId, teamName, score }, timestamp }
});
```

**Game Update:**
```javascript
socket.on('game_update', (event) => {
  // { sessionId, type, data }
});
```

---

## ⚠️ Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Request validation failed |
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | JWT token invalid or expired |
| `NOT_FOUND` | Resource not found |
| `ALREADY_EXISTS` | Resource already exists |
| `FORBIDDEN` | Access denied |
| `RATE_LIMIT_EXCEEDED` | Too many requests |
| `INTERNAL_ERROR` | Server error |

---

## 🔒 Rate Limiting

- **Default:** 100 requests per 15 minutes per IP
- **Auth endpoints:** 5 requests per 15 minutes per IP
- **AI endpoints:** 20 requests per 15 minutes per user

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```

---

## 📝 Notes

1. All timestamps are in ISO 8601 format
2. UUIDs are version 4
3. AI endpoints are optional and require API keys
4. WebSocket connection automatically reconnects
5. Session data persists across disconnections
6. Maximum payload size: 10MB

---

## 🧪 Example: Complete Game Flow

```javascript
// 1. Create session
const session = await POST('/game/sessions', {
  name: 'Training Session 1',
  industryPack: 'federal-credit-union',
  teams: [
    { name: 'Team A', color: '#ff0000' },
    { name: 'Team B', color: '#0000ff' }
  ],
  settings: { timerSeconds: 30 }
});

// 2. Connect WebSocket
socket.emit('join_session', session.data.sessionId);

// 3. Get game board
const board = await GET(`/game/sessions/${sessionId}/board`);

// 4. Get question
const question = await GET(`/game/questions/${questionId}`);

// 5. Submit answer
const result = await POST('/game/answer', {
  sessionId,
  teamId,
  questionId,
  selectedAnswer: 'Option A',
  timeTaken: 15
});

// 6. Continue until round complete, then advance
await POST(`/game/sessions/${sessionId}/advance`);

// 7. Final Jeopardy
await POST('/game/final-jeopardy', {
  sessionId,
  wagers: [...]
});

// 8. Complete game
await POST(`/game/sessions/${sessionId}/complete`);

// 9. View leaderboard
const leaderboard = await GET('/leaderboard');
```

---

**For more information, visit the [main README](../README.md)**
