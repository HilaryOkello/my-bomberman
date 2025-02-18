import gameBoard from "./gameBoard.js";
import { placeBomb, reducePlayerLives } from "./bombPlacement.js";
import { spawnEnemies } from "./enemyPlacement.js";
import { scoreManager } from "./scores.js";
import { Player } from './player.js';

class GameController {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;
        this.enemyCount = 4;
        this.gameTimer = null;
        this.player = null;

        // Get DOM elements
        this.startScreen = document.getElementById("start-screen");
        this.startBtn = document.getElementById("start-btn");
        this.pauseBtn = document.getElementById("pause-btn");
        this.pauseScreen = document.getElementById("pause-screen");
        this.resumeBtn = document.getElementById("resume-btn");
        this.restartBtn = document.getElementById("restart-btn");
        this.scoreDisplay = document.getElementById("score");
        this.timeDisplay = document.getElementById("time");
        this.livesDisplay = document.getElementById("lives");
        this.levelDisplay = document.getElementById("level");
        this.gameOverScreen = document.getElementById("game-over-screen");
        this.winScreen = document.getElementById("game-win-screen");
        this.playAgain = document.getElementById("play-again-btn");
        this.gameOverRestart = document.getElementById("game-over-btn");

        // Bind methods
        this.startGame = this.startGame.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.restartGame = this.restartGame.bind(this);
        this.movePlayer = this.movePlayer.bind(this);
        this.updatePlayerPosition = this.updatePlayerPosition.bind(this);
        this.enemyDefeated = this.enemyDefeated.bind(this);
        this.stopGame = this.stopGame.bind(this);

        // Initialize event listeners
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        this.startBtn.addEventListener("click", this.startGame);
        this.pauseBtn.addEventListener("click", this.pauseGame);
        this.resumeBtn.addEventListener("click", this.resumeGame);
        this.restartBtn.addEventListener("click", this.restartGame);
        this.gameOverRestart.addEventListener("click", this.restartGame);
        this.playAgain.addEventListener("click", this.startGame);
        document.addEventListener("keydown", this.handleKeyPress);
    }

    startGame() {
        scoreManager.reset();
        this.winScreen.classList.add("hidden");
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;
        this.enemyCount = 4;
        this.enemies = [];
        this.player = new Player();

        // Update displays
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = `Lives: ${this.lives}`;
        this.levelDisplay.textContent = `Level: ${this.level}`;
        this.timeDisplay.textContent = "Time: 00:00";

        // Hide start screen and show pause button
        this.startScreen.classList.add("hidden");
        this.pauseBtn.style.display = "block";

        // Start timer
        this.gameTimer = setInterval(this.updateTimer, 1000);

        // Place player on the board
        this.updatePlayerPosition(1, 1);

        // Spawn enemies and start their movement
        this.enemies = spawnEnemies(this.enemyCount);
    }

    enemyDefeated() {
        this.enemyCount--;
        this.checkWinCondition();
    }

    checkWinCondition() {
        if (this.enemyCount <= 0) {
            this.stopGame();
            this.winScreen.classList.remove("hidden");
        }
    }

    pauseGame() {
        if (!this.isPlaying || this.isPaused) return;

        this.isPaused = true;
        clearInterval(this.gameTimer);

        // moveEnemies(null, null, null, true);
        clearInterval(window.collisionCheckInterval); // Stop checking collision when paused
        clearInterval(window.enemyMoveInterval); // Stop enemy movement

        this.pauseScreen.classList.remove("hidden");
    }

    resumeGame() {
        if (!this.isPaused) return;

        this.isPaused = false;
        this.pauseScreen.classList.add("hidden");
        this.gameTimer = setInterval(this.updateTimer, 1000);
    }

    restartGame() {
        this.stopGame();
        this.gameOverScreen.classList.add("hidden");
        this.pauseScreen.classList.add("hidden");
        this.startGame();
        scoreManager.reset();
    }

    completeLevel(remainingTime) {
        scoreManager.addPoints(SCORE_CONFIG.LEVEL_COMPLETION_BONUS);
        scoreManager.addTimeBonus(remainingTime);
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }

        if (document.getElementById("player")) {
            player.remove()
        }

        // Clean up enemies
        const cells = document.getElementsByClassName('cell');
        for (let cell of cells) {
            const enemyInCell = cell.querySelector('.enemy');
            if (enemyInCell) {
                enemyInCell.parentElement.remove();
            }
        }
    }

    updateTimer() {
        this.time++;
        const minutes = Math.floor(this.time / 60)
            .toString()
            .padStart(2, "0");
        const seconds = (this.time % 60).toString().padStart(2, "0");
        this.timeDisplay.textContent = `Time: ${minutes}:${seconds}`;
    }

    handleKeyPress(event) {
        if (!this.isPlaying) return;

        if (event.key === 'p') {
            if (this.isPaused) {
                this.resumeGame();
            } else {
                this.pauseGame();
            }
            return
        }

        // Movement stop if game paused
        if (this.isPaused) return;

        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                this.movePlayer(event.key);
                break;
            case " ":
                placeBomb();
                break;
        }
    }

    movePlayer(direction) {
        if (!this.isPlaying || this.isPaused) return;

        if (this.player.move(direction)) {
            // Check for collisions after movement
            const currentCell = this.player.getCurrentCell();

            // Check for enemy collision
            if (currentCell.querySelector('.enemy')) {
                reducePlayerLives();
                this.player.resetToStart();
            }
        }
    }


    updatePlayerPosition(newRow, newCol) {
        if (this.player) {
            this.player.updatePosition(newRow, newCol);
        }
    }
}

// Create and export game controller instance
const gameController = new GameController();
export default gameController;
