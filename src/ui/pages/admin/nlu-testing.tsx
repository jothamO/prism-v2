// =====================================================
// PRISM V2 - Admin NLU Testing Page
// Test Natural Language Understanding for AI queries
// =====================================================

import { useState } from 'react';
import { Card, Button, Input } from '@/ui/components';
import { supabase } from '@/domains/auth/service';

interface NLUResult {
    intent: string;
    confidence: number;
    entities: { type: string; value: string; confidence: number }[];
    suggestedAction: string;
    processingTime: number;
}

const SAMPLE_QUERIES = [
    "How much VAT do I owe for January?",
    "What's the deadline for filing my annual tax return?",
    "Calculate income tax on 5 million naira",
    "What is EMTL and how does it affect my transfers?",
    "Show me my expenses from last month",
    "Connect my GTBank account",
    "I need help with tax deductions for my business",
];

export function AdminNLUTesting() {
    const [query, setQuery] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<NLUResult | null>(null);
    const [history, setHistory] = useState<{ query: string; result: NLUResult }[]>([]);

    const analyzeQuery = async (inputQuery?: string) => {
        const queryToAnalyze = inputQuery ?? query;
        if (!queryToAnalyze.trim()) return;

        setLoading(true);
        const startTime = Date.now();

        try {
            // Call AI to analyze intent
            const { data, error } = await supabase.functions.invoke('chat-assist', {
                body: {
                    message: `Analyze this user query for intent classification. Return ONLY JSON:
{
  "intent": "one of: vat_calculation, tax_filing, income_tax, learning, expense_tracking, bank_connect, help, other",
  "confidence": 0.0 to 1.0,
  "entities": [{"type": "amount|date|tax_type|bank", "value": "extracted value", "confidence": 0.0 to 1.0}],
  "suggestedAction": "brief description of what the system should do"
}

User query: "${queryToAnalyze}"`,
                    context: { isNLUTest: true },
                },
            });

            const processingTime = Date.now() - startTime;

            if (error) {
                throw error;
            }

            // Parse the AI response
            let parsed: NLUResult;
            try {
                const jsonMatch = data.response?.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, data.response];
                parsed = JSON.parse(jsonMatch[1]?.trim() || data.response);
                parsed.processingTime = processingTime;
            } catch {
                // Fallback for non-JSON responses
                parsed = {
                    intent: 'other',
                    confidence: 0.5,
                    entities: [],
                    suggestedAction: data.response || 'Could not parse response',
                    processingTime,
                };
            }

            setResult(parsed);
            setHistory(prev => [{ query: queryToAnalyze, result: parsed }, ...prev.slice(0, 9)]);
        } catch (error) {
            console.error('NLU analysis error:', error);
            setResult({
                intent: 'error',
                confidence: 0,
                entities: [],
                suggestedAction: 'Failed to analyze query',
                processingTime: Date.now() - startTime,
            });
        } finally {
            setLoading(false);
        }
    };

    const getIntentColor = (intent: string) => {
        switch (intent) {
            case 'vat_calculation': return 'bg-blue-100 text-blue-700';
            case 'tax_filing': return 'bg-purple-100 text-purple-700';
            case 'income_tax': return 'bg-green-100 text-green-700';
            case 'learning': return 'bg-amber-100 text-amber-700';
            case 'expense_tracking': return 'bg-cyan-100 text-cyan-700';
            case 'bank_connect': return 'bg-emerald-100 text-emerald-700';
            case 'help': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-600';
        }
    };

    const getConfidenceColor = (confidence: number) => {
        if (confidence >= 0.8) return 'text-[hsl(164,59%,58%)]';
        if (confidence >= 0.5) return 'text-[hsl(38,100%,58%)]';
        return 'text-[hsl(346,96%,63%)]';
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    NLU Testing
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Test Natural Language Understanding for user queries
                </p>
            </div>

            {/* Input */}
            <Card>
                <div className="flex gap-4">
                    <div className="flex-1">
                        <Input
                            label="Test Query"
                            placeholder="Type a user query to analyze..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && analyzeQuery()}
                        />
                    </div>
                    <div className="pt-6">
                        <Button loading={loading} onClick={() => analyzeQuery()}>
                            Analyze
                        </Button>
                    </div>
                </div>

                {/* Sample Queries */}
                <div className="mt-4">
                    <p className="text-xs text-gray-500 mb-2">Sample queries:</p>
                    <div className="flex flex-wrap gap-2">
                        {SAMPLE_QUERIES.map((q, i) => (
                            <button
                                key={i}
                                onClick={() => {
                                    setQuery(q);
                                    analyzeQuery(q);
                                }}
                                className="text-xs px-3 py-1.5 bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600 dark:text-gray-400 rounded-full hover:bg-[hsl(248,80%,36%)]/10 hover:text-[hsl(248,80%,36%)] transition-colors"
                            >
                                {q.length > 40 ? q.slice(0, 40) + '...' : q}
                            </button>
                        ))}
                    </div>
                </div>
            </Card>

            {/* Result */}
            {result && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Analysis Result
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="text-center p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Intent</p>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getIntentColor(result.intent)}`}>
                                {result.intent}
                            </span>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Confidence</p>
                            <p className={`text-xl font-bold ${getConfidenceColor(result.confidence)}`}>
                                {(result.confidence * 100).toFixed(0)}%
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Entities</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {result.entities.length}
                            </p>
                        </div>
                        <div className="text-center p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                            <p className="text-xs text-gray-500 mb-1">Processing</p>
                            <p className="text-xl font-bold text-gray-900 dark:text-white">
                                {result.processingTime}ms
                            </p>
                        </div>
                    </div>

                    {result.entities.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                                Extracted Entities
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {result.entities.map((entity, i) => (
                                    <div key={i} className="px-3 py-1 bg-[hsl(248,80%,36%)]/10 rounded-lg text-sm">
                                        <span className="text-gray-500">{entity.type}:</span>{' '}
                                        <span className="font-medium text-[hsl(248,80%,36%)]">{entity.value}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="p-4 bg-[hsl(164,59%,58%)]/10 rounded-xl">
                        <p className="text-xs text-gray-500 mb-1">Suggested Action</p>
                        <p className="text-gray-900 dark:text-white">{result.suggestedAction}</p>
                    </div>
                </Card>
            )}

            {/* History */}
            {history.length > 0 && (
                <Card>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Recent Tests ({history.length})
                    </h3>
                    <div className="space-y-2">
                        {history.map((item, i) => (
                            <div
                                key={i}
                                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl cursor-pointer hover:bg-gray-100 dark:hover:bg-[hsl(240,24%,28%)]"
                                onClick={() => {
                                    setQuery(item.query);
                                    setResult(item.result);
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`px-2 py-0.5 rounded text-xs ${getIntentColor(item.result.intent)}`}>
                                        {item.result.intent}
                                    </span>
                                    <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[300px]">
                                        {item.query}
                                    </span>
                                </div>
                                <span className={`text-sm font-medium ${getConfidenceColor(item.result.confidence)}`}>
                                    {(item.result.confidence * 100).toFixed(0)}%
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    );
}
