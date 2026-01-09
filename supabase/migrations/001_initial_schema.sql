-- =====================================================
-- PRISM V2 - Initial Database Schema
-- Single comprehensive migration with ALL tables
-- =====================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- =====================================================
-- 1. USERS & AUTH
-- =====================================================

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    phone TEXT,
    onboarding_complete BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles
CREATE TABLE IF NOT EXISTS public.user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'admin', 'accountant', 'owner')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- =====================================================
-- 2. TEAMS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.teams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES public.users(id),
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'member', 'accountant')),
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked')),
    invited_by UUID REFERENCES public.users(id),
    invite_token TEXT,
    joined_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 3. BANKING
-- =====================================================

CREATE TABLE IF NOT EXISTS public.bank_connections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mono_id TEXT UNIQUE NOT NULL,
    account_name TEXT,
    account_number TEXT,
    bank_name TEXT,
    bank_code TEXT,
    account_type TEXT,
    balance DECIMAL(15,2),
    currency TEXT DEFAULT 'NGN',
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'reauth_required')),
    last_sync_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.bank_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    bank_connection_id UUID REFERENCES public.bank_connections(id) ON DELETE SET NULL,
    mono_id TEXT UNIQUE,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('credit', 'debit')),
    category TEXT,
    transaction_date DATE NOT NULL,
    balance_after DECIMAL(15,2),
    -- Classification
    classification_source TEXT CHECK (classification_source IN ('manual', 'ai', 'pattern', 'history')),
    classification_confidence DECIMAL(3,2),
    classification_reasoning TEXT,
    needs_review BOOLEAN DEFAULT false,
    -- Metadata
    raw_data JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 4. TAX
-- =====================================================

CREATE TABLE IF NOT EXISTS public.tax_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tax_year INTEGER NOT NULL,
    business_type TEXT CHECK (business_type IN ('individual', 'sole_proprietor', 'llc', 'corporation')),
    tin TEXT, -- Tax Identification Number
    estimated_annual_income DECIMAL(15,2),
    estimated_tax_liability DECIMAL(15,2),
    compliance_score INTEGER DEFAULT 0,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, tax_year)
);

CREATE TABLE IF NOT EXISTS public.tax_filings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    tax_profile_id UUID REFERENCES public.tax_profiles(id) ON DELETE SET NULL,
    filing_type TEXT NOT NULL CHECK (filing_type IN ('pit', 'vat', 'cit', 'wht', 'paye')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    due_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'filed', 'approved', 'rejected')),
    amount DECIMAL(15,2),
    filed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 5. COMPLIANCE
-- =====================================================

