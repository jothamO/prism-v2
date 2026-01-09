// =====================================================
// PRISM V2 - Terms of Service Page
// =====================================================

import { Link } from 'react-router-dom';
import { Card } from '@/ui/components';

export function TermsPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,27%,10%)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Terms of Service</h1>
                    <p className="text-white/80 mt-2">Last updated: January 2026</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        1. Acceptance of Terms
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        By accessing or using PRISM, you agree to be bound by these Terms of Service. If you disagree with any part of these terms, you may not access the service.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        2. Description of Service
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed mb-4">
                        PRISM is a tax assistance platform that provides:
                    </p>
                    <ul className="list-disc list-inside space-y-2 text-gray-600 dark:text-gray-400">
                        <li>Automated transaction categorization for tax purposes</li>
                        <li>Tax calculation and estimation tools</li>
                        <li>Tax filing reminders and deadline tracking</li>
                        <li>AI-powered tax advisory assistance</li>
                        <li>Integration with Nigerian banking institutions</li>
                    </ul>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        3. User Responsibilities
                    </h2>
                    <div className="space-y-4 text-gray-600 dark:text-gray-400">
                        <p>As a user of PRISM, you agree to:</p>
                        <ul className="list-disc list-inside space-y-2">
                            <li>Provide accurate and complete information</li>
                            <li>Maintain the confidentiality of your account credentials</li>
                            <li>Notify us immediately of any unauthorized use</li>
                            <li>Use the service in compliance with all applicable laws</li>
                            <li>Not attempt to reverse engineer or exploit the service</li>
                        </ul>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        4. Disclaimer
                    </h2>
                    <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-800">
                        <p className="text-amber-800 dark:text-amber-200 font-medium mb-2">
                            ⚠️ Important Notice
                        </p>
                        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                            PRISM is a tax assistance tool and does not constitute professional tax advice. While we strive for accuracy, tax calculations and recommendations are estimates only. Users are responsible for reviewing all tax information and should consult with qualified tax professionals for definitive advice. PRISM is not liable for any errors, omissions, or decisions made based on the information provided.
                        </p>
                    </div>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        5. Intellectual Property
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        The PRISM service, including its original content, features, and functionality, is owned by PRISM and protected by Nigerian and international copyright, trademark, patent, trade secret, and other intellectual property laws.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        6. Termination
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        We may terminate or suspend your account immediately, without prior notice, for conduct that we believe violates these Terms or is harmful to other users, us, or third parties, or for any other reason at our sole discretion.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        7. Limitation of Liability
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        In no event shall PRISM, its directors, employees, partners, or affiliates be liable for any indirect, incidental, special, consequential, or punitive damages, including lost profits, arising from your use of the service.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        8. Governing Law
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                        These Terms shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria, without regard to its conflict of law provisions. Any disputes arising from these Terms shall be resolved in the courts of Lagos, Nigeria.
                    </p>
                </Card>

                <Card>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                        9. Contact
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                        For questions about these Terms:
                    </p>
                    <div className="space-y-2 text-gray-600 dark:text-gray-400">
                        <p>📧 Email: legal@prism.ng</p>
                        <p>📍 Address: Lagos, Nigeria</p>
                    </div>
                </Card>
            </div>
        </div>
    );
}
