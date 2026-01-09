// =====================================================
// PRISM V2 - Banking Service
// Mono integration for bank connections
// =====================================================

import { supabase } from '@/domains/auth/service';

interface MonoAccountData {
    id: string;
    name: string;
    accountNumber: string;
    bankName: string;
    bankCode: string;
    type: string;
    balance: number;
    currency: string;
}

// Export type for external use
export type { MonoAccountData };

/**
 * Connect a bank account via Mono
 */
export async function connectBankAccount(
    userId: string,
    monoCode: string
): Promise<{ connectionId: string }> {
    // Exchange Mono code for account ID via edge function
    const { data, error } = await supabase.functions.invoke('mono-connect', {
        body: { code: monoCode, userId },
    });

    if (error) throw error;
    return { connectionId: data.connectionId };
}

/**
 * Get bank connections for a user
 */
export async function getBankConnections(userId: string) {
    const { data, error } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
}

/**
 * Get a single bank connection
 */
export async function getBankConnection(connectionId: string) {
    const { data, error } = await supabase
        .from('bank_connections')
        .select('*')
        .eq('id', connectionId)
        .single();

    if (error) throw error;
    return data;
}

/**
 * Sync transactions for a bank connection
 */
export async function syncBankTransactions(connectionId: string): Promise<{
    synced: number;
    newTransactions: number;
}> {
    const { data, error } = await supabase.functions.invoke('mono-sync', {
        body: { connectionId },
    });

    if (error) throw error;

    // Update last sync time
    await supabase
        .from('bank_connections')
        .update({ last_sync_at: new Date().toISOString() })
        .eq('id', connectionId);

    return data;
}

/**
 * Disconnect a bank account
 */
export async function disconnectBank(connectionId: string) {
    const { error } = await supabase
        .from('bank_connections')
        .update({ status: 'inactive' })
        .eq('id', connectionId);

    if (error) throw error;
}

/**
 * Delete a bank connection entirely
 */
export async function deleteBankConnection(connectionId: string) {
    const { error } = await supabase
        .from('bank_connections')
        .delete()
        .eq('id', connectionId);

    if (error) throw error;
}

/**
 * Get connection health status
 */
export async function getConnectionStatus(connectionId: string): Promise<{
    status: 'active' | 'inactive' | 'reauth_required';
    lastSync: Date | null;
    transactionCount: number;
}> {
    const { data: connection, error } = await supabase
        .from('bank_connections')
        .select('status, last_sync_at')
        .eq('id', connectionId)
        .single();

    if (error) throw error;

    const { count } = await supabase
        .from('bank_transactions')
        .select('id', { count: 'exact', head: true })
        .eq('bank_connection_id', connectionId);

    return {
        status: (connection?.status ?? 'inactive') as 'active' | 'inactive' | 'reauth_required',
        lastSync: connection?.last_sync_at ? new Date(connection.last_sync_at) : null,
        transactionCount: count ?? 0,
    };
}

/**
 * Request re-authorization for a connection
 */
export async function requestReauthorization(connectionId: string): Promise<{
    reauthorizationUrl: string;
}> {
    const { data, error } = await supabase.functions.invoke('mono-reauth', {
        body: { connectionId },
    });

    if (error) throw error;
    return data;
}
