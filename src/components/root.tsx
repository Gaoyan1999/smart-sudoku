import {
  createContext,
  KeyboardEventHandler,
  useEffect,
  useState,
} from "react";
import { SudoKuContext, SudokuDataContext } from "../types/sudoku.ts";
import { noop, remove, throttle } from "lodash";
import { initSudoKuContext, initSudokuData } from "./sudoku.ts";
import { getRelateCells } from "../utils/location.ts";
import { ToolArea } from "./tool-area.tsx";
import { MainPlayground } from "./main-playground.tsx";
import { fillAllCandidate } from "../utils/cell-calculation.ts";
import { InformationBar } from "./information-bar.tsx";
import {
  LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  LOCAL_STORAGE_KEY_SUDOKU_DATA,
} from "../const.ts";

export const SudokuContext = createContext<SudoKuContext>({
  mode: "normal",
  isPause: false,
  elapsedTime: 0,
  switchMode: noop,
  togglePause: noop,
  updateElapsedTime: noop,
});

export default function Root() {
  const [sudokuContext, setSudokuContext] =
    useState<SudokuDataContext>(initSudoKuContext);
  const [sudokuData, setSudokuDataInternal] = useState(initSudokuData);

  function setSudokuData(...arg: Parameters<typeof setSudokuDataInternal>) {
    if (sudokuContext.isPause) {
      return;
    }
    return setSudokuDataInternal(...arg);
  }

  function togglePause() {
    setSudokuContext((ctx) => ({ ...ctx, isPause: !ctx.isPause }));
  }

  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_SUDOKU_DATA,
      JSON.stringify(sudokuData),
    );
  });
  useEffect(() => {
    localStorage.setItem(
      LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
      JSON.stringify(sudokuContext),
    );
  });

  function switchMode() {
    setSudokuContext((ctx) => ({
      ...ctx,
      mode: ctx.mode === "normal" ? "noting" : "normal",
    }));
  }

  function fillAddCandidates() {
    setSudokuData((data) => ({
      ...data,
      matrix: fillAllCandidate(sudokuData.matrix),
    }));
  }

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
    event.preventDefault();
    if (sudokuContext.isPause && code !== "Space") {
      return;
    }
    // mode control and some shortcut
    if (code === "Space") {
      togglePause();
    }
    if (code === "KeyX") {
      switchMode();
    } else if (code === "KeyC") {
      fillAddCandidates();
    }

    // Cell control
    if (!sudokuData.selectedPosition) return;
    const { rowIndex, colIndex } = sudokuData.selectedPosition;
    if (code === "Escape") {
      setSudokuData({ ...sudokuData, selectedPosition: undefined });
    } else if (code === "ArrowLeft") {
      setPosition(rowIndex, colIndex - 1 < 0 ? 0 : colIndex - 1);
    } else if (code === "ArrowRight") {
      setPosition(rowIndex, colIndex + 1 > 8 ? 8 : colIndex + 1);
    } else if (code === "ArrowUp") {
      setPosition(rowIndex - 1 < 0 ? 0 : rowIndex - 1, colIndex);
    } else if (code === "ArrowDown") {
      setPosition(rowIndex + 1 > 8 ? 8 : rowIndex + 1, colIndex);
    }
    const matrix = sudokuData.matrix;
    const targetCell = matrix[rowIndex][colIndex];
    if (targetCell.type !== "unknown") {
      return;
    } else if (code === "Backspace") {
      setCellValue(rowIndex, colIndex, 0);
      setNotingCandidates(rowIndex, colIndex, 0);
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      if (sudokuContext.mode === "normal") {
        setCellValue(rowIndex, colIndex, num);
        // remove the candidate numbers in related cells.
        getRelateCells({ rowIndex, colIndex }, matrix).filter((cell) => {
          remove(cell.notingCandidates, (value) => value === num);
        });
        setSudokuData((data) => ({
          ...data,
          matrix: fillAllCandidate(sudokuData.matrix),
        }));
      } else {
        setNotingCandidates(rowIndex, colIndex, num);
      }
    }
  }, 100);
  function setPosition(rowIndex: number, colIndex: number) {
    setSudokuData({
      ...sudokuData,
      selectedPosition: { rowIndex, colIndex },
    });
  }
  function setCellValue(rowIndex: number, colIndex: number, val: number) {
    const matrix = sudokuData.matrix;
    const cell = matrix[rowIndex][colIndex];
    if (cell.type !== "unknown" || val < 0 || val > 9) {
      return;
    }
    cell.value = val;
    setSudokuData({ ...sudokuData, matrix });
  }
  function setNotingCandidates(
    rowIndex: number,
    colIndex: number,
    candidateNumber: number,
  ) {
    const matrix = sudokuData.matrix;
    const cell = matrix[rowIndex][colIndex];
    if (cell.type !== "unknown" || candidateNumber < 0 || candidateNumber > 9) {
      return;
    }
    if (candidateNumber === 0) {
      cell.notingCandidates = [];
      setSudokuData({ ...sudokuData, matrix });
      return;
    }

    const { notingCandidates } = cell;
    const idx = notingCandidates.findIndex((num) => num === candidateNumber);
    if (idx === -1) {
      notingCandidates.push(candidateNumber);
    } else {
      notingCandidates.splice(idx, 1);
    }
    setSudokuData({ ...sudokuData, matrix });
  }

  return (
    <div
      className="p-4 flex h-full"
      style={{ outline: "none" }}
      tabIndex={1}
      onKeyDown={handleKeyDown}
    >
      <SudokuContext.Provider
        value={{
          ...sudokuContext,
          switchMode,
          updateElapsedTime: () =>
            setSudokuContext((ctx) => ({
              ...ctx,
              elapsedTime: ctx.elapsedTime + 1,
            })),
          togglePause,
        }}
      >
        <div className="w-4/12">
          <ToolArea showAllCandidates={fillAddCandidates} />
        </div>
        <div className="w-auto">
          <InformationBar />
          <MainPlayground
            matrix={sudokuData.matrix}
            selectedPosition={sudokuData.selectedPosition}
            setPosition={setPosition}
          />
        </div>
      </SudokuContext.Provider>
    </div>
  );
}
