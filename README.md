# GasUp - Cross-Chain Gas Top-Up Service

A production-ready MVP that enables users to pay on one EVM chain with ETH/USDC/USDT and receive native gas ($1-$10) on any target chain. Features include exact amount matching, 3-confirmation verification, and automated fulfillment via OpenZeppelin Defender Relayers.

## Features

- **Multi-Chain Support**: Base, Optimism, and Arbitrum
- **Multi-Asset Payments**: ETH, USDC, USDT
- **Secure Verification**: Exact amount matching, 3+ confirmations
- **Automated Fulfillment**: OpenZeppelin Defender Relayers
- **Real-time Tracking**: WebSocket-based order status updates
- **Modern UI**: Next.js with Tailwind CSS

## Tech Stack

- **Framework**: Next.js 14 (App Router) + TypeScript
- **Database**: Supabase PostgreSQL
- **Blockchain**: Ethers.js v6 + Alchemy RPC/WSS
- **Automation**: OpenZeppelin Defender SDK
- **Styling**: Tailwind CSS
- **Deployment**: Vercel-ready

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── quote/route.ts          # Quote generation endpoint
│   │   ├── status/route.ts         # Order status endpoint
│   │   └── webhook/
│   │       ├── base/route.ts       # Base chain webhook
│   │       ├── op/route.ts         # Optimism webhook
│   │       └── arb/route.ts        # Arbitrum webhook
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Main application page
│   └── globals.css                 # Global styles
├── lib/
│   ├── chains.ts                   # Chain configurations & utilities
│   ├── prices.ts                   # Price fetching & calculations
│   ├── db.ts                       # Database operations
│   ├── quote.ts                    # Quote generation logic
│   ├── fulfil.ts                   # Order fulfillment via Defender
│   └── watcher-helpers.ts          # Webhook processing utilities
├── components/
│   ├── QuoteForm.tsx               # Quote request form
│   ├── PayButton.tsx               # Payment execution component
│   └── StatusTracker.tsx           # Order status tracking
├── scripts/
│   └── migrate.js                  # Database migration script
└── types.ts                        # TypeScript type definitions
```

## Setup Instructions

### 1. Environment Configuration

Create `.env.local` file:

```bash
# Alchemy RPC/WSS endpoints
ALCHEMY_BASE_HTTP=https://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_BASE_WSS=wss://base-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_OP_HTTP=https://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_OP_WSS=wss://opt-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_ARB_HTTP=https://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY
ALCHEMY_ARB_WSS=wss://arb-mainnet.g.alchemy.com/v2/YOUR_API_KEY

# Supabase configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OpenZeppelin Defender
DEFENDER_API_KEY=your-defender-api-key
DEFENDER_API_SECRET=your-defender-api-secret
DEFENDER_RELAYER_BASE=your-base-relayer-id
DEFENDER_RELAYER_OP=your-op-relayer-id
DEFENDER_RELAYER_ARB=your-arb-relayer-id

# Payment collection addresses (EOA under your control)
PAYTO_BASE=0x...
PAYTO_OP=0x...
PAYTO_ARB=0x...

# Service configuration
SERVICE_FEE_BPS=300     # 3%
EXEC_BUFFER_USD_FIXED=0.1
EXEC_BUFFER_BPS=50      # 0.5%
PRICE_TTL=90
QUOTE_TTL=180
```

### 2. Database Setup

1. Create a new Supabase project
2. Run the migration:

```bash
npm run db:migrate
```

The migration creates the `orders` table with proper indexes and constraints.

### 3. OpenZeppelin Defender Setup

1. Create a Defender account at [defender.openzeppelin.com](https://defender.openzeppelin.com)
2. Create three Relayers (one for each chain):
   - Base Relayer
   - Optimism Relayer  
   - Arbitrum Relayer
3. Fund each relayer with sufficient ETH for gas costs
4. Copy the relayer IDs to your `.env.local` file

### 4. Alchemy Webhook Setup

Configure Alchemy Notify webhooks for each chain:

1. **Base Chain**:
   - Webhook URL: `https://your-domain.vercel.app/api/webhook/base`
   - Address: Your `PAYTO_BASE` address
   - Activity Types: Native transfers, ERC20 transfers

