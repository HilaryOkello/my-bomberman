// Updated bombPlacement.js
import { scoreManager, SCORE_CONFIG } from './scores.js';
import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';
import { CELL_TYPES } from './state.js';
import { playSound } from './soundManager.js';

// State tracking for bombs
let bombActive = false;
let bombTimer = 0;
const BOMB_EXPLOSION_TIME = 1000; // 1 second in milliseconds
const EXPLOSION_DURATION = 250; // Duration for explosion visuals

// Current bomb position
let currentBombX = 0;
let currentBombY = 0;
let explosionActive = false;
let explosionTimer = 0;

// Store bomb visual state to ensure it persists through pause/resume
let bombPlaced = false;

export function placeBomb() {
    if (!gameController.isPlaying || gameController.isPaused || bombActive) return;

    const bombX = gameController.player.position.x;
    const bombY = gameController.player.position.y;

    if (bombX === 1 && bombY === 1) return;

    if (gameBoard.boardState.getCellType(bombX, bombY) === CELL_TYPES.BOMB) return;

    // Set bomb state
    gameBoard.boardState.setCellType(bombX, bombY, CELL_TYPES.BOMB);

    // Move bomb element
    gameBoard.bombElement.style.transform = `translate(${bombX * 30}px, ${bombY * 30}px)`;
    gameBoard.bombElement.style.visibility = 'visible';

    // Set bomb timer instead of using setTimeout
    bombActive = true;
    bombPlaced = true;
    bombTimer = 0;
    currentBombX = bombX;
    currentBombY = bombY;
}

// New function to update bomb state in game loop
export function updateBombs(deltaTime) {
    // If no bomb or explosion is active, no need to update
    if (!bombActive && !explosionActive) return;
    
    // Make sure the bomb is visible if it's active
    if (bombActive && bombPlaced) {
        gameBoard.bombElement.style.visibility = 'visible';
        // Update timer for active bomb
        bombTimer += deltaTime;
        if (bombTimer >= BOMB_EXPLOSION_TIME) {
            explodeBomb(currentBombX, currentBombY);
            bombActive = false;
            bombPlaced = false;
            explosionActive = true;
            explosionTimer = 0;
        }
    }
    
    // Handle explosion
    if (explosionActive) {
        explosionTimer += deltaTime;
        if (explosionTimer >= EXPLOSION_DURATION) {
            cleanupExplosion();
            explosionActive = false;
        }
    }
}


// Ensure bomb is visible when game is resumed
export function resumeGame() {
    // Make sure bomb is visible if it was active when paused
    if (bombActive && bombPlaced) {
        gameBoard.bombElement.style.visibility = 'visible';
        // Make sure the cell is still marked as a bomb
        gameBoard.boardState.setCellType(currentBombX, currentBombY, CELL_TYPES.BOMB);
    }
}

function explodeBomb(x, y) {
    playSound("bombExplodes");
    const positions = [
        { x, y, type: 'center' },
        { x: x + 1, y, type: 'right' },
        { x: x - 1, y, type: 'left' },
        { x, y: y + 1, type: 'down' },
        { x, y: y - 1, type: 'up' }
    ];

    positions.forEach((pos, index) => {
        if (gameBoard.boardState.getCellType(pos.x, pos.y) === CELL_TYPES.WALL) {
            return;
        }
        const element = gameBoard.explosionElements[index];
        element.style.transform = `translate(${pos.x * 30}px, ${pos.y * 30}px)`;
        element.style.display = 'block';
        element.classList.add('active');

        // Check if this position has a breakable wall
        const cellType = gameBoard.boardState.getCellType(pos.x, pos.y);
        if (cellType === CELL_TYPES.BREAKABLE) {
            // Destroy the breakable wall
            gameBoard.boardState.setCellType(pos.x, pos.y, CELL_TYPES.EMPTY);

            // Update the visual representation
            const cellElement = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (cellElement) {
                cellElement.classList.remove('breakable');
                cellElement.classList.add('empty');
            }
        }

        checkCollisions(pos.x, pos.y);
    });

    // Reset bomb visibility after explosion
    gameBoard.bombElement.style.visibility = 'hidden';
}

function cleanupExplosion() {
    // Reset the cell type where the bomb was
    gameBoard.boardState.setCellType(currentBombX, currentBombY, CELL_TYPES.EMPTY);

    // Hide all explosion elements
    gameBoard.explosionElements.forEach(explosion => {
        explosion.style.display = 'none';
        explosion.classList.remove('active');
    });

    // Reset bomb element
    gameBoard.bombElement.style.visibility = 'hidden';
}

function checkCollisions(x, y) {
    if (gameController.player.position.x === x && gameController.player.position.y === y) {
        reducePlayerLives();
        gameController.player.resetToStart();
    }

    gameController.enemies.forEach(enemy => {
        if (enemy.position.x === x && enemy.position.y === y) {
            handleEnemyDefeat(enemy);
        }
    });
}

function handleEnemyDefeat(enemy) {
    enemy.element.classList.add('fade-out'); // Apply fade-out effect

    setTimeout(() => {
        enemy.deactivate();
        enemy.element.classList.remove('fade-out'); // Remove fade-out class
        gameController.enemies = gameController.enemies.filter(e => e !== enemy);
        scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
        gameController.enemyDefeated();
    }, 500);
}

export function reducePlayerLives() {
    let livesElement = document.getElementById('lives');
    let lives = parseInt(livesElement.innerText.split(': ')[1]);

    if (lives > 0) {
        lives -= 1;
        livesElement.innerText = `Lives: ${lives}`;
    }

    if (lives === 0) {
        gameOver();
    }
}

export async function gameOver() {
    gameController.stopGame();
    if (window.collisionCheckInterval) clearInterval(window.collisionCheckInterval);
    if (window.enemyMoveInterval) clearInterval(window.enemyMoveInterval);
    await playSound("gameOver")
    document.getElementById('game-over-screen').classList.remove('hidden');
}