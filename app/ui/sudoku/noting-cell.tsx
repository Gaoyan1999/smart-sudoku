import { range } from 'lodash';
import { classNames } from '../../utils/common';
import { Position, SudokuHint } from '@/app/types/sudoku';

export function NotingCell({
  selectNumber,
  notingNumbers,
  hint,
  position,
}: {
  selectNumber: number | undefined;
  notingNumbers: number[];
  position: Position;
  hint?: SudokuHint;
}) {
  const isSecondaryCellInHintMode =
    !!hint &&
    hint.secondaryCells.some(
      (c) => c.position.rowIndex === position.rowIndex && c.position.colIndex === position.colIndex
    );
  return (
    <div className={classNames({ 'noting-cell': true, 'bg-blue-600': isSecondaryCellInHintMode })}>
      {range(1, 10).map((i) => {
        if (!notingNumbers.includes(i)) {
          return <div className="flex items-center justify-center" key={i}></div>;
        }
        const needHint =
          hint &&
          hint.ruleType === 'excludeCandidate' &&
          hint.excludeNumber === i &&
          hint.primaryCells.some(
            (c) =>
              c.position.rowIndex === position.rowIndex && c.position.colIndex === position.colIndex
          );
        return (
          <div
            key={i}
            className={classNames({
              'flex items-center justify-center': true,
              'bg-red-600 text-white animate-hint-flash noting-cell-cross': !!needHint,
              'bg-blue-600 text-white': i === selectNumber || isSecondaryCellInHintMode,
            })}
          >
            {i}
          </div>
        );
      })}
    </div>
  );
}
