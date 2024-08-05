import "./main-playground.css";
import { useState } from "react";

type SudokuCell = {
  value: number;
  type: "known" | "unknown" | "errorAnswer";
};
type SudokuAllData = {
  matrix: SudokuCell[][];
};

function initASudoku(): SudokuAllData {
  // TODO: mock it temporarily
  return {
    matrix: fillCells(
      "902730400080049000370051920000000057210000396000910080531000072640500830007003540",
    ),
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
  const [sudokuData] = useState(initASudoku());

  return (
    <>
      <table>
        {sudokuData.matrix.map((row) => (
          <tr>
            {row.map((cell) => (
              <td className="sudoku-cell">{cell.value}</td>
            ))}
          </tr>
        ))}
      </table>
    </>
  );
}
