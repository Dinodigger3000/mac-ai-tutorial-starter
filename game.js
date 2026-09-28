const ROWS = 6;
const COLS = 7;

const boardEl = document.getElementById("board");
const statusEl = document.getElementById("status");
const newGameBtn = document.getElementById("new-game");

// --- Game rules (no drawing here) ---

let board;   // board[row][col] is null, "red" or "yellow". Row 0 is the top.
let current; // whose turn it is
let gameOver;
let message; // text shown when the game ends

function newGame() {
  board = [];
  for (let r = 0; r < ROWS; r++) {
    board.push(new Array(COLS).fill(null));
  }
  current = "red";
  message = null;
  gameOver = false;
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

// Is there four in a row that includes the piece at (row, col)?
function checkWin(row, col) {
  const color = board[row][col];
  const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (const [dr, dc] of directions) {
    let count = 1;
    for (const sign of [1, -1]) {
      let r = row + dr * sign;
      let c = col + dc * sign;
      while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r][c] === color) {
        count++;
        r += dr * sign;
        c += dc * sign;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

function isBoardFull() {
  return board[0].every(cell => cell !== null);
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
  statusEl.textContent = message || "Turn: " + current;
}

function handleClick(col) {
  if (gameOver) return;
  const row = dropPiece(col, current);
  if (row === -1) return; // column is full
  if (checkWin(row, col)) {
    message = current + " wins!";
    gameOver = true;
  } else if (isBoardFull()) {
    message = "It's a draw!";
    gameOver = true;
  } else {
    current = current === "red" ? "yellow" : "red";
  }
  drawBoard();
}

newGameBtn.addEventListener("click", () => {
  newGame();
  drawBoard();
});

newGame();
drawBoard();
