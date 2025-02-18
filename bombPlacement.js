import { scoreManager, SCORE_CONFIG } from './scores.js';
import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';

let bombActive = false;
let explosionTimeout = null;
let cleanupTimeout = null;

export function placeBomb() {
    if (!gameController.isPlaying || gameController.isPaused || bombActive) return;

    const bombX = gameController.player.position.x;
    const bombY = gameController.player.position.y;

    if (bombX === 1 && bombY === 1) return;

    // Cache DOM query
    const bombCell = document.querySelector(`[data-x="${bombX}"][data-y="${bombY}"]`);
    if (!bombCell || bombCell.classList.contains('bomb')) return;

    // Single class addition
    bombCell.classList.add('bomb');
    bombActive = true;

    // Store timeout reference for cleanup
    explosionTimeout = setTimeout(() => {
        explodeBomb(bombX, bombY, bombCell);
    }, 1500);
}

function explodeBomb(x, y, bombCell) {
    // Pre-calculate explosion cells
    const explosionCells = getExplosionCells(x, y);

    // Batch DOM reads
    const cellElements = explosionCells.map(cell => ({
        ...cell,
        element: document.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`)
    })).filter(cell => cell.element && !cell.element.classList.contains('wall'));

    // Batch DOM writes
    cellElements.forEach(({ element, type }) => {
        element.classList.add('explosion');
        element.style.backgroundImage = getExplosionImage(type);

        checkCollisions(element);
    });

    // Schedule cleanup
    cleanupTimeout = setTimeout(() => cleanupExplosion(cellElements, bombCell), 500);

    bombActive = false;
}

function getExplosionCells(x, y) {
    return [
        { x, y, type: 'center' },
        { x: x + 1, y, type: 'horizontal' },
        { x: x - 1, y, type: 'horizontal' },
        { x, y: y + 1, type: 'vertical' },
        { x, y: y - 1, type: 'vertical' }
    ];
}

function getExplosionImage(type) {
    const images = {
        center: "url('./images/explosion_base.png')",
        horizontal: "url('./images/explosion_horizontal.png')",
        vertical: "url('./images/explosion_vertical.png')"
    };
    return images[type];
}

function checkCollisions(cell) {
    // Check player collision
    if (cell === gameController.player.getCurrentCell()) {
        reducePlayerLives();
        gameController.player.resetToStart();
    }

    // Check enemy collision
    const enemyInCell = cell.querySelector('.enemy');
    if (enemyInCell) {
        handleEnemyDefeat(enemyInCell, cell);
    }
}

function handleEnemyDefeat(enemyElement, cell) {
    // Remove enemy
    enemyElement.parentElement.remove();
    // Update game state
    const enemyX = parseInt(cell.dataset.x);
    const enemyY = parseInt(cell.dataset.y);
    gameController.enemies = gameController.enemies.filter(enemy =>
        !(enemy.x === enemyX && enemy.y === enemyY)
    );

    scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
    gameController.enemyDefeated();
}

function cleanupExplosion(cellElements, bombCell) {
    cellElements.forEach(({ element }) => {
        if (element.classList.contains('breakable')) {
            element.classList.remove('breakable');
            gameBoard.updateCell(
                parseInt(element.dataset.x),
                parseInt(element.dataset.y),
                'empty'
            );
        }
        element.classList.remove('explosion');
        element.style.backgroundImage = '';
    });

    // Clean up bomb cell
    bombCell.classList.remove('bomb', 'explosion');
    bombCell.style.backgroundImage = '';
}

export function cleanup() {
    // Clear any pending timeouts
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
    // Stop game
    gameController.stopGame();

    // Clear any remaining intervals
    if (window.collisionCheckInterval) {
        clearInterval(window.collisionCheckInterval);
    }
    if (window.enemyMoveInterval) {
        clearInterval(window.enemyMoveInterval);
    }

    // Remove all enemies from the board
    const enemies = document.querySelectorAll('.enemy');
    enemies.forEach(enemy => {
        if (enemy.parentElement) {
            enemy.parentElement.remove();
        }
    });

    document.getElementById('game-over-screen').classList.remove('hidden');
}
