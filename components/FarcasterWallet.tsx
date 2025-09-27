'use client';

import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { isFarcasterEnvironment } from '../lib/farcaster';
import { useState } from 'react';

interface FarcasterWalletProps {
  onWalletConnected?: (address: string) => void;
  onError?: (error: string) => void;
}

export function FarcasterWallet({ onWalletConnected, onError }: FarcasterWalletProps) {
  const { isConnected, address } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const [isConnecting, setIsConnecting] = useState(false);

  // Sadece Farcaster ortamında render et
  if (!isFarcasterEnvironment()) {
    return null;
  }

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect({ connector: connectors[0] });
      if (address) {
        onWalletConnected?.(address);
      }
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnect();
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 backdrop-blur-lg border border-purple-500/30 rounded-xl p-4 max-w-md mx-auto">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <div>
              <div className="text-sm font-semibold text-purple-200">
                {formatAddress(address)}
              </div>
              <div className="text-xs text-gray-400">
                Farcaster Wallet Connected
              </div>
            </div>
          </div>
          <button
            onClick={handleDisconnect}
            className="px-3 py-1 text-xs font-medium text-purple-300 hover:text-purple-200 bg-purple-900/30 hover:bg-purple-800/40 rounded-lg transition-all"
          >
            Disconnect
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-center max-w-md mx-auto">
      <button
        onClick={handleConnect}
        disabled={isConnecting}
        className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isConnecting ? (
          <>
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline"></div>
            Connecting...
          </>
        ) : (
          <>
            <span className="mr-2">🔗</span>
            Connect Farcaster Wallet
          </>
        )}
      </button>
      <div className="mt-2 text-sm text-purple-300">
        🌟 Seamless wallet integration in Farcaster
      </div>
    </div>
  );
}
