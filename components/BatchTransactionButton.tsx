'use client';

import { useSendCalls } from 'wagmi';
import { parseEther } from 'viem';
import { isFarcasterEnvironment } from '../lib/farcaster';
import { useState } from 'react';

interface BatchTransactionButtonProps {
  transactions: Array<{
    to: `0x${string}`;
    value?: bigint;
    data?: `0x${string}`;
  }>;
  onSuccess?: (results: any) => void;
  onError?: (error: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function BatchTransactionButton({
  transactions,
  onSuccess,
  onError,
  children,
  className = ''
}: BatchTransactionButtonProps) {
  const { sendCalls, isPending } = useSendCalls();
  const [isExecuting, setIsExecuting] = useState(false);

  // Sadece Farcaster ortamında batch transactions desteklenir
  if (!isFarcasterEnvironment()) {
    return null;
  }

  const handleBatchTransaction = async () => {
    if (transactions.length === 0) {
      onError?.('No transactions to execute');
      return;
    }

    setIsExecuting(true);
    
    try {
      const result = await sendCalls({
        calls: transactions.map(tx => ({
          to: tx.to,
          value: tx.value || BigInt(0),
          data: tx.data || '0x',
        })),
      });

      onSuccess?.(result);
    } catch (error) {
      console.error('Batch transaction error:', error);
      onError?.(error instanceof Error ? error.message : 'Batch transaction failed');
    } finally {
      setIsExecuting(false);
    }
  };

  const isLoading = isPending || isExecuting;

  return (
    <button
      onClick={handleBatchTransaction}
      disabled={isLoading || transactions.length === 0}
      className={`${className} ${
        isLoading 
          ? 'opacity-50 cursor-not-allowed' 
          : 'hover:opacity-90'
      } transition-all`}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
          <span>Executing {transactions.length} transactions...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Örnek kullanım bileşeni
export function ExampleBatchTransfer() {
  const transactions = [
    {
      to: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8' as `0x${string}`,
      value: parseEther('0.01'),
    },
    {
      to: '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC' as `0x${string}`,
      value: parseEther('0.02'),
    }
  ];

  return (
    <BatchTransactionButton
      transactions={transactions}
      onSuccess={(result) => console.log('Batch transfer successful:', result)}
      onError={(error) => console.error('Batch transfer failed:', error)}
      className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg font-semibold"
    >
      Send Batch Transfer
    </BatchTransactionButton>
  );
}
