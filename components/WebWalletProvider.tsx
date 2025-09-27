'use client';

import { RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { rainbowkitConfig } from '../lib/rainbowkit-config';
import { isFarcasterEnvironment } from '../lib/farcaster';
import { useState } from 'react';

export function WebWalletProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  // Sadece web ortamında RainbowKit kullan (Farcaster'da değil)
  if (isFarcasterEnvironment()) {
    return <>{children}</>;
  }

  return (
    <WagmiProvider config={rainbowkitConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          appInfo={{
            appName: 'GasUp',
            learnMoreUrl: 'https://cross-chain-gas.vercel.app',
            disclaimer: ({ Text, Link }) => (
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
