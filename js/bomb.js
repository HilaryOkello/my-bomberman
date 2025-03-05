// bombPlacement.js
import gameBoard from './board.js';
import gameController from './controller.js';
import { CELL_TYPES } from './state.js';
import { playSound } from './sound.js';

export class Bomb {
    constructor() {
        // Bomb configuration
        this.BOMB_EXPLOSION_TIME = 1000; // 1 second in milliseconds
        this.EXPLOSION_DURATION = 250; // Duration for explosion visuals

        // Bomb state tracking
        this.active = false;
        this.timer = 0;
        this.explosionActive = false;
        this.explosionTimer = 0;
        this.x = 0;
        this.y = 0;
        this.affectedPositions = [];
    }

    place(x, y) {
        // Check if bomb placement is valid
        if (!gameController.isPlaying || gameController.isPaused || this.active) return false;

        // Prevent bomb placement in starting position or on existing bomb
        if ((x === 1 && y === 1) || 
            gameBoard.boardState.getCellType(x, y) === CELL_TYPES.BOMB) {
            return false;
        }

        // Set bomb state
        gameBoard.boardState.setCellType(x, y, CELL_TYPES.BOMB);

        // Position bomb element
        gameBoard.bombElement.style.transform = `translate(${x * 30}px, ${y * 30}px)`;
        gameBoard.bombElement.style.visibility = 'visible';

        // Update bomb tracking
        this.active = true;
        this.timer = 0;
        this.x = x;
        this.y = y;

        return true;
    }

    update(deltaTime) {
        // If no bomb or explosion is active, no need to update
        if (!this.active && !this.explosionActive) return;
        
        // Update active bomb timer
        if (this.active) {
            this.timer += deltaTime;
            if (this.timer >= this.BOMB_EXPLOSION_TIME) {
                this.explode();
            }
        }
        
        // Handle explosion
        if (this.explosionActive) {
            this.explosionTimer += deltaTime;
            if (this.explosionTimer >= this.EXPLOSION_DURATION) {
                this.cleanupExplosion();
            }
        }
    }

    explode() {
        playSound("bombExplodes");
        this.affectedPositions = [
            { x: this.x, y: this.y, type: 'center' },
            { x: this.x + 1, y: this.y, type: 'right' },
            { x: this.x - 1, y: this.y, type: 'left' },
            { x: this.x, y: this.y + 1, type: 'down' },
            { x: this.x, y: this.y - 1, type: 'up' }
        ];

        this.affectedPositions.forEach((pos, index) => {
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
        });

        // Notify game controller about explosion for collision checking
        gameController.handleBombExplosion(this.affectedPositions);

        // Reset bomb state
        this.active = false;
        this.explosionActive = true;
        this.explosionTimer = 0;
        gameBoard.bombElement.style.visibility = 'hidden';
    }

    cleanupExplosion() {
        // Reset the cell type where the bomb was
        gameBoard.boardState.setCellType(this.x, this.y, CELL_TYPES.EMPTY);

        // Hide all explosion elements
        gameBoard.explosionElements.forEach(explosion => {
            explosion.style.display = 'none';
            explosion.classList.remove('active');
        });

        // Reset bomb element
        gameBoard.bombElement.style.visibility = 'hidden';

        // Reset explosion state
        this.explosionActive = false;
        this.explosionTimer = 0;
    }

    // Helper method for game resuming
    resume() {
        // Make sure bomb is visible if it was active when paused
        if (this.active) {
            gameBoard.bombElement.style.visibility = 'visible';
            // Make sure the cell is still marked as a bomb
            gameBoard.boardState.setCellType(this.x, this.y, CELL_TYPES.BOMB);
        }
    }

    // Cleanup method for game restart or game over
    cleanup() {
        // Reset all bomb and explosion states
        if (this.active || this.explosionActive) {
            gameBoard.boardState.setCellType(this.x, this.y, CELL_TYPES.EMPTY);
            gameBoard.bombElement.style.visibility = 'hidden';
            
            // Hide explosion elements
            gameBoard.explosionElements.forEach(explosion => {
                explosion.style.display = 'none';
                explosion.classList.remove('active');
            });
        }

        // Reset all states
        this.active = false;
        this.explosionActive = false;
        this.timer = 0;
        this.explosionTimer = 0;
        this.x = 0;
        this.y = 0;
    }
}

// Create a singleton instance
export const bomb = new Bomb();

// Export bomb placement function
export function placeBomb() {
    const bombX = gameController.player.position.x;
    const bombY = gameController.player.position.y;

    return bomb.place(bombX, bombY);
}

// These functions are now handled within the Bomb class
export function updateBombs(deltaTime) {
    bomb.update(deltaTime);
}

export function resumeGame() {
    bomb.resume();
}