'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sudoku, SudokuDifficulty } from '../types/sudoku';
import { remove, uniq } from 'lodash';
import { constructSudoku, getDefaultSudoku } from '../sudoku/sudoku';
import { getRelatedCells } from '../utils/location';
import { fillAllCandidate, findMissingNumbers, isSudokuFinished } from '../utils/sudoku-utils';
import { fetchNewSudokuPuzzleApi } from '../lib/sudoku-api-client';
import { LOCAL_STORAGE_KEY_SUDOKU_HISTORY, MOCK_SUDOKU_ID } from '../const';
import { getHint } from '../utils/hint';

export interface SudokuContextValue {
  sudoku: Sudoku;
  // Core operations
  setSudoku: (updater: Sudoku | ((prev: Sudoku) => Sudoku)) => void;
  fillAllCandidates: () => void;
  togglePause: () => void;
  updateElapsedTime: () => void;
  setPosition: (rowIndex: number, colIndex: number) => void;
  handleNumberInput: (num: number) => void;
  handleDeleteCell: () => void;
  setCellValue: (rowIndex: number, colIndex: number, val: number) => void;
  setNotingCandidates: (rowIndex: number, colIndex: number, candidateNumber: number) => void;
  exitOwnPuzzle: () => Promise<void>;
  setDifficulty: (difficulty: SudokuDifficulty) => Promise<void>;
  resetSudoku: () => void;
  switchMode: () => void;
  getOneHint: () => void;
  applyHint: () => void;
  clearHint: () => void;
}

const SudokuContext = createContext<SudokuContextValue | undefined>(undefined);

