// boardState.js

export const CELL_TYPES = {
    EMPTY: 0,
    WALL: 1,
    BREAKABLE: 2,
    BOMB: 3
};

export class BoardState {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.grid = new Uint8Array(width * height); // Use typed array for better performance
    }

    // Get cell type at position
    getCellType(x, y) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            return this.grid[y * this.width + x];
        }
        return null;
    }

    // Set cell type at position
    setCellType(x, y, type) {
        if (x >= 0 && x < this.width && y >= 0 && y < this.height) {
            this.grid[y * this.width + x] = type;
        }
    }

    // Check if a cell is walkable
    isWalkable(x, y) {
        const type = this.getCellType(x, y);
        return type === CELL_TYPES.EMPTY;
    }

    // Initialize the board state
    initialize() {
        for (let y = 0; y < this.height; y++) {
            for (let x = 0; x < this.width; x++) {
                const cellType = this.determineInitialCellType(x, y);
                this.setCellType(x, y, cellType);
            }
        }
    }

    determineInitialCellType(x, y) {
        // Border walls
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            return CELL_TYPES.WALL;
        }

        // Fixed walls in a grid pattern
        if (x % 2 === 0 && y % 2 === 0) {
            return CELL_TYPES.WALL;
        }

        // Safe zones for players
        if (this.isPlayerSafeZone(x, y)) {
            return CELL_TYPES.EMPTY;
        }

        // Random breakable walls (40% chance)
        if (Math.random() < 0.4) {
            return CELL_TYPES.BREAKABLE;
        }

        return CELL_TYPES.EMPTY;
    }

    isPlayerSafeZone(x, y) {
        // Top-left corner (player 1)
        if (x <= 2 && y <= 2) return true;
        // Add other safe zones as needed
        return false;
    }
}