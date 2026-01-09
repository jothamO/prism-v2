// =====================================================
// PRISM V2 - Mono Webhook Edge Function
// Handles Mono callbacks for bank events
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, mono-webhook-secret',
};

const MONO_WEBHOOK_SECRET = Deno.env.get('MONO_WEBHOOK_SECRET');
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

interface MonoWebhookEvent {
    event: string;
    data: {
        id?: string;
        account?: {
            _id: string;
            name: string;
            institution: {
                name: string;
                type: string;
            };
            accountNumber: string;
        };
        code?: string;
        meta?: Record<string, unknown>;
    };
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        // Verify webhook signature
        const webhookSecret = req.headers.get('mono-webhook-secret');
        if (MONO_WEBHOOK_SECRET && webhookSecret !== MONO_WEBHOOK_SECRET) {
            console.warn('[mono-webhook] Invalid webhook secret');
            return new Response('Unauthorized', { status: 401 });
        }

        const event: MonoWebhookEvent = await req.json();
        console.log('[mono-webhook] Event:', event.event);

        switch (event.event) {
            case 'mono.events.account_connected': {
                // A new bank account was connected
                const account = event.data.account;
                if (!account) break;

                // Find pending connection and update
                const { data: connection } = await supabase
                    .from('bank_connections')
                    .select('*')
                    .eq('mono_code', event.data.code)
                    .eq('status', 'pending')
                    .maybeSingle();

                if (connection) {
                    await supabase
                        .from('bank_connections')
                        .update({
                            mono_account_id: account._id,
                            bank_name: account.institution?.name,
                            account_number: account.accountNumber,
                            status: 'active',
                            connected_at: new Date().toISOString(),
                        })
                        .eq('id', connection.id);

                    console.log('[mono-webhook] Connection activated:', connection.id);
                }
                break;
            }

            case 'mono.events.account_updated': {
                // Account data was refreshed
                const accountId = event.data.id;
                if (accountId) {
                    await supabase
                        .from('bank_connections')
                        .update({ last_synced_at: new Date().toISOString() })
                        .eq('mono_account_id', accountId);
                }
                break;
            }

            case 'mono.events.reauthorisation_required': {
                // User needs to re-authorize
                const accountId = event.data.id;
                if (accountId) {
                    await supabase
                        .from('bank_connections')
                        .update({ status: 'reauth_required' })
                        .eq('mono_account_id', accountId);
                }
                break;
            }

            case 'mono.events.account_disconnected': {
                // Account was disconnected
                const accountId = event.data.id;
                if (accountId) {
                    await supabase
                        .from('bank_connections')
                        .update({
                            status: 'disconnected',
                            disconnected_at: new Date().toISOString(),
                        })
                        .eq('mono_account_id', accountId);
                }
                break;
            }

            default:
                console.log('[mono-webhook] Unhandled event:', event.event);
        }

        return new Response('OK', { headers: corsHeaders });

    } catch (error) {
        console.error('[mono-webhook] Error:', error);
        return new Response('OK', { headers: corsHeaders });
    }
});
