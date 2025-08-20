import { createClient } from '@supabase/supabase-js';
import type { Order, OrderStatus } from '../types';
import { 
  isMockEnabled, 
  createOrderMock, 
  updateOrderMock, 
  getOrderMock, 
  findOrderByPaymentMock 
} from './db-mock';
import { CONFIG } from './test-config';

// Initialize Supabase client with fallback to test config
const supabaseUrl = process.env.SUPABASE_URL || CONFIG.supabase.url;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || CONFIG.supabase.serviceKey;

export const supabase = createClient(supabaseUrl, supabaseKey);

export async function createOrder(order: Omit<Order, 'created_at' | 'paid_at' | 'fulfilled_at'>): Promise<Order> {
  if (isMockEnabled()) {
    return createOrderMock(order);
  }
  
  const { data, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to create order: ${error.message}`);
  }
  
  return data;
}

export async function updateOrder(
  id: string, 
  patch: Partial<Pick<Order, 'status' | 'source_tx' | 'target_tx' | 'paid_at' | 'fulfilled_at'>>
): Promise<Order> {
  if (isMockEnabled()) {
    return updateOrderMock(id, patch);
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    throw new Error(`Failed to update order: ${error.message}`);
  }
  
  return data;
}

export async function getOrder(id: string): Promise<Order | null> {
  if (isMockEnabled()) {
    return getOrderMock(id);
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    if (error.code === 'PGRST116') { // Row not found
      return null;
    }
    throw new Error(`Failed to get order: ${error.message}`);
  }
  
  return data;
}

export async function findOrderByPayment(
  expectedFrom: string,
  payTo: string,
  status: OrderStatus = 'AWAITING_PAYMENT'
): Promise<Order | null> {
  if (isMockEnabled()) {
    return findOrderByPaymentMock(expectedFrom, payTo, status);
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('expected_from', expectedFrom)
    .eq('pay_to', payTo)
    .eq('status', status)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    throw new Error(`Failed to find order: ${error.message}`);
  }
  
  return data;
}

export async function getExpiredOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('status', 'AWAITING_PAYMENT')
    .lt('expires_at', new Date().toISOString());
  
  if (error) {
    throw new Error(`Failed to get expired orders: ${error.message}`);
  }
  
  return data || [];
}

export async function markOrdersExpired(): Promise<void> {
  const { error } = await supabase
    .from('orders')
    .update({ status: 'EXPIRED' })
    .eq('status', 'AWAITING_PAYMENT')
    .lt('expires_at', new Date().toISOString());
  
  if (error) {
    throw new Error(`Failed to mark orders expired: ${error.message}`);
  }
}

export async function getUserOrders(userAddress: string, limit: number = 10): Promise<Order[]> {
  if (isMockEnabled()) {
    // Mock implementation - return some fake history
    return [
      {
        id: 'mock-1',
        status: 'DONE' as OrderStatus,
        payer_address: userAddress.toLowerCase(),
        source_chain: 'base',
        target_chain: 'op',
        source_asset: 'ETH',
        target_recipient: userAddress,
        target_amount_usd: 50,
        pay_to: '0x123...456',
        expected_from: userAddress.toLowerCase(),
        exact_token_addr: null,
        exact_amount_raw: '1000000000000000000',
        expires_at: new Date(Date.now() - 86400000 + 900000).toISOString(),
        source_tx: '0xabc123...',
        target_tx: '0xdef456...',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        paid_at: new Date(Date.now() - 86400000 + 300000).toISOString(),
        fulfilled_at: new Date(Date.now() - 86400000 + 600000).toISOString()
      }
    ];
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('expected_from', userAddress.toLowerCase())
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    throw new Error(`Failed to get user orders: ${error.message}`);
  }

  return data || [];
}
