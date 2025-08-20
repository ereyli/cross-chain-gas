// Manual fulfillment script for testing
const { fulfillOrder } = require('../lib/fulfil');
const { getOrder, updateOrder } = require('../lib/db');

async function manualFulfill(orderId, sourceTxHash) {
  try {
    console.log(`🔧 Manual fulfillment for order: ${orderId}`);
    
    // Get order
    const order = await getOrder(orderId);
    if (!order) {
      console.error('Order not found');
      return;
    }
    
    console.log('Order found:', order.status);
    
    // Mark as paid manually
    if (order.status === 'AWAITING_PAYMENT') {
      await updateOrder(orderId, {
        status: 'PAID',
        source_tx: sourceTxHash,
        paid_at: new Date().toISOString()
      });
      console.log('✅ Order marked as PAID');
    }
    
    // Fulfill order
    const updatedOrder = await getOrder(orderId);
    await fulfillOrder(updatedOrder);
    
    console.log('🚀 Fulfillment initiated');
    
  } catch (error) {
    console.error('Manual fulfillment error:', error);
  }
}

// Usage: node scripts/manual-fulfill.js ORDER_ID TX_HASH
const orderId = process.argv[2];
const txHash = process.argv[3];

if (!orderId || !txHash) {
  console.log('Usage: node scripts/manual-fulfill.js ORDER_ID TX_HASH');
  process.exit(1);
}

manualFulfill(orderId, txHash);
