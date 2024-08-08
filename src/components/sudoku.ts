import { SudokuData, SudokuCell, SudoKuContext } from "../types/sudoku.ts";
import { isEmpty, uniq } from "lodash";
import { getRelateCells } from "../utils/location.ts";
import {
  LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  LOCAL_STORAGE_KEY_SUDOKU_DATA,
} from "../const.ts";

export function initSudoKuContext(): Pick<SudoKuContext, "mode" | "isPause"> {
  const jsonString: string | null = localStorage.getItem(
    LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  );
  const defaultValue: Pick<SudoKuContext, "mode" | "isPause"> = {
    mode: "normal",
    isPause: false,
  };
  if (isEmpty(jsonString) || jsonString === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString) as Pick<SudoKuContext, "mode" | "isPause">;
  } catch (e) {
    return defaultValue;
  }
}

export function initASudokuData(): SudokuData {
  // TODO: mock it temporarily
  const data = {
    mission:
      "400800007350672004280000103000007000028300400070204916092405030800763009730000051",
    solution:
      "469831527351672894287549163946157382128396475573284916692415738815763249734928651",
  };
  const defaultValue = {
    matrix: fillCells(data.mission, data.solution),
    selectedPosition: undefined,
  };

  const jsonString: string | null = localStorage.getItem(
    LOCAL_STORAGE_KEY_SUDOKU_DATA,
  );
  if (isEmpty(jsonString) || jsonString === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString) as SudokuData;
  } catch (e) {
    return defaultValue;
  }
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
        realAnswer: +solutionRowsString[rowIndex][i],
        notingCandidates: [],
      });
    }
  });

  return result;
}

function findMissingNumbers(nums: number[]) {
  const results: number[] = [];
  for (let i = 1; i <= 9; i++) {
    if (!nums.includes(i)) {
      results.push(i);
    }
  }
  return results;
}

export function fillAllCandidate(matrix: SudokuData["matrix"]) {
  matrix.forEach((row, rowIndex) => {
    row.forEach((cell, colIndex) => {
      cell.notingCandidates = findMissingNumbers(
        uniq(
          getRelateCells({ rowIndex, colIndex }, matrix)
            .filter((cell) => cell.value !== 0)
            .map((cell) => cell.value),
        ),
      );
    });
  });
  return matrix;
}
