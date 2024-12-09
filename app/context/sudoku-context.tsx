import { createContext } from "react";
import { noop } from "lodash";
import { SudokuContext } from "../types/sudoku";
import { getDefaultSudokuContext } from "../sudoku/sudoku";

export const DefaultSudokuContext = createContext<SudokuContext>({
  ...getDefaultSudokuContext(),
  switchMode: noop,
  togglePause: noop,
  updateElapsedTime: noop,
});
