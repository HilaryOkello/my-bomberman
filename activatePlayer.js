import gameBoard from "./gameBoard.js";
import { placeBomb, gameOver} from "./bombPlacement.js";
import { SCORE_CONFIG, scoreManager } from "./scores.js";
import { playSound, playBackgroundMusic, stopBackgroundMusic } from "./soundManager.js";
import { LEVEL_CONFIG } from "./levelSystem.js";

class GameController {
    constructor() {
        this.state = {
            isPlaying: false,
            isPaused: false,
            lives: 3,
            level: 1,
            time: this.timeLimit,
            enemyCount: LEVEL_CONFIG.enemyCount,
            timeLimit: LEVEL_CONFIG[1].timeLimit,
            enemies: [],
            player: null,
            gameTimer: null
        };
        Object.assign(this, this.state);

        // UI Elements
        this.ui = {
            startScreen: document.getElementById("start-screen"),
            startBtn: document.getElementById("start-btn"),
            pauseBtn: document.getElementById("pause-btn"),
            pauseScreen: document.getElementById("pause-screen"),
            resumeBtn: document.getElementById("resume-btn"),
            restartBtn: document.getElementById("restart-btn"),
            gameOverScreen: document.getElementById("game-over-screen"),
            winScreen: document.getElementById("game-win-screen"),
            playAgain: document.getElementById("play-again-btn"),
            gameOverRestart: document.getElementById("game-over-btn"),
            levelDisplay: document.getElementById("level"),
            completeLevelDisplay: document.getElementById("complete-level-screen"),
            completeLevel: document.getElementById("complete-level"),
            levelScore: document.getElementById("level-score"),
            timeDisplay: document.getElementById("time"),
            livesDisplay: document.getElementById("lives"),
            levelDisplay: document.getElementById("level"),
        };

        // Bind Methods
        this.bindMethods();

        // Initialize Event Listeners
        this.initializeEventListeners();
    }

    bindMethods() {
        [
            'startGame', 'updateTimer', 'handleKeyPress',
            'pauseGame', 'resumeGame', 'restartGame', 'enemyDefeated',
            'stopGame', 'updateUI'
        ].forEach(method => this[method] = this[method].bind(this));
    }

    initializeEventListeners() {
        const { startBtn, pauseBtn, resumeBtn, restartBtn, gameOverRestart, playAgain } = this.ui;
        startBtn.addEventListener("click", this.startGame);
        pauseBtn.addEventListener("click", this.pauseGame);
        resumeBtn.addEventListener("click", this.resumeGame);
        restartBtn.addEventListener("click", this.restartGame);
        gameOverRestart.addEventListener("click", this.restartGame);
        playAgain.addEventListener("click", this.startGame);
        document.addEventListener("keydown", this.handleKeyPress);
    }

    async startGame() {
        // Clear any existing timer first
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }

        await playSound("introGame");

        // Reset game state to default
        Object.assign(this, { ...this.state, isPlaying: true });
        scoreManager.reset();

        // Hide/show appropriate screens
        this.ui.winScreen.classList.add("hidden");
        this.ui.startScreen.classList.add("hidden");
        this.ui.pauseBtn.style.display = "block";

