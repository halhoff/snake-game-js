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
var apples = [];
var direction;
var directionQueue = [];

var running = false;
var waiting = true;
var gameOverToggle = false;
var intervalId;

const appleSlider = document.getElementById('slider');
const appleCount = document.getElementById('appleValue');
const validAppleCount = [1, 3, 5, 9];

const appleImage = new Image();
appleImage.src = "assets/apple.png";
appleImage.onload = function() {
    imageLoad();
}

const eyesImage = new Image();
eyesImage.src = "assets/eyes.png";
eyesImage.onload = function() {
    imageLoad();
}

var imagesLoaded = 0;
const totalImages = 2;

function imageLoad() {
    ++imagesLoaded;
    if (imagesLoaded === totalImages) {
        console.log("Images Loaded");
        initialize();
    }
}

function snapToValidAppleCount(value) {
    if (value > 5) return 9;
    return validAppleCount.find(val => val >= value);
}

slider.addEventListener('input', function() {
    const snappedValue = snapToValidAppleCount(appleSlider.value);
    appleSlider.value = snappedValue;
    appleCount.textContent = snappedValue;
    if (!running) initialize();
});

slider.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
    }
});

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

// const canvas = createHiDPICanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
// const ctx = canvas.getContext('2d');
// document.getElementById('game').appendChild(canvas);

// const backgroundCanvas = createHiDPICanvas(SCREEN_WIDTH, SCREEN_HEIGHT);
// const backgroundCtx = backgroundCanvas.getContext('2d');
// document.getElementById('background').appendChild(backgroundCanvas);

function initialize() {
    applesEaten = 0;
    bodyParts = 4;
    x[0] = UNIT_SIZE * 7;
    y[0] = Math.floor((SCREEN_HEIGHT / 2) / UNIT_SIZE) * UNIT_SIZE + UNIT_SIZE;
    for (let i = 1; i < bodyParts; ++i) {
        x[i] = x[0] - i * UNIT_SIZE;
        y[i] = y[0];
    }
    apples = initializeApples();
    if (intervalId) {
        clearInterval(intervalId);
    }
    draw();
}

function startGame() {
    direction = 'R';
    directionQueue.length = 0;
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
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Game Over", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + UNIT_SIZE);
    ctx.font = "20px Consolas"
    ctx.fillText("Press ENTER to restart", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + 2 * UNIT_SIZE);
}

function checkApple() {
    for (let i = 0; i < apples.length; ++i) {
        if (x[0] === apples[i].x && y[0] === apples[i].y) {
            ++bodyParts;
            ++applesEaten;
            if (applesEaten > highestEaten) {
                highestEaten = applesEaten;
            }
            apples.splice(i, 1);
            apples = apples.concat(spawnApples(1));
            break;
        }
    }
}

function draw() {
    ctx.drawImage(backgroundCanvas, 0, 0);
    ctx.clearRect(UNIT_SIZE, UNIT_SIZE, SCREEN_WIDTH, SCREEN_HEIGHT);
    ctx.font = "40px Consolas";
    ctx.fillStyle = "white";
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
    ctx.drawImage(eyesImage, x[0] + UNIT_SIZE / 4, y[0] + UNIT_SIZE / 4, UNIT_SIZE / 2, UNIT_SIZE / 2);
    for (let i = 0; i < apples.length; ++i) {
        ctx.drawImage(appleImage, apples[i].x, apples[i].y, UNIT_SIZE, UNIT_SIZE);
    }
    if (gameOverToggle) {
        gameOver();
    }
}

function initializeApples() {
    let newApples = [];
    let numApples = parseInt(appleCount.textContent);
    let centerX = x[0] + 7 * UNIT_SIZE;
    let centerY = y[0];
    if (numApples === 1) {
        newApples.push({ x: centerX, y: centerY });
    }
    else if (numApples === 3) {
        newApples.push(
            { x: centerX, y: centerY },
            { x: centerX + 2 * UNIT_SIZE, y: centerY + 2 * UNIT_SIZE },
            { x: centerX + 2 * UNIT_SIZE, y: centerY - 2 * UNIT_SIZE }
        );
    }
    else if (numApples === 5) {
        newApples.push(
            { x: centerX, y: centerY },
            { x: centerX - 2 * UNIT_SIZE, y: centerY + 2 * UNIT_SIZE },
            { x: centerX - 2 * UNIT_SIZE, y: centerY - 2 * UNIT_SIZE },
            { x: centerX + 2 * UNIT_SIZE, y: centerY + 2 * UNIT_SIZE },
            { x: centerX + 2 * UNIT_SIZE, y: centerY - 2 * UNIT_SIZE }
        );
    }
    else if (numApples === 9) {
        newApples.push(
            { x: centerX, y: centerY },
            { x: centerX - 2 * UNIT_SIZE, y: centerY + 2 * UNIT_SIZE },
            { x: centerX - 2 * UNIT_SIZE, y: centerY - 2 * UNIT_SIZE },
            { x: centerX + 2 * UNIT_SIZE, y: centerY + 2 * UNIT_SIZE },
            { x: centerX + 2 * UNIT_SIZE, y: centerY - 2 * UNIT_SIZE },
            { x: centerX - 2 * UNIT_SIZE, y: centerY },
            { x: centerX + 2 * UNIT_SIZE, y: centerY },
            { x: centerX, y: centerY - 2 * UNIT_SIZE },
            { x: centerX, y: centerY + 2 * UNIT_SIZE }
        );
    }
    return newApples;
}

function spawnApples(numApples) {
    let newApples = [];
    for (let i = 0; i < numApples; ++i) {
        let appleOnSnake = true;
        let appleOnApple = true;
        let appleX, appleY;
        while (appleOnSnake || appleOnApple) {
            appleOnSnake = false;
            appleOnApple = false;
            appleX = (Math.floor(Math.random() * (SCREEN_WIDTH / UNIT_SIZE)) + 1) * UNIT_SIZE;
            appleY = (Math.floor(Math.random() * (SCREEN_HEIGHT / UNIT_SIZE)) + 1) * UNIT_SIZE;
            for (let j = 0; j < bodyParts; ++j) {
                if (x[j] === appleX && y[j] === appleY) {
                    appleOnSnake = true;
                    break;
                }
            }
            for (let j = 0; j < apples.length; ++j) {
                if (apples[j].x === appleX && apples[j].y === appleY) {
                    appleOnApple = true;
                    break;
                }
            }
        }
        newApples.push({ x: appleX, y: appleY });
    }
    return newApples;
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
drawDefault();