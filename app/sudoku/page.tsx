'use client';
import './page.css';
import { KeyboardEventHandler, useState, useEffect } from 'react';
import { throttle } from 'lodash';
import { ToolArea } from '../ui/sudoku/tool-area';
import { MainPlayground } from '../ui/sudoku/main-playground';
import { isSudokuFinished } from '../utils/sudoku-utils';
import { CongratsModal } from '../ui/sudoku/congrats-modal';
import { Timer } from '../ui/timer';
import { useSudoku } from '../context/sudoku-provider';

export default function Page() {
  const {
    sudoku,
    setSudoku,
    fillAllCandidates,
    togglePause,
    setPosition,
    handleNumberInput,
    handleDeleteCell,
    switchMode,
  } = useSudoku();
  const [showCongrats, setShowCongrats] = useState(false);

  // Check if sudoku is finished and show congrats modal
  useEffect(() => {
    if (isSudokuFinished(sudoku.data.matrix) && sudoku.context.isFinished) {
      setTimeout(() => {
        setShowCongrats(true);
      }, 100);
    }
  }, [sudoku.context.isFinished, sudoku.data.matrix]);

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
    if (sudoku.context.isFinished) {
      return;
    }
    if (sudoku.context.isPause && code !== 'Space') {
      return;
    }
    // mode control and some shortcut
    if (code === 'Space') {
      togglePause();
    }
    if (code === 'KeyX') {
      switchMode();
    } else if (code === 'KeyC') {
      fillAllCandidates();
    }

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
      handleDeleteCell();
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      handleNumberInput(num);
    }
  }, 100);

  return (
    <div
      className="px-2 py-4 flex flex-col md:flex-row h-full relative md:space-x-4 space-y-4 md:space-y-0"
      style={{ outline: 'none' }}
      tabIndex={1}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-shrink-0 flex-grow">
        <MainPlayground />
      </div>
      <div className="flex-shrink-0">
        <div className="hidden md:flex justify-end">
          <Timer />
        </div>
        <ToolArea />
      </div>

      <CongratsModal isOpen={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
}
