// Reference: https://supabase.com/docs/reference/javascript/typescript-support
import { SudokuDifficulty } from './sudoku';

export interface Database {
  public: {
    Tables: {
      sudoku_puzzle: {
        Row: SudokuPuzzleEntity;
      };
      user_roles: {
        Row: UserRoleEntity;
      };
    };
  };
}

export interface SudokuPuzzleEntity {
  id: string;
  puzzle: string;
  answer: string;
  created_at: string;
  difficulty: SudokuDifficulty;
}

export interface UserRoleEntity {
  user_id: string;
  role: 'user' | 'admin';
  created_at: string;
  updated_at: string;
}
