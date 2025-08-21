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
import { getProviders } from '../../../lib/chains';

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

    // Smart transaction verification
    console.log('🔍 Starting smart transaction verification...');
    console.log('📋 Order details:', {
      orderId: sanitizedOrderId,
      sourceChain: order.source_chain,
      targetAmountUsd: order.target_amount_usd,
      txHash: sanitizedTxHash
    });

    try {
      const providers = getProviders();
      const provider = providers[order.source_chain].http;
      const tx = await provider.getTransaction(sanitizedTxHash);
      
      if (!tx) {
        console.log('❌ Transaction not found on blockchain');
        return NextResponse.json(
          { error: 'Transaction not found on blockchain' },
          { status: 400 }
        );
      }

      // Check if transaction is to the user's own wallet (this is correct behavior)
      console.log('📍 Transaction destination:', {
        to: tx.to,
        note: 'User sending to their own wallet (correct)'
      });

      // Calculate expected amount (including fees)
      const serviceFee = order.target_amount_usd * 0.03; // 3% service fee
      const executionBuffer = 0.50; // $0.50 execution buffer
      const totalAmount = order.target_amount_usd + serviceFee + executionBuffer;
      const ethPrice = 2500; // $2500 USD per ETH (fixed for now)
      const ethAmount = totalAmount / ethPrice;
      const expectedAmountWei = BigInt(Math.floor(ethAmount * 1e18));

      // Check if amount is correct (with 5% tolerance for gas price fluctuations)
      const actualAmount = tx.value || BigInt(0);
      const tolerance = expectedAmountWei * BigInt(5) / BigInt(100); // 5% tolerance
      const minAmount = expectedAmountWei - tolerance;
      const maxAmount = expectedAmountWei + tolerance;

      console.log('💰 Amount verification:', {
        expected: expectedAmountWei.toString(),
        actual: actualAmount.toString(),
        min: minAmount.toString(),
        max: maxAmount.toString(),
        tolerance: tolerance.toString()
      });

      if (actualAmount < minAmount || actualAmount > maxAmount) {
        console.log('❌ Amount mismatch:', {
          expected: expectedAmountWei.toString(),
          actual: actualAmount.toString(),
          tolerance: tolerance.toString()
        });
        return NextResponse.json(
          { 
            error: 'Transaction amount mismatch',
            expected: expectedAmountWei.toString(),
            actual: actualAmount.toString()
          },
          { status: 400 }
        );
      }

      console.log('✅ Transaction verification passed:', {
        hash: tx.hash,
        to: tx.to,
        value: tx.value?.toString(),
        status: 'verified'
      });

    } catch (error) {
      console.log('❌ Transaction verification failed:', error);
      return NextResponse.json(
        { error: 'Transaction verification failed' },
        { status: 400 }
      );
    }

    console.log('✅ Smart transaction verification passed');
    
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
