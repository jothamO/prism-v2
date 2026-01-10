-- Seed data for education_articles
INSERT INTO public.education_articles (title, slug, description, content, category, read_time, difficulty, tags, is_published, published_at) VALUES
('Understanding VAT in Nigeria', 'understanding-vat-nigeria', 'Learn what VAT is and how it affects your business transactions in Nigeria', 'VAT (Value Added Tax) is a consumption tax levied on goods and services in Nigeria. The current VAT rate is 7.5%.

## Who Must Register for VAT?

All businesses with an annual turnover of ₦25 million or more must register for VAT with the Federal Inland Revenue Service (FIRS).

## VAT-Exempt Items

Some goods and services are exempt from VAT, including:
- Basic food items
- Medical and pharmaceutical products
- Books and educational materials
- Baby products

## How to Calculate VAT

VAT is calculated as 7.5% of the value of goods or services:
- VAT = Price × 0.075', 'vat', '5 min', 'beginner', ARRAY['vat', 'tax', 'basics'], true, now()),

('EMTL: Electronic Money Transfer Levy Explained', 'emtl-electronic-money-transfer-levy', 'Everything you need to know about the Electronic Money Transfer Levy (EMTL) in Nigeria', 'The Electronic Money Transfer Levy (EMTL) is a tax on electronic money transfers in Nigeria.

## What is EMTL?

EMTL is a ₦50 flat charge on electronic transfers of ₦10,000 and above. It was introduced by the Finance Act 2020.

## When Does EMTL Apply?

- Bank transfers of ₦10,000 or more
- Mobile money transfers
- POS transactions above the threshold

## Exemptions

The following are exempt from EMTL:
- Transfers between accounts of the same owner
- Loan disbursements and repayments
- Salary payments', 'basics', '3 min', 'beginner', ARRAY['emtl', 'electronic-transfer', 'tax'], true, now()),

('PAYE Tax Guide for Employers', 'paye-tax-guide-employers', 'Comprehensive guide on calculating and remitting PAYE taxes for your employees', 'Pay As You Earn (PAYE) is a method of income tax collection in Nigeria where employers deduct tax from employee salaries.

## PAYE Tax Rates

Nigeria uses a graduated tax rate:
| Annual Income | Tax Rate |
|---------------|----------|
| First ₦300,000 | 7% |
| Next ₦300,000 | 11% |
| Next ₦500,000 | 15% |
| Next ₦500,000 | 19% |
| Next ₦1,600,000 | 21% |
| Above ₦3,200,000 | 24% |

## Employer Obligations

1. Register with the State Internal Revenue Service
2. Deduct PAYE from employee salaries monthly
3. Remit deductions by the 10th of the following month
4. File annual returns by January 31st', 'paye', '7 min', 'intermediate', ARRAY['paye', 'employers', 'salary'], true, now()),

('Tax Deductions for Small Businesses', 'tax-deductions-small-businesses', 'Maximize your legitimate tax deductions as a small business owner', 'Understanding allowable deductions can significantly reduce your tax liability.

## Common Deductible Expenses

1. **Office Rent** - Full rent payments for business premises
2. **Salaries and Wages** - Employee compensation including benefits
3. **Utilities** - Electricity, water, internet for business
4. **Professional Fees** - Accountants, lawyers, consultants
5. **Marketing Costs** - Advertising and promotional expenses
6. **Depreciation** - Wear and tear on business assets

## Non-Deductible Expenses

- Personal expenses
- Fines and penalties
- Entertainment (limited)
- Capital expenditure (but depreciation is allowed)', 'deductions', '6 min', 'intermediate', ARRAY['deductions', 'small-business', 'expenses'], true, now()),

('Company Income Tax Basics', 'company-income-tax-basics', 'Understanding CIT for Nigerian businesses of all sizes', 'Company Income Tax (CIT) is the tax paid by companies on their annual profits in Nigeria.

## CIT Rates

| Company Size | Annual Turnover | CIT Rate |
|--------------|-----------------|----------|
| Small | Below ₦25 million | 0% |
| Medium | ₦25-100 million | 20% |
| Large | Above ₦100 million | 30% |

## Filing Deadlines

- 6 months after the end of the financial year
- Self-assessment returns are due within 6 months
- Penalty: 10% of tax due plus interest', 'business', '5 min', 'beginner', ARRAY['cit', 'company-tax', 'corporate'], true, now()),

('Withholding Tax Explained', 'withholding-tax-explained', 'When and how to apply Withholding Tax (WHT) in Nigeria', 'Withholding Tax is an advance payment of income tax deducted at source.

## WHT Rates

| Transaction Type | Rate |
|------------------|------|
| Dividends | 10% |
| Interest | 10% |
| Rent | 10% |
| Royalties | 10% |
| Contracts/Services | 5% |
| Professional Fees | 10% |

## Who Must Deduct WHT?

- Companies paying other companies
- Government agencies making payments
- Individuals in some cases

## Remittance

WHT must be remitted within 21 days of deduction to avoid penalties.', 'basics', '5 min', 'intermediate', ARRAY['wht', 'withholding', 'deduction'], true, now()),

('Filing Your Annual Tax Returns', 'filing-annual-tax-returns', 'Step-by-step guide to filing your tax returns correctly and on time', 'Filing accurate tax returns is essential for tax compliance in Nigeria.

## Individual Tax Returns

1. **Gather Documents** - Income statements, receipts, bank statements
2. **Calculate Total Income** - Salary, business income, investments
3. **Apply Deductions** - Allowable expenses and reliefs
4. **Compute Tax Liability** - Using graduated tax rates
5. **File Returns** - Via FIRS portal or state tax office
6. **Pay Balance Due** - Clear any outstanding tax

## Key Deadlines

- Employment income: March 31st
- Self-employed: June 30th
- Companies: 6 months after year end

## Required Documents

- TIN (Tax Identification Number)
- Previous year''s returns
- Bank statements
- Receipts and invoices', 'compliance', '8 min', 'beginner', ARRAY['filing', 'returns', 'deadline'], true, now()),

('VAT Registration Requirements', 'vat-registration-requirements', 'Who needs to register for VAT and how to complete the process', 'VAT registration is mandatory for qualifying businesses in Nigeria.

## Who Must Register?

- Businesses with annual turnover ≥ ₦25 million
- Manufacturers and importers
- Service providers above threshold

## Registration Process

1. Obtain TIN from FIRS
2. Complete VAT registration form
3. Submit supporting documents:
   - Certificate of Incorporation
   - Memorandum and Articles
   - Board Resolution
   - Utility Bill
4. Await approval (usually 2-4 weeks)

## Post-Registration Obligations

- Issue VAT invoices
- Maintain proper records
- File monthly VAT returns by 21st
- Remit collected VAT to FIRS', 'vat', '4 min', 'beginner', ARRAY['vat', 'registration', 'firs'], true, now());

-- Seed data for transaction_patterns
INSERT INTO public.transaction_patterns (pattern, pattern_type, category, subcategory, merchant_type, confidence, match_count, is_active, priority, source) VALUES
('UBER|BOLT|TAXIFY|INDRIVE', 'regex', 'transport', 'rideshare', 'rideshare', 0.95, 1250, true, 100, 'manual'),
('MTN|AIRTEL|GLO|9MOBILE|ETISALAT', 'regex', 'utilities', 'telecom', 'telecom', 0.92, 890, true, 100, 'manual'),
('NETFLIX|SPOTIFY|AMAZON PRIME|DSTV|SHOWMAX', 'regex', 'entertainment', 'subscription', 'streaming', 0.98, 450, true, 100, 'manual'),
('SHOPRITE|SPAR|JUSTRITE|MARKET SQUARE', 'regex', 'groceries', 'supermarket', 'grocery', 0.94, 780, true, 100, 'manual'),
('JUMIA|KONGA|PAYPORTE|JIJI', 'regex', 'shopping', 'ecommerce', 'marketplace', 0.91, 320, true, 100, 'manual'),
('IKEDC|EKEDC|AEDC|PHED|KEDCO|BEDC', 'regex', 'utilities', 'electricity', 'utility', 0.97, 650, true, 100, 'manual'),
('DSTV|GOTV|STARTIMES', 'regex', 'entertainment', 'tv', 'cable_tv', 0.96, 420, true, 100, 'manual'),
('DANGOTE|BUA|LAFARGE|FLOUR MILLS', 'regex', 'supplies', 'materials', 'supplier', 0.88, 180, true, 90, 'manual'),
('CHICKEN REPUBLIC|KFC|DOMINOS|DEBONAIRS|KILIMANJARO', 'regex', 'food', 'restaurant', 'fast_food', 0.93, 560, true, 100, 'manual'),
('GTBANK|ACCESS BANK|ZENITH|UBA|FIRST BANK|STANBIC', 'regex', 'transfer', 'bank_transfer', 'bank', 0.85, 2100, true, 80, 'manual'),
('AMAZON|ALIBABA|ALIEXPRESS', 'regex', 'shopping', 'international', 'marketplace', 0.90, 150, true, 100, 'manual'),
('SALARY|WAGES|PAYROLL|STIPEND', 'contains', 'income', 'employment', 'salary', 0.95, 890, true, 100, 'manual'),
('RENT|LEASE|LANDLORD|HOUSE RENT', 'contains', 'rent', 'property', 'rental', 0.92, 340, true, 100, 'manual'),
('INSURANCE|PREMIUM|AXA|LEADWAY|AIICO', 'contains', 'insurance', 'payment', 'insurance', 0.94, 210, true, 100, 'manual'),
('LOAN|REPAYMENT|INTEREST|DISBURSEMENT', 'contains', 'loan', 'finance', 'lending', 0.91, 180, true, 100, 'manual');