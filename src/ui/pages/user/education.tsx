// =====================================================
// PRISM V2 - Education Center Page
// Tax education articles and resources
// =====================================================

import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Card, SearchInput, Button } from '@/ui/components';

interface EducationArticle {
    id: string;
    slug: string;
    title: string;
    description: string;
    category: string;
    read_time: string;
    content: string;
}

const CATEGORIES = [
    { id: 'all', label: 'All', icon: '📚' },
    { id: 'basics', label: 'Basics', icon: '❓' },
    { id: 'vat', label: 'VAT', icon: '🧾' },
    { id: 'paye', label: 'PAYE', icon: '🧮' },
    { id: 'business', label: 'Business', icon: '🏢' },
    { id: 'deductions', label: 'Deductions', icon: '📄' },
    { id: 'compliance', label: 'Compliance', icon: '🎓' },
];

const CATEGORY_COLORS: Record<string, string> = {
    basics: 'bg-gray-100 text-gray-700',
    vat: 'bg-green-100 text-green-700',
    paye: 'bg-blue-100 text-blue-700',
    business: 'bg-purple-100 text-purple-700',
    deductions: 'bg-orange-100 text-orange-700',
    compliance: 'bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)]',
};

// Default articles until database is connected
const DEFAULT_ARTICLES: EducationArticle[] = [
    {
        id: '1',
        slug: 'what-is-vat',
        title: 'Understanding VAT in Nigeria',
        description: 'Learn how Value Added Tax works under the Nigeria Tax Act 2025',
        category: 'vat',
        read_time: '5 min',
        content: '## What is VAT?\n\nValue Added Tax (VAT) is a consumption tax levied at 7.5% on goods and services in Nigeria.\n\n## Who Pays VAT?\n\nBusinesses with turnover above ₦25 million must register for and remit VAT.\n\n## How to Calculate\n\nVAT = Sale Price × 7.5%\n\nFor example, if you sell an item for ₦10,000:\nVAT = ₦10,000 × 0.075 = ₦750',
    },
    {
        id: '2',
        slug: 'what-is-emtl',
        title: 'Electronic Money Transfer Levy (EMTL)',
        description: 'Understanding the ₦50 charge on bank transfers',
        category: 'basics',
        read_time: '3 min',
        content: '## What is EMTL?\n\nElectronic Money Transfer Levy is a ₦50 flat charge on electronic fund transfers of ₦10,000 or more.\n\n## Exemptions\n\n- Intra-bank transfers\n- Salary payments\n- Government payments',
    },
    {
        id: '3',
        slug: 'paye-explained',
        title: 'Pay As You Earn (PAYE)',
        description: 'How income tax is deducted from your salary',
        category: 'paye',
        read_time: '7 min',
        content: '## What is PAYE?\n\nPAYE is a system where your employer deducts income tax from your salary before paying you.\n\n## Tax Bands (2025)\n\n- First ₦300,000: 7%\n- Next ₦300,000: 11%\n- Next ₦500,000: 15%\n- Next ₦500,000: 19%\n- Next ₦1,600,000: 21%\n- Above ₦3,200,000: 24%',
    },
    {
        id: '4',
        slug: 'business-registration',
        title: 'Registering Your Business for Tax',
        description: 'Step-by-step guide to CAC and FIRS registration',
        category: 'business',
        read_time: '10 min',
        content: '## Step 1: CAC Registration\n\nRegister your business with the Corporate Affairs Commission.\n\n## Step 2: TIN Application\n\nApply for a Tax Identification Number (TIN) at FIRS.\n\n## Step 3: VAT Registration\n\nIf your turnover exceeds ₦25 million, register for VAT.',
    },
    {
        id: '5',
        slug: 'allowable-deductions',
        title: 'Tax Deductions You Can Claim',
        description: 'Reduce your tax liability legally',
        category: 'deductions',
        read_time: '6 min',
        content: '## Allowable Deductions\n\n### For Individuals\n- Pension contributions (up to 20%)\n- Life insurance premiums\n- National Housing Fund\n- NHIS contributions\n\n### For Businesses\n- Capital allowances\n- Research & development\n- Staff training costs',
    },
    {
        id: '6',
        slug: 'tax-filing-deadlines',
        title: 'Important Tax Filing Deadlines',
        description: 'Never miss a deadline again',
        category: 'compliance',
        read_time: '4 min',
        content: '## Key Deadlines\n\n### Monthly\n- VAT: 21st of the following month\n- PAYE: 10th of the following month\n\n### Annual\n- Personal Income Tax: March 31\n- Company Income Tax: 6 months after year-end',
    },
];

