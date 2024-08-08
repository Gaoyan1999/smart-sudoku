import { useContext } from "react";
import { SudokuContext } from "../App.tsx";

export function ToolArea() {
  const { mode } = useContext(SudokuContext);

  return (
    <div>
      <div>Tool Area</div>
      <div>Noting Mode (Press X to switch): {mode} </div>
      <div>Press C to show all candidates</div>
    </div>
  );
}
