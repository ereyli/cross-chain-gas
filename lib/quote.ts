import { z } from 'zod';
import { v4 as uuidv4 } from 'uuid';
import { getUsdPrice, usdToWeiOnTarget, getTokenDecimals, parseTokenAmount, formatTokenAmount } from './prices';
import { getPayTo, getTokenAddress, encodeErc20Transfer, getSupportedAssets } from './chains';
import { createOrder } from './db';
import './init-test'; // Initialize test environment
import type { ChainKey, Asset, QuoteResponse, TxTemplate } from '../types';

const QuoteRequestSchema = z.object({
  payer: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  sourceChain: z.enum(['base', 'op']), // ARB temporarily disabled
  sourceAsset: z.enum(['ETH', 'USDC', 'USDT']),
  targetChain: z.enum(['base', 'op']), // ARB temporarily disabled
  targetRecipient: z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address'),
  targetAmountUsd: z.number().min(1).max(10).multipleOf(0.01),
});

export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

const SERVICE_FEE_BPS = parseInt(process.env.SERVICE_FEE_BPS || '300'); // 3%
const EXEC_BUFFER_USD_FIXED = parseFloat(process.env.EXEC_BUFFER_USD_FIXED || '0.1');
const EXEC_BUFFER_BPS = parseInt(process.env.EXEC_BUFFER_BPS || '50'); // 0.5%
const QUOTE_TTL = parseInt(process.env.QUOTE_TTL || '180'); // seconds

export async function generateQuote(request: QuoteRequest): Promise<QuoteResponse> {
  // Validate input
  const validated = QuoteRequestSchema.parse(request);
  const { payer, sourceChain, sourceAsset, targetChain, targetRecipient, targetAmountUsd } = validated;
  
  // Validate asset is supported on source chain
  const supportedAssets = getSupportedAssets(sourceChain);
  if (!supportedAssets.includes(sourceAsset)) {
    throw new Error(`${sourceAsset} not supported on ${sourceChain}`);
  }
  
  // Get current prices
  const [sourceAssetPrice, targetEthPrice] = await Promise.all([
    getUsdPrice(sourceAsset, sourceChain),
    getUsdPrice('ETH', targetChain)
  ]);
  
  // Calculate fees and execution buffer
  const A = targetAmountUsd;
  const C_exec = EXEC_BUFFER_USD_FIXED + A * (EXEC_BUFFER_BPS / 10000);
  const serviceFeeRate = SERVICE_FEE_BPS / 10000;
  const totalBeforeFee = A + C_exec;
  const payUsd = totalBeforeFee / (1 - serviceFeeRate);
  const serviceFeeUsd = payUsd - totalBeforeFee;
  
  // Get payment details
  const payTo = getPayTo(sourceChain);
  const expectedFrom = payer;
  
  // Calculate exact payment amount
  let exactAmountRaw: string;
  let exactTokenAddr: string | null = null;
  let txTemplate: TxTemplate;
  
  if (sourceAsset === 'ETH') {
    // ETH payment
    const payWei = BigInt(Math.floor(payUsd / sourceAssetPrice * 1e18));
    exactAmountRaw = payWei.toString();
    
    txTemplate = {
      kind: 'ETH',
      to: payTo,
      value: exactAmountRaw
    };
  } else {
    // ERC20 payment
    exactTokenAddr = getTokenAddress(sourceAsset as 'USDC' | 'USDT', sourceChain);
    const decimals = getTokenDecimals(sourceAsset);
    const factor = BigInt(10 ** decimals);
    const payTokens = BigInt(Math.floor(payUsd * Number(factor)));
    exactAmountRaw = payTokens.toString();
    
    const transferData = encodeErc20Transfer(payTo, payTokens);
    
    txTemplate = {
      kind: 'ERC20',
      to: exactTokenAddr,
      data: transferData
    };
  }
  
  // Calculate target delivery
  const expectedNativeWei = usdToWeiOnTarget(targetAmountUsd, targetEthPrice);
  const minGuaranteeWei = BigInt(Math.floor(Number(expectedNativeWei) * 0.97)); // 97% guarantee
  
  // Create order
  const orderId = uuidv4();
  const expiresAt = new Date(Date.now() + QUOTE_TTL * 1000);
  
  const order = await createOrder({
    id: orderId,
    status: 'AWAITING_PAYMENT',
    payer_address: payer,
    source_chain: sourceChain,
    source_asset: sourceAsset,
    target_chain: targetChain,
    target_recipient: targetRecipient,
    target_amount_usd: targetAmountUsd,
    pay_to: payTo,
    expected_from: expectedFrom,
    exact_token_addr: exactTokenAddr,
    exact_amount_raw: exactAmountRaw,
    expires_at: expiresAt.toISOString()
  });
  
  // Return quote response
  return {
    orderId,
    expiresAt: Math.floor(expiresAt.getTime() / 1000),
    payTo,
    expectedFrom,
    sourceChain,
    targetChain,
    sourceAsset,
    txTemplate,
    exact: {
      tokenAddr: exactTokenAddr,
      amountRaw: exactAmountRaw
    },
    target: {
      expectedNative: expectedNativeWei.toString(),
      minGuarantee: minGuaranteeWei.toString()
    },
    fees: {
      serviceFeeUsd: Number(serviceFeeUsd.toFixed(2)),
      execBufferUsd: Number(C_exec.toFixed(2)),
      totalFeeUsd: Number((serviceFeeUsd + C_exec).toFixed(2))
    }
  };
}

export function validateQuoteRequest(data: unknown): QuoteRequest {
  return QuoteRequestSchema.parse(data);
}

export function formatQuoteAmount(amountRaw: string, asset: Asset): string {
  const amount = BigInt(amountRaw);
  return formatTokenAmount(amount, asset);
}

export function isQuoteExpired(expiresAt: string): boolean {
  return new Date(expiresAt) < new Date();
}
