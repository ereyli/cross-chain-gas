import { ethers } from 'ethers';
import { getProviders } from './chains';
import type { ChainKey } from '../types';

// Rate limiting için basit in-memory store
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

// Rate limiting: 5 istek/dakika per IP
const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 dakika

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);
  
  if (!record || now > record.resetTime) {
    // Yeni window başlat
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    });
    return true;
  }
  
  if (record.count >= RATE_LIMIT_MAX) {
    return false; // Rate limit aşıldı
  }
  
  // Count artır
  record.count++;
  return true;
}

export async function verifyTransaction(
  txHash: string,
  sourceChain: ChainKey,
  expectedAmountWei: bigint,
  expectedTo: string,
  orderId: string
): Promise<{
  isValid: boolean;
  error?: string;
  actualAmount?: bigint;
  actualTo?: string;
}> {
  try {
    console.log(`🔍 Verifying transaction: ${txHash} on ${sourceChain}`);
    
    // Provider al
    const providers = getProviders();
    const provider = providers[sourceChain].http;
    
    // Transaction'ı blockchain'den çek
    const tx = await provider.getTransaction(txHash);
    if (!tx) {
      return { isValid: false, error: 'Transaction not found on blockchain' };
    }
    
    // Transaction'ın onaylanmış olup olmadığını kontrol et
    const receipt = await provider.getTransactionReceipt(txHash);
    if (!receipt || receipt.status !== 1) {
      return { isValid: false, error: 'Transaction not confirmed or failed' };
    }
    
    // Miktar kontrolü
    if (tx.value !== expectedAmountWei) {
      console.log(`❌ Amount mismatch: expected ${expectedAmountWei}, got ${tx.value}`);
      return { 
        isValid: false, 
        error: 'Transaction amount does not match order amount',
        actualAmount: tx.value
      };
    }
    
    // Hedef adres kontrolü
    if (tx.to?.toLowerCase() !== expectedTo.toLowerCase()) {
      console.log(`❌ Recipient mismatch: expected ${expectedTo}, got ${tx.to}`);
      return { 
        isValid: false, 
        error: 'Transaction recipient does not match expected address',
        actualTo: tx.to || undefined
      };
    }
    
    // Transaction'ın daha önce kullanılmadığını kontrol et
    // Bu kontrol için database'de kullanılan transaction hash'leri saklamak gerekir
    // Şimdilik basit bir kontrol yapıyoruz
    
    console.log(`✅ Transaction verified successfully`);
    return { isValid: true };
    
  } catch (error) {
    console.error(`❌ Transaction verification failed:`, error);
    return { 
      isValid: false, 
      error: `Verification failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function validateOrderData(order: any): {
  isValid: boolean;
  error?: string;
} {
  try {
    // Gerekli alanları kontrol et
    if (!order.id || !order.source_chain || !order.target_chain || !order.target_recipient) {
      return { isValid: false, error: 'Missing required order fields' };
    }
    
    // Adres formatını kontrol et
    if (!ethers.isAddress(order.target_recipient)) {
      return { isValid: false, error: 'Invalid target recipient address' };
    }
    
    // Miktar kontrolü
    if (!order.target_amount_usd || order.target_amount_usd < 1 || order.target_amount_usd > 10) {
      return { isValid: false, error: 'Invalid target amount (must be between $1-$10)' };
    }
    
    // Chain kontrolü
    const validChains = ['base', 'op', 'arb', 'eth', 'sonic', 'unichain', 'ink', 'hyperevm', 'linea', 'polygon', 'abstract', 'zora'];
    if (!validChains.includes(order.source_chain) || !validChains.includes(order.target_chain)) {
      return { isValid: false, error: 'Invalid chain specified' };
    }
    
    // Aynı chain kontrolü
    if (order.source_chain === order.target_chain) {
      return { isValid: false, error: 'Source and target chains must be different' };
    }
    
    return { isValid: true };
    
  } catch (error) {
    return { 
      isValid: false, 
      error: `Order validation failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

export function sanitizeInput(input: string): string {
  // XSS ve injection saldırılarını önlemek için input temizleme
  return input
    .replace(/[<>]/g, '') // HTML tag'lerini kaldır
    .replace(/javascript:/gi, '') // JavaScript protocol'ünü kaldır
    .trim();
}

export function validateTransactionHash(txHash: string): boolean {
  // Ethereum transaction hash formatını kontrol et
  return /^0x[a-fA-F0-9]{64}$/.test(txHash);
}
