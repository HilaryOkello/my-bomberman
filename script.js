import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import { checkAllEnemiesCollision, updateEnemy } from "./enemyPlacement.js";
import { playBackgroundMusic } from "./soundManager.js";

let lastRenderTime = 0;
const FRAME_TIME = 1000 / 60; // Target 60 FPS
let accumulatedTime = 0;

function gameLoop(currentTime) {
  if (!gameController.isPlaying || gameController.isPaused) {
    requestAnimationFrame(gameLoop);
    return;
  }

  const deltaTime = currentTime - lastRenderTime;
  lastRenderTime = currentTime;
  accumulatedTime += deltaTime;

  // Update game state
  while (accumulatedTime >= FRAME_TIME) {
    updateGame();
    accumulatedTime -= FRAME_TIME;
  }

  requestAnimationFrame(gameLoop);
}

function updateGame() {
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

  // Check for collisions
  checkAllEnemiesCollision(gameController.enemies);
}

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  gameBoard.initializeBoard();
  requestAnimationFrame(gameLoop);
});