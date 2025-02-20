// player.js
export class Player {
    constructor() {
        this.position = { x: 1, y: 1 };
        this.element = this.createPlayerElement();
        this.cellSize = 30;
        this.initialize();
    }

    createPlayerElement() {
        const player = document.createElement('div');
        player.id = 'player';
        return player;
    }

    initialize() {
        // Get the game board and append the player
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        // Set initial position
        this.updatePosition(this.position.x, this.position.y);

        // Add player element to the board
        gameBoard.style.position = 'relative';
        gameBoard.appendChild(this.element);
    }

    updatePosition(x, y) {
        // Update internal position
        this.position.x = x;
        this.position.y = y;

        // Update visual position using transform
        const translateX = x * this.cellSize;
        const translateY = y * this.cellSize;
        this.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    move(direction) {
        const movements = {
            'ArrowUp': { x: 0, y: -1 },
            'ArrowDown': { x: 0, y: 1 },
            'ArrowLeft': { x: -1, y: 0 },
            'ArrowRight': { x: 1, y: 0 }
        };

        if (!movements[direction]) return;

        const newPos = {
            x: this.position.x + movements[direction].x,
            y: this.position.y + movements[direction].y
        };

        // Check if the new position is valid
        if (this.isValidMove(newPos)) {
            this.updatePosition(newPos.x, newPos.y);
            return true;
        }

        return false;
    }

    isValidMove(newPos) {
        // Get the cell at the new position
        const targetCell = document.querySelector(
            `[data-x="${newPos.x}"][data-y="${newPos.y}"]`
        );

        if (!targetCell) return false;

        // Check if the cell is walkable
        return !targetCell.classList.contains('wall') &&
            !targetCell.classList.contains('breakable');
    }

    getCurrentCell() {
        return document.querySelector(
            `[data-x="${this.position.x}"][data-y="${this.position.y}"]`
        );
    }

    resetToStart() {
        this.updatePosition(1, 1);
    }
    remove() {
        this.element.remove();
    }
}