# RainbowKit Integration

Bu dokümantasyon, GasUp projesine RainbowKit entegrasyonunu açıklar.

## Özet

RainbowKit, web tarayıcıları için gelişmiş wallet connection deneyimi sağlayan popüler bir React kütüphanesidir. GasUp projesinde, web ortamında kullanıcılara en iyi wallet deneyimini sunmak için entegre edilmiştir.

## Özellikler

### ✅ Desteklenen Wallet'lar
- 🌈 **Rainbow Wallet** (öncelikli)
- 🦊 **MetaMask**
- 🔵 **Coinbase Wallet**
- 👻 **Phantom** (Solana)
- 💰 **WalletConnect** üzerinden 100+ wallet
- 📱 **Mobile wallet'lar** (QR kod ile)

### ✅ Desteklenen Zincirler
- **Ethereum** (Mainnet)
- **Base**
- **Arbitrum**
- **Optimism**
- **Polygon**
- **Linea**
- **Sonic**
- **Zora**
- **Polygon zkEVM**

### ✅ Özellikler
- **Gelişmiş UI**: Modern ve kullanıcı dostu wallet seçim arayüzü
- **Chain Switching**: Kolay zincir değiştirme
- **Balance Display**: Wallet bakiyesi görüntüleme
- **Transaction History**: Son işlemler görüntüleme
- **Dark Theme**: Karanlık tema desteği
- **Responsive Design**: Mobil uyumlu tasarım

## Teknik Detaylar

### Dosya Yapısı

```
lib/
├── rainbowkit-config.ts          # RainbowKit konfigürasyonu
components/
├── WebWalletProvider.tsx         # Web wallet provider wrapper
├── RainbowConnectButton.tsx      # RainbowKit ConnectButton bileşeni
└── CustomRainbowConnectButton.tsx # Özelleştirilmiş ConnectButton
```

### Konfigürasyon

#### 1. RainbowKit Config (`lib/rainbowkit-config.ts`)

```typescript
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, base, arbitrum, optimism, polygon, linea } from 'wagmi/chains';

export const rainbowkitConfig = getDefaultConfig({
  appName: 'GasUp - Cross-Chain Gas Top-Up',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
  chains: [mainnet, base, arbitrum, optimism, polygon, linea],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    // ... diğer zincirler
  },
  ssr: true, // Next.js SSR desteği
});
```

#### 2. Web Wallet Provider (`components/WebWalletProvider.tsx`)

```typescript
export function WebWalletProvider({ children }: { children: React.ReactNode }) {
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
            learnMoreUrl: 'https://gasup.xyz',
          }}
          showRecentTransactions={true}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
```

#### 3. Connect Button (`components/RainbowConnectButton.tsx`)

```typescript
export function CustomRainbowConnectButton() {
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
```

## Environment Variables

Aşağıdaki environment variable'ları ayarlamanız gerekiyor:

# RainbowKit kendi WalletConnect Project ID'sini kullanır - ayrıca bir tane almaya gerek yok!

# RPC Providers (opsiyonel - daha iyi performans için)
NEXT_PUBLIC_ETHEREUM_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/your_key
NEXT_PUBLIC_BASE_RPC_URL=https://base-mainnet.g.alchemy.com/v2/your_key
# ... diğer zincirler
```

### RainbowKit WalletConnect Entegrasyonu

RainbowKit kendi WalletConnect Project ID'sini kullanır, bu yüzden ayrıca bir tane almanıza gerek yok! 

- ✅ **Otomatik WalletConnect**: RainbowKit dahili olarak WalletConnect kullanır
- ✅ **100+ Wallet Desteği**: WalletConnect üzerinden tüm wallet'lar desteklenir
- ✅ **Mobile Wallet QR**: QR kod ile mobile wallet bağlantısı
- ✅ **Zero Configuration**: Ekstra konfigürasyon gerekmez

## Kullanım

### 1. Ana Sayfa Entegrasyonu

```typescript
// app/page.tsx
import { CustomRainbowConnectButton } from '../components/RainbowConnectButton';

export default function Home() {
  return (
    <div>
      {isFarcasterEnvironment() ? (
        <FarcasterWallet />
      ) : (
        <CustomRainbowConnectButton />
      )}
    </div>
  );
}
```

### 2. Wagmi Hooks Kullanımı

```typescript
import { useAccount, useConnect, useDisconnect } from 'wagmi';

function MyComponent() {
  const { isConnected, address, connector } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Bağlı: {address}</p>
        <p>Wallet: {connector?.name}</p>
        <button onClick={() => disconnect()}>Bağlantıyı Kes</button>
      </div>
    );
  }

  return <button onClick={() => connect()}>Bağlan</button>;
}
```

## Ortam Tespiti

RainbowKit sadece web ortamında kullanılır. Farcaster ortamında Farcaster wallet kullanılır:

```typescript
import { isFarcasterEnvironment } from '../lib/farcaster';

if (isFarcasterEnvironment()) {
  // Farcaster wallet kullan
} else {
  // RainbowKit kullan
}
```

## Performans Optimizasyonu

### 1. Bundle Size

RainbowKit otomatik olarak sadece gerekli wallet'ları yükler.

### 2. RPC Providers

Performans için kendi RPC provider'larınızı kullanın:

```typescript
transports: {
  [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/your_key'),
  [base.id]: http('https://base-mainnet.g.alchemy.com/v2/your_key'),
}
```

### 3. Lazy Loading

Provider'lar sadece gerekli olduğunda yüklenir.

## Sorun Giderme

### 1. Build Hataları

```bash
# Async storage hatası
Module not found: Can't resolve '@react-native-async-storage/async-storage'
```

**Çözüm**: `next.config.js`'e webpack fallback ekleyin:

```javascript
config.resolve.fallback = {
  '@react-native-async-storage/async-storage': false,
};
```

### 2. WalletConnect Project ID

```bash
# Project ID uyarısı
⚠️ WalletConnect Project ID bulunamadı
```

**Çözüm**: Environment variable ayarlayın:

```bash
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_here
```

### 3. Chain Type Hataları

```bash
# Chain array type hatası
Type error: Property 'chains' must be of type '_chains'
```

**Çözüm**: Chain array'ini doğrudan inline kullanın:

```typescript
chains: [mainnet, base, arbitrum], // desteklenen zincirler
```

## Güvenlik

### 1. Environment Variables

- `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` public olabilir
- RPC URL'leri public olabilir (sadece okuma)
- Private key'ler asla environment variable'larda saklanmamalı

### 2. Wallet Security

- Kullanıcılar kendi wallet'larını yönetir
- Private key'ler asla uygulamada saklanmaz
- Tüm işlemler kullanıcı tarafından onaylanır

## Gelecek Geliştirmeler

### 1. Özelleştirme
- [ ] Custom theme
- [ ] Custom wallet list
- [ ] Custom avatars

### 2. Gelişmiş Özellikler
- [ ] ENS name resolution
- [ ] Transaction history
- [ ] Multi-sig support

### 3. Mobile Optimizasyon
- [ ] Mobile wallet deep links
- [ ] QR code optimization
- [ ] Touch gestures

## Kaynaklar

- [RainbowKit Documentation](https://rainbowkit.com/tr/docs/installation)
- [Wagmi Documentation](https://wagmi.sh/)
- [WalletConnect Cloud](https://cloud.walletconnect.com/)
- [Viem Documentation](https://viem.sh/)

## Destek

Sorunlar için:
1. Bu dokümantasyonu kontrol edin
2. RainbowKit GitHub issues'ını inceleyin
3. GasUp projesi maintainer'larına ulaşın
