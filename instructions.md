# Copilot Instructions for Sudoku Project

## Project Context
Refactor legacy Sudoku Python code into modern, fully-featured web app using Flask.

## Coding Standards
- Use type hints: List[List[int]], Optional, Tuple
- Follow PEP8, use docstrings for all functions
- Use backtracking algorithm for solving
- count_solutions() must cap at 2 for performance (unique solution validation)

## Features to Implement
1. Difficulty: Easy 40 clues, Medium 32, Hard 26
2. count_solutions(board) -> int with max 2 count
3. fill_board() with random + backtracking
4. UI: Hint (lock cell green), Check (highlight red), Timer, Leaderboard top 10 localStorage, Dark Mode, Immediate validation via is_safe()
5. 3x3 squares must alternate colors with no layout shift (use CSS nth-child, box-sizing: border-box)
6. Responsive design - mobile friendly

## Copilot Usage Guidelines
- Use Agent mode for multi-file changes
- Always validate unique solution: generate 5 puzzles test
- Critically evaluate Copilot suggestions - reject inefficient ones

## Validation
- No runtime errors
- Exactly 1 unique solution per puzzle
