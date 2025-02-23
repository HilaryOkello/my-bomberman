// gameBoard.js
import { BoardState, CELL_TYPES } from './state.js';
import { Player } from './player.js';
import { Enemy } from './enemy.js';

const BOARD_WIDTH = 17;
const BOARD_HEIGHT = 13;
const MAX_ENEMIES = 5;

class GameBoard {
    constructor() {
        this.width = BOARD_WIDTH;
        this.height = BOARD_HEIGHT;
        this.boardState = new BoardState(BOARD_WIDTH, BOARD_HEIGHT);
        this.gameElement = document.getElementById('game-board');
        this.player = null;
        this.enemyPool = [];
    }

    initializeBoard() {
        // Initialize the board state
        this.boardState.initialize();

        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        this.gameElement.innerHTML = '';

        // Create visual representation
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellType = this.boardState.getCellType(x, y);
                const cell = document.createElement('div');
                cell.className = `cell ${this.getCellClassName(cellType)}`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                fragment.appendChild(cell);
            }
        }

        // Set relative positioning for absolute children
        this.gameElement.style.position = 'relative';

        // Initialize player
        this.initializePlayer();

        // Initialize enemy pool
        this.initializeEnemyPool();

        // Initialize bomb and explosion elements
        this.initializeExplosionElements();

        // Single DOM update
        this.gameElement.appendChild(fragment);
    }

    initializePlayer() {
        this.player = new Player();
        this.player.hide(); // Start hidden
        this.gameElement.appendChild(this.player.element);
    }

    initializeEnemyPool() {
        for (let i = 0; i < MAX_ENEMIES; i++) {
            const enemy = new Enemy();
            enemy.hide(); // Start hidden
            this.gameElement.appendChild(enemy.element);
            this.enemyPool.push(enemy);
        }
    }
    initializeExplosionElements() {
        this.bombElement = document.createElement('div');
        this.bombElement.className = 'bomb';
        this.bombElement.style.position = 'absolute';
        this.bombElement.style.visibility = 'hidden';
        this.gameElement.appendChild(this.bombElement);

        this.explosionElements = ['center', 'right', 'left', 'up', 'down'].map(type => {
            const explosion = document.createElement('div');
            explosion.className = `explosion explosion-${type}`; // Add type-specific class
            explosion.style.position = 'absolute';
            explosion.style.width = '30px';
            explosion.style.height = '30px';
            explosion.style.display = 'none'; // Use display instead of visibility
            this.gameElement.appendChild(explosion);
            return explosion;
        });
    }

    resetBoard() {
        // Reset board state - this creates a new grid automatically
        this.boardState = new BoardState(this.width, this.height);
        this.boardState.initialize();

        // Store cell elements in a map for quick lookup
        const cellElements = new Map();

        // Get all existing cells and store them in the map
        this.gameElement.querySelectorAll('.cell').forEach(cell => {
            const x = parseInt(cell.dataset.x);
            const y = parseInt(cell.dataset.y);
            cellElements.set(`${x},${y}`, cell);
        });

        // Update only the visual representation
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellType = this.boardState.getCellType(x, y);
                const key = `${x},${y}`;
                const existingCell = cellElements.get(key);

                // Update cell classes efficiently
                const newClassName = `cell ${this.getCellClassName(cellType)}`;
                if (existingCell.className !== newClassName) {
                    existingCell.className = newClassName;
                }
            }
        }

        // Clear any active bombs or explosions
        if (this.bombElement) {
            this.bombElement.style.visibility = 'hidden';
        }
        if (this.explosionElements) {
            this.explosionElements.forEach(elem => {
                elem.style.display = 'none';
                elem.classList.remove('active');
            });
        }
    }

    activatePlayer() {
        this.player.updatePosition(1, 1);
        this.player.show();
        return this.player;
    }

    spawnEnemies(numEnemies) {
        const activeEnemies = [];

        for (let i = 0; i < numEnemies && i < MAX_ENEMIES; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * (this.width - 2)) + 1;
                y = Math.floor(Math.random() * (this.height - 2)) + 1;
            } while (
                !this.isWalkable(x, y) ||
                this.isNearPlayer(x, y) ||
                this.isNearOtherEnemy(x, y, activeEnemies)
            );

            const enemy = this.enemyPool[i];
            enemy.activate(x, y);
            activeEnemies.push(enemy);
        }

        return activeEnemies;
    }

    deactivateAllEnemies() {
        this.enemyPool.forEach(enemy => enemy.deactivate());
    }

    isNearPlayer(x, y) {
        return x <= 2 && y <= 2;
    }

    isNearOtherEnemy(x, y, activeEnemies) {
        return activeEnemies.some(enemy =>
            Math.abs(enemy.position.x - x) < 2 &&
            Math.abs(enemy.position.y - y) < 2
        );
    }

    // Existing methods...
    getCellClassName(cellType) {
        switch (cellType) {
            case CELL_TYPES.WALL: return 'wall';
            case CELL_TYPES.BREAKABLE: return 'breakable';
            case CELL_TYPES.BOMB: return 'bomb';
            default: return 'empty';
        }
    }

    isWalkable(x, y) {
        return this.boardState.isWalkable(x, y);
    }
}

const gameBoard = new GameBoard();
export default gameBoard;