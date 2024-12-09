import { createContext } from "react";
import { noop } from "lodash";
import { SudoKuContext } from "../types/sudoku";

export const SudokuContext = createContext<SudoKuContext>({
  mode: "normal",
  isPause: false,
  isFinished: false,
  elapsedTime: 0,
  switchMode: noop,
  togglePause: noop,
  updateElapsedTime: noop,
}); 