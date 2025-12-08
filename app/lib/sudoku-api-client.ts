import { Database, SudokuPuzzleEntity } from '@/app/types/database.type';
import { createClient } from '@supabase/supabase-js';
import { SudokuDifficulty } from '../types/sudoku';

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchNewSudokuPuzzleApi(difficulty: SudokuDifficulty) {
  // First, get the count of puzzles with this difficulty
  const { count } = await supabase
    .from('sudoku_puzzle')
    .select('*', { count: 'exact', head: true })
    .eq('difficulty', difficulty);

  if (!count || count === 0) {
    return null;
  }

  // Randomly select an offset
  const randomOffset = Math.floor(Math.random() * count);

  // Fetch only one record at the random offset
  const { data } = await supabase
    .from('sudoku_puzzle')
    .select()
    .eq('difficulty', difficulty)
    .range(randomOffset, randomOffset)
    .returns<SudokuPuzzleEntity[]>();

  return data?.[0] || null;
}

export async function insertSudokuPuzzleApi(
  puzzle: string,
  answer: string,
  difficulty: SudokuDifficulty
) {
  const { data, error } = await supabase
    .from('sudoku_puzzle')
    .insert({
      puzzle,
      answer,
      difficulty,
    })
    .select()
    .returns<SudokuPuzzleEntity[]>();

  if (error) {
    throw error;
  }

  return data?.[0];
}

export async function sudokuOcrApi(base64Image: string): Promise<number[][]> {
  const response = await fetch('/api/ocr', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ base64_image: base64Image }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'OCR processing failed');
  }

  const data = await response.json();
  return data.grid;
}
