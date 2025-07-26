// Prompt for player's name and store in localStorage for session
let playerName = localStorage.getItem("tic-player") || "";
function askPlayerName() {
  playerName = prompt("Enter your name:", playerName || "");
  if (!playerName || playerName.trim().length === 0) playerName = "Player 1";
  localStorage.setItem("tic-player", playerName);
}
askPlayerName();

// DOM references
const board = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusDisplay = document.getElementById('status');
const resetButton = document.getElementById('resetButton');
const winningLine = document.getElementById('winning-line');
const scoreXElem = document.getElementById('scoreX');
const scoreOElem = document.getElementById('scoreO');
const scoreDrawElem = document.getElementById('scoreDraw');
const themeToggle = document.getElementById('themeToggle');
const headTitle = document.getElementById('headTitle');

// Update labels for Player 1 vs Piyush everywhere
function updatePlayerLabels() {
  headTitle.textContent = `${playerName} vs Piyush`;
  scoreXElem.textContent = `${playerName}: ${scores.X}`;
  scoreOElem.textContent = `Piyush: ${scores.O}`;
}
let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0, draw: 0 };

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

function updateStatus(message) {
  statusDisplay.textContent = message;
}
function renderScores() {
  scoreXElem.textContent = `${playerName}: ${scores.X}`;
  scoreOElem.textContent = `Piyush: ${scores.O}`;
  scoreDrawElem.textContent = `Draw: ${scores.draw}`;
}
cells.forEach(cell => cell.addEventListener('click', cellClick));
resetButton.addEventListener('click', resetGame);

function cellClick(e) {
  if (!gameActive) return;
  const cell = e.target;
  const i = +cell.getAttribute('data-cell-index');
  if (boardState[i] !== '') return;
  boardState[i] = currentPlayer;
  cell.innerHTML = `<span class="xo ${currentPlayer.toLowerCase()}">${currentPlayer}</span>`;
  cell.classList.add('disabled');
  if (checkWinDraw()) return;
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`${
    currentPlayer === 'X' ? playerName : "Piyush"
  }'s turn`);
}

function checkWinDraw() {
  let roundWon = false;
  let winCombo = null;
  for (const combo of winningConditions) {
    const [a, b, c] = combo;
    if (boardState[a] && boardState[a] === boardState[b] && boardState[b] === boardState[c]) {
      roundWon = true;
      winCombo = combo;
      break;
    }
  }
  if (roundWon && winCombo) {
    showWinningLine(winCombo, boardState[winCombo[0]]);
    updateStatus(`🎉 ${currentPlayer === 'X' ? playerName : "Piyush"} wins!`);
    if(currentPlayer === 'X') scores.X++;
    else scores.O++;
    renderScores();
    gameActive = false;
    disableAllCells();
    return true;
  }
  if (!boardState.includes('')) {
    updateStatus("🤝 It's a Draw!");
    scores.draw++;
    renderScores();
    gameActive = false;
    winningLine.style.display = "none";
    return true;
  }
  return false;
}

function disableAllCells() {
  cells.forEach(cell => cell.classList.add('disabled'));
}
function showWinningLine(winCombo, winner) {
  const firstCell = cells[winCombo[0]];
  const lastCell = cells[winCombo[2]];
  const boardRect = board.getBoundingClientRect();
  const firstRect = firstCell.getBoundingClientRect();
  const lastRect = lastCell.getBoundingClientRect();
  const startX = firstRect.left + firstRect.width/2 - boardRect.left;
  const startY = firstRect.top + firstRect.height/2 - boardRect.top;
  const endX = lastRect.left + lastRect.width/2 - boardRect.left;
  const endY = lastRect.top + lastRect.height/2 - boardRect.top;
  const dx = endX - startX;
  const dy = endY - startY;
  const length = Math.sqrt(dx*dx + dy*dy);
  winningLine.style.display = "block";
  winningLine.style.width = length + "px";
  winningLine.style.left = startX + "px";
  winningLine.style.top = startY - 5 + "px";
  winningLine.style.background =
    winner === "X"
      ? "linear-gradient(90deg, #ed64a6, #fa709a 60%)"
      : "linear-gradient(90deg, #60a5fa, #fa709a 90%)";
  winningLine.style.transform = `rotate(${Math.atan2(dy, dx) * 180 / Math.PI}deg)`;
}
function resetGame() {
  currentPlayer = 'X';
  gameActive = true;
  boardState = ['', '', '', '', '', '', '', '', ''];
  updateStatus(`${playerName}'s turn`);
  cells.forEach(cell => {
    cell.textContent = '';
    cell.classList.remove('disabled');
  });
  winningLine.style.display = "none";
  updatePlayerLabels();
}
resetGame();
renderScores();
updatePlayerLabels();

// Theme toggle with localStorage
let dark = localStorage.getItem("tic-darkmode") === "true";
function applyTheme(darkModeOn) {
  document.body.classList.toggle('dark-mode', darkModeOn);
  themeToggle.textContent = darkModeOn ? "☀️ Light Mode" : "🌙 Dark Mode";
}
applyTheme(dark);
themeToggle.addEventListener('click', () => {
  dark = !dark;
  applyTheme(dark);
  localStorage.setItem("tic-darkmode", dark);
});
