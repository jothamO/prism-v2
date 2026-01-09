// =====================================================
// PRISM V2 - Tax Calendar Page
// Filing deadlines and reminders
// =====================================================

import { useMemo } from 'react';
import { Card } from '@/ui/components';

interface TaxDeadline {
    id: string;
    title: string;
    date: Date;
    type: 'vat' | 'paye' | 'cit' | 'annual' | 'wht';
    description: string;
    priority: 'high' | 'medium' | 'low';
}

// Nigerian tax deadlines
const TAX_DEADLINES_2026: TaxDeadline[] = [
    { id: '1', title: 'VAT Return - January', date: new Date('2026-01-21'), type: 'vat', description: 'VAT for December 2025', priority: 'high' },
    { id: '2', title: 'PAYE Remittance', date: new Date('2026-01-10'), type: 'paye', description: 'PAYE for December 2025', priority: 'high' },
    { id: '3', title: 'Annual Tax Returns', date: new Date('2026-03-31'), type: 'annual', description: 'Individual P.I.T. returns for 2025', priority: 'high' },
    { id: '4', title: 'CIT Filing', date: new Date('2026-06-30'), type: 'cit', description: 'Company Income Tax for 2025', priority: 'medium' },
    { id: '5', title: 'WHT Remittance', date: new Date('2026-01-21'), type: 'wht', description: 'Withholding tax for December', priority: 'medium' },
];

export function TaxCalendarPage() {
    const now = new Date();

    const sortedDeadlines = useMemo(() => {
        return [...TAX_DEADLINES_2026]
            .sort((a, b) => a.date.getTime() - b.date.getTime());
    }, []);

    const upcomingDeadlines = sortedDeadlines.filter(d => d.date >= now);
    const pastDeadlines = sortedDeadlines.filter(d => d.date < now);

    const getDaysUntil = (date: Date) => {
        const diff = date.getTime() - now.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'vat': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'paye': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400';
            case 'cit': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'annual': return 'bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)]';
            case 'wht': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="pb-20 px-4 pt-6 space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Tax Calendar
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                    Track your filing deadlines
                </p>
            </div>

            {/* Upcoming Deadlines */}
            <Card>
                <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                    Upcoming Deadlines
                </h2>
                <div className="space-y-3">
                    {upcomingDeadlines.length === 0 ? (
                        <p className="text-gray-500 text-center py-4">No upcoming deadlines 🎉</p>
                    ) : (
                        upcomingDeadlines.map((deadline) => {
                            const daysUntil = getDaysUntil(deadline.date);
                            return (
                                <div
                                    key={deadline.id}
                                    className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 dark:bg-[hsl(240,24%,26%)]"
                                >
                                    <div className="text-center min-w-[50px]">
                                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                            {deadline.date.getDate()}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {deadline.date.toLocaleString('default', { month: 'short' })}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(deadline.type)}`}>
                                                {deadline.type.toUpperCase()}
                                            </span>
                                            {daysUntil <= 7 && (
                                                <span className="px-2 py-0.5 text-xs rounded-full bg-[hsl(346,96%,63%)]/10 text-[hsl(346,96%,63%)]">
                                                    {daysUntil === 0 ? 'Today!' : `${daysUntil} days`}
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="font-medium text-gray-900 dark:text-white">
                                            {deadline.title}
                                        </h3>
                                        <p className="text-sm text-gray-500">{deadline.description}</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </Card>

            {/* Past Deadlines */}
            {pastDeadlines.length > 0 && (
                <Card>
                    <h2 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Past Deadlines
                    </h2>
                    <div className="space-y-3 opacity-60">
                        {pastDeadlines.map((deadline) => (
                            <div
                                key={deadline.id}
                                className="flex items-center gap-4 p-3 rounded-xl"
                            >
                                <span className="text-sm text-gray-500">
                                    {deadline.date.toLocaleDateString()}
                                </span>
                                <span className={`px-2 py-0.5 text-xs rounded-full ${getTypeColor(deadline.type)}`}>
                                    {deadline.type.toUpperCase()}
                                </span>
                                <span className="text-gray-700 dark:text-gray-300">
                                    {deadline.title}
                                </span>
                            </div>
                        ))}
                    </div>
                </Card>
            )}

            {/* Legend */}
            <Card>
                <h3 className="text-sm font-semibold text-gray-500 mb-3">Legend</h3>
                <div className="flex flex-wrap gap-2">
                    {['vat', 'paye', 'cit', 'annual', 'wht'].map((type) => (
                        <span key={type} className={`px-3 py-1 text-xs rounded-full ${getTypeColor(type)}`}>
                            {type.toUpperCase()}
                        </span>
                    ))}
                </div>
            </Card>
        </div>
    );
}
