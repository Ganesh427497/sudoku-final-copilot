import copy
import random
from typing import List, Tuple

SIZE = 9
EMPTY = 0

def deep_copy(board: List[List[int]]) -> List[List[int]]:
    """Return an independent deep copy of a Sudoku board."""
    return copy.deepcopy(board)

def create_empty_board() -> List[List[int]]:
    """Create an empty 9x9 board containing only empty cells."""
    return [[EMPTY for _ in range(SIZE)] for _ in range(SIZE)]

def is_safe(board: List[List[int]], row: int, col: int, num: int) -> bool:
    """Check if a number can be placed at the specified cell."""
    # Check row and column
    for x in range(SIZE):
        if board[row][x] == num or board[x][col] == num:
            return False

    # Check 3x3 box
    start_row = row - row % 3
    start_col = col - col % 3
    for i in range(3):
        for j in range(3):
            if board[start_row + i][start_col + j] == num:
                return False
    return True

def fill_board(board: List[List[int]]) -> bool:
    """Fill the board with a valid randomized solution using backtracking."""
    for row in range(SIZE):
        for col in range(SIZE):
            if board[row][col] == EMPTY:
                possible = list(range(1, SIZE + 1))
                random.shuffle(possible)
                for candidate in possible:
                    if is_safe(board, row, col, candidate):
                        board[row][col] = candidate
                        if fill_board(board):
                            return True
                        board[row][col] = EMPTY
                return False
    return True

def count_solutions(board: List[List[int]]) -> int:
    """Return the number of Sudoku solutions, capped at two."""
    working = deep_copy(board)

    for row in range(SIZE):
        for col in range(SIZE):
            value = working[row][col]
            if value != EMPTY:
                working[row][col] = EMPTY
                valid = is_safe(working, row, col, value)
                working[row][col] = value
                if not valid:
                    return 0

    def search() -> int:
        for row in range(SIZE):
            for col in range(SIZE):
                if working[row][col] == EMPTY:
                    solutions = 0
                    for candidate in range(1, SIZE + 1):
                        if is_safe(working, row, col, candidate):
                            working[row][col] = candidate
                            solutions += search()
                            working[row][col] = EMPTY
                            if solutions >= 2:
                                return 2
                    return solutions
        return 1

    return search()

def remove_cells(board: List[List[int]], clues: int = 35) -> None:
    """Remove cells to create a puzzle, keeping specified number of clues."""
    cells = [(r, c) for r in range(SIZE) for c in range(SIZE)]
    random.shuffle(cells)
    to_remove = SIZE * SIZE - clues
    removed = 0
    for r, c in cells:
        if removed >= to_remove:
            break
        value = board[r][c]
        board[r][c] = EMPTY
        if count_solutions(board) == 1:
            removed += 1
        else:
            board[r][c] = value

def generate_puzzle(clues: int = 35) -> Tuple[List[List[int]], List[List[int]]]:
    """Generate a Sudoku puzzle and its solution."""
    solution = create_empty_board()
    fill_board(solution)
    puzzle = deep_copy(solution)
    remove_cells(puzzle, clues)
    return puzzle, solution