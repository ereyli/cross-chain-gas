import { ethers } from 'ethers';
import { CONFIG, isLocalTestMode } from './test-config';
import type { ChainKey } from '../types';

export const CHAINS = {
  base: { id: 8453, scan: "https://basescan.org" },
  op:   { id: 10,   scan: "https://optimistic.etherscan.io" },
  arb:  { id: 42161, scan: "https://arbiscan.io" },
  eth:  { id: 1, scan: "https://etherscan.io" },
  sonic: { id: 146, scan: "https://explorer.soniclabs.com" },
  unichain: { id: 130, scan: "https://uniscan.xyz" },
  ink: { id: 57073, scan: "https://explorer.inkonchain.com" },
  hyperevm: { id: 998, scan: "https://explorer.hyperliquid.xyz" },
  linea: { id: 59144, scan: "https://lineascan.build" },
  polygon: { id: 137, scan: "https://polygonscan.com" },
  abstract: { id: 11124, scan: "https://explorer.abstract.xyz" },
  zora: { id: 7777777, scan: "https://explorer.zora.energy" }
} as const;

// Native USDC addresses
export const USDC = {
  base: "0x833589fcd6edb6e08f4c7c32d4f71b54bda02913",
  op:   "0x0b2c639c533813f4aa9d7837caf62653d097ff85",
  arb:  "0xaf88d065e77c8cc2239327c5edb3a432268e5831",
  eth:  "0xa0b86a33e6417b8e93fa4a138ed7bf6b9c1d7f2c",
  polygon: "0x2791bca1f2de4661ed88a30c99a7a9449aa84174",
  linea: "0x176211869ca2b568f2a7d4ee941e073a821ee1ff",
  // Other chains will be added as they support USDC natively
} as const;

// USDT addresses
export const USDT = {
  op:  "0x94b008aa00579c1307b0ef2c499ad98a8ce58e58",
  arb: "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9",
  eth: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  polygon: "0xc2132d05d31c914a87c6611c10748aeb04b58e8f",
  // Base USDT and other chains: keep disabled for now
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
  
  const chains: ChainKey[] = ['base', 'op', 'arb', 'eth', 'sonic', 'unichain', 'ink', 'hyperevm', 'linea', 'polygon', 'abstract', 'zora'];
  
  for (const chain of chains) {
    // Always use config as fallback, prioritize environment variables
    const httpUrl = process.env[`ALCHEMY_${chain.toUpperCase()}_HTTP`] || CONFIG.alchemy[chain].http;
    const wsUrl = process.env[`ALCHEMY_${chain.toUpperCase()}_WSS`] || CONFIG.alchemy[chain].wss;
    
    if (!httpUrl || !wsUrl) {
      throw new Error(`Missing Alchemy URLs for ${chain}`);
    }
    
    // Get or create HTTP provider
    if (!providerCache.has(httpUrl)) {
      // For non-Ethereum chains, don't pass network config to avoid ENS issues
      const ensSupported = chain === 'eth'; // Only Ethereum mainnet supports ENS
      const provider = ensSupported 
        ? new ethers.JsonRpcProvider(httpUrl, {
            chainId: CHAINS[chain].id,
            name: chain
          })
        : new ethers.JsonRpcProvider(httpUrl); // No network config for non-ETH chains
      providerCache.set(httpUrl, provider);
    }
    
    // Get or create WebSocket provider  
    if (!wsProviderCache.has(wsUrl)) {
      // For non-Ethereum chains, don't pass network config to avoid ENS issues
      const ensSupported = chain === 'eth'; // Only Ethereum mainnet supports ENS
      const wsProvider = ensSupported 
        ? new ethers.WebSocketProvider(wsUrl, {
            chainId: CHAINS[chain].id,
            name: chain
          })
        : new ethers.WebSocketProvider(wsUrl); // No network config for non-ETH chains
      wsProviderCache.set(wsUrl, wsProvider);
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
  
  // Check if it's a placeholder and throw more helpful error
  if (address.includes('YOUR_') && address.includes('_HERE')) {
    throw new Error(`PAYTO address for ${chainKey} is not configured. Please set PAYTO_${chainKey.toUpperCase()} environment variable with a valid wallet address.`);
  }
  
  return address;
}

export function getTokenAddress(asset: 'USDC' | 'USDT', chainKey: ChainKey): string {
  if (asset === 'USDC') {
    const address = USDC[chainKey as keyof typeof USDC];
    if (!address) {
      throw new Error(`USDC not supported on ${chainKey}`);
    }
    return address;
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
  const assets = ['ETH'];
  
  // Add USDC if supported on this chain
  if (chainKey in USDC) {
    assets.push('USDC');
  }
  
  // Add USDT if supported on this chain
  if (chainKey in USDT) {
    assets.push('USDT');
  }
  
  return assets;
}
