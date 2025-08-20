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
      http: process.env.ALCHEMY_UNICHAIN_HTTP || 'https://mainnet.unichain.org',
      wss: process.env.ALCHEMY_UNICHAIN_WSS || 'wss://mainnet.unichain.org'
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
  
  // Wallet addresses for payment collection - fallback to working address
  payToAddresses: {
    base: process.env.PAYTO_BASE || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    op: process.env.PAYTO_OP || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    arb: process.env.PAYTO_ARB || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    eth: process.env.PAYTO_ETH || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    sonic: process.env.PAYTO_SONIC || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    unichain: process.env.PAYTO_UNICHAIN || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    ink: process.env.PAYTO_INK || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    hyperevm: process.env.PAYTO_HYPEREVM || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    linea: process.env.PAYTO_LINEA || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    polygon: process.env.PAYTO_POLYGON || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    abstract: process.env.PAYTO_ABSTRACT || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F',
    zora: process.env.PAYTO_ZORA || '0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F'
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
