'use client';

import { useState, useEffect } from 'react';
import { CHAINS } from '../lib/chains';
import { ChainLogo } from './ChainLogo';
import type { Order } from '../types';

interface TransactionHistoryProps {
  userAddress: string | null;
}

export function TransactionHistory({ userAddress }: TransactionHistoryProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userAddress) {
      fetchUserHistory();
    } else {
      setOrders([]);
    }
  }, [userAddress]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserHistory = async () => {
    if (!userAddress) return;

    console.log('🔍 Fetching user history for:', userAddress);
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/user-history?address=${userAddress}&limit=20`);
      const data = await response.json();
      
      console.log('📊 Transaction history response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch history');
      }

      setOrders(data.orders || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE': return 'text-green-600 bg-green-100';
      case 'FULFILLING': return 'text-blue-600 bg-blue-100';
      case 'PAID': return 'text-purple-600 bg-purple-100';
      case 'AWAITING_PAYMENT': return 'text-yellow-600 bg-yellow-100';
      case 'EXPIRED': case 'REFUNDED': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'DONE': return 'Completed';
      case 'FULFILLING': return 'Processing';
      case 'PAID': return 'Paid';
      case 'AWAITING_PAYMENT': return 'Pending';
      case 'EXPIRED': return 'Expired';
      case 'REFUNDED': return 'Refunded';
      default: return status;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getExplorerUrl = (chain: string, txHash: string) => {
    const chainData = CHAINS[chain as keyof typeof CHAINS];
    return `${chainData.scan}/tx/${txHash}`;
  };

  if (!userAddress) {
    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">📊 Transaction History</h3>
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">🔗</div>
          <p className="text-gray-500">Connect your wallet to see transaction history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">📊 Transaction History</h3>
        <button
          onClick={fetchUserHistory}
          disabled={isLoading}
          className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
        >
          {isLoading ? '🔄' : '🔄 Refresh'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse">
              <div className="bg-gray-200 rounded-lg h-20"></div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">📭</div>
          <p className="text-gray-500">No transactions found</p>
          <p className="text-gray-400 text-sm">Your completed transfers will appear here</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-white/30 rounded-xl p-4 hover:bg-white/50 transition-all hover:shadow-md backdrop-blur-sm bg-white/20"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <ChainLogo chain={order.source_chain} size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {order.source_chain.toUpperCase()}
                    </span>
                    <span className="text-gray-400">→</span>
                    <ChainLogo chain={order.target_chain} size={16} />
                    <span className="text-sm font-medium text-gray-700">
                      {order.target_chain.toUpperCase()}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                    {getStatusText(order.status)}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {order.created_at ? formatDate(order.created_at) : 'Unknown date'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Amount: <span className="font-medium">${order.target_amount_usd}</span></p>
                  <p className="text-gray-600">Asset: <span className="font-medium">{order.source_asset} → ETH</span></p>
                </div>
                <div className="text-right">
                  {order.source_tx && (
                    <a
                      href={getExplorerUrl(order.source_chain, order.source_tx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-xs block"
                    >
                      📤 Source Tx
                    </a>
                  )}
                  {order.target_tx && (
                    <a
                      href={getExplorerUrl(order.target_chain, order.target_tx)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-green-600 hover:text-green-800 text-xs block"
                    >
                      📥 Target Tx
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