2. **Optimism Chain**:
   - Webhook URL: `https://your-domain.vercel.app/api/webhook/op`  
   - Address: Your `PAYTO_OP` address
   - Activity Types: Native transfers, ERC20 transfers

3. **Arbitrum Chain**:
   - Webhook URL: `https://your-domain.vercel.app/api/webhook/arb`
   - Address: Your `PAYTO_ARB` address
   - Activity Types: Native transfers, ERC20 transfers

### 5. Install Dependencies & Run

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Vercel Deployment

1. Push code to GitHub repository
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

The application is optimized for Vercel with proper Next.js configuration.

## Usage Flow

### 1. Generate Quote

User submits:
- Payer address (connected wallet)
- Source chain & asset (Base/OP/ARB + ETH/USDC/USDT)
- Target chain & recipient
- Target amount ($1-$10)

System calculates:
- Exact payment amount (including 3% service fee + execution buffer)
- Target delivery amount
- Quote expiration (180 seconds)

### 2. Execute Payment

User connects wallet and:
- Switches to source chain
- Sends exact payment amount to designated address
- Transaction is submitted to blockchain

### 3. Payment Verification

Alchemy webhooks trigger when payment is detected:
- Verifies exact amount match
- Waits for 3+ confirmations
- Validates sender/recipient addresses
- Checks quote hasn't expired

### 4. Automated Fulfillment

Upon successful verification:
- Order marked as PAID
- Defender Relayer sends native ETH to recipient
- Order marked as DONE
- User receives confirmation

## Security Features

- **Exact Amount Matching**: No epsilon tolerance for payments
- **Confirmation Requirements**: Minimum 3 confirmations before fulfillment
- **Address Validation**: Strict sender/recipient verification
- **Quote Expiration**: 180-second TTL prevents stale orders
- **Single PayTo Addresses**: No per-order wallet generation
- **Input Validation**: Zod schema validation for all inputs

## Token Addresses

### USDC (Native)
- Base: `0x833589fCD6EDb6E08f4c7C32D4f71b54bdA02913`
- Optimism: `0x0b2C639c533813f4Aa9D7837CAf62653d097Ff85`
- Arbitrum: `0xAf88d065e77c8cC2239327C5EDb3A432268e5831`

### USDT
- Optimism: `0x94b008aa00579c1307B0EF2c499aD98a8ce58e58`
- Arbitrum: `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9`

## API Endpoints

### POST /api/quote
Generate payment quote
```json
{
  "payer": "0x...",
  "sourceChain": "base",
  "sourceAsset": "ETH",
  "targetChain": "arb", 
  "targetRecipient": "0x...",
  "targetAmountUsd": 5.0
}
```

### GET /api/status?orderId=...
Check order status
```json
{
  "status": "DONE",
  "sourceTx": "0x...",
  "targetTx": "0x...",
  "deliveredNative": "1500000000000000000",
  "deliveredUSD": 4.85
}
```

### POST /api/webhook/{chain}
Alchemy webhook endpoints (internal use)

## Error Handling

- **EXPIRED**: Quote TTL exceeded before payment
- **UNDERPAID**: Payment amount doesn't match exactly
- **REFUNDED**: Fulfillment failed after max retries
- **EXPIRED**: Payment received after quote expiration

## Monitoring

Check application logs for:
- Quote generation metrics
- Payment verification status
- Fulfillment success/failure rates
- Error patterns and frequency

## Support

For production deployment:
- Monitor Defender Relayer balances
- Set up alerts for failed fulfillments
- Implement proper webhook signature verification
- Add comprehensive error tracking (Sentry)

## License

MIT License - see LICENSE file for details.
