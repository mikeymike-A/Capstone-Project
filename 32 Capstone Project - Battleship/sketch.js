// Battleship - Capstone
// Michael R.
// November 2024

let shotSound;
let state = 'title';


let direction = 0;
let TILE_SIZE = 40; // Size of each tile
let ROWS = 15;      // Number of rows in each board
let COLS = 15;      // Number of columns in each board

// Define the two boards
let playerBoardX = 50; // X position of the player's board
let playerBoardY = 55; // Y position of the player's board
let aiBoardX = 880;    // X position of the AI's board (right side)
let aiBoardY = 55;     // Y position of the AI's board

// 2D arrays to represent the grids
let playerGrid = [];
let aiGrid = [];

// Variables for overlay
let currentRow = -1;
let currentCol = -1;


//Represent all available tiles for placement of ships
let availableTiles = [];


//Array to push all ships to the grid to be placed by the player
let playerShips = [];

//Array to push all ships to the AI's grid to be placed (but not shown) by the computer
let AIShips = [];


// 2D array to represent the available ships
// let ships = [
//   { name: "Carrier", size: 5, placed: false },
//   { name: "Battleship", size: 4, placed: false },
//   { name: "Cruiser", size: 3, placed: false },
//   { name: "SubMarine", size: 3, placed: false },
//   { name: "Destroyer", size: 2, placed: false },
//   { name: "Patrol", size: 2, placed: false}
// ];
function loadShips() {
  directionChange();
  playerShips.push(new Ship())

}
class Ship {
  constructor(x, y, name, dir, length, img) {
    this.x = x;
    this.y = y;
    this.name = name;
    this.dir = dir;
    this.length = length;
    this.place = false;
    this.hitboxes = [];
    this.img = img;
  }
  action() {
    this.display();
  }
  display() {
    this.drawShip();

  }
  drawShip() {
    image(this.img, this.x, this.y);

  }
}




//Pre-load all required resources
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
  createCanvas(1600, 800); // Adjust canvas size to fit both boards

  // Initialize player and AI grids
  for (var row = 0; row < ROWS; row++) {
    playerGrid[row] = [];
    aiGrid[row] = [];
    for (var col = 0; col < COLS; col++) {
      playerGrid[row][col] = 0; // Empty tile
      aiGrid[row][col] = 0;     // Empty tile
    }
  }

  playButtonW = 200;
  playButtonH = 50;
  playButtonX = (width - playButtonW) / 2;
  playButtonY = height - 150;
  loadShips();
}

function draw() {
  background(200); // Background color

  if (state === "title") {
    renderTitleScreen();
  } else if (state === "gameplay") {
    renderBoard(playerGrid, playerBoardX, playerBoardY); // Player's board
    renderBoard(aiGrid, aiBoardX, aiBoardY);             // AI's board
    determineActiveSquare();
    selectionOverlay();

    // Add labels for clarity
    fill(0);
    textSize(24);
    textAlign(CENTER, CENTER);
    text("Your Board", playerBoardX + COLS * TILE_SIZE / 2, playerBoardY - 30);
    text("AI's Board", aiBoardX + COLS * TILE_SIZE / 2, aiBoardY - 30);



    text((mouseX + ", " + mouseY), mouseX, mouseY); //Co-ord debugging
  }

}

function renderTitleScreen() {
  image(titleImage, 0, 0, width, height); // Draw the title screen image

  // Draw the Play button
  fill(255);
  rect(playButtonX, playButtonY, playButtonW, playButtonH);
  fill(0);
  textAlign(CENTER, CENTER);
  textSize(24);
  text("Play", playButtonX + playButtonW / 2, playButtonY + playButtonH / 2);
}

function renderBoard(grid, xOffset, yOffset) {
  for (var row = 0; row < ROWS; row++) {
    for (var col = 0; col < COLS; col++) {
      // Set the default tile color
      fill(220); // Default gray color
      stroke(0); // Black tile border

      // Highlight tile if it's occupied (example: 1 for a ship)
      if (grid[row][col] === 1) {
        fill(100); // Example color for ships
      } else if (grid[row][col] === 2) {
        fill(255, 0, 0); // Example color for a hit
      } else if (grid[row][col] === 3) {
        fill(0, 0, 255); // Example color for a miss
      }

      // Draw the tile using the offsets

      image(
        gameTile, xOffset + col * TILE_SIZE, yOffset + row * TILE_SIZE, TILE_SIZE, TILE_SIZE
      )
    }
  }
}



function selectionOverlay() {
  noStroke();
  fill(0, 150, 0, 150);

  // Check if currentRow and currentCol are valid for the player board
  if (currentRow >= 0 && currentRow < ROWS && currentCol >= 0 && currentCol < COLS) {
    rect(playerBoardX + currentCol * TILE_SIZE, playerBoardY + currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function determineActiveSquare() {
  // Determine the grid cell based on mouse position relative to the player's board
  if (mouseX >= playerBoardX && mouseX < playerBoardX + COLS * TILE_SIZE &&
    mouseY >= playerBoardY && mouseY < playerBoardY + ROWS * TILE_SIZE) {
    currentCol = int((mouseX - playerBoardX) / TILE_SIZE);
    currentRow = int((mouseY - playerBoardY) / TILE_SIZE);
  } else {
    currentCol = -1;
    currentRow = -1; // Reset if mouse is out of bounds
  }
}

function keyPressed() {
  if (keyCode === ENTER) {


    state = 'gameplay';
  }
}

//Determine which way the ship is facing when r key is pressed and change accordingly
function directionChange(){
  if(keyCode === 82 && direction === 0){
    direction = 1;
  }
  if(keyCode === 82 && direction === 1){
    direction = 0;
  }
}