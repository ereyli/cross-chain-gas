import type { Metadata } from 'next';
import './globals.css';
import { WagmiProviderWrapper } from '../components/WagmiProvider';
import { WebWalletProvider } from '../components/WebWalletProvider';

export const metadata: Metadata = {
  title: 'GasUp - Cross-Chain Gas Top-Up',
  description: 'Bridge ETH and tokens seamlessly between 12+ blockchain networks',
  themeColor: '#2563eb',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'GasUp',
  },
  icons: {
    icon: '/logos/gasup-logo.png',
    apple: '/logos/gasup-logo.png',
  },
  openGraph: {
    title: 'GasUp - Cross-Chain Gas Top-Up',
    description: 'Bridge ETH and tokens seamlessly between 12+ blockchain networks',
    images: ['https://cross-chain-gas.vercel.app/logos/gasup-logo.png'],
    url: 'https://cross-chain-gas.vercel.app',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'GasUp - Cross-Chain Gas Top-Up',
    description: 'Bridge ETH and tokens seamlessly between 12+ blockchain networks',
    images: ['https://cross-chain-gas.vercel.app/logos/gasup-logo.png'],
  },
  other: {
    'fc:miniapp': 'GasUp',
    'fc:miniapp:version': '1.0.0',
    'fc:miniapp:image': 'https://cross-chain-gas.vercel.app/logos/gasup-logo.png',
    'fc:miniapp:button:1': 'Get Gas Quote',
    'fc:miniapp:button:1:action': 'https://cross-chain-gas.vercel.app/',
    'fc:miniapp:button:1:target': 'frame',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <WagmiProviderWrapper>
          <WebWalletProvider>
            {children}
          </WebWalletProvider>
        </WagmiProviderWrapper>
      </body>
    </html>
  );
}
