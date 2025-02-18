import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import {checkAllEnemiesCollision, updateEnemyPosition, updateEnemy } from "./enemyPlacement.js"

// Add this to script.js
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

  // Render game state
  renderGame();

  requestAnimationFrame(gameLoop);
}

function updateGame() {
  // Update enemy positions
  if (gameController.enemies) {
    gameController.enemies.forEach(enemy => {
      updateEnemy(enemy);
    });
  }

  // Check for collisions
  checkAllEnemiesCollision(gameController.enemies);
}

function renderGame() {
  // Update visual positions of enemies
  if (gameController.enemies) {
    gameController.enemies.forEach(enemy => {
      updateEnemyPosition(enemy);
    });
  }
}
  // Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  gameBoard.initializeBoard();
  requestAnimationFrame(gameLoop);
});
