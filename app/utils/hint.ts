import { SudokeCellWithPosition, SudokuData, SudokuHint } from '../types/sudoku';
import { getRelateCells } from './location';
import { isValidCell } from './sudoku-utils';

export function getHint(matrix: SudokuData['matrix']) {
  const hint = isOnlyOneCandidate(matrix);
  console.log(hint);
  return hint;
}
// rule 1: There is only one candidate number in the cell.
function isOnlyOneCandidate(matrix: SudokuData['matrix']): SudokuHint | undefined {
  for (let i = 0; i < matrix.length; i++) {
    for (let j = 0; j < matrix[i].length; j++) {
      const cell = matrix[i][j];
      if (cell.type === 'unknown' && cell.actualCandidates.length === 1) {
        const answer = cell.actualCandidates[0];
        const numberSet = new Set<number>();
        const relatedCellsResult: SudokeCellWithPosition[] = [];
        const relatedValidCells = getRelateCells({ rowIndex: i, colIndex: j }, matrix).filter(
          isValidCell
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
          rule: 'onlyOneCandidate',
          answer,
          relatedCells: relatedCellsResult,
          hintMessage: `There is only one candidate number: ${answer} in the cell at (${i + 1}, ${j + 1})`,
        };
      }
    }
  }
  return undefined;
}
