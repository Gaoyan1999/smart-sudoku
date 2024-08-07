export type SudokuCell = {
  value: number;
  answer: number;
  type: "known" | "unknown" | "errorAnswer";
};

export type SudokuData = {
  matrix: SudokuCell[][];
  selectedPosition?: { rowIndex: number; colIndex: number };
};

export type SudoKuContext = {
  mode: "normal" | "noting";
  isPause: boolean;
  switchMode: ()=> void;
  togglePause: ()=> void;
};
