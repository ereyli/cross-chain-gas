'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
import { ChainLogo } from './ChainLogo';
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

  useEffect(() => {
    checkWalletConnection();
    
    const timer = setInterval(() => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = quote.expiresAt - now;
      setTimeLeft(Math.max(0, remaining));
    }, 1000);

    return () => clearInterval(timer);
  }, [quote.expiresAt]);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
          setAccount(accounts[0].address);
          const network = await provider.getNetwork();
          setChainId(Number(network.chainId));
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum === 'undefined') {
      onError('Please install MetaMask or another Ethereum wallet');
      return;
    }

    setIsConnecting(true);
    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();
      
      setAccount(address);
      setChainId(Number(network.chainId));
    } catch (error) {
      onError('Failed to connect wallet');
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
    if (!account || typeof window.ethereum === 'undefined') {
      onError('Wallet not connected');
      return;
    }

    if (timeLeft <= 0) {
      onError('Quote has expired. Please generate a new quote.');
      return;
    }

    setIsPaying(true);
    try {
      // Disable ENS for non-Ethereum chains
      const sourceChain = quote.sourceChain;
      const ensSupported = sourceChain === 'eth'; // Only Ethereum mainnet supports ENS
      
      // For non-Ethereum chains, don't pass network config to avoid ENS issues
      let provider;
      try {
        provider = ensSupported 
          ? new ethers.BrowserProvider(window.ethereum, {
              chainId: CHAINS[sourceChain].id,
              name: sourceChain
            })
          : new ethers.BrowserProvider(window.ethereum); // No network config for non-ETH chains
      } catch (error) {
        // Fallback: create provider without any network config
        console.warn('Failed to create provider with network config, using fallback:', error);
        provider = new ethers.BrowserProvider(window.ethereum);
      }
      
      const signer = await provider.getSigner();

      let tx;
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

      onPaymentSent(tx.hash);
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
          onClick={connectWallet}
          disabled={isConnecting}
          className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-lg text-base font-semibold hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isConnecting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2 inline"></div>
              Connecting...
            </>
          ) : (
            'Connect Wallet'
          )}
        </button>
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="text-red-600 font-semibold mb-2">Quote Expired</div>
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
        <div className="text-sm text-gray-600 mb-1">Quote expires in</div>
        <div className="text-2xl font-bold text-red-600">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
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
