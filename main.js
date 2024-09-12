const WIDTH = 750;
const HEIGHT = 750;
const UNITS = 50;
const DELAYMS = 100;
var applesEaten = 0;
var bodyParts = 4;
var coordinates = [[3, 8], [4, 8], [5, 8], [6, 8]];
var direction = 'R';
var running = 0;
var appleX = 11;
var appleY = 8;
var directionQueue = [];
var intervalId;
var waiting = 0;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const backgroundCanvas = document.getElementById('background');
const backgroundCtx = backgroundCanvas.getContext('2d');

function preInitialize() {
    draw();
}

function initialize() {
    if (waiting) return;
    if (intervalId) {
        clearInterval(intervalId);
    }
    running = 1;
    intervalId = setInterval(() => {
        move();
        draw();
        if (!running) {
            clearInterval(intervalId);
            if (!waiting) gameOver();
        }
    }, DELAYMS);
}

function restart() {
    running = 0;
    applesEaten = 0;
    bodyParts = 4;
    coordinates = [[3, 8], [4, 8], [5, 8], [6, 8]];
    direction = 'R';
    appleX = 11;
    appleY = 8;
    directionQueue = [];
    waiting = 1;
    draw();
    initialize();
}

function move() {
    if (!running) return;
    if (directionQueue.length > 0) {
        let newDirection = directionQueue.shift();
        if ((direction === 'U' && newDirection !== 'D') ||
            (direction === 'D' && newDirection !== 'U') ||
            (direction === 'L' && newDirection !== 'R') ||
            (direction === 'R' && newDirection !== 'L')) {
            direction = newDirection;
        }
    }
    for (let i = 0; i < bodyParts - 1; ++i) {
        coordinates[i] = [...coordinates[i + 1]];
    }
    switch (direction) {
        case 'U':
            coordinates[bodyParts - 1][1] -= 1;
            break;
        case 'D':
            coordinates[bodyParts - 1][1] += 1;
            break;
        case 'L':
            coordinates[bodyParts - 1][0] -= 1;
            break;
        case 'R':
            coordinates[bodyParts - 1][0] += 1;
            break;
    }
    if ((coordinates[bodyParts - 1][0] === 0 && direction === 'L') ||
        (coordinates[bodyParts - 1][0] === 16 && direction === 'R') ||
        (coordinates[bodyParts - 1][1] === 0 && direction === 'U') || 
        (coordinates[bodyParts - 1][1] === 16 && direction === 'D')) {
        running = 0;
    }
    for (let i = 0; i < bodyParts - 1; ++i) {
        if (coordinates[bodyParts - 1][0] === coordinates[i][0] &&
            coordinates[bodyParts - 1][1] === coordinates[i][1]) {
            running = 0;
            return;
        }
    }
    checkApple();
}

function gameOver() {
    ctx.font = "80px Consolas";
    ctx.fillStyle = "black";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", 850 / 2, 850 / 2);
}

function checkApple() {
    if (coordinates[bodyParts - 1][0] === appleX && coordinates[bodyParts - 1][1] === appleY) {
        ++bodyParts;
        coordinates.push(coordinates[coordinates.length - 1]);
        ++applesEaten;
        spawnApple();
    }
}

function draw() {
    drawBackground();
    ctx.clearRect(UNITS, UNITS, WIDTH, HEIGHT);
    ctx.font = "40px Consolas";
    ctx.fillStyle = "white";
    ctx.textAlign = "left";    
    ctx.fillText(`Score: ${applesEaten}`, 50, 40);
    for (let i = 0; i < bodyParts; ++i) {
        if (i === 0) {
            ctx.fillStyle = "blue";
        }
        else {
            let shade = Math.round(255 - (150 * i / bodyParts));
            ctx.fillStyle = `rgb(0, 0, ${shade})`;
        }
        ctx.fillRect(coordinates[i][0] * UNITS, coordinates[i][1] * UNITS, UNITS, UNITS);
    }
    ctx.fillStyle = "red";
    ctx.fillRect(appleX * UNITS, appleY * UNITS, UNITS, UNITS);
}

function spawnApple() {
    let appleOnSnake = 1;
    while (appleOnSnake) {
        appleOnSnake = 0;
        appleX = Math.round(Math.random() * 14) + 1;
        appleY = Math.round(Math.random() * 14) + 1;
        for (let i = 0; i < bodyParts; ++i) {
            if (coordinates[i][0] === appleX && coordinates[i][1] === appleY) {
                appleOnSnake = 1;
                break;
            }
        }
    }
}

function changeDirection(newDirection) {
    if (directionQueue.length === 0 || directionQueue[directionQueue.length - 1] !== newDirection) {
        directionQueue.push(newDirection);
    }
}

function drawDefault() {
    backgroundCtx.fillStyle = "rgb(87, 138, 52)";
    backgroundCtx.fillRect(0, 0, 850, 850);
    for (let i = 1; i < WIDTH / UNITS + 1; ++i) {
        for (let j = 1; j < HEIGHT / UNITS + 1; ++j) {
            if ((i + j) % 2 === 0) {
                backgroundCtx.fillStyle = "rgb(167, 218, 72)";
                backgroundCtx.fillRect(i * UNITS, j * UNITS, UNITS, UNITS);
            }
            else {
                backgroundCtx.fillStyle = "rgb(142, 205, 57)";
                backgroundCtx.fillRect(i * UNITS, j * UNITS, UNITS, UNITS);
            }
        }
    }
}
function drawBackground() {
    ctx.drawImage(backgroundCanvas, 0, 0);
}

drawDefault();