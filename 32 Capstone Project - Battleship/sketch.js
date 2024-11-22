// Project Title
// Your Name
// Date
//
// Extra for Experts:
// - describe what you did to take this project "above and beyond"

const COLS = 20, ROWS = 20, TILE_SIZE = 30;
let playGrid = [];

function preload() {
  // Initialize playGrid with images (or placeholders for now)
  for (let i = 0; i < COLS * ROWS; i++) {
    playGrid.push(loadImage("assets/tileBlank.png"));
  }
}

function setup() {
  createCanvas(COLS * TILE_SIZE, ROWS * TILE_SIZE);
}

function draw() {
  renderBoard();
}

function renderBoard() {
  for (let col = 0; col < COLS; col++) {
    for (let row = 0; row < ROWS; row++) {
      let index = col + row * COLS; // Map 2D grid to 1D array
      let currentImage = playGrid[index];
      if (currentImage) {
        // Render the image at the correct position
        image(currentImage, col * TILE_SIZE, row * TILE_SIZE);
      }
    }
  }
}
