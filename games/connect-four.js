const ROWS = 6;
const COLS = 7;

export function start(container, api) {
  let board = api.storage.get("save:connect-four", Array(ROWS * COLS).fill(null));
  let turn = "red";
  let gameOver = false;
  let scores = { wins: 0, losses: 0, draws: 0, plays: 0, ...api.storage.get("scores:connect-four", {}) };
  container.innerHTML = `<section class="game-view"><h1>Connect Four</h1><p id="score" class="score"></p><div class="game-toolbar"><button class="primary-button" id="new-game">New game</button><span id="status" class="muted">Your turn</span></div><div class="board" aria-label="Connect Four board"></div></section>`;
  const boardElement = container.querySelector(".board");
  const scoreElement = container.querySelector("#score");
  const status = container.querySelector("#status");
  function drawScore() {
    scoreElement.textContent = `Wins: ${scores.wins} · Losses: ${scores.losses} · Draws: ${scores.draws} · Games: ${scores.plays}`;
  }
  function draw() {
    boardElement.innerHTML = "";
    board.forEach((piece, index) => {
      const cell = document.createElement("button");
      cell.className = `cell ${piece || ""}`;
      cell.dataset.column = index % COLS;
      cell.ariaLabel = `Row ${Math.floor(index / COLS) + 1}, column ${(index % COLS) + 1}${piece ? `, ${piece}` : ""}`;
      cell.addEventListener("click", () => move(Number(cell.dataset.column)));
      boardElement.append(cell);
    });
  }
  function drop(column, piece) {
    for (let row = ROWS - 1; row >= 0; row--) {
      const index = row * COLS + column;
      if (!board[index]) { board[index] = piece; return index; }
    }
    return -1;
  }
  function winningLine(index) {
    if (index < 0) return [];
    const piece = board[index];
    const row = Math.floor(index / COLS);
    const column = index % COLS;
    const line = [];
    [[0, 1], [1, 0], [1, 1], [1, -1]].forEach(([dr, dc]) => {
      const cells = [index];
      for (const direction of [-1, 1]) {
        let r = row + dr * direction, c = column + dc * direction;
        while (r >= 0 && r < ROWS && c >= 0 && c < COLS && board[r * COLS + c] === piece) { cells.push(r * COLS + c); r += dr * direction; c += dc * direction; }
      }
      if (cells.length >= 4) line.push(...cells);
    });
    return [...new Set(line)];
  }
  function finish(piece, line) {
    gameOver = true;
    scores.plays++;
    if (piece === "red") { scores.wins++; status.textContent = "You win!"; api.showToast("Four in a row!"); }
    else { scores.losses++; status.textContent = "The computer wins."; }
    api.storage.set("scores:connect-four", scores);
    drawScore();
    line.forEach(index => boardElement.children[index].classList.add("win"));
    api.storage.remove("save:connect-four");
  }
  function finishDraw() {
    gameOver = true;
    scores.draws++;
    scores.plays++;
    status.textContent = "Draw game.";
    api.storage.set("scores:connect-four", scores);
    drawScore();
    api.storage.remove("save:connect-four");
  }
  function move(column) {
    if (gameOver || turn !== "red") return;
    const index = drop(column, "red");
    if (index < 0) return;
    draw();
    const line = winningLine(index);
    if (line.length) return finish("red", line);
    if (board.every(Boolean)) return finishDraw();
    turn = "yellow"; status.textContent = "Computer is thinking…";
    setTimeout(() => {
      const choices = [...Array(COLS).keys()].filter(col => !board[col]);
      const computerIndex = drop(choices[Math.floor(Math.random() * choices.length)] ?? 3, "yellow");
      draw();
      const computerLine = winningLine(computerIndex);
      if (computerLine.length) return finish("yellow", computerLine);
      if (board.every(Boolean)) return finishDraw();
      turn = "red"; status.textContent = "Your turn"; api.storage.set("save:connect-four", board);
    }, 350);
  }
  container.querySelector("#new-game").addEventListener("click", () => { board = Array(ROWS * COLS).fill(null); turn = "red"; gameOver = false; status.textContent = "Your turn"; api.storage.remove("save:connect-four"); draw(); });
  drawScore();
  draw();
}
