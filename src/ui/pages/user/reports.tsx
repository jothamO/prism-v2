// =====================================================
// PRISM V2 - Reports Page
// Generate PDF and CSV reports
// =====================================================

import { useState } from 'react';
import { useAuth } from '@/domains/auth';
import { Card, Button, Select } from '@/ui/components';
import { supabase } from '@/domains/auth/service';

type ReportType = 'transactions' | 'tax_summary' | 'vat_reconciliation' | 'income_tax';

interface ReportConfig {
    label: string;
    description: string;
    icon: string;
}

const REPORT_TYPES: Record<ReportType, ReportConfig> = {
    transactions: {
        label: 'Transaction Report',
        description: 'All transactions with categories',
        icon: '📊',
    },
    tax_summary: {
        label: 'Tax Summary',
        description: 'Income and tax breakdown',
        icon: '📋',
    },
    vat_reconciliation: {
        label: 'VAT Reconciliation',
        description: 'VAT collected vs paid',
        icon: '🧾',
    },
    income_tax: {
        label: 'Income Tax Report',
        description: 'Annual P.I.T. calculation',
        icon: '📑',
    },
};

export function ReportsPage() {
    const { user } = useAuth();
    const [selectedReport, setSelectedReport] = useState<ReportType>('transactions');
    const [period, setPeriod] = useState('this_month');
    const [format, setFormat] = useState<'pdf' | 'csv'>('pdf');
    const [generating, setGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const periodOptions = [
        { value: 'this_month', label: 'This Month' },
        { value: 'last_month', label: 'Last Month' },
        { value: 'this_quarter', label: 'This Quarter' },
        { value: 'this_year', label: 'This Year' },
        { value: 'last_year', label: 'Last Year' },
    ];

    const handleGenerate = async () => {
        if (!user?.id) return;

        setGenerating(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke('generate-pdf-report', {
                body: {
                    userId: user.id,
                    reportType: selectedReport,
                    period,
                    format,
                },
            });

            if (fnError) throw fnError;

            // Download the report
            if (data?.url) {
                window.open(data.url, '_blank');
            } else if (data?.content) {
                // Handle inline content
                const blob = new Blob([data.content], {
                    type: format === 'pdf' ? 'application/pdf' : 'text/csv'
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `prism-${selectedReport}-${period}.${format}`;
                a.click();
                URL.revokeObjectURL(url);
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setGenerating(false);
        }
    };

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Reports
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Generate and download financial reports
                </p>
            </div>

            {/* Report Type Selection */}
            <div className="grid grid-cols-2 gap-3">
                {(Object.entries(REPORT_TYPES) as [ReportType, ReportConfig][]).map(([type, config]) => (
                    <Card
                        key={type}
                        hover
                        onClick={() => setSelectedReport(type)}
                        className={`!p-4 cursor-pointer transition-all ${selectedReport === type
                                ? 'ring-2 ring-[hsl(248,80%,36%)]'
                                : ''
                            }`}
                    >
                        <span className="text-2xl mb-2 block">{config.icon}</span>
                        <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {config.label}
                        </p>
                        <p className="text-xs text-gray-500">{config.description}</p>
                    </Card>
                ))}
            </div>

            {/* Options */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Report Options
                </h3>
                <div className="space-y-4">
                    <Select
                        label="Period"
                        value={period}
                        onChange={(e) => setPeriod(e.target.value)}
                        options={periodOptions}
                    />

                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Format
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setFormat('pdf')}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${format === 'pdf'
                                        ? 'bg-[hsl(248,80%,36%)] text-white'
                                        : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                📄 PDF
                            </button>
                            <button
                                onClick={() => setFormat('csv')}
                                className={`flex-1 py-3 rounded-xl text-sm font-medium transition-colors ${format === 'csv'
                                        ? 'bg-[hsl(248,80%,36%)] text-white'
                                        : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400'
                                    }`}
                            >
                                📊 CSV
                            </button>
                        </div>
                    </div>
                </div>
            </Card>

            {/* Error */}
            {error && (
                <div className="p-4 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                    <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                </div>
            )}

            {/* Generate Button */}
            <Button
                fullWidth
                loading={generating}
                onClick={handleGenerate}
            >
                Generate {REPORT_TYPES[selectedReport].label}
            </Button>
        </div>
    );
}
