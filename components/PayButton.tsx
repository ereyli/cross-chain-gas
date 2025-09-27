'use client';

import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
import { ChainLogo } from './ChainLogo';
import { isFarcasterEnvironment } from '../lib/farcaster';
import { connectWallet, checkWalletConnection as checkWalletConnectionLib, getPreferredWallet } from '../lib/wallets';
import { useAccount, useConnect, useSendTransaction } from 'wagmi';
import type { QuoteResponse, StatusResponse } from '../types';

interface PayButtonProps {
  quote: QuoteResponse;
  onPaymentSent: (txHash: string) => void;
  onError: (error: string) => void;
}

export function PayButton({ quote, onPaymentSent, onError }: PayButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [walletProvider, setWalletProvider] = useState<string>('');
  
  // Wagmi hooks - sadece Farcaster ortamında kullanılır
  const { isConnected, address: wagmiAddress, connector } = useAccount();
  const { connect } = useConnect();
  const { sendTransaction } = useSendTransaction();

  const checkWalletConnection = useCallback(async () => {
    if (isFarcasterEnvironment()) {
      // Farcaster ortamında Wagmi hooks kullan
      if (isConnected && wagmiAddress) {
        setAccount(wagmiAddress);
        setWalletProvider('Farcaster Wallet');
        // Chain ID'yi Wagmi'dan al
        if (connector) {
          // Connector'dan chain ID al
        }
      }
    } else {
      // Web ortamında mevcut wallet'ları kontrol et
      try {
        const { address, provider } = await checkWalletConnectionLib();
        if (address) {
          setAccount(address);
          setWalletProvider(provider || 'Unknown Wallet');
          
          // Chain ID'yi al
          if (typeof window.ethereum !== 'undefined') {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const network = await provider.getNetwork();
            setChainId(Number(network.chainId));
          }
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  }, [isConnected, wagmiAddress, connector]);

  useEffect(() => {
    checkWalletConnection();
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = quote.expiresAt - now;
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(timer);
  }, [quote.expiresAt, checkWalletConnection]);

  // Farcaster wallet kontrolü artık Wagmi hooks ile yapılıyor

  const handleConnectWallet = async () => {
    setIsConnecting(true);
    
    try {
      let address: string | null = null;
      let provider = '';

      if (isFarcasterEnvironment()) {
        // Farcaster ortamında Wagmi connect kullan
        if (connector) {
          await connect({ connector });
          setWalletProvider('Farcaster Wallet');
        }
      } else {
        // Web ortamında öncelikli wallet'ı kullan
        address = await connectWallet();
        const preferredWallet = getPreferredWallet();
        provider = preferredWallet?.name || 'Unknown Wallet';
        
        if (address) {
          setAccount(address);
          setWalletProvider(provider);
          
          // Chain ID'yi al
          if (typeof window.ethereum !== 'undefined') {
            const ethersProvider = new ethers.BrowserProvider(window.ethereum);
            const network = await ethersProvider.getNetwork();
            setChainId(Number(network.chainId));
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const switchNetwork = async (targetChainId: number) => {
    if (typeof window.ethereum === 'undefined') return;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      });
      setChainId(targetChainId);
    } catch (error: any) {
      if (error.code === 4902) {
        onError('Please add this network to your wallet manually');
      } else {
        onError('Failed to switch network');
      }
    }
  };

  const sendPayment = async () => {
    if (!account) {
      onError('Wallet not connected');
      return;
    }

    if (timeLeft <= 0) {
      onError('Quote has expired. Please generate a new quote.');
      return;
    }

    setIsPaying(true);
    try {
      let tx;

      if (isFarcasterEnvironment() && isConnected) {
        // Use Wagmi sendTransaction for Farcaster wallet
        const result = await sendTransaction({
          to: quote.txTemplate.to as `0x${string}`,
          value: quote.txTemplate.value ? BigInt(quote.txTemplate.value) : BigInt(0),
          data: quote.txTemplate.data as `0x${string}`,
        });
        tx = result;
      } else if (typeof window.ethereum !== 'undefined') {
        // Use standard wallet
        const sourceChain = quote.sourceChain;
        const ensSupported = sourceChain === 'eth';
        
        let provider;
        try {
          provider = ensSupported 
            ? new ethers.BrowserProvider(window.ethereum, {
                chainId: CHAINS[sourceChain].id,
                name: sourceChain
              })
            : new ethers.BrowserProvider(window.ethereum);
        } catch (error) {
          console.warn('Failed to create provider with network config, using fallback:', error);
          provider = new ethers.BrowserProvider(window.ethereum);
        }
        
        const signer = await provider.getSigner();

        if (quote.txTemplate.kind === 'ETH') {
          tx = await signer.sendTransaction({
            to: quote.txTemplate.to,
            value: quote.txTemplate.value!,
          });
        } else {
          tx = await signer.sendTransaction({
            to: quote.txTemplate.to,
            data: quote.txTemplate.data!,
          });
        }
      } else {
        throw new Error('No wallet available');
      }

      onPaymentSent(typeof tx === 'string' ? tx : (tx as any)?.hash || tx);
    } catch (error: any) {
      if (error.code === 4001) {
        onError('Transaction rejected by user');
      } else {
        onError('Transaction failed: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setIsPaying(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get source chain ID from quote
  const sourceChainId = CHAINS[quote.sourceChain].id;

  if (!account) {
    return (
      <div className="text-center">
        <button
          onClick={handleConnectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline"></div>
              Connecting...
            </>
          ) : (
            <>
              {isFarcasterEnvironment() ? (
                <>
                  <span className="mr-2">🔗</span>
                  Connect Farcaster Wallet
                </>
              ) : (
                <>
                  <span className="mr-2">🌈</span>
                  Connect Wallet (Rainbow/MetaMask)
                </>
              )}
            </>
          )}
        </button>
        <div className="mt-2 text-sm text-gray-300">
          {isFarcasterEnvironment() ? (
            <>🌟 Use your Farcaster wallet for seamless transactions</>
          ) : (
            <>🌈 Supports Rainbow, MetaMask, Coinbase Wallet and more</>
          )}
        </div>
      </div>
    );
  }

  if (chainId !== sourceChainId) {
    return (
      <div className="text-center">
        <button
          onClick={() => switchNetwork(sourceChainId!)}
          className="bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:from-yellow-700 hover:to-orange-700 transition-all flex items-center mx-auto"
        >
          <ChainLogo chain={quote.sourceChain} size={16} className="mr-2" />
          Switch to {quote.sourceChain.toUpperCase()}
        </button>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="text-center">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
          <div className="text-red-300 font-semibold mb-2">Quote Expired</div>
          <div className="text-gray-400 text-sm mb-3">Please generate a new quote to continue</div>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
          >
            New Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Timer */}
      <div className="text-center">
        <div className="text-sm text-gray-400 mb-1">Quote expires in</div>
        <div className="text-2xl font-bold text-red-400">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-1 w-full bg-gray-700 rounded-full h-1.5">
          <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 h-1.5 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(0, (timeLeft / 900) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Payment Button */}
      <div className="text-center">
        <button
          onClick={sendPayment}
          disabled={isPaying || timeLeft <= 0}
          className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 px-6 rounded-lg text-base font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isPaying ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline"></div>
              Sending...
            </>
          ) : (
            `Send ${quote.txTemplate.kind}`
          )}
        </button>
      </div>
    </div>
  );
}
