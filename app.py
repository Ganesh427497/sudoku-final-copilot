# COPILOT EVALUATION - Instance 1: count_solutions() optimization
# Copilot suggested: Count all possible solutions without limit
# My Evaluation: REJECTED - Too slow, would hang puzzle generation for minutes if many solutions exist
# My Fix: Capped count at 2. If count >=2, return 2 immediately. 90% faster. Because we only need to know if unique (1) or not (>1)
from flask import Flask, render_template, jsonify, request
import sudoku_logic
from typing import Dict, Any

app = Flask(__name__)

CURRENT: Dict[str, Any] = {
    'puzzle': None,
    'solution': None,
    'difficulty': 'easy'
}

@app.route('/')
def index():
    puzzle, solution = sudoku_logic.generate_puzzle(40)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = 'easy'
    return render_template('index.html')

@app.route('/new/<difficulty>')
def new_game(difficulty):
    clues_map = {'easy': 40, 'medium': 32, 'hard': 26}
    clues = clues_map.get(difficulty, 40)
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    CURRENT['difficulty'] = difficulty
    return jsonify({'puzzle': puzzle, 'solution': solution, 'difficulty': difficulty})

@app.route('/new')
def new_game_old():
    clues = int(request.args.get('clues', 35))
    puzzle, solution = sudoku_logic.generate_puzzle(clues)
    CURRENT['puzzle'] = puzzle
    CURRENT['solution'] = solution
    return jsonify({'puzzle': puzzle})

@app.route('/hint', methods=['POST'])
def get_hint():
    import random
    data = request.json
    board = data.get('board')
    solution = CURRENT['solution']
    empties = [(i,j) for i in range(9) for j in range(9) if board[i][j]==0]
    if empties:
        r,c = random.choice(empties)
        return jsonify({'row': r, 'col': c, 'val': solution[r][c]})
    return jsonify({})

if __name__ == '__main__':
    app.run(debug=True)
