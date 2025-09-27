'use client';

import { useState, useEffect, useCallback } from 'react';
import { getFarcasterWallet, connectFarcasterWallet, isFarcasterEnvironment } from '../lib/farcaster';

interface FarcasterWalletButtonProps {
  onWalletConnected?: (address: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function FarcasterWalletButton({ 
  onWalletConnected, 
  onError, 
  className = '' 
}: FarcasterWalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);

  const checkWalletConnection = useCallback(async () => {
    if (!isFarcasterEnvironment()) return;

    try {
      const wallet = await getFarcasterWallet();
      if (wallet && wallet.address) {
        setWalletAddress(wallet.address);
        setIsConnected(true);
        onWalletConnected?.(wallet.address);
      }
    } catch (error) {
      console.error('Error checking Farcaster wallet:', error);
    }
  }, [onWalletConnected]);

  useEffect(() => {
    checkWalletConnection();
  }, [checkWalletConnection]);

  const handleConnect = async () => {
    if (!isFarcasterEnvironment()) {
      onError?.('Farcaster environment not detected');
      return;
    }

    setIsConnecting(true);
    try {
      const result = await connectFarcasterWallet();
      if (result && result.address) {
        setWalletAddress(result.address);
        setIsConnected(true);
        onWalletConnected?.(result.address);
      } else {
        onError?.('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Error connecting Farcaster wallet:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (!isFarcasterEnvironment()) {
    return null; // Don't render in non-Farcaster environments
  }

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {isConnected && walletAddress ? (
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="text-sm text-green-200 font-medium">
            {formatAddress(walletAddress)}
          </span>
        </div>
      ) : (
        <button
          onClick={handleConnect}
          disabled={isConnecting}
          className={`px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          {isConnecting ? (
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Connecting...</span>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <span>🔗</span>
              <span>Connect Farcaster Wallet</span>
            </div>
          )}
        </button>
      )}
    </div>
  );
}
