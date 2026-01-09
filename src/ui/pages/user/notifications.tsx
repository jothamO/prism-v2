// =====================================================
// PRISM V2 - Notifications Page
// =====================================================

import { useState } from 'react';
import { Card, Button, SearchInput } from '@/ui/components';

interface Notification {
    id: string;
    type: 'deadline' | 'transaction' | 'ai' | 'update';
    title: string;
    message: string;
    read: boolean;
    createdAt: string;
}

const MOCK_NOTIFICATIONS: Notification[] = [
    {
        id: '1',
        type: 'deadline',
        title: 'VAT Deadline Approaching',
        message: 'Your monthly VAT return is due on January 21st. Don\'t forget to file!',
        read: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        type: 'transaction',
        title: 'New Transactions Synced',
        message: '12 new transactions were imported from your GTBank account.',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '3',
        type: 'ai',
        title: 'AI Classification Complete',
        message: '45 transactions have been automatically categorized.',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
    {
        id: '4',
        type: 'update',
        title: 'New Feature: WhatsApp Integration',
        message: 'You can now chat with PRISM on WhatsApp! Link your number in settings.',
        read: true,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
    },
];

export function NotificationsPage() {
    const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const getIcon = (type: string) => {
        switch (type) {
            case 'deadline': return '📅';
            case 'transaction': return '🏦';
            case 'ai': return '🤖';
            case 'update': return '🆕';
            default: return '🔔';
        }
    };

    const markAsRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, read: true } : n
        ));
    };

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const filteredNotifications = filter === 'unread'
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Notifications
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {unreadCount > 0 ? `${unreadCount} unread` : 'All caught up!'}
                    </p>
                </div>
                {unreadCount > 0 && (
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                        Mark all read
                    </Button>
                )}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'all'
                            ? 'bg-[hsl(248,80%,36%)] text-white'
                            : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600'
                        }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('unread')}
                    className={`px-4 py-2 rounded-xl text-sm font-medium ${filter === 'unread'
                            ? 'bg-[hsl(248,80%,36%)] text-white'
                            : 'bg-gray-100 dark:bg-[hsl(240,24%,26%)] text-gray-600'
                        }`}
                >
                    Unread ({unreadCount})
                </button>
            </div>

            {/* Notifications List */}
            {filteredNotifications.length === 0 ? (
                <Card className="text-center py-12">
                    <span className="text-4xl mb-4 block">🔔</span>
                    <p className="text-gray-500">No notifications</p>
                </Card>
            ) : (
                <div className="space-y-3">
                    {filteredNotifications.map(notification => (
                        <Card
                            key={notification.id}
                            hover
                            onClick={() => markAsRead(notification.id)}
                            className={`cursor-pointer ${!notification.read ? 'border-l-4 border-l-[hsl(248,80%,36%)]' : ''}`}
                        >
                            <div className="flex gap-4">
                                <div className="w-10 h-10 rounded-xl bg-[hsl(248,80%,36%)]/10 flex items-center justify-center flex-shrink-0">
                                    <span className="text-lg">{getIcon(notification.type)}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className={`font-medium ${notification.read
                                                ? 'text-gray-700 dark:text-gray-300'
                                                : 'text-gray-900 dark:text-white'
                                            }`}>
                                            {notification.title}
                                        </h3>
                                        {!notification.read && (
                                            <span className="w-2 h-2 rounded-full bg-[hsl(248,80%,36%)]" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        {notification.message}
                                    </p>
                                    <p className="text-xs text-gray-400 mt-2">
                                        {new Date(notification.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
