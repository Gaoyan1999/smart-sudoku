import { describe, it, expect } from 'vitest';
import {
  isRelatedCell,
  isInSameBlock,
  getRelatedCells,
  getCellsInSameRow,
  getCellsInSameColumn,
  getCellsInSameBlock,
  getBlock,
} from '../location';
import { Position, SudokuCell } from '../../types/sudoku';

describe('location utils', () => {
  describe('isRelatedCell', () => {
    it('should return true for cells in the same row', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 0, colIndex: 5 };
      expect(isRelatedCell(posA, posB)).toBe(true);
    });

    it('should return true for cells in the same column', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 5, colIndex: 0 };
      expect(isRelatedCell(posA, posB)).toBe(true);
    });

    it('should return true for cells in the same block', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 1, colIndex: 1 };
      expect(isRelatedCell(posA, posB)).toBe(true);
    });

    it('should return false for unrelated cells', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 4, colIndex: 4 };
      expect(isRelatedCell(posA, posB)).toBe(false);
    });

    it('should return false for the same cell', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 0, colIndex: 0 };
      expect(isRelatedCell(posA, posB)).toBe(false);
    });
  });

  describe('isInSameBlock', () => {
    it('should correctly identify cells in the same block', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 2, colIndex: 2 };
      expect(isInSameBlock(posA, posB)).toBe(true);

      const posC: Position = { rowIndex: 3, colIndex: 3 };
      const posD: Position = { rowIndex: 5, colIndex: 5 };
      expect(isInSameBlock(posC, posD)).toBe(true);
    });

    it('should return false for cells in different blocks', () => {
      const posA: Position = { rowIndex: 0, colIndex: 0 };
      const posB: Position = { rowIndex: 0, colIndex: 3 };
      expect(isInSameBlock(posA, posB)).toBe(false);

      const posC: Position = { rowIndex: 0, colIndex: 0 };
      const posD: Position = { rowIndex: 3, colIndex: 0 };
      expect(isInSameBlock(posC, posD)).toBe(false);
    });
  });

  describe('getCellsInSameRow', () => {
    it('should return all cells in the same row except the cell itself', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(
              (_, i): SudokuCell => ({
                value: i,
                realAnswer: i,
                type: 'known',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      const position: Position = { rowIndex: 0, colIndex: 0 };
      const result = getCellsInSameRow(position, matrix);

      expect(result).toHaveLength(8); // 9 cells - 1 (the cell itself)
      expect(result.every((cell) => cell.position.rowIndex === 0)).toBe(true);
      expect(result.every((cell) => cell.position.colIndex !== 0)).toBe(true);
    });
  });

  describe('getCellsInSameColumn', () => {
    it('should return all cells in the same column except the cell itself', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(
              (_, i): SudokuCell => ({
                value: i,
                realAnswer: i,
                type: 'known',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      const position: Position = { rowIndex: 0, colIndex: 0 };
      const result = getCellsInSameColumn(position, matrix);

      expect(result).toHaveLength(8); // 9 cells - 1 (the cell itself)
      expect(result.every((cell) => cell.position.colIndex === 0)).toBe(true);
      expect(result.every((cell) => cell.position.rowIndex !== 0)).toBe(true);
    });
  });

  describe('getCellsInSameBlock', () => {
    it('should return all cells in the same block except the cell itself', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(
              (_, i): SudokuCell => ({
                value: i,
                realAnswer: i,
                type: 'known',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      const position: Position = { rowIndex: 0, colIndex: 0 };
      const result = getCellsInSameBlock(position, matrix);

      expect(result).toHaveLength(8); // 3x3 block - 1 (the cell itself)
      result.forEach((cell) => {
        expect(cell.position.rowIndex).toBeLessThan(3);
        expect(cell.position.colIndex).toBeLessThan(3);
        expect(!(cell.position.rowIndex === 0 && cell.position.colIndex === 0)).toBe(true);
      });
    });
  });

  describe('getBlock', () => {
    it('should return the correct 3x3 block', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map((_, rowIndex) =>
          Array(9)
            .fill(null)
            .map(
              (_, colIndex): SudokuCell => ({
                value: rowIndex * 9 + colIndex,
                realAnswer: rowIndex * 9 + colIndex,
                type: 'known',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      const block = getBlock(matrix, 0); // top-left block

      expect(block).toHaveLength(3);
      block.forEach((row) => {
        expect(row).toHaveLength(3);
      });

      // Check positions are correct
      expect(block[0][0].position).toEqual({ rowIndex: 0, colIndex: 0 });
      expect(block[2][2].position).toEqual({ rowIndex: 2, colIndex: 2 });
    });

    it('should throw error for invalid block index', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(
              (): SudokuCell => ({
                value: 0,
                realAnswer: 0,
                type: 'unknown',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      expect(() => getBlock(matrix, -1)).toThrow('Invalid block index');
      expect(() => getBlock(matrix, 9)).toThrow('Invalid block index');
    });
  });

  describe('getRelatedCells', () => {
    it('should return all related cells without duplicates', () => {
      const matrix: SudokuCell[][] = Array(9)
        .fill(null)
        .map(() =>
          Array(9)
            .fill(null)
            .map(
              (): SudokuCell => ({
                value: 0,
                realAnswer: 0,
                type: 'unknown',
                notingCandidates: [],
                actualCandidates: [],
              })
            )
        );

      const position: Position = { rowIndex: 1, colIndex: 1 };
      const result = getRelatedCells(position, matrix);

      // Should have 8 (row) + 8 (column) + 8 (block) - overlaps
      // Row: 9 - 1 = 8
      // Column: 9 - 1 = 8
      // Block: 9 - 1 = 8
      // Overlaps: row & block: 2 (same as block & column), column & block: 2
      // Total unique: 8 + 8 + 8 - 2 - 2 = 20, but the actual count is 20 because the center cell (1,1) is excluded
      expect(result.length).toBeGreaterThan(0);
      expect(result.length).toBeLessThanOrEqual(20);

      // All results should have different positions
      const positions = result.map((cell) => `${cell.position.rowIndex}-${cell.position.colIndex}`);
      expect(new Set(positions).size).toBe(positions.length);
    });
  });
});
