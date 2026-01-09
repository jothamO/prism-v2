// =====================================================
// PRISM V2 - Telegram Bot Edge Function
// Handles Telegram webhook with rate limiting and AI chat
// Rewritten for V2 with cleaner architecture
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// ============= Rate Limiting =============
const rateLimitStore = new Map<string, { requests: number[]; blocked_until?: number }>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number } {
    const now = Date.now();
    const windowMs = 60000; // 1 minute
    const maxRequests = 30;

    let entry = rateLimitStore.get(userId);
    if (!entry) {
        entry = { requests: [] };
        rateLimitStore.set(userId, entry);
    }

    // Check block
    if (entry.blocked_until && now < entry.blocked_until) {
        return { allowed: false, remaining: 0 };
    }

    // Remove old requests
    entry.requests = entry.requests.filter(ts => ts > now - windowMs);

    // Check limit
    if (entry.requests.length >= maxRequests) {
        entry.blocked_until = now + 30000; // Block 30s
        return { allowed: false, remaining: 0 };
    }

    entry.requests.push(now);
    return { allowed: true, remaining: maxRequests - entry.requests.length };
}

// ============= Telegram API =============
async function sendMessage(chatId: number, text: string, buttons?: { text: string; callback_data: string }[][]) {
    const payload: Record<string, unknown> = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
    };

    if (buttons) {
        payload.reply_markup = { inline_keyboard: buttons };
    }

    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
}

async function answerCallbackQuery(callbackQueryId: string) {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQueryId }),
    });
}

// ============= User Management =============
async function ensureUser(telegramId: string, telegramUser: { username?: string; first_name?: string; last_name?: string }) {
    const { data: existing } = await supabase
        .from('telegram_connections')
        .select('*, users(*)')
        .eq('telegram_id', telegramId)
        .maybeSingle();

    if (existing) return existing;

    // Create new connection
    const { data, error } = await supabase
        .from('telegram_connections')
        .insert({
            telegram_id: telegramId,
            telegram_username: telegramUser?.username,
            first_name: telegramUser?.first_name,
            last_name: telegramUser?.last_name,
            status: 'active',
        })
        .select()
        .single();

    if (error) {
        console.error('[telegram-bot] Error creating connection:', error);
        throw error;
    }

    return data;
}

// ============= AI Chat =============
async function getAIResponse(message: string, context: { firstName?: string }): Promise<string> {
    if (!ANTHROPIC_API_KEY) {
        return "I'm having trouble connecting to my AI backend. Please try again later.";
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
                max_tokens: 500,
                system: `You are PRISM, a friendly Nigerian tax assistant on Telegram. You help users understand Nigerian tax laws, calculate their obligations, and stay compliant.

Key knowledge:
- Personal Income Tax (PIT): 7% to 24% graduated rates
- VAT: 7.5%
- EMTL: ₦50 per transfer ≥₦10,000
- Company Income Tax: 30%

Be warm, concise, and use Nigerian expressions occasionally. Use ₦ for all amounts.`,
                messages: [{ role: 'user', content: message }],
            }),
        });

        if (!response.ok) {
            throw new Error('AI API error');
        }

        const data = await response.json();
        return data.content?.[0]?.text ?? "I couldn't process that. Please try again.";
    } catch (error) {
        console.error('[telegram-bot] AI error:', error);
        return "I'm having trouble processing your request. Please try again.";
    }
}

// ============= Command Handlers =============
async function handleStart(chatId: number, connection: { first_name?: string }) {
    await sendMessage(
        chatId,
        `👋 <b>Welcome to PRISM!</b>

I'm your AI tax assistant for Nigerian taxes. Here's what I can help with:

📊 VAT calculations and remittance
💰 Income tax questions
🧾 EMTL tracking
📅 Filing deadline reminders

Just send me a message with your tax question, or type /help for commands.`,
        [
            [
                { text: '💰 Tax Calculator', callback_data: 'calculator' },
                { text: '📋 My Summary', callback_data: 'summary' },
            ],
        ]
    );
}

