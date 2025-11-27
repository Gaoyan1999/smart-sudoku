import './main-playground.css';
import { classNames } from '../../utils/common';
import { isRelatedCell } from '../../utils/location';
import { Sudoku } from '../../types/sudoku';
import { NotingCell } from './noting-cell';
import { isEqual } from 'lodash';

function getBlockPosition(blockIndex: number) {
  // Calculate the row and column position of the block (0-2)
  const blockRow = Math.floor(blockIndex / 3);
  const blockCol = blockIndex % 3;

  return {
    top: `${blockRow * 33.33}%`,
    left: `${blockCol * 33.33}%`,
  };
}

export function SudokuBody({
  sudoku,
  setPosition,
}: {
  sudoku: Sudoku;
  setPosition: (rowIndex: number, colIndex: number) => void;
}) {
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
  function isCellInHintMode(rowIndex: number, colIndex: number) {
    if (!hint) return false;
    const { ruleType } = hint;
    if (ruleType === 'fillCellDirectly') {
      const { position } = hint;
      return position.rowIndex === rowIndex && position.colIndex === colIndex;
    } else {
      return false;
    }
  }

  function renderCellNode(rowIndex: number, colIndex: number) {
    const cell = matrix[rowIndex][colIndex];
    const showNotingCell = cell.value === 0 && cell.notingCandidates.length > 0;
    if (mode === 'making-new-puzzle') {
      return (
        <div
          className={'normal-mode-cell' + classNames({ 'text-blue-600': cell.type === 'unknown' })}
        >
          {cell.value === 0 ? undefined : cell.value}
        </div>
      );
    }
    if (isCellInHintMode(rowIndex, colIndex) && hint?.ruleType === 'fillCellDirectly') {
      return <div className="normal-mode-cell text-white animate-hint-flash">{hint.answer}</div>;
    }
    if (showNotingCell) {
      return (
        <NotingCell
          selectNumber={selectedValue}
          notingNumbers={cell.notingCandidates}
          hint={hint}
          position={{ rowIndex, colIndex }}
        />
      );
    }
    return (
      <div
        className={
          'normal-mode-cell' +
          (isHintMode
            ? classNames({
                'bg-blue-600 text-white': !!hint.secondaryCells.find(
                  (relatedCell) =>
                    relatedCell.position.rowIndex === rowIndex &&
                    relatedCell.position.colIndex === colIndex
                ),
              })
            : classNames({
                'text-blue-800': cell.type === 'unknown',
                'bg-blue-600': isSelected(rowIndex, colIndex) && cell.value !== 0,
                'bg-blue-600 text-white': cell.value === selectedValue,
                'text-white':
                  isSelected(rowIndex, colIndex) &&
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

  // Example: Assume we want to highlight the nth block (using 4 as an example here, representing the middle block)

  function renderHighlightBlockUnits() {
    if (!isHintMode || !hint?.highlightUnits?.length) return null;

    const blockUnits = hint.highlightUnits.filter((unit) => unit.type === 'block');
    if (!blockUnits.length) return null;

    return blockUnits.map((unit) => {
      const blockPosition = getBlockPosition(unit.index);
      return (
        <div
          key={unit.index}
          className={classNames({
            'absolute w-[33.33%] h-[33.33%] border-2 border-red-500 pointer-events-none bg-blue-200/30 -z-10':
              unit.hasBorder,
            'absolute w-[33.33%] h-[33.33%] pointer-events-none bg-blue-200/30 -z-10':
              !unit.hasBorder,
          })}
          style={{
            top: blockPosition.top,
            left: blockPosition.left,
          }}
        ></div>
      );
    });
  }

  function renderHighlightRowUnits() {
    if (!isHintMode || !hint?.highlightUnits?.length) return null;

    const rowUnits = hint.highlightUnits.filter((unit) => unit.type === 'row');
    if (!rowUnits.length) return null;

    return rowUnits.map((unit) => (
      <div
        key={`row-${unit.index}`}
        className={classNames({
          'absolute w-full border-2 border-red-500 pointer-events-none bg-blue-200/30 -z-10':
            unit.hasBorder,
          'absolute w-full pointer-events-none bg-blue-200/30 -z-10': !unit.hasBorder,
        })}
        style={{
          top: `${(unit.index / 9) * 100}%`,
          height: '11.11%',
        }}
      ></div>
    ));
  }

  function renderHighlightColumnUnits() {
    if (!isHintMode || !hint?.highlightUnits?.length) return null;

    const columnUnits = hint.highlightUnits.filter((unit) => unit.type === 'column');
    if (!columnUnits.length) return null;

    return columnUnits.map((unit) => (
      <div
        key={`column-${unit.index}`}
        className={classNames({
          'absolute h-full border-2 border-red-500 pointer-events-none bg-blue-200/30 -z-10':
            unit.hasBorder,
          'absolute h-full pointer-events-none bg-blue-200/30 -z-10': !unit.hasBorder,
        })}
        style={{
          left: `${(unit.index / 9) * 100}%`,
          width: '11.11%',
        }}
      ></div>
    ));
  }

  function renderSudokuBorders() {
    return (
      <>
        {/* Outer border - all 4 sides */}
        {/* Top border */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-black pointer-events-none z-10" />
        {/* Bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black pointer-events-none z-10" />
        {/* Left border */}
        <div className="absolute top-0 bottom-0 left-0 w-[2px] bg-black pointer-events-none z-10" />
        {/* Right border */}
        <div className="absolute top-0 bottom-0 right-0 w-[2px] bg-black pointer-events-none z-10" />

        {/* Block separator borders - thick lines */}
        {/* Vertical lines at 33.33% and 66.66% */}
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-black pointer-events-none z-10"
          style={{ left: '33.33%' }}
        />
        <div
          className="absolute top-0 bottom-0 w-[2px] bg-black pointer-events-none z-10"
          style={{ left: '66.66%' }}
        />
        {/* Horizontal lines at 33.33% and 66.66% */}
        <div
          className="absolute left-0 right-0 h-[2px] bg-black pointer-events-none z-10"
          style={{ top: '33.33%' }}
        />
        <div
          className="absolute left-0 right-0 h-[2px] bg-black pointer-events-none z-10"
          style={{ top: '66.66%' }}
        />

        {/* Cell borders - thin gray lines */}
        {/* Vertical cell borders */}
        {[1, 2, 4, 5, 7, 8].map((colIndex) => (
          <div
            key={`v-cell-${colIndex}`}
            className="absolute top-0 bottom-0 w-[0.5px] bg-neutral-400 pointer-events-none z-10"
            style={{ left: `${(colIndex / 9) * 100}%` }}
          />
        ))}
        {/* Horizontal cell borders */}
        {[1, 2, 4, 5, 7, 8].map((rowIndex) => (
          <div
            key={`h-cell-${rowIndex}`}
            className="absolute left-0 right-0 h-[0.5px] bg-neutral-400 pointer-events-none z-10"
            style={{ top: `${(rowIndex / 9) * 100}%` }}
          />
        ))}
      </>
    );
  }

  return (
    <div
      className="relative w-full pointer-events-none"
      style={{ width: 'min(100%, 600px)', aspectRatio: '1' }}
    >
      {/* highlight unit: block */}
      {renderHighlightBlockUnits()}
      {/* highlight unit: row */}
      {renderHighlightRowUnits()}
      {/* highlight unit: column */}
      {renderHighlightColumnUnits()}
      <div className="relative w-full h-full">
        {/* Sudoku borders */}
        {renderSudokuBorders()}
        <table
          className={classNames({
            'sudoku-table': true,
            'bg-neutral-100': isLoading,
            'pointer-events-auto': true,
          })}
        >
          <tbody>
            {matrix.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.map((_, colIndex) => {
                  return (
                    <td
                      key={colIndex}
                      className="sudoku-cell"
                      onClick={() => onTdClick(rowIndex, colIndex)}
                    >
                      {maskCellContent ? (
                        <div className="noting-cell"></div>
                      ) : (
                        <div
                          // handle background color
                          className={
                            isHintMode
                              ? hint?.ruleType === 'fillCellDirectly'
                                ? classNames({
                                    'bg-green-700': isEqual(hint.position, {
                                      rowIndex,
                                      colIndex,
                                    }),
                                    'bg-blue-200': isRelatedCell(hint.position, {
                                      rowIndex,
                                      colIndex,
                                    }),
                                  })
                                : classNames({
                                    'bg-green-700': hint.primaryCells.some((c) =>
                                      isEqual(c.position, { rowIndex, colIndex })
                                    ),
                                    'bg-blue-200': hint.secondaryCells.some((c) =>
                                      isEqual(c.position, { rowIndex, colIndex })
                                    ),
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
    </div>
  );
}

/**
 * TODO List
 * improvement:
 * 1. Add animation when moving the selected cell.
 */