export function EducationCenterPage() {
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedArticle, setSelectedArticle] = useState<EducationArticle | null>(null);

    const filteredArticles = useMemo(() => {
        return DEFAULT_ARTICLES.filter(article => {
            const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
            const matchesSearch = searchQuery === '' ||
                article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                article.description.toLowerCase().includes(searchQuery.toLowerCase());
            return matchesCategory && matchesSearch;
        });
    }, [selectedCategory, searchQuery]);

    // Article detail view
    if (selectedArticle) {
        return (
            <div className="pb-20 px-4 pt-6 space-y-6">
                <Button variant="ghost" onClick={() => setSelectedArticle(null)}>
                    ← Back to Articles
                </Button>

                <Card>
                    <div className="flex items-center gap-2 mb-4">
                        <span className={`px-3 py-1 text-xs rounded-full ${CATEGORY_COLORS[selectedArticle.category] || CATEGORY_COLORS.basics}`}>
                            {selectedArticle.category.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500">{selectedArticle.read_time} read</span>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                        {selectedArticle.title}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">
                        {selectedArticle.description}
                    </p>
                    <div className="prose prose-sm dark:prose-invert max-w-none">
                        {selectedArticle.content.split('\n').map((line, i) => {
                            if (line.startsWith('## ')) {
                                return <h2 key={i} className="text-xl font-bold mt-6 mb-3 text-gray-900 dark:text-white">{line.replace('## ', '')}</h2>;
                            }
                            if (line.startsWith('### ')) {
                                return <h3 key={i} className="text-lg font-semibold mt-4 mb-2 text-gray-800 dark:text-gray-200">{line.replace('### ', '')}</h3>;
                            }
                            if (line.startsWith('- ')) {
                                return <li key={i} className="ml-4 text-gray-600 dark:text-gray-400">{line.replace('- ', '')}</li>;
                            }
                            if (line.trim() === '') {
                                return <br key={i} />;
                            }
                            return <p key={i} className="mb-2 text-gray-600 dark:text-gray-400">{line}</p>;
                        })}
                    </div>
                </Card>
            </div>
        );
    }

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Education Center
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Learn about Nigerian tax laws and regulations
                </p>
            </div>

            {/* Search */}
            <SearchInput
                placeholder="Search articles..."
                onSearch={setSearchQuery}
            />

            {/* Categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setSelectedCategory(cat.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${selectedCategory === cat.id
                                ? 'bg-[hsl(248,80%,36%)] text-white'
                                : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                            }`}
                    >
                        <span>{cat.icon}</span>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Articles Grid */}
            <div className="grid gap-4">
                {filteredArticles.length === 0 ? (
                    <Card className="text-center py-12">
                        <span className="text-4xl mb-4 block">📚</span>
                        <p className="text-gray-500">No articles found</p>
                    </Card>
                ) : (
                    filteredArticles.map(article => (
                        <Card
                            key={article.id}
                            hover
                            onClick={() => setSelectedArticle(article)}
                            className="cursor-pointer"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="w-10 h-10 rounded-xl bg-[hsl(248,80%,36%)]/10 flex items-center justify-center">
                                    <span>{CATEGORIES.find(c => c.id === article.category)?.icon ?? '📄'}</span>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${CATEGORY_COLORS[article.category] || CATEGORY_COLORS.basics}`}>
                                    {article.category}
                                </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                                {article.title}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                                {article.description}
                            </p>
                            <div className="flex items-center justify-between text-sm">
                                <span className="text-gray-500">{article.read_time}</span>
                                <span className="text-[hsl(248,80%,36%)]">Read →</span>
                            </div>
                        </Card>
                    ))
                )}
            </div>

            {/* External Resources */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    🔗 Official Resources
                </h3>
                <div className="space-y-3">
                    <Link
                        to="/tax-calendar"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)] transition-colors"
                    >
                        <span className="text-xl">📅</span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">Tax Calendar</p>
                            <p className="text-xs text-gray-500">View upcoming deadlines</p>
                        </div>
                    </Link>
                    <a
                        href="https://taxpromax.firs.gov.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)] transition-colors"
                    >
                        <span className="text-xl">🏛️</span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">FIRS TaxPro Max</p>
                            <p className="text-xs text-gray-500">Official tax filing portal</p>
                        </div>
                    </a>
                    <a
                        href="https://www.firs.gov.ng"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)] transition-colors"
                    >
                        <span className="text-xl">📋</span>
                        <div>
                            <p className="font-medium text-gray-900 dark:text-white">FIRS Website</p>
                            <p className="text-xs text-gray-500">Official resources</p>
                        </div>
                    </a>
                </div>
            </Card>
        </div>
    );
}
