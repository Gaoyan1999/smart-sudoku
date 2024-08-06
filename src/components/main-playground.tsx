import "./main-playground.css";
import { KeyboardEventHandler, useState } from "react";
import { classNames } from "../utils/common.ts";
import { throttle } from "lodash";

type SudokuCell = {
  value: number;
  type: "known" | "unknown" | "errorAnswer";
};
type SudokuAllData = {
  matrix: SudokuCell[][];
  selectedPosition?: { rowIndex: number; colIndex: number };
};

function initASudoku(): SudokuAllData {
  // TODO: mock it temporarily
  return {
    matrix: fillCells(
      "902730400080049000370051920000000057210000396000910080531000072640500830007003540",
    ),
    selectedPosition: undefined,
  };
}
function fillCells(val: string): SudokuCell[][] {
  const result: SudokuCell[][] = [];
  if (val.length !== 81) {
    throw Error("Invalid input");
  }
  const rowsString: string[] = [];
  for (let i = 0; i < 9; i++) {
    rowsString.push(val.slice(i * 9, (i + 1) * 9));
  }
  rowsString.forEach((rowString) => {
    const row: SudokuCell[] = [];
    result.push(row);
    for (let i = 0; i < rowString.length; i++) {
      const value = +rowString[i];
      row.push({ value: value, type: value === 0 ? "unknown" : "known" });
    }
  });

  return result;
}

export function MainPlayground() {
  const [sudokuData, setSudokuData] = useState(initASudoku());

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    if (!sudokuData.selectedPosition) return;
    const { rowIndex, colIndex } = sudokuData.selectedPosition;
    const code = event.code;
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
    }
    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      setCellValue(rowIndex, colIndex, +code[5]);
    } else if (code === "Backspace") {
      setCellValue(rowIndex, colIndex, 0);
    }
  }, 100);
  function isSelected(i: number, j: number) {
    if (!sudokuData.selectedPosition) return false;
    const { rowIndex, colIndex } = sudokuData.selectedPosition;

    return rowIndex === i && colIndex === j;
  }
  function onTdClick(rowIndex: number, colIndex: number) {
    setPosition(rowIndex, colIndex);
  }

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

  return (
    <div className="p-4">
      <table className="sudoku-table" tabIndex={1} onKeyDown={handleKeyDown}>
        <tbody>
          {sudokuData.matrix.map((row, rowIdx) => (
            <tr
              key={rowIdx}
              className={
                rowIdx === 2 || rowIdx === 5
                  ? "border-solid border-b border-b-black"
                  : undefined
              }
            >
              {row.map((cell, colIndex) => {
                return (
                  <td
                    className={
                      "cursor-pointer sudoku-cell" +
                      classNames({
                        "bg-blue-200": isSelected(rowIdx, colIndex),
                        "text-blue-700": cell.type === "unknown",
                        "border-solid border-r border-r-black":
                          colIndex == 2 || colIndex === 5,
                      })
                    }
                    key={colIndex}
                    onClick={() => onTdClick(rowIdx, colIndex)}
                  >
                    {cell.value === 0 ? undefined : cell.value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
