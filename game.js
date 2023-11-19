//////////////////////  GLOBAL CONSTANTS  //////////////////////


const board = document.querySelector('canvas')
const ctx = board.getContext('2d')
const startBtn = document.querySelector('.start')
const pauseBtn = document.querySelector('.pause')
const resetBtn = document.querySelector('.reset')
const score1 = document.querySelector('#player1');


//////////////////////  GLOBAL VARIABLES  //////////////////////


let bWidth = board.width = 99 * window.innerWidth / 100 || 700
let bHeight = board.height = 67 * window.innerHeight / 100 || 800;

    
if (bWidth > 700) {
    bWidth = board.width =  700
}

if (bHeight > 800) {
    bHeight = board.height = 800;
}

let pWidth = bWidth / 5;
let pHeight = bHeight / 35;
let pVelocity = bWidth / 10;
let paddleStartX = bWidth/2 - pWidth / 2;
let paddleStartY = bHeight - pHeight;

let bVelocityX = randomNeg(1);
let bVelocityY = 4;
if (bWidth > 550) {
    bVelocityY = 2;
}
let redHit = true

let bRadius = bWidth / 60;

let brickW = (bWidth  / 16) - 2
let brickH = 15
let brickStartY =  10 * window.innerHeight / 100 || 100;

let balls = []
let bricks = []
let bounce = 0
let reflect = true

let playerLife = 3

let touched = false
let offSet = []

let scoreP1 = 0

let game;
let startCode = 0;
let startBool = false;


//////////////////////  GAME OBJECT CLASSES  //////////////////////


function randomNeg(num) {
    if (Math.random() < 0.5) {return num * -1}
    else {return num}
}

class Board {
    x;
    y;
    width;
    height;
    color;
    netWidth;
    netHeight;
    netX;
    netY;
    netColor;



    constructor() {
        this.x = 0;
        this.y= 0;
        this.width = bWidth;
        this.height = bHeight;
        this.color = 'rgba(0,0,0,1)';
    }

    draw() {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y, this.width, this.height)
    }
}



class Paddle1 {
    x;
    y;
    velY;
    width;
    height;
    color;

    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.velX = pVelocity;
        this.width = pWidth;
        this.height = pHeight;
        this.color = "white";


        window.addEventListener('keydown', (e) => {
            if (e.key == "a") {
                if (this.x > 0) {
                    this.x -= this.velX;
                }
            }
            if (e.key == "d") {
                if (this.x + this.width < bWidth) {
                    this.x += this.velX;
                }
            }
        })
    }
    
    draw() {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x,this.y, this.width, this.height)
    }

    collisionDetect() {
        for (const ball of balls) {
            if ((ball.x + ball.r >= paddle1.x) && (ball.x - ball.r <= paddle1.x + paddle1.width) && (ball.y + ball.r >= paddle1.y)) {
                ball.y = paddle1.y - ball.r;
                ball.velY = -(ball.velY)
                playSound2()
                bounce += 1
                reflect = true
                if (ball.x + ball.r < (this.x + this.width / 2) - (pWidth * .03)) {
                    if (ball.velX > 0){
                        ball.velX = -(ball.velX)
                    } 
                }
                if (ball.x + ball.r > (this.x + this.width / 2) + (pWidth * .03)) {
                    if (ball.velX < 0){
                        ball.velX = -(ball.velX)
                    } 
                }
            }
        }
    }
}



class Ball {
    x;
    y;
    velX;
    velY;
    color;
    r;
    exists;

    constructor() {
        this.x = paddleStartX;
        this.y = 40 * window.innerHeight / 100;
        this.velX = bVelocityX;
        this.velY = bVelocityY;
        this.color = "white";
        this.r = bRadius;
        this.exists = true;
    }

    draw() {
        if (this.exists) {
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(this.x, this.y, this.r, 0 , Math.PI * 2, true)
        ctx.fill();
        // console.log(this.x + ' and ' + this.y)
        }

    }

    move() {
        this.x += this.velX;
        this.y += this.velY;
    }

    update() {
        if (this.x + this.r >= bWidth) { this.velX = -(this.velX); playSound(); reflect = true}
        else if (this.x - this.r <= 0) { this.velX = -(this.velX); playSound(); reflect = true}
        else if (this.y - this.r <= 0) { this.velY = -(this.velY); playSound(); reflect = true; paddle1.width = pWidth / 2}
    }

