let shotSound;
let state = 'title';  // Initial state is 'title'

let direction = 0;
let TILE_SIZE = 40;
let ROWS = 15;
let COLS = 15;

let playerBoardX = 50;
let playerBoardY = 55;
let aiBoardX = 880;
let aiBoardY = 55;

let playerGrid = [];
let aiGrid = [];

let currentRow = -1;
let currentCol = -1;

let playerShips = [];
let AIShips = [];

let shipDisplayX = 600;
let shipDisplayY = 150;

let playButtonW = 200;
let playButtonH = 50;
let playButtonX = (width - playButtonW) / 2;
let playButtonY = height - 150;

function loadShips() {
  playerShips.push(new Ship(shipDisplayX, shipDisplayY, "Carrier", 0, 5, carrier));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 1, "Battleship", 0, 4, battleship));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 2, "Cruiser", 0, 3, cruiser));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 3, "Destroyer", 0, 2, destroyer));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 4, "Patrol", 0, 2, patrol));
}

class Ship {
  constructor(x, y, name, dir, length, img) {
    this.initialX = x;
    this.initialY = y;
    this.x = x;
    this.y = y;
    this.name = name;
    this.dir = dir;
    this.length = length;
    this.place = false;
    this.hitboxes = [];
    this.img = img;
    this.isDragging = false;
  }

  display() {
    this.drawShip();
  }

  drawShip() {
    let shipWidth = this.dir === 0 ? this.length * TILE_SIZE : TILE_SIZE;
    let shipHeight = this.dir === 0 ? TILE_SIZE : this.length * TILE_SIZE;
    image(this.img, this.x, this.y, shipWidth, shipHeight);
  }

  isMouseOver() {
    let shipWidth = this.dir === 0 ? this.length * TILE_SIZE : TILE_SIZE;
    let shipHeight = this.dir === 0 ? TILE_SIZE : this.length * TILE_SIZE;
    return mouseX >= this.x && mouseX <= this.x + shipWidth &&
           mouseY >= this.y && mouseY <= this.y + shipHeight;
  }

  startDragging() {
    this.isDragging = true;
    this.offsetX = mouseX - this.x;
    this.offsetY = mouseY - this.y;
  }

  drag() {
    if (this.isDragging) {
      this.x = mouseX - this.offsetX;
      this.y = mouseY - this.offsetY;
    }
  }

  stopDragging() {
    this.isDragging = false;
  }

  resetPosition() {
    this.x = this.initialX;
    this.y = this.initialY;
  }
}

function mousePressed() {
  // Check if the mouse is clicked on the play button
  if (state === "title" && mouseX >= playButtonX && mouseX <= playButtonX + playButtonW &&
      mouseY >= playButtonY && mouseY <= playButtonY + playButtonH) {
    state = "gameplay"; // Change the state to 'gameplay' when the Play button is clicked
  }

  // Check if the player clicked on any ship to drag it
  if (state === "gameplay") {
    for (let ship of playerShips) {
      if (ship.isMouseOver()) {
        ship.startDragging();
        break;
      }
    }
  }
}

function mouseDragged() {
  for (let ship of playerShips) {
    if (ship.isDragging) {
      ship.drag();
    }
  }
}

function mouseReleased() {
  for (let ship of playerShips) {
    if (ship.isDragging) {
      ship.stopDragging();
      let gridX = int((ship.x - playerBoardX) / TILE_SIZE);
      let gridY = int((ship.y - playerBoardY) / TILE_SIZE);

      if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS) {
        ship.x = playerBoardX + gridX * TILE_SIZE;
        ship.y = playerBoardY + gridY * TILE_SIZE;
        for (let i = 0; i < ship.length; i++) {
          if (ship.dir === 0) {
            playerGrid[gridY][gridX + i] = 1;
          } else {
            playerGrid[gridY + i][gridX] = 1;
          }
        }
      } else {
        ship.resetPosition(); // Reset position if out of bounds
      }
    }
  }
}

function preload() {
  shotSound = loadSound("assets/gunFire.mp3");
  titleImage = loadImage("assets/Battleship logo.png");
  battleship = loadImage("assets/ShipBattleshipHull.png");
  carrier = loadImage("assets/ShipCarrierHull.png");
  cruiser = loadImage("assets/ShipCruiserHull.png");
  destroyer = loadImage("assets/ShipDestroyerHull.png");
  patrol = loadImage("assets/ShipPatrolHull.png");
  submarine = loadImage("assets/ShipSubMarineHull.png");
  gameTile = loadImage("assets/tileBlank.png");
}

function setup() {
  createCanvas(1600, 800);

  for (let row = 0; row < ROWS; row++) {
    playerGrid[row] = [];
    aiGrid[row] = [];
    for (let col = 0; col < COLS; col++) {
      playerGrid[row][col] = 0;
      aiGrid[row][col] = 0;
    }
  }

  loadShips();
}

function draw() {
  background(200);

  if (state === "title") {
    renderTitleScreen();
  } else if (state === "gameplay") {
    renderBoard(playerGrid, playerBoardX, playerBoardY);
    renderBoard(aiGrid, aiBoardX, aiBoardY);

    for (let ship of playerShips) {
      ship.display();
    }

    determineActiveSquare();
    selectionOverlay();

    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Your Board", playerBoardX + COLS * TILE_SIZE / 2, playerBoardY - 30);
    text("AI's Board", aiBoardX + COLS * TILE_SIZE / 2, aiBoardY - 30);

    text(mouseX + ", " + mouseY, mouseX, mouseY); // Debugging
  }
}

function renderTitleScreen() {
  image(titleImage, 0, 0, width, height);

  fill(255);
  rect(playButtonX, playButtonY, playButtonW, playButtonH);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Play", playButtonX + playButtonW / 2, playButtonY + playButtonH / 2);
}

function renderBoard(grid, xOffset, yOffset) {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      fill(220);
      stroke(0);

      if (grid[row][col] === 1) {
        fill(100);
      } else if (grid[row][col] === 2) {
        fill(255, 0, 0);
      } else if (grid[row][col] === 3) {
        fill(0, 0, 255);
      }

      image(gameTile, xOffset + col * TILE_SIZE, yOffset + row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }
  }
}

function selectionOverlay() {
  noStroke();
  fill(0, 150, 0, 150);

  if (currentRow >= 0 && currentRow < ROWS && currentCol >= 0 && currentCol < COLS) {
    rect(playerBoardX + currentCol * TILE_SIZE, playerBoardY + currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function determineActiveSquare() {
  if (mouseX >= playerBoardX && mouseX < playerBoardX + COLS * TILE_SIZE &&
    mouseY >= playerBoardY && mouseY < playerBoardY + ROWS * TILE_SIZE) {
    currentCol = int((mouseX - playerBoardX) / TILE_SIZE);
    currentRow = int((mouseY - playerBoardY) / TILE_SIZE);
  } else {
    currentCol = -1;
    currentRow = -1;
  }
}

function keyPressed() {
  if (keyCode === ENTER) {
    state = 'gameplay';
  }
}
