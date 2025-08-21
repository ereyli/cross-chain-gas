'use client';

import Image from 'next/image';
import { useState } from 'react';

interface ChainLogoProps {
  chain: string;
  size?: number;
  className?: string;
}

export function ChainLogo({ chain, size = 48, className = '' }: ChainLogoProps) {
  const [imageError, setImageError] = useState(false);
  
  // Chain logo mappings
  const chainLogos: Record<string, string> = {
    ethereum: '/images/chains/logo/ethereum-eth-logo.png',
    base: '/images/chains/logo/base-logo.jpg',
    op: '/images/chains/logo/optimism-ethereum-op-logo.png',
    arbitrum: '/images/chains/logo/arbitrum-arb-logo.png',
    sonic: '/images/chains/logo/sonic-logo.jpg',
    unichain: '/images/chains/logo/unichain-logo.jpg',
    ink: '/images/chains/logo/ink-logo.jpg',
    hyperevm: '/images/chains/logo/hyper-logo.png',
    linea: '/images/chains/logo/linea-logo.png',
    polygon: '/images/chains/logo/polygon-matic-logo.png',
    abstract: '/images/chains/logo/Abstract- logo.jpg',
    zora: '/images/chains/logo/zora logo.jpg'
  };

  // Fallback colors for each chain
  const fallbackColors: Record<string, string> = {
    ethereum: 'from-gray-700 to-gray-800',
    base: 'from-blue-500 to-blue-600',
    op: 'from-red-500 to-red-600',
    arbitrum: 'from-blue-600 to-indigo-600',
    sonic: 'from-blue-400 to-cyan-500',
    unichain: 'from-pink-500 to-purple-600',
    ink: 'from-indigo-500 to-purple-600',
    hyperevm: 'from-green-500 to-teal-600',
    linea: 'from-green-600 to-blue-600',
    polygon: 'from-purple-500 to-purple-700',
    abstract: 'from-gray-600 to-gray-700',
    zora: 'from-yellow-500 to-orange-600'
  };

  // Fallback letters for each chain
  const fallbackLetters: Record<string, string> = {
    ethereum: 'Ξ',
    base: 'B',
    op: 'O',
    arbitrum: 'A',
    sonic: 'S',
    unichain: 'U',
    ink: 'I',
    hyperevm: 'H',
    linea: 'L',
    polygon: 'P',
    abstract: 'Ab',
    zora: 'Z'
  };

  const logoPath = chainLogos[chain];
  const fallbackColor = fallbackColors[chain] || 'from-gray-500 to-gray-600';
  const fallbackLetter = fallbackLetters[chain] || chain.charAt(0).toUpperCase();

  if (!logoPath || imageError) {
    return (
      <div 
        className={`w-${size/4} h-${size/4} bg-gradient-to-r ${fallbackColor} rounded-xl flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white font-bold text-sm">{fallbackLetter}</span>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width: size, height: size }}>
      <Image
        src={logoPath}
        alt={`${chain} logo`}
        width={size}
        height={size}
        className="rounded-xl object-contain"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
