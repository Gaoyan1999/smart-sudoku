import { MainPlayground } from "./components/main-playground.tsx";
import { ToolArea } from "./components/tool-area.tsx";
import { createContext, KeyboardEventHandler, useState } from "react";
import { SudoKuContext } from "./types/sudoku.ts";
import { noop, remove, throttle } from "lodash";
import { fillAllCandidate, initASudoku } from "./components/sudoku.ts";
import { getRelateCells } from "./utils/location.ts";

export const SudokuContext = createContext<
  SudoKuContext & { switchMode: () => void }
>({
  mode: "normal",
  isPause: false,
  switchMode: noop,
  togglePause: noop,
});

export default function MyApp() {
  const [sudokuContext, setSudokuContext] = useState<
    Pick<SudoKuContext, "mode" | "isPause">
  >({
    mode: "normal",
    isPause: false,
  });

  const [sudokuData, setSudokuData] = useState(initASudoku());

  function switchMode() {
    setSudokuContext((ctx) => ({
      ...ctx,
      mode: ctx.mode === "normal" ? "noting" : "normal",
    }));
  }

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
    // mode control and some shortcut
    if (code === "KeyX") {
      switchMode();
      return;
    }
    if (code === "KeyC") {
      setSudokuData((data) => ({
        ...data,
        matrix: fillAllCandidate(sudokuData.matrix),
      }));
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
          switchMode: switchMode,
          togglePause: () =>
            setSudokuContext((ctx) => ({ ...ctx, isPause: !ctx.isPause })),
        }}
      >
        <div className="w-4/12">
          <ToolArea />
        </div>
        <div className="w-8/12">
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
