// Cyber Jeopardy Madness - Game Logic
// Federal Credit Union Cybersecurity Training Game

class CyberJeopardyGame {
    constructor() {
        this.gameData = null;
        this.teams = [];
        this.currentTeamIndex = 0;
        this.answeredQuestions = new Set();
        this.currentQuestion = null;
        this.aiEnabled = false;
        this.openaiKey = null;

        this.init();
    }

    async init() {
        await this.loadGameData();
        this.setupEventListeners();
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
        document.getElementById('submit-answer-btn').addEventListener('click', () => {
            this.submitAnswer();
        });

        document.getElementById('skip-question-btn').addEventListener('click', () => {
            this.skipQuestion();
        });

        document.getElementById('get-hint-btn')?.addEventListener('click', () => {
            this.getAIHint();
        });

        // Result modal
        document.getElementById('continue-btn').addEventListener('click', () => {
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

        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();

        this.showScreen('game-screen');
        this.renderGameBoard();
        this.updateScoreboard();
    }

    renderGameBoard() {
        const gameBoard = document.getElementById('game-board');
        gameBoard.innerHTML = '';

        this.gameData.categories.forEach((category, catIndex) => {
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

                const questionId = `${catIndex}-${qIndex}`;
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

    showQuestion(categoryIndex, questionIndex) {
        const category = this.gameData.categories[categoryIndex];
        const question = category.questions[questionIndex];

        this.currentQuestion = {
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

        // Show modal
        document.getElementById('question-modal').classList.add('active');
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
        if (this.currentQuestion.selectedAnswer === null) {
            return;
        }

        const question = this.currentQuestion.question;
        const selectedOption = question.options[this.currentQuestion.selectedAnswer];
        const isCorrect = selectedOption === question.answer;

        // Update score
        const currentTeam = this.teams[this.currentTeamIndex];
        if (isCorrect) {
            currentTeam.score += question.points;
        } else {
            currentTeam.score -= question.points;
        }

        // Mark question as answered
        const questionId = `${this.currentQuestion.categoryIndex}-${this.currentQuestion.questionIndex}`;
        this.answeredQuestions.add(questionId);

        // Close question modal
        document.getElementById('question-modal').classList.remove('active');

        // Show result
        this.showResult(isCorrect, question.explanation);

        // Update game state
        this.updateScoreboard();
        this.renderGameBoard();

        // Check if game is over
        if (this.answeredQuestions.size === this.getTotalQuestions()) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        } else {
            // Next team's turn
            this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
            this.updateCurrentTeamDisplay();
        }
    }

    skipQuestion() {
        // Mark as answered but don't change score
        const questionId = `${this.currentQuestion.categoryIndex}-${this.currentQuestion.questionIndex}`;
        this.answeredQuestions.add(questionId);

        // Close modal
        document.getElementById('question-modal').classList.remove('active');

        // Update board
        this.renderGameBoard();

        // Check if game is over
        if (this.answeredQuestions.size === this.getTotalQuestions()) {
            setTimeout(() => {
                this.endGame();
            }, 500);
        } else {
            // Next team's turn
            this.currentTeamIndex = (this.currentTeamIndex + 1) % this.teams.length;
            this.updateCurrentTeamDisplay();
        }
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
        if (display) {
            display.textContent = this.teams[this.currentTeamIndex].name;
        }
    }

    getTotalQuestions() {
        return this.gameData.categories.reduce((total, category) => {
            return total + category.questions.length;
        }, 0);
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
        // Sort teams by score
        const sortedTeams = [...this.teams].sort((a, b) => b.score - a.score);
        const winner = sortedTeams[0];

        // Render final scores
        const finalScores = document.getElementById('final-scores');
        finalScores.innerHTML = '';

        sortedTeams.forEach((team, index) => {
            const scoreItem = document.createElement('div');
            scoreItem.className = 'final-score-item' + (index === 0 ? ' winner' : '');
            scoreItem.innerHTML = `
                <span class="team-name">${index + 1}. ${team.name}</span>
                <span class="score">$${team.score}</span>
            `;
            finalScores.appendChild(scoreItem);
        });

        // Winner announcement
        document.getElementById('winner-announcement').textContent =
            `🏆 ${winner.name} wins with $${winner.score}! 🏆`;

        this.showScreen('gameover-screen');
    }

    playAgain() {
        // Reset scores but keep teams
        this.teams.forEach(team => {
            team.score = 0;
        });
        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();

        this.showScreen('game-screen');
        this.renderGameBoard();
        this.updateScoreboard();
        this.updateCurrentTeamDisplay();
    }

    newTeams() {
        this.teams = [];
        this.currentTeamIndex = 0;
        this.answeredQuestions.clear();
        this.aiEnabled = false;
        this.openaiKey = null;

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
document.addEventListener('DOMContentLoaded', () => {
    new CyberJeopardyGame();
});
