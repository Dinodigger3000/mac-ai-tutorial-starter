const ROWS = 6;
const COLS = 7;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("new-game");

// --- Game rules (no drawing here) ---

let board;   // board[row][col] is null, "red" or "yellow". Row 0 is the top.
let current; // whose turn it is

function newGame() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(null));
  }
  current = "red";
}

// Drop a piece in a column. Returns the row it landed in, or -1 if the column is full.
function dropPiece(col, color) {
  for (let r = ROWS - 1; r >= 0; r--) {
    if (board[r][col] === null) {
      board[r][col] = color;
      return r;
    }
  }
  return -1;
}

// --- Drawing ---

function drawBoard() {
  boardEl.innerHTML = "";
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const cell = document.createElement("div");
      cell.className = "cell" + (board[r][c] ? " " + board[r][c] : "");
      cell.addEventListener("click", () => handleClick(c));
      boardEl.appendChild(cell);
    }
  }
  statusEl.textContent = "Turn: " + current;
}

function handleClick(col) {
  if (dropPiece(col, current) === -1) return; // column is full
  current = current === "red" ? "yellow" : "red";
  drawBoard();
}

newGameBtn.addEventListener("click", () => {
  newGame();
  drawBoard();
});

newGame();
drawBoard();
