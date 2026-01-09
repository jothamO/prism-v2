// =====================================================
// PRISM V2 - Central Type Registry
// All domain types exported from one place
// =====================================================

// -------------------- AUTH --------------------
export type UserRole = 'user' | 'admin' | 'accountant' | 'owner';

export interface AuthenticatedUser {
    id: string;
    email: string;
    role: UserRole;
    teamId: string | null;
    onboardingComplete: boolean;
    createdAt: Date;
}

export interface AuthState {
    user: AuthenticatedUser | null;
    loading: boolean;
    error: string | null;
}

// -------------------- TAX --------------------
export type TaxYear = 2024 | 2025 | 2026;

export interface TaxBand {
    floor: number;
    ceiling: number;
    rate: number;
    name: string;
}

export interface TaxBandConfig {
    year: TaxYear;
    exemption: number;
    bands: TaxBand[];
}

export interface TaxResult {
    totalTax: number;
    effectiveRate: number;
    breakdown: TaxBandBreakdown[];
}

export interface TaxBandBreakdown {
    band: string;
    taxableAmount: number;
    rate: number;
    tax: number;
}

// -------------------- TRANSACTIONS --------------------
export type TransactionType = 'credit' | 'debit';

export type Category =
    | 'income'
    | 'salary'
    | 'business_income'
    | 'investment'
    | 'expense'
    | 'groceries'
    | 'utilities'
    | 'transport'
    | 'bank_charges'
    | 'transfer'
    | 'personal'
    | 'uncategorized';

export interface Transaction {
    id: string;
    userId: string;
    description: string;
    amount: number;
    type: TransactionType;
    category: Category | null;
    transactionDate: Date;
    bankAccountId: string;
    classificationSource: 'manual' | 'ai' | 'pattern' | null;
    classificationConfidence: number | null;
    createdAt: Date;
}

export interface ClassificationResult {
    category: Category;
    confidence: number;
    source: 'pattern' | 'history' | 'ai';
    reasoning?: string;
}

// -------------------- TEAMS --------------------
export type TeamRole = 'owner' | 'admin' | 'member' | 'accountant';
export type InviteStatus = 'pending' | 'accepted' | 'revoked';

export interface Team {
    id: string;
    name: string;
    ownerId: string;
    createdAt: Date;
}

export interface TeamMember {
    id: string;
    teamId: string;
    userId: string;
    role: TeamRole;
    status: InviteStatus;
    invitedBy: string;
    joinedAt: Date | null;
}

// -------------------- COMPLIANCE --------------------
export type RegulatoryBody = 'NRS' | 'CBN' | 'JRB' | 'SEC' | 'CAC' | 'NDPR';

export type DocumentType =
    | 'act'
    | 'regulation'
    | 'circular'
    | 'practice_note'
    | 'guideline'
    | 'court_ruling'
    | 'treaty';

export type DocumentStatus = 'draft' | 'active' | 'amended' | 'repealed';
export type ReviewStatus = 'pending' | 'approved' | 'rejected';

export interface LegalDocument {
    id: string;
    regulatoryBodyId: string;
    documentType: DocumentType;
    title: string;
    officialReference: string | null;
    status: DocumentStatus;
    reviewStatus: ReviewStatus;
    effectiveDate: Date | null;
    publicationDate: Date | null;
    summary: string | null;
    createdAt: Date;
}

export interface ComplianceRule {
    id: string;
    ruleName: string;
    ruleType: 'tax_rate' | 'threshold' | 'exemption' | 'filing_deadline' | 'penalty' | 'emtl' | 'tax_band';
    conditions: Record<string, unknown>;
    outcome: Record<string, unknown>;
    isActive: boolean;
    effectiveFrom?: string | null;
    effectiveUntil?: string | null;
    createdAt: Date;
}

// -------------------- GAP TRACKING --------------------
export type GapCategory =
    | 'effective_date'
    | 'fee_extraction'
    | 'rule_logic'
    | 'missing_rule'
    | 'extra_rule'
    | 'cross_reference'
    | 'rule_type_misclassification'
    | 'data_structure'
    | 'metadata_missing';

export type GapPriority = 'high' | 'medium' | 'low';
export type GapStatus = 'identified' | 'fixing' | 'fixed' | 'wont_fix';

export interface ExtractionGap {
    id: string;
    documentId: string;
    gapCategory: GapCategory;
    gapDescription: string;
    priority: GapPriority;
    status: GapStatus;
    isRecurring: boolean;
    occurrenceCount: number;
    createdAt: Date;
}
