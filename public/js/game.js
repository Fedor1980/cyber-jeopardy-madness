// Cyber Jeopardy Madness - Complete Game Engine
// Full Jeopardy Experience: Round 1 → Double Jeopardy → Final Jeopardy
// Federal Credit Union Cybersecurity Training Game

class CyberJeopardyGame {
    constructor() {
        this.gameData = null;
        this.teams = [];
        this.currentTeamIndex = 0;
        this.currentRound = 0; // 0 = Round 1, 1 = Round 2, 2 = Final Jeopardy
        this.answeredQuestions = new Set();
        this.currentQuestion = null;
        this.aiEnabled = false;
        this.openaiKey = null;
        this.timer = null;
        this.timeRemaining = 0;
        this.audioEnabled = true;
        this.finalJeopardyWagers = {};
        this.finalJeopardyAnswers = {};

        // Audio elements (optional)
        this.sounds = {
            correct: null,
            incorrect: null,
            timer: null,
            finalJeopardy: null
        };

        this.init();
    }

    async init() {
        await this.loadGameData();
        this.setupEventListeners();
        this.initAudio();
    }

    async loadGameData() {
        try {
            const response = await fetch('../game_questions.json');
            this.gameData = await response.json();
        } catch (error) {
            console.error('Error loading game data:', error);
            alert('Failed to load game questions. Please refresh the page.');
        }
    }

    initAudio() {
        // Audio will be initialized on first user interaction due to browser policies
        document.addEventListener('click', () => {
            if (!this.sounds.correct) {
                // Placeholder - actual audio files would need to be added
                this.sounds.correct = new Audio();
                this.sounds.incorrect = new Audio();
                this.sounds.timer = new Audio();
            }
        }, { once: true });
    }

