'use client';

import { useState } from 'react';
import { QuoteForm } from '../components/QuoteForm';
import { PayButton } from '../components/PayButton';
import { StatusTracker } from '../components/StatusTracker';
import { formatTokenAmount } from '../lib/prices';
import { CHAINS } from '../lib/chains';
import type { QuoteResponse } from '../types';

export default function Home() {
  const [quote, setQuote] = useState<QuoteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentTxHash, setPaymentTxHash] = useState<string | null>(null);

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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Cross-Chain Gas Top-Up
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Pay with ETH, USDC, or USDT on Base, Optimism, or Arbitrum and receive native gas on any target chain.
            Simple, fast, and secure.
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="space-y-8">
          {!quote ? (
            <QuoteForm onQuoteGenerated={handleQuoteGenerated} onError={handleError} />
          ) : (
            <div className="space-y-6">
              {/* Quote Details */}
              <div className="p-6 bg-white rounded-lg shadow-lg">
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

        {/* Features */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Fast Delivery</h3>
            <p className="text-gray-600 text-sm">
              Get native gas tokens in minutes across Base, Optimism, and Arbitrum
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Secure</h3>
            <p className="text-gray-600 text-sm">
              Exact amount matching and multi-confirmation verification for safety
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a4 4 0 004-4V5z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Multi-Asset</h3>
            <p className="text-gray-600 text-sm">
              Pay with ETH, USDC, or USDT - whatever you have available
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-center text-sm text-gray-500">
          <p>Minimum $1 - Maximum $10 per transaction • 3% service fee • 180s quote validity</p>
        </div>
      </div>
    </div>
  );
}