    reset() {
        for (const ball of balls) {
            if (ball.y >= bHeight) {
                ball.exists = false;
                balls.splice(ball,1)
                bounce = 0
                const newball = new Ball()
                balls.push(newball);
                playSound3()
                playerLife -= 1 
            }
        }
    }

    increaseSpeed() {
        if (bounce == 4) {
            //if ((this.velY != 7) || (this.velY != -7)) {
            this.velY > 0 ? this.velY = bVelocityY + 2 : this.velY = (bVelocityY + 2) * -1;
            //}
        }
        //if ((this.velY != 7) || (this.velY != -7)) {
        if (bounce == 12) {
            this.velY > 0 ? this.velY = bVelocityY + 4 : this.velY = (bVelocityY + 4) * -1;
            //}
        }
    }  
}

class Brick {
    x;
    y;
    width;
    height;
    color;
    exists;

    constructor(x,y, color){
        this.x = x;
        this.y = y;
        this.width = brickW;
        this.height = brickH;
        this.color = color;
        this.exists = true;
    }

    draw() {
        if (this.exists) {
            ctx.beginPath();
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x,this.y, this.width - 1, this.height - 3)
        }
    }

    changeY(m) {
        this.x += 2
        this.y += (this.height * m)
    }

    makeRow(m) {
        for (let r = 0; r < m; r++) {
            this.x = 0
            this.y = brickStartY
            if (r < 2) {this.color = "red"};
            if (r > 1 && r < 4) {this.color = "orange"}
            if (r > 3 && r < 6) {this.color = "green"}
            if (r > 5 && r < 8) {this.color = "yellow"}
            const startBrick = new Brick(this.x,this.y, this.color)
            startBrick.changeY(r)
            bricks.push(startBrick)
            //bricks.push(this)
            for (let i = 0; i < 15; i++){
                this.x += (brickW + 2)
                const rowBrick = new Brick(this.x,this.y, this.color)
                rowBrick.changeY(r)
                bricks.push(rowBrick) 
            }  
        }
    }

    collision() {
        if (reflect){
            if (this.exists) {
                for (const ball of balls) {
                    if ((ball.y - ball.r) <  (this.y + this.height)) {
                        if ((ball.y + ball.r) > (this.y + this.height/2)) {
                            if ((ball.x + ball.r) > (this.x)) {
                                if ((ball.x - ball.r) < (this.x + this.width)) {
                                    ball.y = this.y + this.height + ball.r
                                    ball.velY = -(ball.velY)
                                    this.exists = false;
                                    reflect = false
                                    playSound3()
                                    console.log(this.color)
                                    if (ball.x + ball.r < (this.x + this.width / 2) - 5) {
                                        if (ball.velX > 0){
                                        ball.velX = -(ball.velX)
                                        } 
                                    }
                                    if (ball.x + ball.r > (this.x + this.width / 2) + 5) {
                                        if (ball.velX < 0){
                                        ball.velX = -(ball.velX)
                                        } 
                                    }



                                }
                            }
                        }
                    }

                    if ((ball.y + ball.r) > (this.y)) {
                        if ((ball.y + ball.r) < (this.y + this.height/2)) {
                            if ((ball.x + ball.r) > (this.x)) {
                                if ((ball.x - ball.r) < (this.x + this.width)) {
                                    console.log(`you hit ${this}`)
                                    ball.y = this.y - ball.r
                                    ball.velY = -(ball.velY)
                                    this.exists = false;
                                    reflect = false
                                    playSound3()
                                }    
                            }
                        } 
                    }   
                }
            }
        }  
    }

    remove() {
        for (const ball of balls) {
            for (const brick of bricks) {
                if (brick.exists == false) {
                    if (brick.color == "red") {
                        scoreP1 += 7;
                        ball.velY > 0 ? ball.velY = bVelocityY + 6 : ball.velY = (bVelocityY + 6) * -1; 
                        score1.textContent = ` ${scoreP1}`;
                    }
                    if (brick.color == "orange") {
                        scoreP1 += 5; 
                        score1.textContent = ` ${scoreP1}`;
                    }
                    if (brick.color == "green") {
                        scoreP1 += 3; score1.textContent = ` ${scoreP1}`;
                    }
                    if (brick.color == "yellow") {
                        scoreP1 += 1; score1.textContent = ` ${scoreP1}`;
                    }
                    bricks.splice(bricks.indexOf(brick), 1)
                }
            }
        }
    }
}


