// =====================================================
// PRISM V2 - Index/Landing Page
// Redirects authenticated users, shows landing for guests
// =====================================================

import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/domains/auth';
import { Button, Card } from '@/ui/components';

const Index = () => {
    const { user, loading } = useAuth();

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[hsl(240,30%,16%)]">
                <div className="w-12 h-12 rounded-full border-4 border-[hsl(248,80%,36%)] border-t-transparent animate-spin" />
            </div>
        );
    }

    // Redirect authenticated users to dashboard
    if (user) {
        return <Navigate to="/dashboard" replace />;
    }

    // Landing page for guests
    return (
        <div className="min-h-screen bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)]">
            <div className="container mx-auto px-4 py-12">
                {/* Hero */}
                <div className="text-center py-16 md:py-24">
                    <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
                        PRISM
                    </h1>
                    <p className="text-xl md:text-2xl text-white/80 mb-8 max-w-2xl mx-auto">
                        Simplify your tax compliance with intelligent transaction tracking and automated categorization.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Link to="/signup">
                            <Button className="!bg-white !text-[hsl(248,80%,36%)] hover:!bg-gray-100 px-8">
                                Get Started Free
                            </Button>
                        </Link>
                        <Link to="/login">
                            <Button variant="outline" className="!border-white !text-white hover:!bg-white/10 px-8">
                                Sign In
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Features */}
                <div className="grid md:grid-cols-3 gap-6 py-12">
                    <Card className="text-center p-8">
                        <div className="text-4xl mb-4">📊</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Tax Health Score
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Real-time visibility into your tax readiness
                        </p>
                    </Card>
                    <Card className="text-center p-8">
                        <div className="text-4xl mb-4">🏦</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            Bank Sync
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Automatic transaction import from your accounts
                        </p>
                    </Card>
                    <Card className="text-center p-8">
                        <div className="text-4xl mb-4">🤖</div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                            AI Categorization
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            Smart classification of income and expenses
                        </p>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default Index;
