import { Position, SudokuCell, SudokuData } from '../types/sudoku';
import { cloneDeep, uniq } from 'lodash';
import { getBlock, getCellsInSameColumn, getCellsInSameRow, getRelatedCells } from './location';

export function fillAllCandidate(matrix: SudokuData['matrix']) {
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      cell.notingCandidates = findMissingNumbers(
        uniq(
          getRelatedCells({ rowIndex, colIndex }, matrix)
            .filter((cell) => cell.value !== 0)
            .map((cell) => cell.value)
        )
      );
    });
  });
  return matrix;
}

export function findMissingNumbers(nums: number[]) {
  const results: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!nums.includes(i)) {
      results.push(i);
    }
  }
  return results;
}

export function initMatrix(mission: string, solution: string): SudokuCell[][] {
  const maxtrix: SudokuCell[][] = [];
  if (mission.length !== 81 || solution.length !== 81) {
    throw Error('Invalid input');
  }
  const missionRowsString: string[] = [];
  const solutionRowsString: string[] = [];
  for (let i = 0; i < 9; i++) {
    missionRowsString.push(mission.slice(i * 9, (i + 1) * 9));
    solutionRowsString.push(solution.slice(i * 9, (i + 1) * 9));
  }
  missionRowsString.forEach((rowString, rowIndex) => {
    const row: SudokuCell[] = [];
    maxtrix.push(row);
    for (let i = 0; i < rowString.length; i++) {
      const value = +rowString[i];

      row.push({
        value: value,
        type: value === 0 ? 'unknown' : 'known',
        realAnswer: +solutionRowsString[rowIndex][i],
        notingCandidates: [],
        actualCandidates: [],
      });
    }
  });

  // fill actualCandidates
  maxtrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (cell.type === 'unknown') {
        cell.actualCandidates = findMissingNumbers(
          uniq(
            getRelatedCells({ rowIndex, colIndex }, maxtrix)
              .filter((cell) => cell.value !== 0)
              .map((cell) => cell.value)
          )
        );
      }
    });
  });

  return maxtrix;
}

export function isSudokuFinished(matrix: SudokuCell[][]) {
  return matrix.every((row) =>
    row.every(
      (cell) => cell.type === 'known' || (cell.type === 'unknown' && cell.value === cell.realAnswer)
    )
  );
}

export function isAnsweredCell(cell: SudokuCell) {
  return cell.type === 'known' || (cell.type === 'unknown' && cell.value === cell.realAnswer);
}

export function renderCellPosition(position: Position) {
  return `(${position.rowIndex + 1},${position.colIndex + 1})`;
}

export function renderCellPositions(positions: Position[]) {
  return positions.map((position) => renderCellPosition(position)).join(',');
}

export function checkSudokuValid(matrix: SudokuCell[][]): {
  isValid: boolean;
  errorMessage?: string;
} {
  const existsDuplicateNumbers = (numbers: number[]) => {
    const uniqueNumbers = uniq(numbers);
    return numbers.length !== uniqueNumbers.length;
  };

  // check row
  for (let i = 0; i < 9; i++) {
    const rows = getCellsInSameRow({ rowIndex: i, colIndex: 0 }, matrix)
      .map((cell) => cell.value)
      .filter((cell) => cell !== 0);
    if (existsDuplicateNumbers(rows)) {
      return { isValid: false, errorMessage: 'Duplicate numbers in row #' + (i + 1) };
    }
  }
  // check column
  for (let i = 0; i < 9; i++) {
    const columns = getCellsInSameColumn({ rowIndex: 0, colIndex: i }, matrix)
      .map((cell) => cell.value)
      .filter((value) => value !== 0);
    if (existsDuplicateNumbers(columns)) {
      return { isValid: false, errorMessage: 'Duplicate numbers in column #' + (i + 1) };
    }
  }
  // check block
  for (let i = 0; i < 9; i++) {
    const blocks = getBlock(matrix, i)
      .flat()
      .map((cell) => cell.value)
      .filter((value) => value !== 0);
    if (existsDuplicateNumbers(blocks)) {
      return { isValid: false, errorMessage: 'Duplicate numbers in block #' + (i + 1) };
    }
  }
  // check if the sudoku can find exactly one solution
  const solutionCount = countSolutions(matrix);
  if (solutionCount.length === 0) {
    return { isValid: false, errorMessage: 'The sudoku has no solution' };
  }
  if (solutionCount.length > 1) {
    return { isValid: false, errorMessage: 'The sudoku has multiple solutions' };
  }
  return { isValid: true };
}

// Helper function to check if a number can be placed at a given position
function isValidPlacement(row: number, col: number, num: number, grid: SudokuCell[][]): boolean {
  const allRelatedCells = getRelatedCells({ rowIndex: row, colIndex: col }, grid);
  return allRelatedCells.every((cell) => cell.value !== num);
}

// Count the number of solutions for a sudoku puzzle
function countSolutions(matrix: SudokuCell[][]): { solution: SudokuCell[][] }[] {
  const grid: SudokuCell[][] = cloneDeep(matrix);
  const result: { solution: SudokuCell[][] }[] = [];

  function solve(): void {
    for (let row = 0; row < 9; row++) {
      for (let col = 0; col < 9; col++) {
        // Find empty cell (value === 0)
        if (grid[row][col].value === 0) {
          // Try numbers 1-9
          for (let num = 1; num <= 9; num++) {
            if (isValidPlacement(row, col, num, grid)) {
              // Place the number
              grid[row][col].value = num;

              // Recursively solve
              solve();

              // If we found 2 solutions, we can stop early (we only care about uniqueness)
              if (result.length >= 2) {
                // Backtrack and return early
                grid[row][col].value = 0;
                return;
              }

              // Backtrack to continue searching
              grid[row][col].value = 0;
            }
          }
          // No valid number found, backtrack
          return;
        }
      }
    }
    // All cells filled, solution found
    result.push({ solution: cloneDeep(grid) });
  }

  solve();
  return result;
}
