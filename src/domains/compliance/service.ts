// =====================================================
// PRISM V2 - Compliance Service
// Legal document processing and rule management
// =====================================================

import { supabase } from '@/domains/auth/service';
import type {
    LegalDocument,
    ComplianceRule,
    DocumentType,
    RegulatoryBody,
    DocumentStatus,
    ReviewStatus
} from '@/shared/types';

/**
 * Get regulatory bodies
 */
export async function getRegulatoryBodies() {
    const { data, error } = await supabase
        .from('regulatory_bodies')
        .select('*')
        .eq('active', true)
        .order('code');

    if (error) throw error;
    return data;
}

/**
 * Get legal documents with filtering
 */
export async function getLegalDocuments(options?: {
    regulatoryBodyId?: string;
    documentType?: DocumentType;
    status?: DocumentStatus;
    reviewStatus?: ReviewStatus;
    search?: string;
    limit?: number;
    offset?: number;
}) {
    let query = supabase
        .from('legal_documents')
        .select(`
      *,
      regulatory_bodies(code, full_name)
    `, { count: 'exact' });

    if (options?.regulatoryBodyId) {
        query = query.eq('regulatory_body_id', options.regulatoryBodyId);
    }

    if (options?.documentType) {
        query = query.eq('document_type', options.documentType);
    }

    if (options?.status) {
        query = query.eq('status', options.status);
    }

    if (options?.reviewStatus) {
        query = query.eq('review_status', options.reviewStatus);
    }

    if (options?.search) {
        query = query.ilike('title', `%${options.search}%`);
    }

    if (options?.limit) {
        query = query.limit(options.limit);
    }

    if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit ?? 20) - 1);
    }

    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) throw error;
    return { documents: data ?? [], count: count ?? 0 };
}

/**
 * Get a single document with provisions and rules
 */
export async function getDocumentById(documentId: string) {
    const { data, error } = await supabase
        .from('legal_documents')
        .select(`
      *,
      regulatory_bodies(code, full_name),
      legal_provisions(*),
      compliance_rules(*)
    `)
        .eq('id', documentId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Upload and process a legal document
 */
export async function uploadDocument(
    file: File,
    metadata: {
        regulatoryBodyId: string;
        documentType: DocumentType;
        title: string;
        officialReference?: string;
        effectiveDate?: Date;
        publicationDate?: Date;
    }
): Promise<{ documentId: string }> {
    // 1. Upload file to storage
    const fileName = `${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage
        .from('legal-documents')
        .upload(fileName, file);

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
        .from('legal-documents')
        .getPublicUrl(fileName);

    // 2. Create document record
    const { data: doc, error: insertError } = await supabase
        .from('legal_documents')
        .insert({
            regulatory_body_id: metadata.regulatoryBodyId,
            document_type: metadata.documentType,
            title: metadata.title,
            official_reference: metadata.officialReference,
            effective_date: metadata.effectiveDate?.toISOString().split('T')[0],
            publication_date: metadata.publicationDate?.toISOString().split('T')[0],
            original_file_url: urlData.publicUrl,
            status: 'draft',
            review_status: 'pending',
        })
        .select()
        .single();

    if (insertError) throw insertError;

    // 3. Trigger AI processing via edge function
    await supabase.functions.invoke('process-compliance-document', {
        body: {
            documentId: doc.id,
            fileUrl: urlData.publicUrl,
            documentType: metadata.documentType,
            title: metadata.title,
        },
    });

    return { documentId: doc.id };
}

/**
 * Approve a document and activate its rules
 */
export async function approveDocument(documentId: string, reviewNotes?: string) {
    // Update document status
    const { error: docError } = await supabase
        .from('legal_documents')
        .update({
            status: 'active',
            review_status: 'approved',
            review_notes: reviewNotes,
        })
        .eq('id', documentId);

    if (docError) throw docError;

    // Activate associated rules
    const { error: ruleError } = await supabase
        .from('compliance_rules')
        .update({ is_active: true })
        .eq('document_id', documentId)
        .eq('validation_status', 'validated');

    if (ruleError) throw ruleError;
}

/**
 * Reject a document
 */
export async function rejectDocument(documentId: string, reason: string) {
    const { error } = await supabase
        .from('legal_documents')
        .update({
            review_status: 'rejected',
            review_notes: reason,
        })
        .eq('id', documentId);

    if (error) throw error;
}

/**
 * Get active compliance rules
 */
export async function getActiveRules(options?: {
    ruleType?: string;
    appliesToTransactions?: boolean;
}) {
    let query = supabase
        .from('compliance_rules')
        .select(`
      *,
      legal_documents(title, official_reference)
    `)
        .eq('is_active', true);

    if (options?.ruleType) {
        query = query.eq('rule_type', options.ruleType);
    }

    if (options?.appliesToTransactions !== undefined) {
        query = query.eq('applies_to_transactions', options.appliesToTransactions);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data ?? [];
}

/**
 * Create or update a compliance rule
 */
export async function upsertRule(rule: Partial<ComplianceRule> & { id?: string }) {
    const { data, error } = await supabase
        .from('compliance_rules')
        .upsert({
            ...rule,
            updated_at: new Date().toISOString(),
        })
        .select()
        .single();

    if (error) throw error;
    return data;
}

/**
 * Deactivate a rule
 */
export async function deactivateRule(ruleId: string) {
    const { error } = await supabase
        .from('compliance_rules')
        .update({ is_active: false })
        .eq('id', ruleId);

    if (error) throw error;
}

/**
 * Get compliance statistics for dashboard
 */
export async function getComplianceStats() {
    const [documents, rules, pendingReview] = await Promise.all([
        supabase
            .from('legal_documents')
            .select('id', { count: 'exact', head: true }),
        supabase
            .from('compliance_rules')
            .select('id', { count: 'exact', head: true })
            .eq('is_active', true),
        supabase
            .from('legal_documents')
            .select('id', { count: 'exact', head: true })
            .eq('review_status', 'pending'),
    ]);

    return {
        totalDocuments: documents.count ?? 0,
        activeRules: rules.count ?? 0,
        pendingReview: pendingReview.count ?? 0,
    };
}
