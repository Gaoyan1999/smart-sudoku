import "./main-playground.css";
import { classNames } from "../utils/common.ts";
import { isRelatedCell } from "../utils/location.ts";
import { SudokuData } from "../types/sudoku.ts";

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
              return (
                <td
                  className={
                    "cursor-pointer sudoku-cell" +
                    classNames({
                      "bg-blue-200": isSelected(rowIndex, colIndex),
                      "bg-neutral-200": selectedPosition
                        ? isRelatedCell(
                            { rowIndex, colIndex },
                            selectedPosition,
                          ) &&
                          // keep highlight background color of same value cells.
                          (selectedValue !== cell.value || selectedValue === 0)
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