async function handleHelp(chatId: number) {
    await sendMessage(
        chatId,
        `📋 <b>PRISM Commands</b>

/start - Restart the bot
/help - Show this message
/vat [amount] - Calculate VAT on amount
/tax [income] - Estimate income tax
/summary - View your tax summary

💬 Or just ask me any tax question!`
    );
}

async function handleVAT(chatId: number, amountStr: string) {
    const amount = parseFloat(amountStr?.replace(/[^0-9.]/g, '') ?? '0');

    if (!amount || amount <= 0) {
        await sendMessage(chatId, '❌ Please provide a valid amount.\n\nExample: /vat 100000');
        return;
    }

    const vat = amount * 0.075;
    const total = amount + vat;

    await sendMessage(
        chatId,
        `🧾 <b>VAT Calculation</b>

Amount: ₦${amount.toLocaleString()}
VAT (7.5%): ₦${vat.toLocaleString()}
<b>Total: ₦${total.toLocaleString()}</b>`
    );
}

async function handleTax(chatId: number, incomeStr: string) {
    const income = parseFloat(incomeStr?.replace(/[^0-9.]/g, '') ?? '0');

    if (!income || income <= 0) {
        await sendMessage(chatId, '❌ Please provide a valid income.\n\nExample: /tax 5000000');
        return;
    }

    // Nigerian PIT calculation
    const bands = [
        { min: 0, max: 300000, rate: 0.07 },
        { min: 300000, max: 600000, rate: 0.11 },
        { min: 600000, max: 1100000, rate: 0.15 },
        { min: 1100000, max: 1600000, rate: 0.19 },
        { min: 1600000, max: 3200000, rate: 0.21 },
        { min: 3200000, max: Infinity, rate: 0.24 },
    ];

    let tax = 0;
    let remaining = income;

    for (const band of bands) {
        if (remaining <= 0) break;
        const taxable = Math.min(remaining, band.max - band.min);
        tax += taxable * band.rate;
        remaining -= taxable;
    }

    const effectiveRate = (tax / income) * 100;

    await sendMessage(
        chatId,
        `💰 <b>Income Tax Estimate</b>

Annual Income: ₦${income.toLocaleString()}
Estimated Tax: ₦${tax.toLocaleString()}
Effective Rate: ${effectiveRate.toFixed(1)}%

<i>Note: This is a simplified estimate. Actual tax may vary based on allowances and deductions.</i>`
    );
}

// ============= Main Handler =============
Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const update = await req.json();

        // Handle message
        const message = update.message;
        const callback = update.callback_query;

        if (message) {
            const chatId = message.chat.id;
            const telegramId = String(message.from.id);
            const text = message.text ?? '';

            // Rate limit
            const rateCheck = checkRateLimit(telegramId);
            if (!rateCheck.allowed) {
                await sendMessage(chatId, '⏳ Slow down! Please wait a moment before sending more messages.');
                return new Response('OK', { headers: corsHeaders });
            }

            // Ensure user exists
            const connection = await ensureUser(telegramId, message.from);

            // Handle commands
            const command = text.toLowerCase().split(' ')[0];
            const args = text.split(' ').slice(1).join(' ');

            switch (command) {
                case '/start':
                    await handleStart(chatId, connection);
                    break;
                case '/help':
                    await handleHelp(chatId);
                    break;
                case '/vat':
                    await handleVAT(chatId, args);
                    break;
                case '/tax':
                    await handleTax(chatId, args);
                    break;
                default:
                    // AI chat for general messages
                    const response = await getAIResponse(text, { firstName: connection.first_name });
                    await sendMessage(chatId, response);
            }
        }

        // Handle callbacks
        if (callback) {
            await answerCallbackQuery(callback.id);
            const chatId = callback.message.chat.id;
            const data = callback.data;

            switch (data) {
                case 'calculator':
                    await sendMessage(chatId, 'Use these commands:\n\n/vat [amount] - Calculate VAT\n/tax [income] - Estimate income tax');
                    break;
                case 'summary':
                    await sendMessage(chatId, 'Coming soon! Your tax summary will show your income, expenses, and estimated tax liability.');
                    break;
            }
        }

        return new Response('OK', { headers: corsHeaders });
    } catch (error) {
        console.error('[telegram-bot] Error:', error);
        return new Response('OK', { headers: corsHeaders });
    }
});
