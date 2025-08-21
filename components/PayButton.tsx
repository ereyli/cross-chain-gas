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
      <div className="space-y-6">
        {/* Wallet Connection Instructions */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6">
          <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
            <span className="mr-2">🔗</span>
            Step 1: Connect Your Wallet
          </h4>
          <div className="space-y-2 text-sm text-blue-800 mb-4">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <span>Click "Connect Wallet" below</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <span>Approve the connection in your wallet</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
              <span>Make sure you're on the correct network</span>
            </div>
          </div>
          
          <button
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 px-6 rounded-2xl text-xl font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isConnecting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Connecting...
              </>
            ) : (
              <>
                <span className="mr-2">🔗</span>
                Connect Wallet
              </>
            )}
          </button>
        </div>
      </div>
    );
  }

  if (chainId !== sourceChainId) {
    return (
      <div className="space-y-6">
        {/* Network Switch Instructions */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6">
          <h4 className="font-semibold text-yellow-900 mb-3 flex items-center">
            <span className="mr-2">🔄</span>
            Step 1.5: Switch Network
          </h4>
          <div className="space-y-2 text-sm text-yellow-800 mb-4">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span>You need to switch to {quote.sourceChain.toUpperCase()} network</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span>Click the button below to switch automatically</span>
            </div>
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></span>
              <span>Or switch manually in your wallet</span>
            </div>
          </div>
          
          <button
            onClick={() => switchNetwork(sourceChainId!)}
            className="w-full bg-gradient-to-r from-yellow-600 to-orange-600 text-white py-4 px-6 rounded-2xl text-xl font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl flex items-center justify-center"
          >
            <ChainLogo chain={quote.sourceChain} size={24} className="mr-3" />
            Switch to {quote.sourceChain.toUpperCase()}
          </button>
        </div>
      </div>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="text-center">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl">⏰</span>
          </div>
          <h4 className="text-lg font-semibold text-red-900 mb-2">Quote Expired</h4>
          <p className="text-red-700 mb-4">
            This quote has expired. Please generate a new quote to continue.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Generate New Quote
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Payment Ready Indicator */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-br from-green-200 to-emerald-200 rounded-full opacity-30 -translate-y-10 translate-x-10"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-center mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center mr-3">
              <span className="text-white font-bold text-sm">✓</span>
            </div>
            <h4 className="text-lg font-bold text-green-900">Ready to Send Payment</h4>
          </div>
          
          <div className="text-center">
            <div className="text-2xl font-bold text-green-800 mb-2">
              {formatTokenAmount(BigInt(quote.exact.amountRaw), quote.sourceAsset)} {quote.sourceAsset}
            </div>
            <div className="text-sm text-green-700">
              on {quote.sourceChain.toUpperCase()} network
            </div>
          </div>
        </div>
      </div>

      {/* Timer */}
      <div className="text-center bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl p-6 border border-red-200">
        <div className="text-sm font-medium text-gray-700 mb-2">⏰ Quote expires in:</div>
        <div className="text-4xl font-bold text-transparent bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text">
          {formatTime(timeLeft)}
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-red-500 to-orange-500 h-2 rounded-full transition-all duration-1000"
            style={{ width: `${Math.max(0, (timeLeft / 900) * 100)}%` }}
          ></div>
        </div>
      </div>

      {/* Payment Instructions */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-2xl p-6">
        <h4 className="font-semibold text-blue-900 mb-3 flex items-center">
          <span className="mr-2">💡</span>
          What happens when you click "Send Payment":
        </h4>
        <div className="space-y-2 text-sm text-blue-800 mb-4">
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            <span>Your wallet will open with the transaction details</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            <span>Review the amount and gas fees carefully</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            <span>Click "Confirm" in your wallet to send the payment</span>
          </div>
          <div className="flex items-center">
            <span className="w-2 h-2 bg-blue-500 rounded-full mr-3"></span>
            <span>Wait for confirmation (1-2 minutes)</span>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={sendPayment}
        disabled={isPaying || timeLeft <= 0}
        className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-6 rounded-2xl text-xl font-bold transition-all transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div className="relative z-10 flex items-center justify-center">
          {isPaying ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
              Sending Payment...
            </>
          ) : (
            <>
              <span className="mr-2">💰</span>
              Send Payment ({quote.txTemplate.kind})
            </>
          )}
        </div>
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Make sure you have enough {quote.sourceAsset} in your wallet to cover the payment and gas fees
      </p>
    </div>
  );
}
