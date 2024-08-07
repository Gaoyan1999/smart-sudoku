export type SudokuCell = {
  value: number;
  realAnswer: number;
  // TODO: comment
  notingCandidates: number[];
  type: "known" | "unknown" | "errorAnswer";
};

export type SudokuData = {
  matrix: SudokuCell[][];
  selectedPosition?: { rowIndex: number; colIndex: number };
};

export type SudoKuContext = {
  mode: "normal" | "noting";
  isPause: boolean;
  switchMode: () => void;
  togglePause: () => void;
};
