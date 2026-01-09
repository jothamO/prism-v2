// =====================================================
// PRISM V2 - Tax Deadline Reminder Edge Function
// Cron job to send deadline reminders
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Nigerian tax deadlines (recurring)
const TAX_DEADLINES = [
    // VAT - Monthly, due 21st of following month
    { type: 'vat', name: 'VAT Return', dayOfMonth: 21, recurring: 'monthly' },
    // PAYE - Monthly, due end of month
    { type: 'paye', name: 'PAYE Remittance', dayOfMonth: -1, recurring: 'monthly' }, // -1 = last day
    // Withholding Tax - Monthly, due 21st
    { type: 'wht', name: 'Withholding Tax', dayOfMonth: 21, recurring: 'monthly' },
    // CIT - Annually, 6 months after year end
    { type: 'cit', name: 'Company Income Tax', month: 6, dayOfMonth: 30, recurring: 'annual' },
    // Annual Returns - March 31st
    { type: 'annual', name: 'Annual Tax Return', month: 3, dayOfMonth: 31, recurring: 'annual' },
];

function getUpcomingDeadlines(daysAhead: number): { type: string; name: string; date: Date }[] {
    const now = new Date();
    const cutoff = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const upcoming: { type: string; name: string; date: Date }[] = [];

    for (const deadline of TAX_DEADLINES) {
        let deadlineDate: Date;

        if (deadline.recurring === 'monthly') {
            // Get this month's deadline
            const year = now.getFullYear();
            const month = now.getMonth();

            if (deadline.dayOfMonth === -1) {
                // Last day of month
                deadlineDate = new Date(year, month + 1, 0);
            } else {
                deadlineDate = new Date(year, month, deadline.dayOfMonth);
            }

            // If already passed, get next month's
            if (deadlineDate < now) {
                if (deadline.dayOfMonth === -1) {
                    deadlineDate = new Date(year, month + 2, 0);
                } else {
                    deadlineDate = new Date(year, month + 1, deadline.dayOfMonth);
                }
            }
        } else {
            // Annual deadline
            deadlineDate = new Date(now.getFullYear(), deadline.month! - 1, deadline.dayOfMonth);
            if (deadlineDate < now) {
                deadlineDate = new Date(now.getFullYear() + 1, deadline.month! - 1, deadline.dayOfMonth);
            }
        }

        if (deadlineDate <= cutoff && deadlineDate >= now) {
            upcoming.push({
                type: deadline.type,
                name: deadline.name,
                date: deadlineDate,
            });
        }
    }

    return upcoming;
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response(null, { headers: corsHeaders });
    }

    try {
        console.log('[tax-deadline-reminder] Starting reminder check...');

        // Get users with notification preferences
        const { data: users, error: usersError } = await supabase
            .from('users')
            .select('id, email, full_name, notification_preferences')
            .eq('onboarding_completed', true);

        if (usersError) {
            throw usersError;
        }

        console.log(`[tax-deadline-reminder] Found ${users?.length ?? 0} users`);

        const notificationsSent: { userId: string; deadline: string }[] = [];

        for (const user of users ?? []) {
            const prefs = user.notification_preferences ?? { reminderDays: 3 };
            const reminderDays = prefs.reminderDays ?? 3;

            const upcomingDeadlines = getUpcomingDeadlines(reminderDays);

            for (const deadline of upcomingDeadlines) {
                const daysUntil = Math.ceil(
                    (deadline.date.getTime() - Date.now()) / (24 * 60 * 60 * 1000)
                );

                // Check if we already sent this reminder
                const reminderKey = `${user.id}-${deadline.type}-${deadline.date.toISOString().split('T')[0]}`;

                const { data: existingReminder } = await supabase
                    .from('sent_reminders')
                    .select('id')
                    .eq('reminder_key', reminderKey)
                    .maybeSingle();

                if (existingReminder) {
                    continue; // Already sent
                }

                // Send notification via the send-notification function
                await supabase.functions.invoke('send-notification', {
                    body: {
                        userId: user.id,
                        type: 'email',
                        template: 'tax_deadline',
                        data: {
                            deadlineType: deadline.name,
                            dueDate: deadline.date.toLocaleDateString('en-NG', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            }),
                            daysUntil,
                            amount: 0, // Would calculate from transactions
                        },
                    },
                });

                // Also create in-app notification
                await supabase.from('notifications').insert({
                    user_id: user.id,
                    title: `⚠️ ${deadline.name} Due Soon`,
                    message: `Your ${deadline.name} is due on ${deadline.date.toLocaleDateString()}. ${daysUntil} days remaining.`,
                    type: 'deadline',
                    read: false,
                });

                // Mark reminder as sent
                await supabase.from('sent_reminders').insert({
                    reminder_key: reminderKey,
                    user_id: user.id,
                    deadline_type: deadline.type,
                    deadline_date: deadline.date.toISOString(),
                });

                notificationsSent.push({ userId: user.id, deadline: deadline.name });
            }
        }

        console.log(`[tax-deadline-reminder] Sent ${notificationsSent.length} reminders`);

        return new Response(
            JSON.stringify({
                success: true,
                notificationsSent: notificationsSent.length,
                details: notificationsSent,
            }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

    } catch (error) {
        console.error('[tax-deadline-reminder] Error:', error);
        return new Response(
            JSON.stringify({ success: false, error: (error as Error).message }),
            { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
    }
});
