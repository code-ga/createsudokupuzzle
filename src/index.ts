/**
 * Shuffles an array in place using the Fisher-Yates algorithm.
 * @param array - The array to shuffle.
 * @returns The shuffled array.
 */
function shuffle<T>(array: Array<T>): Array<T> {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

/**
 * Checks if an array contains unique numbers, ignoring zeros.
 * @param arr - The array to check.
 * @returns True if the array is unique, false otherwise.
 */
function isUnique(arr: Array<number>): boolean {
    const nums = arr.filter((num) => num > 0);
    return new Set(nums).size === nums.length;
}

/**
 * Finds the first empty cell in the Sudoku grid.
 * @param grid - The Sudoku grid.
 * @returns An array [row, col] if an empty cell is found, or false otherwise.
 */
function findEmpty(grid: Array<Array<number>>): [number, number] | false {
    for (let row = 0; row < 9; row++) {
        for (let col = 0; col < 9; col++) {
            if (grid[row][col] === 0) {
                return [row, col];
            }
        }
    }
    return false;
}

/**
 * Checks if placing a number in a cell is valid according to Sudoku rules.
 * @param grid - The Sudoku grid.
 * @param row - The row index.
 * @param col - The column index.
 * @param num - The number to place.
 * @returns True if valid, false otherwise.
 */
function isValid(grid: Array<Array<number>>, row: number, col: number, num: number): boolean {
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    return !grid[row].includes(num) &&
           !grid.some((r) => r[col] === num) &&
           !grid.slice(boxRow, boxRow + 3).some((r) => r.slice(boxCol, boxCol + 3).includes(num));
}

/**
 * Validates a Sudoku grid.
 * @param puzzle - The Sudoku grid.
 * @param allowZero - Whether zeros are allowed in the grid, usually applicable to checking if a move is legal.
 * @returns True if valid, false otherwise.
 */
function validate(puzzle: Array<Array<number>>, allowZero: boolean = false): boolean {
    if (puzzle.length !== 9 || puzzle.some(row => row.length !== 9)) {
        throw new Error('Invalid puzzle size');
    }
    for (let i = 0; i < 9; i++) {
        const row = puzzle[i];
        const col = puzzle.map(row => row[i]);
        const box: number[] = [];
        const boxRow = Math.floor(i / 3) * 3;
        const boxCol = (i % 3) * 3;
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 3; c++) {
                box.push(puzzle[boxRow + r][boxCol + c]);
            }
        }
        if (!isUnique(row) || !isUnique(col) || !isUnique(box)) return false;
    }
    return allowZero || puzzle.every(row => row.every(cell => cell > 0));
}

/**
 * Generates a Sudoku puzzle with a specified number of blank cells.
 * @param blank - The number of blank cells.
 * @returns The generated Sudoku grid.
 */
function generate(blank: number = 0): Array<Array<number>> {
    if (blank < 0 || blank > 81) {
        throw new Error('Invalid number of blanks');
    }

    const grid = Array.from({ length: 9 }, () => Array(9).fill(0));
    const numbers = Array.from({ length: 9 }, (_, i) => i + 1);

    function fillGrid(grid: Array<Array<number>>): boolean {
        const emptyCell = findEmpty(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        shuffle(numbers);
        for (const num of numbers) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (fillGrid(grid)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    fillGrid(grid);

    // Remove cells to create blanks
    while (blank > 0) {
        const row = Math.floor(Math.random() * 9);
        const col = Math.floor(Math.random() * 9);
        if (grid[row][col] !== 0) {
            grid[row][col] = 0;
            blank--;
        }
    }

    return grid;
}

/**
 * Solves a Sudoku puzzle.
 * @param puzzle - The Sudoku grid.
 * @returns The solved grid or throws an error if unsolvable.
 */
function solve(puzzle: Array<Array<number>>): Array<Array<number>> {
    if (!validate(puzzle, true)) {
        throw new Error('Invalid puzzle');
    }

    function solveHelper(grid: Array<Array<number>>): boolean {
        const emptyCell = findEmpty(grid);
        if (!emptyCell) return true;

        const [row, col] = emptyCell;
        for (let num = 1; num <= 9; num++) {
            if (isValid(grid, row, col, num)) {
                grid[row][col] = num;
                if (solveHelper(grid)) return true;
                grid[row][col] = 0;
            }
        }
        return false;
    }

    const gridCopy = puzzle.map(row => [...row]);
    if (!solveHelper(gridCopy)) {
        throw new Error('Unsolvable puzzle');
    }

    return gridCopy;
}

export { generate, solve, validate };