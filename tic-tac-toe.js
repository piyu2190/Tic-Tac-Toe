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
const nameModal = document.getElementById('nameModal');
const playerNameInput = document.getElementById('playerNameInput');
const startGameBtn = document.getElementById('startGameBtn');

// Game variables
let playerName = '';
let currentPlayer = 'X';
let gameActive = true;
let boardState = ['', '', '', '', '', '', '', '', ''];
let scores = { X: 0, O: 0, draw: 0 };

const winningConditions = [
  [0,1,2], [3,4,5], [6,7,8],
  [0,3,6], [1,4,7], [2,5,8],
  [0,4,8], [2,4,6]
];

// Always show name modal on load
nameModal.style.display = 'flex';

// Event listeners
startGameBtn.addEventListener('click', () => {
  playerName = playerNameInput.value.trim();
  
  if (!playerName) {
    alert('Please enter your name to continue!');
    return;
  }
  
  localStorage.setItem('tic-player', playerName);
  nameModal.style.display = 'none';
  initializeGame();
});

resetButton.addEventListener('click', resetGame);
themeToggle.addEventListener('click', toggleTheme);

// Game functions
function initializeGame() {
  updatePlayerLabels();
  renderScores();
  resetGame();
  cells.forEach(cell => cell.addEventListener('click', handleCellClick));
}

function updatePlayerLabels() {
  headTitle.textContent = `${playerName} vs Piyush`;
  scoreXElem.textContent = `${playerName}: ${scores.X}`;
  scoreOElem.textContent = `Piyush: ${scores.O}`;
}

function updateStatus(message) {
  statusDisplay.textContent = message;
}

function renderScores() {
  scoreXElem.textContent = `${playerName}: ${scores.X}`;
  scoreOElem.textContent = `Piyush: ${scores.O}`;
  scoreDrawElem.textContent = `Draw: ${scores.draw}`;
}

function handleCellClick(e) {
  if (!gameActive) return;
  
  const cell = e.target;
  const cellIndex = parseInt(cell.getAttribute('data-cell-index'));
  
  if (boardState[cellIndex] !== '') return;
  
  makeMove(cell, cellIndex);
  
  if (checkWinDraw()) return;
  
  if (gameActive && currentPlayer === 'O') {
    setTimeout(makeAiMove, 800); // Delay AI move for better UX
  }
}

function makeMove(cell, index) {
  boardState[index] = currentPlayer;
  cell.innerHTML = `<span class="xo ${currentPlayer.toLowerCase()}">${currentPlayer}</span>`;
  cell.classList.add('disabled');
  
  // Switch player
  currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
  updateStatus(`${currentPlayer === 'X' ? playerName : "Piyush"}'s turn`);
}

function makeAiMove() {
  if (!gameActive) return;
  
  // Simple AI with some intelligence
  let moveIndex;
  
  // 1. Check if AI can win
  moveIndex = findWinningMove('O');
  
  // 2. If not, block player's winning move
  if (moveIndex === -1) {
    moveIndex = findWinningMove('X');
  }
  
  // 3. If center is available, take it
  if (moveIndex === -1 && boardState[4] === '') {
    moveIndex = 4;
  }
  
  // 4. If not, take a random available corner
  if (moveIndex === -1) {
    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(index => boardState[index] === '');
    if (availableCorners.length > 0) {
      moveIndex = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    }
  }
  
  // 5. If not, take any available cell
  if (moveIndex === -1) {
    const availableCells = boardState.map((cell, index) => cell === '' ? index : null).filter(val => val !== null);
    if (availableCells.length > 0) {
      moveIndex = availableCells[Math.floor(Math.random() * availableCells.length)];
    }
  }
  
  if (moveIndex !== -1) {
    const cell = document.querySelector(`.cell[data-cell-index="${moveIndex}"]`);
    makeMove(cell, moveIndex);
    checkWinDraw();
  }
}

function findWinningMove(player) {
  for (let i = 0; i < winningConditions.length; i++) {
    const [a, b, c] = winningConditions[i];
    // Check if two in a row with one empty
    if (boardState[a] === player && boardState[b] === player && boardState[c] === '') return c;
    if (boardState[a] === player && boardState[c] === player && boardState[b] === '') return b;
    if (boardState[b] === player && boardState[c] === player && boardState[a] === '') return a;
  }
  return -1;
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
    const winner = boardState[winCombo[0]];
    updateStatus(`🎉 ${winner === 'X' ? playerName : "Piyush"} wins!`);
    
    if (winner === 'X') scores.X++;
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
  
  winningLine.style.background = winner === "X" 
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
}

// Theme functions
function toggleTheme() {
  const darkMode = document.body.classList.toggle('dark-mode');
  themeToggle.textContent = darkMode ? "☀️ Light Mode" : "🌙 Dark Mode";
  localStorage.setItem('tic-darkmode', darkMode);
}

// Initialize theme from localStorage
const savedDarkMode = localStorage.getItem('tic-darkmode') === 'true';
if (savedDarkMode) {
  document.body.classList.add('dark-mode');
  themeToggle.textContent = "☀️ Light Mode";
}