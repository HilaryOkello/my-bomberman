import gameBoard from "./gameBoard.js";

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
    const cell = document.querySelector(`[data-x="${enemy.x}"][data-y="${enemy.y}"]`);
    if (cell) {
        // First, remove enemy from its current position if it exists
        const existingEnemy = document.querySelector('.enemy-container');
        if (existingEnemy) {
            existingEnemy.remove();
        }

        // Create and add the new enemy container
        const enemyContainer = document.createElement("div");
        enemyContainer.classList.add("enemy-container");
        enemy.element.style.width = "100%";
        enemy.element.style.height = "100%";
        enemyContainer.appendChild(enemy.element);
        cell.appendChild(enemyContainer);
    }
}

export function moveEnemies(enemies, player, reduceLives) {
    cleanupEnemies();

    window.enemyMoveInterval = setInterval(() => {
        enemies.forEach((enemy) => {
            const validMoves = getValidMoves(enemy, enemies);
            if (validMoves.length > 0) {
                const move = validMoves[Math.floor(Math.random() * validMoves.length)];
                enemy.x = move.x;
                enemy.y = move.y;
                updateEnemyPosition(enemy);
                
                if (enemy.x === player.x && enemy.y === player.y) {
                    reduceLives();
                }
            }
        });
    }, 1000);
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
}