//////////////////////  SOUNDS  //////////////////////


function playSound() {
    var audio = new Audio('thudCustomAudio3.mp3')
    audio.loop=false
    audio.volume = .02
    audio.play();
}

function playSound2() {
    var audio = new Audio('thudCustomAudio1.mp3')
    audio.loop=false
    audio.volume = .08
    audio.play();
}

function playSound3() {
    var audio = new Audio('clickCustomAudio1.mp3')
    audio.loop=false
    audio.volume = .07
    audio.play();
}


//////////////////////  NOTIFICATION AND MESSAGE FUNCTIONS  //////////////////////


function slideIn(elem, startPosition, endPosition, direction, increment) {
  let position = startPosition
  let directionOption = direction.toString()
  let slideI = setInterval(() => {
    position += increment //1
    elem.style[directionOption] = `${position}px`
    if (position == endPosition) {
      clearInterval(slideI)
    }
  }, 20)
}

function fadeIn(elem, increment, interval) {
  let opacity = 0
  let fadeI = setInterval(() => {
    opacity += increment//.05
    elem.style.opacity = opacity
    if (elem.style.opacity >= 1) {
      clearInterval(fadeI)
    } 
  }, interval) //20
}

function fadeOut(elem, speed, startPosition, endPosition, bool) {
  setTimeout(() => {
    let opacity = 1
    let bottom = startPosition
    
    let fadeO = setInterval(() => {
      opacity -= .05
      elem.style.opacity = opacity

      if (bottom >= endPosition) {
        bottom -= 1
        elem.style.bottom = `${bottom}px`
      }

      if (elem.style.opacity <= 0) {
        if (bool === true) {
          elem.remove()
        }
        clearInterval(fadeO)
      } 
    }, 20)
  }, speed)
}

function turnNotification(msgText, parent, acceptText, rejectText, colorData) {
    document.querySelectorAll('.turnMessage').forEach(elem => {
        elem.remove()
    })
    const messageDiv = document.createElement('div')
    messageDiv.classList.add('turnMessage')
    messageDiv.style.borderColor = colorData;
    messageDiv.style.opacity = 0
    const messageText = document.createElement('p')
    messageText.textContent = msgText
    messageText.classList.add('turnMessageText')
    messageDiv.appendChild(messageText)
  
    const btnDiv = document.createElement('div')
    btnDiv.setAttribute('class', 'btnDiv')
    const acceptBtn = document.createElement('button')
    acceptBtn.classList.add('matchButton')
    acceptBtn.innerHTML = `${acceptText} &#10004;`
    acceptBtn.addEventListener('click', (e) => {
        fadeOut(messageDiv, 200, position, position - 20, true)
        startCode = 0; 
        resetBoard()
    })

    btnDiv.appendChild(acceptBtn)  
    messageDiv.appendChild(btnDiv)
    parent.appendChild(messageDiv)
    const position = getComputedStyle(messageDiv).bottom.replace('px', '')
  
    setTimeout(() => {
      fadeIn(messageDiv, .05, 20)
      slideIn(messageDiv, position - 20, position, 'bottom', 1)
    },100)
}


//////////////////////  GAME CREATION AND GAME LOOP + RESET  //////////////////////


function changeToScreenSize() {
    bWidth = board.width = 99 * window.innerWidth / 100;
    bHeight = board.height = 67 * window.innerHeight / 100;
    

    if (bWidth > 700) {
        bWidth = board.width =  700
    }
    
    if (bHeight > 700) {
        bHeight = board.height = 700;
    }
    gameBoard.width = bWidth
    gameBoard.height = bHeight

    pWidth = paddle1.width = bWidth / 5;
    pHeight = paddle1.height =  bHeight / 35;
    pVelocity = paddle1.velX = bWidth / 10;
    paddle1.y = paddleStartY = bHeight - pHeight;
    paddle1.X = paddleStartX = bWidth/2 - pWidth / 2;
    
    bRadius = bWidth / 60;
    brickStartY =  10 * window.innerHeight / 100 || 100;
    brickW = (bWidth  / 15) - 2
    
    for (const brick of bricks) {
        brick.width = brickW;
        if (brick.column != 0) {
            brick.x = (brickW * brick.column) + 2
        }
        brick.draw();
    }
    paddle1.draw();
    for (const ball of balls) {
        ball.draw()
        ball.x = bWidth / 2
    }
}


