import { SudokuCell, SudokuData } from '../types/sudoku';
import { uniq } from 'lodash';
import { getRelatedCells } from './location';

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

function findMissingNumbers(nums: number[]) {
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
        )
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
