import { cloneDeep, remove, uniqBy } from 'lodash';
import { SudokuCellWithPosition, SudokuData, SudokuHint } from '../types/sudoku';
import {
  getBlock,
  getBlockIndex,
  getCellsInSameBlock,
  getCellsInSameColumn,
  getCellsInSameRow,
  getColumn,
  getRelatedCells,
  getRow,
  isInSameBlock,
} from './location';
import { isAnsweredCell, isUnansweredCell, renderCellPositions } from './sudoku-utils';

export function getHint(matrix: SudokuData['matrix']) {
  const rules = [
    isSoleCandidate,
    isUniqueSolution,
    blockColumnRowIntersectionElimination,
    rowIntersectionElimination,
    columnIntersectionElimination,
  ];
  for (const rule of rules) {
    const hint = rule(matrix);
    if (hint) {
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
        const relatedCellsResult: SudokuCellWithPosition[] = [];
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
          secondaryCells: relatedCellsResult,
          highlightUnits: [],
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
    targetCell: SudokuCellWithPosition,
    relatedCells: SudokuCellWithPosition[],
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
    const highlightCells: SudokuCellWithPosition[] = [];
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
      secondaryCells: uniqBy(
        highlightCells,
        (cell) => `${cell.position.rowIndex}-${cell.position.colIndex}`
      ),
      highlightUnits: [],
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
// rule3: Block-Column/Row INtersection Elimination.
// In block 1, number 6 can only be placed in cells (2,1) and (2,2), then 6 cannot appear in any other cells in column 2,
// so candidate 6 can be removed from (x,2).
function blockColumnRowIntersectionElimination(
  matrix: SudokuData['matrix']
): SudokuHint | undefined {
  for (let blockIndex = 0; blockIndex < 9; blockIndex++) {
    // key: candidate number, value: cells with this candidate number
    const candidatesMap = new Map<number, SudokuCellWithPosition[]>();
    const cells = getBlock(matrix, blockIndex);
    cells
      .flat()
      .filter((cell) => !isAnsweredCell(cell))
      .forEach((cell) => {
        cell.actualCandidates.forEach((candidate) => {
          if (candidatesMap.has(candidate)) {
            candidatesMap.get(candidate)!.push(cell);
          } else {
            candidatesMap.set(candidate, [cell]);
          }
        });
      });
    for (const [candidate, cells] of [...candidatesMap.entries()].filter(
      ([, cells]) => cells.length <= 3
    )) {
      const rowIndex = cells[0].position.rowIndex;
      const colIndex = cells[0].position.colIndex;
      const isInSameRow = cells.every((cell) => cell.position.rowIndex === rowIndex);
      const isInSameColumn = cells.every((cell) => cell.position.colIndex === colIndex);
      if (isInSameRow || isInSameColumn) {
        const sameLine = isInSameRow
          ? getRow(cells[0].position.rowIndex, matrix)
          : getColumn(cells[0].position.colIndex, matrix);

        const sameLineNotSameBlock = sameLine.filter(
          (cell) => !isAnsweredCell(cell) && !isInSameBlock(cells[0].position, cell.position)
        );

        const candidateCells = sameLineNotSameBlock.filter(
          (cell) => !!cell.actualCandidates.find((val) => val === candidate)
        );

        if (candidateCells.length > 0) {
          const lineType = isInSameRow ? 'row' : 'column';
          const lineIndex = isInSameRow ? rowIndex : colIndex;

          return {
            ruleType: 'excludeCandidate',
            rule: 'intersectionElimination',
            excludeNumber: candidate,
            primaryCells: candidateCells,
            secondaryCells: cells,
            highlightUnits: [
              {
                type: 'block',
                index: blockIndex,
                hasBorder: true,
              },
              {
                type: lineType,
                index: lineIndex,
                hasBorder: false,
              },
            ],
            hintMessage: `In block ${blockIndex + 1}, number ${candidate} can only be placed in cells ${renderCellPositions(cells.map((c) => c.position))},
             then Number: ${candidate} cannot appear in any other cells in ${lineType} ${lineIndex + 1},
             so candidate ${candidate} can be removed from ${renderCellPositions(candidateCells.map((c) => c.position))}.`,
          };
        }
        break;
      }
    }
  }
  return undefined;
}

function rowIntersectionElimination(matrix: SudokuData['matrix']): SudokuHint | undefined {
  // loop each row
  for (let i = 0; i < 9; i++) {
    const cells = getRow(i, matrix);
    // key: candidate number, value: cells with this candidate number
    const candidatesMap = new Map<number, SudokuCellWithPosition[]>();
    cells
      .filter((cell) => !isAnsweredCell(cell))
      .forEach((cell) => {
        cell.actualCandidates.forEach((candidate) => {
          if (candidatesMap.has(candidate)) {
            candidatesMap.get(candidate)!.push(cell);
          } else {
            candidatesMap.set(candidate, [cell]);
          }
        });
      });
    for (const [candidate, cells] of [...candidatesMap.entries()].filter(
      ([, cells]) => cells.length <= 3
    )) {
      // check cells are in the same block
      const inSameBlock = cells.every((cell) => isInSameBlock(cells[0].position, cell.position));
      if (!inSameBlock) {
        continue;
      }
      const blockIndex = getBlockIndex(cells[0].position);
      const sameBlockNotSameRow = getBlock(matrix, blockIndex)
        .flat()
        .filter((cell) => cell.position.rowIndex !== i)
        .filter(isUnansweredCell);
      const candidateCells = sameBlockNotSameRow.filter((cell) =>
        cell.actualCandidates.includes(candidate)
      );
      if (candidateCells.length > 0) {
        return {
          ruleType: 'excludeCandidate',
          rule: 'intersectionElimination',
          excludeNumber: candidate,
          primaryCells: candidateCells,
          secondaryCells: cells,
          highlightUnits: [],
          hintMessage: `In row ${i + 1}, number ${candidate} can only be placed in cells ${renderCellPositions(cells.map((c) => c.position))},
          then Number: ${candidate} cannot appear in any other cells in Block ${blockIndex + 1}, so candidate ${candidate} can be removed from ${renderCellPositions(candidateCells.map((c) => c.position))}.`,
        };
      }
    }
  }
  return undefined;
}

function columnIntersectionElimination(matrix: SudokuData['matrix']): SudokuHint | undefined {
  // loop each column
  for (let j = 0; j < 9; j++) {
    const cells = getColumn(j, matrix);
    // key: candidate number, value: cells with this candidate number
    const candidatesMap = new Map<number, SudokuCellWithPosition[]>();
    cells
      .filter((cell) => !isAnsweredCell(cell))
      .forEach((cell) => {
        cell.actualCandidates.forEach((candidate) => {
          if (candidatesMap.has(candidate)) {
            candidatesMap.get(candidate)!.push(cell);
          } else {
            candidatesMap.set(candidate, [cell]);
          }
        });
      });
    for (const [candidate, cells] of [...candidatesMap.entries()].filter(
      ([, cells]) => cells.length <= 3
    )) {
      // check cells are in the same block
      const inSameBlock = cells.every((cell) => isInSameBlock(cells[0].position, cell.position));
      if (!inSameBlock) {
        continue;
      }
      const blockIndex = getBlockIndex(cells[0].position);
      const sameBlockNotSameColumn = getBlock(matrix, blockIndex)
        .flat()
        .filter((cell) => cell.position.colIndex !== j)
        .filter(isUnansweredCell);
      const candidateCells = sameBlockNotSameColumn.filter((cell) =>
        cell.actualCandidates.includes(candidate)
      );
      if (candidateCells.length > 0) {
        return {
          ruleType: 'excludeCandidate',
          rule: 'intersectionElimination',
          excludeNumber: candidate,
          primaryCells: candidateCells,
          secondaryCells: cells,
          highlightUnits: [],
          hintMessage: `In column ${j + 1}, number ${candidate} can only be placed in cells ${renderCellPositions(cells.map((c) => c.position))},
          then Number: ${candidate} cannot appear in any other cells in Block ${blockIndex + 1}, so candidate ${candidate} can be removed from ${renderCellPositions(candidateCells.map((c) => c.position))}.`,
        };
      }
    }
  }
  return undefined;
}

export function applyExcludeCandidateHint(
  hint: SudokuHint,
  matrix: SudokuData['matrix']
): SudokuData['matrix'] {
  if (hint.ruleType !== 'excludeCandidate') {
    return matrix;
  }
  const updatedMatrix = cloneDeep(matrix);
  const { excludeNumber, primaryCells } = hint;
  primaryCells.forEach(({ position }) => {
    const cell = updatedMatrix[position.rowIndex][position.colIndex];
    if (cell.type !== 'unknown') {
      return;
    }
    remove(cell.actualCandidates, (candidate) => candidate === excludeNumber);
    remove(cell.notingCandidates, (candidate) => candidate === excludeNumber);
  });
  return updatedMatrix;
}
