import gameBoard from "./board.js";
export class Player {
    constructor() {
        this.position = { x: 1, y: 1 };
        this.cellSize = 30;
        this.element = this.createPlayerElement();
        this.transform = new DOMMatrix();
        this.initialize();
    }

    createPlayerElement() {
        const svgNS = "http://www.w3.org/2000/svg";
        const player = document.createElementNS(svgNS, "svg");

        player.id = "player";
        player.setAttribute("viewBox", "0 0 120 100");
        player.setAttribute("width", "40");
        player.setAttribute("height", "40");

        // Combine all paths into one group with a single transform
        player.innerHTML = `
            <g class="player-character">
                <circle cx="60" cy="30" r="25" fill="#FFF5D6" stroke="black" stroke-width="3"/>
                <rect x="45" y="20" width="30" height="10" rx="5" ry="5" fill="black"/>
                <rect x="30" y="50" width="60" height="35" rx="12" ry="12" fill="#FFF5D6" stroke="black" stroke-width="3"/>
                <circle cx="20" cy="55" r="9" fill="pink" stroke="black" stroke-width="3" class="arm-left"/>
                <circle cx="100" cy="55" r="9" fill="pink" stroke="black" stroke-width="3" class="arm-right"/>
                <rect x="42" y="85" width="10" height="18" rx="3" ry="3" fill="black"/>
                <rect x="68" y="85" width="10" height="18" rx="3" ry="3" fill="black"/>
            </g>
        `;

        // Use CSS transform with will-change and compositor hints
        const style = document.createElement('style');
        style.textContent = `
            #player {
                contain: strict;
                transform-origin: 0 0;
            }
            .arm-left, .arm-right {
                animation: armSwing 300ms ease-in-out infinite alternate;
                will-change: transform;
                transform-box: fill-box;
                transform-origin: center;
            }
            @keyframes armSwing {
                from { transform: translateY(-3px); }
                to { transform: translateY(3px); }
            }
        `;
        player.appendChild(style);

        player.style.visibility = "hidden";
        player.style.position = "absolute";
        player.style.willChange = "transform";

        return player;
    }

    initialize() {
        const gameBoardElement = document.getElementById("game-board");
        if (!gameBoardElement) return;
        gameBoardElement.appendChild(this.element);
    }

    show() {
        this.element.style.visibility = "visible";
    }

    hide() {
        this.element.style.visibility = "hidden";
    }

    updatePosition(x, y) {
        this.position.x = x;
        this.position.y = y;

        // Use matrix transforms for better performance
        this.transform.e = x * this.cellSize;
        this.transform.f = y * this.cellSize;
        this.element.style.transform = this.transform.toString();
    }

    move(direction) {
        const movements = {
            "ArrowUp": { x: 0, y: -1 },
            "ArrowDown": { x: 0, y: 1 },
            "ArrowLeft": { x: -1, y: 0 },
            "ArrowRight": { x: 1, y: 0 }
        };

        if (!movements[direction]) return;

        const newPos = {
            x: this.position.x + movements[direction].x,
            y: this.position.y + movements[direction].y
        };

        if (this.isValidMove(newPos)) {
            this.updatePosition(newPos.x, newPos.y);
            return true;
        }

        return false;
    }

    isValidMove(newPos) {
        return gameBoard.boardState.isWalkable(newPos.x, newPos.y);
    }

    resetToStart() {
        this.updatePosition(1, 1);
    }
}