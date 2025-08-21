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
  
  // Chain logo mappings - try multiple paths
  const chainLogos: Record<string, string[]> = {
    eth: ['/logos/ethereum-eth-logo.png', '/ethereum-eth-logo.png', '/images/chains/logo/ethereum-eth-logo.png'],
    ethereum: ['/logos/ethereum-eth-logo.png', '/ethereum-eth-logo.png', '/images/chains/logo/ethereum-eth-logo.png'],
    base: ['/logos/base-logo.jpg', '/base-logo.jpg', '/images/chains/logo/base-logo.jpg'],
    op: ['/logos/optimism-ethereum-op-logo.png', '/optimism-ethereum-op-logo.png', '/images/chains/logo/optimism-ethereum-op-logo.png'],
    arb: ['/logos/arbitrum-arb-logo.png', '/arbitrum-arb-logo.png', '/images/chains/logo/arbitrum-arb-logo.png'],
    arbitrum: ['/logos/arbitrum-arb-logo.png', '/arbitrum-arb-logo.png', '/images/chains/logo/arbitrum-arb-logo.png'],
    sonic: ['/logos/sonic-logo.jpg', '/sonic-logo.jpg', '/images/chains/logo/sonic-logo.jpg'],
    unichain: ['/logos/unichain-logo.jpg', '/unichain-logo.jpg', '/images/chains/logo/unichain-logo.jpg'],
    ink: ['/logos/ink-logo.jpg', '/ink-logo.jpg', '/images/chains/logo/ink-logo.jpg'],
    hyperevm: ['/logos/hyper-logo.png', '/hyper-logo.png', '/images/chains/logo/hyper-logo.png'],
    linea: ['/logos/linea-logo.png', '/linea-logo.png', '/images/chains/logo/linea-logo.png'],
    polygon: ['/logos/polygon-matic-logo.png', '/polygon-matic-logo.png', '/images/chains/logo/polygon-matic-logo.png'],
    abstract: ['/logos/abstract-logo.jpg', '/abstract-logo.jpg', '/images/chains/logo/abstract-logo.jpg'],
    zora: ['/logos/zora-logo.jpg', '/zora-logo.jpg', '/images/chains/logo/zora-logo.jpg']
  };

  // Debug logging
  console.log('ChainLogo render:', { chain, logoPath: chainLogos[chain], imageError });

  // Fallback colors for each chain
  const fallbackColors: Record<string, string> = {
    eth: 'from-gray-700 to-gray-800',
    ethereum: 'from-gray-700 to-gray-800',
    base: 'from-blue-500 to-blue-600',
    op: 'from-red-500 to-red-600',
    arb: 'from-blue-600 to-indigo-600',
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
    eth: 'Ξ',
    ethereum: 'Ξ',
    base: 'B',
    op: 'O',
    arb: 'A',
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

  const logoPaths = chainLogos[chain] || [];
  const logoPath = logoPaths[0]; // Use first path as primary
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
      <img
        src={logoPath}
        alt={`${chain} logo`}
        width={size}
        height={size}
        className="rounded-xl object-cover"
        onError={() => {
          console.log('Image error for:', logoPath);
          // Try next fallback path if available
          const currentIndex = logoPaths.indexOf(logoPath);
          if (currentIndex < logoPaths.length - 1) {
            const nextPath = logoPaths[currentIndex + 1];
            console.log('Trying next path:', nextPath);
            const img = document.querySelector(`img[src="${logoPath}"]`) as HTMLImageElement;
            if (img) {
              img.src = nextPath;
            }
          } else {
            console.log('All paths failed, using fallback');
            setImageError(true);
          }
        }}
        onLoad={() => console.log('Image loaded successfully:', logoPath)}
      />
    </div>
  );
}
