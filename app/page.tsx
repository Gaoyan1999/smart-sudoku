import { fetchNewSudokuPuzzleApi } from './lib/sudoku-api-client';

export default async function Page() {
  await fetchNewSudokuPuzzleApi('Easy');
  return <h1>Hello, Next.js!</h1>;
}
