'use client';

import { Sudoku } from '@/app/types/sudoku';
import { SudokuBody } from '@/app/ui/sudoku/sudoku-body';
import { KeyboardEventHandler, useEffect, useState } from 'react';
import * as React from 'react';
import { useRouter } from 'next/navigation';
import { getMakingNewPuzzleSudoku } from '../sudoku';
import { throttle } from 'lodash';
import { NumberInput } from '@/app/ui/sudoku/number-input';
import { Button, CircularProgress } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ImageIcon from '@mui/icons-material/Image';
import { checkSudokuValid, initMatrix, findMissingNumbers } from '@/app/utils/sudoku-utils';
import { getRelatedCells } from '@/app/utils/location';
import { uniq } from 'lodash';
import {
  ID_SUDOKU_IMPORT,
  LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU,
  LOCAL_STORAGE_KEY_SUDOKU_HISTORY,
} from '@/app/const';

function constructSudoku(data: { mission: string; solution: string }): Sudoku {
  return {
    data: {
      matrix: initMatrix(data.mission, data.solution),
      id: ID_SUDOKU_IMPORT,
      difficulty: 'Easy',
    },
    context: {
      mode: 'normal',
      isPause: false,
      isLoading: false,
      isFinished: false,
      isImportedByUser: true,
      elapsedTime: 0,
    },
  };
}

