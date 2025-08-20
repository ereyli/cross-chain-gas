import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Cross-Chain Gas Top-Up',
  description: 'Simple, safe, automatic gas top-up across Base, Optimism, and Arbitrum',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
