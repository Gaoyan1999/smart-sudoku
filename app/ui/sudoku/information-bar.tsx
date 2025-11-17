import { useContext, useEffect } from 'react';
import { secondToHourAndMinutes } from '../../utils/common';
import { DefaultSudokuContext } from '../../context/sudoku-context';
import { Pause, PlayArrow, Replay } from '@mui/icons-material';
import { grey } from '@mui/material/colors';
import { Tooltip } from '@mui/material';
import { Sudoku, SudokuDifficulty } from '@/app/types/sudoku';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';

export function InformationBar({
  sudoku,
  resetSudoku,
  setDifficulty,
  exitOwnPuzzle,
}: {
  sudoku: Sudoku;
  resetSudoku: () => void;
  setDifficulty: (difficulty: SudokuDifficulty) => void;
  exitOwnPuzzle: () => void;
}) {
  const { elapsedTime, updateElapsedTime, togglePause } = useContext(DefaultSudokuContext);
  const { isImportedByUser } = sudoku.context;
  const { isFinished, isPause, isLoading } = sudoku.context;
  const difficulty = sudoku.data.difficulty;
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

  const handleChange = (event: SelectChangeEvent) => {
    setDifficulty(event.target.value as SudokuDifficulty);
  };

  return (
    <div className="flex justify-between">
      {!isImportedByUser ? (
        <FormControl>
          <InputLabel id="demo-simple-select-label">Difficulty</InputLabel>
          <Select
            labelId="demo-simple-select-label"
            id="demo-simple-select"
            value={difficulty}
            onChange={handleChange}
          >
            <MenuItem value="Easy">Easy</MenuItem>
            <MenuItem value="Medium">Medium</MenuItem>
            <MenuItem value="Hard">Hard</MenuItem>
            <MenuItem value="Expert">Expert</MenuItem>
            <MenuItem value="Master">Master</MenuItem>
          </Select>
        </FormControl>
      ) : (
        <div></div>
      )}

      <div className="flex items-center cursor-pointer">
        {isImportedByUser && (
          <Tooltip title="Quit solving own puzzle">
            <ExitToAppIcon sx={{ color: grey[800] }} onClick={exitOwnPuzzle} />
          </Tooltip>
        )}
        <Replay sx={{ color: grey[800] }} onClick={resetSudoku} />
        {isFinished && <span className="ml-2 text-green-500">Finished</span>}
        {!isFinished &&
          (isPause ? (
            <PlayArrow onClick={togglePause} sx={{ color: grey[800] }} />
          ) : (
            <Pause onClick={togglePause} sx={{ color: grey[800] }} />
          ))}
        <span className="ml-2 font-semibold text-neutral-600 text-neutral-600">
          {secondToHourAndMinutes(elapsedTime)}
        </span>
      </div>
    </div>
  );
}
