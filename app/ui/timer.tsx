import { useEffect } from 'react';
import { secondToHourAndMinutes } from '../utils/common';
import { useSudoku } from '../context/sudoku-provider';
import { Pause, PlayArrow } from '@mui/icons-material';
import { grey } from '@mui/material/colors';

export function Timer() {
  const { sudoku, togglePause, updateElapsedTime } = useSudoku();
  const { elapsedTime, isFinished, isPause, isLoading } = sudoku.context;
  useEffect(() => {
    if (isPause || isFinished || isLoading) {
      return;
    }
    const interval = setInterval(() => {
      updateElapsedTime();
    }, 1000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPause, isFinished, isLoading]);

  return (
    <div className="flex items-center cursor-pointer">
      <span className="ml-2 font-semibold text-neutral-600 text-neutral-600">
        {secondToHourAndMinutes(elapsedTime)}
      </span>
      {isFinished && <span className="ml-2 text-green-500">Finished</span>}
      {!isFinished &&
        (isPause ? (
          <PlayArrow onClick={togglePause} sx={{ color: grey[800] }} />
        ) : (
          <Pause onClick={togglePause} sx={{ color: grey[800] }} />
        ))}
    </div>
  );
}
