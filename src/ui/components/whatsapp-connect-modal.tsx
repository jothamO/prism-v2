// =====================================================
// PRISM V2 - WhatsApp Connect Modal
// Link WhatsApp account
// =====================================================

import { useState, useEffect } from 'react';
import { supabase } from '@/domains/auth/service';
import { Button, Card, Input } from '@/ui/components';

interface WhatsAppConnectModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConnected?: () => void;
}

export function WhatsAppConnectModal({ open, onOpenChange, onConnected }: WhatsAppConnectModalProps) {
    const [phoneNumber, setPhoneNumber] = useState('');
    const [step, setStep] = useState<'phone' | 'verify' | 'connected'>('phone');
    const [verificationCode, setVerificationCode] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Reset state when modal closes
    useEffect(() => {
        if (!open) {
            setStep('phone');
            setPhoneNumber('');
            setVerificationCode('');
            setError(null);
        }
    }, [open]);

    const handleSendCode = async () => {
        if (!phoneNumber.trim()) {
            setError('Please enter your phone number');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke('whatsapp-send-verification', {
                body: { phoneNumber: phoneNumber.replace(/\D/g, '') },
            });

            if (fnError) throw fnError;

            if (data?.success) {
                setStep('verify');
            } else {
                throw new Error(data?.error || 'Failed to send verification code');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyCode = async () => {
        if (!verificationCode.trim()) {
            setError('Please enter the verification code');
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { data, error: fnError } = await supabase.functions.invoke('whatsapp-verify-code', {
                body: {
                    phoneNumber: phoneNumber.replace(/\D/g, ''),
                    code: verificationCode,
                },
            });

            if (fnError) throw fnError;

            if (data?.success) {
                setStep('connected');
                onConnected?.();
            } else {
                throw new Error(data?.error || 'Invalid verification code');
            }
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
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
                <div className="p-6 bg-[#25D366] text-white">
                    <div className="flex items-center gap-3">
                        <span className="text-3xl">📲</span>
                        <div>
                            <h2 className="text-xl font-semibold">Connect WhatsApp</h2>
                            <p className="text-white/80 text-sm">
                                Chat with PRISM on WhatsApp
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

                    {step === 'phone' && (
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">📲</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    Enter your WhatsApp phone number to receive tax updates and chat with PRISM.
                                </p>
                            </div>

                            <Input
                                label="Phone Number"
                                type="tel"
                                placeholder="+234 XXX XXX XXXX"
                                value={phoneNumber}
                                onChange={(e) => setPhoneNumber(e.target.value)}
                                leftIcon={<span>📱</span>}
                            />

                            <Button fullWidth loading={loading} onClick={handleSendCode}>
                                Send Verification Code
                            </Button>
                        </div>
                    )}

                    {step === 'verify' && (
                        <div className="space-y-4">
                            <div className="text-center py-4">
                                <div className="w-16 h-16 rounded-full bg-[#25D366]/10 flex items-center justify-center mx-auto mb-4">
                                    <span className="text-3xl">🔐</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400">
                                    We sent a 6-digit code to your WhatsApp. Enter it below.
                                </p>
                                <p className="text-sm text-gray-500 mt-1">{phoneNumber}</p>
                            </div>

                            <Input
                                label="Verification Code"
                                type="text"
                                placeholder="123456"
                                value={verificationCode}
                                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="text-center text-2xl tracking-widest"
                            />

                            <Button fullWidth loading={loading} onClick={handleVerifyCode}>
                                Verify Code
                            </Button>

                            <button
                                onClick={() => setStep('phone')}
                                className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                            >
                                ← Change phone number
                            </button>
                        </div>
                    )}

                    {step === 'connected' && (
                        <div className="text-center py-8 space-y-4">
                            <div className="w-20 h-20 rounded-full bg-[hsl(164,59%,58%)]/10 flex items-center justify-center mx-auto">
                                <span className="text-4xl">✅</span>
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                                    Connected!
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 mt-1">
                                    Your WhatsApp is now linked to PRISM
                                </p>
                            </div>
                            <Button fullWidth onClick={() => onOpenChange(false)}>
                                Done
                            </Button>
                        </div>
                    )}

                    {step !== 'connected' && (
                        <button
                            onClick={() => onOpenChange(false)}
                            className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </Card>
        </div>
    );
}
