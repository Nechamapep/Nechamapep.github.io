(async function () {
    'use strict';

    const CELL_SIZE = 64;

    const canvas = document.querySelector('#theCanvas');
    function resizeCanvas() {
        canvas.width = (window.innerWidth - 2) - ((window.innerWidth - 2) % CELL_SIZE);
        canvas.height = (window.innerHeight - 2) - ((window.innerHeight - 2) % CELL_SIZE);
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const context = canvas.getContext('2d');

    const crashSound = document.querySelector('#crash');
    const crunchSound = document.querySelector('#crunch');

    let gameOver = false;
    let speed = 450;
    let score = 0;

    class Snake {
        constructor() {
            this.segments = [{ x: 0, y: 0 }];
            this.draw();
        }

        draw() {
            context.drawImage(snakeHead, this.segments[0].x, this.segments[0].y);
            for (let i = 1; i < this.segments.length; i++) {
                context.drawImage(snakeBody, this.segments[i].x, this.segments[i].y, CELL_SIZE, CELL_SIZE);
            }
        }

        move() {
            let head = this.segments[0];
            let pieceFormerlyKnownAsTail = this.segments.pop();
            let tailX = pieceFormerlyKnownAsTail.x;
            let tailY = pieceFormerlyKnownAsTail.y;
            let x = head.x;
            let y = head.y;
            switch (direction) {
                case 'ArrowUp':
                    y -= CELL_SIZE;
                    break;
                case 'ArrowRight':
                    x += CELL_SIZE;
                    break;
                case 'ArrowDown':
                    y += CELL_SIZE;
                    break;
                case 'ArrowLeft':
                    x -= CELL_SIZE;
                    break;
            }

            if (x < 0 || x > canvas.width - CELL_SIZE
                || y < 0 || y > canvas.height - CELL_SIZE) {
                gameOver = true;
            }

            if (this.isOnTopOff(x, y, 4)) {
                gameOver = true;
            }

            if (head.x === dynamite.x && head.y === dynamite.y) {
                crashSound.currentTime = 0;
                crashSound.play();
                gameOver = true;
            }
            if (head.x === dynamite2.x && head.y === dynamite2.y) {
                score -= 2;
                dynamite2.move()
            }

            if (!gameOver) {
                pieceFormerlyKnownAsTail.x = x;
                pieceFormerlyKnownAsTail.y = y;
                this.segments.unshift(pieceFormerlyKnownAsTail);

                if (head.x === apple.x && head.y === apple.y) {
                    this.segments.push({ x: tailX, y: tailY });
                    score++;
                    speed = speed - (speed * 0.15);
                    crunchSound.currentTime = 0;
                    crunchSound.play();
                    apple.move();
                    dynamite.move();
                    dynamite2.move();
                }
            } else {
                this.segments.push(pieceFormerlyKnownAsTail);
            }

            this.draw();
        }

        isOnTopOff(x, y, startIndex = 0) {
            for (let i = startIndex; i < this.segments.length; i++) {
                if (this.segments[i].x === x && this.segments[i].y === y) {
                    return true;
                }
            }
            return false;
        }
    }

    class Apple {
        constructor() {
            this.move();
        }

        draw() {
            context.drawImage(appleImg, this.x, this.y);
        }

        move() {
            do {
                this.x = Apple.getRandomNumber(0, canvas.width - 1);
                this.y = Apple.getRandomNumber(0, canvas.height - 1);
            } while (snake.isOnTopOff(this.x, this.y));
            this.draw();
        }

        static getRandomNumber(min, max) {
            let r = Math.floor(Math.random() * ((max - min) + 1)) + min;
            return r - r % CELL_SIZE;
        }
    }
    class Dynamite {
        constructor() {
            this.move();
        }

        draw() {
            context.drawImage(dynamiteImg, this.x, this.y);
        }

        move() {
            this.x = Apple.getRandomNumber(0, canvas.width - 1);
            this.y = Apple.getRandomNumber(0, canvas.height - 1);
            if (apple.x !== this.x && apple.y !== this.y) {
                this.draw();
            }
            else {
                this.x = Apple.getRandomNumber(0, canvas.width - 1);
                this.y = Apple.getRandomNumber(0, canvas.height - 1);
                this.draw()
            }

        }
    }
    class Dynamite2 {
        constructor() {
            this.move();
        }

        draw() {
            context.drawImage(dynamiteImg2, this.x, this.y);
        }

        move() {
            this.x = Apple.getRandomNumber(0, canvas.width - 1);
            this.y = Apple.getRandomNumber(0, canvas.height - 1);
            if (apple.x !== this.x && apple.y !== this.y) {
                if (dynamite.x !== this.x && dynamite.y !== this.y) { this.draw(); }
            }
            else {
                this.x = Apple.getRandomNumber(0, canvas.width - 1);
                this.y = Apple.getRandomNumber(0, canvas.height - 1);
                this.draw()
            }
        }
    }


    function gameLoop() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        apple.draw();
        dynamite.draw();
        dynamite2.draw();
        snake.move();
        context.font = 'bold 32px Arial';
        context.fillStyle = '#ff0000';
        context.fillText(`Score ${score}`, canvas.width - 160, 40);
        if (!gameOver) {
            timeout = setTimeout(gameLoop, speed);
        } else {
            crashSound.currentTime = 0;
            crashSound.play();
            context.font = 'bold 32px Arial';
            context.fillStyle = '#000000';
            context.fillText(`GAME OVER!!!`, (canvas.width / 2) - 100, (canvas.height / 2) - 16);
        }
    }
    function restart() {
        snake.segments = [{ x: 0, y: 0 }];
        score = 0;
        speed = 450;
        apple.move();
        dynamite.move();
        dynamite2.move();
        gameOver = false;
        clearTimeout(timeout);
        direction = 'ArrowRight'
        gameLoop();
    }

    const restartBtn = document.querySelector('#restart');
    restartBtn.addEventListener("click", restart);

    let direction = 'ArrowRight';
    document.addEventListener('keydown', e => {
        switch (e.key) {
            case 'ArrowUp':
                if (snake.segments.length === 1 || direction !== 'ArrowDown') {
                    direction = e.key;
                }
                break;
            case 'ArrowRight':
                if (snake.segments.length === 1 || direction !== 'ArrowLeft') {
                    direction = e.key;
                }
                break;
            case 'ArrowDown':
                if (snake.segments.length === 1 || direction !== 'ArrowUp') {
                    direction = e.key;
                }
                break;
            case 'ArrowLeft':
                if (snake.segments.length === 1 || direction !== 'ArrowRight') {
                    direction = e.key;
                }
                break;
        }
    });

    function loadImg(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.src = src;
            img.onload = () => resolve(img);
            img.onerror = () => reject(`failed to load ${src}`);
        });
    }

    let timeout
    let snake;
    let apple;
    let dynamite;
    let snakeHead;
    let appleImg;
    let dynamiteImg;
    let snakeBody
    let dynamite2;
    let dynamiteImg2;
    try {
        const sp = loadImg('images/snakehead.png');
        const ap = loadImg('images/redapple.png');
        const dp = loadImg('images/dynamite.png');
        const sb = loadImg('images/snakebody.png');
        const d2 = loadImg('images/dynamite2.png');
        [snakeHead, appleImg, dynamiteImg, snakeBody, dynamiteImg2] = await Promise.all([sp, ap, dp, sb, d2]);
        snake = new Snake();
        apple = new Apple();
        dynamite = new Dynamite();
        dynamite2 = new Dynamite2()
        setTimeout(gameLoop, speed);
    } catch (e) {
        console.error(e);
    }
}());