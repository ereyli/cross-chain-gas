import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '../../../lib/db';
import { fulfillOrder } from '../../../lib/fulfil';

export async function POST(request: NextRequest) {
  try {
    const { orderId, userTxHash } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Missing orderId' },
        { status: 400 }
      );
    }
    
    console.log(`🔧 Manual completion request for order: ${orderId}`);
    
    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Order found:', order.status);
    
    // If user provided tx hash, use it; otherwise use any existing one
    const txHash = userTxHash || order.source_tx || `manual_${Date.now()}`;
    
    // Mark as paid if not already
    if (order.status === 'AWAITING_PAYMENT') {
      await updateOrder(orderId, {
        status: 'PAID',
        source_tx: txHash,
        paid_at: new Date().toISOString()
      });
      console.log('✅ Order marked as PAID');
    }
    
    // Get updated order and fulfill
    const updatedOrder = await getOrder(orderId);
    if (updatedOrder && updatedOrder.status !== 'DONE') {
      console.log('🚀 Initiating fulfillment...');
      await fulfillOrder(updatedOrder);
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order completion initiated',
      orderId: orderId,
      status: 'fulfilling'
    });
    
  } catch (error) {
    console.error('Manual completion error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
