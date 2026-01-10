// =====================================================
// PRISM V2 - Auth Page
// Login and signup with iBank styling
// =====================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { Button, Input, Card } from '@/ui/components';

export function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const { signIn, signUp, loading, error, clearError } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        try {
            if (isLogin) {
                await signIn(email, password);
                navigate('/dashboard');
            } else {
                await signUp(email, password);
                navigate('/login');
            }
        } catch {
            // Error is handled by useAuth
        }
    };

    return (
        <div className="min-h-screen bg-[hsl(240,6%,97%)] dark:bg-[hsl(240,27%,13%)] flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                <Link
                    to="/"
                    className="inline-flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mb-6"
                >
                    ← Back to home
                </Link>

                <Card className="!p-0 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 text-center border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl font-bold text-white">P</span>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                            {isLogin ? 'Welcome back' : 'Create account'}
                        </h1>
                        <p className="text-gray-500 dark:text-gray-400 mt-1">
                            {isLogin ? 'Sign in to your PRISM account' : 'Start your tax management journey'}
                        </p>
                    </div>

                    {/* Tab Toggle */}
                    <div className="flex bg-gray-100 dark:bg-[hsl(240,24%,26%)] p-1 mx-6 mt-6 rounded-xl">
                        <button
                            type="button"
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${isLogin
                                    ? 'bg-white dark:bg-[hsl(240,27%,20%)] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Sign In
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-2.5 text-sm font-medium rounded-lg transition-all ${!isLogin
                                    ? 'bg-white dark:bg-[hsl(240,27%,20%)] text-gray-900 dark:text-white shadow-sm'
                                    : 'text-gray-500 dark:text-gray-400'
                                }`}
                        >
                            Sign Up
                        </button>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="mx-6 mt-4 p-3 rounded-xl bg-[hsl(346,96%,63%)]/10 border border-[hsl(346,96%,63%)]/20">
                            <p className="text-sm text-[hsl(346,96%,63%)]">{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleSubmit} className="p-6 space-y-4">
                        <Input
                            label="Email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            leftIcon={<span>📧</span>}
                            required
                        />

                        <div className="space-y-1.5">
                            <Input
                                label="Password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                leftIcon={<span>🔒</span>}
                                rightIcon={
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? '👁️' : '👁️‍🗨️'}
                                    </button>
                                }
                                required
                            />
                            {!isLogin && (
                                <p className="text-xs text-gray-500">Must be at least 8 characters</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            fullWidth
                            loading={loading}
                        >
                            {isLogin ? 'Sign In' : 'Continue to Registration'}
                        </Button>
                    </form>

                    {/* Footer */}
                    {isLogin && (
                        <p className="text-center text-sm text-gray-500 dark:text-gray-400 pb-6">
                            Don't have an account?{' '}
                            <button
                                type="button"
                                onClick={() => setIsLogin(false)}
                                className="text-[hsl(248,80%,36%)] hover:underline font-medium"
                            >
                                Sign up
                            </button>
                        </p>
                    )}
                </Card>
            </div>
        </div>
    );
}
