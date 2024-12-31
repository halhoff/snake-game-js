const scale = Math.round(window.innerHeight / 1440 * 20) / 20;

const UNIT_SIZE = Math.round(70 * scale);
const SCREEN_WIDTH = UNIT_SIZE * 17;
const SCREEN_HEIGHT = UNIT_SIZE * 15;
const GAME_UNITS = Math.round((SCREEN_WIDTH * SCREEN_HEIGHT) / (UNIT_SIZE * UNIT_SIZE));
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

const appleVictoryImage = new Image();
appleVictoryImage.src = "assets/victory.png";
appleVictoryImage.onload = function() {
    imageLoad();
}

const eyesImage = new Image();
eyesImage.src = "assets/eyes.png";
eyesImage.onload = function() {
    imageLoad();
}

const eyesDeadImage = new Image();
eyesDeadImage.src = "assets/dead.png";
eyesDeadImage.onload = function() {
    imageLoad();
}

var imagesLoaded = 0;
const totalImages = 4;

function imageLoad() {
    ++imagesLoaded;
    if (imagesLoaded === totalImages) {
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
    if (!running && !gameOverToggle) initialize();
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

const canvas = createHiDPICanvas(SCREEN_WIDTH + 2 * UNIT_SIZE, SCREEN_HEIGHT + 2 * UNIT_SIZE);
canvas.id = 'game';
const ctx = canvas.getContext('2d');
document.getElementById('game-container').appendChild(canvas);

const backgroundCanvas = createHiDPICanvas(SCREEN_WIDTH + 2 * UNIT_SIZE, SCREEN_HEIGHT + 2 * UNIT_SIZE);
backgroundCanvas.id = 'background';
const backgroundCtx = backgroundCanvas.getContext('2d');
document.getElementById('game-container').appendChild(backgroundCanvas);

const canvasWidth = canvas.width;
const gameContainer = document.getElementById('game-container');
gameContainer.style.width = `${canvasWidth}px`;

const recentGames = [];
const recentGamesOL = document.createElement('ol');
const recentGamesList = document.getElementById('recent');
recentGamesList.appendChild(recentGamesOL);

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
            if (y[0] === UNIT_SIZE) {
                running = false;
                break;
            }
            else if (bodyParts !== 4) {
                for (let i = bodyParts - 1; i > 0; --i) {
                    if (x[0] === x[i] && y[0] === y[i] + UNIT_SIZE) {
                        running = false;
                        break;
                    }
                }
            }
            newY = y[0] - UNIT_SIZE;
            break;
        case 'D':
            if (y[0] === SCREEN_HEIGHT) {
                running = false;
                break;
            }
            else if (bodyParts !== 4) {
                for (let i = bodyParts - 1; i > 0; --i) {
                    if (x[0] === x[i] && y[0] === y[i] - UNIT_SIZE) {
                        running = false;
                        break;
                    }
                }
            }
            newY = y[0] + UNIT_SIZE;
            break;
        case 'L':
            if (x[0] === UNIT_SIZE) {
                running = false;
                break;
            }
            else if (bodyParts !== 4) {
                for (let i = bodyParts - 1; i > 0; --i) {
                    if (x[0] === x[i] + UNIT_SIZE && y[0] === y[i]) {
                        running = false;
                        break;
                    }
                }  
            }
            newX = x[0] - UNIT_SIZE;
            break;
        case 'R':
            if (x[0] === SCREEN_WIDTH) {
                running = false;
                break;
            }
            else if (bodyParts !== 4) {
                for (let i = bodyParts - 1; i > 0; --i) {
                    if (x[0] === x[i] - UNIT_SIZE && y[0] === y[i]) {
                        running = false;
                        break;
                    }
                }
            }
            newX = x[0] + UNIT_SIZE;
            break;
    }
    if (!running) {
        waiting = true;
        gameOverToggle = true;
        return;
    }
    for (let i = bodyParts; i > 0; --i) {
        x[i] = x[i - 1];
        y[i] = y[i - 1];
    }
    x[0] = newX;
    y[0] = newY;
}

function gameOver() {
    const recentGame = `Apples: ${applesEaten} NumApples: ${parseInt(appleCount.textContent)}`;
    updateRecentList(recentGame);
    ctx.font = `${90 * scale}px Roboto`;
    ctx.textAlign = "center";
    ctx.lineWidth = 4;
    ctx.strokeStyle = "black";
    ctx.lineJoin = "round";
    ctx.strokeText("Game Over", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + UNIT_SIZE);

    ctx.fillStyle = "white";
    ctx.fillText("Game Over", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + UNIT_SIZE);

    ctx.font = `${40 * scale}px Roboto`;
    ctx.strokeText("Press ENTER to restart", SCREEN_WIDTH / 2 + UNIT_SIZE, SCREEN_HEIGHT / 2 + 2 * UNIT_SIZE);
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
    ctx.clearRect(0, 0, SCREEN_WIDTH + 2 * UNIT_SIZE, SCREEN_HEIGHT + 2 * UNIT_SIZE);
    ctx.font = `${40 * scale}px Roboto`;
    ctx.fillStyle = "white";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${applesEaten}  Highest: ${highestEaten}`, UNIT_SIZE, UNIT_SIZE * 0.70);
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
    drawEyes();
    drawApples();
    if (gameOverToggle) {
        drawEyes();
        drawApples();
        gameOver();
    }
    function drawEyes() {
        if (gameOverToggle) {
            ctx.drawImage(eyesDeadImage, x[0] + UNIT_SIZE / 8, y[0] + UNIT_SIZE / 8, 0.75 * UNIT_SIZE, 0.75 * UNIT_SIZE);
        }
        else {
            ctx.drawImage(eyesImage, x[0] + UNIT_SIZE / 8, y[0] + UNIT_SIZE / 8, 0.75 * UNIT_SIZE, 0.75 * UNIT_SIZE);
        }
    }
    function drawApples() {
        if (gameOverToggle) {
            for (let i = 0; i < apples.length; ++i) {
                ctx.drawImage(appleVictoryImage, apples[i].x, apples[i].y, UNIT_SIZE, UNIT_SIZE);
            }
        }
        else {
            for (let i = 0; i < apples.length; ++i) {
                ctx.drawImage(appleImage, apples[i].x, apples[i].y, UNIT_SIZE, UNIT_SIZE);
            }
        }
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

function updateRecentList(item) {
    if (!item) { return; }
    const li = document.createElement('li');
    li.textContent = item;
    recentGamesOL.append(li);
}