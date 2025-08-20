'use client';

import { useState, useEffect } from 'react';
import { CHAINS } from '../lib/chains';
import type { StatusResponse } from '../types';

interface StatusTrackerProps {
  orderId: string;
  sourceTxHash?: string;
}

export function StatusTracker({ orderId, sourceTxHash }: StatusTrackerProps) {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        // Stop polling if order is completed or failed
        if (data.status === 'DONE' || data.status === 'REFUNDED' || data.status === 'EXPIRED') {
          if (intervalId) {
            clearInterval(intervalId);
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
  }, [orderId]);

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
    <div className="p-6 bg-white rounded-lg shadow-lg space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">Order Status</h3>
      
      <div className="flex items-center space-x-3">
        <span
          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(status.status)}`}
        >
          {getStatusText(status.status)}
        </span>
      </div>

      {sourceTxHash && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Payment Transaction
          </label>
          <a
            href={getExplorerUrl('base', sourceTxHash)} // You'd need to determine the correct chain
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {sourceTxHash}
          </a>
        </div>
      )}

      {status.sourceTx && status.sourceTx !== sourceTxHash && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirmed Payment
          </label>
          <a
            href={getExplorerUrl('base', status.sourceTx)} // You'd need to determine the correct chain
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline break-all"
          >
            {status.sourceTx}
          </a>
        </div>
      )}

      {status.targetTx && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivery Transaction
          </label>
          <a
            href={getExplorerUrl('arb', status.targetTx)} // You'd need to determine the correct chain
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-600 hover:text-green-800 underline break-all"
          >
            {status.targetTx}
          </a>
        </div>
      )}

      {status.deliveredNative && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Delivered Amount
          </label>
          <div className="text-lg font-semibold text-green-600">
            {(Number(status.deliveredNative) / 1e18).toFixed(6)} ETH
            {status.deliveredUSD && (
              <span className="text-sm text-gray-600 ml-2">
                (≈${status.deliveredUSD.toFixed(2)})
              </span>
            )}
          </div>
        </div>
      )}

      <div className="text-xs text-gray-500">
        Order ID: {orderId}
      </div>
    </div>
  );
}
