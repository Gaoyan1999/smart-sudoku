import './main-playground.css';
import { classNames } from '../../utils/common';
import { isRelatedCell } from '../../utils/location';
import { Sudoku } from '../../types/sudoku';
import { NotingCell } from './noting-cell';
import { useContext } from 'react';
import { DefaultSudokuContext } from '../../context/sudoku-context';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import { blue } from '@mui/material/colors';
import { InformationBar } from './information-bar';
import { isEqual } from 'lodash';

export function MainPlayground({
  sudoku,
  setPosition,
  resetSudoku,
}: {
  sudoku: Sudoku;
  setPosition: (rowIndex: number, colIndex: number) => void;
  resetSudoku: () => void;
}) {
  const { togglePause } = useContext(DefaultSudokuContext);
  const { matrix } = sudoku.data;
  const { selectedPosition, isPause, isLoading, mode, hint } = sudoku.context;
  const maskCellContent = isPause || isLoading;
  const selectedValue = getSelectCell()?.value;
  const isHintMode = mode === 'hint' && !!hint;

  function isSelected(i: number, j: number) {
    if (!selectedPosition) return false;
    const { rowIndex, colIndex } = selectedPosition;

    return rowIndex === i && colIndex === j;
  }
  function onTdClick(rowIndex: number, colIndex: number) {
    setPosition(rowIndex, colIndex);
  }

  function getSelectCell() {
    if (!selectedPosition) return;
    const { rowIndex, colIndex } = selectedPosition;
    return matrix[rowIndex][colIndex];
  }
  function isTargetCellInHintMode(rowIndex: number, colIndex: number) {
    if (!hint) return false;
    return hint.position.rowIndex === rowIndex && hint.position.colIndex === colIndex;
  }

  function renderCellNode(rowIndex: number, colIndex: number) {
    const cell = matrix[rowIndex][colIndex];
    const showNotingCell = cell.value === 0 && cell.notingCandidates.length > 0;
    if (isTargetCellInHintMode(rowIndex, colIndex)) {
      return <div className="normal-mode-cell text-white animate-hint-flash">{hint?.answer}</div>;
    } else if (showNotingCell) {
      return <NotingCell selectNumber={selectedValue} notingNumbers={cell.notingCandidates} />;
    } else {
      return (
        <div
          className={
            'normal-mode-cell' +
            (isHintMode
              ? classNames({
                  'bg-blue-600 text-white': !!hint.highlightCells.find(
                    (relatedCell) =>
                      relatedCell.position.rowIndex === rowIndex &&
                      relatedCell.position.colIndex === colIndex
                  ),
                })
              : classNames({
                  'text-blue-800': cell.type === 'unknown',
                  'bg-blue-600': cell.value === selectedValue && cell.value !== 0,
                  'bg-blue-600 text-white':
                    cell.value === selectedValue &&
                    cell.value !== 0 &&
                    cell.value === cell.realAnswer,
                  'text-red-600': cell.value !== cell.realAnswer,
                }))
          }
        >
          {cell.value === 0 ? undefined : cell.value}
        </div>
      );
    }
  }

  return (
    <>
      <InformationBar sudoku={sudoku} resetSudoku={resetSudoku} />
      <div className="relative">
        {isPause ? (
          <div className="pause-and-loading-mask cursor-pointer" onClick={togglePause}>
            <PlayCircleOutlineIcon sx={{ color: blue[800], fontSize: '60px' }} />
          </div>
        ) : null}
        {isLoading ? (
          <div className="pause-and-loading-mask">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-800"></div>
          </div>
        ) : null}
        <table className={classNames({ 'sudoku-table': true, 'bg-neutral-100': isLoading })}>
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={
                  rowIndex === 2 || rowIndex === 5
                    ? 'border-solid border-b border-b-black'
                    : undefined
                }
              >
                {row.map((cell, colIndex) => {
                  const isRightBorder = colIndex === 2 || colIndex === 5;
                  return (
                    <td
                      key={colIndex}
                      className={
                        'sudoku-cell' +
                        classNames({
                          // border setting
                          'right-cell-border': isRightBorder,
                          'normal-border': !isRightBorder,
                        })
                      }
                      onClick={() => onTdClick(rowIndex, colIndex)}
                    >
                      {maskCellContent ? (
                        <div className="noting-cell"></div>
                      ) : (
                        <div
                          // handle background color
                          className={
                            isHintMode
                              ? classNames({
                                  'bg-green-700': isEqual(hint.position, { rowIndex, colIndex }),
                                  'bg-blue-200': isRelatedCell(hint.position, {
                                    rowIndex,
                                    colIndex,
                                  }),
                                })
                              : classNames({
                                  'bg-blue-200': isSelected(rowIndex, colIndex),
                                  'bg-neutral-200':
                                    !!selectedPosition &&
                                    isRelatedCell({ rowIndex, colIndex }, selectedPosition),
                                })
                          }
                        >
                          {renderCellNode(rowIndex, colIndex)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/**
 * TODO List
 * improvement:
 * 1. Add animation when moving the selected cell.
 */
