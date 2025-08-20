import { NextRequest, NextResponse } from 'next/server';
import { getOrder } from '../../../lib/db';
import { weiToUsd, getUsdPrice } from '../../../lib/prices';
import type { StatusResponse } from '../../../types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId parameter' },
        { status: 400 }
      );
    }
    
    const order = await getOrder(orderId);
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    let deliveredUSD: number | undefined;
    
    // Calculate delivered USD if order is fulfilled
    if (order.status === 'DONE' && order.target_tx) {
      try {
        const ethPrice = await getUsdPrice('ETH', order.target_chain);
        const targetAmountWei = BigInt(order.exact_amount_raw);
        deliveredUSD = weiToUsd(targetAmountWei, ethPrice);
      } catch (error) {
        console.warn('Failed to calculate delivered USD:', error);
      }
    }
    
    const response: StatusResponse = {
      status: order.status,
      sourceTx: order.source_tx || undefined,
      targetTx: order.target_tx || undefined,
      deliveredNative: order.status === 'DONE' ? order.exact_amount_raw : undefined,
      deliveredUSD
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error('Status check error:', error);
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
