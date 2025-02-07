import gameBoard from './gameBoard.js';
import gameController from './activatePlayer.js';

// Initialize when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize the game board
    gameBoard.initializeBoard();
    
    // Set up event listeners for gameplay
    document.addEventListener('keydown', (event) => {
        if (gameController.isPlaying && !gameController.isPaused) {
            // Handle gameplay controls
            switch(event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                case 'ArrowLeft':
                case 'ArrowRight':
                    // Handle movement
                    break;
                case ' ':
                    // Handle bomb placement
                    break;
            }
        }
    });
});
