# make-your-game

Bomberman is a classic arcade-style game that combines fast-paced action with strategic gameplay. Players navigate through a gid, strategically placing bombs to destroy obstacles and eliminate enemies while carefully avoiding their own explosions.

## Features
- **High-Performance Gameplay:** Runs at a steady `50-60` FPS using requestAnimationFrame.
- **Pause Menu:** Includes options to:
    * Continue
    * Restart
- **Score Board:** Displays the following metrics:
    * **Timer:** Shows remaining game time or elapsed time
    * **Score:** Displays the player's points.
    * **Lives:** Tracks remaining lives.
    * **Smooth Animations:** No `janky` or `stuttering movements` holding a key results in continuous actions.

## Gameplay
A strategic, grid-based action game where players control Bomberman on a fixed, non-scrolling screen. Movement is restricted to horizontal and vertical paths within a 17x13 grid. Players drop bombs that explode in timed intervals, creating chain reactions and destroying walls and enemies. The game revolves around using bomb blasts strategically to clear obstacles and trap opponents. Bomb explosions trigger adjacent bombs, creating powerful chain reactions. Players must avoid their own explosions while using bombs to eliminate enemies. Some walls are destructible, revealing new paths and power-up items that grant special abilities, altering tactics and gameplay dynamics.

## Game Rules:
- The player can move in four directions.
- Bombs explode after a few seconds, destroying nearby `obstacles` and `enemies`.
- Power-ups may appear after explosions.
- The game ends when the player runs out of lives or completes the level.

## Controls
Arrow Keys: Move the player `up`, `down`, `left`, or `right`.
- **Spacebar:** Drop a bomb.
- **P Key:** Pause and Resume the game.

## Installation
1. Clone the repository:

```sh
git clone https://learn.zone01kisumu.ke/git/hilaokello/make-your-game.git
```
2. Navigate into the project folder:
```sh
cd make-your-game.js
```

3. Running the Project

    1. Open your terminal.
    2. Run the following command to start a local server:
    ```sh
        python3 -m http.server 8000
    ```
    3. Open your browser and navigate to http://localhost:8000.
    4. If you prefer a different port, replace `8000` with your desired port number.

## How to Play
1. Use the arrow keys to navigate the map.
2. Drop bombs strategically to eliminate enemies and break obstacles.
3. Collect power-ups to enhance your abilities.
4. Survive as long as possible while maximizing your score.
5. Use the pause menu to continue or restart when needed.

## Credits
This project was developed as part of the curriculum at 01 Founders Coding School.

### Contributors
- [Hilary Okello](https://learn.zone01kisumu.ke/git/hilaokello)
- [Hillary Ombima](https://learn.zone01kisumu.ke/git/hiombima)

## Contributing to the project

We welcome contributions to make-your-game project! If you'd like to contribute, please follow these steps:

1. Fork the repository

2. Create your feature branch (`git checkout -b feature/AmazingFeature`)

3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)

4. Push to the branch (`git push origin feature/AmazingFeature`)

5. Open a Pull Request

Please make sure to update tests as appropriate and adhere to the project's coding standards.

## License

This project is licensed under the MIT [License](./LICENSE).