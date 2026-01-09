// =====================================================
// PRISM V2 - Process Compliance Document Edge Function
// AI-powered extraction of provisions and rules
// =====================================================

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const { documentId, fileUrl, documentType, title } = await req.json();

        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // Fetch document text (simplified - in production, use PDF parser)
        const extractedText = await fetchDocumentText(fileUrl);

        // Build extraction prompt
        const prompt = `Analyze this Nigerian tax/regulatory document and extract structured data.

Document Type: ${documentType}
Title: ${title}

Text:
${extractedText.slice(0, 15000)}

Extract:
1. Key provisions (section numbers, titles, text)
2. Tax rates, thresholds, and exemptions
3. Compliance rules with effective dates
4. Filing deadlines

Respond with JSON:
{
  "summary": "Brief summary of the document",
  "provisions": [
    {
      "section_number": "...",
      "title": "...",
      "text": "...",
      "provision_type": "rate|threshold|exemption|penalty|procedure",
      "tax_impact": "increases_liability|decreases_liability|neutral|procedural"
    }
  ],
  "rules": [
    {
      "rule_name": "...",
      "rule_type": "tax_rate|threshold|exemption|filing_deadline|penalty|emtl",
      "conditions": { ... },
      "outcome": { ... },
      "effective_from": "YYYY-MM-DD"
    }
  ]
}`;

        const startTime = Date.now();

        // Call Claude API
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': Deno.env.get('ANTHROPIC_API_KEY') ?? '',
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 8000,
                messages: [{ role: 'user', content: prompt }],
            }),
        });

        const result = await response.json();
        const content = result.content?.[0]?.text ?? '{}';
        const extractionSeconds = Math.round((Date.now() - startTime) / 1000);

        // Parse response
        let extracted;
        try {
            extracted = JSON.parse(content);
        } catch {
            extracted = { summary: '', provisions: [], rules: [] };
        }

        // Update document with summary
        await supabase
            .from('legal_documents')
            .update({
                extracted_text: extractedText.slice(0, 50000),
                summary: extracted.summary,
                key_provisions: extracted.provisions?.map((p: { title: string }) => p.title) ?? [],
            })
            .eq('id', documentId);

        // Insert provisions
        if (extracted.provisions?.length > 0) {
            await supabase.from('legal_provisions').insert(
                extracted.provisions.map((p: { section_number: string; title: string; text: string; provision_type: string; tax_impact: string }) => ({
                    document_id: documentId,
                    section_number: p.section_number,
                    title: p.title,
                    provision_text: p.text,
                    provision_type: p.provision_type,
                    tax_impact: p.tax_impact,
                }))
            );
        }

        // Insert rules (pending validation)
        if (extracted.rules?.length > 0) {
            await supabase.from('compliance_rules').insert(
                extracted.rules.map((r: { rule_name: string; rule_type: string; conditions: Record<string, unknown>; outcome: Record<string, unknown>; effective_from: string }) => ({
                    document_id: documentId,
                    rule_name: r.rule_name,
                    rule_type: r.rule_type,
                    conditions: r.conditions,
                    outcome: r.outcome,
                    effective_from: r.effective_from,
                    validation_status: 'pending',
                    is_active: false,
                }))
            );
        }

        // Log extraction metrics
        await supabase.from('compliance_extraction_metrics').insert({
            document_id: documentId,
            provisions_extracted: extracted.provisions?.length ?? 0,
            rules_generated: extracted.rules?.length ?? 0,
            gaps_found: 0, // Will be updated during review
            high_priority_gaps: 0,
            ai_extraction_seconds: extractionSeconds,
        });

        return new Response(
            JSON.stringify({
                success: true,
                provisionsCount: extracted.provisions?.length ?? 0,
                rulesCount: extracted.rules?.length ?? 0,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    } catch (error) {
        return new Response(
            JSON.stringify({ success: false, error: String(error) }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
    }
});

async function fetchDocumentText(url: string): Promise<string> {
    // In production, use a PDF parsing service
    // For now, return placeholder for testing
    try {
        const response = await fetch(url);
        if (response.headers.get('content-type')?.includes('text')) {
            return await response.text();
        }
        return `[Document content from ${url} - requires PDF parser]`;
    } catch {
        return '[Failed to fetch document]';
    }
}
