const sounds = {
    bombExplodes: new Audio("sounds/bomb_explodes.wav"),
    gameOver: new Audio("sounds/clear.wav"),
    introGame: new Audio("sounds/intro.mp3"),
    gameWin: new Audio("sounds/win.wav"),
    background: new Audio("sounds/background.mp3")
};

sounds.background.loop = true;

export function playBackgroundMusic() {
    sounds.background.currentTime = 0;
    sounds.background.play();
}

export function stopBackgroundMusic() {
    sounds.background.pause();
    sounds.background.currentTime = 0;
}

export function playSound(sound) {
    return new Promise((resolve) => {
        if (sounds[sound]) {
            sounds[sound].currentTime = 0;
            sounds[sound].play();
            sounds[sound].onended = resolve;
        } else {
            resolve();
        }
    });
}

export default sounds;