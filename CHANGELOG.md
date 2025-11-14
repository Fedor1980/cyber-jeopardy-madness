# Changelog

All notable changes to Cyber Jeopardy Madness will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-11-13

### Added
- Complete Jeopardy-style game board with 6 categories
- 30 comprehensive cybersecurity questions (5 per category)
- Categories: Phishing, Password Security, Social Engineering, Data Protection, Compliance & Policy, Malware & Threats
- Team-based gameplay supporting 2-6 teams
- Real-time scoring system with positive/negative points
- Turn-based rotation between teams
- Question difficulty levels (100-500 points)
- Educational explanations for all answers
- Optional AI-powered hints using OpenAI GPT-3.5
- Professional Jeopardy-style UI with animations
- Responsive design for mobile and desktop
- Game over screen with winner announcement
- Play again and new teams functionality
- Deployment configurations for Vercel, GitHub Pages, Firebase, and Netlify
- Comprehensive documentation (README, CONTRIBUTING, GAME_LOGIC)
- GitHub Actions workflow for automated deployment
- MIT License
- EditorConfig for code consistency

### Features
- **Welcome Screen**: Team setup and configuration
- **Game Board**: Interactive question selection
- **Question Modal**: Multiple choice interface
- **Result Modal**: Answer feedback with explanations
- **Scoreboard**: Real-time team score tracking
- **AI Hints**: Optional GPT-powered educational hints
- **Game Controls**: Reset and navigation options
- **End Game**: Final scores and winner announcement

### Technical
- Pure client-side JavaScript (no backend required)
- ES6+ modern JavaScript
- CSS Grid and Flexbox layouts
- Fetch API for data loading
- LocalStorage for API key (session only)
- Mobile-responsive design
- Cross-browser compatible

### Documentation
- Comprehensive README with setup instructions
- CONTRIBUTING guide for contributors
- GAME_LOGIC technical documentation
- Asset usage guidelines
- Deployment instructions for multiple platforms

### Security
- No data collection or tracking
- Client-side only operation
- API keys stored locally
- No cookies or persistent storage
- XSS prevention measures

## [2.0.0] - 2025-11-14

### Complete Professional Game Show Redesign

This is a **GALAXY-TIER UPGRADE** transforming Cyber Jeopardy into a professional, authentic Jeopardy game show experience.

### Added
- **3 Individual Contestants**: Authentic game show format with individual players (not teams)
- **Random Starting Player**: Computer randomly selects first contestant
- **Professional Buzzer System**:
  - Q/W/E keyboard controls for buzzing in
  - 7-second buzz-in timer when primary contestant answers incorrectly
  - Visual buzz indicators on podiums
  - Multiple contestants can attempt each question
- **Dual Timer System**:
  - 15-second primary timer for active contestant
  - 7-second buzz-in timer for remaining contestants
  - Visual countdown bar with color-coded warnings
- **Winner Keeps Picking**: Correct answer = contestant continues selecting questions
- **Daily Doubles**:
  - 1 Daily Double in Round 1
  - 2 Daily Doubles in Round 2
  - Custom wagering system with max limits
  - Dramatic reveal animations
- **Three Complete Rounds**:
  - Round 1: Jeopardy ($100-$500 values)
  - Round 2: Double Jeopardy ($200-$1000 values)
  - Round 3: Final Jeopardy with full wagering system
- **Industry Vertical Framework**:
  - Pluggable content system for different industries
  - Federal Credit Unions as first vertical
  - Support for Banking, Healthcare, Retail, General Corporate
- **Professional UI/UX**:
  - Bebas Neue font for authentic Jeopardy styling
  - Gold (#ffcc00) question values
  - Podium displays with live score tracking
  - Buzz flash animations
  - Smooth transitions and reveals

### Changed
- **Complete CSS Rebuild**: 1100+ lines of professional game show styling
- **Complete JavaScript Rewrite**: 900+ lines of modern ES6+ class-based architecture
- **UI Completely Redesigned**: From team-based to individual contestant format
- **Scoring System**: Now tracks negative scores for incorrect answers
- **Game Flow**: Linear progression through all 3 rounds

### Technical Improvements
- Class-based architecture (CyberJeopardyGame)
- Event-driven keyboard handling
- State management for buzzer, timers, and contestants
- Responsive grid layouts for game board (6x5 questions)
- CSS animations for buzz indicators, timers, and reveals
- Modal system for questions, results, and Daily Doubles

### Visual Enhancements
- Capital Technology Group brand colors integrated throughout
- Professional podium displays
- Timer bar with gradient fill and warning states
- Buzzer buttons with keyboard key indicators
- Champion screen with trophy and final standings
- Daily Double spinning reveal animation

### Game Features
- Real-time score tracking with positive/negative values
- Educational explanations for all answers
- Contestant name customization
- Active contestant highlighting
- Round progression with automatic board rebuilding
- Final Jeopardy wagering and reveal
- Winner determination and celebration

## [Unreleased]

### Planned Features
- Sound effects (Daily Double jingle, buzzer sounds, theme music)
- Score export and reporting
- Custom question import from CSV
- Leaderboard persistence
- Additional industry verticals
- Tournament bracket system
- Multiplayer online mode

---

## Release Notes

### Version 1.0.0 - Initial Release

This is the first stable release of Cyber Jeopardy Madness, a cybersecurity training game designed specifically for Federal Credit Unions.

**Key Highlights:**
- Complete game implementation with 30 questions
- Team-based competition format
- Optional AI integration
- Multiple deployment options
- Comprehensive documentation
- Production-ready code

**Target Audience:**
- Federal Credit Union employees
- Security awareness trainers
- Compliance officers
- IT departments
- Training coordinators

**Browser Support:**
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

**Installation:**
No installation required - simply open in a web browser or deploy to any static hosting platform.

**Getting Started:**
See README.md for quick start guide and deployment instructions.

---

[1.0.0]: https://github.com/Fedor1980/cyber-jeopardy-madness/releases/tag/v1.0.0
