// Define a type for position
import { SudokuCell } from "../types/sudoku.ts";

export type Position = {
  rowIndex: number;
  colIndex: number;
};

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

function isInSameBlock(posA: Position, posB: Position): boolean {
  const blockStartRowIndex = Math.floor(posA.rowIndex / 3) * 3;
  const blockStartColIndex = Math.floor(posA.colIndex / 3) * 3;

  return (
    posB.rowIndex >= blockStartRowIndex &&
    posB.rowIndex < blockStartRowIndex + 3 &&
    posB.colIndex >= blockStartColIndex &&
    posB.colIndex < blockStartColIndex + 3
  );
}

export function getRelateCells(position: Position, matrix: SudokuCell[][]) {
  const result: SudokuCell[] = [];
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      if (isRelatedCell(position, { rowIndex, colIndex })) {
        result.push(cell);
      }
    });
  });
  return result;
}
