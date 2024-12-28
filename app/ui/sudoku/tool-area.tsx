import { useContext, useState, useEffect } from 'react';
import { DefaultSudokuContext } from '../../context/sudoku-context';
import { IconButton, Tooltip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { purple, indigo, yellow, green, red } from '@mui/material/colors';
import * as React from 'react';
import { Sudoku } from '@/app/types/sudoku';
import CancelIcon from '@mui/icons-material/Cancel';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export function ToolArea({
  sudoku,
  showAllCandidates,
  handleNumberInput,
  getHint,
  rejectHint,
  applyHint,
}: {
  sudoku: Sudoku;
  showAllCandidates: () => void;
  handleNumberInput: (num: number) => void;
  getHint: () => void;
  rejectHint: () => void;
  applyHint: () => void;
}) {
  const { mode, switchMode } = useContext(DefaultSudokuContext);

  const { hint } = sudoku.context;

  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (mode === 'hint' && hint) {
      console.log('hint is visible');
      setIsVisible(true);
    } else {
      console.log('hint is not visible');
      setIsVisible(false);
    }
  }, [mode, hint]);

  return (
    <div>
      <div>Tool Area</div>
      <Tooltip title="Show all candidates(Press C)">
        <IconButton onClick={() => showAllCandidates()}>
          <AutoFixHighIcon sx={{ color: purple[300] }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Note Mode (Press X)">
        <IconButton onClick={switchMode}>
          <DriveFileRenameOutlineIcon sx={{ color: mode === 'normal' ? undefined : indigo[700] }} />
        </IconButton>
      </Tooltip>
      <Tooltip title="Hint" onClick={getHint}>
        <IconButton>
          <QuestionMarkIcon sx={{ color: yellow[800] }} />
        </IconButton>
      </Tooltip>
      {/* Hint scope */}
      {mode === 'hint' && hint ? (
        <div className={`bg-neutral-200 p-2 rounded-md ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}>
          <div>
            {hint.hintMessage}            
          </div>
          <div className="flex justify-end">
              <IconButton onClick={rejectHint}>
                <CancelIcon sx={{ color: red[700] }} />
              </IconButton>
              <IconButton onClick={applyHint}>
                <CheckCircleIcon sx={{ color: green[500] }} />
              </IconButton>
          </div>
        </div>
      ) : null}

      {/* number input grid */}
      <div className="grid grid-cols-3 gap-1 mt-2 max-w-[400px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
          <button
            key={number}
            onClick={() => handleNumberInput(number)}
            className="aspect-square bg-gray-100 rounded-md flex items-center justify-center text-3xl p-3 text-blue-800 hover:bg-gray-200"
          >
            {number}
          </button>
        ))}
      </div>
    </div>
  );
}
