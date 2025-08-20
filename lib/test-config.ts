// Configuration for both test and production
// Bu dosya test ve production ortamında kullanılır

export const CONFIG = {
  // Test mode flag
  isTestMode: process.env.NODE_ENV === 'development' && process.env.LOCAL_TEST_MODE !== 'false',
  
  // Alchemy endpoints - API keys must be provided via environment variables
  alchemy: {
    base: {
      http: process.env.ALCHEMY_BASE_HTTP || 'https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_BASE_WSS || 'wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE'
    },
    op: {
      http: process.env.ALCHEMY_OP_HTTP || 'https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_OP_WSS || 'wss://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE'
    },
    arb: {
      http: process.env.ALCHEMY_ARB_HTTP || 'https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_ARB_WSS || 'wss://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE'
    },
    eth: {
      http: process.env.ALCHEMY_ETH_HTTP || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_ETH_WSS || 'wss://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE'
    },
    sonic: {
      http: process.env.ALCHEMY_SONIC_HTTP || 'https://rpc.soniclabs.com/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_SONIC_WSS || 'wss://rpc.soniclabs.com/YOUR_API_KEY_HERE'
    },
    unichain: {
      http: process.env.ALCHEMY_UNICHAIN_HTTP || 'https://sepolia.unichain.org/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_UNICHAIN_WSS || 'wss://sepolia.unichain.org/YOUR_API_KEY_HERE'
    },
    ink: {
      http: process.env.ALCHEMY_INK_HTTP || 'https://rpc-gel.inkonchain.com/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_INK_WSS || 'wss://rpc-gel.inkonchain.com/YOUR_API_KEY_HERE'
    },
    hyperevm: {
      http: process.env.ALCHEMY_HYPEREVM_HTTP || 'https://api.hyperliquid-testnet.xyz/evm/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_HYPEREVM_WSS || 'wss://api.hyperliquid-testnet.xyz/evm/YOUR_API_KEY_HERE'
    },
    linea: {
      http: process.env.ALCHEMY_LINEA_HTTP || 'https://rpc.linea.build/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_LINEA_WSS || 'wss://rpc.linea.build/YOUR_API_KEY_HERE'
    },
    polygon: {
      http: process.env.ALCHEMY_POLYGON_HTTP || 'https://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_POLYGON_WSS || 'wss://polygon-mainnet.g.alchemy.com/v2/YOUR_API_KEY_HERE'
    },
    abstract: {
      http: process.env.ALCHEMY_ABSTRACT_HTTP || 'https://api.testnet.abs.xyz/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_ABSTRACT_WSS || 'wss://api.testnet.abs.xyz/YOUR_API_KEY_HERE'
    },
    zora: {
      http: process.env.ALCHEMY_ZORA_HTTP || 'https://rpc.zora.energy/YOUR_API_KEY_HERE',
      wss: process.env.ALCHEMY_ZORA_WSS || 'wss://rpc.zora.energy/YOUR_API_KEY_HERE'
    }
  },
  
  // Wallet addresses for payment collection - must be provided via environment variables
  payToAddresses: {
    base: process.env.PAYTO_BASE || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_BASE_WALLET_ADDRESS_HERE'),
    op: process.env.PAYTO_OP || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_OP_WALLET_ADDRESS_HERE'),
    arb: process.env.PAYTO_ARB || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_ARB_WALLET_ADDRESS_HERE'),
    eth: process.env.PAYTO_ETH || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_ETH_WALLET_ADDRESS_HERE'),
    sonic: process.env.PAYTO_SONIC || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_SONIC_WALLET_ADDRESS_HERE'),
    unichain: process.env.PAYTO_UNICHAIN || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_UNICHAIN_WALLET_ADDRESS_HERE'),
    ink: process.env.PAYTO_INK || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_INK_WALLET_ADDRESS_HERE'),
    hyperevm: process.env.PAYTO_HYPEREVM || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_HYPEREVM_WALLET_ADDRESS_HERE'),
    linea: process.env.PAYTO_LINEA || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_LINEA_WALLET_ADDRESS_HERE'),
    polygon: process.env.PAYTO_POLYGON || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_POLYGON_WALLET_ADDRESS_HERE'),
    abstract: process.env.PAYTO_ABSTRACT || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_ABSTRACT_WALLET_ADDRESS_HERE'),
    zora: process.env.PAYTO_ZORA || (process.env.NODE_ENV === 'development' ? '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa' : 'YOUR_ZORA_WALLET_ADDRESS_HERE')
  },
  
  // Supabase config - credentials must be provided via environment variables
  supabase: {
    url: process.env.SUPABASE_URL || 'YOUR_SUPABASE_URL_HERE',
    serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || 'YOUR_SUPABASE_SERVICE_ROLE_KEY_HERE'
  },
  
  // Fulfillment wallet config (replaces Defender)
  fulfillmentWallet: {
    // Address: 0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa
    privateKey: process.env.FULFILLMENT_PRIVATE_KEY,
    address: '0x422EAa58Cb7450e4573Ca778BEce0f0787b62ffa'
  }
};

export const TEST_CONFIG = CONFIG;

export function isLocalTestMode(): boolean {
  return CONFIG.isTestMode || process.env.LOCAL_TEST_MODE === 'true';
}
