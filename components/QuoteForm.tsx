'use client';

import { useState, useEffect } from 'react';
import { CHAINS, getSupportedAssets } from '../lib/chains';
import { ChainLogo } from './ChainLogo';
import { CustomSelect } from './CustomSelect';
import type { ChainKey, Asset, QuoteResponse } from '../types';
 
// All chains are now supported with webhook endpoints
const SUPPORTED_CHAINS: ChainKey[] = ['base', 'op', 'arb', 'eth', 'sonic', 'unichain', 'ink', 'hyperevm', 'linea', 'polygon', 'abstract', 'zora'];

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

  useEffect(() => {
    // Ensure only supported chains are selected
    if (!SUPPORTED_CHAINS.includes(sourceChain)) {
      setSourceChain('base');
    }
    if (!SUPPORTED_CHAINS.includes(targetChain)) {
      setTargetChain('op');
    }
  }, [sourceChain, targetChain]);

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

  const handleSourceChainChange = (value: string) => {
    const chainKey = value as ChainKey;
    if (SUPPORTED_CHAINS.includes(chainKey)) {
      setSourceChain(chainKey);
    }
  };

  const handleTargetChainChange = (value: string) => {
    const chainKey = value as ChainKey;
    if (SUPPORTED_CHAINS.includes(chainKey)) {
      setTargetChain(chainKey);
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
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">Get Started</h2>
      
      {/* Wallet Connection */}
      <div className="border-b pb-3">
        {!connectedAccount ? (
          <button
            type="button"
            onClick={connectWallet}
            disabled={isConnecting}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="text-base">🔗</span>
              <span className="font-semibold text-sm">{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </div>
          </button>
        ) : (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              <div>
                <p className="text-xs font-medium text-green-800">Wallet Connected</p>
                <p className="text-xs text-green-600 break-all">{connectedAccount}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-gray-200">
          Target Recipient Address
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <input
            type="text"
            value={targetRecipient}
            onChange={(e) => setTargetRecipient(e.target.value)}
            placeholder="Enter the wallet address you want to send to"
            className="w-full pl-9 pr-3 py-2 bg-gray-700/70 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm font-mono text-sm text-gray-100"
            required
          />
        </div>
        <p className="text-xs text-gray-400">ETH will be sent to this address on the target chain</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-200">
            Source Chain
          </label>
          <CustomSelect
            value={sourceChain}
            onChange={handleSourceChainChange}
            options={SUPPORTED_CHAINS.map((key) => ({
              value: key,
              label: key.toUpperCase()
            }))}
            placeholder="Select source chain"
          />
          <p className="text-xs text-gray-400">Where you have funds</p>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-200">
            Source Asset
          </label>
          <div className="relative">
            <select
              value={sourceAsset}
              onChange={(e) => setSourceAsset(e.target.value as Asset)}
              className="w-full p-2 bg-white/70 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm appearance-none cursor-pointer text-sm"
            >
              {supportedAssets.map((asset) => (
                <option key={asset} value={asset}>
                  {asset}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
          <p className="text-xs text-gray-400">What you want to pay with</p>
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-semibold text-gray-200">
            Target Chain
          </label>
          <CustomSelect
            value={targetChain}
            onChange={handleTargetChainChange}
            options={SUPPORTED_CHAINS.map((key) => ({
              value: key,
              label: key.toUpperCase(),
              disabled: key === sourceChain
            }))}
            placeholder="Select target chain"
          />
          <p className="text-xs text-gray-400">Where you want ETH</p>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-xs font-semibold text-gray-200">
            Target Amount
          </label>
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setUseSlider(true)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                useSlider 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
              }`}
            >
              Slider
            </button>
            <button
              type="button"
              onClick={() => setUseSlider(false)}
              className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                !useSlider 
                  ? 'bg-blue-100 text-blue-700 border border-blue-200' 
                  : 'bg-gray-700 text-gray-300 border border-gray-600 hover:bg-gray-600'
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
              <div className="flex justify-between text-sm text-gray-400 mt-2">
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
                <span className="text-gray-400 text-lg">$</span>
              </div>
              <input
                type="number"
                min="1"
                max="10"
                step="0.5"
                value={manualAmount}
                onChange={(e) => handleManualAmountChange(e.target.value)}
                placeholder="5.0"
                className="w-full pl-8 pr-4 py-3 bg-gray-700/70 border border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all backdrop-blur-sm text-lg font-semibold text-center text-gray-100"
              />
            </div>
            <p className="text-xs text-gray-400 text-center">Enter amount between $1 - $10</p>
          </div>
        )}
      </div>

      {/* Transaction Summary */}
      {connectedAccount && (
        <div className="bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-lg border border-blue-200/50 rounded-lg p-4 mb-4">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mr-2">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h4 className="text-base font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Transaction Preview
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Route Info */}
            <div className="flex items-center justify-between p-2 bg-gray-700/60 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-300">Route</span>
              <div className="flex items-center space-x-1">
                <span className="px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                  {sourceChain.toUpperCase()}
                </span>
                <svg className="w-3 h-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
                <span className="px-1 py-0.5 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                  {targetChain.toUpperCase()}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-700/60 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-300">Amount</span>
              <span className="text-xs font-bold text-green-600">${targetAmountUsd}</span>
            </div>
            
            <div className="flex items-center justify-between p-2 bg-gray-700/60 rounded-lg border border-gray-600/30">
              <span className="text-xs font-medium text-gray-300">Status</span>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-green-600 font-medium">Ready</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !connectedAccount}
        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] shadow-lg font-semibold text-sm"
      >
        {!connectedAccount ? '🔗 Connect Wallet First' : isLoading ? '⏳ Generating Quote...' : '✨ Generate Quote & Continue'}
      </button>
    </form>
  );
}
