import {
  SudokuData,
  SudokuDataContext,
} from "../types/sudoku.ts";
import { isEmpty } from "lodash";
import {
  LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  LOCAL_STORAGE_KEY_SUDOKU_DATA,
} from "../const.ts";
import { fillCells } from "../utils/cell-calculation.ts";

export function initSudoKuContext(): SudokuDataContext {
  const jsonString: string | null = localStorage.getItem(
    LOCAL_STORAGE_KEY_SUDOKU_CONTEXT,
  );
  const defaultValue: SudokuDataContext = {
    mode: "normal",
    isPause: false,
    elapsedTime: 0,
  };
  if (isEmpty(jsonString) || jsonString === null) {
    return defaultValue;
  }
  try {
    return JSON.parse(jsonString) as SudokuDataContext;
  } catch (e) {
    return defaultValue;
  }
}

export function initSudokuData(): SudokuData {
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
