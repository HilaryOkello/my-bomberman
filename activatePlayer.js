import gameBoard from "./gameBoard.js";
import { placeBomb } from "./bombPlacement.js";
import { spawnEnemies, moveEnemies } from "./enemyPlacement.js";

class GameController {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;
        this.enemyCount = 4;
        this.gameTimer = null;2
        this.playerPosition = { row: 1, col: 1 }; // Initial player position

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
        this.gameOverRestart =document.getElementById("game-over-btn");

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
        this.winScreen.classList.add("hidden");
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;
        this.enemyCount = 4;
        this.playerPosition = {row: 1, col: 1};

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
        this.updatePlayerPosition(this.playerPosition.row, this.playerPosition.col);

        // Spawn enemies and start their movement
        const enemies = spawnEnemies(this.enemyCount);
        moveEnemies(enemies, this.playerPosition, () => {
            this.lives--;
            this.livesDisplay.textContent = `Lives: ${this.lives}`;
            if (this.lives <= 0) {
                this.stopGame();
                document.getElementById('game-over-screen').classList.remove('hidden');
            }
        });
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
        this.startGame(); 
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        document.getElementsByClassName("player")[0].classList.remove("player");
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
        if (!this.isPlaying || this.isPaused) return;

        switch (event.key) {
            case "ArrowUp":
            case "ArrowDown":
            case "ArrowLeft":
            case "ArrowRight":
                this.movePlayer(event.key);
                break;
            case "Escape":
                this.pauseGame();
                break;
        }
    }

    movePlayer(direction) {
        if (!this.isPlaying || this.isPaused) return;

        const { row, col } = this.playerPosition;
        const movement = {
            "ArrowUp": { row: 0, col: -1 },
            "ArrowDown": { row: 0, col: 1 },
            "ArrowLeft": { row: -1, col: 0 },
            "ArrowRight": { row: 1, col: 0 }
        };

        if (!movement[direction]) return;

        let newRow = row + movement[direction].row;
        let newCol = col + movement[direction].col;

        // Ensure new position is within bounds
        if (newRow < 1 || newRow > 15 || newCol < 1 || newCol > 11) return;

        // Check if the new position is walkable before moving
        if (gameBoard.isWalkable(newRow, newCol)) {
            this.updatePlayerPosition(newRow, newCol);
        }
    }


    updatePlayerPosition(newRow, newCol) {
        const cells = document.getElementsByClassName("cell");

        // Calculate old and new indexes
        const oldIndex = (this.playerPosition.row) + (this.playerPosition.col * 17);
        const newIndex = (newRow) + (newCol * 17);

        // Remove player from the old position
        if (cells[oldIndex]) {
            cells[oldIndex].classList.remove("player");
        }

        // Add player to the new position
        if (cells[newIndex]) {
            cells[newIndex].classList.add("player");
        }

        // Update player's new position
        this.playerPosition = { row: newRow, col: newCol };
    }
}

// Create and export game controller instance
const gameController = new GameController();
export default gameController;
