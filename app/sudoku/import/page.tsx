'use client';

import { Sudoku } from '@/app/types/sudoku';
import { SudokuBody } from '@/app/ui/sudoku/sudoku-body';
import { KeyboardEventHandler, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getMakingNewPuzzleSudoku } from '../sudoku';
import { throttle } from 'lodash';
import { NumberInput } from '@/app/ui/sudoku/number-input';
import { Button } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { checkSudokuValid, initMatrix } from '@/app/utils/sudoku-utils';
import {
  ID_SUDOKU_IMPORT,
  LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU,
  LOCAL_STORAGE_KEY_SUDOKU_HISTORY,
} from '@/app/const';

function constructSudoku(data: { mission: string; solution: string }): Sudoku {
  return {
    data: {
      matrix: initMatrix(data.mission, data.solution),
      id: ID_SUDOKU_IMPORT,
      difficulty: 'Easy',
    },
    context: {
      mode: 'normal',
      isPause: false,
      isLoading: false,
      isFinished: false,
      isImportedByUser: true,
      elapsedTime: 0,
    },
  };
}

export default function Page() {
  const router = useRouter();
  const [sudoku, setSudoku] = useState<Sudoku>(getMakingNewPuzzleSudoku);
  // load data from local storage.
  useEffect(() => {
    const sudokuDataStr = localStorage.getItem(LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU);
    if (sudokuDataStr) {
      const sudokuData = JSON.parse(sudokuDataStr) as Sudoku;
      setSudoku(sudokuData);
    } else {
      setSudoku(getMakingNewPuzzleSudoku);
    }
  }, []);
  // watch the sudoku data
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU, JSON.stringify(sudoku));
  }, [sudoku]);
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
  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
    // Cell control
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    if (code === 'Escape') {
      setSudoku((sudoku) => {
        return {
          ...sudoku,
          context: {
            ...sudoku.context,
            selectedPosition: undefined,
          },
        };
      });
    } else if (code === 'ArrowLeft') {
      setPosition(rowIndex, colIndex - 1 < 0 ? 0 : colIndex - 1);
    } else if (code === 'ArrowRight') {
      setPosition(rowIndex, colIndex + 1 > 8 ? 8 : colIndex + 1);
    } else if (code === 'ArrowUp') {
      setPosition(rowIndex - 1 < 0 ? 0 : rowIndex - 1, colIndex);
    } else if (code === 'ArrowDown') {
      setPosition(rowIndex + 1 > 8 ? 8 : rowIndex + 1, colIndex);
    }
    if (sudoku.context.isFinished) {
      return;
    }
    // operation for cell value
    if (code === 'Backspace') {
      setCellValue(rowIndex, colIndex, 0);
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      setCellValue(rowIndex, colIndex, num);
    }
  }, 100);

  function setCellValue(rowIndex: number, colIndex: number, val: number) {
    const matrix = sudoku.data.matrix;
    const cell = matrix[rowIndex][colIndex];

    if (val < 0 || val > 9) {
      return;
    }
    cell.value = val;
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
  function handleNumberInput(num: number) {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    setCellValue(rowIndex, colIndex, num);
  }
  function handleDeleteAll() {
    setSudoku(() => {
      return { ...getMakingNewPuzzleSudoku() };
    });
  }

  function handleDeleteCell() {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    setCellValue(rowIndex, colIndex, 0);
  }

  function handleFinishMaking() {
    const { isValid, errorMessage, data } = checkSudokuValid(sudoku.data.matrix);
    if (!isValid) {
      alert(errorMessage);
      return;
    }
    // popup a dialog: saying that the sudoku is valid, and ask user to confirm if they want to play this sudoku.
    if (confirm('The sudoku is valid, and ask user to confirm if they want to play this sudoku.')) {
      // save the sudoku to local storage and navigate to main sudoku page
      const { mission, solution } = data!;

      const sudoku = constructSudoku({ mission, solution });
      localStorage.setItem(LOCAL_STORAGE_KEY_SUDOKU_HISTORY, JSON.stringify(sudoku));
      router.push('/sudoku');
    }
  }

  return (
    <div
      className="px-2 py-4 flex flex-col md:flex-row h-full relative md:space-x-4 space-y-4 md:space-y-0"
      style={{ outline: 'none' }}
      tabIndex={1}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-shrink-0 flex-grow">
        <SudokuBody sudoku={sudoku} setPosition={setPosition} />
      </div>
      <div className="flex-shrink-0">
        <div className="mt-4 flex flex-col gap-2">
          <Button variant="contained" onClick={handleDeleteAll} color="error">
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCell}
            disabled={!sudoku.context.selectedPosition}
          >
            Delete Cell
          </Button>
          <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleFinishMaking}>
            Complete & Play
          </Button>
        </div>
        <NumberInput handleNumberInput={handleNumberInput} />
      </div>
    </div>
  );
}
