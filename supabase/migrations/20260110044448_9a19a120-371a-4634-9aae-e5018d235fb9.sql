-- =====================================================
-- PRISM V2 - Missing Database Tables Migration
-- Creates: telegram_connections, whatsapp_connections, 
--          education_articles, system_logs, transaction_patterns
-- =====================================================

-- 1. TELEGRAM CONNECTIONS TABLE
CREATE TABLE public.telegram_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    telegram_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    username TEXT,
    first_name TEXT,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT telegram_connections_telegram_id_key UNIQUE (telegram_id)
);

-- Enable RLS
ALTER TABLE public.telegram_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telegram_connections
CREATE POLICY "Users can view own telegram connections"
    ON public.telegram_connections FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create telegram connections"
    ON public.telegram_connections FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own telegram connections"
    ON public.telegram_connections FOR UPDATE
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own telegram connections"
    ON public.telegram_connections FOR DELETE
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_telegram_connections_user_id ON public.telegram_connections(user_id);
CREATE INDEX idx_telegram_connections_telegram_id ON public.telegram_connections(telegram_id);

-- 2. WHATSAPP CONNECTIONS TABLE
CREATE TABLE public.whatsapp_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    phone_number TEXT NOT NULL,
    whatsapp_id TEXT,
    verified BOOLEAN DEFAULT FALSE,
    connected_at TIMESTAMPTZ DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT whatsapp_connections_phone_key UNIQUE (phone_number)
);

-- Enable RLS
ALTER TABLE public.whatsapp_connections ENABLE ROW LEVEL SECURITY;

-- RLS Policies for whatsapp_connections
CREATE POLICY "Users can view own whatsapp connections"
    ON public.whatsapp_connections FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create whatsapp connections"
    ON public.whatsapp_connections FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can update own whatsapp connections"
    ON public.whatsapp_connections FOR UPDATE
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can delete own whatsapp connections"
    ON public.whatsapp_connections FOR DELETE
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Index for faster lookups
CREATE INDEX idx_whatsapp_connections_user_id ON public.whatsapp_connections(user_id);

-- 3. EDUCATION ARTICLES TABLE
CREATE TABLE public.education_articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    content TEXT,
    category TEXT NOT NULL,
    read_time TEXT,
    difficulty TEXT DEFAULT 'beginner',
    tags TEXT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT FALSE,
    published_at TIMESTAMPTZ,
    author_id UUID REFERENCES public.users(id),
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.education_articles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for education_articles
CREATE POLICY "Anyone can view published articles"
    ON public.education_articles FOR SELECT
    USING (is_published = TRUE);

CREATE POLICY "Admins can manage all articles"
    ON public.education_articles FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Index for faster queries
CREATE INDEX idx_education_articles_category ON public.education_articles(category);
CREATE INDEX idx_education_articles_slug ON public.education_articles(slug);
CREATE INDEX idx_education_articles_published ON public.education_articles(is_published) WHERE is_published = TRUE;

-- 4. SYSTEM LOGS TABLE
CREATE TABLE public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error', 'critical')),
    category TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}',
    user_id UUID REFERENCES public.users(id),
    session_id TEXT,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for system_logs (admin only)
CREATE POLICY "Admins can view all logs"
    ON public.system_logs FOR SELECT
    USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert logs"
    ON public.system_logs FOR INSERT
    WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Index for faster queries
CREATE INDEX idx_system_logs_level ON public.system_logs(level);
CREATE INDEX idx_system_logs_category ON public.system_logs(category);
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);

-- 5. TRANSACTION PATTERNS TABLE
CREATE TABLE public.transaction_patterns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pattern TEXT NOT NULL,
    pattern_type TEXT DEFAULT 'contains' CHECK (pattern_type IN ('contains', 'regex', 'exact', 'starts_with')),
    category TEXT NOT NULL,
    subcategory TEXT,
    merchant_type TEXT,
    confidence DECIMAL(3,2) DEFAULT 0.90 CHECK (confidence >= 0 AND confidence <= 1),
    match_count INTEGER DEFAULT 0,
    last_matched_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    priority INTEGER DEFAULT 100,
    source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'learned', 'imported')),
    created_by UUID REFERENCES public.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.transaction_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies for transaction_patterns
CREATE POLICY "Anyone can view active patterns"
    ON public.transaction_patterns FOR SELECT
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage all patterns"
    ON public.transaction_patterns FOR ALL
    USING (public.has_role(auth.uid(), 'admin'));

-- Index for pattern matching (using existing pg_trgm extension)
CREATE INDEX idx_transaction_patterns_pattern ON public.transaction_patterns USING gin(pattern gin_trgm_ops);
CREATE INDEX idx_transaction_patterns_category ON public.transaction_patterns(category);
CREATE INDEX idx_transaction_patterns_active ON public.transaction_patterns(is_active) WHERE is_active = TRUE;

-- 6. TELEGRAM TOKENS TABLE (for linking flow)
CREATE TABLE public.telegram_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    token TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.telegram_tokens ENABLE ROW LEVEL SECURITY;

-- RLS Policies for telegram_tokens
CREATE POLICY "Users can view own tokens"
    ON public.telegram_tokens FOR SELECT
    USING (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

CREATE POLICY "Users can create tokens"
    ON public.telegram_tokens FOR INSERT
    WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid()));

-- Index for token lookup
CREATE INDEX idx_telegram_tokens_token ON public.telegram_tokens(token);
CREATE INDEX idx_telegram_tokens_expires ON public.telegram_tokens(expires_at) WHERE used = FALSE;