const canvas = document.getElementById('game');
const context = canvas.getContext('2d');
const grid = 15;
const paddleHeight = grid * 5; // 80
const maxPaddleY = canvas.height - grid - paddleHeight;

var paddleSpeed = 6;
var ballSpeed = 5;
var leftScore = 0;
var rightScore = 0;

const leftGoal = {
  x: 0,
  y: 0,
  width: 10,
  height: canvas.height
};

const rightGoal = {
  x: canvas.width - 10,
  y: 0,
  width: 10,
  height: canvas.height
}

const leftPaddle = {
  // start in the middle of the game on the left side
  x: grid * 2,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 5.5
};

const rightPaddle = {
  // start in the middle of the game on the right side
  x: canvas.width - grid * 3,
  y: canvas.height / 2 - paddleHeight / 2,
  width: grid,
  height: paddleHeight,

  // paddle velocity
  dy: 0
};

const ball = {
  // start in the middle of the game
  x: canvas.width / 2,
  y: canvas.height / 2,
  width: grid,
  height: grid,

  // keep track of when need to reset the ball position
  resetting: false,

  // ball velocity (start going to the top-right corner)
  dx: ballSpeed,
  dy: -ballSpeed
};

const resetButton = {
  x: canvas.width / 4,
  y: canvas.height / 4,
}

// check for collision between two objects using axis-aligned bounding box (AABB)
// @see https://developer.mozilla.org/en-US/docs/Games/Techniques/2D_collision_detection
function collides(obj1, obj2) {
  return obj1.x < obj2.x + obj2.width &&
         obj1.x + obj1.width > obj2.x &&
         obj1.y < obj2.y + obj2.height &&
         obj1.y + obj1.height > obj2.y;
}

canvas.addEventListener("click", function (e) {
  // console.log(e.clientX);
  // if (e.clientX == "341") {
    // window.location.reload();
  // }
})

// game loop
function loop() {
  requestAnimationFrame(loop);
  context.clearRect(0,0,canvas.width,canvas.height);
  if (leftScore >= 7) {
    context.fillText("Right Wins!", (canvas.width / 2) + 100, 60);
    context.strokeStyle = "red";
    context.lineWidth = 4;
    context.strokeRect((canvas.width / 2) + 90, 20, 175, 50);
    context.fillRect((canvas.width / 2) - 100, canvas.height - 100, 200, 100);
    context.fillStyle = "purple";
    context.fillText("Play Again?", (canvas.width / 2) - 75, (canvas.height - 50));
  } else if (rightScore >= 7) {
    context.fillText("Left Wins!", (canvas.width / 4) - 100, 60);
    context.strokeStyle = "green";
    context.lineWidth = 4;
    context.strokeRect((canvas.width / 4) - 110, 20, 150, 50);
    context.fillRect((canvas.width / 2) - 100, canvas.height - 100, 200, 100);
    context.fillStyle = "purple";
    context.fillText("Play Again?", (canvas.width / 2) - 75, (canvas.height - 50));
  }

  // move paddles by their velocity
  if (ball.dx < 0) {
    if (ball.y > leftPaddle.y) {
      leftPaddle.y += leftPaddle.dy;
    } else if(ball.y < leftPaddle.y) {
      leftPaddle.y += (-leftPaddle.dy);
    }
  } else {
    leftPaddle.y += leftPaddle.dy;
  }
  rightPaddle.y += rightPaddle.dy;

  // prevent paddles from going through walls
  if (leftPaddle.y < grid) {
    leftPaddle.dy = 5.5;
    // leftPaddle.y = grid;
  }
  else if (leftPaddle.y > maxPaddleY) {
    leftPaddle.dy = -5.5;
    leftPaddle.y = maxPaddleY;
  }

  if (rightPaddle.y < grid) {
    rightPaddle.y = grid;
  }
  else if (rightPaddle.y > maxPaddleY) {
    rightPaddle.y = maxPaddleY;
  }

  context.font = "30px Arial";
  context.textAlign = "right";
  context.fillStyle = 'green';
  context.fillText(leftScore.toString(), (canvas.width / 2) - 20, 50);
  context.fillStyle = "red";
  context.textAlign = "left";
  context.fillText(rightScore.toString(), (canvas.width / 2) + 20, 50);

  // draw paddles
  context.fillStyle = 'green';
  context.fillRect(leftPaddle.x, leftPaddle.y, leftPaddle.width, leftPaddle.height);
  context.fillStyle = "red";
  context.fillRect(rightPaddle.x, rightPaddle.y, rightPaddle.width, rightPaddle.height);

  // move ball by its velocity
  context.fillStyle = "white";
  ball.x += ball.dx;
  ball.y += ball.dy;

  // prevent ball from going through walls by changing its velocity
  if (ball.y < grid) {
    ball.y = grid;
    ball.dy *= -1;
  }
  else if (ball.y + grid > canvas.height - grid) {
    ball.y = canvas.height - grid * 2;
    ball.dy *= -1;
  }

  // reset ball if it goes past paddle (but only if we haven't already done so)
  if ( (ball.x < 0 || ball.x > canvas.width) && !ball.resetting) {
    ball.resetting = true;

    // give some time for the player to recover before launching the ball again
    setTimeout(() => {
      ball.resetting = false;
      if (ball.x < 0) {
        rightScore++;
      } else if (ball.x > canvas.width) {
        leftScore++
      }
      ball.x = canvas.width / 2;
      ball.y = canvas.height / 2;
    }, 400);
  }

  // check to see if ball collides with paddle. if they do change x velocity
  if (collides(ball, leftPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = leftPaddle.x + leftPaddle.width;
  }
  else if (collides(ball, rightPaddle)) {
    ball.dx *= -1;

    // move ball next to the paddle otherwise the collision will happen again
    // in the next frame
    ball.x = rightPaddle.x - ball.width;
  }

  // if (collides(ball, leftGoal)) {
  //   rightScore++;
  //   console.log("right Score" + rightScore);
  //   console.log(leftScore); 
  // } else if (collides(ball, rightGoal)){
  //   leftScore++;
  //   console.log("right Score" + rightScore);
  //   console.log(leftScore);
  // }

  // draw ball
  context.fillRect(ball.x, ball.y, ball.width, ball.height);

  // draw walls
  context.fillStyle = 'lightgrey';
  context.fillRect(0, 0, canvas.width, grid);
  context.fillRect(0, canvas.height - grid, canvas.width, canvas.height);
  context.fillRect(0, 0, 10, canvas.height);
  context.fillRect(canvas.width - 10, 0, 10, canvas.height);

  // draw dotted line down the middle
  for (let i = grid; i < canvas.height - grid; i += grid * 2) {
    context.fillRect(canvas.width / 2 - grid / 2, i, grid, grid);
  }
}

// listen to keyboard events to move the paddles
document.addEventListener('keydown', function(e) {

  // up arrow key
  if (e.which === 38) {
    rightPaddle.dy = -paddleSpeed;
  }
  // down arrow key
  else if (e.which === 40) {
    rightPaddle.dy = paddleSpeed;
  }

  // // w key
  // if (e.which === 87) {
  //   leftPaddle.dy = -paddleSpeed;
  // }
  // // a key
  // else if (e.which === 83) {
  //   leftPaddle.dy = paddleSpeed;
  // }
});

// listen to keyboard events to stop the paddle if key is released
document.addEventListener('keyup', function(e) {
  if (e.which === 38 || e.which === 40) {
    rightPaddle.dy = 0;
  }

  // if (e.which === 83 || e.which === 87) {
  //   leftPaddle.dy = 0;
  // }
});

// start the game
requestAnimationFrame(loop);