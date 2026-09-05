const SIZE = 9;
let puzzle = [];
let solution = [];
let difficulty = 'easy';
let elapsedSeconds = 0;
let timerId = null;
let gameFinished = false;
let gameRequestId = 0;

const boardElement = () => document.getElementById('sudoku-board');
const cellAt = (row, col) => document.querySelector(`[data-row="${row}"][data-col="${col}"]`);

function formatTime(totalSeconds) {
  const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  document.getElementById('timer').textContent = formatTime(elapsedSeconds);
}

function startTimer() {
  clearInterval(timerId);
  elapsedSeconds = 0;
  gameFinished = false;
  updateTimer();
  timerId = setInterval(() => {
    elapsedSeconds += 1;
    updateTimer();
  }, 1000);
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function createBoardElement() {
  const boardDiv = boardElement();
  boardDiv.innerHTML = '';
  for (let i = 0; i < SIZE; i++) {
    const rowDiv = document.createElement('div');
    rowDiv.className = 'sudoku-row';
    for (let j = 0; j < SIZE; j++) {
      const input = document.createElement('input');
      input.type = 'text';
      input.maxLength = 1;
      input.className = 'sudoku-cell';
      input.dataset.row = i;
      input.dataset.col = j;
      input.setAttribute('inputmode', 'numeric');
      input.setAttribute('aria-label', `Row ${i + 1}, column ${j + 1}`);
      input.addEventListener('input', (e) => {
        const val = e.target.value.replace(/[^1-9]/g, '');
        e.target.value = val.slice(-1);
        validateBoard();
        checkWin();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}

function renderPuzzle(puz) {
  puzzle = puz;
  createBoardElement();
  const boardDiv = boardElement();
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val !== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
      }
    }
  }
}

async function newGame() {
  stopTimer();
  difficulty = document.getElementById('difficulty').value;
  const requestId = ++gameRequestId;
  const res = await fetch(`/new/${difficulty}`);
  const data = await res.json();
  if (requestId !== gameRequestId) return;
  solution = data.solution;
  renderPuzzle(data.puzzle);
  document.getElementById('message').textContent = `${difficulty[0].toUpperCase()}${difficulty.slice(1)} puzzle ready.`;
  document.getElementById('message').className = '';
  document.getElementById('leaderboard-difficulty').textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
  displayScores();
  startTimer();
}

function getBoard() {
  return Array.from({length: SIZE}, (_, row) =>
    Array.from({length: SIZE}, (_, col) => Number(cellAt(row, col).value) || 0)
  );
}

function markConflicts(board) {
  const conflicts = new Set();
  const groups = [];
  for (let row = 0; row < SIZE; row++) groups.push(Array.from({length: SIZE}, (_, col) => [row, col]));
  for (let col = 0; col < SIZE; col++) groups.push(Array.from({length: SIZE}, (_, row) => [row, col]));
  for (let boxRow = 0; boxRow < SIZE; boxRow += 3) {
    for (let boxCol = 0; boxCol < SIZE; boxCol += 3) {
      groups.push(Array.from({length: 9}, (_, index) => [boxRow + Math.floor(index / 3), boxCol + index % 3]));
    }
  }
  groups.forEach(group => {
    const seen = new Map();
    group.forEach(([row, col]) => {
      const value = board[row][col];
      if (!value) return;
      if (seen.has(value)) {
        conflicts.add(`${row},${col}`);
        conflicts.add(seen.get(value));
      } else {
        seen.set(value, `${row},${col}`);
      }
    });
  });
  return conflicts;
}

function validateBoard() {
  const board = getBoard();
  const conflicts = markConflicts(board);
  document.querySelectorAll('.sudoku-cell').forEach(cell => {
    const key = `${cell.dataset.row},${cell.dataset.col}`;
    cell.classList.toggle('conflict', conflicts.has(key));
    const row = Number(cell.dataset.row);
    const col = Number(cell.dataset.col);
    cell.classList.toggle('incorrect', Boolean(cell.value) && !conflicts.has(key) && Number(cell.value) !== solution[row][col]);
  });
  return conflicts;
}

function checkSolution() {
  const conflicts = validateBoard();
  const board = getBoard();
  const emptyCells = board.flat().filter(value => value === 0).length;
  const wrongCells = board.some((row, rowIndex) => row.some((value, colIndex) => value && value !== solution[rowIndex][colIndex]));
  const message = document.getElementById('message');
  if (conflicts.size || wrongCells) {
    message.textContent = 'There are mistakes to fix.';
    message.className = 'error-message';
  } else if (emptyCells) {
    message.textContent = `${emptyCells} cell${emptyCells === 1 ? '' : 's'} left.`;
    message.className = '';
  } else {
    finishGame();
  }
}

function checkWin() {
  if (gameFinished) return;
  const board = getBoard();
  if (board.some(row => row.some(value => value === 0))) return;
  if (markConflicts(board).size || board.some((row, rowIndex) => row.some((value, colIndex) => value !== solution[rowIndex][colIndex]))) return;
  finishGame();
}

function finishGame() {
  gameFinished = true;
  stopTimer();
  const name = window.prompt(`Solved in ${formatTime(elapsedSeconds)}. Enter your name for the leaderboard:`);
  if (name && name.trim()) saveScore(name.trim(), elapsedSeconds, difficulty);
  const message = document.getElementById('message');
  message.textContent = `Solved in ${formatTime(elapsedSeconds)}!`;
  message.className = 'success-message';
}

function saveScore(name, time, level) {
  const scores = JSON.parse(localStorage.getItem('sudokuScores') || '[]');
  scores.push({name, time, difficulty: level});
  scores.sort((a, b) => a.time - b.time);
  localStorage.setItem('sudokuScores', JSON.stringify(scores.slice(0, 50)));
  displayScores();
}

function displayScores() {
  const scores = JSON.parse(localStorage.getItem('sudokuScores') || '[]')
    .filter(score => score.difficulty === difficulty)
    .slice(0, 10);
  const list = document.getElementById('scores');
  const empty = document.getElementById('empty-scores');
  list.innerHTML = '';
  empty.hidden = scores.length > 0;
  scores.forEach((score, index) => {
    const item = document.createElement('li');
    item.innerHTML = `<span><strong>${index + 1}.</strong> ${escapeHtml(score.name)}</span><time>${formatTime(score.time)}</time>`;
    list.appendChild(item);
  });
}

function escapeHtml(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

async function giveHint() {
  if (gameFinished) return;
  const response = await fetch('/hint', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({board: getBoard()})
  });
  const hint = await response.json();
  if (hint.row === undefined) return;
  const cell = cellAt(hint.row, hint.col);
  cell.value = hint.val;
  cell.disabled = true;
  cell.classList.add('hint-locked');
  validateBoard();
  checkWin();
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle('dark-mode');
  localStorage.setItem('sudokuDarkMode', String(isDark));
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('new-game').addEventListener('click', newGame);
  document.getElementById('check-solution').addEventListener('click', checkSolution);
  document.getElementById('hint').addEventListener('click', giveHint);
  document.getElementById('dark-mode').addEventListener('click', toggleDarkMode);
  document.getElementById('difficulty').addEventListener('change', () => {
    difficulty = document.getElementById('difficulty').value;
    document.getElementById('leaderboard-difficulty').textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
    newGame();
  });
  if (localStorage.getItem('sudokuDarkMode') === 'true') document.body.classList.add('dark-mode');
  newGame();
});