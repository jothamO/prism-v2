// =====================================================
// PRISM V2 - Chat Widget
// Floating chat with PRISM AI assistant
// =====================================================

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/domains/auth/service';
import { Button, Input } from '@/ui/components';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

interface ChatWidgetProps {
    userContext?: {
        totalIncome?: number;
        totalExpenses?: number;
        emtlPaid?: number;
        transactionCount?: number;
    };
}

const QUICK_QUESTIONS = [
    "What's my tax obligation?",
    "What is EMTL?",
    "How much VAT do I owe?",
    "Explain my deductions",
];

export function ChatWidget({ userContext }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isMinimized, setIsMinimized] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            role: 'assistant',
            content: "Hi! I'm PRISM, your Nigerian tax assistant. 👋 Ask me anything about your taxes, transactions, or financial obligations!",
        },
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const sendMessage = async (text: string) => {
        if (!text.trim() || loading) return;

        const userMessage: Message = { role: 'user', content: text };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const { data, error } = await supabase.functions.invoke('chat-assist', {
                body: {
                    message: text,
                    history: messages.slice(-6),
                    context: userContext,
                },
            });

            if (error) throw error;

            const assistantMessage: Message = {
                role: 'assistant',
                content: data.response || "I'm sorry, I couldn't process that request.",
            };
            setMessages(prev => [...prev, assistantMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [
                ...prev,
                {
                    role: 'assistant',
                    content: "I'm having trouble connecting right now. Please try again in a moment.",
                },
            ]);
        } finally {
            setLoading(false);
        }
    };

    // Closed state - floating button
    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-20 right-4 md:bottom-6 md:right-6 p-4 bg-[hsl(248,80%,36%)] text-white rounded-full shadow-lg hover:bg-[hsl(248,80%,32%)] transition-all hover:scale-105 z-50"
                aria-label="Open chat"
            >
                <span className="text-xl">💬</span>
            </button>
        );
    }

    return (
        <div
            className={`fixed bottom-20 right-4 md:bottom-6 md:right-6 bg-white dark:bg-[hsl(240,27%,20%)] rounded-2xl shadow-2xl z-50 flex flex-col transition-all ${isMinimized ? 'w-72 h-14' : 'w-[calc(100vw-2rem)] md:w-96 max-w-96 h-[70vh] md:h-[500px]'
                }`}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)] text-white rounded-t-2xl">
                <div className="flex items-center gap-2">
                    <span className="text-lg">🤖</span>
                    <span className="font-semibold">PRISM AI</span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={() => setIsMinimized(!isMinimized)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        {isMinimized ? '↗️' : '➖'}
                    </button>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        ✕
                    </button>
                </div>
            </div>

            {!isMinimized && (
                <>
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        {messages.map((msg, idx) => (
                            <div
                                key={idx}
                                className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.role === 'assistant' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(248,80%,36%)]/10 flex items-center justify-center">
                                        <span className="text-sm">🤖</span>
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] px-4 py-2.5 rounded-2xl text-sm ${msg.role === 'user'
                                            ? 'bg-[hsl(248,80%,36%)] text-white'
                                            : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-800 dark:text-gray-200'
                                        }`}
                                >
                                    {msg.content}
                                </div>
                                {msg.role === 'user' && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                                        <span className="text-sm">👤</span>
                                    </div>
                                )}
                            </div>
                        ))}
                        {loading && (
                            <div className="flex gap-2 justify-start">
                                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-[hsl(248,80%,36%)]/10 flex items-center justify-center">
                                    <span className="text-sm">🤖</span>
                                </div>
                                <div className="px-4 py-2.5 rounded-2xl bg-gray-100 dark:bg-[hsl(240,24%,26%)] flex items-center gap-2">
                                    <span className="animate-pulse">💭</span>
                                    <span className="text-sm text-gray-500">Thinking...</span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Questions */}
                    {messages.length <= 2 && (
                        <div className="px-4 pb-2">
                            <p className="text-xs text-gray-500 mb-2">Quick questions:</p>
                            <div className="flex flex-wrap gap-2">
                                {QUICK_QUESTIONS.map((q, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => sendMessage(q)}
                                        className="text-xs px-3 py-1.5 bg-[hsl(248,80%,36%)]/10 hover:bg-[hsl(248,80%,36%)]/20 rounded-full text-[hsl(248,80%,36%)] transition-colors"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-3 border-t border-gray-200 dark:border-[hsl(240,24%,30%)]">
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                                sendMessage(input);
                            }}
                            className="flex gap-2"
                        >
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask about your taxes..."
                                className="flex-1 h-10 px-4 rounded-xl border bg-gray-50 dark:bg-[hsl(240,24%,26%)] dark:border-[hsl(240,24%,30%)] text-sm focus:outline-none focus:ring-2 focus:ring-[hsl(248,80%,36%)]"
                                disabled={loading}
                            />
                            <Button type="submit" size="icon" disabled={loading || !input.trim()}>
                                📤
                            </Button>
                        </form>
                    </div>
                </>
            )}
        </div>
    );
}
