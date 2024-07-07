let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

// Background
let bgImg;

// Bird
let birdWidth = 34; //width/height ratio = 408/228 = 17/12
let birdHeight = 24;
let birdX = boardWidth / 8;
let birdY = boardHeight / 2;
let birdImg;

let bird = {
    x: birdX,
    y: birdY,
    width: birdWidth,
    height: birdHeight
}

// Pipes
let pipeArray = [];
let pipeWidth = 64; //width/height ratio = 384/3072 = 1/8
let pipeHeight = 512;
let pipeX = boardWidth;
let pipeY = 0;

let topPipeImg;
let bottomPipeImg;
let coinImg;

let coinArray = [];
let coinCounter = 0;
let coinInterval = getRandomInt(5, 10);

// Physics
let velocityX = -1; //pipes moving left speed
let velocityY = -2; //bird jump speed
let gravity = 0.1;

let gameOver = false;
let score = 0;
let coinScore = 0;

window.onload = function () {
    board = document.getElementById("board");
    board.height = boardHeight;
    board.width = boardWidth;
    context = board.getContext("2d"); //used for drawing on the board

    // Load images
    bgImg = new Image();
    bgImg.src = "./bg.png";

    birdImg = new Image();
    birdImg.src = "./flappybird.png";

    topPipeImg = new Image();
    topPipeImg.src = "./toppipe.png";

    bottomPipeImg = new Image();
    bottomPipeImg.src = "./bottompipe.png";

    coinImg = new Image();
    coinImg.src = "./WEPC.png";

    birdImg.onload = function () {
        context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
    window.addEventListener("resize", resizeCanvas);
}

function update() {
    requestAnimationFrame(update);
    if (gameOver) {
        return;
    }
    context.clearRect(0, 0, board.width, board.height);

    // Draw background
    context.drawImage(bgImg, 0, 0, boardWidth, boardHeight);

    // Bird
    velocityY += gravity;
    bird.y = Math.max(bird.y + velocityY, 0); //apply gravity to current bird.y, limit the bird.y to top of the canvas
    context.drawImage(birdImg, bird.x, bird.y, bird.width, bird.height);

    if (bird.y > board.height) {
        gameOver = true;
    }

    // Pipes
    for (let i = 0; i < pipeArray.length; i++) {
        let pipe = pipeArray[i];
        pipe.x += velocityX;
        context.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);

        if (!pipe.passed && bird.x > pipe.x + pipe.width) {
            score += 0.5; //0.5 because there are 2 pipes! so 0.5*2 = 1, 1 for each set of pipes
            pipe.passed = true;
            coinCounter++;
        }

        if (detectCollision(bird, pipe)) {
            gameOver = true;
        }
    }

    // Clear pipes
    while (pipeArray.length > 0 && pipeArray[0].x < -pipeWidth) {
        pipeArray.shift(); //removes first element from the array
    }

    // Coins
    for (let i = 0; i < coinArray.length; i++) {
        let coin = coinArray[i];
        coin.x += velocityX;
        context.drawImage(coin.img, coin.x, coin.y, coin.width, coin.height);

        if (detectCollision(bird, coin)) {
            coinScore++;
            coinArray.splice(i, 1);
            i--;
        }
    }

    // Clear coins
    while (coinArray.length > 0 && coinArray[0].x < -coinWidth) {
        coinArray.shift(); //removes first element from the array
    }

    // Score
    context.fillStyle = "white";
    context.font = "45px sans-serif";
    context.fillText(score, 5, 45);
    context.fillText("WEPC: " + coinScore, 5, 90);

    if (gameOver) {
        context.fillText("GAME OVER", 5, 135);
    }
}

function placePipes() {
    if (gameOver) {
        return;
    }

    let randomPipeY = pipeY - pipeHeight / 4 - Math.random() * (pipeHeight / 2);
    let openingSpace = board.height / 4;

    let topPipe = {
        img: topPipeImg,
        x: pipeX,
        y: randomPipeY,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: pipeX,
        y: randomPipeY + pipeHeight + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);

    if (coinCounter >= coinInterval) {
        let coin = {
            img: coinImg,
            x: pipeX + pipeWidth / 2,
            y: randomPipeY + pipeHeight + openingSpace / 2 - 32,
            width: 64,
            height: 64
        };
        coinArray.push(coin);
        coinCounter = 0;
        coinInterval = getRandomInt(5, 10);
    }
}

function moveBird(e) {
    if (e.type === "keydown" && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") ||
        e.type === "touchstart") {
        velocityY = -3;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            coinArray = [];
            score = 0;
            coinScore = 0;
            coinCounter = 0;
            coinInterval = getRandomInt(5, 10);
            gameOver = false;
        }
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width && a.x + a.width > b.x &&
        a.y < b.y + b.height && a.y + a.height > b.y;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function resizeCanvas() {
    boardWidth = window.innerWidth;
    boardHeight = window.innerHeight;
    board.width = boardWidth;
    board.height = boardHeight;
    birdX = boardWidth / 8;
    birdY = boardHeight / 2;
    bird.x = birdX;
    bird.y = birdY;
}

