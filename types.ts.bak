export type ChainKey = 'base' | 'op' | 'arb' | 'eth' | 'sonic' | 'unichain' | 'ink' | 'hyperevm' | 'linea' | 'polygon' | 'abstract' | 'zora';
export type Asset = 'ETH' | 'USDC' | 'USDT';
export type OrderStatus = 
  | 'AWAITING_PAYMENT' 
  | 'PAID' 
  | 'FULFILLING' 
  | 'DONE' 
  | 'REFUNDED' 
  | 'EXPIRED' 
  | 'UNDERPAID';

export interface Order {
  id: string;
  status: OrderStatus;
  payer_address: string;
  source_chain: ChainKey;
  source_asset: Asset;
  target_chain: ChainKey;
  target_recipient: string;
  target_amount_usd: number;
  pay_to: string;
  expected_from: string;
  exact_token_addr: string | null;
  exact_amount_raw: string;
  expires_at: string;
  source_tx?: string;
  target_tx?: string;
  created_at?: string;
  paid_at?: string;
  fulfilled_at?: string;
}

export interface TxTemplate {
  kind: 'ETH' | 'ERC20';
  to: string;
  value?: string;
  data?: string;
}

export interface QuoteResponse {
  orderId: string;
  expiresAt: number;
  payTo: string;
  expectedFrom: string;
  sourceChain: ChainKey;
  targetChain: ChainKey;
  sourceAsset: Asset;
  txTemplate: TxTemplate;
  exact: {
    tokenAddr: string | null;
    amountRaw: string;
  };
  target: {
    expectedNative: string;
    minGuarantee: string;
  };
  fees: {
    serviceFeeUsd: number;
    execBufferUsd: number;
    totalFeeUsd: number;
  };
}

export interface StatusResponse {
  status: OrderStatus;
  sourceTx?: string;
  targetTx?: string;
  deliveredNative?: string;
  deliveredUSD?: number;
}
