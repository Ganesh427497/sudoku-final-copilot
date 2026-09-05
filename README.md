# Sudoku Game - GitHub Copilot Project

Complete Sudoku web app built with Flask + Muse.

## Features Implemented with Copilot (All 9 Required)

1.  **Type Hints** - Added in `sudoku_logic.py` using `List[List[int]]` via Copilot Chat `Add type hints`
2.  **Difficulty Levels** - Easy (40 clues), Medium (32 clues), Hard (26 clues) selector
3.  **Unique Solution Validation** - `count_solutions()` function ensures exactly 1 solution for every puzzle
4.  **Timer** - Auto-start timer, stops on win, shows MM:SS format
5.  **Leaderboard** - Top 10 fastest times saved in localStorage, sorted
6.  **Hint System** - Hint button fills random empty cell and locks it (green)
7.  **Check Solution** - Check button highlights wrong entries in red
8.  **Real-time Validation** - Incorrect numbers highlighted red as you type
9.  **Dark Mode** - Toggle button, preference saved in localStorage

## Copilot Usage Proofs
- Used Copilot Chat to refactor with type hints
- Used Copilot to generate count_solutions and unique puzzle logic
- Used Copilot to build timer, leaderboard, hint, dark mode in index.html

## How to Run
pip install -r requirements.txt
python app.py
Open http://127.0.0.1:5000
