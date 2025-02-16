import { scoreManager, SCORE_CONFIG } from './scores.js';
import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';

let bombActive = false;

export function placeBomb() {
    if (!gameController.isPlaying || gameController.isPaused) {
        console.warn('Game is not active. Cannot place bomb.');
        return;
    }

    if (bombActive) {
        console.warn('Bomb is already active. Wait for it to explode.');
        return;
    }

    const bombX = gameController.playerPosition.row;
    const bombY = gameController.playerPosition.col;

    if (bombX == 1 && bombY == 1) return;

    const bombCell = document.querySelector(`[data-x="${bombX}"][data-y="${bombY}"]`);

    if (!bombCell || bombCell.classList.contains('bomb')) return;

    bombCell.classList.add('bomb');
    bombActive = true;

    setTimeout(() => explodeBomb(bombX, bombY), 1500);
}

function explodeBomb(x, y) {
    const explosionCells = [
        { x: x, y: y, type: 'center' },
        { x: x + 1, y: y, type: 'horizontal' },
        { x: x - 1, y: y, type: 'horizontal' },
        { x: x, y: y + 1, type: 'vertical' },
        { x: x, y: y - 1, type: 'vertical' }
    ];

    let playerHit = false; // Flag to prevent multiple player hits

    explosionCells.forEach(cell => {
        const targetCell = document.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`);
        if (!targetCell) return;

        // Stop explosion if it hits an unbreakable wall
        if (targetCell.classList.contains('wall')) return;

        // Apply explosion effect with correct image
        targetCell.classList.add('explosion');

        if (cell.type === 'center') {
            targetCell.style.backgroundImage = "url('./images/explosion_base.png')";
        } else if (cell.type === 'horizontal') {
            targetCell.style.backgroundImage = "url('./images/explosion_horizontal.png')";
        } else if (cell.type === 'vertical') {
            targetCell.style.backgroundImage = "url('./images/explosion_vertical.png')";
        }
        // scoreManager.addTimeBonus(SCORE_CONFIG.TIME_BONUS_FACTOR);

        // Handle player hit
        if (targetCell.classList.contains('player') && !playerHit) {
            playerHit = true;
            reducePlayerLives();
            targetCell.classList.remove('player');
            gameController.updatePlayerPosition(1, 1);
        }

        // Handle enemy hit (if applicable)
        const enemyInCell = targetCell.querySelector('.enemy');
        if (enemyInCell) {
            enemyInCell.parentElement.remove();
            scoreManager.addPoints(SCORE_CONFIG.ENEMY_DEFEATED);
            gameController.enemyDefeated() 
        }

        // Remove explosion effect after 500ms
        setTimeout(() => {
            // Handle breakable walls (remove them)
            if (targetCell.classList.contains('breakable')) {
                targetCell.classList.remove('breakable');
                gameBoard.updateCell(cell.x, cell.y, 'empty');
            }
            targetCell.classList.remove('explosion');
            targetCell.style.backgroundImage = "";
            // gameBoard.updateCell(cell.x, cell.y, 'empty');
        }, 500);
    });

    // Remove bomb itself
    const bombCell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (bombCell) {
        bombCell.classList.remove('bomb');
        bombCell.classList.add('explosion');
        bombCell.style.backgroundImage = "url('./images/explosion_base.png')";

        setTimeout(() => {
            bombCell.classList.remove('explosion');
            bombCell.style.backgroundImage = "";
            gameBoard.updateCell(x, y, 'empty');
            bombActive = false;
        }, 500);
    }
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
    
    // Remove player from the board
    const playerCell = document.querySelector('.player');
    if (playerCell) {
        playerCell.classList.remove('player');
    }

    document.getElementById('game-over-screen').classList.remove('hidden');
}
