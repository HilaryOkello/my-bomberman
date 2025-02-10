import gameBoard from "./gameBoard.js";
import gameController from "./activatePlayer.js";
import { placeBomb } from "./bombPlacement.js";

// Initialize when the DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
    gameBoard.initializeBoard();
  
    document.addEventListener("keydown", (event) => {
      if (gameController.isPlaying && !gameController.isPaused) {
        switch (event.key) {
          case "ArrowUp":
          case "ArrowDown":
          case "ArrowLeft":
          case "ArrowRight":
            // Handle movement
            break;
          case " ":
            placeBomb(); 
            break;
        }
      }
    });
  });
  
