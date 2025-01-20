import { uniqBy } from 'lodash';
import { Position, SudokuCellWithPosition, SudokuCell, SudokuData } from '../types/sudoku';

export function isRelatedCell(targetA: Position, targetB: Position): boolean {
  // Check if either targetA or targetB is not defined
  if (!targetA || !targetB) {
    return false;
  }

  const { rowIndex: rowIndexA, colIndex: colIndexA } = targetA;
  const { rowIndex: rowIndexB, colIndex: colIndexB } = targetB;

  // Check if targetA and targetB are the same position
  if (rowIndexA === rowIndexB && colIndexA === colIndexB) {
    return false;
  }

  // Check if they are in the same row, column, or block
  return (
    isInSameRow(targetA, targetB) ||
    isInSameColumn(targetA, targetB) ||
    isInSameBlock(targetA, targetB)
  );
}

// Helper functions to determine relationships
function isInSameRow(posA: Position, posB: Position): boolean {
  return posA.rowIndex === posB.rowIndex;
}

function isInSameColumn(posA: Position, posB: Position): boolean {
  return posA.colIndex === posB.colIndex;
}

export function isInSameBlock(posA: Position, posB: Position): boolean {
  const blockStartRowIndex = Math.floor(posA.rowIndex / 3) * 3;
  const blockStartColIndex = Math.floor(posA.colIndex / 3) * 3;

  return (
    posB.rowIndex >= blockStartRowIndex &&
    posB.rowIndex < blockStartRowIndex + 3 &&
    posB.colIndex >= blockStartColIndex &&
    posB.colIndex < blockStartColIndex + 3
  );
}

export function getRelatedCells(position: Position, matrix: SudokuCell[][]) {
  const result: SudokuCellWithPosition[] = [];
  // block first, and then row and column
  const blockCells = getCellsInSameBlock(position, matrix);
  const rowCells = getCellsInSameRow(position, matrix);
  const columnCells = getCellsInSameColumn(position, matrix);
  result.push(...blockCells, ...rowCells, ...columnCells);
  return uniqBy(result, (cell) => `${cell.position.rowIndex}-${cell.position.colIndex}`);
}

export function getCellsInSameRow(
  position: Position,
  matrix: SudokuCell[][]
): SudokuCellWithPosition[] {
  return matrix[position.rowIndex]
    .map((cell, colIndex) => ({
      ...cell,
      position: { rowIndex: position.rowIndex, colIndex },
    }))
    .filter((cell) => cell.position.colIndex !== position.colIndex);
}

export function getCellsInSameColumn(
  position: Position,
  matrix: SudokuCell[][]
): SudokuCellWithPosition[] {
  const result: SudokuCellWithPosition[] = [];
  for (let i = 0; i < matrix.length; i++) {
    if (i === position.rowIndex) {
      continue;
    }
    result.push({
      ...matrix[i][position.colIndex],
      position: { rowIndex: i, colIndex: position.colIndex },
    });
  }
  return result;
}

export function getCellsInSameBlock(
  position: Position,
  matrix: SudokuCell[][]
): SudokuCellWithPosition[] {
  const blockStartRowIndex = Math.floor(position.rowIndex / 3) * 3;
  const blockStartColIndex = Math.floor(position.colIndex / 3) * 3;
  const result: SudokuCellWithPosition[] = [];
  for (let i = blockStartRowIndex; i < blockStartRowIndex + 3; i++) {
    for (let j = blockStartColIndex; j < blockStartColIndex + 3; j++) {
      if (i === position.rowIndex && j === position.colIndex) {
        continue;
      }
      result.push({ ...matrix[i][j], position: { rowIndex: i, colIndex: j } });
    }
  }
  return result;
}

export function getBlock(
  matrix: SudokuData['matrix'],
  blockIndex: number
): SudokuCellWithPosition[][] {
  const rowOffset = Math.floor(blockIndex / 3) * 3;
  const colOffset = (blockIndex % 3) * 3;  
  const block: SudokuCellWithPosition[][] = [];
  if (blockIndex < 0 || blockIndex > 8) {
    throw Error('Invalid block index');
  }
  for (let i = 0; i < 3; i++) {
    block.push(
      matrix[rowOffset + i].slice(colOffset, colOffset + 3).map((cell, j) => ({
        ...cell,
        position: { rowIndex: rowOffset + i, colIndex: colOffset + j },
      }))
    );
  }
  return block;
}
