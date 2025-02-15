import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import { reducePlayerLives } from "./bombPlacement.js";

export function spawnEnemies(numEnemies) {
    const enemies = [];
    for (let i = 0; i < numEnemies; i++) {
        let x, y;
        // Keep trying until we find a valid position
        do {
            x = Math.floor(Math.random() * (gameBoard.width - 2)) + 1;
            y = Math.floor(Math.random() * (gameBoard.height - 2)) + 1;
        } while (
            !gameBoard.isWalkable(x, y) ||
            isNearPlayer(x, y) ||
            isNearOtherEnemy(x, y, enemies)
        );

        // Create enemy object
        const enemy = {
            x,
            y,
            element: document.createElement("div")
        };
        enemy.element.classList.add("enemy");
        updateEnemyPosition(enemy);
        enemies.push(enemy);
    }
    return enemies;
}

function isNearPlayer(x, y) {
    return x <= 2 && y <= 2;
}

function isNearOtherEnemy(x, y, enemies) {
    return enemies.some(enemy =>
        Math.abs(enemy.x - x) < 2 &&
        Math.abs(enemy.y - y) < 2
    );
}

function updateEnemyPosition(enemy) {
    // Find the enemy's previous position and remove it
    const prevCell = document.querySelector(`.enemy-container[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
    if (prevCell) {
        prevCell.remove();
    }

    // Get the new cell for the enemy
    const cell = document.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
    if (cell) {
        // Create and add the new enemy container
        const enemyContainer = document.createElement("div");
        enemyContainer.classList.add("enemy-container");
        enemyContainer.setAttribute("data-x", enemy.x); // Store x position
        enemyContainer.setAttribute("data-y", enemy.y); // Store y position

        enemy.element.style.width = "100%";
        enemy.element.style.height = "100%";
        enemyContainer.appendChild(enemy.element);
        cell.appendChild(enemyContainer);
    }
}

export function moveEnemies(enemies, isPaused) {
    if (isPaused) return;
    
    cleanupEnemies();

    // Set up continuous collision detection
    window.collisionCheckInterval = setInterval(() => {
        checkAllEnemiesCollision(enemies);
    }, 1); // Check every 1ms for more responsive collision detection

    // Regular enemy movement
    window.enemyMoveInterval = setInterval(() => {
        enemies.forEach((enemy, index) => {
            // Check if the enemy still exists in the DOM
            if (!document.contains(enemy.element)) {
                enemies.splice(index, 1);
                return;
            }

            const validMoves = getValidMoves(enemy, enemies);
            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                enemy.x = move.x;
                enemy.y = move.y;
                updateEnemyPosition(enemy);
            }
        });
    }, 1000);
}

function checkAllEnemiesCollision(enemies) {
    if (!enemies || enemies.length === 0) return
    
    enemies.forEach(enemy => {
        // Get current player position from DOM
        const playerElement = document.querySelector('.player');
        if (!playerElement) return;

        // Get player coordinates from the cell containing the player
        const playerCell = playerElement.closest('.cell');
        if (!playerCell) return;

        const playerX = parseInt(playerCell.getAttribute('data-x'));
        const playerY = parseInt(playerCell.getAttribute('data-y'));

        // Check if enemy and player coordinates match
        if (enemy.x === playerX && enemy.y === playerY) {
            handleCollision();
        }
    });
}

function handleCollision() {
    // Remove player class from ALL cells to ensure no duplicate players
    const allCells = document.querySelectorAll('.cell');
    allCells.forEach(cell => {
        cell.classList.remove('player');
    });

    // Update player position to start
    gameController.updatePlayerPosition(1, 1);

    // Reduce lives
    reducePlayerLives();
}

function getValidMoves(enemy, allEnemies) {
    const directions = [
        { x: 1, y: 0 },  // Right
        { x: -1, y: 0 }, // Left
        { x: 0, y: 1 },  // Down
        { x: 0, y: -1 }  // Up
    ];

    return directions
        .map(dir => ({
            x: enemy.x + dir.x,
            y: enemy.y + dir.y
        }))
        .filter(pos =>
            pos.x > 0 &&
            pos.x < gameBoard.width - 1 &&
            pos.y > 0 &&
            pos.y < gameBoard.height - 1 &&
            gameBoard.isWalkable(pos.x, pos.y) &&
            !isPositionOccupiedByEnemy(pos, allEnemies, enemy)
        );
}

function isPositionOccupiedByEnemy(position, enemies, currentEnemy) {
    return enemies.some(enemy =>
        enemy !== currentEnemy &&
        enemy.x === position.x &&
        enemy.y === position.y
    );
}

export function cleanupEnemies() {
    if (window.enemyMoveInterval) {
        clearInterval(window.enemyMoveInterval);
        window.enemyMoveInterval = null;
    }

    if (window.collisionCheckInterval) {
        clearInterval(window.collisionCheckInterval);
        window.collisionCheckInterval = null;
    }
}
