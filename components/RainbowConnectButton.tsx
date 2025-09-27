'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { isFarcasterEnvironment } from '../lib/farcaster';

interface RainbowConnectButtonProps {
  onWalletConnected?: (address: string, provider: string) => void;
  onError?: (error: string) => void;
}

export function RainbowConnectButton({ 
  onWalletConnected, 
  onError 
}: RainbowConnectButtonProps) {
  const { isConnected, address, connector } = useAccount();

  // Sadece web ortamında render et (Farcaster'da değil)
  if (isFarcasterEnvironment()) {
    return null;
  }

  // Wallet bağlandığında callback'i çağır
  if (isConnected && address && onWalletConnected) {
    onWalletConnected(address, connector?.name || 'Unknown Wallet');
  }

  return (
    <div className="flex justify-center">
      <ConnectButton 
        showBalance={true}
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
    </div>
  );
}

// Özel tema ile ConnectButton
export function CustomRainbowConnectButton({ 
  onWalletConnected, 
  onError 
}: RainbowConnectButtonProps) {
  const { isConnected, address, connector } = useAccount();

  // Sadece web ortamında render et
  if (isFarcasterEnvironment()) {
    return null;
  }

  // Wallet bağlandığında callback'i çağır
  if (isConnected && address && onWalletConnected) {
    onWalletConnected(address, connector?.name || 'Unknown Wallet');
  }

  return (
    <div className="bg-gradient-to-r from-gray-800/90 to-gray-700/90 backdrop-blur-lg border border-gray-600/50 rounded-xl p-4">
      <ConnectButton 
        showBalance={true}
        chainStatus="icon"
        accountStatus={{
          smallScreen: 'avatar',
          largeScreen: 'full',
        }}
      />
      <div className="mt-2 text-center text-sm text-gray-400">
        🌈 Rainbow, MetaMask, Coinbase ve daha fazlası
      </div>
    </div>
  );
}
