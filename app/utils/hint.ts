import { uniqBy } from 'lodash';
import { SudokeCellWithPosition, SudokuData, SudokuHint } from '../types/sudoku';
import {
  getCellsInSameBlock,
  getCellsInSameColumn,
  getCellsInSameRow,
  getRelatedCells,
} from './location';
import { isAnsweredCell } from './sudoku-utils';
export function getHint(matrix: SudokuData['matrix']) {
  const rules = [isSoleCandidate, isUniqueSolution];
  for (const rule of rules) {
    const hint = rule(matrix);
    if (hint) {
      console.log(hint);
      return hint;
    }
  }
  return undefined;
}
// rule 1 Sole Candidate Method: There is only one candidate number in the cell.
function isSoleCandidate(matrix: SudokuData['matrix']): SudokuHint | undefined {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const cell = matrix[i][j];
      if (cell.type === 'unknown' && cell.actualCandidates.length === 1) {
        const answer = cell.actualCandidates[0];
        const numberSet = new Set<number>();
        const relatedCellsResult: SudokeCellWithPosition[] = [];
        const relatedValidCells = getRelatedCells({ rowIndex: i, colIndex: j }, matrix).filter(
          isAnsweredCell
        );
        relatedValidCells.forEach((cell) => {
          if (!numberSet.has(cell.value)) {
            numberSet.add(cell.value);
            relatedCellsResult.push(cell);
          }
        });
        return {
          position: { rowIndex: i, colIndex: j },
          ruleType: 'fillCellDirectly',
          rule: 'soleCandidate',
          answer,
          highlightCells: relatedCellsResult,
          hintMessage: `There is only one candidate number: ${answer} in the cell at (${i + 1}, ${j + 1})`,
        };
      }
    }
  }
  return undefined;
}
// rule 2 Unique Solution Method: There is only one solution for the row, column or block.
function isUniqueSolution(matrix: SudokuData['matrix']): SudokuHint | undefined {
  function isUniqueSolutionInternal(
    targetCell: SudokeCellWithPosition,
    relatedCells: SudokeCellWithPosition[],
    type: 'row' | 'column' | 'block'
  ): SudokuHint | undefined {
    // collect all the candidates in the related cells
    const candidates: number[] = [];
    relatedCells.forEach((cell) => {
      candidates.push(...cell.actualCandidates);
    });
    const candidatesSet = new Set(candidates);
    const uniqueCandidate = targetCell.actualCandidates.find((val) => !candidatesSet.has(val));

    if (!uniqueCandidate) {
      return undefined;
    }
    const highlightCells: SudokeCellWithPosition[] = [];
    relatedCells
      .filter((cell) => !isAnsweredCell(cell))
      .forEach((cell) => {
        const highlightCell = getRelatedCells(cell.position, matrix)
          .filter(isAnsweredCell)
          .find((cell) => cell.realAnswer === uniqueCandidate);
        if (highlightCell) {
          highlightCells.push(highlightCell);
        }
      });
    return {
      position: targetCell.position,
      ruleType: 'fillCellDirectly',
      rule: 'uniqueSolution',
      answer: uniqueCandidate,
      highlightCells: uniqBy(
        highlightCells,
        (cell) => `${cell.position.rowIndex}-${cell.position.colIndex}`
      ),
      hintMessage: `There is only one solution for the ${type} at (${targetCell.position.rowIndex + 1}, ${targetCell.position.colIndex + 1})`,
    };
  }

  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const cell = { ...matrix[i][j], position: { rowIndex: i, colIndex: j } };
      if (cell.type !== 'unknown') {
        continue;
      }

      const checkLocations = [
        { getCells: getCellsInSameBlock, type: 'block' },
        { getCells: getCellsInSameRow, type: 'row' },
        { getCells: getCellsInSameColumn, type: 'column' },
      ] as const;

      for (const { getCells, type } of checkLocations) {
        const hint = isUniqueSolutionInternal(cell, getCells(cell.position, matrix), type);
        if (hint) {
          return hint;
        }
      }
    }
  }
  return undefined;
}
