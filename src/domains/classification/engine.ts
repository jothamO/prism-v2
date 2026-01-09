// =====================================================
// PRISM V2 - Classification Engine
// 3-tier classification: Pattern → History → AI
// =====================================================

import { supabase } from '@/domains/auth/service';
import { NIGERIAN_TRANSACTION_PATTERNS } from '@/shared/constants';
import type { Category, ClassificationResult, Transaction } from '@/shared/types';

/**
 * Tier 1: Pattern-based classification (instant)
 * Matches Nigerian-specific patterns like POS, USSD, NIP, EMTL
 */
export function classifyByPattern(description: string): ClassificationResult | null {
    const upperDesc = description.toUpperCase();

    for (const { pattern, category } of NIGERIAN_TRANSACTION_PATTERNS) {
        if (pattern.test(upperDesc)) {
            return {
                category,
                confidence: 0.95,
                source: 'pattern',
                reasoning: `Matched Nigerian pattern: ${pattern.source}`,
            };
        }
    }

    return null;
}

/**
 * Tier 2: History-based classification (fast)
 * Finds similar past transactions from the same user
 */
export async function classifyByHistory(
    userId: string,
    description: string
): Promise<ClassificationResult | null> {
    // Get user's past categorized transactions with similar descriptions
    const { data } = await supabase
        .from('bank_transactions')
        .select('description, category, classification_source')
        .eq('user_id', userId)
        .not('category', 'is', null)
        .eq('classification_source', 'manual') // Only use manually categorized
        .limit(100);

    if (!data || data.length === 0) return null;

    // Simple similarity matching
    const normalizedDesc = description.toLowerCase().trim();
    const matches = data.filter(tx => {
        const txDesc = tx.description.toLowerCase().trim();
        // Check for significant overlap
        return txDesc.includes(normalizedDesc) ||
            normalizedDesc.includes(txDesc) ||
            calculateSimilarity(normalizedDesc, txDesc) > 0.7;
    });

    if (matches.length >= 2) {
        // If multiple matches with same category, high confidence
        const categoryCounts: Record<string, number> = {};
        for (const m of matches) {
            if (m.category) {
                categoryCounts[m.category] = (categoryCounts[m.category] ?? 0) + 1;
            }
        }

        const [topCategory, count] = Object.entries(categoryCounts)
            .sort(([, a], [, b]) => b - a)[0] ?? [];

        if (topCategory && count && count >= 2) {
            return {
                category: topCategory as Category,
                confidence: Math.min(0.85, 0.6 + count * 0.05),
                source: 'history',
                reasoning: `Found ${count} similar transactions categorized as ${topCategory}`,
            };
        }
    }

    return null;
}

/**
 * Tier 3: AI-based classification (accurate but slower)
 * Uses Claude via edge function
 */
export async function classifyByAI(
    transaction: Pick<Transaction, 'description' | 'amount' | 'type'>
): Promise<ClassificationResult> {
    const { data, error } = await supabase.functions.invoke('classify-transaction', {
        body: {
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
        },
    });

    if (error) {
        // Fallback to uncategorized
        return {
            category: 'uncategorized',
            confidence: 0,
            source: 'ai',
            reasoning: 'AI classification failed, marked for review',
        };
    }

    return {
        category: data.category as Category,
        confidence: data.confidence ?? 0.7,
        source: 'ai',
        reasoning: data.reasoning ?? 'Classified by AI',
    };
}

/**
 * Main classification entry point - tries all tiers
 */
export async function classifyTransaction(
    transaction: Pick<Transaction, 'id' | 'description' | 'amount' | 'type'>,
    userId: string
): Promise<ClassificationResult> {
    // Tier 1: Pattern matching (instant)
    const patternResult = classifyByPattern(transaction.description);
    if (patternResult) {
        return patternResult;
    }

    // Tier 2: History matching (fast)
    const historyResult = await classifyByHistory(userId, transaction.description);
    if (historyResult) {
        return historyResult;
    }

    // Tier 3: AI classification (slower)
    return await classifyByAI(transaction);
}

/**
 * Batch classify multiple transactions
 */
export async function classifyBatch(
    transactions: Array<Pick<Transaction, 'id' | 'description' | 'amount' | 'type'>>,
    userId: string
): Promise<Map<string, ClassificationResult>> {
    const results = new Map<string, ClassificationResult>();

    // First pass: pattern matching (instant for all)
    const needsMoreClassification: typeof transactions = [];

    for (const tx of transactions) {
        const patternResult = classifyByPattern(tx.description);
        if (patternResult) {
            results.set(tx.id, patternResult);
        } else {
            needsMoreClassification.push(tx);
        }
    }

    // Second pass: batch AI classification for remaining
    if (needsMoreClassification.length > 0) {
        const { data, error } = await supabase.functions.invoke('classify-batch', {
            body: {
                transactions: needsMoreClassification.map(tx => ({
                    id: tx.id,
                    description: tx.description,
                    amount: tx.amount,
                    type: tx.type,
                })),
                userId,
            },
        });

        if (!error && data?.results) {
            for (const result of data.results) {
                results.set(result.id, {
                    category: result.category as Category,
                    confidence: result.confidence ?? 0.7,
                    source: 'ai',
                    reasoning: result.reasoning,
                });
            }
        } else {
            // Fallback: mark remaining as uncategorized
            for (const tx of needsMoreClassification) {
                if (!results.has(tx.id)) {
                    results.set(tx.id, {
                        category: 'uncategorized',
                        confidence: 0,
                        source: 'ai',
                        reasoning: 'Batch classification failed',
                    });
                }
            }
        }
    }

    return results;
}

/**
 * Simple string similarity calculation
 */
function calculateSimilarity(a: string, b: string): number {
    if (a === b) return 1;
    if (a.length === 0 || b.length === 0) return 0;

    const words1 = new Set(a.split(/\s+/));
    const words2 = new Set(b.split(/\s+/));

    let intersection = 0;
    for (const word of words1) {
        if (words2.has(word)) intersection++;
    }

    return (2 * intersection) / (words1.size + words2.size);
}
