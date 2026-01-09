// =====================================================
// PRISM V2 - Global Constants
// All configuration values in one place
// =====================================================

import { TaxBandConfig } from './types';

// -------------------- TAX BANDS --------------------
export const TAX_BANDS: Record<number, TaxBandConfig> = {
    2024: {
        year: 2024,
        exemption: 300000,
        bands: [
            { floor: 0, ceiling: 300000, rate: 0.07, name: 'Band 1' },
            { floor: 300000, ceiling: 800000, rate: 0.11, name: 'Band 2' },
            { floor: 800000, ceiling: 2400000, rate: 0.15, name: 'Band 3' },
            { floor: 2400000, ceiling: 4000000, rate: 0.19, name: 'Band 4' },
            { floor: 4000000, ceiling: Infinity, rate: 0.24, name: 'Band 5' },
        ],
    },
    2025: {
        year: 2025,
        exemption: 300000,
        bands: [
            { floor: 0, ceiling: 300000, rate: 0.07, name: 'Band 1' },
            { floor: 300000, ceiling: 800000, rate: 0.11, name: 'Band 2' },
            { floor: 800000, ceiling: 2400000, rate: 0.15, name: 'Band 3' },
            { floor: 2400000, ceiling: 4000000, rate: 0.19, name: 'Band 4' },
            { floor: 4000000, ceiling: Infinity, rate: 0.24, name: 'Band 5' },
        ],
    },
    2026: {
        year: 2026,
        exemption: 800000,
        bands: [
            { floor: 0, ceiling: 2200000, rate: 0.15, name: 'Band 1' },
            { floor: 2200000, ceiling: 4800000, rate: 0.19, name: 'Band 2' },
            { floor: 4800000, ceiling: 10400000, rate: 0.21, name: 'Band 3' },
            { floor: 10400000, ceiling: Infinity, rate: 0.24, name: 'Band 4' },
        ],
    },
};

// -------------------- TAX RATES --------------------
export const EMTL_THRESHOLD = 10000; // ₦10,000
export const EMTL_AMOUNT = 50; // ₦50 per transfer
export const VAT_RATE = 0.075; // 7.5%

// -------------------- DATE LIMITS --------------------
export const DATE_FLOOR = '2026-01-01'; // Nigeria Tax Act 2025 effective date

// -------------------- REGULATORY BODIES --------------------
export const REGULATORY_BODIES = {
    NRS: { code: 'NRS', fullName: 'Nigeria Revenue Service', previousNames: ['FIRS'] },
    CBN: { code: 'CBN', fullName: 'Central Bank of Nigeria', previousNames: [] },
    JRB: { code: 'JRB', fullName: 'Joint Revenue Board', previousNames: ['JTB'] },
    SEC: { code: 'SEC', fullName: 'Securities and Exchange Commission', previousNames: [] },
    CAC: { code: 'CAC', fullName: 'Corporate Affairs Commission', previousNames: [] },
    NDPR: { code: 'NDPR', fullName: 'Nigeria Data Protection Regulation', previousNames: [] },
} as const;

// -------------------- CATEGORIES --------------------
export const CATEGORIES = {
    income: {
        salary: { label: 'Salary', taxable: true, vatApplicable: false },
        business_income: { label: 'Business Income', taxable: true, vatApplicable: true },
        investment: { label: 'Investment Returns', taxable: true, vatApplicable: false },
    },
    expense: {
        groceries: { label: 'Groceries', deductible: false, vatReclaimable: false },
        utilities: { label: 'Utilities', deductible: true, vatReclaimable: true },
        transport: { label: 'Transport', deductible: true, vatReclaimable: false },
        bank_charges: { label: 'Bank Charges', deductible: true, vatReclaimable: false },
    },
    neutral: {
        transfer: { label: 'Transfer', taxable: false, vatApplicable: false },
        personal: { label: 'Personal', taxable: false, vatApplicable: false },
    },
} as const;

// -------------------- NIGERIAN PATTERNS --------------------
export const NIGERIAN_TRANSACTION_PATTERNS = [
    { pattern: /^(POS|P\.O\.S)/i, category: 'expense' as const },
    { pattern: /USSD|AIRTIME|DATA/i, category: 'expense' as const },
    { pattern: /NIP|NIBSS/i, category: 'transfer' as const },
    { pattern: /EMTL|E-MONEY TRANSFER/i, category: 'bank_charges' as const },
    { pattern: /SALARY|PAYROLL/i, category: 'salary' as const },
    { pattern: /VAT|VALUE ADDED/i, category: 'bank_charges' as const },
    { pattern: /SMS ALERT|MAINTENANCE FEE|COT|STAMP DUTY/i, category: 'bank_charges' as const },
] as const;
