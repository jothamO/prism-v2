// =====================================================
// PRISM V2 - Send Notification Edge Function
// Send notifications via email, push, or messaging
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN');

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface NotificationRequest {
    userId?: string;
    userIds?: string[];
    type: 'email' | 'push' | 'telegram' | 'whatsapp' | 'in_app';
    template: string;
    data: Record<string, unknown>;
}

async function sendEmail(to: string, subject: string, html: string) {
    if (!RESEND_API_KEY) {
        console.log('[send-notification] Email skipped (no RESEND_API_KEY)');
        return { success: false, reason: 'no_api_key' };
    }

    const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            from: 'PRISM <notifications@prism.ng>',
            to,
            subject,
            html,
        }),
    });

    if (!response.ok) {
        console.error('[send-notification] Email error:', await response.text());
        return { success: false };
    }

    return { success: true };
}

async function sendTelegram(chatId: string, message: string) {
    if (!TELEGRAM_BOT_TOKEN) {
        console.log('[send-notification] Telegram skipped (no token)');
        return { success: false, reason: 'no_token' };
    }

    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text: message,
            parse_mode: 'HTML',
        }),
    });

    return { success: response.ok };
}

async function createInAppNotification(userId: string, title: string, message: string, type: string) {
    const { error } = await supabase.from('notifications').insert({
        user_id: userId,
        title,
        message,
        type,
        read: false,
    });

    return { success: !error };
}

const TEMPLATES: Record<string, { subject: string; body: (data: Record<string, unknown>) => string }> = {
    tax_deadline: {
        subject: '⚠️ Tax Deadline Reminder - {deadlineType}',
        body: (data) => `
      <h2>Tax Deadline Approaching</h2>
      <p>Your <strong>${data.deadlineType}</strong> is due on <strong>${data.dueDate}</strong>.</p>
      <p>Current estimated liability: <strong>₦${Number(data.amount).toLocaleString()}</strong></p>
      <p><a href="https://app.prism.ng/dashboard">View in PRISM →</a></p>
    `,
    },
    transactions_synced: {
        subject: '🏦 New Transactions Imported',
        body: (data) => `
      <h2>Transactions Synced</h2>
      <p><strong>${data.count}</strong> new transactions were imported from ${data.bankName}.</p>
      <p><a href="https://app.prism.ng/transactions">Review Transactions →</a></p>
    `,
    },
    classification_complete: {
        subject: '🤖 AI Classification Complete',
        body: (data) => `
      <h2>Transactions Categorized</h2>
      <p><strong>${data.count}</strong> transactions were automatically categorized by PRISM AI.</p>
      <p><a href="https://app.prism.ng/transactions?status=needs_review">Review Categories →</a></p>
    `,
    },
    weekly_summary: {
        subject: '📊 Your Weekly Tax Summary',
        body: (data) => `
      <h2>Weekly Summary</h2>
      <p>Here's your financial snapshot for the week:</p>
      <ul>
        <li>Income: ₦${Number(data.income).toLocaleString()}</li>
        <li>Expenses: ₦${Number(data.expenses).toLocaleString()}</li>
        <li>Estimated Tax: ₦${Number(data.tax).toLocaleString()}</li>
      </ul>
      <p><a href="https://app.prism.ng/insights">View Full Insights →</a></p>
    `,
    },
};

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        const body: NotificationRequest = await req.json();
        const { userId, userIds, type, template, data } = body;

        const targetUsers = userIds ?? (userId ? [userId] : []);
        if (targetUsers.length === 0) {
            throw new Error('No userId or userIds provided');
        }

        const templateConfig = TEMPLATES[template];
        if (!templateConfig) {
            throw new Error(`Unknown template: ${template}`);
        }

        const results: { userId: string; success: boolean; channel: string }[] = [];

        for (const uid of targetUsers) {
            // Get user details
            const { data: user } = await supabase
                .from('users')
                .select('email, telegram_chat_id')
                .eq('id', uid)
                .maybeSingle();

            if (!user) {
                results.push({ userId: uid, success: false, channel: 'unknown' });
                continue;
            }

            const subject = templateConfig.subject.replace(/{(\w+)}/g, (_, key) => String(data[key] ?? ''));
            const html = templateConfig.body(data);
            const plainText = html.replace(/<[^>]+>/g, '');

            switch (type) {
                case 'email':
                    if (user.email) {
                        const emailResult = await sendEmail(user.email, subject, html);
                        results.push({ userId: uid, success: emailResult.success, channel: 'email' });
                    }
                    break;

                case 'telegram':
                    if (user.telegram_chat_id) {
                        const tgResult = await sendTelegram(user.telegram_chat_id, plainText);
                        results.push({ userId: uid, success: tgResult.success, channel: 'telegram' });
                    }
                    break;

                case 'in_app':
                    const inAppResult = await createInAppNotification(uid, subject, plainText, template);
                    results.push({ userId: uid, success: inAppResult.success, channel: 'in_app' });
                    break;

                default:
                    results.push({ userId: uid, success: false, channel: type });
            }
        }

        return new Response(
            JSON.stringify({ success: true, results }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[send-notification] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
