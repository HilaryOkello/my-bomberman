import gameController from './activatePlayer.js';
import gameBoard from './gameBoard.js';

export function placeBomb() {
    if (!gameController.isPlaying || gameController.isPaused) {
        console.warn('Game is not active. Cannot place bomb.');
        return;
    }

    const bombX = gameController.playerPosition.row;
    const bombY = gameController.playerPosition.col;

    console.log('Placing bomb at:', bombX, bombY); // Debugging
    const bombCell = document.querySelector(`[data-x="${bombX}"][data-y="${bombY}"]`);

    if (!bombCell || bombCell.classList.contains('bomb')) return;

    bombCell.classList.add('bomb');

    setTimeout(() => explodeBomb(bombX, bombY), 3000);
}

function explodeBomb(x, y) {
    const explosionCells = [
        { x: x, y: y }, // Center explosion
        { x: x + 1, y: y }, // Right
        { x: x - 1, y: y }, // Left
        { x: x, y: y + 1 }, // Down
        { x: x, y: y - 1 }  // Up
    ];

    explosionCells.forEach(cell => {
        const cellType = gameBoard.getCellAt(cell.x, cell.y);
        if (!cellType) return;

        const targetCell = document.querySelector(`[data-x="${cell.x}"][data-y="${cell.y}"]`);
        if (!targetCell) return;

        if (targetCell.classList.contains('breakable')) {
            targetCell.classList.remove('breakable');
            targetCell.classList.add('explosion');

            setTimeout(() => {
                targetCell.classList.remove('explosion');
                targetCell.classList.add('empty');

                gameBoard.updateCell(cell.x, cell.y, 'empty');
            }, 500);
        }

        if (targetCell.classList.contains('player')) {
            reducePlayerLives();
        }
    });

    // Handle bomb explosion and animation
    const bombCell = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
    if (bombCell) {
        bombCell.classList.remove('bomb');
        bombCell.classList.add('explosion');

        setTimeout(() => {
            bombCell.classList.remove('explosion');
            bombCell.classList.add('empty');
            gameBoard.updateCell(x, y, 'empty');
        }, 500);
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