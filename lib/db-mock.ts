// Mock database for local testing
// Bu dosya gerçek Supabase connection yokken kullanılır

import type { Order, OrderStatus } from '../types';
import { isLocalTestMode } from './test-config';

// In-memory storage for testing
const mockOrders = new Map<string, Order>();
let mockEnabled = false;

export function enableMockDatabase() {
  mockEnabled = true;
  console.log('🧪 Mock database enabled for testing');
}

export function isMockEnabled(): boolean {
  return mockEnabled || isLocalTestMode();
}

export async function createOrderMock(order: Omit<Order, 'created_at' | 'paid_at' | 'fulfilled_at'>): Promise<Order> {
  const fullOrder: Order = {
    ...order,
    created_at: new Date().toISOString(),
    paid_at: undefined,
    fulfilled_at: undefined
  };
  
  mockOrders.set(order.id, fullOrder);
  console.log(`📝 Mock order created: ${order.id}`);
  return fullOrder;
}

export async function updateOrderMock(
  id: string, 
  patch: Partial<Pick<Order, 'status' | 'source_tx' | 'target_tx' | 'paid_at' | 'fulfilled_at'>>
): Promise<Order> {
  const existing = mockOrders.get(id);
  if (!existing) {
    throw new Error(`Order not found: ${id}`);
  }
  
  const updated = { ...existing, ...patch };
  mockOrders.set(id, updated);
  console.log(`📝 Mock order updated: ${id} -> ${patch.status || 'no status change'}`);
  return updated;
}

export async function getOrderMock(id: string): Promise<Order | null> {
  const order = mockOrders.get(id);
  console.log(`📖 Mock order retrieved: ${id} -> ${order ? 'found' : 'not found'}`);
  return order || null;
}

export async function findOrderByPaymentMock(
  expectedFrom: string,
  payTo: string,
  status: OrderStatus = 'AWAITING_PAYMENT'
): Promise<Order | null> {
  const orders = Array.from(mockOrders.values());
  for (const order of orders) {
    if (order.expected_from === expectedFrom && 
        order.pay_to === payTo && 
        order.status === status) {
      console.log(`🔍 Mock order found by payment: ${order.id}`);
      return order;
    }
  }
  console.log(`🔍 Mock order not found for payment: ${expectedFrom} -> ${payTo}`);
  return null;
}

export function getMockOrdersCount(): number {
  return mockOrders.size;
}

export function clearMockOrders(): void {
  mockOrders.clear();
  console.log('🗑️ Mock orders cleared');
}
