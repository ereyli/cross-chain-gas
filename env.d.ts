declare global {
  namespace NodeJS {
    interface ProcessEnv {
      // Alchemy
      ALCHEMY_BASE_HTTP: string;
      ALCHEMY_BASE_WSS: string;
      ALCHEMY_OP_HTTP: string;
      ALCHEMY_OP_WSS: string;
      ALCHEMY_ARB_HTTP: string;
      ALCHEMY_ARB_WSS: string;

      // Supabase
      SUPABASE_URL: string;
      SUPABASE_SERVICE_ROLE_KEY: string;

      // OpenZeppelin Defender
      DEFENDER_API_KEY: string;
      DEFENDER_API_SECRET: string;
      DEFENDER_RELAYER_BASE: string;
      DEFENDER_RELAYER_OP: string;
      DEFENDER_RELAYER_ARB: string;

      // Payment addresses
      PAYTO_BASE: string;
      PAYTO_OP: string;
      PAYTO_ARB: string;

      // Configuration
      SERVICE_FEE_BPS: string;
      EXEC_BUFFER_USD_FIXED: string;
      EXEC_BUFFER_BPS: string;
      PRICE_TTL: string;
      QUOTE_TTL: string;
    }
  }

  interface Window {
    ethereum?: {
      request: (args: { method: string; params?: any[] }) => Promise<any>;
      isMetaMask?: boolean;
    };
  }
}

export {};
