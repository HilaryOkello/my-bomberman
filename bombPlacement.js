import { scoreManager, SCORE_CONFIG } from './scores.js';
import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';
import { CELL_TYPES } from './state.js';
import { playSound } from './soundManager.js';

let bombActive = false;
let explosionTimeout = null;
let cleanupTimeout = null;

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

    bombActive = true;

    // Clear any existing timeouts
    if (explosionTimeout) clearTimeout(explosionTimeout);
    if (cleanupTimeout) clearTimeout(cleanupTimeout);

    explosionTimeout = setTimeout(() => {
        explodeBomb(bombX, bombY);
    }, 1000);
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

    let affectedEnemies = new Set(); // Track defeated enemies

    positions.forEach((pos, index) => {
        if (gameBoard.boardState.getCellType(pos.x, pos.y) === CELL_TYPES.WALL) return;

        const element = gameBoard.explosionElements[index];
        element.style.transform = `translate(${pos.x * 30}px, ${pos.y * 30}px)`;
        element.style.display = 'block';
        element.classList.add('active');

        // Destroy breakable walls
        const cellType = gameBoard.boardState.getCellType(pos.x, pos.y);
        if (cellType === CELL_TYPES.BREAKABLE) {
            gameBoard.boardState.setCellType(pos.x, pos.y, CELL_TYPES.EMPTY);
            const cellElement = document.querySelector(`[data-x="${pos.x}"][data-y="${pos.y}"]`);
            if (cellElement) {
                cellElement.classList.remove('breakable');
                cellElement.classList.add('empty');
            }
        }
    });

    // **New: Continuously check collisions for the duration of the explosion**
    let explosionDuration = 500; // Adjust if needed
    let interval = setInterval(() => {
        checkCollisions(x, y, affectedEnemies);
        positions.forEach(pos => checkCollisions(pos.x, pos.y, affectedEnemies));
    }, 50); // Check every 50ms

    setTimeout(() => {
        clearInterval(interval);
        cleanupExplosion();
    }, explosionDuration);

    gameBoard.bombElement.style.visibility = 'hidden';
    bombActive = false;
}


function cleanupExplosion() {
    // Reset the cell type where the bomb was
    const bombX = parseInt(gameBoard.bombElement.style.transform.split('(')[1]) / 30;
    const bombY = parseInt(gameBoard.bombElement.style.transform.split(', ')[1]) / 30;
    gameBoard.boardState.setCellType(bombX, bombY, CELL_TYPES.EMPTY);

    // Hide all explosion elements
    gameBoard.explosionElements.forEach(explosion => {
        explosion.style.display = 'none';
        explosion.classList.remove('active');
    });

    // Reset bomb element
    gameBoard.bombElement.style.visibility = 'hidden';
    bombActive = false;

    // Clear timeouts
    if (explosionTimeout) {
        clearTimeout(explosionTimeout);
        explosionTimeout = null;
    }
    if (cleanupTimeout) {
        clearTimeout(cleanupTimeout);
        cleanupTimeout = null;
    }
}
function checkCollisions(x, y, affectedEnemies) {
    // Check if player is in explosion area
    if (gameController.player.position.x === x && gameController.player.position.y === y) {
        reducePlayerLives();
        gameController.player.resetToStart();
    }

    // Check if an enemy is in explosion area
    gameController.enemies.forEach(enemy => {
        if (enemy.position.x === x && enemy.position.y === y && !affectedEnemies.has(enemy)) {
            affectedEnemies.add(enemy); // Mark enemy as defeated
            handleEnemyDefeat(enemy);
        }
    });
}

function handleEnemyDefeat(enemy) {
    setTimeout(() => {
        enemy.deactivate();
        gameController.enemies = gameController.enemies.filter(e => e !== enemy);
        scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
        gameController.enemyDefeated();
    }, 100);
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

async function gameOver() {
    gameController.stopGame();
    if (window.collisionCheckInterval) clearInterval(window.collisionCheckInterval);
    if (window.enemyMoveInterval) clearInterval(window.enemyMoveInterval);
    await playSound("gameOver")
    document.getElementById('game-over-screen').classList.remove('hidden');
}