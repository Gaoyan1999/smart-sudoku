'use client';

import { Sudoku } from '@/app/types/sudoku';
import { SudokuBody } from '@/app/ui/sudoku/sudoku-body';
import { KeyboardEventHandler, useState } from 'react';
import { getMakingNewPuzzleSudoku } from '../sudoku';
import { throttle } from 'lodash';

export default function Page() {
  const [sudoku, setSudoku] = useState<Sudoku>(getMakingNewPuzzleSudoku);
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
    const matrix = sudoku.data.matrix;
    const targetCell = matrix[rowIndex][colIndex];
    if (targetCell.type !== 'unknown') {
      return;
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

    if (cell.type !== 'unknown' || val < 0 || val > 9) {
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

  return (
    <div style={{ outline: 'none' }} tabIndex={1} onKeyDown={handleKeyDown}>
      <div className="flex-shrink-0 flex-grow">
        <SudokuBody sudoku={sudoku} setPosition={setPosition} />
      </div>
    </div>
  );
}
