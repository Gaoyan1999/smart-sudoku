import { range } from "lodash";
import { classNames } from "../utils/common.ts";

export function NotingCell({
  selectNumber,
  notingNumbers,
}: {
  selectNumber: number | undefined;
  notingNumbers: number[];
}) {
  return (
    <div className={"noting-cell"}>
      {range(1, 10).map((i) => {
        return notingNumbers.includes(i) ? (
          <div
            key={i}
            className={classNames({
              "bg-blue-600 text-white": i === selectNumber,
            })}
          >
            {i}
          </div>
        ) : (
          <div key={i}></div>
        );
      })}
    </div>
  );
}
