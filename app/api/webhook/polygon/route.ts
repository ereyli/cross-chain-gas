import { NextRequest, NextResponse } from 'next/server';
import { normalizeWebhookPayload, verifyPayment, isExpectedPayment, validateWebhookSignature } from '../../../../lib/watcher-helpers';
import { findOrderByPayment, updateOrder } from '../../../../lib/db';
import { fulfillOrder } from '../../../../lib/fulfil';
import { isQuoteExpired } from '../../../../lib/quote';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    let payload;
    
    try {
      payload = JSON.parse(body);
    } catch (e) {
      console.error('Invalid JSON payload:', e);
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    const signature = request.headers.get('x-alchemy-signature') || '';
    const webhookSecret = process.env.ALCHEMY_POLYGON_SIGNING_KEY || process.env.ALCHEMY_WEBHOOK_SIGNING_KEY || '';
    
    if (webhookSecret && !validateWebhookSignature(body, signature, webhookSecret)) {
      console.error('Invalid webhook signature');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }
    
    console.log('Polygon webhook received:', JSON.stringify(payload, null, 2));
    
    const payments = normalizeWebhookPayload(payload);
    for (const payment of payments) {
      await processPayment(payment);
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Polygon webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

async function processPayment(payment: any): Promise<void> {
  try {
    const order = await findOrderByPayment(payment.from, payment.to, 'AWAITING_PAYMENT');
    if (!order) {
      console.log(`No matching order found for payment from ${payment.from} to ${payment.to}`);
      return;
    }
    
    if (isQuoteExpired(order.expires_at)) {
      console.log(`Quote expired for order ${order.id}, ignoring payment`);
      return;
    }
    
    const isValid = isExpectedPayment(payment, order.expected_from, order.pay_to, order.exact_amount_raw, order.exact_token_addr || undefined);
    if (!isValid) {
      console.log(`Payment validation failed for order ${order.id}`);
      await updateOrder(order.id, { status: 'UNDERPAID' });
      return;
    }
    
    const isConfirmed = await verifyPayment(payment, 'polygon');
    if (!isConfirmed) {
      console.log(`Payment not yet confirmed for order ${order.id}`);
      return;
    }
    
    await updateOrder(order.id, {
      status: 'PAID',
      source_tx: payment.hash,
      paid_at: new Date().toISOString()
    });
    
    console.log(`Order ${order.id} marked as paid, initiating fulfillment`);
    fulfillOrder(order).catch(error => {
      console.error(`Failed to fulfill order ${order.id}:`, error);
    });
    
  } catch (error) {
    console.error('Error processing payment:', error);
  }
}
