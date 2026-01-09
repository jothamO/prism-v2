// =====================================================
// PRISM V2 - Admin Classification Testing Page
// Test AI classification on sample transactions
// =====================================================

import { useState } from 'react';
import { Card, Button, Input, Select } from '@/ui/components';
import { useClassification } from '@/domains/classification';
import { CATEGORIES } from '@/shared/constants';
import { formatCurrency } from '@/shared/utils';

interface TestResult {
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    tier1Result?: { category: string; confidence: number };
    tier2Result?: { category: string; confidence: number };
    tier3Result?: { category: string; confidence: number };
    finalCategory?: string;
    finalConfidence?: number;
    processingTime?: number;
}

const SAMPLE_TRANSACTIONS = [
    { description: 'UBER TRIP NG', amount: 3500, type: 'debit' as const },
    { description: 'SALARY PAYMENT APR-2026', amount: 450000, type: 'credit' as const },
    { description: 'MTN AIRTIME VTU', amount: 5000, type: 'debit' as const },
    { description: 'NETFLIX.COM', amount: 4400, type: 'debit' as const },
    { description: 'JUMIA ORDER #12345', amount: 25000, type: 'debit' as const },
    { description: 'TRANSFER FROM JOHN DOE', amount: 100000, type: 'credit' as const },
    { description: 'DANGOTE CEMENT LTD', amount: 850000, type: 'debit' as const },
    { description: 'DSTV SUBSCRIPTION', amount: 21000, type: 'debit' as const },
];

export function AdminClassificationTesting() {
    const [customDescription, setCustomDescription] = useState('');
    const [customAmount, setCustomAmount] = useState('');
    const [customType, setCustomType] = useState<'credit' | 'debit'>('debit');
    const [results, setResults] = useState<TestResult[]>([]);
    const [testing, setTesting] = useState(false);
    const { classify, loading } = useClassification();

    const testTransaction = async (description: string, amount: number, type: 'credit' | 'debit') => {
        const startTime = Date.now();

        try {
            const result = await classify({
                id: `test-${Date.now()}`,
                description,
                amount,
                type,
                date: new Date().toISOString(),
                user_id: 'test',
            });

            const processingTime = Date.now() - startTime;

            const testResult: TestResult = {
                description,
                amount,
                type,
                tier1Result: result.tier === 'pattern' ? { category: result.category, confidence: result.confidence } : undefined,
                tier2Result: result.tier === 'history' ? { category: result.category, confidence: result.confidence } : undefined,
                tier3Result: result.tier === 'ai' ? { category: result.category, confidence: result.confidence } : undefined,
                finalCategory: result.category,
                finalConfidence: result.confidence,
                processingTime,
            };

            setResults(prev => [testResult, ...prev]);
        } catch (error) {
            console.error('Classification error:', error);
        }
    };

    const runAllTests = async () => {
        setTesting(true);
        setResults([]);
        for (const tx of SAMPLE_TRANSACTIONS) {
            await testTransaction(tx.description, tx.amount, tx.type);
        }
        setTesting(false);
    };

    const testCustom = async () => {
        if (!customDescription || !customAmount) return;
        await testTransaction(customDescription, Number(customAmount), customType);
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Classification Testing
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Test the 3-tier classification engine
                    </p>
                </div>
                <Button loading={testing} onClick={runAllTests}>
                    🧪 Run All Tests
                </Button>
            </div>

            {/* Custom Test */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Test Custom Transaction
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                        <Input
                            label="Description"
                            placeholder="e.g., UBER TRIP NG"
                            value={customDescription}
                            onChange={(e) => setCustomDescription(e.target.value)}
                        />
                    </div>
                    <Input
                        label="Amount (₦)"
                        type="number"
                        placeholder="5000"
                        value={customAmount}
                        onChange={(e) => setCustomAmount(e.target.value)}
                    />
                    <Select
                        label="Type"
                        value={customType}
                        onChange={(e) => setCustomType(e.target.value as 'credit' | 'debit')}
                        options={[
                            { value: 'debit', label: 'Debit (Expense)' },
                            { value: 'credit', label: 'Credit (Income)' },
                        ]}
                    />
                </div>
                <Button
                    className="mt-4"
                    loading={loading}
                    onClick={testCustom}
                    disabled={!customDescription || !customAmount}
                >
                    Test Classification
                </Button>
            </Card>

            {/* Classification Pipeline */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    🔄 Classification Pipeline
                </h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                        <span className="font-medium text-green-700 dark:text-green-400">Tier 1: Pattern</span>
                        <span className="text-green-600 dark:text-green-500">~5ms</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-2 px-4 py-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                        <span className="font-medium text-blue-700 dark:text-blue-400">Tier 2: History</span>
                        <span className="text-blue-600 dark:text-blue-500">~50ms</span>
                    </div>
                    <span className="text-gray-400">→</span>
                    <div className="flex items-center gap-2 px-4 py-2 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                        <span className="font-medium text-purple-700 dark:text-purple-400">Tier 3: AI</span>
                        <span className="text-purple-600 dark:text-purple-500">~500ms</span>
                    </div>
                </div>
            </Card>

            {/* Results */}
            <Card className="!p-0 overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Test Results ({results.length})
                    </h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Description
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Amount
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase">
                                    Tier 1
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-blue-600 uppercase">
                                    Tier 2
                                </th>
                                <th className="px-4 py-3 text-center text-xs font-semibold text-purple-600 uppercase">
                                    Tier 3
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Final
                                </th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                    Time
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-[hsl(240,24%,30%)]">
                            {results.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                                        No tests run yet. Click "Run All Tests" or test a custom transaction.
                                    </td>
                                </tr>
                            ) : (
                                results.map((result, i) => (
                                    <tr key={i} className="hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]">
                                        <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                                            {result.description}
                                        </td>
                                        <td className="px-4 py-3 text-sm">
                                            <span className={result.type === 'credit' ? 'text-[hsl(164,59%,58%)]' : 'text-gray-600'}>
                                                {result.type === 'credit' ? '+' : '-'}{formatCurrency(result.amount)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {result.tier1Result ? (
                                                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                                                    {Math.round(result.tier1Result.confidence * 100)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {result.tier2Result ? (
                                                <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                                                    {Math.round(result.tier2Result.confidence * 100)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {result.tier3Result ? (
                                                <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                                                    {Math.round(result.tier3Result.confidence * 100)}%
                                                </span>
                                            ) : (
                                                <span className="text-gray-300">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className="text-xs px-2 py-1 bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] rounded-full">
                                                {result.finalCategory}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500">
                                            {result.processingTime}ms
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
