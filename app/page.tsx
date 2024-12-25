import { fetchNewSudokuPuzzleApi } from "./lib/sudoku-api-client";

export default async function Page() {
  const data = await fetchNewSudokuPuzzleApi('Easy');
  console.log(data);
  return <h1>Hello, Next.js!</h1>;
}

