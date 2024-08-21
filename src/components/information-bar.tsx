import { useContext, useEffect } from "react";
import { secondToHourAndMinutes } from "../utils/common.ts";
import { SudokuContext } from "./root.tsx";
import { Pause, PlayArrow } from "@mui/icons-material";
import { grey } from "@mui/material/colors";

export function InformationBar() {
  const { elapsedTime, updateElapsedTime, isPause, togglePause } =
    useContext(SudokuContext);

  useEffect(() => {
    if (isPause) {
      return;
    }
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPause, updateElapsedTime]);

  return (
    <div className="flex justify-between">
      <span>Difficulty:</span>
      <div className="flex items-center cursor-pointer">
        {/*<Replay   sx={{ color: grey[800] }} />*/}
        {isPause ? (
          <PlayArrow onClick={togglePause} sx={{ color: grey[800] }} />
        ) : (
          <Pause onClick={togglePause} sx={{ color: grey[800] }} />
        )}
        <span className="ml-2 w-12 font-semibold text-neutral-600 text-neutral-600">
          {secondToHourAndMinutes(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
