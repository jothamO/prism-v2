// =====================================================
// PRISM V2 - Shared Logger for Edge Functions
// Writes structured logs to system_logs table
// =====================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'critical';

export type LogCategory = 
    | 'auth' 
    | 'classification' 
    | 'banking' 
    | 'ai' 
    | 'compliance' 
    | 'system'
    | 'telegram'
    | 'whatsapp'
    | 'tax'
    | 'notification';

interface LogEntry {
    level: LogLevel;
    category: LogCategory;
    message: string;
    metadata?: Record<string, unknown>;
    user_id?: string;
    session_id?: string;
    ip_address?: string;
    user_agent?: string;
}

/**
 * Write a structured log entry to the system_logs table
 */
export async function log(entry: LogEntry): Promise<void> {
    try {
        const supabaseUrl = Deno.env.get('SUPABASE_URL');
        const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

        if (!supabaseUrl || !supabaseServiceKey) {
            console.error('Logger: Missing Supabase credentials');
            return;
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { error } = await supabase
            .from('system_logs')
            .insert({
                level: entry.level,
                category: entry.category,
                message: entry.message,
                metadata: entry.metadata || {},
                user_id: entry.user_id,
                session_id: entry.session_id,
                ip_address: entry.ip_address,
                user_agent: entry.user_agent,
            });

        if (error) {
            console.error('Logger: Failed to write log:', error.message);
        }
    } catch (err) {
        console.error('Logger: Exception writing log:', err);
    }
}

// Convenience methods for common log levels
export const logDebug = (
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
) => log({ level: 'debug', category, message, metadata });

export const logInfo = (
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
) => log({ level: 'info', category, message, metadata });

export const logWarn = (
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
) => log({ level: 'warn', category, message, metadata });

export const logError = (
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
) => log({ level: 'error', category, message, metadata });

export const logCritical = (
    category: LogCategory,
    message: string,
    metadata?: Record<string, unknown>
) => log({ level: 'critical', category, message, metadata });

/**
 * Extract request metadata for logging
 */
export function extractRequestMeta(req: Request): Pick<LogEntry, 'ip_address' | 'user_agent'> {
    return {
        ip_address: req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || undefined,
        user_agent: req.headers.get('user-agent') || undefined,
    };
}
