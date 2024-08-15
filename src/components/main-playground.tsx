import "../style/main-playground.css";
import { classNames } from "../utils/common.ts";
import { isRelatedCell } from "../utils/location.ts";
import { SudokuData } from "../types/sudoku.ts";
import { NotingCell } from "./noting-cell.tsx";

export function MainPlayground({
  matrix,
  selectedPosition,
  setPosition,
}: SudokuData & { setPosition: (rowIndex: number, colIndex: number) => void }) {
  const selectedValue = getSelectCell()?.value;

  function isSelected(i: number, j: number) {
    if (!selectedPosition) return false;
    const { rowIndex, colIndex } = selectedPosition;

    return rowIndex === i && colIndex === j;
  }
  function onTdClick(rowIndex: number, colIndex: number) {
    setPosition(rowIndex, colIndex);
  }

  function getSelectCell() {
    if (!selectedPosition) return;
    const { rowIndex, colIndex } = selectedPosition;
    return matrix[rowIndex][colIndex];
  }

  return (
    <table className="sudoku-table">
      <tbody>
        {matrix.map((row, rowIndex) => (
          <tr
            key={rowIndex}
            className={
              rowIndex === 2 || rowIndex === 5
                ? "border-solid border-b border-b-black"
                : undefined
            }
          >
            {row.map((cell, colIndex) => {
              const showNotingCell =
                cell.value === 0 && cell.notingCandidates.length > 0;
              return (
                <td
                  key={colIndex}
                  className={
                    "sudoku-cell cursor-pointer" +
                    classNames({
                      // border setting
                      "border-solid border-r border-r-black":
                        colIndex == 2 || colIndex === 5,
                      // background setting
                      "bg-blue-200": isSelected(rowIndex, colIndex),
                      "bg-neutral-200": selectedPosition
                        ? isRelatedCell(
                            { rowIndex, colIndex },
                            selectedPosition,
                          ) &&
                          // keep highlight background color of same value cells.
                          (selectedValue !== cell.value || selectedValue === 0)
                        : false,
                    })
                  }
                  onClick={() => onTdClick(rowIndex, colIndex)}
                >
                  {showNotingCell && (
                    <NotingCell
                      selectNumber={selectedValue}
                      notingNumbers={cell.notingCandidates}
                    />
                  )}
                  {!showNotingCell && (
                    <div
                      className={
                        "normal-mode-cell" +
                        classNames({
                          "text-blue-800": cell.type === "unknown",
                          "bg-blue-600":
                            cell.value === selectedValue && cell.value !== 0,
                          "bg-blue-600 text-white":
                            cell.value === selectedValue &&
                            cell.value !== 0 &&
                            cell.value === cell.realAnswer,
                          "text-red-500": cell.value !== cell.realAnswer,
                        })
                      }
                    >
                      {cell.value === 0 ? undefined : cell.value}
                    </div>
                  )}
                </td>
              );
            })}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

/**
 * TODO List
 * improvement:
 * 1. Add animation when moving the selected cell.
 */
