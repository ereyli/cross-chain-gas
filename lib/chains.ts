import { ethers } from 'ethers';
import { CONFIG, isLocalTestMode } from './test-config';
import type { ChainKey } from '../types';

export const CHAINS = {
  base: { id: 8453, scan: "https://basescan.org" },
  op:   { id: 10,   scan: "https://optimistic.etherscan.io" },
  // arb:  { id: 42161, scan: "https://arbiscan.io" } // Temporarily disabled - Defender quota limit
} as const;

// Native USDC addresses
export const USDC = {
  base: "0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913",
  op:   "0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85",
  arb:  "0xAf88d065e77c8cC2239327C5EDb3A432268e5831",
} as const;

// USDT addresses
export const USDT = {
  op:  "0x94b008aa00579c1307B0EF2c499aD98a8ce58e58",
  arb: "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
  // Base USDT: keep disabled for MVP; add later if desired.
} as const;

// Minimal ERC20 ABI for transfer function
export const ERC20_ABI = [
  "function transfer(address to, uint256 amount) returns (bool)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

// Cache for providers to avoid recreating them
const providerCache = new Map<string, ethers.JsonRpcProvider>();
const wsProviderCache = new Map<string, ethers.WebSocketProvider>();

export function getProviders() {
  const providers: Record<ChainKey, { http: ethers.JsonRpcProvider; ws: ethers.WebSocketProvider }> = {} as any;
  
  const chains: ChainKey[] = ['base', 'op']; // 'arb' temporarily disabled
  
  for (const chain of chains) {
    // Always use config as fallback, prioritize environment variables
    const httpUrl = process.env[`ALCHEMY_${chain.toUpperCase()}_HTTP`] || CONFIG.alchemy[chain].http;
    const wsUrl = process.env[`ALCHEMY_${chain.toUpperCase()}_WSS`] || CONFIG.alchemy[chain].wss;
    
    if (!httpUrl || !wsUrl) {
      throw new Error(`Missing Alchemy URLs for ${chain}`);
    }
    
    // Get or create HTTP provider
    if (!providerCache.has(httpUrl)) {
      providerCache.set(httpUrl, new ethers.JsonRpcProvider(httpUrl));
    }
    
    // Get or create WebSocket provider  
    if (!wsProviderCache.has(wsUrl)) {
      wsProviderCache.set(wsUrl, new ethers.WebSocketProvider(wsUrl));
    }
    
    providers[chain] = {
      http: providerCache.get(httpUrl)!,
      ws: wsProviderCache.get(wsUrl)!
    };
  }
  
  return providers;
}

export function getPayTo(chainKey: ChainKey): string {
  // Always use config as fallback, prioritize environment variables
  const address = process.env[`PAYTO_${chainKey.toUpperCase()}`] || CONFIG.payToAddresses[chainKey];
  
  if (!address) {
    throw new Error(`Missing PAYTO address for ${chainKey}`);
  }
  
  return address;
}

export function getTokenAddress(asset: 'USDC' | 'USDT', chainKey: ChainKey): string {
  if (asset === 'USDC') {
    return USDC[chainKey];
  }
  
  if (asset === 'USDT') {
    const address = USDT[chainKey as keyof typeof USDT];
    if (!address) {
      throw new Error(`USDT not supported on ${chainKey}`);
    }
    return address;
  }
  
  throw new Error(`Unknown asset: ${asset}`);
}

export function encodeErc20Transfer(to: string, amount: bigint): string {
  const iface = new ethers.Interface(ERC20_ABI);
  return iface.encodeFunctionData("transfer", [to, amount]);
}

export function getChainById(chainId: number): ChainKey | null {
  for (const [key, config] of Object.entries(CHAINS)) {
    if (config.id === chainId) {
      return key as ChainKey;
    }
  }
  return null;
}

export function getSupportedAssets(chainKey: ChainKey): string[] {
  const assets = ['ETH', 'USDC'];
  
  // Add USDT if supported on this chain
  if (chainKey === 'op') {
    assets.push('USDT');
  }
  
  return assets;
}
