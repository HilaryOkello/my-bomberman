// Constants for board dimensions
const BOARD_WIDTH = 17;
const BOARD_HEIGHT = 13;


// 
class GameBoard {
    constructor() {
        this.width = BOARD_WIDTH;
        this.height = BOARD_HEIGHT;
        this.board = [];
        this.gameElement = document.getElementById('game-board');
    }

    initializeBoard() {
        // Create a document fragment to batch DOM operations
        const fragment = document.createDocumentFragment();
        this.gameElement.innerHTML = '';
        this.board = [];

        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                let cellType = this.determineInitialCellType(x, y);
                let isWalkable = cellType === 'empty';
                row.push({ type: cellType, walkable: isWalkable });

                const cell = document.createElement('div');
                cell.className = `cell ${cellType}`;
                cell.dataset.x = x;
                cell.dataset.y = y;
                fragment.appendChild(cell);
            }
            this.board.push(row);
        }

        // Single DOM update
        this.gameElement.appendChild(fragment);
    }

    determineInitialCellType(x, y) {
        // Border walls
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            return 'wall';
        }

        // Fixed walls in a grid pattern (every 2 cells)
        if (x % 2 === 0 && y % 2 === 0) {
            return 'wall';
        }

        // Safe zones for players in corners
        if (this.isPlayerSafeZone(x, y)) {
            return 'empty';
        }

        // Random breakable walls (40% chance)
        if (Math.random() < 0.4) {
            return 'breakable';
        }

        return 'empty';
    }

    isPlayerSafeZone(x, y) {
        // Top-left corner (player 1)
        if (x <= 2 && y <= 2) return true;

        // Top-right corner (player 2)
        if (x >= this.width - 3 && y <= 2) return true;

        // Bottom-left corner (player 3)
        if (x <= 2 && y >= this.height - 3) return true;

        // Bottom-right corner (player 4)
        if (x >= this.width - 3 && y >= this.height - 3) return true;

        return false;
    }

    // createCell(x, y, type) {
    //     const cell = document.createElement('div');
    //     cell.className = `cell ${type}`;
    //     cell.dataset.x = x;
    //     cell.dataset.y = y;
    //     this.gameElement.appendChild(cell);
    // }

    getCellAt(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.board[y][x];
        }
        return null;
    }

    updateCell(x, y, newType) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            // this.board[y][x] = newType;
            let isWalkable = newType == 'empty';
            this.board[y][x] = { type: newType, walkable: isWalkable };

            // const cellElement = this.gameElement.children[y * this.width + x];
            // cellElement.className = `cell ${newType}`;
            const cellElement = document.querySelector(`[data-x="${x}"][data-y="${y}"]`);
            if (cellElement) {
                cellElement.className = `cell ${newType}`;
            }
        }
    }

    // Helper method to check if a cell is walkable
    // isWalkable(x, y) {
    //     const cellType = this.getCellAt(x, y);
    //     return cellType === 'empty';
    // }
    isWalkable(x, y) {
        return this.board[y] && this.board[y][x] && this.board[y][x].walkable;
    }
}

// Create and export game board instance
const gameBoard = new GameBoard();
export default gameBoard;