export function SudokuProvider({ children }: { children: ReactNode }) {
  const [sudoku, setSudokuInternal] = useState<Sudoku>(getDefaultSudoku);

  // Initialize from localStorage or fetch from server
  useEffect(() => {
    async function fetchData() {
      try {
        setSudokuInternal((sudoku) => ({
          ...sudoku,
          context: { ...sudoku.context, isLoading: true },
        }));
        const puzzleData = await fetchNewSudokuPuzzleApi('Easy');
        if (puzzleData) {
          setSudokuInternal(constructSudoku(puzzleData));
          setSudokuInternal((sudoku) => ({
            ...sudoku,
            context: { ...sudoku.context, isLoading: false },
          }));
        }
      } catch (err) {
        console.error(err);
      }
    }
    // read from local storage at first, if not found, fetch from server.
    const sudokuDataStr = localStorage.getItem(LOCAL_STORAGE_KEY_SUDOKU_HISTORY);
    if (sudokuDataStr) {
      const sudokuData = JSON.parse(sudokuDataStr) as Sudoku;
      sudokuData.context.isLoading = false;
      setSudokuInternal(sudokuData);
    } else {
      fetchData();
    }
  }, []);

  // Save to localStorage when sudoku changes
  useEffect(() => {
    if (sudoku.data.id !== MOCK_SUDOKU_ID) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUDOKU_HISTORY, JSON.stringify(sudoku));
    }
  }, [sudoku]);

  // Protected setSudoku that respects pause/loading/hint mode
  function setSudoku(updater: Sudoku | ((prev: Sudoku) => Sudoku)) {
    if (sudoku.context.isPause || sudoku.context.isLoading || sudoku.context.mode === 'hint') {
      return;
    }
    if (typeof updater === 'function') {
      setSudokuInternal(updater);
    } else {
      setSudokuInternal(updater);
    }
  }

  function fillAllCandidates() {
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        data: {
          ...sudoku.data,
          matrix: fillAllCandidate(sudoku.data.matrix),
        },
      };
    });
  }

  function togglePause() {
    setSudokuInternal((sudoku) => {
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          isPause: !sudoku.context.isPause,
        },
      };
    });
  }

  function updateElapsedTime() {
    setSudoku((sudoku) => ({
      ...sudoku,
      context: {
        ...sudoku.context,
        elapsedTime: sudoku.context.elapsedTime + 1,
      },
    }));
  }

  function setPosition(rowIndex: number, colIndex: number) {
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          selectedPosition: { rowIndex, colIndex },
        },
      };
    });
  }

  function handleNumberInput(num: number) {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    if (sudoku.context.mode === 'normal') {
      setCellValue(rowIndex, colIndex, num);
    } else {
      setNotingCandidates(rowIndex, colIndex, num);
    }
  }

  function handleDeleteCell() {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    setCellValue(rowIndex, colIndex, 0);
  }

  function setCellValue(rowIndex: number, colIndex: number, val: number) {
    const matrix = sudoku.data.matrix;
    const cell = matrix[rowIndex][colIndex];
    const isCorrect = cell.realAnswer === val;
    // remove the candidate numbers in related cells.
    if (isCorrect) {
      cell.actualCandidates = [];
      cell.notingCandidates = [];
      getRelatedCells({ rowIndex, colIndex }, sudoku.data.matrix).forEach((cell) => {
        remove(cell.notingCandidates, (value) => value === val);
        remove(cell.actualCandidates, (value) => value === val);
      });
    }

    if (cell.type !== 'unknown' || val < 0 || val > 9) {
      return;
    }
    cell.value = val;

    // Check if finished before updating state
    const isFinished = isSudokuFinished(matrix);

    setSudoku((sudoku) => {
      return {
        ...sudoku,
        data: {
          ...sudoku.data,
          matrix,
        },
        context: isFinished ? { ...sudoku.context, isFinished: true } : sudoku.context,
      };
    });
  }

  function setNotingCandidates(rowIndex: number, colIndex: number, candidateNumber: number) {
    const matrix = sudoku.data.matrix;
    const cell = matrix[rowIndex][colIndex];
    if (cell.type !== 'unknown' || candidateNumber < 0 || candidateNumber > 9) {
      return;
    }
    if (candidateNumber === 0) {
      cell.notingCandidates = [];
      setSudoku((sudoku) => {
        return {
          ...sudoku,
          data: {
            ...sudoku.data,
            matrix,
          },
        };
      });
      return;
    }

    const { notingCandidates } = cell;
    const idx = notingCandidates.findIndex((num) => num === candidateNumber);
    if (idx === -1) {
      notingCandidates.push(candidateNumber);
    } else {
      notingCandidates.splice(idx, 1);
    }
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        data: {
          ...sudoku.data,
          matrix,
        },
      };
    });
  }

  async function exitOwnPuzzle() {
    if (!confirm('Are you sure you want to exit your own puzzle?')) {
      return;
    }
    setSudokuInternal((sudoku) => ({
      ...sudoku,
      context: { ...sudoku.context, isLoading: true },
    }));
    // TODO: back to previous sudoku
    const puzzleData = await fetchNewSudokuPuzzleApi('Easy');

    if (puzzleData) {
      setSudokuInternal(constructSudoku(puzzleData));
    }
  }

  async function setDifficulty(difficulty: SudokuDifficulty) {
    if (
      !confirm(
        `Are you sure you want to change difficulty to ${difficulty}? Current progress will be lost.`
      )
    ) {
      return;
    }
    setSudokuInternal((sudoku) => ({
      ...sudoku,
      context: { ...sudoku.context, isLoading: true },
    }));
    const puzzleData = await fetchNewSudokuPuzzleApi(difficulty);

    if (puzzleData) {
      setSudokuInternal(constructSudoku(puzzleData));
    }
  }

  function resetSudoku() {
    setSudoku((sudoku) => {
      const matrix = sudoku.data.matrix;
      matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
          if (cell.type !== 'known') {
            cell.value = 0;
            cell.notingCandidates = [];
          }

          if (cell.type === 'unknown') {
            cell.actualCandidates = findMissingNumbers(
              uniq(
                getRelatedCells({ rowIndex, colIndex }, matrix)
                  .filter((cell) => cell.value !== 0)
                  .map((cell) => cell.value)
              )
            );
          }
        });
      });
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          selectedPosition: undefined,
          elapsedTime: 0,
          isPause: false,
          isFinished: false,
          isLoading: false,
          mode: 'normal',
        },
      };
    });
  }

  function switchMode() {
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          mode: sudoku.context.mode === 'normal' ? 'noting' : 'normal',
        },
      };
    });
  }

  function getOneHint() {
    const hint = getHint(sudoku.data.matrix);
    if (!hint) {
      alert('No hint found');
      return;
    }
    if (hint.ruleType === 'fillCellDirectly') {
      setSudokuInternal((sudoku) => ({
        ...sudoku,
        context: { ...sudoku.context, hint, mode: 'hint', selectedPosition: hint.position },
      }));
    } else {
      setSudokuInternal((sudoku) => ({
        ...sudoku,
        context: { ...sudoku.context, hint, mode: 'hint', selectedPosition: undefined },
      }));
    }
  }

  function applyHint() {
    if (!sudoku.context.hint) {
      return;
    }
    const { ruleType } = sudoku.context.hint;
    if (ruleType === 'fillCellDirectly') {
      const { position, answer } = sudoku.context.hint;
      setCellValue(position.rowIndex, position.colIndex, answer);
    } else {
      // TODO: implement exclude candidate
    }
    clearHint();
  }

  function clearHint() {
    setSudokuInternal((sudoku) => ({
      ...sudoku,
      context: { ...sudoku.context, hint: undefined, mode: 'normal' },
    }));
  }

  const value: SudokuContextValue = {
    sudoku,
    setSudoku,
    fillAllCandidates,
    togglePause,
    updateElapsedTime,
    setPosition,
    handleNumberInput,
    handleDeleteCell,
    setCellValue,
    setNotingCandidates,
    exitOwnPuzzle,
    setDifficulty,
    resetSudoku,
    switchMode,
    getOneHint,
    applyHint,
    clearHint,
  };

  return <SudokuContext.Provider value={value}>{children}</SudokuContext.Provider>;
}

export function useSudoku() {
  const context = useContext(SudokuContext);
  if (context === undefined) {
    throw new Error('useSudoku must be used within a SudokuProvider');
  }
  return context;
}
