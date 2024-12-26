import { Database, SudokuPuzzleEntity } from "@/app/types/database.type";
import { createClient } from "@supabase/supabase-js";
import { SudokuDifficulty } from "../types/sudoku";

const supabase = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function fetchNewSudokuPuzzleApi(difficulty: SudokuDifficulty) {
  const { data } = await supabase
    .from("sudoku_puzzle")
    .select()
    .eq("difficulty", difficulty)
    .returns<SudokuPuzzleEntity[]>();  
  return data?.[0];
}