function resetBoard() {
    document.querySelectorAll('.turnMessage').forEach(elem => {
        elem.remove()
    })
    
    changeToScreenSize()
    gameBoard.draw();
    playerLife = 3;

    bricks = [];
    brick1.makeRow(8);
    redHit = true

    for (const brick of bricks) {
        brick.draw();
        brick.collision(); 
    }
    
    paddle1.x = paddleStartX;
    paddle1.y = paddleStartY;
    paddle1.width = pWidth;
    paddle1.draw();

    balls = [];
    const ballReset = new Ball();
    balls.push(ballReset);

    scoreP1 = 0;
    score1.textContent = ` ${scoreP1} `;

    startBool = false;
}


function gameEnd() {
    window.cancelAnimationFrame(game);
    resetBoard()
    startCode = 0;
}


function gameLoop() {
    gameBoard.draw()
    for (const brick of bricks) {
        brick.draw()
        brick.collision()
        brick.remove()  
    }
 
    bVelocityX = randomNeg(1)
    paddle1.draw()
    paddle1.collisionDetect()
 
    for (const ball of balls) {
        ball.increaseSpeed()
        ball.draw()
        ball.move()
        ball.update() 
        ball.reset()
    }

    startBool = true;
    game = window.requestAnimationFrame(gameLoop)

    if (playerLife == 0 && bricks.length != 0) {
        gameEnd()
        turnNotification(`You Lose!`, document.body, 'Play Again', 'Reset', '#F55C47' )
    }
    if (bricks.length == 0) {
        gameEnd()
        turnNotification(`You Win! Congratulations!`, document.body, 'Play Again', 'Reset', '#47F5A1' )
    }
}

window.addEventListener('resize', (e) => {
    //resetBoard()
    changeToScreenSize()
})

let gameBoard = new Board();
let paddle1 = new Paddle1(paddleStartX, paddleStartY)
let brick1 = new Brick(0,brickStartY)
resetBoard()


//////////////////////  MOUSE + TOUCH + BUTTON EVENTS  //////////////////////


startBtn.addEventListener('click', (e) =>{
  if (startBool == false) {
    gameLoop()
  }; 
  startCode += 1; 
  e.target.blur()
}); //if starcode < 1;

pauseBtn.addEventListener('click', (e) => {
  window.cancelAnimationFrame(game); 
  startCode = 0; 
  startBool = false; 
  e.target.blur()
});

resetBtn.addEventListener('click', (e) => {
  window.cancelAnimationFrame(game); 
  resetBoard(); 
  startCode = 0;  
  e.target.blur()
});


window.addEventListener('keydown', (e) => { 
    if (e.key == " ") {
        if (startBool === false) {
            gameLoop(); startCode += 1; ;
        }
        else {
            window.cancelAnimationFrame(game); startCode = 0; startBool = false; //startBool ? startBool = false : startBool = true;
        }     
    }
});


window.addEventListener('keydown', (e) => { if ((e.key == "Delete") || (e.key == "Backspace") || (e.key == "Escape")) {
    window.cancelAnimationFrame(game); resetBoard(); startCode = 0; 
    } 
})


board.addEventListener('touchstart', (e) => {
    e.preventDefault()
    if (startBool == false) {
        gameLoop(); board.style.cursor = "none"
    }
    else {
        window.cancelAnimationFrame(game); 
        startCode = 0; 
        startBool = false; 
        e.target.blur();
        board.style.cursor = "pointer"
    }  
    startCode += 1; e.target.blur() 
});


board.addEventListener('touchmove', (e) => {
    const mouseX = e.touches[0].clientX - board.offsetLeft -  (pWidth / 2);
    if (mouseX > 0 && mouseX < bWidth - pWidth ) {
        paddle1.x = mouseX
    }
})


board.addEventListener('mousedown', (e) =>{ 
    console.log('hello')
    if (startBool == false) {
        gameLoop(); board.style.cursor = "none"
    }
    else {
        window.cancelAnimationFrame(game); 
        startCode = 0; 
        startBool = false; 
        e.target.blur();
        board.style.cursor = "pointer";
    }  
    startCode += 1; e.target.blur() 
}); //if starcode < 1;


board.addEventListener("mousemove", (e) => {
    const mouseX = e.clientX - board.offsetLeft -  (pWidth / 2);
    if (mouseX > 0 && mouseX < bWidth - pWidth ) {
        paddle1.x = mouseX
    }  
})
