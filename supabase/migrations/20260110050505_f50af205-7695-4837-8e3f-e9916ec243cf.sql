-- Add missing columns to users table for V1 migration compatibility
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_type TEXT DEFAULT 'individual';
ALTER TABLE users ADD COLUMN IF NOT EXISTS state TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS tin TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nin TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS bvn TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cac_number TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 1;
ALTER TABLE users ADD COLUMN IF NOT EXISTS kyc_level INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending';

-- Add migration tracking columns to connection tables
ALTER TABLE telegram_connections ADD COLUMN IF NOT EXISTS migrated_from_v1 BOOLEAN DEFAULT FALSE;
ALTER TABLE whatsapp_connections ADD COLUMN IF NOT EXISTS migrated_from_v1 BOOLEAN DEFAULT FALSE;
ALTER TABLE bank_connections ADD COLUMN IF NOT EXISTS migrated_from_v1 BOOLEAN DEFAULT FALSE;

-- Create transactions table for migration
CREATE TABLE IF NOT EXISTS transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id TEXT,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL,
    transaction_date DATE NOT NULL,
    category TEXT,
    subcategory TEXT,
    source TEXT DEFAULT 'manual',
    categorization_status TEXT DEFAULT 'pending',
    confidence DECIMAL(3,2),
    metadata JSONB DEFAULT '{}',
    bank_connection_id UUID REFERENCES bank_connections(id),
    migrated_from_v1 BOOLEAN DEFAULT FALSE,
    v1_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);

-- Enable RLS on transactions
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
    ON transactions FOR SELECT
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can insert own transactions"
    ON transactions FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own transactions"
    ON transactions FOR UPDATE
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own transactions"
    ON transactions FOR DELETE
    USING (user_id IN (SELECT id FROM users WHERE auth_user_id = auth.uid()));

-- Enable realtime for transactions
ALTER PUBLICATION supabase_realtime ADD TABLE transactions;