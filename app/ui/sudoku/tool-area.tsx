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
import { NumberInput } from './number-input';

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
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }
  }, [mode, hint]);
  const disabledHint =
    sudoku.context.isFinished || sudoku.context.isPause || sudoku.context.mode === 'hint';

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
      <Tooltip title="Hint">
        <span>
          <IconButton onClick={getHint} disabled={disabledHint}>
            <QuestionMarkIcon sx={{ color: disabledHint ? undefined : yellow[800] }} />
          </IconButton>
        </span>
      </Tooltip>
      {/* Hint scope */}
      {mode === 'hint' && hint ? (
        <div
          className={`bg-neutral-200 p-2 rounded-md ${isVisible ? 'animate-fade-in' : 'animate-fade-out'}`}
        >
          <div>{hint.hintMessage}</div>
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

      <NumberInput handleNumberInput={handleNumberInput} />
    </div>
  );
}
