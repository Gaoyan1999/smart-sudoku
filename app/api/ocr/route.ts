import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { base64_image } = body;

    if (!base64_image) {
      return NextResponse.json({ error: 'base64_image is required' }, { status: 400 });
    }

    let apiUrl = process.env.SUDOKU_OCR_API_URL;
    if (!apiUrl) {
      return NextResponse.json({ error: 'SUDOKU_OCR_API_URL is not configured' }, { status: 500 });
    }

    // Remove trailing slash if present (API Gateway might be sensitive to this)
    apiUrl = apiUrl.replace(/\/$/, '');

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ base64_image }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OCR API error:', response.status, errorText);
      return NextResponse.json(
        { error: `OCR API returned ${response.status}: ${errorText}` },
        { status: response.status }
      );
    }

    const data = await response.json();

    // Handle API Gateway response format
    if (data.statusCode !== undefined) {
      if (data.statusCode !== 200) {
        const errorMessage =
          typeof data.body === 'string' ? data.body : data.body?.message || 'OCR processing failed';
        return NextResponse.json({ error: errorMessage }, { status: data.statusCode || 500 });
      }
      // Parse body if it's a string
      const body = typeof data.body === 'string' ? JSON.parse(data.body) : data.body;
      return NextResponse.json({ grid: body.grid });
    }

    // Direct response format (if API doesn't use API Gateway format)
    if (data.grid) {
      return NextResponse.json({ grid: data.grid });
    }

    return NextResponse.json({ error: 'Unexpected response format from OCR API' }, { status: 500 });
  } catch (error) {
    console.error('OCR API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
