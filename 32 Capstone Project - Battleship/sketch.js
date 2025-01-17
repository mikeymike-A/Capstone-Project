let shotSound;
let state = 'title';  // Initial state is 'title'

let direction = 0;
let TILE_SIZE = 40;
let ROWS = 15;
let COLS = 15;

let playerBoardX = 50;
let playerBoardY = 55;
let aiBoardX = 950;
let aiBoardY = 55;

let playerGrid = [];
let aiGrid = [];

let currentRow = -1;
let currentCol = -1;

let playerShips = [];
let AIShips = [];

let shipDisplayX = 660;
let shipDisplayY = 135;

let titleImage, battleship, carrier, cruiser, destroyer, patrol, submarine, gameTile;

function preload() {
  titleImage = loadImage("assets/Battleship logo.gif");
  battleship = loadImage("assets/ShipBattleshipHull.png");
  carrier = loadImage("assets/ShipCarrierHull.png");
  cruiser = loadImage("assets/ShipCruiserHull.png");
  destroyer = loadImage("assets/ShipDestroyerHull.png");
  patrol = loadImage("assets/ShipPatrolHull.png");
  submarine = loadImage("assets/ShipSubMarineHull.png");
  gameTile = loadImage("assets/tileBlank.png");

  shotSound = loadSound("assets/gunFire.mp3"); // Preload sound but don't play it yet
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

function loadShips() {
  playerShips.push(new Ship(shipDisplayX, shipDisplayY, "Carrier", 0, 5, carrier));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 1, "Battleship", 0, 4, battleship));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 2, "Cruiser", 0, 3, cruiser));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 3, "Destroyer", 0, 2, destroyer));
  playerShips.push(new Ship(shipDisplayX, shipDisplayY + TILE_SIZE * 4, "Patrol", 0, 2, patrol));
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
  background(255);

  if (state === 'title') {
    renderTitleScreen();
  } else if (state === 'placeShips') {
    renderBoard(playerGrid, playerBoardX, playerBoardY);
    renderBoard(aiGrid, aiBoardX, aiBoardY);
    displayShips();
    determineActiveSquarePlacement();
    selectionOverlay();
  } else if (state === 'firing'){
    renderBoard(playerGrid, playerBoardX, playerBoardY);
    renderBoard(aiGrid, aiBoardX, aiBoardY);
    displayShips();
    determineActiveFiringSquare();
  }
}

function displayShips() {
  for (let i = 0; i < playerShips.length; i++) {
    let s = playerShips[i];
    s.display();
  }
}

