'use client';
import { SudokuPuzzleEntity } from '../types/database.type';
import { Sudoku } from '../types/sudoku';
import { initMatrix } from '../utils/sudoku-utils';
import { MOCK_SUDOKU_ID } from '../const';

export function getDefaultSudoku(): Sudoku {
  const data = {
    mission: '400800007350672004280000103000007000028300400070204916092405030800763009730000051',
    solution: '469831527351672894287549163946157382128396475573284916692415738815763249734928651',
  };
  return {
    data: {
      matrix: initMatrix(data.mission, data.solution),
      id: MOCK_SUDOKU_ID,
      difficulty: 'Easy',
    },
    context: {
      mode: 'normal',
      isPause: false,
      isLoading: true,
      elapsedTime: 0,
      isFinished: false,
    },
  };
}

export function constructSudoku(entity: SudokuPuzzleEntity): Sudoku {
  return {
    data: {
      matrix: initMatrix(entity.puzzle, entity.answer),
      id: entity.id,
      difficulty: entity.difficulty,
    },
    context: {
      mode: 'normal',
      isPause: false,
      isLoading: false,
      elapsedTime: 0,
      isFinished: false,
    },
  };
}
