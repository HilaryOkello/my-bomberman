import { scoreManager, SCORE_CONFIG } from './scores.js';
import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';
import { CELL_TYPES } from './state.js';

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
    }, 1500);
}

function explodeBomb(x, y) {
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

    // Reset bomb visibility immediately
    gameBoard.bombElement.style.visibility = 'hidden';

    // Set cleanup timeout
    if (cleanupTimeout) clearTimeout(cleanupTimeout);
    cleanupTimeout = setTimeout(() => {
        cleanupExplosion();
    }, 500);

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

// Rest of the code remains the same...
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
    enemy.deactivate();
    gameController.enemies = gameController.enemies.filter(e => e !== enemy);
    scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
    gameController.enemyDefeated();
}

export function cleanup() {
    if (explosionTimeout) clearTimeout(explosionTimeout);
    if (cleanupTimeout) clearTimeout(cleanupTimeout);
    bombActive = false;
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

function gameOver() {
    gameController.stopGame();
    if (window.collisionCheckInterval) clearInterval(window.collisionCheckInterval);
    if (window.enemyMoveInterval) clearInterval(window.enemyMoveInterval);
    document.getElementById('game-over-screen').classList.remove('hidden');
}