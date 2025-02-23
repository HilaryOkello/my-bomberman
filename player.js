import gameBoard from "./gameBoard.js";
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
        player.style.visibility = 'hidden'; // Start hidden
        return player;
    }

    initialize() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        // Set initial position
        this.updatePosition(this.position.x, this.position.y);

        // Add player element to the board
        gameBoard.style.position = 'relative';
        gameBoard.appendChild(this.element);
    }

    show() {
        this.element.style.visibility = 'visible';
    }

    hide() {
        this.element.style.visibility = 'hidden';
    }

    // Other methods remain the same
    updatePosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        const translateX = x * this.cellSize;
        const translateY = y * this.cellSize;
        this.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    // Modify remove to just hide instead of removing from DOM
    remove() {
        this.hide();
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
        return gameBoard.boardState.isWalkable(newPos.x, newPos.y);
    }

    getCurrentCell() {
        return document.querySelector(
            `[data-x="${this.position.x}"][data-y="${this.position.y}"]`
        );
    }

    resetToStart() {
        this.updatePosition(1, 1);
    }
}