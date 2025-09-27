import { http, createConfig } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon, linea } from 'wagmi/chains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { isFarcasterEnvironment } from './farcaster';

// Wagmi konfigürasyonu
export const wagmiConfig = createConfig({
  chains: [mainnet, base, arbitrum, optimism, polygon, linea],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [linea.id]: http(),
  },
  connectors: [
    // Sadece Farcaster ortamında Mini App connector'ı kullan
    ...(isFarcasterEnvironment() ? [miniAppConnector()] : []),
  ],
});

// Wagmi hooks'larını sadece Farcaster ortamında kullan
export const shouldUseWagmi = isFarcasterEnvironment();
