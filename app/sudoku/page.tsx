'use client';
import './page.css';
import { KeyboardEventHandler, useState, useEffect } from 'react';
import { Sudoku, SudokuDifficulty } from '../types/sudoku';
import { remove, throttle, uniq } from 'lodash';
import { constructSudoku, getDefaultSudoku } from './sudoku';
import { getRelatedCells } from '../utils/location';
import { ToolArea } from '../ui/sudoku/tool-area';
import { MainPlayground } from '../ui/sudoku/main-playground';
import { fillAllCandidate, findMissingNumbers } from '../utils/sudoku-utils';
import { isSudokuFinished } from '../utils/sudoku-utils';
import { CongratsModal } from '../ui/sudoku/congrats-modal';
import { DefaultSudokuContext } from '../context/sudoku-context';
import { fetchNewSudokuPuzzleApi } from '../lib/sudoku-api-client';
import { LOCAL_STORAGE_KEY_SUDOKU_HISTORY, MOCK_SUDOKU_ID } from '../const';
import { getHint } from '../utils/hint';

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

  function setSudoku(...arg: Parameters<typeof setSudokuInternal>) {
    if (sudoku.context.isPause || sudoku.context.isLoading || sudoku.context.mode === 'hint') {
      return;
    }
    setSudokuInternal(...arg);
  }
  useEffect(() => {
    if (sudoku.data.id !== MOCK_SUDOKU_ID) {
      localStorage.setItem(LOCAL_STORAGE_KEY_SUDOKU_HISTORY, JSON.stringify(sudoku));
    }
  }, [sudoku]);
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

  function handleNumberInput(num: number) {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    if (sudoku.context.mode === 'normal') {
      setCellValue(rowIndex, colIndex, num);
    } else {
      setNotingCandidates(rowIndex, colIndex, num);
    }
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
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        data: {
          ...sudoku.data,
          matrix,
        },
      };
    });

    if (isSudokuFinished(sudoku.data.matrix)) {
      setSudoku((sudoku) => ({
        ...sudoku,
        context: { ...sudoku.context, isFinished: true },
      }));
      setTimeout(() => {
        setShowCongrats(true);
      }, 100);
    }
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
      setCellValue(rowIndex, colIndex, 0);
      setNotingCandidates(rowIndex, colIndex, 0);
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      handleNumberInput(num);
    }
  }, 100);

  // ------------------------ START: hint -------------------------------
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

  // ------------------------ END: hint -------------------------------

  return (
    <div
      className="px-2 py-4 flex flex-col md:flex-row h-full relative md:space-x-4 space-y-4 md:space-y-0"
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
        <div className="flex-shrink-0 flex-grow">
          {
            <MainPlayground
              sudoku={sudoku}
              setPosition={setPosition}
              resetSudoku={resetSudoku}
              setDifficulty={setDifficulty}
            />
          }
        </div>
        <div className="flex-shrink-0">
          <ToolArea
            sudoku={sudoku}
            showAllCandidates={fillAllCandidates}
            handleNumberInput={handleNumberInput}
            getHint={getOneHint}
            rejectHint={clearHint}
            applyHint={applyHint}
          />
        </div>
      </DefaultSudokuContext.Provider>

      <CongratsModal isOpen={showCongrats} onClose={() => setShowCongrats(false)} />
    </div>
  );
}
