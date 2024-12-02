// Battleship - Capstone
// Michael R.
// November 2024

let music, shotSound; 
let state = 'title';

var TILE_SIZE = 40; // Size of each tile
var ROWS = 15;      // Number of rows in each board
var COLS = 15;      // Number of columns in each board

// Define the two boards
var playerBoardX = 50; // X position of the player's board
var playerBoardY = 55; // Y position of the player's board
var aiBoardX = 880;    // X position of the AI's board (right side)
var aiBoardY = 55;     // Y position of the AI's board

// 2D arrays to represent the grids
var playerGrid = [];
var aiGrid = [];

// Variables for overlay
var currentRow = -1;
var currentCol = -1;



// 2D array to represent the available ships
let ships = [
  { name: "Carrier", size: 5, placed: false },
  { name: "Battleship", size: 4, placed: false },
  { name: "Cruiser", size: 3, placed: false },
  { name: "SubMarine", size: 3, placed: false },
  { name: "Destroyer", size: 2, placed: false },
  { name: "Patrol", size: 2, placed: false}
];




//Pre-load all required resources
function preload() {
  music = loadSound("assets/Allied Forces - WoW Theme.mp3");
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
  }
}

function renderTitleScreen() {
  background(0); // Black background
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
    console.log(state);
  }
}
