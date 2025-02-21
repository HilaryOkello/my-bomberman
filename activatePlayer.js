import gameBoard from "./gameBoard.js";
import { placeBomb, reducePlayerLives } from "./bombPlacement.js";
import { scoreManager } from "./scores.js";
import { playSound, playBackgroundMusic, stopBackgroundMusic } from "./soundManager.js";
class GameController {
    constructor() {
        this.defaultState = {
            isPlaying: false,
            isPaused: false,
            score: 0,
            lives: 3,
            level: 1,
            time: 0,
            enemyCount: 4,
            enemies: [],
            player: null,
            gameTimer: null
        };
        Object.assign(this, this.defaultState);

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
            scoreDisplay: document.getElementById("score"),
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
            'pauseGame', 'resumeGame', 'restartGame',
            'movePlayer', 'enemyDefeated',
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
        
        Object.assign(this, { ...this.defaultState, isPlaying: true });
        scoreManager.reset();
        this.ui.winScreen.classList.add("hidden");
        this.ui.startScreen.classList.add("hidden");
        this.ui.pauseBtn.style.display = "block";

        // Start timer
        this.gameTimer = setInterval(this.updateTimer, 1000);

        await playSound("introGame");

        // Activate player and enemies
        this.player = gameBoard.activatePlayer();
        this.enemies = gameBoard.spawnEnemies(this.enemyCount);

        this.updateUI();
        playBackgroundMusic();
    }

    enemyDefeated() {
        if (--this.enemyCount <= 0) {
            this.winGame();
        }
    }

    async winGame() {
        this.stopGame();
        await playSound("gameWin");
        this.ui.winScreen.classList.remove("hidden");
        stopBackgroundMusic();
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

    updateTimer() {
        this.time++;
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
                return this.movePlayer(event.key);
            case ' ':
                return placeBomb();
        }
    }

    movePlayer(direction) {
        if (!this.isPlaying || this.isPaused) return;

        if (this.player.move(direction)) {
            const currentCell = this.player.getCurrentCell();
            if (currentCell.querySelector('.enemy')) {
                reducePlayerLives();
                this.player.resetToStart();
            }
        }
    }

    updateUI() {
        this.ui.scoreDisplay.textContent = this.score;
        this.ui.livesDisplay.textContent = `Lives: ${this.lives}`;
        this.ui.levelDisplay.textContent = `Level: ${this.level}`;
    }
}

// Export singleton instance
const gameController = new GameController();
export default gameController;
