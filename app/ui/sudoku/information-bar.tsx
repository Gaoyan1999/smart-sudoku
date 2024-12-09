import { useContext, useEffect } from "react";
import { secondToHourAndMinutes } from "../../utils/common";
import { DefaultSudokuContext } from "../../context/sudoku-context";
import { Pause, PlayArrow, Replay } from "@mui/icons-material";
import { grey } from "@mui/material/colors";

export function InformationBar({ resetSudoku }: { resetSudoku: () => void }) {
  const { elapsedTime, updateElapsedTime, isPause, isFinished, togglePause } =
    useContext(DefaultSudokuContext);

  useEffect(() => {
    if (isPause || isFinished) {
      return;
    }    
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPause,isFinished, updateElapsedTime]);

  return (
    <div className="flex justify-between">
      <span>Difficulty:</span>
      <div className="flex items-center cursor-pointer">
        <Replay sx={{ color: grey[800] }} onClick={resetSudoku} />
        {isFinished && <span className="ml-2 text-green-500">Finished</span>}
        {!isFinished && (isPause ? (
          <PlayArrow onClick={togglePause} sx={{ color: grey[800] }} />
        ) : (
          <Pause onClick={togglePause} sx={{ color: grey[800] }} />
        ))}
        <span className="ml-2 w-12 font-semibold text-neutral-600 text-neutral-600">
          {secondToHourAndMinutes(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
