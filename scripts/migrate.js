const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const migration = `
-- Create orders table
create table if not exists orders (
  id uuid primary key,
  status text not null, -- AWAITING_PAYMENT | PAID | FULFILLING | DONE | REFUNDED | EXPIRED | UNDERPAID
  payer_address text not null,
  source_chain text not null,         -- base | op | arb
  source_asset text not null,         -- ETH | USDC | USDT
  target_chain text not null,         -- base | op | arb
  target_recipient text not null,
  target_amount_usd numeric(6,2) not null,
  pay_to text not null,
  expected_from text not null,
  exact_token_addr text,              -- null for ETH
  exact_amount_raw text not null,     -- wei or token units as string
  expires_at timestamptz not null,
  source_tx text,
  target_tx text,
  created_at timestamptz default now(),
  paid_at timestamptz,
  fulfilled_at timestamptz
);

-- Create indexes
create index if not exists idx_orders_expected on orders (expected_from, status);
create index if not exists idx_orders_created on orders (created_at);
create index if not exists idx_orders_status on orders (status);
create index if not exists idx_orders_expires on orders (expires_at);

-- Add constraints
alter table orders add constraint chk_status 
  check (status in ('AWAITING_PAYMENT', 'PAID', 'FULFILLING', 'DONE', 'REFUNDED', 'EXPIRED', 'UNDERPAID'));

alter table orders add constraint chk_source_chain 
  check (source_chain in ('base', 'op', 'arb'));

alter table orders add constraint chk_target_chain 
  check (target_chain in ('base', 'op', 'arb'));

alter table orders add constraint chk_source_asset 
  check (source_asset in ('ETH', 'USDC', 'USDT'));

alter table orders add constraint chk_amount_range 
  check (target_amount_usd >= 1.00 and target_amount_usd <= 10.00);
`;

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    const { error } = await supabase.rpc('exec_sql', { sql: migration });
    
    if (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
    
    console.log('Migration completed successfully!');
  } catch (err) {
    console.error('Migration error:', err);
    process.exit(1);
  }
}

runMigration();
