
// Score constants
export const SCORE_CONFIG = {
    ENEMY_DEFEATED: 100,
    LEVEL_COMPLETION_BONUS: 1000,
    TIME_BONUS_FACTOR: 10  // Points per second remaining
};

export class ScoreManager {
    constructor() {
      this.currentScore = 0;
      this.scoreDisplay = document.getElementById('score');
      this.finalScoreDisplays = document.querySelectorAll('#final-score');
    }
  
    // Add points to the score
    addPoints(points) {
      this.currentScore += points;
      this.updateScoreDisplay();
    }
  
    // Update all score displays
    updateScoreDisplay() {
      this.scoreDisplay.textContent = this.currentScore;
      this.finalScoreDisplays.forEach(display => {
        display.textContent = this.currentScore;
      });
    }
  
    // Calculate and add time bonus
    addTimeBonus(timeTaken) {
      const timeBonus = Math.floor((3000/timeTaken) * SCORE_CONFIG.TIME_BONUS_FACTOR);
      this.addPoints(timeBonus);
      return timeBonus;
    }
  
    // Reset score
    reset() {
      this.currentScore = 0;
      this.updateScoreDisplay();
    }
}

// Create a single instance of ScoreManager
export const scoreManager = new ScoreManager();
  