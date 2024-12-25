// Reference: https://supabase.com/docs/reference/javascript/typescript-support
import { SudokuDifficulty } from "./sudoku";

export interface Database {
  public: {
    Tables: {
      sudoku_puzzle: {
        Row: {
          id: string;
          puzzle: string;
          answer: string;
          created_at: string;
          difficulty: SudokuDifficulty;
        };
      };
    };
  };
}
