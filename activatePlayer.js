// activatePlayer.js

class GameController {
    constructor() {
        this.isPlaying = false;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;
        this.gameTimer = null;

        // Get DOM elements
        this.startScreen = document.getElementById('start-screen');
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.pauseScreen = document.getElementById('pause-screen');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.scoreDisplay = document.getElementById('score');
        this.timeDisplay = document.getElementById('time');
        this.livesDisplay = document.getElementById('lives');
        this.levelDisplay = document.getElementById('level');

        // Bind methods
        this.startGame = this.startGame.bind(this);
        this.updateTimer = this.updateTimer.bind(this);
        this.handleKeyPress = this.handleKeyPress.bind(this);
        this.pauseGame = this.pauseGame.bind(this);
        this.resumeGame = this.resumeGame.bind(this);
        this.restartGame = this.restartGame.bind(this);

        // Initialize event listeners
        this.initializeEventListeners();
    }

    // initializeEventListeners() {
    //     this.startBtn.addEventListener('click', this.startGame);
    //     document.addEventListener('keydown', this.handleKeyPress);
    // }


    initializeEventListeners() {
        this.startBtn.addEventListener('click', this.startGame);
        this.pauseBtn.addEventListener('click', this.pauseGame);
        this.resumeBtn.addEventListener('click', this.resumeGame);
        this.restartBtn.addEventListener('click', this.restartGame);
        document.addEventListener('keydown', this.handleKeyPress);
    }

    startGame() {
        this.isPlaying = true;
        this.isPaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.time = 0;

        // Update displays
        this.scoreDisplay.textContent = this.score;
        this.livesDisplay.textContent = `Lives: ${this.lives}`;
        this.levelDisplay.textContent = `Level: ${this.level}`;
        this.timeDisplay.textContent = 'Time: 00:00';

        // Hide start screen and show pause button
        this.startScreen.classList.add('hidden');
        this.pauseBtn.style.display = 'block';

        // Start timer
        this.gameTimer = setInterval(this.updateTimer, 1000);
    }

    pauseGame() {
        if (!this.isPlaying || this.isPaused) return;
        
        this.isPaused = true;
        clearInterval(this.gameTimer);
        this.pauseScreen.classList.remove('hidden');
    }

    resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.pauseScreen.classList.add('hidden');
        this.gameTimer = setInterval(this.updateTimer, 1000);
    }

    restartGame() {
        this.stopGame();
        this.startGame();
        this.pauseScreen.classList.add('hidden');
    }

    updateTimer() {
        this.time++;
        const minutes = Math.floor(this.time / 60).toString().padStart(2, '0');
        const seconds = (this.time % 60).toString().padStart(2, '0');
        this.timeDisplay.textContent = `Time: ${minutes}:${seconds}`;
    }

    handleKeyPress(event) {
        if (!this.isPlaying || this.isPaused) return;

        switch (event.key) {
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // Player movement will be implemented here
                break;
            case ' ': // Spacebar
                // Bomb placing will be implemented here
                break;
            case 'Escape':
                this.pauseGame();
                break;
        }
    }

    stopGame() {
        this.isPlaying = false;
        this.isPaused = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
    }
}

// Create and export game controller instance
const gameController = new GameController();
export default gameController;