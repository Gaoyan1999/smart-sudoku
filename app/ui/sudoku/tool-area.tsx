import { useContext } from 'react';
import { DefaultSudokuContext } from '../../context/sudoku-context';
import { IconButton, Tooltip } from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import DriveFileRenameOutlineIcon from '@mui/icons-material/DriveFileRenameOutline';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { purple, indigo, yellow } from '@mui/material/colors';
import * as React from 'react';
import { getOneHint } from '@/app/utils/hint';
import { Sudoku } from '@/app/types/sudoku';
export function ToolArea({
  sudoku,
  showAllCandidates,
  handleNumberInput,
}: {
  sudoku: Sudoku;
  showAllCandidates: () => void;
  handleNumberInput: (num: number) => void;
}) {
  const { mode, switchMode } = useContext(DefaultSudokuContext);

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
      <Tooltip
        title="Hint"
        onClick={() => {
          const hint = getOneHint(sudoku.data.matrix);
          console.log(hint);
        }}
      >
        <IconButton>
          <QuestionMarkIcon sx={{ color: yellow[800] }} />
        </IconButton>
      </Tooltip>

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
