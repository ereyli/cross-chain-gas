-- Cross-Chain Gas Top-Up Database Schema
-- Bu SQL kodunu Supabase SQL Editor'da çalıştırın

-- Orders table - tüm siparişleri saklıyor
CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  status TEXT NOT NULL CHECK (status IN ('AWAITING_PAYMENT', 'PAID', 'FULFILLING', 'DONE', 'REFUNDED', 'EXPIRED', 'UNDERPAID')),
  payer_address TEXT NOT NULL,
  source_chain TEXT NOT NULL CHECK (source_chain IN ('base', 'op', 'arb')),
  source_asset TEXT NOT NULL CHECK (source_asset IN ('ETH', 'USDC', 'USDT')),
  target_chain TEXT NOT NULL CHECK (target_chain IN ('base', 'op', 'arb')),
  target_recipient TEXT NOT NULL,
  target_amount_usd NUMERIC(6,2) NOT NULL CHECK (target_amount_usd >= 1.00 AND target_amount_usd <= 10.00),
  pay_to TEXT NOT NULL,
  expected_from TEXT NOT NULL,
  exact_token_addr TEXT, -- null for ETH
  exact_amount_raw TEXT NOT NULL, -- wei or token units as string
  expires_at TIMESTAMPTZ NOT NULL,
  source_tx TEXT,
  target_tx TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  paid_at TIMESTAMPTZ,
  fulfilled_at TIMESTAMPTZ
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_orders_expected ON orders (expected_from, status);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);
CREATE INDEX IF NOT EXISTS idx_orders_expires ON orders (expires_at);
CREATE INDEX IF NOT EXISTS idx_orders_pay_to ON orders (pay_to, status);

-- RLS (Row Level Security) policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Service role can do everything
CREATE POLICY "Service role can manage orders" ON orders
  FOR ALL USING (auth.role() = 'service_role');

-- Optional: Read-only access for authenticated users to their own orders
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT USING (auth.uid()::text = payer_address);

-- Create a function to clean up expired orders (optional)
CREATE OR REPLACE FUNCTION cleanup_expired_orders()
RETURNS void AS $$
BEGIN
  UPDATE orders 
  SET status = 'EXPIRED' 
  WHERE status = 'AWAITING_PAYMENT' 
    AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up automatic cleanup (runs every hour)
-- SELECT cron.schedule('cleanup-expired-orders', '0 * * * *', 'SELECT cleanup_expired_orders();');
