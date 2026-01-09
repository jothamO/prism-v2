-- =====================================================
-- PRISM V2 - Complete RLS Policies
-- =====================================================

-- Enable RLS on remaining tables
ALTER TABLE public.regulatory_bodies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.legal_provisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_change_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_extraction_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_gap_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.compliance_extraction_metrics ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USER ROLES POLICIES
-- =====================================================

-- Users can view their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- TEAMS POLICIES
-- =====================================================

-- Users can view teams they belong to
CREATE POLICY "Users can view their teams" ON public.teams
    FOR SELECT USING (
        id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND status = 'active'
        )
        OR owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Team owners can update their teams
CREATE POLICY "Owners can update teams" ON public.teams
    FOR UPDATE USING (
        owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Authenticated users can create teams
CREATE POLICY "Users can create teams" ON public.teams
    FOR INSERT WITH CHECK (
        owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- TEAM MEMBERS POLICIES
-- =====================================================

-- Users can view members of teams they belong to
CREATE POLICY "Users can view team members" ON public.team_members
    FOR SELECT USING (
        team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND status = 'active'
        )
    );

-- Team admins/owners can manage members
CREATE POLICY "Admins can manage team members" ON public.team_members
    FOR ALL USING (
        team_id IN (
            SELECT t.id FROM public.teams t
            WHERE t.owner_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
        )
        OR team_id IN (
            SELECT team_id FROM public.team_members 
            WHERE user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
            AND role IN ('owner', 'admin')
            AND status = 'active'
        )
    );

-- =====================================================
-- BANK CONNECTIONS POLICIES
-- =====================================================

-- Users can view their own bank connections
CREATE POLICY "Users can view own bank connections" ON public.bank_connections
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can create their own bank connections
CREATE POLICY "Users can create bank connections" ON public.bank_connections
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can update their own bank connections
CREATE POLICY "Users can update bank connections" ON public.bank_connections
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can delete their own bank connections
CREATE POLICY "Users can delete bank connections" ON public.bank_connections
    FOR DELETE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- BANK TRANSACTIONS POLICIES
-- =====================================================

-- Users can create their own transactions
CREATE POLICY "Users can create transactions" ON public.bank_transactions
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can update their own transactions
CREATE POLICY "Users can update transactions" ON public.bank_transactions
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- TAX PROFILES POLICIES
-- =====================================================

-- Users can view their own tax profiles
CREATE POLICY "Users can view own tax profiles" ON public.tax_profiles
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can create their own tax profiles
CREATE POLICY "Users can create tax profiles" ON public.tax_profiles
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can update their own tax profiles
CREATE POLICY "Users can update tax profiles" ON public.tax_profiles
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- TAX FILINGS POLICIES
-- =====================================================

-- Users can view their own tax filings
CREATE POLICY "Users can view own tax filings" ON public.tax_filings
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can create their own tax filings
CREATE POLICY "Users can create tax filings" ON public.tax_filings
    FOR INSERT WITH CHECK (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can update their own tax filings
CREATE POLICY "Users can update tax filings" ON public.tax_filings
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- COMPLIANCE NOTIFICATIONS POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications" ON public.compliance_notifications
    FOR SELECT USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON public.compliance_notifications
    FOR UPDATE USING (
        user_id IN (SELECT id FROM public.users WHERE auth_user_id = auth.uid())
    );

-- =====================================================
-- PUBLIC READ-ONLY COMPLIANCE DATA
-- (Regulatory info is public, user-specific data is protected)
-- =====================================================

-- Regulatory bodies are publicly readable
CREATE POLICY "Regulatory bodies are public" ON public.regulatory_bodies
    FOR SELECT USING (true);

-- Legal documents are publicly readable
CREATE POLICY "Legal documents are public" ON public.legal_documents
    FOR SELECT USING (true);

-- Legal provisions are publicly readable
CREATE POLICY "Legal provisions are public" ON public.legal_provisions
    FOR SELECT USING (true);

-- Compliance rules are publicly readable
CREATE POLICY "Compliance rules are public" ON public.compliance_rules
    FOR SELECT USING (true);

-- Compliance change log readable by admins only
CREATE POLICY "Admins can view change log" ON public.compliance_change_log
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Gap tracking readable by admins only
CREATE POLICY "Admins can view extraction gaps" ON public.compliance_extraction_gaps
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view gap patterns" ON public.compliance_gap_patterns
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view extraction metrics" ON public.compliance_extraction_metrics
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- ADMIN WRITE POLICIES FOR COMPLIANCE DATA
-- =====================================================

-- Admins can manage regulatory bodies
CREATE POLICY "Admins can manage regulatory bodies" ON public.regulatory_bodies
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage legal documents
CREATE POLICY "Admins can manage legal documents" ON public.legal_documents
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage legal provisions
CREATE POLICY "Admins can manage legal provisions" ON public.legal_provisions
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage compliance rules
CREATE POLICY "Admins can manage compliance rules" ON public.compliance_rules
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage change log
CREATE POLICY "Admins can manage change log" ON public.compliance_change_log
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage extraction gaps
CREATE POLICY "Admins can manage extraction gaps" ON public.compliance_extraction_gaps
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage gap patterns
CREATE POLICY "Admins can manage gap patterns" ON public.compliance_gap_patterns
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Admins can manage extraction metrics
CREATE POLICY "Admins can manage extraction metrics" ON public.compliance_extraction_metrics
    FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =====================================================
-- USER MANAGEMENT POLICIES
-- =====================================================

-- Users can update their own profile
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = auth_user_id);

-- Users can insert their own profile (on signup)
CREATE POLICY "Users can insert own data" ON public.users
    FOR INSERT WITH CHECK (auth.uid() = auth_user_id);