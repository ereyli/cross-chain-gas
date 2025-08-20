import { NextRequest, NextResponse } from 'next/server';
import { generateQuote, validateQuoteRequest } from '../../../lib/quote';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const quoteRequest = validateQuoteRequest(body);
    const quote = await generateQuote(quoteRequest);
    
    return NextResponse.json(quote);
  } catch (error) {
    console.error('Quote generation error:', error);
    
    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  );
}
