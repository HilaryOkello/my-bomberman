// enemy.js
import { LEVEL_CONFIG } from "./level.js";

export class Enemy {
    constructor() {
        this.position = { x: 0, y: 0 };
        this.element = this.createEnemyElement();
        this.cellSize = 30;
        this.isMoving = false;
        this.path = [];
        this.stepIndex = 0;
        this.moveStartTime = 0;
        this.movingFrom = { x: 0, y: 0 };
        this.movingTo = null;
        this.active = false;
        this.initialize();
        this.moveDuration =LEVEL_CONFIG[1].enemySpeed
    }

    setSpeed(levelNumber) {
        this.moveDuration = LEVEL_CONFIG[levelNumber].enemySpeed;
    }   

    createEnemyElement() {
        const enemy = document.createElement('div');
        enemy.className = 'enemy';
        enemy.style.visibility = 'hidden'; // Start hidden
        return enemy;
    }

    initialize() {
        const gameBoard = document.getElementById('game-board');
        if (!gameBoard) return;
        gameBoard.appendChild(this.element);
    }

    activate(x, y) {
        this.position = { x, y };
        this.updatePosition(x, y);
        this.show();
        this.active = true;
        this.isMoving = false;
        this.path = [];
        this.stepIndex = 0;
    }

    deactivate() {
        this.hide();
        this.active = false;
        this.isMoving = false;
        this.path = [];
    }

    show() {
        this.element.style.visibility = 'visible';
    }

    hide() {
        this.element.style.visibility = 'hidden';
    }

    // Modified remove to just hide instead of removing from DOM
    remove() {
        this.deactivate();
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
}
