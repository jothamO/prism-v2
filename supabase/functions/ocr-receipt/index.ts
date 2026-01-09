// =====================================================
// PRISM V2 - OCR Receipt Edge Function
// Extract data from receipt images using AI
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

interface ReceiptData {
    merchant: string | null;
    amount: number | null;
    date: string | null;
    category: string | null;
    items: { name: string; price: number }[];
    vatAmount: number | null;
    confidence: number;
}

async function extractWithClaude(imageBase64: string, mimeType: string): Promise<ReceiptData> {
    if (!ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
            model: 'claude-sonnet-4-5-20250929',
            max_tokens: 1000,
            messages: [
                {
                    role: 'user',
                    content: [
                        {
                            type: 'image',
                            source: {
                                type: 'base64',
                                media_type: mimeType,
                                data: imageBase64,
                            },
                        },
                        {
                            type: 'text',
                            text: `Extract ALL information from this Nigerian receipt/invoice image. Return ONLY valid JSON:
{
  "merchant": "store or vendor name",
  "amount": total amount as number (no currency symbols),
  "date": "YYYY-MM-DD" or null if unclear,
  "category": one of: "food", "transport", "office", "utilities", "entertainment", "medical", "fuel", "telecom", "other",
  "items": [{"name": "item name", "price": 0.00}],
  "vatAmount": VAT amount if shown, otherwise null,
  "confidence": 0.0 to 1.0 based on image clarity
}

For Nigerian amounts, convert kobo to naira. If VAT is mentioned (usually 7.5%), extract it.`,
                        },
                    ],
                },
            ],
        }),
    });

    if (!response.ok) {
        const error = await response.text();
        console.error('[ocr-receipt] Claude API error:', error);
        throw new Error('Failed to process image');
    }

    const data = await response.json();
    const content = data.content?.[0]?.text;

    if (!content) {
        throw new Error('No response from AI');
    }

    // Parse JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/) || [null, content];
    const jsonStr = jsonMatch[1]?.trim() || content.trim();

    return JSON.parse(jsonStr);
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const formData = await req.formData();
        const file = formData.get('file') as File | null;
        const imageUrl = formData.get('imageUrl') as string | null;
        const userId = formData.get('userId') as string | null;

        let imageBase64: string;
        let mimeType: string;

        if (file) {
            // Handle file upload
            const arrayBuffer = await file.arrayBuffer();
            imageBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            mimeType = file.type || 'image/jpeg';
        } else if (imageUrl) {
            // Download from URL
            const imageResponse = await fetch(imageUrl);
            const arrayBuffer = await imageResponse.arrayBuffer();
            imageBase64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
            mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';
        } else {
            throw new Error('No image provided. Send file or imageUrl.');
        }

        console.log('[ocr-receipt] Processing image...');
        const receiptData = await extractWithClaude(imageBase64, mimeType);
        console.log('[ocr-receipt] Extracted:', JSON.stringify(receiptData));

        // Save to database if userId provided
        if (userId && receiptData.amount) {
            const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

            await supabase.from('transactions').insert({
                user_id: userId,
                description: receiptData.merchant || 'Receipt Upload',
                amount: receiptData.amount,
                type: 'debit',
                date: receiptData.date || new Date().toISOString(),
                category: receiptData.category,
                source: 'receipt_ocr',
                metadata: {
                    items: receiptData.items,
                    vat_amount: receiptData.vatAmount,
                    ocr_confidence: receiptData.confidence,
                },
                categorization_status: receiptData.category ? 'completed' : 'pending',
            });

            console.log('[ocr-receipt] Saved transaction for user:', userId);
        }

        return new Response(
            JSON.stringify({ success: true, data: receiptData }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[ocr-receipt] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
