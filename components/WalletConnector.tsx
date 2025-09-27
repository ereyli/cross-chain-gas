'use client';

import { useState, useEffect, useCallback } from 'react';
import { WALLET_PROVIDERS, getAvailableWallets, connectWallet, checkWalletConnection } from '../lib/wallets';
import { isFarcasterEnvironment, connectFarcasterWallet, getFarcasterWallet } from '../lib/farcaster';

interface WalletConnectorProps {
  onWalletConnected?: (address: string, provider: string) => void;
  onError?: (error: string) => void;
  className?: string;
}

export function WalletConnector({ 
  onWalletConnected, 
  onError, 
  className = '' 
}: WalletConnectorProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [walletProvider, setWalletProvider] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);

  const checkConnection = useCallback(async () => {
    if (isFarcasterEnvironment()) {
      // Farcaster ortamında Farcaster wallet'ı kontrol et
      try {
        const farcasterWallet = await getFarcasterWallet();
        if (farcasterWallet && farcasterWallet.address) {
          setWalletAddress(farcasterWallet.address);
          setWalletProvider('Farcaster Wallet');
          setIsConnected(true);
          onWalletConnected?.(farcasterWallet.address, 'Farcaster Wallet');
        }
      } catch (error) {
        console.error('Error checking Farcaster wallet:', error);
      }
    } else {
      // Web ortamında mevcut wallet'ları kontrol et
      try {
        const { address, provider } = await checkWalletConnection();
        if (address) {
          setWalletAddress(address);
          setWalletProvider(provider);
          setIsConnected(true);
          onWalletConnected?.(address, provider || 'Unknown');
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, [onWalletConnected]);

  useEffect(() => {
    checkConnection();
    
    // Mevcut wallet'ları güncelle
    const wallets = getAvailableWallets();
    setAvailableWallets(wallets);
  }, [checkConnection]);

  const handleConnect = async (providerId?: string) => {
    setIsConnecting(true);
    
    try {
      let address: string | null = null;
      let provider = '';

      if (isFarcasterEnvironment()) {
        // Farcaster ortamında Farcaster wallet'ı kullan
        const farcasterWallet = await connectFarcasterWallet();
        if (farcasterWallet && farcasterWallet.address) {
          address = farcasterWallet.address;
          provider = 'Farcaster Wallet';
        }
      } else {
        // Web ortamında seçilen wallet'ı kullan
        address = await connectWallet(providerId);
        const selectedProvider = WALLET_PROVIDERS.find(p => p.id === providerId);
        provider = selectedProvider?.name || 'Unknown Wallet';
      }

      if (address) {
        setWalletAddress(address);
        setWalletProvider(provider);
        setIsConnected(true);
        onWalletConnected?.(address, provider);
      } else {
        onError?.('Failed to connect wallet');
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
      onError?.(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isConnected && walletAddress) {
    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <div className="flex items-center space-x-2 px-3 py-2 bg-gradient-to-r from-green-900/30 to-emerald-900/30 border border-green-500/30 rounded-lg">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <div className="flex items-center space-x-1">
            <span className="text-sm text-green-200 font-medium">
              {formatAddress(walletAddress)}
            </span>
            <span className="text-xs text-green-300 bg-green-800/30 px-1.5 py-0.5 rounded">
              {walletProvider}
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (isFarcasterEnvironment()) {
    // Farcaster ortamında sadece Farcaster wallet butonu göster
    return (
      <div className={`text-center ${className}`}>
        <button
          onClick={() => handleConnect()}
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
          🌟 Use your Farcaster wallet for seamless transactions
        </div>
      </div>
    );
  }

  // Web ortamında mevcut wallet seçeneklerini göster
  return (
    <div className={`space-y-3 ${className}`}>
      {availableWallets.length > 0 ? (
        <div className="grid grid-cols-1 gap-2">
          {availableWallets.map((wallet) => (
            <button
              key={wallet.id}
              onClick={() => handleConnect(wallet.id)}
              disabled={isConnecting}
              className="flex items-center justify-center space-x-3 p-3 bg-gradient-to-r from-gray-800 to-gray-700 border border-gray-600 rounded-lg hover:from-gray-700 hover:to-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="text-xl">{wallet.icon}</span>
              <span className="text-white font-medium">{wallet.name}</span>
              {isConnecting && (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center space-y-3">
          <div className="text-gray-400 mb-4">
            No wallets detected. Install a supported wallet to continue.
          </div>
          <div className="grid grid-cols-2 gap-2">
            {WALLET_PROVIDERS.slice(0, 4).map((wallet) => (
              <a
                key={wallet.id}
                href={wallet.downloadUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center space-x-2 p-2 bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 rounded-lg hover:from-blue-800/40 hover:to-purple-800/40 transition-all"
              >
                <span className="text-lg">{wallet.icon}</span>
                <span className="text-blue-200 text-sm font-medium">{wallet.name}</span>
                <svg className="w-3 h-3 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