export default function Page() {
  const router = useRouter();
  const [sudoku, setSudoku] = useState<Sudoku>(getMakingNewPuzzleSudoku);
  const [isOcrLoading, setIsOcrLoading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // load data from local storage.
  useEffect(() => {
    const sudokuDataStr = localStorage.getItem(LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU);
    if (sudokuDataStr) {
      const sudokuData = JSON.parse(sudokuDataStr) as Sudoku;
      setSudoku(sudokuData);
    } else {
      setSudoku(getMakingNewPuzzleSudoku);
    }
  }, []);
  // watch the sudoku data
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY_MAKING_NEW_PUZZLE_SUDOKU, JSON.stringify(sudoku));
  }, [sudoku]);

  function applyOcrGridToSudoku(grid: number[][]) {
    const newMatrix: Sudoku['data']['matrix'] = grid.map((row) =>
      row.map((value) => ({
        value: value,
        realAnswer: value, // OCR doesn't provide solution, so use value as placeholder
        type: (value === 0 ? 'unknown' : 'known') as 'unknown' | 'known',
        notingCandidates: [] as number[],
        actualCandidates: [] as number[],
      }))
    );

    // Fill actualCandidates for unknown cells
    newMatrix.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.type === 'unknown') {
          cell.actualCandidates = findMissingNumbers(
            uniq(
              getRelatedCells({ rowIndex, colIndex }, newMatrix)
                .filter((cell) => cell.value !== 0)
                .map((cell) => cell.value)
            )
          );
        }
      });
    });

    setSudoku((prevSudoku) => ({
      ...prevSudoku,
      data: {
        ...prevSudoku.data,
        matrix: newMatrix,
      },
    }));
  }

  const handleOcrImport = () => {
    fileInputRef.current?.click();
  };

  const convertFileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsOcrLoading(true);
    setSudoku((prevSudoku) => ({
      ...prevSudoku,
      context: { ...prevSudoku.context, isLoading: true },
    }));

    try {
      // Convert image to base64
      const base64Image = await convertFileToBase64(file);
      // base64Image will be used when calling the actual API
      console.log('Image converted to base64, length:', base64Image.length);

      // TODO: Call actual OCR API
      // API request format: { "base64_image": "data:image/jpeg;base64,iVBOR...." }
      // const response = await fetch('/api/ocr', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     base64_image: base64Image,
      //   }),
      // });
      // const ocrResponse = await response.json();

      // For now, hardcode the response
      const mockResponse = {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grid: [
            [9, 2, 6, 0, 1, 5, 0, 0, 0],
            [1, 5, 8, 7, 6, 3, 9, 0, 0],
            [3, 0, 7, 9, 0, 0, 1, 8, 5],
            [0, 0, 9, 0, 0, 0, 0, 3, 8],
            [7, 3, 0, 0, 0, 0, 5, 9, 0],
            [0, 0, 0, 3, 9, 5, 0, 0, 0],
            [0, 7, 0, 0, 0, 0, 0, 1, 9],
            [6, 9, 4, 0, 0, 0, 7, 0, 2],
            [5, 0, 3, 6, 0, 0, 4, 0, 9],
          ],
          message: 'OCR处理成功',
        }),
      };

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 10000));

      // Parse the response
      const body = JSON.parse(mockResponse.body);
      const grid = body.grid as number[][];

      if (grid && Array.isArray(grid) && grid.length === 9) {
        applyOcrGridToSudoku(grid);
      }
    } catch (error) {
      console.error('OCR processing failed:', error);
      alert('OCR processing failed. Please try again.');
    } finally {
      setIsOcrLoading(false);
      setSudoku((prevSudoku) => ({
        ...prevSudoku,
        context: { ...prevSudoku.context, isLoading: false },
      }));
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  function setPosition(rowIndex: number, colIndex: number) {
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        context: {
          ...sudoku.context,
          selectedPosition: { rowIndex, colIndex },
        },
      };
    });
  }
  const handleKeyDown: KeyboardEventHandler = throttle((event) => {
    const code = event.code;
    // Cell control
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    if (code === 'Escape') {
      setSudoku((sudoku) => {
        return {
          ...sudoku,
          context: {
            ...sudoku.context,
            selectedPosition: undefined,
          },
        };
      });
    } else if (code === 'ArrowLeft') {
      setPosition(rowIndex, colIndex - 1 < 0 ? 0 : colIndex - 1);
    } else if (code === 'ArrowRight') {
      setPosition(rowIndex, colIndex + 1 > 8 ? 8 : colIndex + 1);
    } else if (code === 'ArrowUp') {
      setPosition(rowIndex - 1 < 0 ? 0 : rowIndex - 1, colIndex);
    } else if (code === 'ArrowDown') {
      setPosition(rowIndex + 1 > 8 ? 8 : rowIndex + 1, colIndex);
    }
    const matrix = sudoku.data.matrix;
    const targetCell = matrix[rowIndex][colIndex];
    if (targetCell.type !== 'unknown') {
      return;
    }
    if (sudoku.context.isFinished) {
      return;
    }
    // operation for cell value
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
    const matrix = sudoku.data.matrix;
    const cell = matrix[rowIndex][colIndex];

    if (cell.type !== 'unknown' || val < 0 || val > 9) {
      return;
    }
    cell.value = val;
    setSudoku((sudoku) => {
      return {
        ...sudoku,
        data: {
          ...sudoku.data,
          matrix,
        },
      };
    });
  }
  function handleNumberInput(num: number) {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    setCellValue(rowIndex, colIndex, num);
  }
  function handleDeleteAll() {
    setSudoku(() => {
      return { ...getMakingNewPuzzleSudoku() };
    });
  }

  function handleDeleteCell() {
    if (!sudoku.context.selectedPosition) return;
    const { rowIndex, colIndex } = sudoku.context.selectedPosition;
    setCellValue(rowIndex, colIndex, 0);
  }

  function handleFinishMaking() {
    const { isValid, errorMessage, data } = checkSudokuValid(sudoku.data.matrix);
    if (!isValid) {
      alert(errorMessage);
      return;
    }
    console.log('mission', data?.mission);
    console.log('solution', data?.solution);
    // popup a dialog: saying that the sudoku is valid, and ask user to confirm if they want to play this sudoku.
    if (confirm('The sudoku is valid, and ask user to confirm if they want to play this sudoku.')) {
      // save the sudoku to local storage and navigate to main sudoku page
      const { mission, solution } = data!;

      const sudoku = constructSudoku({ mission, solution });
      localStorage.setItem(LOCAL_STORAGE_KEY_SUDOKU_HISTORY, JSON.stringify(sudoku));
      router.push('/sudoku');
    }
  }

  return (
    <div
      className="px-2 py-4 flex flex-col md:flex-row h-full relative md:space-x-4 space-y-4 md:space-y-0"
      style={{ outline: 'none' }}
      tabIndex={1}
      onKeyDown={handleKeyDown}
    >
      <div className="flex-shrink-0 flex-grow relative flex justify-center">
        {sudoku.context.isLoading && (
          <div className="pause-and-loading-mask">
            <div className="animate-spin rounded-full border-t-2 border-b-2 border-blue-800 w-12 h-12"></div>
          </div>
        )}
        <SudokuBody sudoku={sudoku} setPosition={setPosition} />
      </div>
      <div className="flex-shrink-0">
        <div>Tool Area</div>
        <div className="mt-4 flex flex-col gap-2">
          <Button
            variant="outlined"
            startIcon={isOcrLoading ? <CircularProgress size={20} /> : <ImageIcon />}
            onClick={handleOcrImport}
            disabled={isOcrLoading}
            fullWidth
          >
            {isOcrLoading ? 'Processing...' : 'OCR Puzzle Import'}
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          <Button variant="contained" onClick={handleDeleteAll} color="error">
            Reset
          </Button>
          <Button
            variant="outlined"
            startIcon={<DeleteIcon />}
            onClick={handleDeleteCell}
            disabled={!sudoku.context.selectedPosition}
          >
            Delete Cell
          </Button>
          <Button variant="contained" startIcon={<CheckCircleIcon />} onClick={handleFinishMaking}>
            Complete & Play
          </Button>
        </div>
        <NumberInput handleNumberInput={handleNumberInput} />
      </div>
    </div>
  );
}
