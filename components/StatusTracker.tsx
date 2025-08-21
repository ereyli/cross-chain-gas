'use client';

import { useState, useEffect } from 'react';
import { CHAINS } from '../lib/chains';
import type { StatusResponse } from '../types';

interface StatusTrackerProps {
  orderId: string;
  sourceTxHash?: string;
  onCompleted?: () => void;
}

export function StatusTracker({ orderId, sourceTxHash, onCompleted }: StatusTrackerProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFulfilling, setIsFulfilling] = useState(false);
  const [autoFulfillAttempted, setAutoFulfillAttempted] = useState(false);
  const [autoFulfillFailed, setAutoFulfillFailed] = useState(false);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    const fetchStatus = async () => {
      try {
        const response = await fetch(`/api/status?orderId=${orderId}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch status');
        }

        setStatus(data);
        setError(null);

        // Auto-fulfill when status becomes PAID or when we have sourceTxHash
        if ((data.status === 'PAID' || data.status === 'AWAITING_PAYMENT') && sourceTxHash && !autoFulfillAttempted) {
          console.log('💰 Payment detected, starting auto-fulfill in 3 seconds...');
          setAutoFulfillAttempted(true);
          
          // Wait 3 seconds then auto-fulfill
          setTimeout(async () => {
            try {
              console.log('🚀 Auto-fulfilling order...');
              const response = await fetch('/api/test-fulfill', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  orderId: orderId,
                  txHash: sourceTxHash
                })
              });

              if (!response.ok) {
                throw new Error('Auto-fulfill failed');
              }

              console.log('✅ Auto-fulfill initiated successfully');
            } catch (err) {
              console.error('❌ Auto-fulfill failed:', err);
              setAutoFulfillFailed(true);
            }
          }, 3000);
        }

        // Stop polling if order is completed or failed
        if (data.status === 'DONE' || data.status === 'REFUNDED' || data.status === 'EXPIRED') {
          if (intervalId) {
            clearInterval(intervalId);
          }
          
          // Call onCompleted callback when transaction is done
          if (data.status === 'DONE' && onCompleted) {
            console.log('🔄 Transaction completed, calling onCompleted callback');
            onCompleted();
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchStatus();

    // Poll every 5 seconds
    intervalId = setInterval(fetchStatus, 5000);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [orderId, onCompleted, sourceTxHash, autoFulfillAttempted]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'text-yellow-600 bg-yellow-100';
      case 'PAID':
        return 'text-blue-600 bg-blue-100';
      case 'FULFILLING':
        return 'text-purple-600 bg-purple-100';
      case 'DONE':
        return 'text-green-600 bg-green-100';
      case 'REFUNDED':
      case 'EXPIRED':
      case 'UNDERPAID':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'AWAITING_PAYMENT':
        return 'Waiting for Payment';
      case 'PAID':
        return 'Payment Received';
      case 'FULFILLING':
        return 'Processing Delivery';
      case 'DONE':
        return 'Completed';
      case 'REFUNDED':
        return 'Refunded';
      case 'EXPIRED':
        return 'Expired';
      case 'UNDERPAID':
        return 'Underpaid';
      default:
        return status;
    }
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
    const chainInfo = CHAINS[chain as keyof typeof CHAINS];
    return `${chainInfo.scan}/tx/${txHash}`;
  };

  const handleManualFulfillment = async () => {
    if (!sourceTxHash || !status) return;
    
    setIsFulfilling(true);
    try {
      const response = await fetch('/api/test-fulfill', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: orderId,
          txHash: sourceTxHash
        })
      });

      if (!response.ok) {
        throw new Error('Failed to initiate fulfillment');
      }

      // Status will be updated automatically via polling

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete order');
    } finally {
      setIsFulfilling(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-white rounded-lg shadow-lg">
        <div className="text-red-600 font-medium">Error: {error}</div>
      </div>
    );
  }

  if (!status) {
    return null;
  }

  return (
    <div className="space-y-3">
      {/* Status */}
      <div className="text-center">
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}>
          {getStatusText(status.status)}
        </span>
      </div>

      {/* Auto-fulfill Status */}
      {(status.status === 'PAID' || status.status === 'AWAITING_PAYMENT') && sourceTxHash && autoFulfillAttempted && !autoFulfillFailed && (
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-800 font-medium">Transfer tamamlanıyor...</span>
            </div>
            <p className="text-xs text-blue-600">Please wait while we process your transfer automatically.</p>
          </div>
        </div>
      )}

      {/* Manual Fulfillment Button - Only show if auto-fulfill failed */}
      {status.status === 'AWAITING_PAYMENT' && sourceTxHash && autoFulfillFailed && (
        <div className="text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
            <div className="text-sm text-red-800 mb-2">
              Automatic transfer failed. Please try manually.
            </div>
            <button
              onClick={handleManualFulfillment}
              disabled={isFulfilling}
              className={`px-4 py-1 rounded-md font-medium transition-colors text-sm ${
                isFulfilling
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-red-600 text-white hover:bg-red-700'
              }`}
            >
              {isFulfilling ? 'Processing...' : 'Try Again'}
            </button>
          </div>
        </div>
      )}

      {/* Auto-fulfill Status - Show when payment is detected but auto-fulfill not started yet */}
      {status.status === 'AWAITING_PAYMENT' && sourceTxHash && !autoFulfillAttempted && (
        <div className="text-center">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm text-blue-800 font-medium">Payment detected, preparing transfer...</span>
            </div>
            <p className="text-xs text-blue-600">We will automatically complete your transfer in a few seconds.</p>
          </div>
        </div>
      )}

      {/* Transaction Links */}
      <div className="text-center space-y-1">
        {sourceTxHash && (
          <div>
            <a
              href={getExplorerUrl('base', sourceTxHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 text-xs underline"
            >
              View Payment Transaction
            </a>
          </div>
        )}

        {status.targetTx && (
          <div>
            <a
              href={getExplorerUrl('arb', status.targetTx)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:text-green-800 text-xs underline"
            >
              View Delivery Transaction
            </a>
          </div>
        )}

        {status.deliveredNative && (
          <div className="text-xs text-gray-600">
            Delivered: {(Number(status.deliveredNative) / 1e18).toFixed(6)} ETH
            {status.deliveredUSD && (
              <span className="ml-2">(≈${status.deliveredUSD.toFixed(2)})</span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
