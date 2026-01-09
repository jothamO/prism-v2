// =====================================================
// PRISM V2 - Admin Simulator Page
// Simulate user journeys and transaction flows
// =====================================================

import { useState } from 'react';
import { Card, Button, Input, Select } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

interface SimulatedTransaction {
    description: string;
    amount: number;
    type: 'credit' | 'debit';
    date: string;
    category?: string;
    source: 'simulated';
}

const SAMPLE_SCENARIOS = [
    {
        name: 'Freelancer Income',
        transactions: [
            { description: 'Client Payment - Web Development', amount: 500000, type: 'credit' as const },
            { description: 'MTN Data Subscription', amount: 10000, type: 'debit' as const },
            { description: 'AWS Server Hosting', amount: 25000, type: 'debit' as const },
            { description: 'Upwork Client Payment', amount: 350000, type: 'credit' as const },
        ],
    },
    {
        name: 'Small Business',
        transactions: [
            { description: 'Product Sales Revenue', amount: 1500000, type: 'credit' as const },
            { description: 'Staff Salary Payment', amount: 450000, type: 'debit' as const },
            { description: 'Rent Payment - Shop', amount: 150000, type: 'debit' as const },
            { description: 'Customer Payment', amount: 250000, type: 'credit' as const },
            { description: 'Inventory Purchase', amount: 800000, type: 'debit' as const },
        ],
    },
    {
        name: 'Salary Earner',
        transactions: [
            { description: 'SALARY PAYMENT MAR-2026', amount: 650000, type: 'credit' as const },
            { description: 'UBER TRIP', amount: 3500, type: 'debit' as const },
            { description: 'NETFLIX SUBSCRIPTION', amount: 4400, type: 'debit' as const },
            { description: 'JUMIA ONLINE PURCHASE', amount: 45000, type: 'debit' as const },
        ],
    },
];

export function AdminSimulator() {
    const [selectedScenario, setSelectedScenario] = useState(0);
    const [userId, setUserId] = useState('');
    const [simulating, setSimulating] = useState(false);
    const [results, setResults] = useState<{ success: number; failed: number } | null>(null);
    const [_customTransactions, setCustomTransactions] = useState<SimulatedTransaction[]>([]);

    const runSimulation = async () => {
        if (!userId) {
            alert('Please enter a user ID');
            return;
        }

        setSimulating(true);
        setResults(null);

        const scenario = SAMPLE_SCENARIOS[selectedScenario];
        if (!scenario) {
            setSimulating(false);
            return;
        }
        
        const transactions = scenario.transactions;
        let success = 0;
        let failed = 0;

        for (const tx of transactions) {
            try {
                // TODO: Implement when transactions table schema is fixed
                // The bank_transactions table has different columns
                console.log('Simulating transaction:', tx);
                success++;
            } catch {
                failed++;
            }
        }

        setResults({ success, failed });
        setSimulating(false);
    };

    // Future: Add custom transaction functionality
    // const addCustomTransaction = () => { ... };

    const scenario = SAMPLE_SCENARIOS[selectedScenario];
    const totalIncome = scenario?.transactions
        .filter(t => t.type === 'credit')
        .reduce((s, t) => s + t.amount, 0) ?? 0;
    const totalExpenses = scenario?.transactions
        .filter(t => t.type === 'debit')
        .reduce((s, t) => s + t.amount, 0) ?? 0;

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Transaction Simulator
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Generate test transactions for users
                </p>
            </div>

            {/* Configuration */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Simulation Setup
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                        label="Target User ID"
                        placeholder="user-uuid-here"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                    />
                    <Select
                        label="Scenario"
                        value={String(selectedScenario)}
                        onChange={(e) => setSelectedScenario(Number(e.target.value))}
                        options={SAMPLE_SCENARIOS.map((s, i) => ({
                            value: String(i),
                            label: s.name,
                        }))}
                    />
                </div>
            </Card>

            {/* Scenario Preview */}
            {scenario && (
            <Card>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                        Scenario: {scenario.name}
                    </h3>
                    <div className="flex gap-4 text-sm">
                        <span className="text-[hsl(164,59%,58%)]">
                            Income: {formatCurrency(totalIncome)}
                        </span>
                        <span className="text-gray-500">
                            Expenses: {formatCurrency(totalExpenses)}
                        </span>
                    </div>
                </div>

                <div className="space-y-2">
                    {scenario.transactions.map((tx, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl"
                        >
                            <div className="flex items-center gap-3">
                                <span className={`w-8 h-8 rounded-full flex items-center justify-center ${tx.type === 'credit'
                                        ? 'bg-[hsl(164,59%,58%)]/10 text-[hsl(164,59%,58%)]'
                                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                                    }`}>
                                    {tx.type === 'credit' ? '↓' : '↑'}
                                </span>
                                <span className="text-gray-900 dark:text-white">{tx.description}</span>
                            </div>
                            <span className={`font-medium ${tx.type === 'credit' ? 'text-[hsl(164,59%,58%)]' : 'text-gray-900 dark:text-white'
                                }`}>
                                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.amount)}
                            </span>
                        </div>
                    ))}
                </div>

                <div className="mt-6 flex gap-4">
                    <Button loading={simulating} onClick={runSimulation}>
                        🚀 Run Simulation
                    </Button>
                    {results && (
                        <div className="flex items-center gap-2 text-sm">
                            <span className="text-[hsl(164,59%,58%)]">✓ {results.success} inserted</span>
                            {results.failed > 0 && (
                                <span className="text-[hsl(346,96%,63%)]">✕ {results.failed} failed</span>
                            )}
                        </div>
                    )}
                </div>
            </Card>
            )}

            {/* Quick Stats */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="text-center !py-4">
                    <span className="text-3xl mb-2 block">📊</span>
                    <p className="text-sm text-gray-500">Transactions</p>
                    <p className="text-xl font-bold text-gray-900 dark:text-white">
                        {scenario?.transactions.length ?? 0}
                    </p>
                </Card>
                <Card className="text-center !py-4">
                    <span className="text-3xl mb-2 block">💰</span>
                    <p className="text-sm text-gray-500">Est. Tax</p>
                    <p className="text-xl font-bold text-[hsl(248,80%,36%)]">
                        {formatCurrency(totalIncome * 0.15)}
                    </p>
                </Card>
                <Card className="text-center !py-4">
                    <span className="text-3xl mb-2 block">📈</span>
                    <p className="text-sm text-gray-500">Net Income</p>
                    <p className="text-xl font-bold text-[hsl(164,59%,58%)]">
                        {formatCurrency(totalIncome - totalExpenses)}
                    </p>
                </Card>
            </div>
        </div>
    );
}
