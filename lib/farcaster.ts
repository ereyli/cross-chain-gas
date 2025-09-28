import { sdk } from '@farcaster/miniapp-sdk';
import { useEffect, useState } from 'react';

export interface FarcasterUser {
  fid: number;
  username: string;
  displayName: string;
  pfpUrl: string;
  bio: string;
  followers: number;
  following: number;
}

export interface FarcasterContext {
  user: FarcasterUser | null;
  isLoading: boolean;
  isReady: boolean;
  error: string | null;
}

export const useFarcaster = (): FarcasterContext => {
  const [user, setUser] = useState<FarcasterUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeFarcaster = async () => {
      try {
        // Check if we're running in Farcaster environment
        if (typeof window !== 'undefined' && window.farcaster) {
          // Initialize the SDK
          await sdk.actions.ready();
          setIsReady(true);

          // Get user context if available
          try {
            const context = await sdk.context;
            if (context && context.user) {
              setUser({
                fid: context.user.fid,
                username: context.user.username || '',
                displayName: context.user.displayName || '',
                pfpUrl: context.user.pfpUrl || '',
                bio: '',
                followers: 0,
                following: 0,
              });
            }
          } catch (contextError) {
            console.warn('Could not get Farcaster context:', contextError);
          }
        } else {
          // Not in Farcaster environment, still mark as ready
          setIsReady(true);
        }
      } catch (err) {
        console.error('Farcaster SDK initialization error:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize Farcaster SDK');
        setIsReady(true); // Still mark as ready to not block the app
      } finally {
        setIsLoading(false);
      }
    };

    initializeFarcaster();
  }, []);

  return { user, isLoading, isReady, error };
};

// Utility function to check if running in Farcaster
export const isFarcasterEnvironment = (): boolean => {
  return typeof window !== 'undefined' && (
    !!window.farcaster || 
    !!window.location?.href?.includes('farcaster') ||
    !!window.navigator?.userAgent?.includes('Farcaster') ||
    !!document.referrer?.includes('farcaster')
  );
};

// Utility function to get Farcaster wallet
export const getFarcasterWallet = async () => {
  try {
    if (isFarcasterEnvironment()) {
      // Use the ethProvider for wallet operations
      const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_accounts' });
      if (accounts && accounts.length > 0) {
        return {
          address: accounts[0],
          chainId: 1, // Default to Ethereum mainnet
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting Farcaster wallet:', error);
    return null;
  }
};

// Utility function to request wallet connection
export const connectFarcasterWallet = async () => {
  try {
    if (isFarcasterEnvironment()) {
      const accounts = await sdk.wallet.ethProvider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        return {
          address: accounts[0],
          chainId: 1, // Default to Ethereum mainnet
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Error connecting Farcaster wallet:', error);
    throw error;
  }
};

// Utility function to switch chain in Farcaster
export const switchFarcasterChain = async (chainId: number): Promise<void> => {
  try {
    if (isFarcasterEnvironment()) {
      console.log(`Attempting to switch to chain ${chainId} in Farcaster`);
      
      // Try multiple chain switching methods
      try {
        // Method 1: Standard wallet_switchEthereumChain
        await sdk.wallet.ethProvider.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: `0x${chainId.toString(16)}` }],
        });
        console.log('Chain switched successfully with wallet_switchEthereumChain');
      } catch (switchError) {
        console.log('wallet_switchEthereumChain failed, trying wallet_addEthereumChain');
        
        // Method 2: Add chain if it doesn't exist
        const chainConfig = getChainConfig(chainId);
        if (chainConfig) {
          await sdk.wallet.ethProvider.request({
            method: 'wallet_addEthereumChain',
            params: [chainConfig],
          });
          console.log('Chain added successfully');
        } else {
          throw new Error(`Chain configuration not found for chainId: ${chainId}`);
        }
      }
      
      // Wait for chain switch to complete
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Verify chain switch
      const currentChainId = await sdk.wallet.ethProvider.request({
        method: 'eth_chainId',
      });
      const currentChainIdNumber = parseInt(currentChainId, 16);
      
      if (currentChainIdNumber !== chainId) {
        console.warn(`Chain switch verification failed. Expected: ${chainId}, Got: ${currentChainIdNumber}`);
        throw new Error(`Failed to switch to chain ${chainId}. Current chain: ${currentChainIdNumber}`);
      }
      
      console.log(`Successfully switched to chain ${chainId}`);
    } else {
      throw new Error('Not in Farcaster environment');
    }
  } catch (error) {
    console.error('Farcaster chain switch error:', error);
    throw error;
  }
};

// Helper function to get chain configuration
const getChainConfig = (chainId: number) => {
  const chainConfigs = {
    1: {
      chainId: '0x1',
      chainName: 'Ethereum Mainnet',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://eth.llamarpc.com'],
      blockExplorerUrls: ['https://etherscan.io']
    },
    8453: {
      chainId: '0x2105',
      chainName: 'Base',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.base.org'],
      blockExplorerUrls: ['https://basescan.org']
    },
    42161: {
      chainId: '0xa4b1',
      chainName: 'Arbitrum One',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://arb1.arbitrum.io/rpc'],
      blockExplorerUrls: ['https://arbiscan.io']
    },
    10: {
      chainId: '0xa',
      chainName: 'Optimism',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://mainnet.optimism.io'],
      blockExplorerUrls: ['https://optimistic.etherscan.io']
    },
    137: {
      chainId: '0x89',
      chainName: 'Polygon',
      nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
      rpcUrls: ['https://polygon-rpc.com'],
      blockExplorerUrls: ['https://polygonscan.com']
    },
    59144: {
      chainId: '0xe708',
      chainName: 'Linea',
      nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
      rpcUrls: ['https://rpc.linea.build'],
      blockExplorerUrls: ['https://lineascan.build']
    }
  };
  
  return chainConfigs[chainId as keyof typeof chainConfigs];
};

// Extend Window interface for Farcaster
declare global {
  interface Window {
    farcaster?: any;
  }
}
