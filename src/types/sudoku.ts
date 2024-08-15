export type SudokuCell = {
  value: number;
  realAnswer: number;
  // Candidate numbers entered by the user in the current cell (user's notes), representing potential solutions for this cell.
  // These are the notes the user makes to track possible values before making the final decision.
  notingCandidates: number[];
  type: "known" | "unknown" | "errorAnswer";
};

export type SudokuData = {
  matrix: SudokuCell[][];
  selectedPosition?: { rowIndex: number; colIndex: number };
};

export type SudoKuContext = SudokuDataContext & SudokuContextUpdateFunc;

export type SudokuDataContext = {
  mode: "normal" | "noting";
  isPause: boolean;
  // unit: second
  elapsedTime: number;
};

type SudokuContextUpdateFunc = {
  switchMode: () => void;
  togglePause: () => void;
  updateElapsedTime: (val: number) => void;
}