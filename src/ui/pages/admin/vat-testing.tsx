// =====================================================
// PRISM V2 - Admin VAT Testing Page
// Test VAT calculations and reconciliations
// =====================================================

import { useState } from 'react';
import { Card, Button, Input } from '@/ui/components';
import { formatCurrency } from '@/shared/utils';

interface VATCalculation {
    grossAmount: number;
    vatAmount: number;
    netAmount: number;
    vatRate: number;
}

export function AdminVATTesting() {
    const [grossAmount, setGrossAmount] = useState('');
    const [vatInclusive, setVatInclusive] = useState(false);
    const [calculation, setCalculation] = useState<VATCalculation | null>(null);

    // Batch testing
    const [batchInput, setBatchInput] = useState('');
    const [batchResults, setBatchResults] = useState<VATCalculation[]>([]);

    const VAT_RATE = 0.075; // 7.5% Nigerian VAT

    const calculateVAT = () => {
        const amount = parseFloat(grossAmount) || 0;
        if (amount <= 0) return;

        let result: VATCalculation;

        if (vatInclusive) {
            // VAT is included in the amount
            const netAmount = amount / (1 + VAT_RATE);
            const vatAmount = amount - netAmount;
            result = {
                grossAmount: amount,
                vatAmount,
                netAmount,
                vatRate: VAT_RATE * 100,
            };
        } else {
            // VAT needs to be added
            const vatAmount = amount * VAT_RATE;
            result = {
                grossAmount: amount + vatAmount,
                vatAmount,
                netAmount: amount,
                vatRate: VAT_RATE * 100,
            };
        }

        setCalculation(result);
    };

    const runBatchTest = () => {
        const lines = batchInput.split('\n').filter(l => l.trim());
        const results: VATCalculation[] = [];

        for (const line of lines) {
            const amount = parseFloat(line.replace(/[^0-9.]/g, '')) || 0;
            if (amount > 0) {
                const vatAmount = amount * VAT_RATE;
                results.push({
                    grossAmount: amount + vatAmount,
                    vatAmount,
                    netAmount: amount,
                    vatRate: VAT_RATE * 100,
                });
            }
        }

        setBatchResults(results);
    };

    const totalVAT = batchResults.reduce((sum, r) => sum + r.vatAmount, 0);
    const totalNet = batchResults.reduce((sum, r) => sum + r.netAmount, 0);

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    VAT Testing
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Test VAT calculations (7.5% Nigerian VAT rate)
                </p>
            </div>

            {/* Single Calculation */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Single Calculation
                </h3>
                <div className="flex gap-4 items-end">
                    <div className="flex-1">
                        <Input
                            label="Amount (₦)"
                            type="number"
                            placeholder="100000"
                            value={grossAmount}
                            onChange={(e) => setGrossAmount(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2 pb-2">
                        <input
                            type="checkbox"
                            id="vatInclusive"
                            checked={vatInclusive}
                            onChange={(e) => setVatInclusive(e.target.checked)}
                            className="w-5 h-5 rounded"
                        />
                        <label htmlFor="vatInclusive" className="text-sm text-gray-600 dark:text-gray-400">
                            VAT Inclusive
                        </label>
                    </div>
                    <Button onClick={calculateVAT}>Calculate</Button>
                </div>

                {calculation && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                        <div className="grid grid-cols-4 gap-4 text-center">
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Net Amount</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(calculation.netAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">VAT ({calculation.vatRate}%)</p>
                                <p className="text-lg font-bold text-[hsl(248,80%,36%)]">
                                    {formatCurrency(calculation.vatAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Gross Amount</p>
                                <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(calculation.grossAmount)}
                                </p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-500 mb-1">Effective Rate</p>
                                <p className="text-lg font-bold text-[hsl(164,59%,58%)]">
                                    {((calculation.vatAmount / calculation.netAmount) * 100).toFixed(2)}%
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            {/* Batch Testing */}
            <Card>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Batch Testing
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                            Enter amounts (one per line)
                        </label>
                        <textarea
                            rows={5}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[hsl(240,24%,30%)] bg-gray-50 dark:bg-[hsl(240,24%,26%)] text-gray-900 dark:text-white font-mono"
                            placeholder="100000
250000
500000"
                            value={batchInput}
                            onChange={(e) => setBatchInput(e.target.value)}
                        />
                    </div>
                    <Button onClick={runBatchTest}>Run Batch Test</Button>
                </div>

                {batchResults.length > 0 && (
                    <div className="mt-6">
                        <div className="grid grid-cols-3 gap-4 mb-4 p-4 bg-[hsl(248,80%,36%)]/10 rounded-xl">
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Total Net</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totalNet)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Total VAT</p>
                                <p className="text-xl font-bold text-[hsl(248,80%,36%)]">
                                    {formatCurrency(totalVAT)}
                                </p>
                            </div>
                            <div className="text-center">
                                <p className="text-xs text-gray-500">Total Gross</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">
                                    {formatCurrency(totalNet + totalVAT)}
                                </p>
                            </div>
                        </div>

                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 dark:bg-[hsl(240,24%,26%)]">
                                <tr>
                                    <th className="px-4 py-2 text-left">#</th>
                                    <th className="px-4 py-2 text-right">Net</th>
                                    <th className="px-4 py-2 text-right">VAT</th>
                                    <th className="px-4 py-2 text-right">Gross</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y dark:divide-[hsl(240,24%,30%)]">
                                {batchResults.map((r, i) => (
                                    <tr key={i}>
                                        <td className="px-4 py-2">{i + 1}</td>
                                        <td className="px-4 py-2 text-right">{formatCurrency(r.netAmount)}</td>
                                        <td className="px-4 py-2 text-right text-[hsl(248,80%,36%)]">{formatCurrency(r.vatAmount)}</td>
                                        <td className="px-4 py-2 text-right font-medium">{formatCurrency(r.grossAmount)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
}
