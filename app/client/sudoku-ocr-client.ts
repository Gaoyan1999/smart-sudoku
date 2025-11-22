/**
 * Sudoku OCR Client
 *
 * TypeScript client for calling the Sudoku OCR Lambda function.
 * Supports both API Gateway and direct Lambda invocation.
 */

export interface SudokuOCRRequest {
  base64_image: string;
}

export interface SudokuOCRResponse {
  statusCode: number;
  body: {
    grid?: number[][];
    message?: string;
    error?: string;
    type?: string;
  };
}

export interface SudokuOCRClientConfig {
  // For API Gateway
  apiGatewayUrl?: string;
  region?: string;
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
  };
}

/**
 * Convert image file to base64 string
 */
export async function imageToBase64(file: File | Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Remove data URL prefix if present
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Convert image file to base64 with data URL format
 */
export async function imageToBase64DataURL(
  file: File | Blob,
  mimeType: string = 'image/jpeg'
): Promise<string> {
  const base64 = await imageToBase64(file);
  return `data:${mimeType};base64,${base64}`;
}

/**
 * Sudoku OCR Client Class
 */
export class SudokuOCRClient {
  private config: SudokuOCRClientConfig;

  constructor(config: SudokuOCRClientConfig) {
    this.config = config;
  }

  /**
   * Call Lambda via API Gateway (HTTP)
   */
  async callViaAPI(request: SudokuOCRRequest): Promise<SudokuOCRResponse> {
    if (!this.config.apiGatewayUrl) {
      throw new Error('API Gateway URL is required for API Gateway invocation');
    }

    const response = await fetch(this.config.apiGatewayUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    const data = await response.json();

    // If body is a string, parse it
    if (typeof data.body === 'string') {
      data.body = JSON.parse(data.body);
    }

    return data as SudokuOCRResponse;
  }

  /**
   * Main method to call OCR - automatically chooses API Gateway or direct invocation
   */
  async recognize(request: SudokuOCRRequest): Promise<SudokuOCRResponse> {
    if (this.config.apiGatewayUrl) {
      return this.callViaAPI(request);
    } else {
      throw new Error('Either apiGatewayUrl must be provided');
    }
  }

  /**
   * Convenience method: Recognize from image file
   */
  async recognizeFromFile(file: File | Blob): Promise<SudokuOCRResponse> {
    const base64Image = await imageToBase64DataURL(file);
    return this.recognize({ base64_image: base64Image });
  }

  /**
   * Convenience method: Recognize from base64 string
   */
  async recognizeFromBase64(base64: string): Promise<SudokuOCRResponse> {
    // Add data URL prefix if not present
    const base64Image = base64.startsWith('data:') ? base64 : `data:image/jpeg;base64,${base64}`;

    return this.recognize({ base64_image: base64Image });
  }
}

// Example usage functions

/**
 * Example: Using API Gateway (Browser/Node.js)
 */
export async function exampleAPIGateway() {
  const client = new SudokuOCRClient({
    apiGatewayUrl: 'https://your-api-id.execute-api.ap-southeast-2.amazonaws.com/prod/sudoku-ocr',
  });

  // From file input
  const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
  if (fileInput?.files?.[0]) {
    const result = await client.recognizeFromFile(fileInput.files[0]);
    console.log('Sudoku grid:', result.body.grid);
  }

  // From base64
  const base64 = 'data:image/jpeg;base64,/9j/4AAQSkZJRg...';
  const result = await client.recognizeFromBase64(base64);
  console.log('Sudoku grid:', result.body.grid);
}
