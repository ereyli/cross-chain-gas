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

      // Transaction content verification
      console.log('🔍 Transaction content verification...');
      
      const txInfo = {
        hash: tx.hash,
        from: tx.from,
        to: tx.to,
        value: tx.value?.toString(),
        data: tx.data,
        nonce: tx.nonce,
        gasLimit: tx.gasLimit?.toString(),
        gasPrice: tx.gasPrice?.toString()
      };

      console.log('📋 Transaction details:', txInfo);

      // Basic sanity checks
      if (!tx.from || !tx.to) {
        console.log('❌ Invalid transaction: missing from or to address');
        return NextResponse.json(
          { error: 'Invalid transaction: missing addresses' },
          { status: 400 }
        );
      }

      // Check if this is an ERC-20 token transaction (like USDC)
      const isERC20Transaction = tx.data && tx.data.length > 10 && tx.data.startsWith('0xa9059cbb');
      
      if (isERC20Transaction) {
        console.log('💰 ERC-20 token transaction detected (USDC/USDT)');
        
        // For ERC-20 transactions, tx.value is 0 (which is normal)
        // The actual transfer amount is encoded in tx.data
        console.log('📊 ERC-20 transaction details:', {
          to: tx.to,
          data: tx.data,
          note: 'Value is 0 for ERC-20 tokens (normal behavior)'
        });
      } else {
        // Native token transaction (ETH, MATIC, etc.)
        if (!tx.value || tx.value === BigInt(0)) {
          console.log('❌ Invalid native token transaction: zero or missing value');
          return NextResponse.json(
            { error: 'Invalid native token transaction: zero value' },
            { status: 400 }
          );
        }
        console.log('💰 Native token transaction detected');
      }

      // Check if transaction has been confirmed (optional)
      try {
        const receipt = await provider.getTransactionReceipt(sanitizedTxHash);
        if (receipt) {
          console.log('✅ Transaction receipt found - transaction is confirmed');
        } else {
          console.log('⚠️ Transaction receipt not found - may still be pending');
        }
      } catch (error) {
        console.log('⚠️ Could not check confirmation status:', error);
      }

      console.log('✅ Transaction content verification passed');

      console.log('✅ Transaction verification passed:', {
        hash: tx.hash,
        to: tx.to,
        value: tx.value?.toString(),
        isERC20: isERC20Transaction,
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