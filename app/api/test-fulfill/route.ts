import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '../../../lib/db';
import { fulfillOrder } from '../../../lib/fulfil';

export async function POST(request: NextRequest) {
  try {
    const { orderId, txHash } = await request.json();
    
    if (!orderId || !txHash) {
      return NextResponse.json(
        { error: 'Missing orderId or txHash' },
        { status: 400 }
      );
    }
    
    console.log(`🔧 Manual fulfillment for order: ${orderId}`);
    
    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Order found:', order.status);
    
    // Mark as paid manually
    if (order.status === 'AWAITING_PAYMENT') {
      await updateOrder(orderId, {
        status: 'PAID',
        source_tx: txHash,
        paid_at: new Date().toISOString()
      });
      console.log('✅ Order marked as PAID');
    }
    
    // Fulfill order
    const updatedOrder = await getOrder(orderId);
    if (updatedOrder) {
      await fulfillOrder(updatedOrder);
      console.log('🚀 Fulfillment initiated');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order fulfillment initiated' 
    });
    
  } catch (error) {
    console.error('Manual fulfillment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
