export type SudokuCell = {
  value: number;
  realAnswer: number;
  // Candidate numbers entered by the user in the current cell (user's notes), representing potential solutions for this cell.
  // These are the notes the user makes to track possible values before making the final decision.
  notingCandidates: number[];
  type: 'known' | 'unknown' | 'errorAnswer';
};

export type SudokuData = {
  id: string;
  difficulty: SudokuDifficulty;
  matrix: SudokuCell[][];
};

export type SudokuContext = {
  mode: 'normal' | 'noting';
  isPause: boolean;
  isLoading: boolean;
  isFinished: boolean;
  // unit: second
  elapsedTime: number;
  selectedPosition?: { rowIndex: number; colIndex: number };
};

export type SudokuContextUpdateFunc = {
  switchMode: () => void;
  togglePause: () => void;
  updateElapsedTime: () => void;
};
export type Position = {
  rowIndex: number;
  colIndex: number;
};

export type SudokuDifficulty = 'Easy' | 'Medium' | 'Hard' | 'Expert' | 'Master';

// whole data structure of sudoku
export type Sudoku = {
  data: SudokuData;
  context: SudokuContext;
};
