// =====================================================
// PRISM V2 - Card Components
// Cards for tax health, stats, and transactions
// =====================================================

import { type ReactNode, type HTMLAttributes } from 'react';
import { cn } from '@/shared/utils';

// Base Card
interface CardProps extends HTMLAttributes<HTMLDivElement> {
    children: ReactNode;
    hover?: boolean;
}

export function Card({ className, children, hover, ...props }: CardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl bg-white p-6',
                'shadow-[0_4px_30px_rgba(54,41,183,0.07)]',
                'dark:bg-[hsl(240,27%,20%)] dark:shadow-[0_4px_30px_rgba(0,0,0,0.3)]',
                hover && 'transition-transform hover:scale-[1.02] cursor-pointer',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// Tax Health Card (Hero)
interface TaxHealthCardProps {
    score: number;
    ytdIncome: number;
    taxReady: boolean;
    className?: string;
}

export function TaxHealthCard({ score, ytdIncome, taxReady, className }: TaxHealthCardProps) {
    return (
        <div
            className={cn(
                'rounded-3xl p-6',
                'bg-gradient-to-br from-[hsl(248,80%,36%)] to-[hsl(248,36%,53%)]',
                'text-white shadow-lg',
                className
            )}
        >
            <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl">🎯</span>
                <span className="text-lg font-medium opacity-90">Your Tax Health</span>
            </div>

            {/* Progress bar */}
            <div className="mb-4">
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-[hsl(164,59%,58%)] rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(score, 100)}%` }}
                    />
                </div>
                <div className="flex justify-end mt-1">
                    <span className="text-2xl font-bold">{score}%</span>
                </div>
            </div>

            <div className="flex items-center justify-between text-sm opacity-90">
                <span>YTD Income: ₦{(ytdIncome / 1000000).toFixed(1)}M</span>
                <span className="flex items-center gap-1">
                    {taxReady ? '✓ Tax-Ready' : '⚠ Needs Review'}
                </span>
            </div>
        </div>
    );
}

// Stat Card
interface StatCardProps {
    title: string;
    value: string | number;
    change?: string;
    trend?: 'up' | 'down' | 'neutral';
    icon?: ReactNode;
    className?: string;
}

export function StatCard({ title, value, change, trend, icon, className }: StatCardProps) {
    return (
        <Card className={cn('flex flex-col', className)}>
            <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">{title}</span>
                {icon && <span className="text-xl">{icon}</span>}
            </div>
            <span className="text-2xl font-bold text-gray-900 dark:text-white">
                {typeof value === 'number' ? `₦${value.toLocaleString()}` : value}
            </span>
            {change && (
                <span className={cn(
                    'text-sm mt-1',
                    trend === 'up' && 'text-[hsl(164,59%,58%)]',
                    trend === 'down' && 'text-[hsl(346,96%,63%)]',
                    trend === 'neutral' && 'text-gray-500'
                )}>
                    {trend === 'up' && '↑ '}
                    {trend === 'down' && '↓ '}
                    {change}
                </span>
            )}
        </Card>
    );
}

// Transaction Card
interface TransactionCardProps {
    icon: string;
    title: string;
    subtitle: string;
    amount: number;
    type: 'credit' | 'debit';
    needsCategorization?: boolean;
    onClick?: () => void;
    className?: string;
}

export function TransactionCard({
    icon,
    title,
    subtitle,
    amount,
    type,
    needsCategorization,
    onClick,
    className,
}: TransactionCardProps) {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex items-center gap-4 p-4 rounded-xl',
                'bg-white dark:bg-[hsl(240,27%,20%)]',
                'hover:bg-gray-50 dark:hover:bg-[hsl(240,24%,26%)]',
                onClick && 'cursor-pointer',
                className
            )}
        >
            <div className="w-12 h-12 rounded-full bg-[hsl(248,80%,36%)]/10 flex items-center justify-center text-xl">
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{title}</p>
                <p className={cn(
                    'text-sm truncate',
                    needsCategorization ? 'text-[hsl(38,100%,58%)]' : 'text-gray-500 dark:text-gray-400'
                )}>
                    {subtitle}
                </p>
            </div>
            <span className={cn(
                'font-semibold whitespace-nowrap',
                type === 'credit' ? 'text-[hsl(164,59%,58%)]' : 'text-gray-900 dark:text-white'
            )}>
                {type === 'credit' ? '+' : '-'}₦{Math.abs(amount).toLocaleString()}
            </span>
        </div>
    );
}
