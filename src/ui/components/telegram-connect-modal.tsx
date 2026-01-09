// =====================================================
// PRISM V2 - Telegram Connect Modal
// Link Telegram account with token
// =====================================================

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/domains/auth/service';
import { Button, Card } from '@/ui/components';

interface TelegramConnectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConnected?: () => void;
}

export function TelegramConnectModal({ open, onOpenChange, onConnected }: TelegramConnectModalProps) {
    const [loading, setLoading] = useState(false);
    const [fetchingExisting, setFetchingExisting] = useState(false);
    const [token, setToken] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);
    const [expiresAt, setExpiresAt] = useState<Date | null>(null);
    const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Fetch existing token when modal opens
    useEffect(() => {
        if (!open) return;

        const fetchExistingToken = async () => {
            setFetchingExisting(true);
            try {
                const { data, error: fnError } = await supabase.functions.invoke('get-telegram-token');
                if (fnError) throw fnError;

                if (data?.success && data.token) {
                    setToken(data.token);
                    setExpiresAt(new Date(data.expiresAt));
                }
            } catch (err) {
                console.error('Error fetching token:', err);
            } finally {
                setFetchingExisting(false);
            }
        };

        fetchExistingToken();
    }, [open]);

    // Countdown timer
    useEffect(() => {
        if (!expiresAt) {
            setTimeRemaining(null);
            return;
        }

        const updateTimer = () => {
            const diff = expiresAt.getTime() - Date.now();
            if (diff <= 0) {
                setTimeRemaining('Expired');
                setToken(null);
                setExpiresAt(null);
                return;
            }
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setTimeRemaining(`${mins}:${secs.toString().padStart(2, '0')}`);
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);
        return () => clearInterval(interval);
    }, [expiresAt]);

    const generateToken = async () => {
        setLoading(true);
        setError(null);
        try {
            const { data, error: fnError } = await supabase.functions.invoke('generate-telegram-token');
            if (fnError) throw fnError;

            if (data?.success) {
                setToken(data.token);
                setExpiresAt(new Date(data.expiresAt));
            } else if (data?.rateLimited) {
                setError(`Daily limit reached. Try again in ${Math.ceil(data.retryAfter / 3600)} hours.`);
            } else {
                throw new Error(data?.error || 'Failed to generate token');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const copyToken = useCallback(async () => {
        if (token) {
            await navigator.clipboard.writeText(token);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    }, [token]);

    const handleOpenTelegram = () => {
        if (token) {
            window.open(`https://t.me/prism_tax_bot?start=${token}`, '_blank');
        }
    };

    if (!open) return null;

    return (
        <div
            className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4"
            onClick={() => onOpenChange(false)}
        >
            <Card
                className="w-full max-w-md !p-0 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 bg-[#0088cc] text-white">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📱</span>
                        <div>
                            <h2 className="text-xl font-semibold">Connect Telegram</h2>
                            <p className="text-white/80 text-sm">
                                Link your account to receive tax updates
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-4">
                    {/* Error */}
                    {error && (
                        <div className="p-3 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                            <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                        </div>
                    )}

                    {fetchingExisting ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0088cc] mx-auto" />
                            <p className="text-sm text-gray-500 mt-2">Checking for existing token...</p>
                        </div>
                    ) : !token ? (
                        <div className="text-center space-y-4 py-4">
                            <div className="w-16 h-16 rounded-full bg-[#0088cc]/10 flex items-center justify-center mx-auto">
                                <span className="text-3xl">📱</span>
                            </div>
                            <p className="text-gray-600 dark:text-gray-400">
                                Generate a one-time token to connect your Telegram account.
                            </p>
                            <Button fullWidth loading={loading} onClick={generateToken}>
                                Generate Token
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {/* Token display */}
                            <div className="p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-gray-500 font-medium">Your Token</span>
                                    <div className="flex items-center gap-1 text-xs text-amber-600">
                                        <span>⏱️</span>
                                        {timeRemaining}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <code className="flex-1 bg-white dark:bg-[hsl(240,27%,20%)] rounded-lg px-3 py-2 text-sm font-mono truncate border">
                                        {token}
                                    </code>
                                    <Button variant="outline" size="icon" onClick={copyToken}>
                                        {copied ? '✓' : '📋'}
                                    </Button>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="p-4 bg-gray-50 dark:bg-[hsl(240,24%,26%)] rounded-xl space-y-2">
                                <p className="font-medium text-gray-900 dark:text-white">Next steps:</p>
                                <ol className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                    <li>1. Click "Open Telegram" below</li>
                                    <li>2. Press "Start" in the PRISM bot</li>
                                    <li>3. The bot will automatically link your account</li>
                                </ol>
                            </div>

                            {/* Actions */}
                            <Button
                                fullWidth
                                onClick={handleOpenTelegram}
                                className="!bg-[#0088cc] hover:!bg-[#0077b5]"
                            >
                                Open Telegram 🔗
                            </Button>
                        </div>
                    )}

                    <button
                        onClick={() => onOpenChange(false)}
                        className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                    >
                        Cancel
                    </button>
                </div>
            </Card>
        </div>
    );
}
