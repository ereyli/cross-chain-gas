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
    }
  },
  
  // Wallet addresses for payment collection - must be provided via environment variables
  payToAddresses: {
    base: process.env.PAYTO_BASE || 'YOUR_BASE_WALLET_ADDRESS_HERE',
    op: process.env.PAYTO_OP || 'YOUR_OP_WALLET_ADDRESS_HERE',
    // arb: process.env.PAYTO_ARB || 'YOUR_ARB_WALLET_ADDRESS_HERE' // Temporarily disabled
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
