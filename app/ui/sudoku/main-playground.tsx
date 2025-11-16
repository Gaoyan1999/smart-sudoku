import './main-playground.css';
import { Sudoku, SudokuDifficulty } from '../../types/sudoku';
import { useContext } from 'react';
import { DefaultSudokuContext } from '../../context/sudoku-context';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { blue } from '@mui/material/colors';
import { InformationBar } from './information-bar';
import { SudokuBody } from './sudoku-body';

export function MainPlayground({
  sudoku,
  setPosition,
  resetSudoku,
  setDifficulty,
}: {
  sudoku: Sudoku;
  setPosition: (rowIndex: number, colIndex: number) => void;
  resetSudoku: () => void;
  setDifficulty: (difficulty: SudokuDifficulty) => void;
}) {
  const { togglePause } = useContext(DefaultSudokuContext);
  const { isPause, isLoading } = sudoku.context;

  return (
    <>
      <InformationBar sudoku={sudoku} resetSudoku={resetSudoku} setDifficulty={setDifficulty} />
      <div className="relative flex justify-center mt-2">
        {isPause ? (
          <div className="pause-and-loading-mask cursor-pointer z-[50]" onClick={togglePause}>
            <PlayCircleOutlineIcon sx={{ color: blue[800], fontSize: '60px' }} />
          </div>
        ) : null}
        {isLoading ? (
          <div className="pause-and-loading-mask">
            <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-800"></div>
          </div>
        ) : null}
        <SudokuBody sudoku={sudoku} setPosition={setPosition} />
      </div>
    </>
  );
}

/**
 * TODO List
 * improvement:
 * 1. Add animation when moving the selected cell.
 */
