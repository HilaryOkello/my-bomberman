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
        gameBoard.explosionElements[index].style.transform = `translate(${pos.x * 30}px, ${pos.y * 30}px)`;
        gameBoard.explosionElements[index].style.visibility = 'visible';
        checkCollisions(pos.x, pos.y);
    });

    cleanupTimeout = setTimeout(cleanupExplosion, 500);
    bombActive = false;
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
    enemy.deactivate();
    gameController.enemies = gameController.enemies.filter(e => e !== enemy);
    scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
    gameController.enemyDefeated();
}

function cleanupExplosion() {
    gameBoard.boardState.setCellType(
        parseInt(gameBoard.bombElement.style.transform.split('(')[1]) / 30,
        parseInt(gameBoard.bombElement.style.transform.split(', ')[1]) / 30,
        CELL_TYPES.EMPTY
    );

    gameBoard.bombElement.style.visibility = 'hidden';
    gameBoard.explosionElements.forEach(explosion => {
        explosion.style.visibility = 'hidden';
    });
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
