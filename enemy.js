// enemy.js
export class Enemy {
    constructor(x, y) {
        this.position = { x, y };
        this.element = this.createEnemyElement();
        this.cellSize = 0;
        this.isMoving = false;
        this.path = [];      // Array of target cell positions
        this.stepIndex = 0;  // Current index in the path
        this.moveDuration = 500; // Duration (ms) to move between cells
        this.moveStartTime = 0;  // Timestamp when the current move started
        this.movingFrom = { x, y }; // Starting cell for current move
        this.movingTo = null;       // Target cell for current move
        this.initialize();
    }

    createEnemyElement() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.cssText = `
            position: absolute;
            background-image: url('./images/enemy.png');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            pointer-events: none;
            transition: none;
            width: 100%;
            height: 100%;
            z-index: 2;
        `;
        return enemy;
    }

    initialize() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;

        const cell = gameBoard.querySelector('.cell');
        if (cell) {
            const rect = cell.getBoundingClientRect();
            this.cellSize = rect.width;
            this.element.style.width = this.cellSize + 'px';
            this.element.style.height = this.cellSize + 'px';
        }

        // Set initial position
        this.updatePosition(this.position.x, this.position.y);
        gameBoard.appendChild(this.element);
    }

    startMoving(path) {
        if (!path || path.length === 0) return;
        this.isMoving = true;
        this.path = path;
        this.stepIndex = 0;
        // Start the first move immediately
        this.startNextMove();
    }

    startNextMove() {
        if (this.stepIndex >= this.path.length) {
            this.isMoving = false;
            this.movingTo = null;
            return;
        }
        // Set the starting point as the current logical position
        this.movingFrom = { ...this.position };
        // The next cell in the path becomes the target
        this.movingTo = this.path[this.stepIndex];
        // Record the start time of this move
        this.moveStartTime = performance.now();
    }

    moveStep(currentTime) {
        if (!this.isMoving || !this.movingTo) return;
        
        // Calculate how far we are into the move
        const elapsed = currentTime - this.moveStartTime;
        const progress = Math.min(elapsed / this.moveDuration, 1);
        
        // Interpolate between starting position and target cell
        const newX = this.movingFrom.x + (this.movingTo.x - this.movingFrom.x) * progress;
        const newY = this.movingFrom.y + (this.movingTo.y - this.movingFrom.y) * progress;
        
        // Update the enemy's position visually
        const translateX = newX * this.cellSize;
        const translateY = newY * this.cellSize;
        this.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
        
        // If we've reached the target cell, finish this step and start the next
        if (progress === 1) {
            // Update the logical position to the target cell
            this.position = { ...this.movingTo };
            this.stepIndex++;
            this.startNextMove();
        }
    }

    updatePosition(x, y) {
        const translateX = x * this.cellSize;
        const translateY = y * this.cellSize;
        this.element.style.transform = `translate(${translateX}px, ${translateY}px)`;
    }

    remove() {
        this.element.remove();
    }
}
