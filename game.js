const ROWS = 6;
const COLS = 7;

const boardEl = document.getElementById("board");

// Draw an empty board.
function drawBoard() {
  boardEl.innerHTML = "";
  for (let i = 0; i < ROWS * COLS; i++) {
    const cell = document.createElement("div");
    cell.className = "cell";
    boardEl.appendChild(cell);
  }
}

drawBoard();