CREATE TABLE IF NOT EXISTS public.regulatory_bodies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    previous_names TEXT[],
    website_url TEXT,
    jurisdiction TEXT,
    authority_scope TEXT[],
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    regulatory_body_id UUID REFERENCES public.regulatory_bodies(id),
    document_type TEXT NOT NULL CHECK (document_type IN ('act', 'regulation', 'circular', 'practice_note', 'guideline', 'court_ruling', 'treaty')),
    title TEXT NOT NULL,
    official_reference TEXT,
    version TEXT NOT NULL DEFAULT '1.0',
    supersedes_id UUID REFERENCES public.legal_documents(id),
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'amended', 'repealed')),
    effective_date DATE,
    publication_date DATE,
    repeal_date DATE,
    original_file_url TEXT,
    extracted_text TEXT,
    summary TEXT,
    key_provisions TEXT[],
    affected_taxpayers TEXT[],
    tax_types TEXT[],
    review_status TEXT DEFAULT 'pending' CHECK (review_status IN ('pending', 'approved', 'rejected', 'auto_approved')),
    review_notes TEXT,
    uploaded_by UUID REFERENCES auth.users(id),
    reviewed_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.legal_provisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    section_number TEXT,
    title TEXT,
    provision_text TEXT NOT NULL,
    provision_type TEXT CHECK (provision_type IN ('definition', 'rate', 'exemption', 'penalty', 'procedure', 'threshold')),
    applies_to TEXT[],
    tax_impact TEXT CHECK (tax_impact IN ('increases_liability', 'decreases_liability', 'neutral', 'procedural')),
    plain_language_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES public.legal_documents(id) ON DELETE SET NULL,
    provision_id UUID REFERENCES public.legal_provisions(id) ON DELETE SET NULL,
    rule_name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('tax_rate', 'threshold', 'exemption', 'filing_deadline', 'penalty', 'tax_band', 'vat_rate', 'emtl', 'relief')),
    conditions JSONB NOT NULL,
    outcome JSONB NOT NULL,
    applies_to_transactions BOOLEAN DEFAULT false,
    applies_to_filing BOOLEAN DEFAULT false,
    validation_status TEXT DEFAULT 'pending' CHECK (validation_status IN ('pending', 'validated', 'rejected')),
    is_active BOOLEAN DEFAULT false,
    effective_from DATE,
    effective_until DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_change_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    change_type TEXT NOT NULL CHECK (change_type IN ('insert', 'update', 'delete')),
    old_values JSONB,
    new_values JSONB,
    change_reason TEXT,
    changed_by UUID REFERENCES auth.users(id),
    source_document_id UUID REFERENCES public.legal_documents(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 6. GAP TRACKING (Claude Code Integration)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.compliance_extraction_gaps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    rule_id UUID REFERENCES public.compliance_rules(id) ON DELETE SET NULL,
    gap_category TEXT NOT NULL CHECK (gap_category IN (
        'effective_date', 'fee_extraction', 'rule_logic', 'missing_rule',
        'extra_rule', 'cross_reference', 'rule_type_misclassification',
        'data_structure', 'metadata_missing'
    )),
    gap_description TEXT NOT NULL,
    expected_value JSONB,
    actual_value JSONB,
    circular_quote TEXT,
    is_recurring BOOLEAN DEFAULT false,
    occurrence_count INTEGER DEFAULT 1,
    related_gap_ids UUID[],
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('high', 'medium', 'low')),
    status TEXT DEFAULT 'identified' CHECK (status IN ('identified', 'fixing', 'fixed', 'wont_fix')),
    fix_type TEXT CHECK (fix_type IN (
        'manual_correction', 'prompt_improvement', 'validation_rule',
        'template_creation', 'schema_change', 'ui_enhancement'
    )),
    fix_description TEXT,
    fixed_at TIMESTAMPTZ,
    fixed_by UUID REFERENCES auth.users(id),
    review_time_minutes INTEGER,
    fix_time_minutes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_gap_patterns (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pattern_name TEXT NOT NULL UNIQUE,
    gap_category TEXT NOT NULL,
    description TEXT NOT NULL,
    example_circular_quote TEXT,
    total_occurrences INTEGER DEFAULT 0,
    circulars_affected UUID[],
    last_seen_at TIMESTAMPTZ,
    suggested_fix_type TEXT,
    fix_implementation_status TEXT DEFAULT 'not_started' CHECK (fix_implementation_status IN (
        'not_started', 'in_progress', 'completed', 'monitoring'
    )),
    claude_code_prompt TEXT,
    fix_pr_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.compliance_extraction_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID NOT NULL REFERENCES public.legal_documents(id) ON DELETE CASCADE,
    provisions_extracted INTEGER NOT NULL,
    rules_generated INTEGER NOT NULL,
    gaps_found INTEGER DEFAULT 0,
    high_priority_gaps INTEGER DEFAULT 0,
    ai_extraction_seconds INTEGER,
    manual_review_minutes INTEGER,
    extraction_accuracy_percent DECIMAL(5,2),
    measured_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 7. NOTIFICATIONS
-- =====================================================

CREATE TABLE IF NOT EXISTS public.compliance_notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    notification_type TEXT NOT NULL CHECK (notification_type IN (
        'rate_change', 'deadline_reminder', 'filing_update',
        'document_update', 'system_alert'
    )),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high')),
    is_read BOOLEAN DEFAULT false,
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- 8. INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_users_auth_id ON public.users(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team ON public.team_members(team_id);
CREATE INDEX IF NOT EXISTS idx_team_members_user ON public.team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_user ON public.bank_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_date ON public.bank_transactions(transaction_date);
CREATE INDEX IF NOT EXISTS idx_bank_transactions_category ON public.bank_transactions(category);
CREATE INDEX IF NOT EXISTS idx_tax_profiles_user ON public.tax_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_body ON public.legal_documents(regulatory_body_id);
CREATE INDEX IF NOT EXISTS idx_legal_documents_status ON public.legal_documents(status);
CREATE INDEX IF NOT EXISTS idx_compliance_rules_active ON public.compliance_rules(is_active);
CREATE INDEX IF NOT EXISTS idx_gaps_document ON public.compliance_extraction_gaps(document_id);
CREATE INDEX IF NOT EXISTS idx_gaps_status ON public.compliance_extraction_gaps(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.compliance_notifications(user_id, is_read);

-- =====================================================
-- 9. ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tax_filings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_notifications ENABLE ROW LEVEL SECURITY;

-- User can read own data
CREATE POLICY "Users can read own data" ON public.users
    FOR SELECT USING (auth.uid() = auth_user_id);

-- Users can read own transactions
CREATE POLICY "Users can read own transactions" ON public.bank_transactions
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Admin access helper function
CREATE OR REPLACE FUNCTION public.has_role(user_id UUID, required_role TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_roles ur
        JOIN public.users u ON ur.user_id = u.id
        WHERE u.auth_user_id = user_id AND ur.role = required_role
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- 10. SEED DATA
-- =====================================================

INSERT INTO public.regulatory_bodies (code, full_name, previous_names, jurisdiction, authority_scope)
VALUES
    ('NRS', 'Nigeria Revenue Service', ARRAY['FIRS'], 'federal', ARRAY['income_tax', 'vat', 'cit', 'wht']),
    ('CBN', 'Central Bank of Nigeria', ARRAY[]::TEXT[], 'federal', ARRAY['emtl', 'banking']),
    ('JRB', 'Joint Revenue Board', ARRAY['JTB'], 'federal', ARRAY['paye', 'tax_coordination']),
    ('SEC', 'Securities and Exchange Commission', ARRAY[]::TEXT[], 'federal', ARRAY['cgt', 'securities']),
    ('CAC', 'Corporate Affairs Commission', ARRAY[]::TEXT[], 'federal', ARRAY['company_registration']),
    ('NDPR', 'Nigeria Data Protection Regulation', ARRAY[]::TEXT[], 'federal', ARRAY['data_protection'])
ON CONFLICT (code) DO NOTHING;
