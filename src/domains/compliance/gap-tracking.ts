// =====================================================
// PRISM V2 - Gap Tracking Service
// Tracks extraction gaps for Claude Code integration
// =====================================================

import { supabase } from '@/domains/auth/service';
import type { GapCategory, GapPriority, GapStatus } from '@/shared/types';

interface ExtractionGap {
    documentId: string;
    ruleId?: string;
    gapCategory: GapCategory;
    gapDescription: string;
    expectedValue?: unknown;
    actualValue?: unknown;
    circularQuote?: string;
    priority?: GapPriority;
}

/**
 * Log an extraction gap
 */
export async function logGap(gap: ExtractionGap) {
    const { data, error } = await supabase
        .from('compliance_extraction_gaps')
        .insert({
            document_id: gap.documentId,
            rule_id: gap.ruleId,
            gap_category: gap.gapCategory,
            gap_description: gap.gapDescription,
            expected_value: gap.expectedValue,
            actual_value: gap.actualValue,
            circular_quote: gap.circularQuote,
            priority: gap.priority ?? 'medium',
            status: 'identified',
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Get gaps for a document
 */
export async function getGapsForDocument(documentId: string) {
    const { data, error } = await supabase
        .from('compliance_extraction_gaps')
        .select('*')
        .eq('document_id', documentId)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * Get all gaps with filtering
 */
export async function getGaps(options?: {
    status?: GapStatus;
    category?: GapCategory;
    priority?: GapPriority;
    isRecurring?: boolean;
    limit?: number;
}) {
    let query = supabase
        .from('compliance_extraction_gaps')
        .select(`
      *,
      legal_documents(title)
    `, { count: 'exact' });

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.category) {
        query = query.eq('gap_category', options.category);
    }

    if (options?.priority) {
        query = query.eq('priority', options.priority);
    }

    if (options?.isRecurring !== undefined) {
        query = query.eq('is_recurring', options.isRecurring);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { gaps: data ?? [], count: count ?? 0 };
}

/**
 * Update gap status
 */
export async function updateGapStatus(
    gapId: string,
    status: GapStatus,
    fixDescription?: string
) {
    const updates: Record<string, unknown> = {
        status,
        updated_at: new Date().toISOString(),
    };

    if (status === 'fixed') {
        updates.fixed_at = new Date().toISOString();
        updates.fix_description = fixDescription;
    }

    const { error } = await supabase
        .from('compliance_extraction_gaps')
        .update(updates)
        .eq('id', gapId);

    if (error) throw error;
}

/**
 * Get gap patterns for Claude Code analysis
 */
export async function getGapPatterns() {
    const { data, error } = await supabase
        .from('compliance_gap_patterns')
        .select('*')
        .order('total_occurrences', { ascending: false });

    if (error) throw error;
    return data ?? [];
}

/**
 * Get extraction metrics
 */
export async function getExtractionMetrics(documentId: string) {
    const { data, error } = await supabase
        .from('compliance_extraction_metrics')
        .select('*')
        .eq('document_id', documentId)
        .order('measured_at', { ascending: false })
        .limit(1)
        .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data;
}

/**
 * Log extraction metrics
 */
export async function logExtractionMetrics(metrics: {
    documentId: string;
    provisionsExtracted: number;
    rulesGenerated: number;
    gapsFound: number;
    highPriorityGaps: number;
    aiExtractionSeconds?: number;
    manualReviewMinutes?: number;
}) {
    const accuracy = metrics.rulesGenerated > 0
        ? ((metrics.rulesGenerated - metrics.gapsFound) / metrics.rulesGenerated) * 100
        : 0;

    const { error } = await supabase
        .from('compliance_extraction_metrics')
        .insert({
            document_id: metrics.documentId,
            provisions_extracted: metrics.provisionsExtracted,
            rules_generated: metrics.rulesGenerated,
            gaps_found: metrics.gapsFound,
            high_priority_gaps: metrics.highPriorityGaps,
            ai_extraction_seconds: metrics.aiExtractionSeconds,
            manual_review_minutes: metrics.manualReviewMinutes,
            extraction_accuracy_percent: accuracy,
        });

    if (error) throw error;
}

/**
 * Export gap data for Claude Code analysis
 */
export async function exportGapDataForAnalysis(days = 30): Promise<string> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);

    const [gaps, patterns, metrics] = await Promise.all([
        supabase
            .from('compliance_extraction_gaps')
            .select(`*, legal_documents(title)`)
            .gte('created_at', cutoff.toISOString())
            .order('priority'),
        supabase
            .from('compliance_gap_patterns')
            .select('*')
            .order('total_occurrences', { ascending: false }),
        supabase
            .from('compliance_extraction_metrics')
            .select(`*, legal_documents(title)`)
            .gte('measured_at', cutoff.toISOString())
            .order('measured_at', { ascending: false })
            .limit(20),
    ]);

    return `# Gap Analysis Report - ${new Date().toISOString().split('T')[0]}

## Recent Gaps (Last ${days} Days)
${JSON.stringify(gaps.data, null, 2)}

## Recurring Patterns
${JSON.stringify(patterns.data, null, 2)}

## Extraction Metrics
${JSON.stringify(metrics.data, null, 2)}

---
Claude Code: Analyze this data and provide:
1. Top 3 priority fixes
2. Specific code changes
3. Predicted improvement metrics
`;
}
