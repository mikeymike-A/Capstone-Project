const COLS = 15, ROWS = 15, TILE_SIZE = 50;
let playGrid = [];
let currentRow = -1, currentCol = -1;

function preload() {
  for (let i = 0; i < COLS * ROWS; i++) {
    try {
      playGrid.push(loadImage("assets/tileBlank.png"));
    } catch (e) {
      console.error("Failed to load image:", e);
      playGrid.push(null);
    }
  }
}

function setup() {
  createCanvas(COLS * TILE_SIZE, ROWS * TILE_SIZE);
}

function draw() {
  renderBoard();
  determineActiveSquare();
  selectionOverlay();
}

function renderBoard() {
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      let index = col + row * COLS; // Map 2D grid to 1D array
      let currentImage = playGrid[index];
      if (currentImage) {
        image(currentImage, col * TILE_SIZE, row * TILE_SIZE);
      } else {
        fill(200); // Default fallback
        rect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }
  }
}

function selectionOverlay() {
  noStroke();
  fill(0, 150, 0, 150);

  // Check if currentRow and currentCol are valid
  if (currentRow >= 0 && currentRow < ROWS && currentCol >= 0 && currentCol < COLS) {
    rect(currentCol * TILE_SIZE, currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function determineActiveSquare() {
  // Determine the grid cell based on mouse position
  currentCol = int(mouseX / TILE_SIZE);
  currentRow = int(mouseY / TILE_SIZE);
}
