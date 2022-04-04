const { body } = document
const canvas = document.createElement('canvas')
const context = canvas.getContext('2d')
const socket = io('http://localhost:3000');
let isReferee = false;
let paddleIndex = 0;

const width = 500
const height = 700


const screenWidth = window.screen.width
const canvasPosition = screenWidth / 2 - width / 2
const isMobile = window.matchMedia('(max-width: 600px)')
const gameOverEl = document.createElement('div')

// Paddle
const paddleHeight = 10;
const paddleWidth = 50;
const paddleDiff = 25;
//let paddleBottomX = 225
let paddleX = [ 225, 255 ]
//let paddleTopX = 225
let trajectoryX = [ 0 , 0]
let playerMoved = false
let paddleContact = false

// Ball
let ballX = 250
let ballY = 350
const ballRadius = 5
let ballDirection = 1;

// Speed
let speedY = 2;
let speedX = 0
//let trajectoryX
//let computerSpeed


// Change Mobile Setting
if (isMobile.matches){
    speedY = -2;
    speedX = speedY
   // computerSpeed = 4
} else {
    speedY = -1
    speedX = speedY
   // computerSpeed = 3
}

// Score
let score = [0, 0];
const winningScore = 7
let isGameOver = true
let isNewGame = true

// Render Everything on Canvas
function renderCanvas() {
    // Canvas Background
    context.fillStyle = 'black'
    context.fillRect(0, 0, width, height)

    //Paddle Color
    context.fillStyle = 'white'

    // Player Paddle (Bottom)
    context.fillRect(paddleX[0], height - 20, paddleWidth, paddleHeight);

    // Computer Paddle(Top)
    context.fillRect(paddleX[1], 10, paddleWidth, paddleHeight)


    // Dashed Center Line
    context.beginPath();
    context.setLineDash([4])
    context.moveTo(0, 350);
    context.lineTo(500, 350)
    context.strokeStyle = 'grey'
    context.stroke()


    // Ball
    context.beginPath()
    context.arc(ballX, ballY, ballRadius, 2 * Math.PI, false)
    context.fillStyle = 'white'
    context.fill()

    // Score
    context.font = '32px Courier New'
    context.fillText(score[0], 20, canvas.height / 2 + 50)
    context.fillText(score[1], 20, canvas.height / 2 - 30)

}

// Create Canvas Element
function createCanvas() {
    canvas.width = width;
    canvas.height = height
    body.appendChild(canvas)
    renderCanvas()
}
 // Remove This 
//createCanvas();

// Reset Ball to Center
function ballReset() {
    ballX = width / 2
    ballY = height / 2
    speedY = -3
    paddleContact = false
}

// Adjust Ball Movement
function ballMove () {
    // Vertical Speed
    ballY += -speedY
    // Horizontal Speed
    if (playerMoved && paddleContact){
        ballX += speedX
    }
}

// Determine What Ball Bounces off, Score Points, Reset Ball
function ballBoundaries() {
    // Bounce off Left Wall
    if (ballX < 0 && speedX < 0){
        speedX = -speedX
    }
    // Bounce off Right Wall
    if (ballX > width && speedX > 0){
        speedX = -speedX
    }
    // Bounce off player paddle (bottom)
    if (ballY > height - paddleDiff){
        if (ballX >= paddleX[0] && ballX <= paddleX[0] + paddleWidth){
            //paddleContact = true
            // Add Speed on Hit
            if (playerMoved){
                speedY += 1
                // Max Speed
                if (speedY >  5){
                    speedY = 5
                    //computerScore = 6
                }
            }
            ballDirection = -ballDirection;
            trajectoryX[0] = ballX - (paddleX[0] + paddleDiff)
            speedX = trajectoryX[0] * 0.3
        } else{
            // Reset Ball, add to player Score
            ballReset()
            score[1]++;
        }
    }

    // Bounce off computer paddle
    if (ballY < paddleDiff){
        if (ballX > paddleX[1] && ballX <= paddleX[1] + paddleWidth){
            //paddleContact = true
            // Add Speed on Hit
            if (playerMoved){
                speedY += 1
                // Max Speed
                if (speedY >  5){
                    speedY = 5
                    //computerScore = 6
                }
            }
            ballDirection = -ballDirection;
            trajectoryX[1] = ballX - (paddleX[1] + paddleDiff)
            speedX = trajectoryX[1] * 0.3
        } else{
            // Reset Ball, add to computer Score
            ballReset()
            score[0]++;
        }
    }




}


// Computer Movement
/*function computerAI(){
    if (playerMoved){
        if (paddleTopX + paddleDiff < ballX){
            paddleTopX += computerSpeed
        } else {
            paddleTopX -= computerSpeed
        }
    }
}*/

function showGameOverEl(winner) {
    // Hide Canvas
    canvas.hidden = true
     // Container
     gameOverEl.textContext = ''
     gameOverEl.classList.add('game-over-container')
    //  Title
     const title = document.createElement('h1')
     title.textContent = `${winner} Wins`
    //  Button
      const playAgainBtn = document.createElement('button')
      playAgainBtn.setAttribute('onclick', 'startGame()')
      playAgainBtn.textContent = 'Play Again'

     // Append
    gameOverEl.append(title, playAgainBtn)
    body.appendChild(gameOverEl )
}

// Check if one player has a winning score, if they do, end game
/*function gameOver() {
    if (playerScore === winningScore || computerScore === winningScore){
        isGameOver = true
        // set Winner
        let winner = playerScore === winningScore ? 'Player 1 ' : 'Computer';
        showGameOverEl(winner)
    }
}*/


// Wait for Opponents
function renderIntro(){
    context.fillStyle = 'black';
    context.fillRect(0, 0, width, height);

    // Intro Text
    context.fillStyle = 'white';
    context.font = "32px Courier New";
    context.fillText("Waiting for opponent...", 20, (canvas.height / 2) - 30);
}



// Called Every Frame
function animate() {
    ballMove()
    renderCanvas()
    ballBoundaries()
    window.requestAnimationFrame(animate)
    //computerAI()
    //gameOver()
    /*if (!isGameOver){
        window.requestAnimationFrame(animate)
    }*/

}
// Load Game, Reset Everything
function loadGame() {
    createCanvas()
   /* if (isGameOver && !isNewGame) {
        body.removeChild(gameOverEl)
        canvas.hidden = false
    }*/
    isGameOver = false;
    isNewGame = false;
    //playerScore = 0
    //computerScore = 0
    ballReset();

    renderIntro()
    animate()
    socket.emit('ready')
}
function startGame(){
    //setInterval(animate, 1000/60)
     paddleIndex = isReferee ? 0 : 1;
    canvas.addEventListener('mousemove',(e) => {
        playerMoved = true
        // Compensate for canvas being centered
        paddleX[paddleIndex] = e.offsetX;
        if (paddleX[paddleIndex] < 0) {
            paddleX[paddleIndex] = 0;
        }
        if (paddleX[paddleIndex] > (width - paddleWidth)){
            paddleX[paddleIndex] = width -paddleWidth;
        }
        // Hide Cursor
        canvas.style.cursor = 'none'
    })
}
// On Load
loadGame();

socket.on('connect', () => {
    console.log('Connected as..', socket.id);
})

socket.on('startGame', (refereeId) => {
    console.log('Referee is', refereeId)

    isReferee = socket.id === refereeId;

    startGame();
})