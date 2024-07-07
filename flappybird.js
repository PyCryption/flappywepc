let board;
let boardWidth = window.innerWidth;
let boardHeight = window.innerHeight;
let context;

// Background
let bgImg;

// Bird
let birdWidth = 79; //width/height ratio = 408/228 = 17/12
let birdHeight = 58;
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
let lastPipeX = pipeX; // координата X последнего столбца
let lastDistance = 200; // начальная дистанция между столбцами
let lastPipeY = pipeY; // координата Y последнего столбца

let topPipeImg;
let bottomPipeImg;
let coinImg;
let coinWidth = 64; // определяем ширину монеты

let coinArray = [];
let coinCounter = 0;
let coinInterval = getRandomInt(5, 10);

// Physics
let velocityX = -1; //pipes moving left speed
let velocityY = -2; //bird jump speed
let gravity = 0.1;

let gameOver = false;
let gameStarted = false;
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

    coinImg.onload = function () {
        console.log("WEPC image loaded successfully");
    }

    requestAnimationFrame(update);
    setInterval(placePipes, 1500); //every 1.5 seconds

    document.addEventListener("keydown", moveBird);
    document.addEventListener("touchstart", moveBird);
    window.addEventListener("resize", resizeCanvas);
}

function update() {
    requestAnimationFrame(update);
    context.clearRect(0, 0, board.width, board.height);

    // Draw background
    context.drawImage(bgImg, 0, 0, boardWidth, boardHeight);

    if (!gameStarted) {
        context.fillStyle = "white";
        context.font = "60px sans-serif";
        context.fillText("Tap to start!", boardWidth / 2 - 150, boardHeight / 2);
        return;
    }

    if (gameOver) {
        context.fillText("GAME OVER", 5, 135);
        return;
    }

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
    if (gameOver || !gameStarted) {
        return;
    }

    let randomPipeY;
    do {
        randomPipeY = getRandomInt(boardHeight / 3, boardHeight - pipeHeight - 50); // Устанавливаем Y координату ниже
    } while (Math.abs(randomPipeY - lastPipeY) < 100); // Убедимся, что текущий столбец значительно отличается по вертикали от последнего

    let openingSpace = board.height / 5; // уменьшили расстояние между столбцами

    let distanceBetweenPipes;
    do {
        distanceBetweenPipes = getRandomInt(150, 200); // уменьшили минимальное и максимальное расстояние между столбцами
    } while (Math.abs(distanceBetweenPipes - lastDistance) < 25);

    let topPipe = {
        img: topPipeImg,
        x: lastPipeX + distanceBetweenPipes,
        y: randomPipeY - pipeHeight,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(topPipe);

    let bottomPipe = {
        img: bottomPipeImg,
        x: lastPipeX + distanceBetweenPipes,
        y: randomPipeY + openingSpace,
        width: pipeWidth,
        height: pipeHeight,
        passed: false
    }
    pipeArray.push(bottomPipe);

    lastPipeX = topPipe.x; // обновляем координату X последнего столбца
    lastDistance = distanceBetweenPipes; // обновляем последнюю дистанцию
    lastPipeY = randomPipeY; // обновляем координату Y последнего столбца

    if (coinCounter >= coinInterval) {
        let coin = {
            img: coinImg,
            x: topPipe.x + pipeWidth / 2 - coinWidth / 2, // корректируем положение монеты
            y: randomPipeY + openingSpace / 2 - coinWidth / 2,
            width: coinWidth,
            height: coinWidth
        };
        
        // Убедимся, что координаты монеты находятся в пределах видимой области
        coin.x = Math.max(0, Math.min(coin.x, boardWidth - coinWidth));
        coin.y = Math.max(0, Math.min(coin.y, boardHeight - coinWidth));

        coinArray.push(coin);
        console.log("Coin placed at:", coin.x, coin.y);
        coinCounter = 0;
        coinInterval = getRandomInt(5, 10);
    }
}

function moveBird(e) {
    if (e.type === "keydown" && (e.code == "Space" || e.code == "ArrowUp" || e.code == "KeyX") ||
        e.type === "touchstart") {
        
        if (!gameStarted) {
            gameStarted = true;
            return;
        }
        
        velocityY = -3;

        if (gameOver) {
            bird.y = birdY;
            pipeArray = [];
            coinArray = [];
            score = 0;
            coinScore = 0;
            coinCounter = 0;
            coinInterval = getRandomInt(5, 10);
            lastPipeX = pipeX; // сброс координаты X последнего столбца
            lastDistance = 300; // сброс последней дистанции
            lastPipeY = pipeY; // сброс координаты Y последнего столбца
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