    setupEventListeners() {
        // Welcome screen
        document.getElementById('team-count').addEventListener('change', (e) => {
            this.updateTeamInputs(parseInt(e.target.value));
        });

        document.getElementById('enable-ai').addEventListener('change', (e) => {
            const aiKeySection = document.getElementById('ai-key-section');
            aiKeySection.style.display = e.target.checked ? 'block' : 'none';
        });

        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });

        // Question modal
        document.getElementById('submit-answer-btn')?.addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('skip-question-btn')?.addEventListener('click', () => {
            this.skipQuestion();
        });

        document.getElementById('get-hint-btn')?.addEventListener('click', () => {
            this.getAIHint();
        });

        // Result modal
        document.getElementById('continue-btn')?.addEventListener('click', () => {
            this.closeResultModal();
        });

        // Game controls
        document.getElementById('reset-game-btn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the game? All progress will be lost.')) {
                this.resetGame();
            }
        });

        // Game over screen
        document.getElementById('play-again-btn')?.addEventListener('click', () => {
            this.playAgain();
        });

        document.getElementById('new-teams-btn')?.addEventListener('click', () => {
            this.newTeams();
        });
    }

    updateTeamInputs(count) {
        const container = document.getElementById('team-names-container');
        container.innerHTML = '';

        for (let i = 0; i < count; i++) {
            const div = document.createElement('div');
            div.className = 'team-name-input';
            div.innerHTML = `
                <label>Team ${i + 1} Name:</label>
                <input type="text" class="team-name" placeholder="Enter team name" value="Team ${i + 1}">
            `;
            container.appendChild(div);
        }
    }

    startGame() {
        const teamInputs = document.querySelectorAll('.team-name');
        this.teams = Array.from(teamInputs).map((input, index) => ({
            id: index,
            name: input.value.trim() || `Team ${index + 1}`,
            score: 0
        }));

        if (this.teams.length < 2) {
            alert('Please create at least 2 teams!');
            return;
        }

        // Check if AI is enabled
        const aiEnabled = document.getElementById('enable-ai').checked;
        if (aiEnabled) {
            this.aiEnabled = true;
            this.openaiKey = document.getElementById('openai-key').value.trim();
            if (!this.openaiKey) {
                if (!confirm('No API key provided. AI hints will not be available. Continue?')) {
                    return;
                }
                this.aiEnabled = false;
            }
        }

        this.currentRound = 0;
        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();

        this.showRoundIntro(0);
    }

    showRoundIntro(roundIndex) {
        const round = this.gameData.rounds[roundIndex];
        const modal = document.getElementById('question-modal');
        const content = modal.querySelector('.modal-content');

        content.innerHTML = `
            <div class="round-intro">
                <h1 class="round-title">${round.name}</h1>
                <p class="round-subtitle">${this.getRoundSubtitle(roundIndex)}</p>
                <button class="btn-primary" onclick="game.startRound(${roundIndex})">Begin Round</button>
            </div>
        `;

        modal.classList.add('active');
    }

    getRoundSubtitle(roundIndex) {
        const subtitles = [
            'Round 1 - Point values: $100 to $500',
            'Double Jeopardy - Point values: $200 to $1000',
            'Final Jeopardy - Wager and win!'
        ];
        return subtitles[roundIndex] || '';
    }

    startRound(roundIndex) {
        document.getElementById('question-modal').classList.remove('active');
        this.currentRound = roundIndex;

        if (roundIndex === 2) {
            // Final Jeopardy
            this.showFinalJeopardyWagering();
        } else {
            // Regular round
            this.showScreen('game-screen');
            this.renderGameBoard();
            this.updateScoreboard();
            this.updateRoundDisplay();
        }
    }

    renderGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        const round = this.gameData.rounds[this.currentRound];

        round.categories.forEach((category, catIndex) => {
            const column = document.createElement('div');
            column.className = 'category-column';

            // Category header
            const header = document.createElement('div');
            header.className = 'category-header';
            header.textContent = category.name;
            column.appendChild(header);

            // Question cards
            category.questions.forEach((question, qIndex) => {
                const card = document.createElement('div');
                card.className = 'question-card';
                card.textContent = question.points;
                card.dataset.category = catIndex;
                card.dataset.question = qIndex;

                const questionId = `${this.currentRound}-${catIndex}-${qIndex}`;
                if (this.answeredQuestions.has(questionId)) {
                    card.classList.add('answered');
                }

                card.addEventListener('click', () => {
                    if (!this.answeredQuestions.has(questionId)) {
                        this.showQuestion(catIndex, qIndex);
                    }
                });

                column.appendChild(card);
            });

            gameBoard.appendChild(column);
        });
    }

    updateRoundDisplay() {
        const display = document.getElementById('round-display');
        if (display) {
            const round = this.gameData.rounds[this.currentRound];
            display.textContent = round.name;
        }
    }

    showQuestion(categoryIndex, questionIndex) {
        const round = this.gameData.rounds[this.currentRound];
        const category = round.categories[categoryIndex];
        const question = category.questions[questionIndex];

        this.currentQuestion = {
            roundIndex: this.currentRound,
            categoryIndex,
            questionIndex,
            category: category.name,
            question: question,
            selectedAnswer: null
        };

        // Update modal content
        document.querySelector('.category-display').textContent = category.name;
        document.querySelector('.points-display').textContent = `$${question.points}`;
        document.querySelector('.question-text').textContent = question.question;

        // Render options
        const optionsContainer = document.querySelector('.options-container');
        optionsContainer.innerHTML = '';

        question.options.forEach((option, index) => {
            const optionBtn = document.createElement('button');
            optionBtn.className = 'option-btn';
            optionBtn.textContent = option;
            optionBtn.addEventListener('click', () => {
                this.selectOption(index, optionBtn);
            });
            optionsContainer.appendChild(optionBtn);
        });

        // Show/hide AI hint section
        const aiHintSection = document.getElementById('ai-hint-section');
        if (this.aiEnabled && this.openaiKey) {
            aiHintSection.style.display = 'block';
            document.getElementById('hint-display').innerHTML = '';
        } else {
            aiHintSection.style.display = 'none';
        }

        // Reset submit button
        document.getElementById('submit-answer-btn').disabled = true;

        // Start timer
        this.startTimer(question.timeLimit || 30);

        // Show modal
        document.getElementById('question-modal').classList.add('active');
    }

    startTimer(seconds) {
        this.timeRemaining = seconds;
        this.updateTimerDisplay();

        // Clear any existing timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        this.timer = setInterval(() => {
            this.timeRemaining--;
            this.updateTimerDisplay();

            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                this.timeUp();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        let timerElement = document.getElementById('timer-display');
        if (!timerElement) {
            // Create timer display if it doesn't exist
            const questionHeader = document.querySelector('.question-header');
            if (questionHeader) {
                timerElement = document.createElement('div');
                timerElement.id = 'timer-display';
                timerElement.className = 'timer-display';
                questionHeader.appendChild(timerElement);
            }
        }

        if (timerElement) {
            timerElement.textContent = `⏱️ ${this.timeRemaining}s`;

            // Change color when time is running out
            if (this.timeRemaining <= 10) {
                timerElement.classList.add('timer-warning');
            } else {
                timerElement.classList.remove('timer-warning');
            }
        }
    }

    timeUp() {
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Auto-submit or skip
        if (this.currentQuestion.selectedAnswer !== null) {
            this.submitAnswer();
        } else {
            alert('Time\'s up!');
            this.skipQuestion();
        }
    }

    selectOption(index, button) {
        // Remove previous selection
        document.querySelectorAll('.option-btn').forEach(btn => {
            btn.classList.remove('selected');
        });

        // Add selection
        button.classList.add('selected');
        this.currentQuestion.selectedAnswer = index;

        // Enable submit button
        document.getElementById('submit-answer-btn').disabled = false;
    }

    submitAnswer() {
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        if (this.currentQuestion.selectedAnswer === null) {
            return;
        }

        const question = this.currentQuestion.question;
        const selectedOption = question.options[this.currentQuestion.selectedAnswer];
        const isCorrect = selectedOption === question.answer;

        // Play sound
        if (this.audioEnabled) {
            if (isCorrect && this.sounds.correct) {
                this.sounds.correct.play().catch(() => {});
            } else if (!isCorrect && this.sounds.incorrect) {
                this.sounds.incorrect.play().catch(() => {});
            }
        }

        // Update score
        const currentTeam = this.teams[this.currentTeamIndex];
        if (isCorrect) {
            currentTeam.score += question.points;
        } else {
            currentTeam.score -= question.points;
        }

        // Mark question as answered
        const questionId = `${this.currentQuestion.roundIndex}-${this.currentQuestion.categoryIndex}-${this.currentQuestion.questionIndex}`;
        this.answeredQuestions.add(questionId);

        // Close question modal
        document.getElementById('question-modal').classList.remove('active');

        // Show result
        this.showResult(isCorrect, question.explanation);

        // Update game state
        this.updateScoreboard();
        this.renderGameBoard();

        // Check if round is over
        if (this.isRoundComplete(this.currentRound)) {
            setTimeout(() => {
                this.endRound();
            }, 500);
        } else {
            // Next team's turn
            this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
            this.updateCurrentTeamDisplay();
        }
    }

    skipQuestion() {
        // Stop timer
        if (this.timer) {
            clearInterval(this.timer);
        }

        // Mark as answered but don't change score
        const questionId = `${this.currentQuestion.roundIndex}-${this.currentQuestion.categoryIndex}-${this.currentQuestion.questionIndex}`;
        this.answeredQuestions.add(questionId);

        // Close modal
        document.getElementById('question-modal').classList.remove('active');

        // Update board
        this.renderGameBoard();

        // Check if round is over
        if (this.isRoundComplete(this.currentRound)) {
            setTimeout(() => {
                this.endRound();
            }, 500);
        } else {
            // Next team's turn
            this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
            this.updateCurrentTeamDisplay();
        }
    }

    isRoundComplete(roundIndex) {
        if (roundIndex >= 2) return true; // Final Jeopardy is handled separately

        const round = this.gameData.rounds[roundIndex];
        const totalQuestions = round.categories.reduce((sum, cat) => sum + cat.questions.length, 0);

        const answeredInRound = Array.from(this.answeredQuestions).filter(id => {
            return id.startsWith(`${roundIndex}-`);
        }).length;

        return answeredInRound >= totalQuestions;
    }

    endRound() {
        if (this.currentRound < 2) {
            // Move to next round
            this.currentRound++;
            this.showRoundIntro(this.currentRound);
        } else {
            // Game over
            this.endGame();
        }
    }

    showFinalJeopardyWagering() {
        const modal = document.getElementById('question-modal');
        const content = modal.querySelector('.modal-content');
        const finalJeopardy = this.gameData.rounds[2];

        let wagerHTML = `
            <div class="final-jeopardy-wager">
                <h1 class="round-title">Final Jeopardy</h1>
                <h2 class="fj-category">Category: ${finalJeopardy.category}</h2>
                <p class="fj-instructions">Each team, place your wagers! You may wager any amount up to your current score.</p>
                <div class="wager-inputs">
        `;

        this.teams.forEach((team, index) => {
            const maxWager = Math.max(team.score, 1000); // Can wager up to score or $1000 if negative
            wagerHTML += `
                <div class="wager-input-group">
                    <label>${team.name} (Current: $${team.score})</label>
                    <input type="number" id="wager-${index}" class="wager-input"
                           min="0" max="${maxWager}" value="${Math.min(1000, maxWager)}" />
                    <span class="wager-max">Max: $${maxWager}</span>
                </div>
            `;
        });

        wagerHTML += `
                </div>
                <button class="btn-primary" onclick="game.submitWagers()">Submit Wagers</button>
            </div>
        `;

        content.innerHTML = wagerHTML;
        modal.classList.add('active');
    }

    submitWagers() {
        // Collect wagers
        this.finalJeopardyWagers = {};
        let allValid = true;

        this.teams.forEach((team, index) => {
            const input = document.getElementById(`wager-${index}`);
            const wager = parseInt(input.value) || 0;
            const maxWager = Math.max(team.score, 1000);

            if (wager < 0 || wager > maxWager) {
                alert(`Invalid wager for ${team.name}!`);
                allValid = false;
                return;
            }

            this.finalJeopardyWagers[team.id] = wager;
        });

        if (!allValid) return;

        // Show Final Jeopardy question
        this.showFinalJeopardyQuestion();
    }

    showFinalJeopardyQuestion() {
        const modal = document.getElementById('question-modal');
        const content = modal.querySelector('.modal-content');
        const finalJeopardy = this.gameData.rounds[2];
        const question = finalJeopardy.question;

        let questionHTML = `
            <div class="final-jeopardy-question">
                <h2 class="fj-category">Category: ${finalJeopardy.category}</h2>
                <div class="fj-question-text">${question.question}</div>
                <p class="fj-instructions">Write your answers! You have ${question.timeLimit} seconds.</p>
                <div class="fj-answer-inputs">
        `;

        this.teams.forEach((team, index) => {
            questionHTML += `
                <div class="fj-answer-group">
                    <label>${team.name} (Wager: $${this.finalJeopardyWagers[team.id]})</label>
                    <input type="text" id="fj-answer-${index}" class="fj-answer-input"
                           placeholder="What is..." />
                </div>
            `;
        });

        questionHTML += `
                </div>
                <div id="fj-timer" class="fj-timer">${question.timeLimit}s</div>
                <button class="btn-primary" onclick="game.submitFinalJeopardyAnswers()">Reveal Answers</button>
            </div>
        `;

        content.innerHTML = questionHTML;

        // Start Final Jeopardy timer
        this.startFinalJeopardyTimer(question.timeLimit);
    }

    startFinalJeopardyTimer(seconds) {
        this.timeRemaining = seconds;
        const timerDisplay = document.getElementById('fj-timer');

        this.timer = setInterval(() => {
            this.timeRemaining--;
            if (timerDisplay) {
                timerDisplay.textContent = `${this.timeRemaining}s`;
                if (this.timeRemaining <= 10) {
                    timerDisplay.classList.add('timer-warning');
                }
            }

            if (this.timeRemaining <= 0) {
                clearInterval(this.timer);
                // Auto-submit after timer
                setTimeout(() => {
                    const submitBtn = document.querySelector('.final-jeopardy-question .btn-primary');
                    if (submitBtn) submitBtn.click();
                }, 1000);
            }
        }, 1000);
    }

    submitFinalJeopardyAnswers() {
        if (this.timer) clearInterval(this.timer);

        // Collect answers
        this.finalJeopardyAnswers = {};
        this.teams.forEach((team, index) => {
            const input = document.getElementById(`fj-answer-${index}`);
            this.finalJeopardyAnswers[team.id] = input.value.trim();
        });

        // Show reveal screen
        this.revealFinalJeopardyAnswers();
    }

    revealFinalJeopardyAnswers() {
        const modal = document.getElementById('question-modal');
        const content = modal.querySelector('.modal-content');
        const finalJeopardy = this.gameData.rounds[2];
        const question = finalJeopardy.question;

        let revealHTML = `
            <div class="final-jeopardy-reveal">
                <h2 class="fj-category">Category: ${finalJeopardy.category}</h2>
                <div class="fj-correct-answer">
                    <strong>Correct Answer:</strong> ${question.answer}
                </div>
                <div class="fj-explanation">${question.explanation}</div>
                <div class="fj-results">
        `;

        this.teams.forEach((team, index) => {
            const teamAnswer = this.finalJeopardyAnswers[team.id] || '(No answer)';
            const wager = this.finalJeopardyWagers[team.id] || 0;

            // Check if answer is correct (flexible matching)
            const acceptable = question.acceptableAnswers || [question.answer];
            const isCorrect = acceptable.some(ans =>
                teamAnswer.toLowerCase().includes(ans.toLowerCase()) ||
                ans.toLowerCase().includes(teamAnswer.toLowerCase())
            );

            const oldScore = team.score;
            if (isCorrect) {
                team.score += wager;
            } else {
                team.score -= wager;
            }

            revealHTML += `
                <div class="fj-team-result ${isCorrect ? 'correct' : 'incorrect'}">
                    <div class="fj-team-name">${team.name}</div>
                    <div class="fj-team-answer">${teamAnswer} ${isCorrect ? '✓' : '✗'}</div>
                    <div class="fj-team-wager">Wager: $${wager}</div>
                    <div class="fj-team-score">$${oldScore} → $${team.score}</div>
                </div>
            `;
        });

        revealHTML += `
                </div>
                <button class="btn-primary" onclick="game.endGame()">Show Final Results</button>
            </div>
        `;

        content.innerHTML = revealHTML;
    }

    showResult(isCorrect, explanation) {
        const resultModal = document.getElementById('result-modal');
        const resultIcon = resultModal.querySelector('.result-icon');
        const resultMessage = resultModal.querySelector('.result-message');
        const resultExplanation = resultModal.querySelector('.result-explanation');

        resultIcon.className = 'result-icon ' + (isCorrect ? 'correct' : 'incorrect');
        resultMessage.className = 'result-message ' + (isCorrect ? 'correct' : 'incorrect');
        resultMessage.textContent = isCorrect ? 'Correct!' : 'Incorrect!';
        resultExplanation.textContent = explanation;

        resultModal.classList.add('active');
    }

    closeResultModal() {
        document.getElementById('result-modal').classList.remove('active');
    }

    updateScoreboard() {
        const scoreboard = document.getElementById('scoreboard');
        scoreboard.innerHTML = '';

        this.teams.forEach((team, index) => {
            const teamScore = document.createElement('div');
            teamScore.className = 'team-score' + (index === this.currentTeamIndex ? ' active' : '');
            teamScore.innerHTML = `
                <div class="team-name">${team.name}</div>
                <div class="score">$${team.score}</div>
            `;
            scoreboard.appendChild(teamScore);
        });
    }

    updateCurrentTeamDisplay() {
        const display = document.getElementById('current-team-display');
        if (display && this.currentRound < 2) {
            display.textContent = this.teams[this.currentTeamIndex].name;
        }
    }

    async getAIHint() {
        if (!this.aiEnabled || !this.openaiKey) {
            alert('AI hints are not enabled or no API key provided.');
            return;
        }

        const hintDisplay = document.getElementById('hint-display');
        hintDisplay.innerHTML = '<em>Generating hint...</em>';

        const question = this.currentQuestion.question;
        const prompt = `You are a cybersecurity expert helping someone learn. For the following multiple-choice question, provide a helpful hint without giving away the answer directly. The hint should guide the learner's thinking:\n\nQuestion: ${question.question}\n\nOptions:\n${question.options.map((opt, i) => `${i + 1}. ${opt}`).join('\n')}\n\nProvide a brief, educational hint (2-3 sentences).`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.openaiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        {
                            role: 'system',
                            content: 'You are a helpful cybersecurity instructor providing educational hints.'
                        },
                        {
                            role: 'user',
                            content: prompt
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
            hintDisplay.innerHTML = `<strong>💡 Hint:</strong> ${hint}`;
        } catch (error) {
            console.error('Error getting AI hint:', error);
            hintDisplay.innerHTML = '<em style="color: #ef4444;">Failed to generate hint. Please check your API key and try again.</em>';
        }
    }

    endGame() {
        // Close any open modals
        document.getElementById('question-modal').classList.remove('active');
        document.getElementById('result-modal').classList.remove('active');

        // Sort teams by score
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        // Render final scores with animations
        const finalScores = document.getElementById('final-scores');
        finalScores.innerHTML = '';

        sortedTeams.forEach((team, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'final-score-item' + (index === 0 ? ' winner' : '');
            scoreItem.innerHTML = `
                <span class="team-name">${index + 1}. ${team.name}</span>
                <span class="score">$${team.score}</span>
            `;
            scoreItem.style.animationDelay = `${index * 0.2}s`;
            finalScores.appendChild(scoreItem);
        });

        // Winner announcement with animation
        const announcement = document.getElementById('winner-announcement');
        announcement.innerHTML = `
            <div class="winner-trophy">🏆</div>
            <div class="winner-text">${winner.name} wins with $${winner.score}!</div>
            <div class="winner-sparkles">✨ Champion ✨</div>
        `;

        this.showScreen('gameover-screen');
    }

    playAgain() {
        // Reset scores but keep teams
        this.teams.forEach(team => {
            team.score = 0;
        });
        this.currentRound = 0;
        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();
        this.finalJeopardyWagers = {};
        this.finalJeopardyAnswers = {};

        this.showRoundIntro(0);
    }

    newTeams() {
        this.teams = [];
        this.currentRound = 0;
        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();
        this.aiEnabled = false;
        this.openaiKey = null;
        this.finalJeopardyWagers = {};
        this.finalJeopardyAnswers = {};

        // Reset welcome screen
        document.getElementById('team-count').value = 2;
        this.updateTeamInputs(2);
        document.getElementById('enable-ai').checked = false;
        document.getElementById('ai-key-section').style.display = 'none';
        document.getElementById('openai-key').value = '';

        this.showScreen('welcome-screen');
    }

    resetGame() {
        this.playAgain();
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenId).classList.add('active');
    }
}

// Initialize game when DOM is loaded
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new CyberJeopardyGame();
});
