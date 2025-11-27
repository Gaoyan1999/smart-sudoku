interface CongratsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CongratsModal({ isOpen, onClose }: CongratsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center animate-fade-in z-[100]">
      <div className="bg-white rounded-lg p-8 transform animate-bounce-in max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-center mb-4">🎉 Congratulations!</h2>
        <p className="text-lg text-center">You have successfully solved the Sudoku puzzle!</p>
        <button
          className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={onClose}
        >
          Confirm
        </button>
      </div>
    </div>
  );
}
