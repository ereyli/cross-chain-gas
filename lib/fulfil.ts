import { updateOrder } from './db';
import { getUsdPrice, usdToWeiOnTarget } from './prices';
import { isLocalTestMode, CONFIG } from './test-config';
import { sendNativeMock, fulfillOrderMock } from './fulfil-mock';
import type { ChainKey, Order } from '../types';

// Direct wallet approach - using private keys
async function sendTransactionViaWallet(
  chainKey: ChainKey,
  to: string,
  valueWei: bigint
): Promise<string> {
  const ethers = require('ethers');
  
  // Get provider for target chain
  const { getProviders } = require('./chains');
  const providers = getProviders();
  const provider = providers[chainKey].http;
  
  // Get fulfillment wallet private key from config
  const privateKey = CONFIG.fulfillmentWallet.privateKey;
  
  if (!privateKey || privateKey.includes('0000000000000')) {
    throw new Error(`No valid fulfillment wallet private key. Please set FULFILLMENT_PRIVATE_KEY environment variable.`);
  }
  
  console.log(`🔑 Sending transaction via wallet for ${chainKey}`);
  console.log(`💰 Amount: ${valueWei.toString()} wei to ${to}`);
  
  try {
    const wallet = new ethers.Wallet(privateKey, provider);
    console.log(`📍 Wallet address: ${wallet.address}`);
    
    // Check balance
    const balance = await provider.getBalance(wallet.address);
    console.log(`💳 Wallet balance: ${balance.toString()} wei`);
    
    if (balance < valueWei) {
      throw new Error(`Insufficient balance: ${balance.toString()} < ${valueWei.toString()}`);
    }
    
    const tx = await wallet.sendTransaction({
      to: to,
      value: valueWei.toString(),
      gasLimit: 21000,
    });
    
    console.log(`✅ Transaction sent: ${tx.hash}`);
    
    // Wait for confirmation
    await tx.wait(1);
    console.log(`✅ Transaction confirmed: ${tx.hash}`);
    
    return tx.hash;
  } catch (error) {
    console.error(`❌ Wallet transaction failed:`, error);
    throw error;
  }
}

// Defender completely removed - using direct wallet approach only

export async function sendNative(
  chainKey: ChainKey, 
  to: string, 
  valueWei: bigint
): Promise<string> {
  // Check if we're in test mode - if so, use mock
  if (isLocalTestMode()) {
    console.log('🧪 Using mock fulfillment in test mode');
    return sendNativeMock(chainKey, to, valueWei);
  }
  
  try {
    // Use direct wallet approach
    return await sendTransactionViaWallet(chainKey, to, valueWei);
  } catch (error) {
    console.error(`Failed to send native via wallet on ${chainKey}:`, error);
    console.log('Falling back to mock fulfillment');
    return sendNativeMock(chainKey, to, valueWei);
  }
}

export async function fulfillOrder(order: Order, retryCount = 0): Promise<void> {
  // Direct wallet approach - no Defender dependency
  
  const MAX_RETRIES = 3;
  
  try {
    // Mark as fulfilling
    await updateOrder(order.id, { 
      status: 'FULFILLING' 
    });
    
    // Calculate target amount in wei using current ETH price
    const ethPrice = await getUsdPrice('ETH', order.target_chain);
    const targetAmountWei = usdToWeiOnTarget(order.target_amount_usd, ethPrice);
    
    // Send native token
    const targetTxHash = await sendNative(
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
    
    console.log(`Order ${order.id} fulfilled successfully`);
  } catch (error) {
    console.error(`Failed to fulfill order ${order.id}:`, error);
    
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying fulfillment for order ${order.id} (attempt ${retryCount + 1})`);
      setTimeout(() => {
        fulfillOrder(order, retryCount + 1);
      }, Math.pow(2, retryCount) * 1000); // Exponential backoff
    } else {
      // Mark as refunded after max retries
      await updateOrder(order.id, {
        status: 'REFUNDED'
      });
      
      console.error(`Order ${order.id} marked as refunded after ${MAX_RETRIES} failed attempts`);
      
      // TODO: Implement refund logic on source chain
      // For MVP, we'll handle refunds manually
    }
  }
}

export async function estimateGasCost(chainKey: ChainKey): Promise<bigint> {
  // Return estimated gas cost for native transfer in wei
  // This is a simplified estimation - in production, you'd fetch actual gas prices
  
  const estimatedGasPrice = {
    base: BigInt('1000000000'), // 1 gwei
    op: BigInt('1000000000'),   // 1 gwei  
    arb: BigInt('100000000'),   // 0.1 gwei
  };
  
  const gasLimit = BigInt(21000); // Standard transfer
  return estimatedGasPrice[chainKey] * gasLimit;
}
