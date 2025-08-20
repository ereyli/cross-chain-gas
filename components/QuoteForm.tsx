'use client';

import { useState, useEffect } from 'react';
import { CHAINS, getSupportedAssets } from '../lib/chains';
import type { ChainKey, Asset, QuoteResponse } from '../types';

interface QuoteFormProps {
  onQuoteGenerated: (quote: QuoteResponse) => void;
  onError: (error: string) => void;
}

export function QuoteForm({ onQuoteGenerated, onError }: QuoteFormProps) {
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [sourceChain, setSourceChain] = useState<ChainKey>('base');
  const [sourceAsset, setSourceAsset] = useState<Asset>('ETH');
  const [targetChain, setTargetChain] = useState<ChainKey>('op');
  const [targetRecipient, setTargetRecipient] = useState('');
  const [targetAmountUsd, setTargetAmountUsd] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const supportedAssets = getSupportedAssets(sourceChain);

  useEffect(() => {
    // Reset asset if not supported on selected chain
    if (!supportedAssets.includes(sourceAsset)) {
      setSourceAsset('ETH');
    }
  }, [sourceChain, sourceAsset, supportedAssets]);

  useEffect(() => {
    checkWalletConnection();
  }, []);

  const checkWalletConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setConnectedAccount(accounts[0]);
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
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts.length > 0) {
        setConnectedAccount(accounts[0]);
        setTargetRecipient(accounts[0]); // Default target to same address
      }
    } catch (error) {
      onError('Failed to connect wallet');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connectedAccount) {
      onError('Please connect your wallet first');
      return;
    }
    
    if (!targetRecipient) {
      onError('Please enter target recipient address');
      return;
    }

    if (sourceChain === targetChain) {
      onError('Source and target chains must be different');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch('/api/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          payer: connectedAccount,
          sourceChain,
          sourceAsset,
          targetChain,
          targetRecipient,
          targetAmountUsd,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate quote');
      }

      onQuoteGenerated(data);
    } catch (error) {
      onError(error instanceof Error ? error.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-gray-900">Cross-Chain Gas Top-Up</h2>
      
      {/* Wallet Connection */}
      <div className="border-b pb-4">
        {!connectedAccount ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </button>
        ) : (
          <div className="bg-green-50 border border-green-200 rounded-md p-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                <p className="text-sm text-green-600 break-all">{connectedAccount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Recipient Address
        </label>
        <input
          type="text"
          value={targetRecipient}
          onChange={(e) => setTargetRecipient(e.target.value)}
          placeholder="0x... (defaults to your connected wallet)"
          className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Chain
          </label>
          <select
            value={sourceChain}
            onChange={(e) => setSourceChain(e.target.value as ChainKey)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(CHAINS).map(([key, chain]) => (
              <option key={key} value={key}>
                {key.toUpperCase()} ({chain.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Source Asset
          </label>
          <select
            value={sourceAsset}
            onChange={(e) => setSourceAsset(e.target.value as Asset)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {supportedAssets.map((asset) => (
              <option key={asset} value={asset}>
                {asset}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Target Chain
          </label>
          <select
            value={targetChain}
            onChange={(e) => setTargetChain(e.target.value as ChainKey)}
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {Object.entries(CHAINS).map(([key, chain]) => (
              <option key={key} value={key}>
                {key.toUpperCase()} ({chain.id})
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Target Amount: ${targetAmountUsd}
        </label>
        <input
          type="range"
          min="1"
          max="10"
          step="0.5"
          value={targetAmountUsd}
          onChange={(e) => setTargetAmountUsd(parseFloat(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
        />
        <div className="flex justify-between text-sm text-gray-500 mt-1">
          <span>$1</span>
          <span>$10</span>
        </div>
      </div>

      {/* Transaction Summary */}
      {connectedAccount && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <h4 className="font-medium text-yellow-900 mb-2">📋 Transaction Summary:</h4>
          <div className="text-sm text-yellow-800 space-y-1">
            <p>• <strong>From:</strong> {sourceChain.toUpperCase()} Chain → <strong>To:</strong> {targetChain.toUpperCase()} Chain</p>
            <p>• <strong>Asset:</strong> {sourceAsset} → ETH</p>
            <p>• <strong>Target Amount:</strong> ${targetAmountUsd} worth of ETH</p>
            <p>• <strong>Your Wallet:</strong> {connectedAccount.slice(0, 6)}...{connectedAccount.slice(-4)}</p>
            <p>• <strong>Target Recipient:</strong> {targetRecipient.slice(0, 6)}...{targetRecipient.slice(-4)}</p>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !connectedAccount}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {!connectedAccount ? 'Connect Wallet First' : isLoading ? 'Generating Quote...' : 'Generate Quote & Continue'}
      </button>
    </form>
  );
}
