// =====================================================
// PRISM V2 - FAQ Page
// =====================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, SearchInput } from '@/ui/components';

interface FAQItem {
    question: string;
    answer: string;
    category: string;
}

const FAQ_DATA: FAQItem[] = [
    {
        category: 'General',
        question: 'What is PRISM?',
        answer: 'PRISM is an AI-powered tax assistant designed specifically for Nigerian taxpayers. It helps you track transactions, calculate taxes, and stay compliant with Nigerian tax laws.',
    },
    {
        category: 'General',
        question: 'Is PRISM free to use?',
        answer: 'PRISM offers a free tier for basic tax tracking. Premium features like advanced analytics, automated filing, and team collaboration require a subscription.',
    },
    {
        category: 'Banking',
        question: 'How do I connect my bank account?',
        answer: "We use Mono, a secure bank aggregator licensed by the CBN, to connect to Nigerian banks. Your credentials are never stored by PRISM - Mono handles all authentication securely.",
    },
    {
        category: 'Banking',
        question: 'Is my bank data safe?',
        answer: 'Yes. We use bank-grade encryption (AES-256) and are compliant with NDPR. We only access read-only transaction data - we cannot move money from your account.',
    },
    {
        category: 'Tax',
        question: 'What is VAT and how is it calculated?',
        answer: 'VAT (Value Added Tax) in Nigeria is 7.5% charged on goods and services. PRISM automatically identifies VAT-able transactions and calculates your VAT liability.',
    },
    {
        category: 'Tax',
        question: 'What is EMTL?',
        answer: 'Electronic Money Transfer Levy is a ₦50 charge on electronic transfers of ₦10,000 or more. PRISM tracks and reports EMTL on your transactions.',
    },
    {
        category: 'Tax',
        question: 'How do I file my taxes?',
        answer: 'PRISM generates pre-filled tax forms based on your transaction data. You can review these and submit them through FIRS TaxPro Max portal.',
    },
    {
        category: 'Account',
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and enter your email. You\'ll receive a link to reset your password within minutes.',
    },
    {
        category: 'Account',
        question: 'Can I use PRISM on my phone?',
        answer: 'Yes! PRISM is a fully responsive web app that works on any device. We also have Telegram and WhatsApp integration for quick queries on the go.',
    },
];

const CATEGORIES = ['All', 'General', 'Banking', 'Tax', 'Account'];

export function FAQPage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

    const filteredFAQs = FAQ_DATA.filter(faq => {
        const matchesCategory = category === 'All' || faq.category === category;
        const matchesSearch = search === '' ||
            faq.question.toLowerCase().includes(search.toLowerCase()) ||
            faq.answer.toLowerCase().includes(search.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,27%,10%)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white py-16 px-4">
                <div className="max-w-3xl mx-auto text-center">
                    <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
                    <p className="text-white/80 mb-6">Find answers to common questions about PRISM</p>
                    <div className="max-w-md mx-auto">
                        <SearchInput placeholder="Search FAQs..." onSearch={setSearch} />
                    </div>
                </div>
            </div>

            {/* Categories */}
            <div className="max-w-3xl mx-auto px-4 py-6">
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors ${category === cat
                                    ? 'bg-[hsl(248,80%,36%)] text-white'
                                    : 'bg-white dark:bg-[hsl(240,24%,20%)] text-gray-600 dark:text-gray-400'
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* FAQs */}
            <div className="max-w-3xl mx-auto px-4 pb-20 space-y-3">
                {filteredFAQs.length === 0 ? (
                    <Card className="text-center py-12">
                        <span className="text-4xl mb-4 block">🔍</span>
                        <p className="text-gray-500">No FAQs found matching your search</p>
                    </Card>
                ) : (
                    filteredFAQs.map((faq, index) => (
                        <Card
                            key={index}
                            className="cursor-pointer !p-0 overflow-hidden"
                            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
                        >
                            <div className="p-4">
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <span className="text-xs text-[hsl(248,80%,36%)] mb-1 block">{faq.category}</span>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {faq.question}
                                        </h3>
                                    </div>
                                    <span className="text-gray-400 text-xl">
                                        {expandedIndex === index ? '−' : '+'}
                                    </span>
                                </div>
                                {expandedIndex === index && (
                                    <p className="mt-4 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                                        {faq.answer}
                                    </p>
                                )}
                            </div>
                        </Card>
                    ))
                )}

                {/* Contact CTA */}
                <Card className="text-center py-8 mt-8">
                    <span className="text-4xl mb-4 block">💬</span>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Still have questions?
                    </h3>
                    <p className="text-gray-500 mb-4">
                        Our team is here to help
                    </p>
                    <Link
                        to="/contact"
                        className="inline-block px-6 py-2 bg-[hsl(248,80%,36%)] text-white rounded-xl font-medium"
                    >
                        Contact Support
                    </Link>
                </Card>
            </div>
        </div>
    );
}
