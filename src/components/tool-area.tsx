import { useContext } from "react";
import { SudokuContext } from "../App.tsx";

export function ToolArea() {
  const { mode,switchMode } = useContext(SudokuContext);

  return (
    <div>
      <div>Tool Area</div>
      <div>Noting Mode: {mode} </div>
        <button className="h-4 w-4" onClick={switchMode}>switchMode</button>
    </div>
  );
}
