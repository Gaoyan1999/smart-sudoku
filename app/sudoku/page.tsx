'use client';
import { KeyboardEventHandler, useState, useEffect } from 'react';
import { Sudoku } from '../types/sudoku';
import { remove, throttle } from 'lodash';
import { constructSudoku, getDefaultSudoku } from './sudoku';
import { getRelateCells } from '../utils/location';
import { ToolArea } from '../ui/sudoku/tool-area';
import { MainPlayground } from '../ui/sudoku/main-playground';
import { fillAllCandidate } from '../utils/sudoku-utils';
import { isSudokuFinished } from '../utils/sudoku-utils';
import { CongratsModal } from '../ui/sudoku/congrats-modal';
import { DefaultSudokuContext } from '../context/sudoku-context';
import { fetchNewSudokuPuzzleApi } from '../lib/sudoku-api-client';

export default function Page() {
  const [sudoku, setSudokuInternal] = useState<Sudoku>(getDefaultSudoku);
  const [showCongrats, setShowCongrats] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setSudokuInternal((sudoku) => ({
          ...sudoku,
          context: { ...sudoku.context, isLoading: true },
        }));
        const puzzleData = await fetchNewSudokuPuzzleApi('Expert');
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
    fetchData();
  }, []);

  function setSudoku(...arg: Parameters<typeof setSudokuInternal>) {
    if (sudoku.context.isPause || sudoku.context.isLoading) {
      return;
    }
    setSudokuInternal(...arg);
  }
  //   if (savedData) {
  //     try {
  //       setSudokuDataInternal(JSON.parse(savedData));
  //     } catch (e) {
  //       console.error("Failed to parse saved data");
  //     }
  //   }
  // }, []);

  // useEffect(() => {
  //   localStorage.setItem(
  //     LOCAL_STORAGE_KEY_SUDOKU_DATA,
  //     JSON.stringify(sudokuData)
  //   );
  // });
  // useEffect(() => {
  //   localStorage.setItem(
  //     LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  //     JSON.stringify(sudokuContext)
  //   );
  // });

  // ------------------------ START: sudoku data operation -------------------------------
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

  function resetSudoku() {
    setSudoku((sudoku) => {
      const matrix = sudoku.data.matrix;
      matrix.forEach((row) => {
        row.forEach((col) => {
          if (col.type !== 'known') {
            col.value = 0;
            col.notingCandidates = [];
          }
        });
      });
      return {
        ...sudoku,
        context: {
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

  // ------------------------ END: sudoku data operation -------------------------------

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

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
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
      setCellValue(rowIndex, colIndex, 0);
      setNotingCandidates(rowIndex, colIndex, 0);
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      if (sudoku.context.mode === 'normal') {
        setCellValue(rowIndex, colIndex, num);
        // check the sudoku is finished
        if (isSudokuFinished(matrix)) {
          setSudoku((sudoku) => ({
            ...sudoku,
            context: { ...sudoku.context, isFinished: true },
          }));
          setTimeout(() => {
            setShowCongrats(true);
          }, 100);
        }
        // remove the candidate numbers in related cells.
        getRelateCells({ rowIndex, colIndex }, matrix).filter((cell) => {
          remove(cell.notingCandidates, (value) => value === num);
        });
      } else {
        setNotingCandidates(rowIndex, colIndex, num);
      }
    }
  }, 100);

  return (
    <div
      className="p-4 flex h-full relative"
      style={{ outline: 'none' }}
      tabIndex={1}
      onKeyDown={handleKeyDown}
    >
      <DefaultSudokuContext.Provider
        value={{
          ...sudoku.context,
          switchMode,
          updateElapsedTime: () =>
            setSudoku((sudoku) => ({
              ...sudoku,
              context: {
                ...sudoku.context,
                elapsedTime: sudoku.context.elapsedTime + 1,
              },
            })),
          togglePause,
        }}
      >
        <div className="w-4/12">
          <ToolArea showAllCandidates={fillAllCandidates} />
        </div>
        <div className="w-auto">
          {<MainPlayground sudoku={sudoku} setPosition={setPosition} resetSudoku={resetSudoku} />}
        </div>
      </DefaultSudokuContext.Provider>

      <CongratsModal isOpen={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
}
