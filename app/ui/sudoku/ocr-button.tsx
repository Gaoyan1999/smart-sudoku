import { Button } from '@mui/material';
import { useRef, useState } from 'react';
import { CircularProgress } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import { sudokuOcrApi } from '@/app/lib/sudoku-api-client';

export function OcrButton({
  onFinish,
  onError,
  onLoadingChange,
}: {
  onFinish: (grid: number[][]) => void;
  onError: (error: string) => void;
  onLoadingChange?: (isLoading: boolean) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isOcrLoading, _setIsOcrLoading] = useState(false);
  const setIsOcrLoading = (isLoading: boolean) => {
    _setIsOcrLoading(isLoading);
    onLoadingChange?.(isLoading);
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

    try {
      // Convert image to base64
      const base64Image = await convertFileToBase64(file);
      // base64Image will be used when calling the actual API
      const grid = await sudokuOcrApi(base64Image);
      // onFinish(grid);
      // // TODO: Call actual OCR API
      // // API request format: { "base64_image": "data:image/jpeg;base64,iVBOR...." }
      // // const response = await fetch('/api/ocr', {
      // //   method: 'POST',
      // //   headers: {
      // //     'Content-Type': 'application/json',
      // //   },
      // //   body: JSON.stringify({
      // //     base64_image: base64Image,
      // //   }),
      // // });
      // // const ocrResponse = await response.json();

      // // For now, hardcode the response
      // const mockResponse = {
      //   statusCode: 200,
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     grid: [
      //       [9, 2, 6, 0, 1, 5, 0, 0, 0],
      //       [1, 5, 8, 7, 6, 3, 9, 0, 0],
      //       [3, 0, 7, 9, 0, 0, 1, 8, 5],
      //       [0, 0, 9, 0, 0, 0, 0, 3, 8],
      //       [7, 3, 0, 0, 0, 0, 5, 9, 0],
      //       [0, 0, 0, 3, 9, 5, 0, 0, 0],
      //       [0, 7, 0, 0, 0, 0, 0, 1, 9],
      //       [6, 9, 4, 0, 0, 0, 7, 0, 2],
      //       [5, 0, 3, 6, 0, 0, 4, 0, 9],
      //     ],
      //     message: 'OCR处理成功',
      //   }),
      // };

      // // Simulate API delay
      // await new Promise((resolve) => setTimeout(resolve, 5000));

      // // Parse the response
      // const body = JSON.parse(mockResponse.body);
      // const grid = body.grid as number[][];
      onFinish(grid);
    } catch (error) {
      onError('OCR processing failed. Please try again.');
    } finally {
      setIsOcrLoading(false);
    }
  };
  const handleOcrImport = () => {
    fileInputRef.current?.click();
  };
  return (
    <div>
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
    </div>
  );
}
