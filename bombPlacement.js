import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';

export function placeBomb() {
    if (!gameController.isPlaying || gameController.isPaused) {
        console.warn('Game is not active. Cannot place bomb.');
        return;
    }

    const bombX = gameController.playerPosition.row;
    const bombY = gameController.playerPosition.col;

    const bombCell = document.querySelector(`[data-x="${bombX}"][data-y="${bombY}"]`);

    if (!bombCell || bombCell.classList.contains('bomb')) return;

    bombCell.classList.add('bomb');

    setTimeout(() => explodeBomb(bombX, bombY), 3000);
}

function explodeBomb(x, y) {
    const explosionCells = [
        { x: x, y: y, type: 'center' },
        { x: x + 1, y: y, type: 'horizontal' },
        { x: x - 1, y: y, type: 'horizontal' },
        { x: x, y: y + 1, type: 'vertical' },
        { x: x, y: y - 1, type: 'vertical' }
    ];

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

        // Handle player hit
        if (targetCell.classList.contains('player')) {
            reducePlayerLives();
        }

        // Handle enemy hit (if applicable)
        if (targetCell.classList.contains('enemy')) {
            targetCell.classList.remove('enemy');
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
            gameBoard.updateCell(cell.x, cell.y, 'empty');
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
        }, 2000);
    }
}

function reducePlayerLives() {
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
    document.getElementById('game-over-screen').classList.remove('hidden');
}