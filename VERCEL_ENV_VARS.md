# Vercel Environment Variables

Vercel Dashboard'da Project Settings > Environment Variables bölümünde aşağıdaki değişkenleri ekleyin:

## Required (Critical)
```
SUPABASE_URL=https://tyvzvskiazbmkzmcnnvm.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5dnp2c2tpYXpibWt6bWNubnZtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTY3NjE5NCwiZXhwIjoyMDcxMjUyMTk0fQ.BswbbOhmOM_b0vXZY1HQ4jjpK59bYfj4O52dUXhupYc

FULFILLMENT_PRIVATE_KEY=0x07fc35a243701c6777b5b952ef4ee433278eec1ed8eabdb28f7e812f28ec2fd6
```

## Alchemy RPC Endpoints (Working)
```
ALCHEMY_BASE_HTTP=https://base-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_BASE_WSS=wss://base-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_OP_HTTP=https://opt-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_OP_WSS=wss://opt-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_ARB_HTTP=https://arb-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_ARB_WSS=wss://arb-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_ETH_HTTP=https://eth-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_ETH_WSS=wss://eth-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_POLYGON_HTTP=https://polygon-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_POLYGON_WSS=wss://polygon-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_LINEA_HTTP=https://linea-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
ALCHEMY_LINEA_WSS=wss://linea-mainnet.g.alchemy.com/v2/n4mmGPWXfwIWrdQF3ROw3
```

## New Chains RPC (Placeholder - may need real endpoints)
```
ALCHEMY_INK_HTTP=https://rpc-gel.inkonchain.com
ALCHEMY_INK_WSS=wss://rpc-gel.inkonchain.com
ALCHEMY_SONIC_HTTP=https://rpc.soniclabs.com
ALCHEMY_SONIC_WSS=wss://rpc.soniclabs.com
ALCHEMY_UNICHAIN_HTTP=https://sepolia.unichain.org
ALCHEMY_UNICHAIN_WSS=wss://sepolia.unichain.org
ALCHEMY_HYPEREVM_HTTP=https://api.hyperliquid-testnet.xyz/evm
ALCHEMY_HYPEREVM_WSS=wss://api.hyperliquid-testnet.xyz/evm
ALCHEMY_ABSTRACT_HTTP=https://api.testnet.abs.xyz
ALCHEMY_ABSTRACT_WSS=wss://api.testnet.abs.xyz
ALCHEMY_ZORA_HTTP=https://rpc.zora.energy
ALCHEMY_ZORA_WSS=wss://rpc.zora.energy
```

## Payment Addresses
```
PAYTO_BASE=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_OP=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_ARB=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_ETH=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_SONIC=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_UNICHAIN=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_INK=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_HYPEREVM=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_LINEA=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_POLYGON=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_ABSTRACT=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
PAYTO_ZORA=0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F
```

## Optional Configuration
```
LOCAL_TEST_MODE=false
SERVICE_FEE_BPS=300
EXEC_BUFFER_USD_FIXED=0.1
EXEC_BUFFER_BPS=50
PRICE_TTL=90
QUOTE_TTL=180
```

## Important Notes:
1. **Set for all environments**: Production, Preview, Development
2. **No quotes needed** around values in Vercel UI
3. **Sensitive data**: SUPABASE_SERVICE_ROLE_KEY and FULFILLMENT_PRIVATE_KEY should be kept secure
4. **Working wallet**: 0x294f4f31eF0b4Cdd4C0c1A0a6d4d24A5a7BC644F is the tested wallet address
5. **RPC Endpoints**: Some new chains may need real RPC endpoints from providers like Alchemy, Infura, or public RPCs
