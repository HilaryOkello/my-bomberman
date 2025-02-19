// enemyPlacement.js
import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import { Enemy } from './enemy.js';
import { reducePlayerLives } from "./bombPlacement.js";

export function spawnEnemies(numEnemies) {
    const enemies = [];
    for (let i = 0; i < numEnemies; i++) {
        let x, y;
        do {
            x = Math.floor(Math.random() * (gameBoard.width - 2)) + 1;
            y = Math.floor(Math.random() * (gameBoard.height - 2)) + 1;
        } while (
            !gameBoard.isWalkable(x, y) ||
            isNearPlayer(x, y) ||
            isNearOtherEnemy(x, y, enemies)
        );

        enemies.push(new Enemy(x, y));
    }
    return enemies;
}

function isNearPlayer(x, y) {
    return x <= 2 && y <= 2;
}

function isNearOtherEnemy(x, y, enemies) {
    return enemies.some(enemy =>
        Math.abs(enemy.position.x - x) < 2 &&
        Math.abs(enemy.position.y - y) < 2
    );
}

export function updateEnemy(enemy) {
    if (!enemy.isMoving) {
        const path = getMovementPath(enemy, gameController.enemies, 5);
        enemy.startMoving(path);
    }
}

export function checkAllEnemiesCollision(enemies) {
    if (!enemies || enemies.length === 0) return;

    enemies.forEach(enemy => {
        if (enemy.position.x === gameController.player.position.x &&
            enemy.position.y === gameController.player.position.y) {
            handleCollision();
        }
    });
}

function handleCollision() {
    gameController.updatePlayerPosition(1, 1);
    reducePlayerLives();
}

function getValidMoves(enemy, allEnemies) {
    const directions = [
        { x: 1, y: 0 },
        { x: -1, y: 0 },
        { x: 0, y: 1 },
        { x: 0, y: -1 }
    ];

    return directions
        .map(dir => ({
            x: enemy.position.x + dir.x,
            y: enemy.position.y + dir.y
        }))
        .filter(pos =>
            !(pos.x === 1 && pos.y === 1) &&
            pos.x > 0 &&
            pos.x < gameBoard.width - 1 &&
            pos.y > 0 &&
            pos.y < gameBoard.height - 1 &&
            gameBoard.isWalkable(pos.x, pos.y) &&
            // Prevent moving into a cell reserved by another enemy
            !allEnemies.some(other =>
                other !== enemy &&
                other.destination &&
                other.destination.x === pos.x &&
                other.destination.y === pos.y
            ) &&
            // Existing check for enemy overlap on the board
            !isPositionOccupiedByEnemy(pos, allEnemies, enemy)
        );
}

function isPositionOccupiedByEnemy(position, enemies, currentEnemy) {
    return enemies.some(enemy =>
        enemy !== currentEnemy &&
        enemy.position.x === position.x &&
        enemy.position.y === position.y
    );
}

function getMovementPath(enemy, allEnemies, steps) {
    let path = [];
    let tempX = enemy.position.x;
    let tempY = enemy.position.y;

    for (let i = 0; i < steps; i++) {
        const validMoves = getValidMoves({ position: { x: tempX, y: tempY } }, allEnemies);
        if (validMoves.length > 0) {
            const move = validMoves[Math.floor(Math.random() * validMoves.length)];
            path.push(move);
            tempX = move.x;
            tempY = move.y;
        } else {
            break;
        }
    }

    return path;
}
