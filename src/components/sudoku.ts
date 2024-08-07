import { SudokuData, SudokuCell } from "../types/sudoku.ts";

export function initASudoku(): SudokuData {
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
