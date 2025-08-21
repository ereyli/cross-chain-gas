import { NextRequest, NextResponse } from 'next/server';
import { getOrder, updateOrder } from '../../../lib/db';
import { fulfillOrder } from '../../../lib/fulfil';
import { 
  checkRateLimit, 
  verifyTransaction, 
  validateOrderData, 
  sanitizeInput, 
  validateTransactionHash 
} from '../../../lib/security';
import { getUsdPrice, usdToWeiOnSource } from '../../../lib/prices';

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

    const { orderId, txHash } = await request.json();
    
    // Input validation
    if (!orderId || !txHash) {
      return NextResponse.json(
        { error: 'Missing orderId or txHash' },
        { status: 400 }
      );
    }

    // Input sanitization
    const sanitizedOrderId = sanitizeInput(orderId);
    const sanitizedTxHash = sanitizeInput(txHash);

    // Transaction hash format kontrolü
    if (!validateTransactionHash(sanitizedTxHash)) {
      return NextResponse.json(
        { error: 'Invalid transaction hash format' },
        { status: 400 }
      );
    }
    
    console.log(`🔧 Manual fulfillment for order: ${sanitizedOrderId}`);
    
    // Get order
    const order = await getOrder(sanitizedOrderId);
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log('Order found:', order.status);

    // Order data validation
    const orderValidation = validateOrderData(order);
    if (!orderValidation.isValid) {
      return NextResponse.json(
        { error: orderValidation.error },
        { status: 400 }
      );
    }
    
    // Sadece AWAITING_PAYMENT durumunda fulfillment yapılabilir
    if (order.status !== 'AWAITING_PAYMENT') {
      return NextResponse.json(
        { error: `Order is in ${order.status} status. Cannot fulfill.` },
        { status: 400 }
      );
    }

    // Transaction verification
    const expectedAmountWei = await usdToWeiOnSource(order.target_amount_usd, order.source_chain);
    const expectedTo = '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa'; // Fulfillment wallet address
    
    const verification = await verifyTransaction(
      sanitizedTxHash,
      order.source_chain,
      expectedAmountWei,
      expectedTo,
      sanitizedOrderId
    );

    if (!verification.isValid) {
      console.log(`❌ Transaction verification failed: ${verification.error}`);
      return NextResponse.json(
        { 
          error: 'Transaction verification failed',
          details: verification.error,
          actualAmount: verification.actualAmount ? verification.actualAmount.toString() : undefined,
          actualTo: verification.actualTo
        },
        { status: 400 }
      );
    }

    console.log('✅ Transaction verified successfully');
    
    // Mark as paid
    await updateOrder(sanitizedOrderId, {
      status: 'PAID',
      source_tx: sanitizedTxHash,
      paid_at: new Date().toISOString()
    });
    console.log('✅ Order marked as PAID');
    
    // Fulfill order
    const updatedOrder = await getOrder(sanitizedOrderId);
    if (updatedOrder) {
      await fulfillOrder(updatedOrder);
      console.log('🚀 Fulfillment initiated');
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Order fulfillment initiated successfully' 
    });
    
  } catch (error) {
    console.error('Manual fulfillment error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
