import { useContext } from "react";
import { SudokuContext } from "./root.tsx";
import { secondToHourAndMinutes } from "../utils/common.ts";

export function InformationBar() {
  const { elapsedTime,  } = useContext(SudokuContext);
  // set up a clock
  // console.log("set up a clock");
  // setInterval(() => {
  //   console.log(elapsedTime);
  //   updateElapsedTime(elapsedTime + 1);
  // }, 1000);

  return (
    <div className="flex justify-between">
      <span>Difficulty:</span>
      <div>{secondToHourAndMinutes(elapsedTime)}</div>
    </div>
  );
}
