// Mock fulfillment service for local testing
import { updateOrder } from './db';
import { isLocalTestMode } from './test-config';
import type { ChainKey, Order } from '../types';

export async function sendNativeMock(
  chainKey: ChainKey, 
  to: string, 
  valueWei: bigint
): Promise<string> {
  console.log(`🧪 MOCK: Sending ${valueWei.toString()} wei to ${to} on ${chainKey}`);
  
  // Simulate transaction processing delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Generate mock transaction hash
  const mockTxHash = `0x${Math.random().toString(16).substr(2, 64)}`;
  
  console.log(`🧪 MOCK: Transaction sent: ${mockTxHash}`);
  return mockTxHash;
}

export async function fulfillOrderMock(order: Order, retryCount = 0): Promise<void> {
  const MAX_RETRIES = 3;
  
  try {
    console.log(`🧪 MOCK: Fulfilling order ${order.id}`);
    
    // Mark as fulfilling
    await updateOrder(order.id, { 
      status: 'FULFILLING' 
    });
    
    // Calculate target amount (simplified for mock)
    const targetAmountWei = BigInt(Math.floor(order.target_amount_usd * 1e18 / 3000));
    
    // Send native token (mock)
    const targetTxHash = await sendNativeMock(
      order.target_chain,
      order.target_recipient,
      targetAmountWei
    );
    
    // Mark as done
    await updateOrder(order.id, {
      status: 'DONE',
      target_tx: targetTxHash,
      fulfilled_at: new Date().toISOString()
    });
    
    console.log(`🧪 MOCK: Order ${order.id} fulfilled successfully`);
  } catch (error) {
    console.error(`🧪 MOCK: Failed to fulfill order ${order.id}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`🧪 MOCK: Retrying fulfillment for order ${order.id} (attempt ${retryCount + 1})`);
      setTimeout(() => {
        fulfillOrderMock(order, retryCount + 1);
      }, Math.pow(2, retryCount) * 1000);
    } else {
      await updateOrder(order.id, {
        status: 'REFUNDED'
      });
      console.error(`🧪 MOCK: Order ${order.id} marked as refunded after ${MAX_RETRIES} failed attempts`);
    }
  }
}
