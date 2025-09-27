'use client';

import { useState, useEffect } from 'react';
import { LoadingSpinner } from '../../components/LoadingSpinner';
import { useAppLoading } from '../../lib/use-app-loading';

// Note: Metadata should be in a separate server component or in layout.tsx

export default function HistoryPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // App loading management
  const { isLoading: appLoading, isReady: appReady } = useAppLoading();

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        // Mock transaction data - replace with real API call
        const mockTransactions = [
          {
            id: '1',
            from: 'Base',
            to: 'Optimism',
            amount: '0.1 ETH',
            status: 'Completed',
            timestamp: new Date().toISOString(),
            txHash: '0x123...abc'
          },
          {
            id: '2',
            from: 'Ethereum',
            to: 'Arbitrum',
            amount: '0.05 ETH',
            status: 'Pending',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            txHash: '0x456...def'
          }
        ];
        setTransactions(mockTransactions);
      } catch (err) {
        setError('Failed to load transaction history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  // Show loading spinner while app is initializing
  if (appLoading || !appReady) {
    return <LoadingSpinner message="Loading transaction history..." />;
  }

  if (loading) {
    return <LoadingSpinner message="Loading transactions..." />;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-gray-900 py-4">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl mb-3">
            <span className="text-xl">📊</span>
          </div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Transaction History
          </h1>
          <p className="text-gray-400">
            View your cross-chain gas top-up transactions
          </p>
        </div>

        {/* Transactions List */}
        <div className="bg-gray-800/90 backdrop-blur-lg rounded-2xl shadow-xl border border-gray-700/30 p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-500 text-6xl mb-4">📝</div>
              <h3 className="text-xl font-semibold text-gray-300 mb-2">No Transactions Yet</h3>
              <p className="text-gray-400 mb-6">
                Start your first cross-chain gas top-up to see your transaction history here.
              </p>
              <a
                href="/"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all"
              >
                Get Gas Quote
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-gray-700/50 rounded-xl p-4 border border-gray-600/50 hover:border-gray-500/50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-400">{tx.from}</span>
                        <span className="text-blue-400">→</span>
                        <span className="text-sm text-gray-400">{tx.to}</span>
                      </div>
                      <div className="text-white font-semibold">{tx.amount}</div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          tx.status === 'Completed'
                            ? 'bg-green-900/30 text-green-300 border border-green-500/30'
                            : 'bg-yellow-900/30 text-yellow-300 border border-yellow-500/30'
                        }`}
                      >
                        {tx.status}
                      </span>
                      <a
                        href={`https://etherscan.io/tx/${tx.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 text-sm"
                      >
                        View on Explorer
                      </a>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-gray-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-400">
          <p>Powered by GasUp • Fast • Secure • Decentralized</p>
        </div>
      </div>
    </div>
  );
}