function mousePressed() {
  if (state === "placeShips") {
    for (let ship of playerShips) {
      if (ship.isMouseOver()) {
        ship.startDragging();
        break;
      }
    }
  } else if (state === "firing") {
    // Ensure mouse is within AI board bounds
    if (mouseX >= aiBoardX && mouseX < aiBoardX + COLS * TILE_SIZE &&
        mouseY >= aiBoardY && mouseY < aiBoardY + ROWS * TILE_SIZE) {
      
      // Calculate row and col
      let col = int((mouseX - aiBoardX) / TILE_SIZE);
      let row = int((mouseY - aiBoardY) / TILE_SIZE);

      // Debugging logs
      console.log(`Mouse position: (${mouseX}, ${mouseY}), Row: ${row}, Col: ${col}`);
      
      // Check bounds
      if (row >= 0 && row < ROWS && col >= 0 && col < COLS) {
        let value = aiGrid[row][col];

        console.log(`Clicked tile value: ${value}`);
        // Check the value and update the game state
        if (value === 0) {
          console.log("Miss!");
          
          aiGrid[row][col] = color(255,255,255);
        } else if (value === 1) {
          
          aiGrid[row][col] = color(255,0,0);
        }
      } else {
        console.log("Clicked outside the grid bounds.");
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

      if (gridX >= 0 && gridX < COLS && gridY >= 0 && gridY < ROWS &&
          canPlaceShip(playerGrid, gridY, gridX, ship.dir, ship.length)) {
        ship.x = playerBoardX + gridX * TILE_SIZE;
        ship.y = playerBoardY + gridY * TILE_SIZE;
        ship.place = true; // Mark the ship as placed on the board

        for (let i = 0; i < ship.length; i++) {
          if (ship.dir === 0) playerGrid[gridY][gridX + i] = 0; // Horizontal placement
          else playerGrid[gridY + i][gridX] = 0; // Vertical placement
        }
      } else {
        ship.resetPosition(); // Reset to initial position if invalid placement
      }
    }
  }
  placeAIShips();
}

function renderTitleScreen() {
  image(titleImage, 0, 0, width, height);
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
  
  if (currentRow >= 0 && currentRow < ROWS && currentCol >= 0 && currentCol < COLS) {
    let overlayColor = color(0, 255, 0, 150); // Default green (valid spot)
    
    if (isMouseOverShip(currentRow, currentCol)) {
      overlayColor = color(169, 169, 169, 150);  // Grey when over a ship
    } 
    else if (isOneSquareAwayFromShip(currentRow, currentCol)) {
      overlayColor = color(0, 0, 255, 150);  // Blue when one square away
    }

    fill(overlayColor);
    rect(playerBoardX + currentCol * TILE_SIZE, playerBoardY + currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
  }
}

function isMouseOverShip(row, col) {
  for (let ship of playerShips) {
    let shipWidth = ship.dir === 0 ? ship.length * TILE_SIZE : TILE_SIZE;
    let shipHeight = ship.dir === 0 ? TILE_SIZE : ship.length * TILE_SIZE;

    if (mouseX >= ship.x && mouseX <= ship.x + shipWidth &&
        mouseY >= ship.y && mouseY <= ship.y + shipHeight) {
      return true;
    }
  }
  return false;
}

function isOneSquareAwayFromShip(row, col) {
  for (let ship of playerShips) {
    let shipWidth = ship.dir === 0 ? ship.length * TILE_SIZE : TILE_SIZE;
    let shipHeight = ship.dir === 0 ? TILE_SIZE : ship.length * TILE_SIZE;

    for (let i = 0; i < ship.length; i++) {
      let shipX = ship.x + (ship.dir === 0 ? i * TILE_SIZE : 0);
      let shipY = ship.y + (ship.dir === 1 ? i * TILE_SIZE : 0);

      if (
        (abs(shipX - (playerBoardX + col * TILE_SIZE)) === TILE_SIZE && shipY === playerBoardY + row * TILE_SIZE) ||
        (abs(shipY - (playerBoardY + row * TILE_SIZE)) === TILE_SIZE && shipX === playerBoardX + col * TILE_SIZE)
      ) {
        return true;
      }
    }
  }
  return false;
}

function determineActiveSquarePlacement() {
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
    if (state === 'title') {
      // Transition to the ship placement phase from the title screen
      state = 'placeShips';
    }
      if (isAllShipsPlaced()) {
      // Add any logic here for firing phase, if required
      console.log("Entering the firing stage...")
      state = 'firing'
      renderBoard(playerGrid, playerBoardX, playerBoardY);
      renderBoard(aiGrid, aiBoardX, aiBoardY);
      displayShips();
      determineActiveFiringSquare();
    }else{
      console.log("Please place all ships before entering the firing stage!");
      state = 'placeShips';
    }
  }
}


function isAllShipsPlaced() {
  return playerShips.every(ship => ship.place);
}

function canPlaceShip(grid, row, col, dir, length) {
  if (dir === 0) { // Horizontal placement
    if (col + length > COLS) return false; // Ship exceeds the grid width
    for (let i = 0; i < length; i++) {
      if (grid[row][col + i] !== 0) return false; // Overlaps another ship
    }
  } else { // Vertical placement
    if (row + length > ROWS) return false; // Ship exceeds the grid height
    for (let i = 0; i < length; i++) {
      if (grid[row + i][col] !== 0) return false; // Overlaps another ship
    }
  }
  return true;
}

function placeAIShips() {
  AIShips = [
    new Ship(0, 0, "Carrier", 0, 5, carrier),
    new Ship(0, 0, "Battleship", 0, 4, battleship),
    new Ship(0, 0, "Cruiser", 0, 3, cruiser),
    new Ship(0, 0, "Destroyer", 0, 2, destroyer),
    new Ship(0, 0, "Patrol", 0, 2, patrol),
  ];

  for (let ship of AIShips) {
    let placed = false;
    while (!placed) {
      let startRow = int(random(0, ROWS));
      let startCol = int(random(0, COLS));
      let dir = 0; // Force horizontal placement

      placed = canPlaceShip(aiGrid, startRow, startCol, dir, ship.length);

      if (placed) {
        for (let i = 0; i < ship.length; i++) {
          aiGrid[startRow][startCol + i] = 1; // Place horizontally
        }
        ship.row = startRow;
        ship.col = startCol;
        ship.dir = dir; // Ensure the direction is saved as horizontal
        ship.place = true;
      }
    }
    if (!placed) {
      console.error("AI ships were not placed correctly. Retrying...");
      placeAIShips(); // Retry placement if necessary
    }
  }
}

function determineActiveFiringSquare() {
  noStroke();
  if (mouseX >= playerBoardX && mouseX < playerBoardX + COLS * TILE_SIZE &&
    mouseY >= playerBoardY && mouseY < playerBoardY + ROWS * TILE_SIZE) {
    currentCol = int((mouseX - playerBoardX) / TILE_SIZE);
    currentRow = int((mouseY - playerBoardY) / TILE_SIZE);
    overlayColor = color(169, 169, 169, 150);
    fill(overlayColor);
    rect(playerBoardX + currentCol * TILE_SIZE, playerBoardY + currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    
  } else if(mouseX >= aiBoardX && mouseX < aiBoardX + COLS * TILE_SIZE &&
    mouseY >= aiBoardY && mouseY < aiBoardY + ROWS * TILE_SIZE){
      currentCol = int((mouseX - aiBoardX) / TILE_SIZE);
      currentRow = int((mouseY - aiBoardY) / TILE_SIZE);
      overlayColor = color(255,0,0, 150);
      fill(overlayColor);
      rect(aiBoardX + currentCol * TILE_SIZE, aiBoardY + currentRow * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      
    }
    
}

//----------------------------------------------------------------------------------
