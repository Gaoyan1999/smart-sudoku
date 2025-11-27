import { useSudoku } from '../../context/sudoku-provider';

export function NumberInput({ handleNumberInput }: { handleNumberInput: (num: number) => void }) {
  const { sudoku } = useSudoku();
  const { isPause } = sudoku.context;

  return (
    <div className="grid grid-cols-9 md:grid-cols-3 gap-1 mt-2 w-full md:max-w-[200px]">
      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((number) => (
        <button
          key={number}
          onClick={() => !isPause && handleNumberInput(number)}
          className={`aspect-square bg-gray-100 rounded-md flex items-center justify-center text-2xl md:text-3xl p-2 md:p-3 text-blue-800 hover:bg-gray-200
            ${isPause ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
        >
          {number}
        </button>
      ))}
    </div>
  );
}
