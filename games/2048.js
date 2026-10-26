const SIZE = 4;
const EMPTY_BOARD = () => Array(SIZE * SIZE).fill(0);

export function start(container, api) {
  const saved = api.storage.get("save:2048");
  let board = saved?.board?.length === SIZE * SIZE ? saved.board : EMPTY_BOARD();
  let score = saved?.score || 0;
  let best = api.storage.get("scores:2048", { best: 0 }).best;
  let gameOver = false;
  let won = false;

  container.innerHTML = `<section class="game-view game-2048"><h1>2048</h1><p class="muted">Use the arrow keys or buttons to combine matching tiles.</p><div class="game-toolbar"><span class="game-stat">Score <strong id="score">0</strong></span><span class="game-stat">Best <strong id="best">0</strong></span><button class="primary-button" id="new-game">New game</button></div><p id="status" class="game-status" aria-live="polite"></p><div class="tile-board" aria-label="2048 board"></div><div class="move-buttons" aria-label="Move controls"><button class="text-button" data-direction="up">↑</button><button class="text-button" data-direction="left">←</button><button class="text-button" data-direction="down">↓</button><button class="text-button" data-direction="right">→</button></div></section>`;
  const boardElement = container.querySelector(".tile-board");
  const scoreElement = container.querySelector("#score");
  const bestElement = container.querySelector("#best");
  const statusElement = container.querySelector("#status");

  function emptyCells() {
    return board.map((value, index) => value === 0 ? index : -1).filter(index => index >= 0);
  }
  function addTile() {
    const cells = emptyCells();
    if (!cells.length) return;
    const index = cells[Math.floor(Math.random() * cells.length)];
    board[index] = Math.random() < 0.9 ? 2 : 4;
  }
  function updateScore() {
    scoreElement.textContent = score;
    bestElement.textContent = best;
  }
  function save() {
    api.storage.set("save:2048", { board, score });
    api.storage.set("scores:2048", { best });
  }
  function draw() {
    boardElement.innerHTML = "";
    board.forEach(value => {
      const tile = document.createElement("div");
      tile.className = `tile tile-${value || "empty"}`;
      tile.textContent = value || "";
      tile.setAttribute("aria-label", value ? `Tile ${value}` : "Empty");
      boardElement.append(tile);
    });
    updateScore();
  }
  function slideLine(line) {
    const values = line.filter(Boolean);
    const result = [];
    for (let index = 0; index < values.length; index++) {
      if (values[index] === values[index + 1]) {
        const merged = values[index] * 2;
        result.push(merged);
        score += merged;
        index++;
      } else result.push(values[index]);
    }
    while (result.length < SIZE) result.push(0);
    return result;
  }
  function move(direction) {
    if (gameOver || won) return;
    const before = board.join(",");
    const next = EMPTY_BOARD();
    for (let line = 0; line < SIZE; line++) {
      let values = [];
      for (let position = 0; position < SIZE; position++) {
        const row = direction === "up" || direction === "down" ? position : line;
        const column = direction === "up" || direction === "down" ? line : position;
        values.push(board[row * SIZE + column]);
      }
      if (direction === "right" || direction === "down") values.reverse();
      values = slideLine(values);
      if (direction === "right" || direction === "down") values.reverse();
      for (let position = 0; position < SIZE; position++) {
        const row = direction === "up" || direction === "down" ? position : line;
        const column = direction === "up" || direction === "down" ? line : position;
        next[row * SIZE + column] = values[position];
      }
    }
    board = next;
    if (before === board.join(",")) return;
    if (score > best) { best = score; api.storage.set("scores:2048", { best }); }
    addTile();
    if (board.includes(2048)) {
      won = true;
      statusElement.textContent = "You reached 2048! Keep going or start a new game.";
      api.showToast("You reached 2048!");
    } else if (!canMove()) {
      gameOver = true;
      statusElement.textContent = "Game over. Start a new game to try again.";
    } else statusElement.textContent = "";
    save();
    draw();
  }
  function canMove() {
    if (emptyCells().length) return true;
    for (let row = 0; row < SIZE; row++) {
      for (let column = 0; column < SIZE; column++) {
        const value = board[row * SIZE + column];
        if (column < SIZE - 1 && value === board[row * SIZE + column + 1]) return true;
        if (row < SIZE - 1 && value === board[(row + 1) * SIZE + column]) return true;
      }
    }
    return false;
  }
  function newGame() {
    board = EMPTY_BOARD();
    score = 0;
    gameOver = false;
    won = false;
    statusElement.textContent = "";
    addTile();
    addTile();
    save();
    draw();
  }
  function handleKey(event) {
    const directions = { ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right" };
    if (!directions[event.key]) return;
    event.preventDefault();
    move(directions[event.key]);
  }
  container.querySelector("#new-game").addEventListener("click", newGame);
  container.querySelectorAll("[data-direction]").forEach(button => button.addEventListener("click", () => move(button.dataset.direction)));
  container.addEventListener("keydown", handleKey);
  container.tabIndex = 0;
  if (!saved?.board) newGame(); else draw();
}
