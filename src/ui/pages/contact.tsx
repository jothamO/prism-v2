// =====================================================
// PRISM V2 - Contact Page
// =====================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Card, Button, Input } from '@/ui/components';

export function ContactPage() {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        // Simulate form submission
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSubmitted(true);
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,27%,10%)]">
            {/* Header */}
            <div className="bg-gradient-to-r from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white py-12 px-4">
                <div className="max-w-3xl mx-auto">
                    <Link to="/" className="text-white/80 hover:text-white text-sm mb-4 inline-block">
                        ← Back to Home
                    </Link>
                    <h1 className="text-3xl font-bold">Contact Us</h1>
                    <p className="text-white/80 mt-2">We'd love to hear from you</p>
                </div>
            </div>

            <div className="max-w-3xl mx-auto px-4 py-8">
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Contact Form */}
                    <Card>
                        {submitted ? (
                            <div className="text-center py-8">
                                <span className="text-5xl mb-4 block">✅</span>
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                                    Message Sent!
                                </h3>
                                <p className="text-gray-500 mb-4">
                                    We'll get back to you within 24 hours.
                                </p>
                                <Button onClick={() => setSubmitted(false)}>
                                    Send Another Message
                                </Button>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input
                                    label="Your Name"
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Email Address"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    required
                                />
                                <Input
                                    label="Subject"
                                    value={form.subject}
                                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                                    required
                                />
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                        Message
                                    </label>
                                    <textarea
                                        rows={5}
                                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-[hsl(240,24%,30%)] bg-gray-50 dark:bg-[hsl(240,24%,26%)] text-gray-900 dark:text-white"
                                        value={form.message}
                                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                                        required
                                    />
                                </div>
                                <Button type="submit" fullWidth loading={loading}>
                                    Send Message
                                </Button>
                            </form>
                        )}
                    </Card>

                    {/* Contact Info */}
                    <div className="space-y-4">
                        <Card>
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">📧</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Email</h3>
                                    <p className="text-gray-500">support@prism.ng</p>
                                    <p className="text-gray-500">sales@prism.ng</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">📱</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">WhatsApp</h3>
                                    <p className="text-gray-500">+234 XXX XXX XXXX</p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">📍</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Office</h3>
                                    <p className="text-gray-500">
                                        Victoria Island<br />
                                        Lagos, Nigeria
                                    </p>
                                </div>
                            </div>
                        </Card>

                        <Card>
                            <div className="flex items-start gap-4">
                                <span className="text-3xl">⏰</span>
                                <div>
                                    <h3 className="font-semibold text-gray-900 dark:text-white">Business Hours</h3>
                                    <p className="text-gray-500">
                                        Monday - Friday: 9am - 6pm<br />
                                        Saturday: 10am - 2pm
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
