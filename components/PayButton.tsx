'use client';

import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
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
      const provider = new ethers.BrowserProvider(window.ethereum);
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
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isConnecting ? 'Connecting...' : 'Connect Wallet'}
      </button>
    );
  }

  if (chainId !== sourceChainId) {
    return (
      <button
        onClick={() => switchNetwork(sourceChainId!)}
        className="w-full bg-yellow-600 text-white py-3 px-4 rounded-md hover:bg-yellow-700 transition-colors"
      >
        Switch to {quote.sourceChain.toUpperCase()}
      </button>
    );
  }

  if (timeLeft <= 0) {
    return (
      <div className="text-center text-red-600 font-medium">
        Quote expired. Please generate a new quote.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Important Instructions */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h4 className="font-medium text-green-900 mb-2">✅ Ready to Send Payment</h4>
        <div className="text-sm text-green-800 space-y-1">
          <p>• Make sure you're on <strong>{quote.sourceChain.toUpperCase()}</strong> network</p>
          <p>• You'll send <strong>{quote.txTemplate.kind}</strong> to complete this transfer</p>
          <p>• After payment, ETH will be sent to <strong>{quote.targetChain.toUpperCase()}</strong> network</p>
          <p>• Keep this page open to monitor the transfer</p>
        </div>
      </div>

      <div className="text-center">
        <div className="text-sm text-gray-600">Quote expires in:</div>
        <div className="text-2xl font-bold text-red-600">{formatTime(timeLeft)}</div>
      </div>

      <button
        onClick={sendPayment}
        disabled={isPaying || timeLeft <= 0}
        className="w-full bg-green-600 text-white py-3 px-4 rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-lg font-semibold"
      >
        {isPaying ? 'Sending Payment...' : `💰 Send Payment (${quote.txTemplate.kind})`}
      </button>
      
      <p className="text-xs text-gray-500 text-center">
        Click above to open your wallet and confirm the transaction
      </p>
    </div>
  );
}
