# 🔒 Cyber Jeopardy Madness

A comprehensive cybersecurity platform featuring two major components:

1. **Jeopardy Game** - Team-based cybersecurity awareness training for Federal Credit Unions
2. **Sovereign Scroll Pipeline** - Enterprise-grade document processing with DLT consent verification

![Game Type](https://img.shields.io/badge/Game-Jeopardy%20Style-blue)
![Pipeline](https://img.shields.io/badge/Pipeline-Sovereign%20AI-purple)
![Purpose](https://img.shields.io/badge/Purpose-Cybersecurity%20Training-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

---

## 🏗️ Repository Structure

This repository contains two distinct applications:

### 1. 🎮 Cybersecurity Jeopardy Game (`/public`)
Interactive training game with AI-powered hints

### 2. 🔐 Sovereign Scroll Processing Pipeline (`/`)
Production-ready document ingestion pipeline featuring:
- Kafka-based stream processing
- OPA (Open Policy Agent) for consent verification
- Hedera DLT integration for immutable audit logs
- Qdrant vector database for RAG
- Docker containerized infrastructure

**Jump to:** [Jeopardy Game Documentation](#jeopardy-game) | [Scroll Pipeline Documentation](#sovereign-scroll-pipeline)

---

# 🎮 Jeopardy Game

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

# 🔐 Sovereign Scroll Pipeline

An enterprise-grade document processing pipeline with DLT-backed consent verification, designed for organizations requiring full data sovereignty and regulatory compliance.

## 🏛️ Architecture

```
Documents → Apache Tika → Kafka → Scroll Processor → OPA → Qdrant Vector DB
                                         ↓
                                  Hedera DLT (Consent Verification)
```

**Key Components:**
- **Kafka** - Message streaming and event sourcing
- **OPA** - Policy-based consent verification
- **Hedera** - Distributed ledger for immutable audit logs
- **Qdrant** - Vector database for RAG (Retrieval Augmented Generation)
- **Scroll Processor** - Python-based validation and routing service

## 🚀 Quick Start (Pipeline)

### Prerequisites
- Docker & Docker Compose
- Python 3.11+
- 8GB RAM minimum

### 1. Start Infrastructure

```bash
# Launch all services
docker compose up -d

# Verify services
docker compose ps
```

Expected services:
- `kafka` on port 9092
- `opa` on port 8181
- `scroll-processor` consuming from Kafka
- `qdrant` on port 6333

### 2. Run End-to-End Test

```bash
# Create Python virtual environment
python3 -m venv venv
source venv/bin/activate

# Install producer dependencies
pip install -r producer_requirements.txt

# Send test scrolls
python produce_scrolls.py
```

### 3. Monitor Processing

```bash
# Watch scroll processor logs
docker logs -f scroll-processor

# Check Qdrant for processed documents
curl http://localhost:6333/collections/scrolls/points/scroll
```

## 📊 Test Scenarios

The test producer sends 3 scrolls to validate the complete pipeline:

### ✅ Scenario 1: Valid Scroll
- **Status:** Schema valid, consent approved
- **Result:** Processed and stored in Qdrant
- **Log:** `INFO: Scroll doc-valid-001 processed successfully`

### ❌ Scenario 2: Invalid Schema
- **Status:** Missing required field (`content`)
- **Result:** Rejected before consent check
- **Log:** `ERROR: Schema validation failed`

### ⛔ Scenario 3: No Consent
- **Status:** Schema valid, consent denied
- **Result:** Rejected by OPA policy
- **Log:** `WARNING: OPA consent check: DENIED`

## 🔧 Configuration

### Mock Consent Data

Edit `config/opa/mock_consents.json`:

```json
{
  "consents": [
    {
      "consent_id": "0xAb1C2D3E4F5a6B7c8D9e0F1a2B3c4D5e6F7a8B9c",
      "status": "CONSENTED",
      "timestamp": "2024-01-15T10:30:00Z"
    }
  ]
}
```

### OPA Policy

Consent verification policy in `config/opa/consent_policy.rego`:

```rego
package scrolls

import future.keywords.if
import future.keywords.in

default allow := false

allow if {
    consent := data.consents[_]
    consent.consent_id == input.consent_id
    consent.status == "CONSENTED"
}
```

## 📁 Pipeline Project Structure

```
cyber-jeopardy-madness/
├── docker-compose.yml          # Infrastructure orchestration
├── produce_scrolls.py          # Test message producer
├── producer_requirements.txt   # Python dependencies
├── TESTING_GUIDE.md           # Comprehensive test documentation
│
├── scroll-processor/          # Message consumer service
│   ├── Dockerfile
│   ├── processor.py           # Main processing logic
│   └── requirements.txt
│
└── config/
    └── opa/                   # Policy engine configuration
        ├── consent_policy.rego
        └── mock_consents.json
```

## 🧪 Testing

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive testing documentation including:

- End-to-end test execution
- Expected log outputs
- Troubleshooting guide
- Advanced testing scenarios
- Load testing procedures
- Metrics monitoring

## 🔒 Security Features

### Data Sovereignty
- All processing occurs within your infrastructure
- No external API calls for sensitive data
- Full audit trail via Hedera DLT

### Consent Verification
- Policy-based access control (OPA)
- Immutable consent records (Hedera)
- Real-time verification before processing

### Compliance
- GDPR-ready consent management
- Audit logs for regulatory compliance
- Schema validation for data integrity

## 🌐 Hedera Integration

The pipeline is designed to integrate with Hedera Consensus Service (HCS) for:

- **Immutable Consent Records**: Store consent approvals/denials on DLT
- **Audit Trail**: Complete processing history on distributed ledger
- **Timestamp Proof**: Cryptographic proof of consent at specific times

**Note:** Current version uses mock consents for testing. Production integration with Hedera HCS documented in `docs/hedera-integration.md`

## 📈 Production Deployment

### Scaling

Scale individual components:

```bash
# Scale Kafka brokers
docker compose up -d --scale kafka=3

# Scale scroll processors
docker compose up -d --scale scroll-processor=5
```

### Monitoring

Recommended monitoring stack:
- **Prometheus** - Metrics collection
- **Grafana** - Visualization dashboards
- **Kafka Manager** - Cluster management
- **OPA Dashboard** - Policy monitoring

### High Availability

For production:
- Deploy Kafka cluster with 3+ brokers
- Use ZooKeeper ensemble for coordination
- Implement Qdrant clustering for redundancy
- Set up OPA high-availability mode

## 🔗 Integration with RAG Pipeline

Processed scrolls in Qdrant can be queried for:

```python
from qdrant_client import QdrantClient

client = QdrantClient(host="localhost", port=6333)

# Semantic search
results = client.search(
    collection_name="scrolls",
    query_vector=embedding_model.encode("What is the company's Q3 performance?"),
    limit=5
)
```

Integrate with LLMs (Claude, GPT) for RAG:
- Retrieve relevant scroll context
- Generate AI responses with citations
- Maintain consent compliance throughout

## 🛠️ Customization

### Add Custom Validation

Edit `scroll-processor/processor.py`:

```python
def custom_validation(scroll):
    # Add business-specific validation
    if "confidential" in scroll.content.lower():
        raise ValidationError("Confidential content requires special handling")
```

### Extend OPA Policies

Add role-based access control in `consent_policy.rego`:

```rego
allow if {
    consent_valid
    user_has_role[input.user_role]
    data_classification_matches
}
```

## 📚 Related Documentation

- [Testing Guide](./TESTING_GUIDE.md) - Comprehensive testing procedures
- [NexusOS Docs Platform](./nexusos-docs/) - Revolutionary documentation system (7 layers complete!)
- [Implementation Status](./IMPLEMENTATION_STATUS.md) - Production-ready features

## 🚦 Status

**Current Version:** v1.0.0-beta
**Status:** Production-Ready for Testing
**Container Images:** All built and tested
**Test Coverage:** End-to-end validation implemented

### Completed ✅
- [x] Kafka infrastructure
- [x] OPA policy engine
- [x] Scroll processor service
- [x] Qdrant vector database
- [x] Mock consent verification
- [x] End-to-end testing suite
- [x] Docker containerization

### In Progress 🚧
- [ ] Hedera HCS integration
- [ ] Apache Tika document extraction
- [ ] RAG query endpoint
- [ ] Production monitoring stack

### Planned 📋
- [ ] Multi-region deployment
- [ ] Advanced analytics dashboard
- [ ] ML-based content classification
- [ ] Real-time alerts and notifications

---

**Made with ❤️ for Federal Credit Union cybersecurity awareness & enterprise data sovereignty**

Choose your adventure:
- 🎮 **[Play Jeopardy Game](#jeopardy-game)** - Interactive cybersecurity training
- 🔐 **[Deploy Scroll Pipeline](#sovereign-scroll-pipeline)** - Sovereign document processing
