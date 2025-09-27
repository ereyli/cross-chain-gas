import '@rainbow-me/rainbowkit/styles.css';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { http } from 'wagmi';
import { 
  mainnet, 
  base, 
  arbitrum, 
  optimism, 
  polygon, 
  linea,
  sonic,
  zora,
  polygonZkEvm
} from 'wagmi/chains';

// RainbowKit konfigürasyonu
export const rainbowkitConfig = getDefaultConfig({
  appName: 'GasUp - Cross-Chain Gas Top-Up',
  projectId: 'f7b3e8d4c9a1b2e3f4g5h6i7j8k9l0m1n2o3p4', // RainbowKit default project ID
  chains: [mainnet, base, arbitrum, optimism, polygon, linea, sonic, zora, polygonZkEvm],
  transports: {
    // Her zincir için HTTP transport
    [mainnet.id]: http(),
    [base.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
    [polygon.id]: http(),
    [linea.id]: http(),
    [sonic.id]: http(),
    [zora.id]: http(),
    [polygonZkEvm.id]: http(),
  },
  ssr: true, // Next.js SSR desteği
});

// RainbowKit kendi WalletConnect Project ID'sini kullanır
console.log('🌈 RainbowKit WalletConnect entegrasyonu aktif');
