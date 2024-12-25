"use client";
import { SudokuData, SudokuDataContext } from "../types/sudoku";
import { fillCells } from "../utils/sudoku-utils";

export function getDefaultSudokuContext(): SudokuDataContext {
  return {
    mode: "normal",
    isPause: false,
    elapsedTime: 0,
    isFinished: false,
  };
}

export function getDefaultSudokuData(): SudokuData {
  const data = {
    mission: "400800007350672004280000103000007000028300400070204916092405030800763009730000051",
    solution: "469831527351672894287549163946157382128396475573284916692415738815763249734928651",
  };
  
  return {
    matrix: fillCells(data.mission, data.solution),
    selectedPosition: undefined,
  };
}