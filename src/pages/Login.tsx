// =====================================================
// PRISM V2 - Login Page
// Email/password authentication
// =====================================================

import { useState, forwardRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { Button, Input, Card } from '@/ui/components';

export const Login = forwardRef<HTMLDivElement, object>(function Login(_, ref) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const { signIn, error, clearError } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/dashboard';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();
        setSubmitting(true);

        try {
            await signIn(email, password);
            navigate(from, { replace: true });
        } catch {
            // Error is handled by useAuth
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div ref={ref} className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[hsl(240,30%,16%)] px-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)]">
                        PRISM
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-2">
                        Sign in to your account
                    </p>
                </div>

                <Card className="p-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="p-3 rounded-xl bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)] text-sm">
                                {error}
                            </div>
                        )}

                        <Input
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                        />

                        <Input
                            label="Password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        <Button
                            type="submit"
                            fullWidth
                            loading={submitting}
                        >
                            Sign In
                        </Button>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Don't have an account?{' '}
                            <Link
                                to="/signup"
                                className="font-medium text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)] hover:underline"
                            >
                                Sign up
                            </Link>
                        </p>
                    </div>
            </Card>
            </div>
        </div>
    );
});

export default Login;
