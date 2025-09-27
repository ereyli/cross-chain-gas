export interface WalletProvider {
  name: string;
  id: string;
  icon: string;
  downloadUrl?: string;
  isInstalled: () => boolean;
  connect: () => Promise<string | null>;
}

// Wallet tespiti için global window interface'ini genişletelim
declare global {
  interface Window {
    rainbow?: any;
    phantom?: any;
    solana?: any;
    farcaster?: any;
  }
}

// Rainbow Wallet tespiti
const isRainbowInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.rainbow;
};

// MetaMask tespiti
const isMetaMaskInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.ethereum?.isMetaMask;
};

// Coinbase Wallet tespiti
const isCoinbaseInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!(window.ethereum as any)?.isCoinbaseWallet;
};

// Phantom (Solana) tespiti
const isPhantomInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.phantom;
};

// Farcaster tespiti
const isFarcasterInstalled = (): boolean => {
  return typeof window !== 'undefined' && !!window.farcaster;
};

// Wallet bağlantı fonksiyonları
const connectMetaMask = async (): Promise<string | null> => {
  if (!window.ethereum) return null;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('MetaMask connection error:', error);
    return null;
  }
};

const connectRainbow = async (): Promise<string | null> => {
  if (!window.rainbow) return null;
  
  try {
    // Rainbow wallet API'si MetaMask benzeri
    const accounts = await window.rainbow.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Rainbow connection error:', error);
    return null;
  }
};

const connectCoinbase = async (): Promise<string | null> => {
  if (!window.ethereum || !(window.ethereum as any)?.isCoinbaseWallet) return null;
  
  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    return accounts[0] || null;
  } catch (error) {
    console.error('Coinbase connection error:', error);
    return null;
  }
};

const connectPhantom = async (): Promise<string | null> => {
  if (!window.phantom?.solana) return null;
  
  try {
    const response = await window.phantom.solana.connect();
    return response.publicKey.toString();
  } catch (error) {
    console.error('Phantom connection error:', error);
    return null;
  }
};

// Mevcut wallet sağlayıcıları listesi
export const WALLET_PROVIDERS: WalletProvider[] = [
  {
    name: 'Rainbow',
    id: 'rainbow',
    icon: '🌈',
    downloadUrl: 'https://rainbow.me/',
    isInstalled: isRainbowInstalled,
    connect: connectRainbow,
  },
  {
    name: 'MetaMask',
    id: 'metamask',
    icon: '🦊',
    downloadUrl: 'https://metamask.io/',
    isInstalled: isMetaMaskInstalled,
    connect: connectMetaMask,
  },
  {
    name: 'Coinbase Wallet',
    id: 'coinbase',
    icon: '🔵',
    downloadUrl: 'https://www.coinbase.com/wallet',
    isInstalled: isCoinbaseInstalled,
    connect: connectCoinbase,
  },
  {
    name: 'Phantom',
    id: 'phantom',
    icon: '👻',
    downloadUrl: 'https://phantom.app/',
    isInstalled: isPhantomInstalled,
    connect: connectPhantom,
  },
];

// Mevcut wallet'ları filtrele
export const getAvailableWallets = (): WalletProvider[] => {
  return WALLET_PROVIDERS.filter(wallet => wallet.isInstalled());
};

// En iyi wallet'ı seç (öncelik sırası: Rainbow > MetaMask > Coinbase > Phantom)
export const getPreferredWallet = (): WalletProvider | null => {
  const available = getAvailableWallets();
  if (available.length === 0) return null;
  
  // Öncelik sırasına göre döndür
  const priorityOrder = ['rainbow', 'metamask', 'coinbase', 'phantom'];
  for (const walletId of priorityOrder) {
    const wallet = available.find(w => w.id === walletId);
    if (wallet) return wallet;
  }
  
  return available[0]; // Fallback
};

// Genel wallet bağlantı fonksiyonu
export const connectWallet = async (providerId?: string): Promise<string | null> => {
  if (providerId) {
    const provider = WALLET_PROVIDERS.find(p => p.id === providerId);
    if (provider && provider.isInstalled()) {
      return await provider.connect();
    }
  }
  
  // Öncelikli wallet'ı kullan
  const preferred = getPreferredWallet();
  if (preferred) {
    return await preferred.connect();
  }
  
  throw new Error('No wallet available. Please install a supported wallet.');
};

// Wallet durumunu kontrol et
export const checkWalletConnection = async (): Promise<{ address: string | null; provider: string | null }> => {
  const available = getAvailableWallets();
  
  for (const wallet of available) {
    try {
      let accounts: string[] = [];
      
      if (wallet.id === 'rainbow' && window.rainbow) {
        accounts = await window.rainbow.request({ method: 'eth_accounts' });
      } else if (window.ethereum) {
        accounts = await window.ethereum.request({ method: 'eth_accounts' });
      }
      
      if (accounts && accounts.length > 0) {
        return { address: accounts[0], provider: wallet.name };
      }
    } catch (error) {
      console.error(`Error checking ${wallet.name}:`, error);
    }
  }
  
  return { address: null, provider: null };
};
