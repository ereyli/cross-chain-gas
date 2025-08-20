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
  const [manualAmount, setManualAmount] = useState<string>('5');
  const [useSlider, setUseSlider] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const supportedAssets = getSupportedAssets(sourceChain);

  useEffect(() => {
    // Reset asset if not supported on selected chain
    if (!supportedAssets.includes(sourceAsset)) {
      setSourceAsset('ETH');
    }
  }, [sourceChain, sourceAsset, supportedAssets]);

  // Sync manual input and slider
  const handleAmountChange = (value: number) => {
    setTargetAmountUsd(value);
    setManualAmount(value.toString());
  };

  const handleManualAmountChange = (value: string) => {
    setManualAmount(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 1 && numValue <= 10) {
      setTargetAmountUsd(numValue);
    }
  };

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
    <form onSubmit={handleSubmit} className="space-y-6 p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
      <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Get Started</h2>
      
      {/* Wallet Connection */}
      <div className="border-b pb-4">
        {!connectedAccount ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg">🔗</span>
              <span className="font-semibold">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </div>
          </button>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4">
            <div className="flex items-center">
              <div className="w-4 h-4 bg-green-500 rounded-full mr-3 animate-pulse"></div>
              <div>
                <p className="text-sm font-medium text-green-800">Wallet Connected</p>
                <p className="text-sm text-green-600 break-all">{connectedAccount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-700">
          Target Recipient Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="text"
            value={targetRecipient}
            onChange={(e) => setTargetRecipient(e.target.value)}
            placeholder="0x... (defaults to your connected wallet)"
            className="w-full pl-10 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm font-mono text-sm"
            required
          />
        </div>
        <p className="text-xs text-gray-500">ETH will be sent to this address on the target chain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Source Chain
          </label>
          <div className="relative">
            <select
              value={sourceChain}
              onChange={(e) => setSourceChain(e.target.value as ChainKey)}
              className="w-full p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm appearance-none cursor-pointer"
            >
              {Object.entries(CHAINS).map(([key, chain]) => (
                <option key={key} value={key}>
                  {key.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500">Where you have funds</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Source Asset
          </label>
          <div className="relative">
            <select
              value={sourceAsset}
              onChange={(e) => setSourceAsset(e.target.value as Asset)}
              className="w-full p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm appearance-none cursor-pointer"
            >
              {supportedAssets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500">What you want to pay with</p>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-semibold text-gray-700">
            Target Chain
          </label>
          <div className="relative">
            <select
              value={targetChain}
              onChange={(e) => setTargetChain(e.target.value as ChainKey)}
              className="w-full p-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm appearance-none cursor-pointer"
            >
              {Object.entries(CHAINS).map(([key, chain]) => (
                <option key={key} value={key} disabled={key === sourceChain}>
                  {key.toUpperCase()}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-500">Where you want ETH</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-semibold text-gray-700">
            Target Amount
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setUseSlider(true)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                useSlider 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Slider
            </button>
            <button
              type="button"
              onClick={() => setUseSlider(false)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                !useSlider 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
              }`}
            >
              Manual
            </button>
          </div>
        </div>

        {useSlider ? (
          <div className="space-y-3">
            <div className="relative">
              <input
                type="range"
                min="1"
                max="10"
                step="0.5"
                value={targetAmountUsd}
                onChange={(e) => handleAmountChange(parseFloat(e.target.value))}
                className="w-full h-3 bg-gradient-to-r from-blue-200 to-purple-200 rounded-lg appearance-none cursor-pointer slider"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #8b5cf6 ${((targetAmountUsd - 1) / 9) * 100}%, #e5e7eb ${((targetAmountUsd - 1) / 9) * 100}%, #e5e7eb 100%)`
                }}
              />
              <div className="flex justify-between text-sm text-gray-500 mt-2">
                <span>$1</span>
                <span className="font-semibold text-lg text-blue-600">${targetAmountUsd}</span>
                <span>$10</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 text-lg">$</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={manualAmount}
                onChange={(e) => handleManualAmountChange(e.target.value)}
                placeholder="5.0"
                className="w-full pl-8 pr-4 py-3 bg-white/70 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm text-lg font-semibold text-center"
              />
            </div>
            <p className="text-xs text-gray-500 text-center">Enter amount between $1 - $10</p>
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      {connectedAccount && (
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-lg border border-blue-200/50 rounded-2xl p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transaction Preview
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Route Info */}
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/30">
                <span className="text-sm font-medium text-gray-600">Route</span>
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium">
                    {sourceChain.toUpperCase()}
                  </span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-lg text-xs font-medium">
                    {targetChain.toUpperCase()}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/30">
                <span className="text-sm font-medium text-gray-600">Asset</span>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-semibold text-gray-800">{sourceAsset}</span>
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">ETH</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-white/60 rounded-xl border border-white/30">
                <span className="text-sm font-medium text-gray-600">Amount</span>
                <span className="text-sm font-bold text-green-600">${targetAmountUsd} worth</span>
              </div>
            </div>
            
            {/* Wallet Info */}
            <div className="space-y-3">
              <div className="p-3 bg-white/60 rounded-xl border border-white/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Your Wallet</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-green-600 font-medium">Connected</span>
                  </div>
                </div>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 rounded-lg p-2">
                  {connectedAccount.slice(0, 8)}...{connectedAccount.slice(-6)}
                </div>
              </div>
              
              <div className="p-3 bg-white/60 rounded-xl border border-white/30">
                <span className="text-sm font-medium text-gray-600 block mb-2">Target Recipient</span>
                <div className="font-mono text-xs text-gray-700 bg-gray-100 rounded-lg p-2">
                  {targetRecipient.slice(0, 8)}...{targetRecipient.slice(-6)}
                </div>
              </div>
              
              <div className="p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-center space-x-2">
                  <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-sm font-medium text-green-700">Ready to proceed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !connectedAccount}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg font-semibold text-lg"
      >
        {!connectedAccount ? '🔗 Connect Wallet First' : isLoading ? '⏳ Generating Quote...' : '✨ Generate Quote & Continue'}
      </button>
    </form>
  );
}
