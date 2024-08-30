import "../style/main-playground.css";
import { classNames } from "../utils/common.ts";
import { isRelatedCell } from "../utils/location.ts";
import { SudokuData } from "../types/sudoku.ts";
import { NotingCell } from "./noting-cell.tsx";
import { useContext } from "react";
import { SudokuContext } from "./root.tsx";
import PlayCircleOutlineIcon from "@mui/icons-material/PlayCircleOutline";
import { blue } from "@mui/material/colors";

export function MainPlayground({
  matrix,
  selectedPosition,
  setPosition,
}: SudokuData & { setPosition: (rowIndex: number, colIndex: number) => void }) {
  const { isPause, togglePause } = useContext(SudokuContext);

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
    <div className="relative">
      {isPause ? (
        <div className="pause-mask cursor-pointer" onClick={togglePause}>
          <PlayCircleOutlineIcon sx={{ color: blue[800], fontSize: "60px" }} />
        </div>
      ) : null}
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
                        "bg-blue-200":
                          isSelected(rowIndex, colIndex) && !isPause,
                        "bg-neutral-200":
                          selectedPosition && !isPause
                            ? isRelatedCell(
                                { rowIndex, colIndex },
                                selectedPosition,
                              ) &&
                              // keep highlight background color of same value cells.
                              (selectedValue !== cell.value ||
                                selectedValue === 0)
                            : false,
                      })
                    }
                    onClick={() => onTdClick(rowIndex, colIndex)}
                  >
                    {isPause && <div className="noting-cell"></div>}
                    {!isPause && showNotingCell && (
                      <NotingCell
                        selectNumber={selectedValue}
                        notingNumbers={cell.notingCandidates}
                      />
                    )}
                    {!isPause && !showNotingCell && (
                      <div
                        className={classNames({
                          "normal-mode-cell": true,
                          "text-blue-800": cell.type === "unknown",
                          "bg-blue-600":
                            cell.value === selectedValue && cell.value !== 0,
                          "bg-blue-600 text-white":
                            cell.value === selectedValue &&
                            cell.value !== 0 &&
                            cell.value === cell.realAnswer,
                          "text-red-500": cell.value !== cell.realAnswer,
                        })}
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
    </div>
  );
}

/**
 * TODO List
 * improvement:
 * 1. Add animation when moving the selected cell.
 */