        // Start the first level
        this.startLevel();

    }

    startLevel() {
        // Set up level-specific configurations
        this.enemyCount = LEVEL_CONFIG[this.level].enemyCount;
        this.timeLimit = LEVEL_CONFIG[this.level].timeLimit;
        this.time = this.timeLimit;

        // Start/restart timer
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        this.gameTimer = setInterval(this.updateTimer.bind(this), 1000);

        // Activate player and enemies
        this.player = gameBoard.activatePlayer();
        this.enemies = gameBoard.spawnEnemies(this.enemyCount);

        // Set enemy speed for current level
        this.enemies.forEach(enemy => enemy.setSpeed(this.level));

        // Update UI and start music
        this.updateUI();
        playBackgroundMusic();
    }

    async completeLevel() {
        stopBackgroundMusic();

        scoreManager.addPoints(SCORE_CONFIG.LEVEL_COMPLETION_BONUS);
        const timeTaken = this.timeLimit - this.time;
        scoreManager.addTimeBonus(timeTaken);
        this.isPaused = true;
        this.player.hide();
        gameBoard.deactivateAllEnemies();
        this.enemies = [];

        // Show the level completion screen immediately
        this.ui.levelScore.textContent = `${scoreManager.currentScore}`;
        this.ui.completeLevel.textContent = `Level ${this.level}`;
        this.ui.completeLevelDisplay.classList.remove("hidden");

        // Play sound and wait for it to finish before proceeding
        await playSound("introGame");

        this.nextLevel();
    }

    nextLevel() {
        this.ui.completeLevelDisplay.classList.add("hidden");
        // Clear current timer
        clearInterval(this.gameTimer);
        // Increment level
        this.level++;
        gameBoard.resetBoard();
        this.isPaused = false;
        this.startLevel();
    }

    async enemyDefeated() {
        if (--this.enemyCount <= 0) {
            if (this.level < 3) {
                this.completeLevel();
            } else {
                scoreManager.addPoints(SCORE_CONFIG.LEVEL_COMPLETION_BONUS);
                this.winGame();
            }
        }
    }

    pauseGame() {
        if (!this.isPlaying || this.isPaused) return;
        this.isPaused = true;
        clearInterval(this.gameTimer);
        this.ui.pauseScreen.classList.remove("hidden");
        stopBackgroundMusic();
    }

    resumeGame() {
        if (!this.isPaused) return;
        this.isPaused = false;
        this.ui.pauseScreen.classList.add("hidden");
        this.gameTimer = setInterval(this.updateTimer, 1000);
        playBackgroundMusic();
    }

    restartGame() {
        this.stopGame();
        this.ui.gameOverScreen.classList.add("hidden");
        this.ui.pauseScreen.classList.add("hidden");
        gameBoard.resetBoard();
        this.startGame();
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        clearInterval(this.gameTimer);

        // Hide player and enemies
        this.player.hide();
        gameBoard.deactivateAllEnemies();
        this.enemies = [];
        stopBackgroundMusic();
    }

    async winGame() {
        stopBackgroundMusic();
        this.stopGame();

        this.ui.winScreen.classList.remove("hidden");

        await playSound("gameWin");
    }

    updateTimer() {

        if (this.time <= 0) {
            gameOver();
            clearInterval(this.gameTimer);
            return;
        }

        this.time--;
        const minutes = String(Math.floor(this.time / 60)).padStart(2, "0");
        const seconds = String(this.time % 60).padStart(2, "0");
        this.ui.timeDisplay.textContent = `Time: ${minutes}:${seconds}`;
    }

    handleKeyPress(event) {
        if (!this.isPlaying) return;

        // Allow 'p' key to toggle pause/resume even when paused
        if (event.key === 'p') {
            return this.isPaused ? this.resumeGame() : this.pauseGame();
        }

        if (this.isPaused) return;

        switch (event.key) {
            // case 'p': return this.isPaused ? this.resumeGame() : this.pauseGame();
            case 'ArrowUp': case 'ArrowDown': case 'ArrowLeft': case 'ArrowRight':
                return this.player.move(event.key);
            case ' ':
                return placeBomb();
        }
    }


    updateUI() {
        this.ui.livesDisplay.textContent = `Lives: ${this.lives}`;
        this.ui.levelDisplay.textContent = `Level: ${this.level}`;

        const minutes = String(Math.floor(this.time / 60)).padStart(2, "0");
        const seconds = String(this.time % 60).padStart(2, "0");
        this.ui.timeDisplay.textContent = `Time: ${minutes}:${seconds}`;
    }
}

// Export singleton instance
const gameController = new GameController();
export default gameController;
