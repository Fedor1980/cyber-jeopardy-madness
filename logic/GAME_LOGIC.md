# Cyber Jeopardy Madness - Game Logic Documentation

## Overview

Cyber Jeopardy Madness is a browser-based, client-side game application built with vanilla JavaScript, HTML5, and CSS3. No backend or server is required.

## Architecture

### Core Components

1. **CyberJeopardyGame Class** (`public/js/game.js`)
   - Main game controller
   - Manages all game state and logic
   - Handles UI updates and event listeners

2. **Game Data** (`game_questions.json`)
   - Question database
   - Category structure
   - Answer validation data

3. **UI Layer** (`public/index.html`, `public/css/style.css`)
   - Screen management
   - Modals and overlays
   - Responsive layouts

## Game Flow

### 1. Initialization Phase

```
Page Load → DOM Ready → Game Class Instantiation → Load Questions → Setup Listeners
```

**Key Actions:**
- Fetch and parse `game_questions.json`
- Initialize event listeners
- Set default values
- Display welcome screen

### 2. Setup Phase

```
Welcome Screen → Team Configuration → AI Setup (Optional) → Start Game
```

**Key Actions:**
- Collect team names (2-6 teams)
- Validate team inputs
- Configure AI integration
- Initialize game state

### 3. Gameplay Loop

```
Show Board → Team Selection → Display Question → Answer Submission → Score Update → Next Team → Repeat
```

**Key Actions:**
- Display available questions
- Track answered questions
- Manage team turns
- Calculate scores
- Update UI in real-time

### 4. Question Flow

```
Click Question → Show Modal → Select Answer → Submit → Validate → Show Result → Continue
```

**Key Actions:**
- Display question text and options
- Enable answer selection
- Validate against correct answer
- Update team score
- Show explanation

### 5. Game End

```
All Questions Answered → Calculate Final Scores → Rank Teams → Show Winner → Offer Replay
```

**Key Actions:**
- Sort teams by score
- Display final standings
- Announce winner
- Provide replay options

## Data Structures

### Team Object
```javascript
{
  id: Number,           // Unique team identifier
  name: String,         // Team display name
  score: Number         // Current point total
}
```

### Question Object
```javascript
{
  points: Number,       // Point value (100-500)
  question: String,     // Question text
  options: Array,       // 4 answer choices
  answer: String,       // Correct answer
  explanation: String   // Educational explanation
}
```

### Category Object
```javascript
{
  name: String,         // Category name
  questions: Array      // Array of Question objects
}
```

### Game State
```javascript
{
  gameData: Object,              // Loaded question data
  teams: Array,                  // Array of Team objects
  currentTeamIndex: Number,      // Active team index
  answeredQuestions: Set,        // Answered question IDs
  currentQuestion: Object,       // Active question data
  aiEnabled: Boolean,            // AI feature flag
  openaiKey: String              // OpenAI API key
}
```

## Scoring System

### Point Award Rules

1. **Correct Answer:**
   - Team score increases by question point value
   - Question marked as answered
   - Turn passes to next team

2. **Incorrect Answer:**
   - Team score decreases by question point value
   - Question marked as answered
   - Turn passes to next team

3. **Skipped Question:**
   - No score change
   - Question marked as answered
   - Turn passes to next team

### Score Calculation

```javascript
// Correct answer
team.score += question.points

// Incorrect answer
team.score -= question.points

// Score can be negative
```

## Turn Management

### Turn Order
- Sequential rotation through teams
- Wraps around after last team
- Index: `(currentTeamIndex + 1) % teams.length`

### Turn Indicators
- Visual highlight on scoreboard
- Current team display
- Active state CSS class

## AI Integration (Optional)

### GPT Hint System

**Flow:**
1. User clicks "Get AI Hint"
2. Construct prompt with question and options
3. Call OpenAI API with gpt-3.5-turbo
4. Display educational hint (not direct answer)
5. Cache key in session storage

**API Request:**
```javascript
{
  model: "gpt-3.5-turbo",
  messages: [
    { role: "system", content: "Educational instructor prompt" },
    { role: "user", content: "Question + options" }
  ],
  max_tokens: 150,
  temperature: 0.7
}
```

**Security:**
- API key stored in browser session only
- Direct browser-to-OpenAI communication
- No key transmission to game servers
- Key cleared on page refresh

## UI State Management

### Screen States

1. **welcome-screen** - Team setup
2. **game-screen** - Active gameplay
3. **gameover-screen** - Final results

