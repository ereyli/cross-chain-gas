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
  return typeof window !== 'undefined' && !!window.farcaster;
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
      // Farcaster SDK ile chain switch
      await sdk.wallet.ethProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }],
      });
    } else {
      throw new Error('Not in Farcaster environment');
    }
  } catch (error) {
    console.error('Farcaster chain switch error:', error);
    throw error;
  }
};

// Extend Window interface for Farcaster
declare global {
  interface Window {
    farcaster?: any;
  }
}
