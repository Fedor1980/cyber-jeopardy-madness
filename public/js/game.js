/**
 * CYBER JEOPARDY OMEGA ∞ - ELITE GAME SHOW ENGINE
 * Capital Technology Group - Cybersecurity Training Game
 *
 * Features:
 * - 3 Individual Contestants
 * - Random Starting Player Selection
 * - 15-Second Answer Timer
 * - 7-Second Buzz-In System (Q/W/E Keys)
 * - Winner Keeps Picking
 * - Zero-Day Exploits (Daily Doubles) with Wagering
 * - 3 Rounds: Reconnaissance → Advanced Ops → Final Verdict
 * - Industry-Specific Question Loading
 * - AI-Powered Hints (OpenAI GPT Integration)
 * - Animated Cyberspace Grid Background
 * - Background Music & Sound Effects
 * - Live Score HUD
 */

class CyberJeopardyGame {
    constructor() {
        // Game State
        this.contestants = [];
        this.currentContestant = null;
        this.currentRound = 1;
        this.currentQuestion = null;
        this.industry = 'fcu';
        this.gameData = null;

        // Board State
        this.board = [];
        this.answeredQuestions = new Set();
        this.dailyDoubles = [];

        // Timer State
        this.primaryTimer = null;
        this.buzzTimer = null;
        this.timerSeconds = 0;
        this.timerInterval = null;

        // Buzzer State
        this.buzzerActive = false;
        this.buzzerLocked = false;
        this.buzzedContestants = new Set();

        // AI Assistant State
        this.aiEnabled = false;
        this.aiKey = null;
        this.hintsRemaining = 3;
        this.maxHints = 3;

        // Canvas Animation State
        this.canvas = null;
        this.ctx = null;
        this.gridLines = [];
        this.animationFrame = null;

        // Audio State
        this.bgmPlaying = false;
        this.bgmAudio = null;

        // Elements
        this.elements = {};

        // Keyboard listener
        this.boundKeyHandler = this.handleKeyPress.bind(this);
    }

    /**
     * Initialize the game
     */
    async init() {
        this.cacheElements();
        this.attachEventListeners();
        this.initializeCanvas();
        this.initializeAI();
        this.initializeAudio();
        await this.loadGameData();
        this.showScreen('setup');
    }

    /**
     * Cache DOM elements
     */
    cacheElements() {
        this.elements = {
            // Screens
            setupScreen: document.getElementById('setup-screen'),
            gameScreen: document.getElementById('game-screen'),
            finalJeopardyScreen: document.getElementById('final-jeopardy-screen'),
            winnerScreen: document.getElementById('winner-screen'),

            // Setup
            contestantInputs: document.querySelectorAll('.contestant-name'),
            industrySelect: document.getElementById('industry'),
            startBtn: document.getElementById('start-show-btn'),

            // Game Board
            podiums: document.querySelectorAll('.podium'),
            roundTitle: document.getElementById('round-title'),
            gameBoard: document.getElementById('game-board'),
            pickerName: document.getElementById('picker-name'),

            // Modals
            questionModal: document.getElementById('question-modal'),
            resultModal: document.getElementById('result-modal'),
            dailyDoubleModal: document.getElementById('daily-double-modal'),

            // Question Modal
            questionCategory: document.querySelector('.question-category'),
            questionValue: document.querySelector('.question-value'),
            questionText: document.querySelector('.question-text'),
            timerBar: document.getElementById('timer-bar'),
            timerFill: document.querySelector('.timer-fill'),
            timerText: document.querySelector('.timer-text'),
            answerOptions: document.getElementById('answer-options'),
            buzzerPanel: document.getElementById('buzzer-panel'),
            buzzTimer: document.getElementById('buzz-timer'),

            // Result Modal
            resultIcon: document.querySelector('.result-icon'),
            resultStatus: document.querySelector('.result-status'),
            resultContestant: document.querySelector('.result-contestant'),
            resultExplanation: document.querySelector('.result-explanation'),
            continueBtn: document.getElementById('continue-btn'),

            // Daily Double
            ddContestant: document.querySelector('.dd-contestant'),
            ddCurrentScore: document.querySelector('.dd-current-score'),
            ddMaxWager: document.querySelector('.dd-max-wager'),
            ddWagerInput: document.getElementById('dd-wager-input'),
            submitWagerBtn: document.getElementById('submit-wager-btn'),

            // Final Jeopardy
            fjPhase: document.getElementById('fj-phase'),

            // Winner
            championDisplay: document.getElementById('champion-display'),
            finalStandings: document.getElementById('final-standings'),
            newGameBtn: document.getElementById('new-game-btn'),

            // Canvas & Effects
            canvas: document.getElementById('cyberspace-grid'),

            // AI Assistant
            aiEnabled: document.getElementById('ai-enabled'),
            aiKey: document.getElementById('ai-key'),
            aiStatusLight: document.getElementById('ai-status-light'),
            aiHintContainer: document.getElementById('ai-hint-container'),
            aiHintBtn: document.getElementById('ai-hint-btn'),
            aiHintDisplay: document.getElementById('ai-hint-display'),
            hintsRemaining: document.getElementById('hints-remaining'),

            // Audio Controls
            bgmToggle: document.getElementById('bgm-toggle'),
            bgmMain: document.getElementById('bgm-main'),
            sfxCorrect: document.getElementById('sfx-correct'),
            sfxWrong: document.getElementById('sfx-wrong'),
            sfxTimeout: document.getElementById('sfx-timeout'),
            sfxBuzz: document.getElementById('sfx-buzz'),
            sfxZeroDay: document.getElementById('sfx-zero-day'),

            // Score HUD
            scoreHud: document.getElementById('score-hud'),
            hudScores: document.getElementById('hud-scores'),

            // WebSocket Status
            wsStatus: document.getElementById('ws-status')
        };
    }

