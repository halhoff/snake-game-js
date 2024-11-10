const SCREEN_WIDTH = 850;
const SCREEN_HEIGHT = 750;
const UNIT_SIZE = 50;
const GAME_UNITS = (SCREEN_WIDTH * SCREEN_HEIGHT) / (UNIT_SIZE * UNIT_SIZE);
const DELAYMS = 100;
var x = new Array(GAME_UNITS);
var y = new Array(GAME_UNITS);
var bodyParts = 4;
var applesEaten = 0;
var highestEaten = 0;
var appleX;
var appleY;
var direction;
var directionQueue = [];

var running = false;
var waiting = true;
var gameOverToggle = false;
var intervalId;

var PIXEL_RATIO = (function () {
    var ctx = document.createElement("canvas").getContext("2d"),
        dpr = window.devicePixelRatio || 1,
        bsr = ctx.webkitBackingStorePixelRatio ||
              ctx.mozBackingStorePixelRatio ||
              ctx.msBackingStorePixelRatio ||
              ctx.oBackingStorePixelRatio ||
              ctx.backingStorePixelRatio || 1;

    return dpr / bsr;
})();

createHiDPICanvas = function(w, h, ratio) {
    if (!ratio) { ratio = PIXEL_RATIO; }
    var can = document.createElement("canvas");
    can.width = w * ratio;
    can.height = h * ratio;
    can.style.width = w + "px";
    can.style.height = h + "px";
    can.getContext("2d").setTransform(ratio, 0, 0, ratio, 0, 0);
    return can;
}

// const canvas = createHiDPICanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
// const ctx = canvas.getContext('2d');

// const backgroundCanvas = createHiDPICanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
// const backgroundCtx = backgroundCanvas.getContext('2d');

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const backgroundCanvas = document.getElementById('background');
const backgroundCtx = backgroundCanvas.getContext('2d');

function initialize() {
    direction = 'R';
    directionQueue.length = 0;
    applesEaten = 0;
    bodyParts = 4;
    x[0] = UNIT_SIZE * 7;
    y[0] = Math.floor((SCREEN_HEIGHT / 2) / UNIT_SIZE) * UNIT_SIZE + UNIT_SIZE;
    for (let i = 1; i < bodyParts; ++i) {
        x[i] = x[0] - i * UNIT_SIZE;
        y[i] = y[0];
    }
    appleX = x[0] + UNIT_SIZE * 7;
    appleY = y[0];
    if (intervalId) {
        clearInterval(intervalId);
    }
    draw();
}

function startGame() {
    waiting = false;
    running = true;
    firstPlay = false;
    intervalId = setInterval(() => {
        move();
        checkApple();
        draw();
        if (!running) {
            clearInterval(intervalId);
        }
    }, DELAYMS);
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
    var newX = x[0];
    var newY = y[0];
    switch (direction) {
        case 'U':
            if (y[0] === UNIT_SIZE) { running = false; }
            else { newY = y[0] - UNIT_SIZE; }
            break;
        case 'D':
            if (y[0] === SCREEN_HEIGHT) { running = false; }
            else { newY = y[0] + UNIT_SIZE; }
            break;
        case 'L':
            if (x[0] === UNIT_SIZE) { running = false; }
            else { newX = x[0] - UNIT_SIZE; }
            break;
        case 'R':
            if (x[0] === SCREEN_WIDTH) { running = false; }
            else { newX = x[0] + UNIT_SIZE; }
            break;
    }
    if (!running) {
        checkCollisions();
        return;
    }
    for (let i = bodyParts; i > 0; --i) {
        x[i] = x[i - 1];
        y[i] = y[i - 1];
    }
    x[0] = newX;
    y[0] = newY;
    checkCollisions();
}

function checkCollisions() {
    for (let i = bodyParts; i > 0; --i) {
        if (x[0] === x[i] && y[0] === y[i]) {
            running = false;
            break;
        }
    }
    if (x[0] < UNIT_SIZE) {
        running = false;
    }
    else if (x[0] > SCREEN_WIDTH) {
        running = false;
    }
    else if (y[0] < UNIT_SIZE){
        running = false;
    }
    else if (y[0] > SCREEN_HEIGHT) {
        running = false;
    }
    if (!running) {
        waiting = true;
        gameOverToggle = true;
    }
}

function gameOver() {
    ctx.font = "75px Consolas";
    ctx.fillStyle = "red";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + UNIT_SIZE);
    ctx.font = "20px Consolas"
    ctx.fillText("Press ENTER to restart", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + 2 * UNIT_SIZE);
}

function checkApple() {
    if (x[0] === appleX && y[0] === appleY) {
        ++bodyParts;
        ++applesEaten;
        if (applesEaten > highestEaten) {
            highestEaten = applesEaten;
        }
        spawnApple();
    }
}

function draw() {
    drawBackground();
    ctx.clearRect(UNIT_SIZE, UNIT_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = "40px Consolas";
    ctx.fillStyle = "red";
    ctx.textAlign = "left";    
    ctx.fillText(`Score: ${applesEaten} Highest: ${highestEaten}`, 50, 40);
    for (let i = 0; i < bodyParts; ++i) {
        if (i === 0) {
            ctx.fillStyle = "blue";
        }
        else {
            let shade = Math.round(255 - (150 * i / bodyParts));
            ctx.fillStyle = `rgb(0, 0, ${shade})`;
        }
        ctx.fillRect(x[i], y[i], UNIT_SIZE, UNIT_SIZE);
    }
    ctx.fillStyle = "red";
    ctx.fillRect(appleX, appleY, UNIT_SIZE, UNIT_SIZE);
    if (gameOverToggle) {
        gameOver();
    }
}

function spawnApple() {
    let appleOnSnake = true;
    while (appleOnSnake) {
        appleOnSnake = false;
        appleX = (Math.floor(Math.random() * (SCREEN_WIDTH / UNIT_SIZE)) + 1) * UNIT_SIZE;
        appleY = (Math.floor(Math.random() * (SCREEN_HEIGHT / UNIT_SIZE)) + 1) * UNIT_SIZE;
        for (let i = 0; i < bodyParts; ++i) {
            if (x[i] === appleX && y[i] === appleY) {
                appleOnSnake = true;
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
    backgroundCtx.fillRect(0, 0, SCREEN_WIDTH + 2 * UNIT_SIZE, SCREEN_HEIGHT + 2 * UNIT_SIZE);
    for (let i = 1; i < SCREEN_WIDTH / UNIT_SIZE + 1; ++i) {
        for (let j = 1; j < SCREEN_HEIGHT / UNIT_SIZE + 1; ++j) {
            if ((i + j) % 2 === 0) {
                backgroundCtx.fillStyle = "rgb(167, 218, 72)";
            }
            else {
                backgroundCtx.fillStyle = "rgb(142, 205, 57)";
            }
            backgroundCtx.fillRect(i * UNIT_SIZE, j * UNIT_SIZE, UNIT_SIZE, UNIT_SIZE);
        }
    }
}

function drawBackground() {
    ctx.drawImage(backgroundCanvas, 0, 0);
}

drawDefault();