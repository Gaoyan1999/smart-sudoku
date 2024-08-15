import {SudokuCell, SudokuData} from "../types/sudoku.ts";
import {uniq} from "lodash";
import {getRelateCells} from "./location.ts";

export function fillAllCandidate(matrix: SudokuData["matrix"]) {
    matrix.forEach((row, rowIndex) => {
        row.forEach((cell, colIndex) => {
            cell.notingCandidates = findMissingNumbers(
                uniq(
                    getRelateCells({ rowIndex, colIndex }, matrix)
                        .filter((cell) => cell.value !== 0)
                        .map((cell) => cell.value),
                ),
            );
        });
    });
    return matrix;
}

function findMissingNumbers(nums: number[]) {
    const results: number[] = [];
    for (let i = 1; i <= 9; i++) {
        if (!nums.includes(i)) {
            results.push(i);
        }
    }
    return results;
}

export function fillCells(mission: string, solution: string): SudokuCell[][] {
    const result: SudokuCell[][] = [];
    if (mission.length !== 81 || solution.length !== 81) {
        throw Error("Invalid input");
    }
    const missionRowsString: string[] = [];
    const solutionRowsString: string[] = [];
    for (let i = 0; i < 9; i++) {
        missionRowsString.push(mission.slice(i * 9, (i + 1) * 9));
        solutionRowsString.push(solution.slice(i * 9, (i + 1) * 9));
    }
    missionRowsString.forEach((rowString, rowIndex) => {
        const row: SudokuCell[] = [];
        result.push(row);
        for (let i = 0; i < rowString.length; i++) {
            const value = +rowString[i];

            row.push({
                value: value,
                type: value === 0 ? "unknown" : "known",
                realAnswer: +solutionRowsString[rowIndex][i],
                notingCandidates: [],
            });
        }
    });

    return result;
}
