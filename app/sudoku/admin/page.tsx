'use client';

import { useState, KeyboardEventHandler } from 'react';
import {
  Box,
  Button,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
  Alert,
  Paper,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import { SudokuDifficulty, Sudoku, SudokuCell } from '@/app/types/sudoku';
import { insertSudokuPuzzleApi } from '@/app/lib/sudoku-api-client';
import { checkSudokuValid } from '@/app/utils/sudoku-utils';
import { SudokuBody } from '@/app/ui/sudoku/sudoku-body';
import { getMakingNewPuzzleSudoku } from '../sudoku';
import { throttle } from 'lodash';
import { DefaultSudokuContext } from '@/app/context/sudoku-context';

const DIFFICULTIES: SudokuDifficulty[] = ['Easy', 'Medium', 'Hard', 'Expert', 'Master'];

type UploadMode = 'text' | 'visual';

export default function AdminPage() {
  const [uploadMode, setUploadMode] = useState<UploadMode>('text');

  // Text input mode state
  const [puzzle, setPuzzle] = useState('');
  const [textModeValidatedSolution, setTextModeValidatedSolution] = useState<{
    puzzle: string;
    answer: string;
    sudoku: Sudoku;
  } | null>(null);
  const [showAnswerDialog, setShowAnswerDialog] = useState(false);

  // Visual input mode state
  const [puzzleSudoku, setPuzzleSudoku] = useState<Sudoku>(getMakingNewPuzzleSudoku);
  const [validatedSolution, setValidatedSolution] = useState<{
    puzzle: string;
    answer: string;
  } | null>(null);
  const [isSolutionShown, setIsSolutionShown] = useState(false);

  // Common state
  const [difficulty, setDifficulty] = useState<SudokuDifficulty>('Easy');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateAndGetSolution = (
    matrix: Sudoku['data']['matrix']
  ): { puzzle: string; answer: string } | null => {
    const validation = checkSudokuValid(matrix);
    console.log('validation', validation);
    if (!validation.isValid) {
      setError(validation.errorMessage || 'Invalid sudoku puzzle');
      return null;
    }
    return validation.data
      ? { puzzle: validation.data.mission, answer: validation.data.solution }
      : null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    let puzzleStr: string;
    let answerStr: string;

    if (uploadMode === 'text') {
      // If not validated yet, validate and show dialog
      if (!textModeValidatedSolution) {
        const cleanPuzzle = puzzle.replace(/\s/g, '');

        if (!cleanPuzzle) {
          setError('Puzzle is required');
          return;
        }

        if (cleanPuzzle.length !== 81) {
          setError('Puzzle must be exactly 81 characters (9x9 grid)');
          return;
        }

        if (!/^[0-9]+$/.test(cleanPuzzle)) {
          setError('Puzzle must only contain digits 0-9');
          return;
        }

        // Convert puzzle string to matrix for validation
        try {
          // Create a temporary matrix with the puzzle values
          const tempMatrix: Sudoku['data']['matrix'] = Array.from({ length: 9 }, () =>
            Array.from({ length: 9 }, () => ({
              value: 0,
              realAnswer: 0,
              notingCandidates: [],
              actualCandidates: [],
              type: 'unknown' as const,
            }))
          );

          for (let i = 0; i < 9; i++) {
            for (let j = 0; j < 9; j++) {
              const char = cleanPuzzle[i * 9 + j];
              tempMatrix[i][j].value = +char;
              tempMatrix[i][j].type = char === '0' ? 'unknown' : 'known';
            }
          }

          const result = validateAndGetSolution(tempMatrix);
          if (!result) {
            return;
          }

          // Create sudoku with answer filled in
          const answerStr = result.answer;
          const newMatrix: Sudoku['data']['matrix'] = tempMatrix.map((row, rowIndex) =>
            row.map((cell, colIndex) => {
              const answerValue = +answerStr[rowIndex * 9 + colIndex];
              const wasEmpty = cell.value === 0;
              return {
                ...cell,
                realAnswer: answerValue,
                value: wasEmpty ? answerValue : cell.value,
                type: (wasEmpty ? 'unknown' : 'known') as 'unknown' | 'known',
              };
            })
          );

          const sudokuWithAnswer: Sudoku = {
            data: {
              id: 'preview',
              difficulty: difficulty,
              matrix: newMatrix,
            },
            context: {
              mode: 'normal',
              isPause: false,
              isLoading: false,
              isFinished: false,
              elapsedTime: 0,
            },
          };

          setTextModeValidatedSolution({
            puzzle: result.puzzle,
            answer: result.answer,
            sudoku: sudokuWithAnswer,
          });
          setShowAnswerDialog(true);
          return;
        } catch (e) {
          setError(`Invalid puzzle format: ${e instanceof Error ? e.message : 'Unknown error'}`);
          return;
        }
      } else {
        // Already validated, proceed with upload
        puzzleStr = textModeValidatedSolution.puzzle;
        answerStr = textModeValidatedSolution.answer;
      }
    } else {
      if (!validatedSolution) {
        setError('Please click "Finish" to validate the puzzle first');
        return;
      }
      puzzleStr = validatedSolution.puzzle;
      answerStr = validatedSolution.answer;
    }

    setIsSubmitting(true);

    try {
      await insertSudokuPuzzleApi(puzzleStr, answerStr, difficulty);
      setSuccess('Sudoku puzzle uploaded successfully!');

      // Reset form
      if (uploadMode === 'text') {
        setPuzzle('');
        setTextModeValidatedSolution(null);
        setShowAnswerDialog(false);
      } else {
        setPuzzleSudoku(getMakingNewPuzzleSudoku);
        setValidatedSolution(null);
        setIsSolutionShown(false);
      }
      setDifficulty('Easy');
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to upload sudoku puzzle. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Visual input handlers
  const currentSudoku = puzzleSudoku;
  const setCurrentSudoku = setPuzzleSudoku;

  const setPosition = (rowIndex: number, colIndex: number) => {
    setCurrentSudoku((sudoku) => {
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          selectedPosition: { rowIndex, colIndex },
        },
      };
    });
  };

  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    // Don't allow keyboard input if solution is already shown
    if (isSolutionShown) {
      return;
    }

    const code = event.code;
    if (!currentSudoku.context.selectedPosition) return;

    const { rowIndex, colIndex } = currentSudoku.context.selectedPosition;

    if (code === 'Escape') {
      setCurrentSudoku((sudoku) => ({
        ...sudoku,
        context: {
          ...sudoku.context,
          selectedPosition: undefined,
        },
      }));
    } else if (code === 'ArrowLeft') {
      setPosition(rowIndex, colIndex - 1 < 0 ? 0 : colIndex - 1);
    } else if (code === 'ArrowRight') {
      setPosition(rowIndex, colIndex + 1 > 8 ? 8 : colIndex + 1);
    } else if (code === 'ArrowUp') {
      setPosition(rowIndex - 1 < 0 ? 0 : rowIndex - 1, colIndex);
    } else if (code === 'ArrowDown') {
      setPosition(rowIndex + 1 > 8 ? 8 : rowIndex + 1, colIndex);
    }

    if (code === 'Backspace') {
      setCellValue(rowIndex, colIndex, 0);
    }

    const is1To9 = /^Digit[1-9]$/;
    if (is1To9.test(code)) {
      const num = +code[5];
      setCellValue(rowIndex, colIndex, num);
    }
  }, 100);

  function setCellValue(rowIndex: number, colIndex: number, val: number) {
    // Don't allow editing if solution is already shown
    if (isSolutionShown) {
      return;
    }

    const matrix = currentSudoku.data.matrix;
    const cell = matrix[rowIndex][colIndex];

    if (val < 0 || val > 9) {
      return;
    }

    cell.value = val;
    setCurrentSudoku((sudoku) => ({
      ...sudoku,
      data: {
        ...sudoku.data,
        matrix,
      },
    }));
  }

  function handleResetGrid() {
    setPuzzleSudoku(getMakingNewPuzzleSudoku);
    setValidatedSolution(null);
    setIsSolutionShown(false);
  }

  function handleFinish() {
    setError(null);
    const result = validateAndGetSolution(puzzleSudoku.data.matrix);
    if (!result) {
      return;
    }
    // Fill the answer into the sudoku grid
    const answerStr = result.answer;
    const newMatrix = puzzleSudoku.data.matrix.map((row, rowIndex) =>
      row.map((cell, colIndex) => {
        const answerValue = +answerStr[rowIndex * 9 + colIndex];
        const wasEmpty = cell.value === 0;
        console.log('wasEmpty', wasEmpty);
        const newCell: SudokuCell = {
          ...cell,
          realAnswer: answerValue,
          // If the cell is empty (value === 0), fill it with the answer to show it
          value: wasEmpty ? answerValue : cell.value,
          // Keep type as 'unknown' for answer cells so they display in blue
          type: wasEmpty ? 'unknown' : 'known',
        };
        return newCell;
      })
    );
    console.log('newMatrix', newMatrix);

    setPuzzleSudoku((sudoku) => ({
      ...sudoku,
      data: {
        ...sudoku.data,
        matrix: newMatrix,
      },
    }));

    setValidatedSolution(result);
    setIsSolutionShown(true);
    setSuccess('Puzzle validated successfully! Answer is now displayed. You can upload it now.');
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Admin - Upload Sudoku Puzzle
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={uploadMode} onChange={(_, newValue) => setUploadMode(newValue)}>
            <Tab label="Text Input" value="text" />
            <Tab label="Visual Input" value="visual" />
          </Tabs>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="difficulty-label">Difficulty</InputLabel>
            <Select
              labelId="difficulty-label"
              id="difficulty"
              value={difficulty}
              label="Difficulty"
              onChange={(e) => setDifficulty(e.target.value as SudokuDifficulty)}
            >
              {DIFFICULTIES.map((diff) => (
                <MenuItem key={diff} value={diff}>
                  {diff}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {uploadMode === 'text' ? (
            <TextField
              fullWidth
              label="Puzzle (81 characters)"
              placeholder="Enter 81 characters representing the puzzle (0 for empty cells)"
              value={puzzle}
              onChange={(e) => setPuzzle(e.target.value)}
              multiline
              rows={3}
              sx={{ mb: 3 }}
              helperText={`${puzzle.replace(/\s/g, '').length}/81 characters`}
              error={
                puzzle.replace(/\s/g, '').length > 0 && puzzle.replace(/\s/g, '').length !== 81
              }
            />
          ) : (
            <Box sx={{ mb: 3 }} tabIndex={1} onKeyDown={handleKeyDown} style={{ outline: 'none' }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Box sx={{ maxWidth: '600px', width: '100%' }}>
                  <DefaultSudokuContext.Provider
                    value={{
                      ...puzzleSudoku.context,
                      switchMode: () => {},
                      togglePause: () => {},
                      updateElapsedTime: () => {},
                    }}
                  >
                    <Box>
                      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'end', gap: 1 }}>
                        <Button variant="outlined" onClick={handleResetGrid} size="small">
                          Reset Puzzle
                        </Button>
                        <Button
                          variant="contained"
                          onClick={handleFinish}
                          size="small"
                          disabled={isSolutionShown}
                        >
                          Finish
                        </Button>
                      </Box>
                      {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                          {error}
                        </Alert>
                      )}

                      {success && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                          {success}
                        </Alert>
                      )}
                      <SudokuBody
                        sudoku={puzzleSudoku}
                        setPosition={isSolutionShown ? () => {} : setPosition}
                      />
                      {isSolutionShown && (
                        <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                          <Typography variant="body2" color="success.dark">
                            ✓ Puzzle validated! The answer is displayed in the grid. You can now
                            upload it.
                          </Typography>
                        </Box>
                      )}
                    </Box>
                  </DefaultSudokuContext.Provider>
                </Box>
              </Box>
            </Box>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={isSubmitting || (uploadMode === 'visual' && !isSolutionShown)}
          >
            {isSubmitting
              ? 'Uploading...'
              : uploadMode === 'visual' && !isSolutionShown
                ? 'Please click "Finish" first'
                : 'Upload Sudoku Puzzle'}
          </Button>
        </Box>

        {/* Answer Confirmation Dialog for Text Mode */}
        <Dialog
          open={showAnswerDialog}
          onClose={() => {
            setShowAnswerDialog(false);
            setTextModeValidatedSolution(null);
          }}
          maxWidth="md"
          fullWidth
        >
          <DialogTitle>Confirm Answer</DialogTitle>
          <DialogContent>
            <Typography variant="body1" sx={{ mb: 2 }}>
              The puzzle has been validated successfully. Please review the answer below. The blue
              numbers are the solution.
            </Typography>
            {textModeValidatedSolution && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <DefaultSudokuContext.Provider
                  value={{
                    ...textModeValidatedSolution.sudoku.context,
                    switchMode: () => {},
                    togglePause: () => {},
                    updateElapsedTime: () => {},
                  }}
                >
                  <SudokuBody sudoku={textModeValidatedSolution.sudoku} setPosition={() => {}} />
                </DefaultSudokuContext.Provider>
              </Box>
            )}
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowAnswerDialog(false);
                setTextModeValidatedSolution(null);
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowAnswerDialog(false);
                // Trigger form submission
                const form = document.querySelector('form');
                if (form) {
                  form.requestSubmit();
                }
              }}
              variant="contained"
              color="primary"
            >
              Confirm & Upload
            </Button>
          </DialogActions>
        </Dialog>

        {uploadMode === 'text' && (
          <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Instructions:
            </Typography>
            <Typography variant="body2" component="div">
              <ul style={{ margin: 0, paddingLeft: 20 }}>
                <li>
                  Puzzle: 81 characters where 0 represents empty cells and 1-9 represent given
                  numbers
                </li>
                <li>
                  The system will automatically validate that the puzzle has a unique solution
                </li>
                <li>Example format: "400800007350672004..." (81 characters total)</li>
              </ul>
            </Typography>
          </Box>
        )}
      </Paper>
    </Container>
  );
}
