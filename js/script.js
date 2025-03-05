// Modify script.js
import gameBoard from "./board.js";
import gameController from "./controller.js";
import { checkAllEnemiesCollision, updateEnemy } from "./enemyPlacement.js";
import { bomb } from "./bomb.js"; 

let lastRenderTime = 0;
const FRAME_TIME = 1000 / 60; // Target 60 FPS
let accumulatedTime = 0;

function gameLoop(currentTime) {
  // reset the board when restarting the game or moving to the next level
  if (gameController.pendingBoardReset) {
    console.log("Resetting board");
    gameBoard.resetBoard();
    gameController.pendingBoardReset = false;
    bomb.cleanup();
  }

  // If the game is not playing or is paused, skip updating the game state
  if (!gameController.isPlaying || gameController.isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  let deltaTime = currentTime - lastRenderTime;
  if (deltaTime > 500) deltaTime = 16;
  lastRenderTime = currentTime;
  accumulatedTime += deltaTime;

  // Update the game state
  while (accumulatedTime >= FRAME_TIME) {
    updateGame(FRAME_TIME);
    accumulatedTime -= FRAME_TIME;
  }

  requestAnimationFrame(gameLoop);
}

function updateGame(deltaTime) {
  const currentTime = performance.now();

  // Update enemy positions
  if (gameController.enemies) {
    gameController.enemies.forEach(enemy => {
      if (enemy.isMoving) {
        enemy.moveStep(currentTime); // Move one step if delay passed
      } else {
        updateEnemy(enemy); // Generate new path if not moving
      }
    });
  }

  // Update bombs (new line)
  bomb.update(deltaTime);

  // Check for collisions
  checkAllEnemiesCollision(gameController.enemies);
}

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  gameBoard.initializeBoard();
  requestAnimationFrame(gameLoop);
});