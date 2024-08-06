import "./main-playground.css";
import { KeyboardEventHandler, useState } from "react";
import { classNames } from "../utils/common.ts";
import { throttle } from "lodash";
import { isRelatedCell } from "../utils/location.ts";

type SudokuCell = {
  value: number;
  answer: number;
  type: "known" | "unknown" | "errorAnswer";
};
type SudokuAllData = {
  matrix: SudokuCell[][];
  selectedPosition?: { rowIndex: number; colIndex: number };
};

function initASudoku(): SudokuAllData {
  // TODO: mock it temporarily
  const data = {
    mission:
      "400800007350672004280000103000007000028300400070204916092405030800763009730000051",
    solution:
      "469831527351672894287549163946157382128396475573284916692415738815763249734928651",
  };
  return {
    matrix: fillCells(data.mission, data.solution),
    selectedPosition: undefined,
  };
}
function fillCells(mission: string, solution: string): SudokuCell[][] {
  const result: SudokuCell[][] = [];
  if (mission.length !== 81 || solution.length !== 81) {
    throw Error("Invalid input");
  }
  const missionRowsString: string[] = [];
  const solutionRowsString: string[] = [];
  for (let i = 0; i < 9; i++) {
    missionRowsString.push(mission.slice(i * 9, (i + 1) * 9));
    solutionRowsString.push(solution.slice(i * 9, (i + 1) * 9));
  }
  missionRowsString.forEach((rowString, rowIndex) => {
    const row: SudokuCell[] = [];
    result.push(row);
    for (let i = 0; i < rowString.length; i++) {
      const value = +rowString[i];

      row.push({
        value: value,
        type: value === 0 ? "unknown" : "known",
        answer: +solutionRowsString[rowIndex][i],
      });
    }
  });

  return result;
}

export function MainPlayground() {
  const [sudokuData, setSudokuData] = useState(initASudoku());
  const selectedValue = getSelectCell()?.value;

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

  function getSelectCell() {
    if (!sudokuData.selectedPosition) return;
    const { rowIndex, colIndex } = sudokuData.selectedPosition;
    return sudokuData.matrix[rowIndex][colIndex];
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
          {sudokuData.matrix.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className={
                rowIndex === 2 || rowIndex === 5
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
                        "bg-blue-200": isSelected(rowIndex, colIndex),
                        "bg-neutral-200": sudokuData.selectedPosition
                          ? isRelatedCell(
                              { rowIndex, colIndex },
                              sudokuData.selectedPosition,
                            ) &&
                            // keep highlight background color of same value cells.
                            (selectedValue !== cell.value ||
                              selectedValue === 0)
                          : false,
                        "text-blue-800": cell.type === "unknown",
                        "text-red-500": cell.value !== cell.answer,
                        "bg-blue-600 text-white":
                          cell.value === selectedValue && cell.value !== 0,

                        "border-solid border-r border-r-black":
                          colIndex == 2 || colIndex === 5,
                      })
                    }
                    key={colIndex}
                    onClick={() => onTdClick(rowIndex, colIndex)}
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

/**
 * TODO List
 *
 *
 *
 * improvement:
 * 1. Add animation when moving the selected cell.
 * 2. save to local storage
 */
