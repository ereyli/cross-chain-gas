'use client';

import { useState, useEffect } from 'react';
import { QuoteForm } from '../components/QuoteForm';
import { PayButton } from '../components/PayButton';
import { StatusTracker } from '../components/StatusTracker';
import { TransactionHistory } from '../components/TransactionHistory';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
import type { QuoteResponse } from '../types';

export default function Home() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<string | null>(null);

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
  };

  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const handlePaymentSent = (txHash: string) => {
    setPaymentTxHash(txHash);
    setError(null);
  };

  const handleReset = () => {
    setQuote(null);
    setError(null);
    setPaymentTxHash(null);
  };

  const getChainName = (chainKey: string) => {
    return chainKey.toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-100/80 py-8 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-cyan-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/3 left-1/4 w-60 h-60 bg-gradient-to-br from-indigo-400/15 to-purple-500/15 rounded-full blur-2xl animate-pulse" style={{animationDelay: '4s'}}></div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl mb-4">
            <span className="text-2xl">⚡</span>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Cross-Chain Gas Top-Up
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8 leading-relaxed">
            Pay with ETH, USDC, or USDT on Base, Optimism, or Arbitrum and receive native gas on any target chain.
            <br />
            <span className="text-blue-600 font-medium">Simple, fast, and secure.</span>
          </p>
          
          {/* User Guidance */}
          <div className="bg-blue-50/80 backdrop-blur-lg border border-blue-200/50 rounded-2xl p-6 mb-8 text-left max-w-3xl mx-auto shadow-lg">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 text-center">📖 How it works:</h3>
            <div className="text-sm text-blue-800 space-y-2">
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">1</span>
                <span>Choose source chain (where you have funds) and target chain (where you want ETH)</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">2</span>
                <span>Enter target amount and connect your wallet</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">3</span>
                <span>Send payment on source chain when prompted</span>
              </div>
              <div className="flex items-center">
                <span className="bg-blue-200 text-blue-900 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold mr-3">4</span>
                <span>Receive ETH on target chain automatically (or use manual completion if needed)</span>
              </div>
            </div>
          </div>

          {/* Supported Networks */}
          <div className="bg-white/60 backdrop-blur-lg p-4 rounded-2xl border border-white/30 shadow-lg mb-8 max-w-2xl mx-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-3 text-center">🌐 Supported Networks</h3>
            <div className="flex justify-center items-center space-x-8">
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">B</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Base</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-red-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">O</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Optimism</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <p className="text-sm font-medium text-gray-700">Arbitrum</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-800 rounded-xl shadow-sm">
            <div className="flex items-center">
              <span className="text-red-500 mr-2">⚠️</span>
              {error}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="xl:col-span-2">
            {!quote ? (
              <QuoteForm onQuoteGenerated={handleQuoteGenerated} onError={handleError} />
            ) : (
            <div className="space-y-6">
              {/* Quote Details */}
              <div className="p-8 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold text-gray-900">Quote Details</h3>
                  <button
                    onClick={handleReset}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    New Quote
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">You Pay</h4>
                    <div className="text-lg">
                      {formatTokenAmount(BigInt(quote.exact.amountRaw), quote.sourceAsset)} {quote.sourceAsset}
                      <div className="text-sm text-gray-600">
                        on {getChainName(quote.sourceChain)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">You Receive</h4>
                    <div className="text-lg">
                      ≈{formatTokenAmount(BigInt(quote.target.expectedNative), 'ETH')} ETH
                      <div className="text-sm text-gray-600">
                        on {getChainName(quote.targetChain)} 
                        <br />
                        (min: {formatTokenAmount(BigInt(quote.target.minGuarantee), 'ETH')} ETH)
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Service Fee (3%):</span>
                      <span>${quote.fees.serviceFeeUsd}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Execution Buffer:</span>
                      <span>${quote.fees.execBufferUsd}</span>
                    </div>
                    <div className="flex justify-between font-medium">
                      <span>Total Fees:</span>
                      <span>${quote.fees.totalFeeUsd}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Section */}
              {!paymentTxHash ? (
                <div className="p-6 bg-white rounded-lg shadow-lg">
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">Make Payment</h3>
                  <PayButton 
                    quote={quote}
                    onPaymentSent={handlePaymentSent}
                    onError={handleError}
                  />
                </div>
              ) : (
                <StatusTracker orderId={quote.orderId} sourceTxHash={paymentTxHash} />
              )}
            </div>
          )}
          </div>

          {/* Transaction History Sidebar */}
          <div className="xl:col-span-1">
            <TransactionHistory userAddress={connectedAccount} />
          </div>
        </div>

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Fast Delivery</h3>
            <p className="text-gray-600">
              Get native gas tokens in minutes across Base, Optimism, and Arbitrum
            </p>
          </div>

          <div className="text-center bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Secure</h3>
            <p className="text-gray-600">
              Exact amount matching and multi-confirmation verification for safety
            </p>
          </div>

          <div className="text-center bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 hover:shadow-2xl hover:bg-white/80 transition-all transform hover:scale-105">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Multi-Asset</h3>
            <p className="text-gray-600">
              Pay with ETH, USDC, or USDT - whatever you have available
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500 bg-white/40 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
          <p className="mb-2">Minimum $1 - Maximum $10 per transaction • 3% service fee • 180s quote validity</p>
          <p className="text-xs text-gray-400">Fast • Secure • Decentralized Cross-Chain Bridge</p>
        </div>
      </div>
    </div>
  );
}