### Modal States

1. **question-modal** - Question display
2. **result-modal** - Answer feedback

### Screen Transitions

```javascript
showScreen(screenId) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  // Show target screen
  document.getElementById(screenId).classList.add('active');
}
```

## Event Handling

### Primary Events

| Event | Handler | Action |
|-------|---------|--------|
| Team count change | updateTeamInputs() | Regenerate team inputs |
| AI toggle | show/hide key input | Display API key field |
| Start game | startGame() | Initialize gameplay |
| Question click | showQuestion() | Display question modal |
| Option select | selectOption() | Mark answer selection |
| Submit answer | submitAnswer() | Validate and score |
| Skip question | skipQuestion() | Mark answered, no score |
| Get hint | getAIHint() | Call OpenAI API |
| Continue | closeResultModal() | Close result display |
| Reset | resetGame() | Restart with same teams |
| Play again | playAgain() | New game, same teams |
| New teams | newTeams() | Return to setup |

## Answer Validation

### Validation Logic

```javascript
const isCorrect = selectedOption === question.answer;
```

- Exact string match required
- Case-sensitive comparison
- No partial credit

## Question Tracking

### Tracking Method

```javascript
// Question ID format: "categoryIndex-questionIndex"
const questionId = `${catIndex}-${qIndex}`;

// Tracking with Set
this.answeredQuestions.add(questionId);
this.answeredQuestions.has(questionId);
```

### Benefits
- O(1) lookup performance
- Prevents duplicate answers
- Easy size checking for game end

## Game End Detection

### End Condition

```javascript
if (answeredQuestions.size === getTotalQuestions()) {
  endGame();
}
```

### Total Questions Calculation

```javascript
getTotalQuestions() {
  return categories.reduce((total, category) => {
    return total + category.questions.length;
  }, 0);
}
```

## Winner Determination

### Winner Logic

```javascript
// Sort teams by score (descending)
const sortedTeams = [...teams].sort((a, b) => b.score - a.score);

// Winner is first in sorted array
const winner = sortedTeams[0];
```

### Tie Handling
- Currently: First team in sort wins
- Future: Could add tiebreaker round

## Local Storage

### Storage Usage

**Currently:**
- No persistent storage
- All state lost on refresh
- Session-only API key storage

**Future Enhancement:**
- Save game state
- Leaderboard persistence
- Game history

## Performance Considerations

### Optimization Strategies

1. **Efficient DOM Updates**
   - Batch DOM modifications
   - Use document fragments
   - Minimize reflows

2. **Event Delegation**
   - Use bubbling for dynamic elements
   - Single listener per container

3. **Data Structure Selection**
   - Set for answered questions (O(1) lookup)
   - Array for ordered teams
   - Object for question data

## Browser Compatibility

### Requirements

- Modern browser with ES6 support
- Fetch API support
- CSS Grid support
- LocalStorage (optional, for future features)

### Tested Browsers

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Error Handling

### Error Scenarios

1. **Failed JSON Load**
   - Alert user
   - Suggest page refresh
   - Log to console

2. **Invalid Team Setup**
   - Prevent game start
   - Show validation message
   - Highlight errors

3. **API Failures**
   - Display error in hint section
   - Continue game without AI
   - Suggest key verification

## Security Considerations

### Data Privacy

- No data leaves client
- No cookies set
- No tracking or analytics
- API keys in memory only

### XSS Prevention

- No innerHTML with user input
- Sanitized text content
- No eval() usage
- Content Security Policy ready

## Testing Strategy

### Manual Testing Checklist

- [ ] Team creation (2-6 teams)
- [ ] Custom team names
- [ ] Question selection
- [ ] Answer validation
- [ ] Score calculation
- [ ] Turn rotation
- [ ] Game end detection
- [ ] Winner announcement
- [ ] Play again functionality
- [ ] AI hint generation
- [ ] Modal interactions
- [ ] Responsive layout
- [ ] Browser compatibility

## Future Enhancements

### Planned Features

1. **Tournament Brackets**
   - Multi-round elimination
   - Bracket visualization
   - Championship tracking

2. **Statistics**
   - Question difficulty analytics
   - Team performance metrics
   - Category strengths

3. **Custom Questions**
   - CSV import
   - In-game editor
   - Question sharing

4. **Multiplayer**
   - WebSocket support
   - Real-time sync
   - Remote teams

---

**Document Version:** 1.0
**Last Updated:** 2025-11
**Maintainer:** Cyber Jeopardy Madness Team
