import { NextRequest, NextResponse } from 'next/server';
import { getUserOrders } from '../../../lib/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userAddress = searchParams.get('address');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!userAddress) {
      return NextResponse.json(
        { error: 'User address is required' },
        { status: 400 }
      );
    }

    const orders = await getUserOrders(userAddress, limit);

    return NextResponse.json({
      success: true,
      orders
    });

  } catch (error) {
    console.error('Failed to get user history:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get user history', 
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
