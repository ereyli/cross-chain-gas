import { NextRequest, NextResponse } from 'next/server';
import { generateQuote, validateQuoteRequest } from '../../../lib/quote';
import { checkRateLimit, validateOrderData, sanitizeInput } from '../../../lib/security';

export async function POST(request: NextRequest) {
  try {
    // Rate limiting kontrolü
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown';
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Input sanitization
    const sanitizedBody = {
      ...body,
      targetRecipient: sanitizeInput(body.targetRecipient || ''),
      sourceChain: sanitizeInput(body.sourceChain || ''),
      targetChain: sanitizeInput(body.targetChain || '')
    };

    // Order data validation
    const orderValidation = validateOrderData({
      id: 'temp',
      source_chain: sanitizedBody.sourceChain,
      target_chain: sanitizedBody.targetChain,
      target_recipient: sanitizedBody.targetRecipient,
      target_amount_usd: sanitizedBody.targetAmountUsd
    });

    if (!orderValidation.isValid) {
      return NextResponse.json(
        { error: orderValidation.error },
        { status: 400 }
      );
    }

    const quoteRequest = validateQuoteRequest(sanitizedBody);
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
