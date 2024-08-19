import { useContext, useEffect } from "react";

import { secondToHourAndMinutes } from "../utils/common.ts";
import { SudokuContext } from "./root.tsx";
import { Pause, PlayArrow } from "@mui/icons-material";

export function InformationBar() {
  const { elapsedTime, updateElapsedTime, isPause, togglePause } =
    useContext(SudokuContext);

  useEffect(() => {
    console.log("use effect");
    // const interval = setInterval(() => getTime(), 1000);
    if (isPause) {
      return;
    }
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);
    return () => clearInterval(interval);
  }, [isPause, updateElapsedTime]);
  // const [elapsedTime, setElapsedTime] = useState(0);
  // const { elapsedTime, updateElapsedTime } = useContext(SudokuContext);
  // const intervalRef = useRef<{ intervalNumber: number; isCalled: boolean }>({
  //   intervalNumber: -1,
  //   isCalled: false,
  // });
  //

  return (
    <div className="flex justify-between">
      <span>Difficulty:</span>
      <div className="flex items-center cursor-pointer">
        {isPause ? (
          <PlayArrow onClick={togglePause} />
        ) : (
          <Pause onClick={togglePause} />
        )}
        <span className="ml-2 w-12">{secondToHourAndMinutes(elapsedTime)}</span>
      </div>
    </div>
  );
}