    /**
     * Attach event listeners
     */
    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => this.startGame());
        this.elements.continueBtn.addEventListener('click', () => this.closeResultModal());
        this.elements.submitWagerBtn.addEventListener('click', () => this.submitDailyDoubleWager());
        this.elements.newGameBtn.addEventListener('click', () => this.resetGame());

        // BGM Toggle
        this.elements.bgmToggle.addEventListener('click', () => this.toggleBGM());

        // AI Hint Button
        this.elements.aiHintBtn.addEventListener('click', () => this.requestAIHint());

        // AI Settings
        this.elements.aiEnabled.addEventListener('change', () => this.updateAIStatus());
        this.elements.aiKey.addEventListener('input', () => this.saveAIKey());
    }

    /**
     * Load game data (questions)
     */
    async loadGameData() {
        try {
            const response = await fetch('../game_questions.json');
            this.gameData = await response.json();
            console.log('Game data loaded successfully');
        } catch (error) {
            console.error('Error loading game data:', error);
            alert('Error loading game questions. Please refresh the page.');
        }
    }

    /**
     * Start the game
     */
    startGame() {
        // Get contestant names
        const names = Array.from(this.elements.contestantInputs).map(input => input.value.trim());

        // Validate names
        if (names.some(name => !name)) {
            alert('Please enter names for all 3 contestants!');
            return;
        }

        // Get industry
        this.industry = this.elements.industrySelect.value;

        // Create contestants
        this.contestants = names.map((name, index) => ({
            id: index,
            name: name,
            score: 0,
            element: this.elements.podiums[index]
        }));

        // Reset AI hints
        this.hintsRemaining = this.maxHints;
        this.elements.hintsRemaining.textContent = this.hintsRemaining;
        this.elements.aiHintBtn.disabled = false;

        // Update podium displays
        this.updatePodiumDisplays();

        // Randomly select starting contestant
        this.currentContestant = this.contestants[Math.floor(Math.random() * 3)];

        // Initialize Round 1
        this.currentRound = 1;
        this.initializeRound();

        // Show game screen
        this.showScreen('game');

        // Show Score HUD
        this.showScoreHUD();
        this.updateScoreHUD();

        // Highlight active contestant
        this.updateActiveContestant();
    }

    /**
     * Initialize a round
     */
    initializeRound() {
        const roundData = this.gameData.rounds[this.currentRound - 1];

        // Set round title with OMEGA theme
        const roundNames = {
            1: 'RECONNAISSANCE',
            2: 'ADVANCED OPS',
            3: 'FINAL VERDICT'
        };
        this.elements.roundTitle.textContent = roundNames[this.currentRound] || roundData.name.toUpperCase();
        this.elements.roundTitle.setAttribute('data-text', roundNames[this.currentRound] || roundData.name.toUpperCase());

        // Generate Daily Doubles (Zero-Day Exploits)
        this.generateDailyDoubles(roundData);

        // Build the board
        this.buildBoard(roundData);

        // Update picker display
        this.updatePickerDisplay();
    }

    /**
     * Generate Daily Double positions
     */
    generateDailyDoubles(roundData) {
        this.dailyDoubles = [];

        if (this.currentRound === 1) {
            // 1 Daily Double in Round 1
            const category = Math.floor(Math.random() * 6);
            const question = Math.floor(Math.random() * 5);
            this.dailyDoubles.push(`${category}-${question}`);
        } else if (this.currentRound === 2) {
            // 2 Daily Doubles in Round 2
            for (let i = 0; i < 2; i++) {
                let position;
                do {
                    const category = Math.floor(Math.random() * 6);
                    const question = Math.floor(Math.random() * 5);
                    position = `${category}-${question}`;
                } while (this.dailyDoubles.includes(position));
                this.dailyDoubles.push(position);
            }
        }
    }

    /**
     * Build the game board
     */
    buildBoard(roundData) {
        this.elements.gameBoard.innerHTML = '';

        // Create category headers
        roundData.categories.forEach((category, catIndex) => {
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = category.name;
            this.elements.gameBoard.appendChild(header);
        });

        // Create question tiles
        for (let qIndex = 0; qIndex < 5; qIndex++) {
            roundData.categories.forEach((category, catIndex) => {
                const tile = document.createElement('div');
                tile.className = 'question-tile';
                tile.textContent = category.questions[qIndex].value;
                tile.dataset.category = catIndex;
                tile.dataset.question = qIndex;

                // Check if it's a Daily Double
                const position = `${catIndex}-${qIndex}`;
                if (this.dailyDoubles.includes(position)) {
                    tile.dataset.dailyDouble = 'true';
                }

                // Add click handler
                tile.addEventListener('click', () => this.selectQuestion(catIndex, qIndex));

                this.elements.gameBoard.appendChild(tile);
            });
        }
    }

    /**
     * Select a question
     */
    selectQuestion(categoryIndex, questionIndex) {
        const tile = event.target;

        // Check if already answered
        if (tile.classList.contains('answered')) {
            return;
        }

        // Mark as answered
        tile.classList.add('answered');

        // Get question data
        const roundData = this.gameData.rounds[this.currentRound - 1];
        const category = roundData.categories[categoryIndex];
        const question = category.questions[questionIndex];

        this.currentQuestion = {
            category: category.name,
            question: question,
            categoryIndex: categoryIndex,
            questionIndex: questionIndex,
            isDailyDouble: tile.dataset.dailyDouble === 'true',
            wager: question.value
        };

        // Check if Daily Double
        if (this.currentQuestion.isDailyDouble) {
            this.showDailyDouble();
        } else {
            this.showQuestion();
        }
    }

    /**
     * Show Daily Double (Zero-Day Exploit)
     */
    showDailyDouble() {
        const contestant = this.currentContestant;
        const maxWager = Math.max(contestant.score, this.currentRound === 1 ? 1000 : 2000);

        // Play Zero-Day sound effect
        this.playSFX('zeroday');

        this.elements.ddContestant.textContent = `${contestant.name}, you discovered a ZERO-DAY EXPLOIT!`;
        this.elements.ddCurrentScore.textContent = `Current Score: $${contestant.score}`;
        this.elements.ddMaxWager.textContent = `Maximum Wager: $${maxWager}`;
        this.elements.ddWagerInput.value = Math.min(maxWager, this.currentRound === 1 ? 500 : 1000);
        this.elements.ddWagerInput.max = maxWager;

        this.showModal('daily-double');
    }

    /**
     * Submit Daily Double wager
     */
    submitDailyDoubleWager() {
        const wager = parseInt(this.elements.ddWagerInput.value);
        const maxWager = parseInt(this.elements.ddWagerInput.max);

        if (isNaN(wager) || wager < 5 || wager > maxWager) {
            alert(`Please enter a valid wager between $5 and $${maxWager}`);
            return;
        }

        this.currentQuestion.wager = wager;
        this.hideModal('daily-double');
        this.showQuestion();
    }

    /**
     * Show question
     */
    showQuestion() {
        // Populate question modal
        this.elements.questionCategory.textContent = this.currentQuestion.category;
        this.elements.questionValue.textContent = `$${this.currentQuestion.wager}`;
        this.elements.questionText.textContent = this.currentQuestion.question.question;

        // Build answer options
        this.buildAnswerOptions();

        // Hide buzzer panel initially
        this.elements.buzzerPanel.style.display = 'none';

        // Show/hide AI hint container
        if (this.aiEnabled && this.aiKey && this.hintsRemaining > 0) {
            this.elements.aiHintContainer.classList.remove('hidden');
            this.hideAIHint(); // Reset hint display
            this.elements.aiHintBtn.disabled = false;
        } else {
            this.elements.aiHintContainer.classList.add('hidden');
        }

        // Show modal
        this.showModal('question');

        // Start primary timer (15 seconds)
        this.startPrimaryTimer(15);

        // Add keyboard listener
        document.addEventListener('keydown', this.boundKeyHandler);
    }

    /**
     * Build answer options
     */
    buildAnswerOptions() {
        this.elements.answerOptions.innerHTML = '';

        this.currentQuestion.question.options.forEach((option, index) => {
            const btn = document.createElement('button');
            btn.className = 'answer-btn';
            btn.textContent = option;
            btn.addEventListener('click', () => this.selectAnswer(index));
            this.elements.answerOptions.appendChild(btn);
        });
    }

    /**
     * Start primary timer (15 seconds)
     */
    startPrimaryTimer(seconds) {
        this.timerSeconds = seconds;
        this.elements.timerText.textContent = seconds;
        this.elements.timerFill.style.width = '100%';
        this.elements.timerFill.classList.remove('warning');

        this.timerInterval = setInterval(() => {
            this.timerSeconds--;
            this.elements.timerText.textContent = this.timerSeconds;

            const percentage = (this.timerSeconds / seconds) * 100;
            this.elements.timerFill.style.width = percentage + '%';

            // Add warning color at 5 seconds
            if (this.timerSeconds <= 5) {
                this.elements.timerFill.classList.add('warning');
            }

            // Time's up
            if (this.timerSeconds <= 0) {
                clearInterval(this.timerInterval);
                this.timeUp();
            }
        }, 1000);
    }

    /**
     * Start buzz-in timer (7 seconds)
     */
    startBuzzTimer() {
        let buzzSeconds = 7;
        this.elements.buzzTimer.textContent = buzzSeconds;

        this.buzzTimerInterval = setInterval(() => {
            buzzSeconds--;
            this.elements.buzzTimer.textContent = buzzSeconds;

            if (buzzSeconds <= 0) {
                clearInterval(this.buzzTimerInterval);
                this.buzzTimeUp();
            }
        }, 1000);
    }

    /**
     * Time's up on primary timer
     */
    timeUp() {
        // Play timeout sound
        this.playSFX('timeout');

        // If buzzer not active, activate it
        if (!this.buzzerActive) {
            this.activateBuzzer();
        }
    }

    /**
     * Buzz timer expired
     */
    buzzTimeUp() {
        this.buzzerActive = false;
        this.showIncorrectResult(null, "Time's up! No one buzzed in.");
    }

    /**
     * Select an answer
     */
    selectAnswer(answerIndex) {
        // Stop timer
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
        }

        // Check answer
        const isCorrect = answerIndex === this.currentQuestion.question.correct;

        // Highlight the selected answer
        const buttons = this.elements.answerOptions.querySelectorAll('.answer-btn');
        buttons[answerIndex].classList.add(isCorrect ? 'correct' : 'incorrect');

        // Wait for animation
        setTimeout(() => {
            if (isCorrect) {
                this.handleCorrectAnswer();
            } else {
                this.handleIncorrectAnswer();
            }
        }, 1000);
    }

    /**
     * Handle correct answer
     */
    handleCorrectAnswer() {
        // Play correct sound effect
        this.playSFX('correct');

        // Update score
        this.currentContestant.score += this.currentQuestion.wager;
        this.updatePodiumDisplays();
        this.updateScoreHUD();

        // Hide question modal
        this.hideModal('question');

        // Remove keyboard listener
        document.removeEventListener('keydown', this.boundKeyHandler);

        // Show result
        this.showCorrectResult(this.currentContestant);

        // Winner keeps picking - don't change currentContestant
    }

    /**
     * Handle incorrect answer
     */
    handleIncorrectAnswer() {
        // Play wrong sound effect
        this.playSFX('wrong');

        // Deduct points
        this.currentContestant.score -= this.currentQuestion.wager;
        this.updatePodiumDisplays();
        this.updateScoreHUD();

        // Add to buzzed contestants
        this.buzzedContestants.add(this.currentContestant.id);

        // Check if other contestants can buzz in
        if (this.buzzedContestants.size < 3) {
            this.activateBuzzer();
        } else {
            // All contestants have tried
            this.hideModal('question');
            document.removeEventListener('keydown', this.boundKeyHandler);
            this.showIncorrectResult(null, "All contestants answered incorrectly!");
        }
    }

    /**
     * Activate buzzer system
     */
    activateBuzzer() {
        // Clear answer options
        this.elements.answerOptions.innerHTML = '';

        // Show buzzer panel
        this.elements.buzzerPanel.style.display = 'block';

        // Update buzzer button names
        const buzzBtns = document.querySelectorAll('.buzz-btn');
        buzzBtns.forEach((btn, index) => {
            const nameSpan = btn.querySelector('.buzz-name');
            nameSpan.textContent = this.contestants[index].name;

            // Disable if already buzzed
            if (this.buzzedContestants.has(index)) {
                btn.disabled = true;
                btn.style.opacity = '0.5';
            }

            // Add click handler
            btn.addEventListener('click', () => this.handleBuzz(index));
        });

        // Activate buzzer
        this.buzzerActive = true;

        // Start buzz timer
        this.startBuzzTimer();
    }

    /**
     * Handle keyboard press for buzzing
     */
    handleKeyPress(event) {
        if (!this.buzzerActive || this.buzzerLocked) return;

        const keyMap = {
            'q': 0,
            'w': 1,
            'e': 2,
            'Q': 0,
            'W': 1,
            'E': 2
        };

        const contestantId = keyMap[event.key];

        if (contestantId !== undefined && !this.buzzedContestants.has(contestantId)) {
            this.handleBuzz(contestantId);
        }
    }

    /**
     * Handle buzz-in
     */
    handleBuzz(contestantId) {
        if (!this.buzzerActive || this.buzzerLocked) return;
        if (this.buzzedContestants.has(contestantId)) return;

        // Play buzz sound effect
        this.playSFX('buzz');

        // Lock buzzer temporarily
        this.buzzerLocked = true;
        this.buzzerActive = false;

        // Stop buzz timer
        if (this.buzzTimerInterval) {
            clearInterval(this.buzzTimerInterval);
        }

        // Set current contestant
        this.currentContestant = this.contestants[contestantId];

        // Visual feedback
        const podium = this.elements.podiums[contestantId];
        podium.classList.add('buzzed');

        // Hide buzzer panel
        this.elements.buzzerPanel.style.display = 'none';

        // Show answer options again
        this.buildAnswerOptions();

        // Give them 15 seconds to answer
        setTimeout(() => {
            podium.classList.remove('buzzed');
            this.buzzerLocked = false;
            this.startPrimaryTimer(15);
        }, 500);
    }

    /**
     * Show correct result
     */
    showCorrectResult(contestant) {
        this.elements.resultIcon.innerHTML = '✓';
        this.elements.resultIcon.style.color = '#72bd44';
        this.elements.resultStatus.textContent = 'CORRECT!';
        this.elements.resultStatus.className = 'result-status correct';
        this.elements.resultContestant.textContent = `${contestant.name} +$${this.currentQuestion.wager}`;
        this.elements.resultExplanation.textContent = this.currentQuestion.question.explanation;

        this.showModal('result');
    }

    /**
     * Show incorrect result
     */
    showIncorrectResult(contestant, message) {
        this.elements.resultIcon.innerHTML = '✗';
        this.elements.resultIcon.style.color = '#ef4444';
        this.elements.resultStatus.textContent = message || 'INCORRECT!';
        this.elements.resultStatus.className = 'result-status incorrect';
        this.elements.resultContestant.textContent = contestant
            ? `${contestant.name} -$${this.currentQuestion.wager}`
            : '';
        this.elements.resultExplanation.textContent =
            `Correct answer: ${this.currentQuestion.question.options[this.currentQuestion.question.correct]}\n\n${this.currentQuestion.question.explanation}`;

        this.showModal('result');
    }

    /**
     * Close result modal
     */
    closeResultModal() {
        this.hideModal('result');

        // Reset buzzer state
        this.buzzerActive = false;
        this.buzzerLocked = false;
        this.buzzedContestants.clear();

        // Check if round is over
        if (this.isRoundComplete()) {
            this.endRound();
        } else {
            // Continue with current contestant picking
            this.updatePickerDisplay();
        }
    }

    /**
     * Check if round is complete
     */
    isRoundComplete() {
        const tiles = this.elements.gameBoard.querySelectorAll('.question-tile');
        const answeredTiles = this.elements.gameBoard.querySelectorAll('.question-tile.answered');
        return tiles.length === answeredTiles.length;
    }

    /**
     * End current round
     */
    endRound() {
        if (this.currentRound === 1) {
            // Move to Double Jeopardy
            this.currentRound = 2;
            this.initializeRound();
        } else if (this.currentRound === 2) {
            // Move to Final Jeopardy
            this.currentRound = 3;
            this.startFinalJeopardy();
        }
    }

    /**
     * Start Final Jeopardy
     */
    startFinalJeopardy() {
        this.showScreen('final-jeopardy');

        const fjData = this.gameData.rounds[2];

        // Build Final Jeopardy UI
        this.elements.fjPhase.innerHTML = `
            <h2 style="font-size: 2rem; color: #431560; text-align: center; margin-bottom: 2rem;">
                CATEGORY: ${fjData.category}
            </h2>
            <p style="text-align: center; font-size: 1.2rem; margin-bottom: 2rem;">
                Each contestant will wager any amount up to their current score.
            </p>
            <div id="fj-wagers" style="display: flex; flex-direction: column; gap: 1.5rem; margin: 2rem 0;">
                ${this.contestants.map((c, i) => `
                    <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: 10px; border: 2px solid var(--captg-blue);">
                        <label style="display: block; font-size: 1.2rem; font-weight: bold; color: var(--captg-green); margin-bottom: 0.5rem;">
                            ${c.name} (Current: $${c.score})
                        </label>
                        <input type="number" id="fj-wager-${i}" class="wager-input" min="0" max="${c.score}" value="${Math.max(0, Math.floor(c.score / 2))}"
                            style="width: 200px; padding: 0.75rem; font-size: 1.2rem; background: var(--dark-bg); border: 2px solid var(--captg-blue); border-radius: 8px; color: var(--text-gold);">
                    </div>
                `).join('')}
            </div>
            <button id="fj-submit-wagers" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                SUBMIT WAGERS
            </button>
        `;

        document.getElementById('fj-submit-wagers').addEventListener('click', () => {
            const wagers = this.contestants.map((c, i) => {
                const input = document.getElementById(`fj-wager-${i}`);
                return parseInt(input.value) || 0;
            });

            this.showFinalJeopardyQuestion(fjData, wagers);
        });
    }

    /**
     * Show Final Jeopardy question
     */
    showFinalJeopardyQuestion(fjData, wagers) {
        this.elements.fjPhase.innerHTML = `
            <h2 style="font-size: 2rem; color: #431560; text-align: center; margin-bottom: 2rem;">
                ${fjData.category}
            </h2>
            <div style="font-size: 1.8rem; text-align: center; padding: 2rem; background: var(--darker-bg); border-radius: 10px; margin-bottom: 2rem;">
                ${fjData.question.question}
            </div>
            <div id="fj-answers" style="display: flex; flex-direction: column; gap: 1.5rem; margin: 2rem 0;">
                ${this.contestants.map((c, i) => `
                    <div style="background: var(--darker-bg); padding: 1.5rem; border-radius: 10px; border: 2px solid var(--captg-blue);">
                        <label style="display: block; font-size: 1.2rem; font-weight: bold; color: var(--captg-green); margin-bottom: 0.5rem;">
                            ${c.name} (Wagered: $${wagers[i]})
                        </label>
                        <select id="fj-answer-${i}" style="width: 100%; padding: 0.75rem; font-size: 1.1rem; background: var(--dark-bg); border: 2px solid var(--captg-blue); border-radius: 8px; color: var(--text-light);">
                            ${fjData.question.options.map((opt, j) => `<option value="${j}">${opt}</option>`).join('')}
                        </select>
                    </div>
                `).join('')}
            </div>
            <button id="fj-submit-answers" class="btn-primary" style="width: 100%; margin-top: 1rem;">
                REVEAL ANSWERS
            </button>
        `;

        document.getElementById('fj-submit-answers').addEventListener('click', () => {
            const answers = this.contestants.map((c, i) => {
                const select = document.getElementById(`fj-answer-${i}`);
                return parseInt(select.value);
            });

            this.revealFinalJeopardy(fjData, wagers, answers);
        });
    }

    /**
     * Reveal Final Jeopardy results
     */
    revealFinalJeopardy(fjData, wagers, answers) {
        // Update scores
        this.contestants.forEach((contestant, i) => {
            if (answers[i] === fjData.question.correct) {
                contestant.score += wagers[i];
            } else {
                contestant.score -= wagers[i];
            }
        });

        // Show winner screen
        this.showWinner();
    }

    /**
     * Show winner screen
     */
    showWinner() {
        // Find winner
        const sorted = [...this.contestants].sort((a, b) => b.score - a.score);
        const winner = sorted[0];

        this.elements.championDisplay.innerHTML = `
            <div style="font-size: 1rem; margin-bottom: 1rem;">🏆</div>
            <div style="font-size: 3rem; color: var(--text-gold); font-weight: bold; margin-bottom: 1rem;">
                ${winner.name}
            </div>
            <div style="font-size: 2rem; color: var(--captg-green);">
                $${winner.score}
            </div>
        `;

        this.elements.finalStandings.innerHTML = sorted.map((c, i) => `
            <div class="standing-item ${i === 0 ? 'first' : ''}" style="display: flex; justify-content: space-between; padding: 1rem 2rem; margin: 0.5rem 0; background: var(--darker-bg); border-radius: 10px; border: 2px solid ${i === 0 ? 'var(--text-gold)' : 'var(--border-color)'};">
                <span class="name" style="font-size: 1.3rem; font-weight: bold;">${i + 1}. ${c.name}</span>
                <span class="score" style="font-size: 1.3rem; font-weight: bold; color: var(--captg-green);">$${c.score}</span>
            </div>
        `).join('');

        this.showScreen('winner');
    }

    /**
     * Update podium displays
     */
    updatePodiumDisplays() {
        this.contestants.forEach((contestant, index) => {
            const podium = this.elements.podiums[index];
            const nameDisplay = podium.querySelector('.contestant-name-display');
            const scoreDisplay = podium.querySelector('.contestant-score');

            nameDisplay.textContent = contestant.name;
            scoreDisplay.textContent = `$${contestant.score}`;

            if (contestant.score < 0) {
                scoreDisplay.classList.add('negative');
            } else {
                scoreDisplay.classList.remove('negative');
            }
        });
    }

    /**
     * Update active contestant highlighting
     */
    updateActiveContestant() {
        this.elements.podiums.forEach((podium, index) => {
            if (this.contestants[index] === this.currentContestant) {
                podium.classList.add('active');
            } else {
                podium.classList.remove('active');
            }
        });
    }

    /**
     * Update picker display
     */
    updatePickerDisplay() {
        this.elements.pickerName.textContent = this.currentContestant.name;
        this.updateActiveContestant();
    }

    /**
     * Show screen
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });

        const screenMap = {
            'setup': this.elements.setupScreen,
            'game': this.elements.gameScreen,
            'final-jeopardy': this.elements.finalJeopardyScreen,
            'winner': this.elements.winnerScreen
        };

        if (screenMap[screenName]) {
            screenMap[screenName].classList.add('active');
        }
    }

    /**
     * Show modal
     */
    showModal(modalName) {
        const modalMap = {
            'question': this.elements.questionModal,
            'result': this.elements.resultModal,
            'daily-double': this.elements.dailyDoubleModal
        };

        if (modalMap[modalName]) {
            modalMap[modalName].classList.add('active');
        }
    }

    /**
     * Hide modal
     */
    hideModal(modalName) {
        const modalMap = {
            'question': this.elements.questionModal,
            'result': this.elements.resultModal,
            'daily-double': this.elements.dailyDoubleModal
        };

        if (modalMap[modalName]) {
            modalMap[modalName].classList.remove('active');

            // Hide AI hint container when closing question modal
            if (modalName === 'question') {
                this.elements.aiHintContainer.classList.add('hidden');
            }
        }
    }

    /**
     * Reset game
     */
    resetGame() {
        location.reload();
    }

    /**
     * ============================================
     * OMEGA FEATURES - Canvas, AI, Audio, HUD
     * ============================================
     */

    /**
     * Initialize Canvas Background Animation
     */
    initializeCanvas() {
        this.canvas = this.elements.canvas;
        if (!this.canvas) return;

        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();

        // Handle window resize
        window.addEventListener('resize', () => this.resizeCanvas());

        // Initialize grid lines
        this.initializeGridLines();

        // Start animation
        this.animateCanvas();
    }

    /**
     * Resize canvas to fill window
     */
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    /**
     * Initialize grid lines for animation
     */
    initializeGridLines() {
        this.gridLines = [];
        const numLines = 20;

        // Horizontal lines
        for (let i = 0; i < numLines; i++) {
            this.gridLines.push({
                type: 'horizontal',
                y: Math.random() * this.canvas.height,
                speed: 0.2 + Math.random() * 0.5,
                opacity: 0.1 + Math.random() * 0.2
            });
        }

        // Vertical lines
        for (let i = 0; i < numLines; i++) {
            this.gridLines.push({
                type: 'vertical',
                x: Math.random() * this.canvas.width,
                speed: 0.2 + Math.random() * 0.5,
                opacity: 0.1 + Math.random() * 0.2
            });
        }
    }

    /**
     * Animate canvas background
     */
    animateCanvas() {
        if (!this.ctx || !this.canvas) return;

        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw grid lines
        this.gridLines.forEach(line => {
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${line.opacity})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();

            if (line.type === 'horizontal') {
                this.ctx.moveTo(0, line.y);
                this.ctx.lineTo(this.canvas.width, line.y);
                line.y += line.speed;
                if (line.y > this.canvas.height) line.y = 0;
            } else {
                this.ctx.moveTo(line.x, 0);
                this.ctx.lineTo(line.x, this.canvas.height);
                line.x += line.speed;
                if (line.x > this.canvas.width) line.x = 0;
            }

            this.ctx.stroke();
        });

        // Continue animation
        this.animationFrame = requestAnimationFrame(() => this.animateCanvas());
    }

    /**
     * Initialize AI Assistant
     */
    initializeAI() {
        // Load saved API key from localStorage
        const savedKey = localStorage.getItem('cyber-jeopardy-ai-key');
        if (savedKey) {
            this.aiKey = savedKey;
            this.elements.aiKey.value = savedKey;
        }

        // Load AI enabled state
        const aiEnabled = localStorage.getItem('cyber-jeopardy-ai-enabled') === 'true';
        if (aiEnabled) {
            this.elements.aiEnabled.checked = true;
            this.aiEnabled = true;
        }

        this.updateAIStatus();
    }

    /**
     * Update AI status indicator
     */
    updateAIStatus() {
        this.aiEnabled = this.elements.aiEnabled.checked;
        localStorage.setItem('cyber-jeopardy-ai-enabled', this.aiEnabled);

        const hasKey = this.aiKey && this.aiKey.length > 0;
        const available = this.aiEnabled && hasKey;

        this.elements.aiStatusLight.setAttribute('data-available', available);
        this.elements.aiStatusLight.title = available
            ? 'GPT Assistant Active'
            : 'GPT Assistant Offline';
    }

    /**
     * Save AI key to localStorage
     */
    saveAIKey() {
        this.aiKey = this.elements.aiKey.value.trim();
        if (this.aiKey) {
            localStorage.setItem('cyber-jeopardy-ai-key', this.aiKey);
        } else {
            localStorage.removeItem('cyber-jeopardy-ai-key');
        }
        this.updateAIStatus();
    }

    /**
     * Request AI Hint for current question
     */
    async requestAIHint() {
        // Check if AI is enabled and key is available
        if (!this.aiEnabled || !this.aiKey) {
            this.showAIHint('⚠️ API key required. Please configure your OpenAI API key in the settings.');
            return;
        }

        // Check hints remaining
        if (this.hintsRemaining <= 0) {
            this.showAIHint('❌ No hints remaining for this game.');
            return;
        }

        // Disable button
        this.elements.aiHintBtn.disabled = true;
        this.showAIHint('🔄 Analyzing question...');

        try {
            // Call OpenAI API
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.aiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful cybersecurity training assistant. Provide brief, educational hints about cybersecurity questions without giving away the answer directly. Keep responses under 100 words.'
                        },
                        {
                            role: 'user',
                            content: `Question: ${this.currentQuestion.question.question}\n\nProvide a helpful hint about this cybersecurity concept without revealing the answer.`
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });

            if (!response.ok) {
                throw new Error('API request failed');
            }

            const data = await response.json();
            const hint = data.choices[0].message.content;

            // Decrement hints
            this.hintsRemaining--;
            this.elements.hintsRemaining.textContent = this.hintsRemaining;

            // Show hint
            this.showAIHint(`💡 ${hint}`);

            // Update AI status
            if (this.hintsRemaining === 0) {
                this.elements.aiHintBtn.disabled = true;
                this.elements.aiStatusLight.setAttribute('data-available', 'false');
            }

        } catch (error) {
            console.error('AI Hint Error:', error);
            this.showAIHint('❌ Unable to fetch hint. Please check your API key.');
            this.elements.aiHintBtn.disabled = false;
        }
    }

    /**
     * Display AI hint
     */
    showAIHint(message) {
        this.elements.aiHintDisplay.textContent = message;
        this.elements.aiHintDisplay.classList.remove('hidden');
    }

    /**
     * Hide AI hint display
     */
    hideAIHint() {
        this.elements.aiHintDisplay.classList.add('hidden');
        this.elements.aiHintDisplay.textContent = '';
    }

    /**
     * Initialize Audio System
     */
    initializeAudio() {
        this.bgmAudio = this.elements.bgmMain;

        // Set initial volume
        if (this.bgmAudio) {
            this.bgmAudio.volume = 0.3;
        }

        // Set SFX volumes
        [this.elements.sfxCorrect, this.elements.sfxWrong, this.elements.sfxTimeout,
         this.elements.sfxBuzz, this.elements.sfxZeroDay].forEach(sfx => {
            if (sfx) sfx.volume = 0.5;
        });
    }

    /**
     * Toggle Background Music
     */
    toggleBGM() {
        if (!this.bgmAudio) return;

        if (this.bgmPlaying) {
            this.bgmAudio.pause();
            this.bgmPlaying = false;
            this.elements.bgmToggle.classList.remove('playing');
        } else {
            this.bgmAudio.play().catch(err => {
                console.log('BGM playback failed:', err);
            });
            this.bgmPlaying = true;
            this.elements.bgmToggle.classList.add('playing');
        }
    }

    /**
     * Play Sound Effect
     */
    playSFX(sfxName) {
        const sfxMap = {
            'correct': this.elements.sfxCorrect,
            'wrong': this.elements.sfxWrong,
            'timeout': this.elements.sfxTimeout,
            'buzz': this.elements.sfxBuzz,
            'zeroday': this.elements.sfxZeroDay
        };

        const sfx = sfxMap[sfxName];
        if (sfx) {
            sfx.currentTime = 0;
            sfx.play().catch(err => {
                console.log('SFX playback failed:', err);
            });
        }
    }

    /**
     * Update Score HUD
     */
    updateScoreHUD() {
        if (!this.elements.hudScores) return;

        this.elements.hudScores.innerHTML = this.contestants.map(c => `
            <div class="hud-contestant">
                <span class="hud-name">${c.name}</span>
                <span class="hud-score" style="color: ${c.score < 0 ? '#ef4444' : '#72bd44'}">
                    $${c.score}
                </span>
            </div>
        `).join('');
    }

    /**
     * Show Score HUD
     */
    showScoreHUD() {
        if (this.elements.scoreHud) {
            this.elements.scoreHud.classList.remove('hidden');
        }
    }

    /**
     * Hide Score HUD
     */
    hideScoreHUD() {
        if (this.elements.scoreHud) {
            this.elements.scoreHud.classList.add('hidden');
        }
    }
}

// Initialize game when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const game = new CyberJeopardyGame();
    game.init();
});
