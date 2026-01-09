// =====================================================
// PRISM V2 - Landing Page
// Public homepage with features
// =====================================================

import { Link } from 'react-router-dom';
import { Button } from '@/ui/components';

export function LandingPage() {
    const features = [
        {
            icon: '📊',
            title: 'Smart Tax Tracking',
            description: 'Automatically categorize transactions and calculate your tax liability',
        },
        {
            icon: '🏦',
            title: 'Bank Integration',
            description: 'Connect your Nigerian bank accounts via Mono for automatic sync',
        },
        {
            icon: '🤖',
            title: 'AI Classification',
            description: '3-tier classification engine: Pattern → History → AI',
        },
        {
            icon: '📋',
            title: 'Compliance Ready',
            description: 'Stay compliant with FIRS, LIRS, and other regulatory bodies',
        },
        {
            icon: '📈',
            title: 'Financial Insights',
            description: 'Charts and analytics to understand your financial health',
        },
        {
            icon: '👥',
            title: 'Team Collaboration',
            description: 'Invite your accountant or team members to collaborate',
        },
    ];

    return (
        <div className="min-h-screen bg-[hsl(240,6%,97%)] dark:bg-[hsl(240,27%,13%)]">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-[hsl(240,27%,20%)]/80 backdrop-blur-lg border-b border-gray-200 dark:border-[hsl(240,24%,30%)]">
                <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
                    <Link to="/" className="text-2xl font-bold text-[hsl(248,80%,36%)]">
                        PRISM
                    </Link>
                    <div className="flex items-center gap-4">
                        <Link to="/auth" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                            Login
                        </Link>
                        <Link to="/auth">
                            <Button>Get Started</Button>
                        </Link>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="px-4 py-20 text-center">
                <div className="max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                        Smart Tax Management for{' '}
                        <span className="text-[hsl(248,80%,36%)]">Nigerian Businesses</span>
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Automate transaction categorization, calculate taxes in real-time,
                        and stay compliant with Nigerian tax regulations.
                    </p>
                    <div className="flex gap-4 justify-center">
                        <Link to="/auth">
                            <Button size="lg">Start Free Trial</Button>
                        </Link>
                        <Link to="/auth">
                            <Button variant="outline" size="lg">Watch Demo</Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="px-4 py-16 bg-white dark:bg-[hsl(240,27%,20%)]">
                <div className="max-w-6xl mx-auto">
                    <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
                        Everything You Need
                    </h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {features.map((feature) => (
                            <div
                                key={feature.title}
                                className="p-6 rounded-2xl bg-[hsl(240,6%,97%)] dark:bg-[hsl(240,24%,26%)] hover:shadow-lg transition-shadow"
                            >
                                <span className="text-4xl mb-4 block">{feature.icon}</span>
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="px-4 py-20">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
                        Ready to Simplify Your Taxes?
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
                        Join thousands of Nigerian businesses using PRISM
                    </p>
                    <Link to="/auth">
                        <Button size="lg">Get Started Free</Button>
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="px-4 py-8 border-t border-gray-200 dark:border-[hsl(240,24%,30%)]">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-gray-500 dark:text-gray-400">
                        © 2026 PRISM. All rights reserved.
                    </div>
                    <div className="flex gap-6">
                        <Link to="/privacy" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Privacy
                        </Link>
                        <Link to="/terms" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Terms
                        </Link>
                        <Link to="/contact" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
                            Contact
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}
