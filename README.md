# 🔒 Cyber Jeopardy Madness

A team-based cybersecurity awareness training game built for Federal Credit Unions. Features a Jeopardy-style format with optional GPT integration for AI-powered hints and bracket-based team competition.

![Game Type](https://img.shields.io/badge/Game-Jeopardy%20Style-blue)
![Purpose](https://img.shields.io/badge/Purpose-Cybersecurity%20Training-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 🎮 Features

- **6 Comprehensive Categories**: Phishing, Password Security, Social Engineering, Data Protection, Compliance & Policy, and Malware & Threats
- **30 Questions**: 5 difficulty levels per category (100-500 points)
- **Team-Based Competition**: Support for 2-6 teams with real-time scoring
- **AI-Powered Hints**: Optional OpenAI GPT integration for educational hints
- **Professional UI**: Authentic Jeopardy-style interface with animations
- **Educational Focus**: Each question includes detailed explanations
- **Mobile Responsive**: Works on all devices
- **Zero Backend**: Pure client-side application for easy deployment

## 📋 Question Categories

1. **Phishing** - Email security, social engineering, and recognizing threats
2. **Password Security** - Best practices, MFA, and password management
3. **Social Engineering** - Physical and psychological security threats
4. **Data Protection** - PII, encryption, and data handling
5. **Compliance & Policy** - GLBA, NCUA regulations, and security policies
6. **Malware & Threats** - Ransomware, zero-days, and attack vectors

## 🚀 Quick Start

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run locally:**
   ```bash
   npm start
   ```
   The game will open automatically at `http://localhost:8080`

### Manual Setup (No npm)

Simply open `public/index.html` in a web browser - no installation required!

## 🎯 How to Play

1. **Setup**: Enter the number of teams (2-6) and team names
2. **Optional AI**: Enable GPT hints by providing an OpenAI API key
3. **Gameplay**:
   - Teams take turns selecting questions from the board
   - Higher point values indicate harder questions
   - Correct answers add points, incorrect answers subtract points
   - Questions include detailed explanations for learning
4. **Winning**: The team with the highest score after all questions wins!

## 🤖 AI Integration (Optional)

To enable AI-powered hints:

1. Get an OpenAI API key from [platform.openai.com](https://platform.openai.com)
2. Enable "AI Assistant" in game setup
3. Enter your API key (stored locally only)
4. Click "💡 Get AI Hint" during questions for educational guidance

**Note**: API keys are never sent to our servers - they're used directly from your browser to OpenAI.

## 📦 Deployment

### Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Fedor1980/cyber-jeopardy-madness)

Or manually:
```bash
npm install -g vercel
vercel
```

### Deploy to GitHub Pages

1. Go to your repository settings
2. Navigate to Pages section
3. Set source to "Deploy from a branch"
4. Select branch: `main` (or your branch)
5. Set folder: `/public`
6. Save and wait for deployment

Your game will be available at: `https://[username].github.io/cyber-jeopardy-madness/`

### Deploy to Firebase

```bash
npm install -g firebase-tools
firebase login
firebase init hosting
# Select 'public' as your public directory
# Configure as single-page app: No
# Set up automatic builds: No
firebase deploy
```

### Deploy to Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: (leave empty)
3. Set publish directory: `public`
4. Deploy!

Or use Netlify CLI:
```bash
npm install -g netlify-cli
netlify deploy --prod --dir=public
```

## 🛠️ Customization

### Adding Questions

Edit `game_questions.json` to add or modify questions:

```json
{
  "name": "Your Category",
  "questions": [
    {
      "points": 100,
      "question": "Your question text?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Correct Option",
      "explanation": "Educational explanation of the answer"
    }
  ]
}
```

### Modifying Styles

Edit `public/css/style.css` to customize colors, fonts, and layout:

```css
:root {
    --jeopardy-blue: #060CE9;
    --jeopardy-gold: #FFD700;
    /* Add your custom colors */
}
```

### Changing Game Logic

Edit `public/js/game.js` to modify game rules, scoring, or behavior.

## 📁 Project Structure

```
cyber-jeopardy-madness/
├── public/                 # Web application files
│   ├── index.html         # Main HTML file
│   ├── css/
│   │   └── style.css      # Game styling
│   ├── js/
│   │   └── game.js        # Game logic
│   ├── assets/            # Images and media (empty by default)
│   └── .nojekyll          # GitHub Pages config
├── logic/                 # Game logic documentation (optional)
├── game_questions.json    # Question database
├── package.json           # NPM dependencies
├── vercel.json           # Vercel deployment config
├── .gitignore
├── LICENSE
└── README.md
```

## 🔒 Security & Privacy

- No user data is collected or stored
- OpenAI API keys are stored locally in browser session only
- All game data stays on the client
- No backend servers or databases
- Safe for use in corporate environments

## 🎓 Educational Use

This game is designed for:
- Federal Credit Union staff training
- Security awareness programs
- Team building exercises
- Compliance training sessions
- New employee onboarding
- Quarterly security refreshers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests with:
- Additional questions
- New categories
- Bug fixes
- Feature enhancements
- UI improvements

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details

## 🙏 Acknowledgments

- Designed for Federal Credit Union cybersecurity training
- Question content based on GLBA and NCUA security requirements
- Inspired by the classic Jeopardy! game show format

## 📧 Support

For issues or questions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the game rules and setup instructions

## 🎯 Roadmap

Future enhancements planned:
- [ ] Tournament bracket system for multiple rounds
- [ ] Score export and reporting
- [ ] Daily Double special questions
- [ ] Final Jeopardy bonus round
- [ ] Custom question import from CSV
- [ ] Leaderboard persistence
- [ ] Sound effects and music
- [ ] Multiplayer online mode

---

**Made with ❤️ for Federal Credit Union cybersecurity awareness**

Start playing now and make cybersecurity training fun and engaging!
