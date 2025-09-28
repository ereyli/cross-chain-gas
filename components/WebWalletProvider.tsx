'use client';

import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rainbowkitConfig } from '../lib/rainbowkit-config';
import { wagmiConfig } from '../lib/wagmi-config';
import { isFarcasterEnvironment } from '../lib/farcaster';
import { useState, useEffect } from 'react';

// RainbowKit'i sadece web'de import et - Farcaster'da hiç yükleme
let RainbowKitProvider: any = null;

export function WebWalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Farcaster ortamında sadece Wagmi (Farcaster wallet)
  if (isFarcasterEnvironment()) {
    return (
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  // Web ortamında RainbowKit'i dinamik olarak yükle
  useEffect(() => {
    if (!isFarcasterEnvironment() && typeof window !== 'undefined') {
      try {
        const rainbowkit = require('@rainbow-me/rainbowkit');
        RainbowKitProvider = rainbowkit.RainbowKitProvider;
      } catch (error) {
        console.warn('RainbowKit not available');
      }
    }
  }, []);

  // Web ortamında RainbowKit (web wallets)
  if (!RainbowKitProvider) {
    // RainbowKit yoksa sadece Wagmi kullan
    return (
      <WagmiProvider config={rainbowkitConfig}>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </WagmiProvider>
    );
  }

  return (
    <WagmiProvider config={rainbowkitConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'GasUp',
            learnMoreUrl: 'https://cross-chain-gas.vercel.app',
            disclaimer: ({ Text, Link }: { Text: any; Link: any }) => (
              <Text>
                GasUp ile bağlantı kurarak&apos;{' '}
                <Link href="https://cross-chain-gas.vercel.app/terms">Kullanım Şartları</Link> ve{' '}
                <Link href="https://cross-chain-gas.vercel.app/privacy">Gizlilik Politikası</Link>&apos;nı kabul etmiş olursunuz.
              </Text>
            ),
          }}
          theme={undefined}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
