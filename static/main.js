const SIZE = 9;
let solution = [];
let timerId = null;
let startTime = 0;
let gameRequestId = 0;
let hintsUsed = 0;

function boardElement() {
  return document.getElementById('sudoku-board');
}

function stopTimer() {
  clearInterval(timerId);
  timerId = null;
}

function startTimer() {
  stopTimer();
  startTime = Date.now();
  timerId = setInterval(() => {
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const m = String(Math.floor(elapsed / 60)).padStart(2, '0');
    const s = String(elapsed % 60).padStart(2, '0');
    const timerEl = document.getElementById('timer');
    if (timerEl) timerEl.textContent = `${m}:${s}`;
  }, 1000);
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
      input.setAttribute('inputmode', 'numeric');
      // FIXED: 3x3 alternating checkerboard both directions
      const blockRow = Math.floor(i / 3);
      const blockCol = Math.floor(j / 3);
      const isAlt = (blockRow + blockCol) % 2 === 1;
      input.className = isAlt? 'sudoku-cell block-alt' : 'sudoku-cell block-base';
      input.dataset.row = i;
      input.dataset.col = j;
      input.addEventListener('input', (e) => {
        const v = e.target.value.replace(/[^1-9]/g, '').slice(-1);
        e.target.value = v;
        validateBoard();
        checkWin();
      });
      rowDiv.appendChild(input);
    }
    boardDiv.appendChild(rowDiv);
  }
}
createBoardElement();

function renderPuzzle(puzzle) {
  const boardDiv = boardElement();
  const inputs = boardDiv.getElementsByTagName('input');
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const val = puzzle[i][j];
      const inp = inputs[idx];
      if (val!== 0) {
        inp.value = val;
        inp.disabled = true;
        inp.classList.add('prefilled');
      } else {
        inp.value = '';
        inp.disabled = false;
        inp.classList.remove('prefilled');
      }
      inp.classList.remove('invalid');
    }
  }
  validateBoard();
}

function getBoardValues() {
  const boardDiv = boardElement();
  const inputs = boardDiv.getElementsByTagName('input');
  const board = [];
  for (let i = 0; i < SIZE; i++) {
    board[i] = [];
    for (let j = 0; j < SIZE; j++) {
      const idx = i * SIZE + j;
      const v = parseInt(inputs[idx].value) || 0;
      board[i][j] = v;
    }
  }
  return board;
}

function validateBoard() {
  const board = getBoardValues();
  const boardDiv = boardElement();
  const inputs = boardDiv.getElementsByTagName('input');
  // clear invalid
  for (let inp of inputs) inp.classList.remove('invalid');
  // check duplicates
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      const val = board[i][j];
      if (val === 0) continue;
      for (let k = 0; k < SIZE; k++) {
        if (k!== j && board[i][k] === val) {
          inputs[i * SIZE + j].classList.add('invalid');
          inputs[i * SIZE + k].classList.add('invalid');
        }
        if (k!== i && board[k][j] === val) {
          inputs[i * SIZE + j].classList.add('invalid');
          inputs[k * SIZE + j].classList.add('invalid');
        }
      }
      const br = Math.floor(i / 3) * 3;
      const bc = Math.floor(j / 3) * 3;
      for (let r = br; r < br + 3; r++) {
        for (let c = bc; c < bc + 3; c++) {
          if ((r!== i || c!== j) && board[r][c] === val) {
            inputs[i * SIZE + j].classList.add('invalid');
            inputs[r * SIZE + c].classList.add('invalid');
          }
        }
      }
    }
  }
}

function checkWin() {
  const board = getBoardValues();
  for (let i = 0; i < SIZE; i++) {
    for (let j = 0; j < SIZE; j++) {
      if (board[i][j] === 0) return;
      if (board[i][j]!== solution[i][j]) return;
    }
  }
  // WIN!
  stopTimer();
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const diff = document.getElementById('difficulty').value;
  document.getElementById('message').textContent = `Congratulations! Solved in ${elapsed}s`;
  document.getElementById('message').className = 'success';
  checkAndSaveTop10(diff, elapsed);
}

function checkAndSaveTop10(difficulty, time) {
  const key = `leaderboard_${difficulty}`;
  let scores = JSON.parse(localStorage.getItem(key) || '[]');
  const isTop10 = scores.length < 10 || time < Math.max(...scores.map(s => s.time));
  if (isTop10) {
    const name = prompt(`Top 10! Enter your name for ${difficulty} (${time}s):`) || 'Player';
    scores.push({ name, time, hints: hintsUsed, date: new Date().toLocaleString() });
    scores.sort((a, b) => a.time - b.time);
    scores = scores.slice(0, 10);
    localStorage.setItem(key, JSON.stringify(scores));
  }
  displayScores();
}

function displayScores() {
  const diff = document.getElementById('difficulty').value;
  const key = `leaderboard_${diff}`;
  const scores = JSON.parse(localStorage.getItem(key) || '[]');
  const list = document.getElementById('leaderboard');
  if (!list) return;
  list.innerHTML = '';
  scores.forEach((s, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1}. ${s.name} - ${s.time}s (hints:${s.hints})`;
    list.appendChild(li);
  });
  const diffLabel = document.getElementById('leaderboard-difficulty');
  if (diffLabel) diffLabel.textContent = diff[0].toUpperCase() + diff.slice(1);
}

async function newGame() {
  stopTimer();
  const difficulty = document.getElementById('difficulty').value;
  const requestId = ++gameRequestId;
  const res = await fetch(`/new/${difficulty}`);
  const data = await res.json();
  if (requestId!== gameRequestId) return;
  solution = data.solution;
  renderPuzzle(data.puzzle);
  document.getElementById('message').textContent = `${difficulty[0].toUpperCase() + difficulty.slice(1)} game started`;
  document.getElementById('message').className = '';
  document.getElementById('leaderboard-difficulty').textContent = difficulty[0].toUpperCase() + difficulty.slice(1);
  displayScores();
  hintsUsed = 0;
  startTimer();
}

document.addEventListener('DOMContentLoaded', () => {
  const newBtn = document.getElementById('new-game');
  if (newBtn) newBtn.addEventListener('click', newGame);
  const diffSel = document.getElementById('difficulty');
  if (diffSel) diffSel.addEventListener('change', displayScores);
  newGame();
  displayScores();
});
