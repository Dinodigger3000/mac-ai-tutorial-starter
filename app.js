const STORAGE_PREFIX = "game-collection:";
const storage = {
  memory: new Map(),
  get(key, fallback = null) {
    try { return JSON.parse(localStorage.getItem(STORAGE_PREFIX + key)) ?? fallback; }
    catch (_) { return this.memory.has(key) ? this.memory.get(key) : fallback; }
  },
  set(key, value) {
    this.memory.set(key, value);
    try { localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value)); } catch (_) {}
  },
  remove(key) {
    this.memory.delete(key);
    try { localStorage.removeItem(STORAGE_PREFIX + key); } catch (_) {}
  }
};

const root = document.documentElement;
const app = document.querySelector("#app");
const games = [{ id: "connect-four", name: "Connect Four", icon: "🔴", category: "Board", description: "Drop four in a row before the computer does.", load: () => import("./games/connect-four.js") }];

function applyTheme(theme = storage.get("theme", { theme: "ocean", mode: "system" })) {
  root.dataset.theme = theme.theme;
  root.dataset.mode = theme.mode;
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(root).getPropertyValue("--bg").trim();
  storage.set("theme", theme);
}
function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}
function renderHome() {
  document.querySelector("#back-button").classList.add("hidden");
  app.innerHTML = `<section class="hero"><h1>Choose a game</h1><p class="muted">A growing collection that works offline.</p></section><section class="game-grid">${games.map(game => `<button class="game-card" data-game="${game.id}"><span class="game-icon">${game.icon}</span><h2>${game.name}</h2><p>${game.description}</p></button>`).join("")}</section>`;
  app.querySelectorAll("[data-game]").forEach(card => card.addEventListener("click", () => openGame(card.dataset.game)));
}
async function openGame(id) {
  const game = games.find(item => item.id === id);
  if (!game) return;
  const module = await game.load();
  document.querySelector("#back-button").classList.remove("hidden");
  app.innerHTML = "";
  module.start(app, { storage, showToast });
  history.pushState({ game: id }, "", `#/${id}`);
}
function openSettings() {
  const dialog = document.querySelector("#settings-dialog");
  const theme = storage.get("theme", { theme: "ocean", mode: "system" });
  document.querySelector("#theme-select").value = theme.theme;
  document.querySelector("#mode-select").value = theme.mode;
  dialog.showModal();
}
document.querySelector("#back-button").addEventListener("click", () => { history.pushState({}, "", "#/"); renderHome(); });
document.querySelector("#theme-button").addEventListener("click", openSettings);
document.querySelector("#theme-select").addEventListener("change", event => applyTheme({ theme: event.target.value, mode: document.querySelector("#mode-select").value }));
document.querySelector("#mode-select").addEventListener("change", event => applyTheme({ theme: document.querySelector("#theme-select").value, mode: event.target.value }));
document.querySelector("#reset-button").addEventListener("click", () => { storage.remove("scores:connect-four"); storage.remove("save:connect-four"); showToast("Saved game data reset"); });
window.addEventListener("popstate", () => location.hash === "#/" || !location.hash ? renderHome() : openGame(location.hash.slice(2)));
applyTheme();
renderHome();
if ("serviceWorker" in navigator) window.addEventListener("load", async () => {
  try {
    const registration = await navigator.serviceWorker.register("./sw.js");
    await registration.update();
  } catch (_) {
    showToast("Offline mode is unavailable");
  }
});
