// enemyPlacement.js
import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import { Enemy } from './enemy.js';
import { reducePlayerLives } from "./bombPlacement.js";
import { CELL_TYPES } from './state.js';

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

export function updateEnemy(enemy) {
    if (!enemy.isMoving) {
        const path = getMovementPath(enemy, gameController.enemies, 3);
        enemy.startMoving(path);
    }
}

function isCellInExplosionRange(x, y) {
    // Check if there's a bomb in adjacent cells
    const checkPositions = [
        { x, y }, // Current position
        { x: x + 1, y }, // Right
        { x: x - 1, y }, // Left
        { x, y: y + 1 }, // Down
        { x, y: y - 1 }  // Up
    ];

    return checkPositions.some(pos => 
        gameBoard.boardState.getCellType(pos.x, pos.y) === CELL_TYPES.BOMB
    );
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
        .filter(pos => {
            // Basic movement validation
            const isValidBasicMove = 
                !(pos.x === 1 && pos.y === 1) &&
                pos.x > 0 &&
                pos.x < gameBoard.width - 1 &&
                pos.y > 0 &&
                pos.y < gameBoard.height - 1 &&
                gameBoard.isWalkable(pos.x, pos.y);

            // Check for other enemies
            const noEnemyCollision = !allEnemies.some(other =>
                other !== enemy &&
                other.destination &&
                other.destination.x === pos.x &&
                other.destination.y === pos.y
            ) && !isPositionOccupiedByEnemy(pos, allEnemies, enemy);

            return isValidBasicMove && noEnemyCollision;
        });
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
    let currentPos = { x: enemy.position.x, y: enemy.position.y };

    // Check if current position is in danger
    const inDanger = isCellInExplosionRange(currentPos.x, currentPos.y);
    const playerPos = gameController.player.position;

    for (let i = 0; i < steps; i++) {
        const validMoves = getValidMoves({ position: currentPos }, allEnemies);
        if (validMoves.length > 0) {
            let bestMove;
            
            if (inDanger) {
                // If in danger, prioritize moves away from bombs
                bestMove = getBestSafeMove(validMoves, currentPos);
            } else {
                // If safe, choose between following player and random movement
                bestMove = getBestMoveTowardsPlayer(validMoves, playerPos);
            }

            if (bestMove) {
                path.push(bestMove);
                currentPos = bestMove;
            }
        } else {
            break;
        }
    }

    return path;
}

function getBestSafeMove(validMoves, currentPos) {
    // Filter out moves that would put the enemy in explosion range
    const safeMoves = validMoves.filter(move => 
        !isCellInExplosionRange(move.x, move.y)
    );

    if (safeMoves.length > 0) {
        // Randomly select from safe moves
        return safeMoves[Math.floor(Math.random() * safeMoves.length)];
    }

    // If no safe moves available, use any valid move
    return validMoves[Math.floor(Math.random() * validMoves.length)];
}

function getBestMoveTowardsPlayer(validMoves, playerPos) {
    // Calculate distances to player
    const movesWithDistance = validMoves.map(move => {
        const distance = Math.sqrt(
            Math.pow(move.x - playerPos.x, 2) +
            Math.pow(move.y - playerPos.y, 2)
        );
        return { move, distance };
    });

    // Sort by distance (closest first)
    movesWithDistance.sort((a, b) => a.distance - b.distance);

    // 70% chance to move towards player, 30% chance for random movement
    if (Math.random() < 0.7 && !isCellInExplosionRange(playerPos.x, playerPos.y)) {
        return movesWithDistance[0].move;
    } else {
        // Random move from valid options
        return validMoves[Math.floor(Math.random() * validMoves.length)];
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
    gameController.player.resetToStart();
    reducePlayerLives();
}