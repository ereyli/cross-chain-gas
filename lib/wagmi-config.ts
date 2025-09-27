import { http, createConfig } from 'wagmi';
import { mainnet, base, arbitrum, optimism, polygon, linea } from 'wagmi/chains';
import { farcasterMiniApp as miniAppConnector } from '@farcaster/miniapp-wagmi-connector';
import { isFarcasterEnvironment } from './farcaster';

// Wagmi konfigürasyonu - sadece Farcaster ortamında kullanılır
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
    miniAppConnector(), // Farcaster Mini App connector
  ],
});

// Wagmi hooks'larını sadece Farcaster ortamında kullan
export const shouldUseWagmi = isFarcasterEnvironment();
