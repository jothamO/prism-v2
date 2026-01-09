// =====================================================
// PRISM V2 - WhatsApp Webhook Edge Function
// Handles WhatsApp Business API webhooks
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const WHATSAPP_VERIFY_TOKEN = Deno.env.get('WHATSAPP_VERIFY_TOKEN');
const WHATSAPP_ACCESS_TOKEN = Deno.env.get('WHATSAPP_ACCESS_TOKEN');
const WHATSAPP_PHONE_NUMBER_ID = Deno.env.get('WHATSAPP_PHONE_NUMBER_ID');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============= Rate Limiting =============
const rateLimitStore = new Map<string, number[]>();

function checkRateLimit(phoneNumber: string): boolean {
    const now = Date.now();
    const windowMs = 60000;
    const maxRequests = 20;

    let requests = rateLimitStore.get(phoneNumber) ?? [];
    requests = requests.filter(ts => ts > now - windowMs);

    if (requests.length >= maxRequests) {
        return false;
    }

    requests.push(now);
    rateLimitStore.set(phoneNumber, requests);
    return true;
}

// ============= WhatsApp API =============
async function sendWhatsAppMessage(to: string, text: string) {
    if (!WHATSAPP_ACCESS_TOKEN || !WHATSAPP_PHONE_NUMBER_ID) {
        console.error('[whatsapp] Missing credentials');
        return;
    }

    const response = await fetch(
        `https://graph.facebook.com/v18.0/${WHATSAPP_PHONE_NUMBER_ID}/messages`,
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                messaging_product: 'whatsapp',
                to,
                type: 'text',
                text: { body: text },
            }),
        }
    );

    if (!response.ok) {
        console.error('[whatsapp] Send message error:', await response.text());
    }
}

// ============= User Management =============
async function ensureWhatsAppUser(phoneNumber: string) {
    const { data: existing } = await supabase
        .from('whatsapp_connections')
        .select('*')
        .eq('phone_number', phoneNumber)
        .maybeSingle();

    if (existing) return existing;

    const { data, error } = await supabase
        .from('whatsapp_connections')
        .insert({
            phone_number: phoneNumber,
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        console.error('[whatsapp] Error creating connection:', error);
        throw error;
    }

    return data;
}

// ============= AI Chat =============
async function getAIResponse(message: string): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
        return "I'm currently offline. Please try again later.";
    }

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-5-20250929',
                max_tokens: 300,
                system: `You are PRISM, a Nigerian tax assistant on WhatsApp. Be concise and helpful. Use ₦ for amounts. Keep responses under 200 words.`,
                messages: [{ role: 'user', content: message }],
            }),
        });

        if (!response.ok) throw new Error('AI error');

        const data = await response.json();
        return data.content?.[0]?.text ?? "I couldn't process that request.";
    } catch (error) {
        console.error('[whatsapp] AI error:', error);
        return "I'm having trouble right now. Please try again.";
    }
}

// ============= Main Handler =============
Deno.serve(async (req) => {
    // Webhook verification (GET request from Meta)
    if (req.method === 'GET') {
        const url = new URL(req.url);
        const mode = url.searchParams.get('hub.mode');
        const token = url.searchParams.get('hub.verify_token');
        const challenge = url.searchParams.get('hub.challenge');

        if (mode === 'subscribe' && token === WHATSAPP_VERIFY_TOKEN) {
            console.log('[whatsapp] Webhook verified');
            return new Response(challenge, { status: 200 });
        }

        return new Response('Forbidden', { status: 403 });
    }

    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body = await req.json();

        // Extract message from webhook payload
        const entry = body.entry?.[0];
        const changes = entry?.changes?.[0];
        const value = changes?.value;
        const messages = value?.messages;

        if (!messages?.length) {
            return new Response('OK', { headers: corsHeaders });
        }

        const message = messages[0];
        const phoneNumber = message.from;
        const messageText = message.text?.body ?? '';

        // Rate limit
        if (!checkRateLimit(phoneNumber)) {
            await sendWhatsAppMessage(phoneNumber, '⏳ Please slow down. Try again in a minute.');
            return new Response('OK', { headers: corsHeaders });
        }

        // Ensure user exists
        await ensureWhatsAppUser(phoneNumber);

        // Handle commands
        const lowerText = messageText.toLowerCase().trim();

        if (lowerText === 'hi' || lowerText === 'hello' || lowerText === 'start') {
            await sendWhatsAppMessage(
                phoneNumber,
                `👋 Welcome to PRISM!

I'm your Nigerian tax assistant. I can help with:

📊 VAT calculations
💰 Income tax questions
🧾 EMTL tracking
📅 Filing deadlines

Just send me your tax question!`
            );
        } else if (lowerText.startsWith('vat ')) {
            const amount = parseFloat(lowerText.replace('vat ', '').replace(/[^0-9.]/g, ''));
            if (amount > 0) {
                const vat = amount * 0.075;
                await sendWhatsAppMessage(
                    phoneNumber,
                    `🧾 VAT Calculation

Amount: ₦${amount.toLocaleString()}
VAT (7.5%): ₦${vat.toLocaleString()}
Total: ₦${(amount + vat).toLocaleString()}`
                );
            } else {
                await sendWhatsAppMessage(phoneNumber, '❌ Please provide a valid amount. Example: vat 100000');
            }
        } else {
            // AI response for general queries
            const response = await getAIResponse(messageText);
            await sendWhatsAppMessage(phoneNumber, response);
        }

        return new Response('OK', { headers: corsHeaders });
    } catch (error) {
        console.error('[whatsapp] Error:', error);
        return new Response('OK', { headers: corsHeaders });
    }
});
