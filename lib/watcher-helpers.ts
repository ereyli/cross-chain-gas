import { ethers } from 'ethers';
import { getProviders } from './chains';
import type { ChainKey } from '../types';

export interface AlchemyWebhookPayload {
  id: string;
  webhookId: string;
  createdAt: string;
  type: string;
  event: {
    network: string;
    activity: Array<{
      fromAddress: string;
      toAddress: string;
      blockNum: string;
      hash: string;
      value?: number;
      erc20Transfers?: Array<{
        from: string;
        to: string;
        value: number;
        tokenId?: string;
        asset: string;
        category: string;
        rawContract: {
          address: string;
          decimal: string;
        };
      }>;
    }>;
  };
}

export interface NormalizedPayment {
  hash: string;
  from: string;
  to: string;
  blockNumber: number;
  isEth: boolean;
  tokenAddress?: string;
  amount: string; // Raw amount as string
}

export function normalizeWebhookPayload(payload: any): NormalizedPayment[] {
  const payments: NormalizedPayment[] = [];
  
  // Handle both V1 and V2 webhook formats
  let activities = [];
  
  if (payload.event && payload.event.activity) {
    // V2 format
    activities = payload.event.activity;
  } else if (payload.activity) {
    // V1 format or direct activity
    activities = payload.activity;
  } else {
    console.warn('Unknown webhook payload format:', payload);
    return payments;
  }
  
  for (const activity of activities) {
    // Parse block number (could be hex or decimal)
    const blockNumber = typeof activity.blockNum === 'string' && activity.blockNum.startsWith('0x') 
      ? parseInt(activity.blockNum, 16) 
      : parseInt(activity.blockNum || '0');
    
    // Handle ETH transfers
    if (activity.value && parseFloat(activity.value) > 0) {
      payments.push({
        hash: activity.hash,
        from: activity.fromAddress.toLowerCase(),
        to: activity.toAddress.toLowerCase(),
        blockNumber,
        isEth: true,
        amount: ethers.parseEther(activity.value.toString()).toString()
      });
    }
    
    // Handle ERC20 transfers
    if (activity.erc20Transfers && Array.isArray(activity.erc20Transfers)) {
      for (const transfer of activity.erc20Transfers) {
        try {
          const decimals = parseInt(transfer.rawContract?.decimal || '18');
          // Handle both numeric and string values
          const transferValue = typeof transfer.value === 'string' 
            ? parseFloat(transfer.value) 
            : transfer.value;
          const amount = BigInt(Math.floor(transferValue * Math.pow(10, decimals)));
          
          payments.push({
            hash: activity.hash,
            from: transfer.from.toLowerCase(),
            to: transfer.to.toLowerCase(),
            blockNumber,
            isEth: false,
            tokenAddress: transfer.rawContract?.address?.toLowerCase(),
            amount: amount.toString()
          });
        } catch (error) {
          console.error('Error parsing ERC20 transfer:', error, transfer);
        }
      }
    }
  }
  
  return payments;
}

export async function verifyPayment(
  payment: NormalizedPayment,
  chainKey: ChainKey,
  requiredConfirmations = 3
): Promise<boolean> {
  try {
    const providers = getProviders();
    const provider = providers[chainKey].http;
    
    const receipt = await provider.getTransactionReceipt(payment.hash);
    
    if (!receipt) {
      console.log(`Transaction receipt not found: ${payment.hash}`);
      return false;
    }
    
    if (receipt.status !== 1) {
      console.log(`Transaction failed: ${payment.hash}`);
      return false;
    }
    
    const currentBlock = await provider.getBlockNumber();
    const confirmations = currentBlock - receipt.blockNumber + 1;
    
    if (confirmations < requiredConfirmations) {
      console.log(`Insufficient confirmations: ${confirmations}/${requiredConfirmations} for ${payment.hash}`);
      return false;
    }
    
    console.log(`Payment verified: ${payment.hash} with ${confirmations} confirmations`);
    return true;
  } catch (error) {
    console.error(`Failed to verify payment ${payment.hash}:`, error);
    return false;
  }
}

export function validateWebhookSignature(
  payload: string,
  signature: string,
  webhookSecret: string
): boolean {
  // Temporary: Skip validation for debugging
  console.warn('Webhook signature validation temporarily disabled for debugging');
  console.log('Webhook secret available:', !!webhookSecret);
  return true;
  
  if (!webhookSecret || webhookSecret === 'whsec_test') {
    console.warn('Webhook signature validation skipped - no signing key configured');
    return true; // Skip validation in development
  }
  
  try {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookSecret);
    hmac.update(payload, 'utf8');
    const computedSignature = hmac.digest('hex');
    
    return signature === computedSignature;
  } catch (error) {
    console.error('Webhook signature validation error:', error);
    return false;
  }
}

export function isExpectedPayment(
  payment: NormalizedPayment,
  expectedFrom: string,
  expectedTo: string,
  expectedAmount: string,
  expectedTokenAddress?: string
): boolean {
  // Check addresses
  if (payment.from !== expectedFrom.toLowerCase()) {
    return false;
  }
  
  if (payment.to !== expectedTo.toLowerCase()) {
    return false;
  }
  
  // Check amount (exact match required)
  if (payment.amount !== expectedAmount) {
    return false;
  }
  
  // Check token address for ERC20 transfers
  if (!payment.isEth) {
    if (!expectedTokenAddress || payment.tokenAddress !== expectedTokenAddress.toLowerCase()) {
      return false;
    }
  } else if (expectedTokenAddress) {
    // ETH payment but token address expected
    return false;
  }
  
  return true;
}
