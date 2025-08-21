'use client';

import { useState, useEffect } from 'react';
import { QuoteForm } from '../components/QuoteForm';
import { PayButton } from '../components/PayButton';
import { StatusTracker } from '../components/StatusTracker';
import { TransactionHistory } from '../components/TransactionHistory';
import { ChainLogo } from '../components/ChainLogo';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
import type { QuoteResponse } from '../types';

export default function Home() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<'quote' | 'payment' | 'tracking' | 'completed'>('quote');

  // Check for connected wallet on page load
  useEffect(() => {
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

    checkWalletConnection();

    // Listen for account changes
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts: string[]) => {
        setConnectedAccount(accounts.length > 0 ? accounts[0] : null);
      };

      const ethereum = window.ethereum as any;
      if (ethereum.on) {
        ethereum.on('accountsChanged', handleAccountsChanged);

        return () => {
          if (ethereum.removeListener) {
            ethereum.removeListener('accountsChanged', handleAccountsChanged);
          }
        };
      }
    }
  }, []);

  const handleQuoteGenerated = (newQuote: QuoteResponse) => {
    setQuote(newQuote);
    setError(null);
    setPaymentTxHash(null);
    setCurrentStep('payment');
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePaymentSent = (txHash: string) => {
    setPaymentTxHash(txHash);
    setError(null);
    setCurrentStep('tracking');
  };

  const handleReset = () => {
    setQuote(null);
    setError(null);
    setPaymentTxHash(null);
    setCurrentStep('quote');
  };

  const handleTransactionCompleted = () => {
    setCurrentStep('completed');
  };

  const getChainName = (chainKey: string) => {
    return chainKey.toUpperCase();
  };

  const getStepIndicator = () => {
    const steps = [
      { key: 'quote', label: '1. Get Quote', icon: '📋' },
      { key: 'payment', label: '2. Send Payment', icon: '💰' },
      { key: 'tracking', label: '3. Wait for Confirmation', icon: '⏳' },
      { key: 'completed', label: '4. Complete', icon: '✅' }
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-center space-x-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            
            return (
              <div key={step.key} className="flex items-center">
                <div className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all ${
                  isActive 
                    ? 'bg-blue-600 border-blue-600 text-white' 
                    : isCompleted 
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'bg-gray-100 border-gray-300 text-gray-500'
                }`}>
                  {isCompleted ? '✓' : step.icon}
                </div>
                <span className={`ml-2 text-sm font-medium ${
                  isActive ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-500'
                }`}>
                  {step.label}
                </span>
                {index < steps.length - 1 && (
                  <div className={`w-8 h-0.5 mx-4 ${
                    isCompleted ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3">
            <span className="text-xl">⚡</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
            GasUp
          </h1>
          <p className="text-base text-gray-300 mb-4">
            Cross-chain gas top-up service
          </p>

          {/* Supported Networks - Compact */}
          <div className="bg-gray-800/80 backdrop-blur-lg p-4 rounded-xl border border-gray-700/50 shadow-lg mb-4 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-gray-100 mb-3 text-center">🌐 Supported Networks</h3>
            <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              <div className="text-center">
                <ChainLogo chain="ethereum" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Ethereum</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="base" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Base</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="op" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Optimism</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="arbitrum" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Arbitrum</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="sonic" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Sonic</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="unichain" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Unichain</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="ink" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Ink</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="hyperevm" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">HyperEVM</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="linea" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Linea</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="polygon" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Polygon</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="abstract" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Abstract</p>
              </div>
              <div className="text-center">
                <ChainLogo chain="zora" size={32} className="mx-auto mb-1" />
                <p className="text-xs font-medium text-gray-300">Zora</p>
              </div>
            </div>
            <p className="text-center text-xs text-gray-500 mt-2">Multi-chain bridge supporting 12+ networks</p>
          </div>


        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-800 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        {/* Step Indicator */}
        {quote && getStepIndicator()}

        <div className="grid grid-cols-1 gap-6">
          {/* Main Content */}
          <div>
            {!quote ? (
              <div className="bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/30 p-6">
                <QuoteForm onQuoteGenerated={handleQuoteGenerated} onError={handleError} />
              </div>
            ) : (
            <div className="space-y-6">
              {/* Quote Details */}
                              <div className="p-6 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/30 relative overflow-hidden">
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full opacity-50 -translate-y-12 translate-x-12"></div>
                <div className="absolute bottom-0 left-0 w-20 h-20 bg-gradient-to-tr from-green-100 to-blue-100 rounded-full opacity-40 translate-y-8 -translate-x-8"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-6">
                    <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Quote Details</h3>
                    <button
                      onClick={handleReset}
                      className="px-3 py-1 text-sm font-medium text-blue-300 hover:text-blue-200 bg-blue-900/30 hover:bg-blue-800/40 rounded-lg transition-all transform hover:scale-105"
                    >
                      New Quote
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {/* You Pay */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 to-orange-900/20 rounded-xl"></div>
                      <div className="relative p-4 rounded-xl border border-red-500/30 bg-gray-800/50">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white font-bold text-sm">💰</span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-100">You Pay</h4>
                        </div>
                        <div className="text-xl font-bold text-gray-100 mb-1">
                          {formatTokenAmount(BigInt(quote.exact.amountRaw), quote.sourceAsset)} {quote.sourceAsset}
                        </div>
                        <div className="text-xs font-medium text-gray-300 bg-gray-700/70 px-2 py-1 rounded-md inline-block">
                          on {getChainName(quote.sourceChain)}
                        </div>
                      </div>
                    </div>

                    {/* You Receive */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-emerald-900/20 rounded-xl"></div>
                      <div className="relative p-4 rounded-xl border border-green-500/30 bg-gray-800/50">
                        <div className="flex items-center mb-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mr-2">
                            <span className="text-white font-bold text-sm">💎</span>
                          </div>
                          <h4 className="text-base font-semibold text-gray-100">You Receive</h4>
                        </div>
                        <div className="text-xl font-bold text-gray-100 mb-1">
                          ≈{formatTokenAmount(BigInt(quote.target.expectedNative), 'ETH')} ETH
                        </div>
                        <div className="space-y-1">
                          <div className="text-xs font-medium text-gray-300 bg-gray-700/70 px-2 py-1 rounded-md inline-block">
                            on {getChainName(quote.targetChain)}
                          </div>
                          <div className="text-xs text-gray-400">
                            (min: {formatTokenAmount(BigInt(quote.target.minGuarantee), 'ETH')} ETH)
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Fees Breakdown */}
                  <div className="bg-gradient-to-r from-gray-800/50 to-blue-900/20 rounded-xl p-4 border border-gray-600/50">
                    <h5 className="font-semibold text-gray-100 mb-3 flex items-center">
                      <span className="w-5 h-5 bg-gradient-to-r from-gray-500 to-blue-500 rounded-md flex items-center justify-center mr-2">
                        <span className="text-white text-xs">📊</span>
                      </span>
                      Fee Breakdown
                    </h5>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center text-gray-300">
                        <span className="text-sm">Service Fee (3%):</span>
                        <span className="font-semibold text-base">${quote.fees.serviceFeeUsd}</span>
                      </div>
                      <div className="flex justify-between items-center text-gray-300">
                        <span className="text-sm">Execution Buffer:</span>
                        <span className="font-semibold text-base">${quote.fees.execBufferUsd}</span>
                      </div>
                      <div className="border-t border-gray-600 pt-2">
                        <div className="flex justify-between items-center text-gray-100">
                          <span className="font-bold">Total Fees:</span>
                          <span className="font-bold text-lg text-blue-400">${quote.fees.totalFeeUsd}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {currentStep === 'payment' && (
                <div className="p-6 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/30">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-100 mb-4">Send Payment</h3>
                    
                    {/* Simple Instructions */}
                    <div className="mb-4 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                      <div className="text-sm text-blue-200">
                        Click the button below to send your payment. Your wallet will open for confirmation.
                      </div>
                    </div>

                    <PayButton 
                      quote={quote}
                      onPaymentSent={handlePaymentSent}
                      onError={handleError}
                    />
                  </div>
                </div>
              )}

              {/* Status Tracking Section */}
              {currentStep === 'tracking' && paymentTxHash && (
                <div className="p-6 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/30">
                  <div className="text-center">
                    <h3 className="text-xl font-bold text-gray-100 mb-4">Processing Transfer</h3>
                    
                    {/* Simple Status */}
                    <div className="mb-4 p-3 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                      <div className="text-sm text-purple-200">
                        Your payment is being processed. This usually takes 2-5 minutes.
                      </div>
                    </div>

                    <StatusTracker 
                      orderId={quote.orderId} 
                      sourceTxHash={paymentTxHash}
                      onCompleted={handleTransactionCompleted}
                    />
                  </div>
                </div>
              )}

              {/* Completed Section */}
              {currentStep === 'completed' && (
                <div className="p-6 bg-gray-800/90 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-700/30">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎉</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-100 mb-3">Transfer Complete!</h3>
                    <p className="text-gray-300 mb-6">
                      Your ETH has been successfully transferred to {getChainName(quote.targetChain)}.
                    </p>
                    <button
                      onClick={handleReset}
                      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-6 rounded-lg font-semibold hover:from-blue-700 hover:to-purple-700 transition-all"
                    >
                      Start New Transaction
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
          </div>
        </div>

        {/* Transaction History */}
        <div className="mt-6">
          <TransactionHistory 
            userAddress={connectedAccount} 
          />
        </div>

        {/* Sendwise Integration - Footer */}
        <div className="mt-8 mb-6">
          <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4 text-center max-w-2xl mx-auto shadow-lg">
            <div className="flex items-center justify-center mb-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2">
                <span className="text-white text-sm">🚀</span>
              </div>
              <h3 className="text-base font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Need Batch Transfers?
              </h3>
            </div>
            <p className="text-gray-300 mb-3 text-sm leading-relaxed">
              Send ETH and ERC20 tokens to multiple addresses at once with our partner platform
            </p>
            <a 
              href="https://www.sendwise.xyz/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold rounded-lg hover:from-purple-600 hover:to-pink-600 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-sm"
            >
              <span className="mr-1">🚀</span>
              Try Sendwise
              <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by GasUp • Fast • Secure • Decentralized</p>
        </div>
      </div>
    </div>
  );
}
