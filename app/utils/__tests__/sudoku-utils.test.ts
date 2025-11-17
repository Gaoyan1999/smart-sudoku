import { describe, it, expect } from 'vitest';
import {
  findMissingNumbers,
  initMatrix,
  isSudokuFinished,
  isAnsweredCell,
  renderCellPosition,
  renderCellPositions,
  checkSudokuValid,
} from '../sudoku-utils';
import { SudokuCell, Position } from '../../types/sudoku';
import { getDefaultSudoku } from '../../sudoku/sudoku';

describe('sudoku-utils', () => {
  describe('findMissingNumbers', () => {
    it('should find all missing numbers from 1-9', () => {
      expect(findMissingNumbers([1, 2, 3])).toEqual([4, 5, 6, 7, 8, 9]);
      expect(findMissingNumbers([5, 7, 9])).toEqual([1, 2, 3, 4, 6, 8]);
    });

    it('should return all numbers 1-9 when input is empty', () => {
      expect(findMissingNumbers([])).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    });

    it('should return empty array when all numbers are present', () => {
      expect(findMissingNumbers([1, 2, 3, 4, 5, 6, 7, 8, 9])).toEqual([]);
    });
  });

  describe('initMatrix', () => {
    it('should create a valid sudoku matrix from strings', () => {
      const mission = '0'.repeat(81); // all empty cells
      const solution = '123456789'.repeat(9); // simple pattern

      const matrix = initMatrix(mission, solution);

      expect(matrix).toHaveLength(9);
      matrix.forEach((row) => {
        expect(row).toHaveLength(9);
      });
    });

    it('should throw error for invalid input length', () => {
      const mission = '0'.repeat(80); // invalid length
      const solution = '1'.repeat(81);

      expect(() => initMatrix(mission, solution)).toThrow('Invalid input');
    });

    it('should correctly set cell types based on mission', () => {
      const mission = '1' + '0'.repeat(80); // first cell filled
      const solution = '1' + '2'.repeat(80);

      const matrix = initMatrix(mission, solution);

      expect(matrix[0][0].type).toBe('known');
      expect(matrix[0][0].value).toBe(1);
      expect(matrix[0][1].type).toBe('unknown');
      expect(matrix[0][1].value).toBe(0);
    });
  });

  describe('isSudokuFinished', () => {
    it('should return true when all cells are correctly answered', () => {
      const matrix: SudokuCell[][] = [
        [
          { value: 1, realAnswer: 1, type: 'known', notingCandidates: [], actualCandidates: [] },
          { value: 2, realAnswer: 2, type: 'unknown', notingCandidates: [], actualCandidates: [] },
        ],
      ];

      expect(isSudokuFinished(matrix)).toBe(true);
    });

    it('should return false when some cells are not answered', () => {
      const matrix: SudokuCell[][] = [
        [
          { value: 1, realAnswer: 1, type: 'known', notingCandidates: [], actualCandidates: [] },
          { value: 0, realAnswer: 2, type: 'unknown', notingCandidates: [], actualCandidates: [] },
        ],
      ];

      expect(isSudokuFinished(matrix)).toBe(false);
    });

    it('should return false when a cell has wrong answer', () => {
      const matrix: SudokuCell[][] = [
        [
          { value: 1, realAnswer: 1, type: 'known', notingCandidates: [], actualCandidates: [] },
          { value: 3, realAnswer: 2, type: 'unknown', notingCandidates: [], actualCandidates: [] },
        ],
      ];

      expect(isSudokuFinished(matrix)).toBe(false);
    });
  });

  describe('isAnsweredCell', () => {
    it('should return true for known cells', () => {
      const cell: SudokuCell = {
        value: 5,
        realAnswer: 5,
        type: 'known',
        notingCandidates: [],
        actualCandidates: [],
      };
      expect(isAnsweredCell(cell)).toBe(true);
    });

    it('should return true for unknown cells with correct answer', () => {
      const cell: SudokuCell = {
        value: 5,
        realAnswer: 5,
        type: 'unknown',
        notingCandidates: [],
        actualCandidates: [],
      };
      expect(isAnsweredCell(cell)).toBe(true);
    });

    it('should return false for unknown cells with wrong or no answer', () => {
      const cell1: SudokuCell = {
        value: 0,
        realAnswer: 5,
        type: 'unknown',
        notingCandidates: [],
        actualCandidates: [],
      };
      const cell2: SudokuCell = {
        value: 3,
        realAnswer: 5,
        type: 'unknown',
        notingCandidates: [],
        actualCandidates: [],
      };
      expect(isAnsweredCell(cell1)).toBe(false);
      expect(isAnsweredCell(cell2)).toBe(false);
    });
  });

  describe('renderCellPosition', () => {
    it('should format position correctly', () => {
      const position: Position = { rowIndex: 0, colIndex: 0 };
      expect(renderCellPosition(position)).toBe('(1,1)');

      const position2: Position = { rowIndex: 4, colIndex: 7 };
      expect(renderCellPosition(position2)).toBe('(5,8)');
    });
  });

  describe('renderCellPositions', () => {
    it('should format multiple positions correctly', () => {
      const positions: Position[] = [
        { rowIndex: 0, colIndex: 0 },
        { rowIndex: 1, colIndex: 2 },
        { rowIndex: 4, colIndex: 7 },
      ];
      expect(renderCellPositions(positions)).toBe('(1,1),(2,3),(5,8)');
    });
  });

  describe('solveSudoku', () => {
    it('should solve a valid sudoku puzzle', () => {
      const sudoku = getDefaultSudoku();
      const matrix = sudoku.data.matrix;
      expect(checkSudokuValid(matrix).isValid).toBe(true);
    });
  });
});
