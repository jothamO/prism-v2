// =====================================================
// PRISM V2 - Admin Login Page
// Admin-specific authentication
// =====================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { Button, Input, Card } from '@/ui/components';

export function AdminLogin() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { signIn, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSubmitting(true);

        try {
            await signIn(email, password);
            navigate('/admin');
        } catch {
            // Error is handled by useAuth
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(240,27%,13%)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Card className="!p-0 overflow-hidden bg-[hsl(240,27%,20%)]">
                    {/* Header */}
                    <div className="p-8 text-center border-b border-[hsl(240,24%,30%)]">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] flex items-center justify-center mx-auto mb-4">
                            <span className="text-3xl font-bold text-white">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
                        <p className="text-gray-400 mt-1">PRISM Administration</p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="mx-6 mt-6 p-3 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                            <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="admin@prism.ng"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />

                        <Button type="submit" fullWidth loading={submitting}>
                            Sign In to Admin
                        </Button>
                    </form>

                    <div className="p-6 pt-0 text-center">
                        <Link
                            to="/login"
                            className="text-sm text-gray-400 hover:text-white"
                        >
                            ← Back to user login
                        </Link>
                    </div>
                </Card>
            </div>
        </div>
    );
}
