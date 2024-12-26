import { createContext } from "react";
import { noop } from "lodash";
import { SudokuContext, SudokuContextUpdateFunc } from "../types/sudoku";
import { getDefaultSudoku } from "../sudoku/sudoku";

export const DefaultSudokuContext = createContext<SudokuContext & SudokuContextUpdateFunc>({
  ...getDefaultSudoku().context,
  switchMode: noop,
  togglePause: noop,
  updateElapsedTime: noop,
});
