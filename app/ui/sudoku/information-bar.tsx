import { Tooltip } from '@mui/material';
import { SudokuDifficulty } from '@/app/types/sudoku';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { grey } from '@mui/material/colors';
import { Timer } from '../timer';
import { useSudoku } from '../../context/sudoku-provider';

export function InformationBar() {
  const { sudoku, getNewSudoku, exitOwnPuzzle } = useSudoku();
  const { isImportedByUser } = sudoku.context;
  const difficulty = sudoku.data.difficulty;

  const handleChange = (event: SelectChangeEvent) => {
    getNewSudoku(event.target.value as SudokuDifficulty);
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

      <div className="flex items-center">
        {isImportedByUser && (
          <Tooltip title="Quit solving own puzzle">
            <ExitToAppIcon sx={{ color: grey[800] }} onClick={exitOwnPuzzle} />
          </Tooltip>
        )}
        <div className="md:hidden">
          <Timer />
        </div>
      </div>
    </div>
  );
}
