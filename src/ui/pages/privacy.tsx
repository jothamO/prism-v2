// =====================================================
// PRISM V2 - Privacy Policy Page
// =====================================================

import { Link } from 'react-router-dom';
import { Card } from '@/ui/components';

export function PrivacyPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,27%,10%)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Privacy Policy</h1>
                    <p className="text-white/80 mt-2">Last updated: January 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        1. Introduction
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        PRISM ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our tax assistance platform.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        2. Information We Collect
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Personal Information</h3>
                            <p>Name, email address, phone number, and other contact details you provide during registration.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Financial Information</h3>
                            <p>Bank transaction data accessed through our secure banking partner (Mono), including transaction descriptions, amounts, dates, and account balances.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Tax Information</h3>
                            <p>TIN, NIN (for verification), business registration details, and tax filing history.</p>
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">Usage Data</h3>
                            <p>Information about how you interact with our platform, including features used, pages visited, and device information.</p>
                        </div>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        3. How We Use Your Information
                    </h2>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Provide and maintain our tax assistance services</li>
                        <li>Categorize and analyze your transactions for tax purposes</li>
                        <li>Generate tax reports and filing recommendations</li>
                        <li>Send you tax deadline reminders and important notifications</li>
                        <li>Improve our AI classification and recommendation systems</li>
                        <li>Comply with legal obligations and regulatory requirements</li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        4. Data Security
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        We implement industry-standard security measures to protect your data:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li>AES-256 encryption for data at rest</li>
                        <li>TLS 1.3 for data in transit</li>
                        <li>Regular security audits and penetration testing</li>
                        <li>Multi-factor authentication options</li>
                        <li>Strict access controls and employee training</li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        5. NDPR Compliance
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        PRISM complies with the Nigeria Data Protection Regulation (NDPR). As a data subject, you have the right to access, rectify, erase, or port your personal data. You may also withdraw consent for data processing at any time. To exercise these rights, contact our Data Protection Officer at privacy@prism.ng.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        6. Third-Party Services
                    </h2>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <p>We use the following third-party services:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li><strong>Mono:</strong> Secure bank account connection (CBN licensed)</li>
                            <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
                            <li><strong>Anthropic:</strong> AI-powered transaction classification</li>
                        </ul>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        7. Contact Us
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        If you have questions about this Privacy Policy:
                    </p>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <p>📧 Email: privacy@prism.ng</p>
                        <p>📍 Address: Lagos, Nigeria</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
