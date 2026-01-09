// =====================================================
// PRISM V2 - Bottom Navigation (Mobile)
// Fixed bottom nav for user section
// =====================================================

import { NavLink } from 'react-router-dom';
import { cn } from '@/shared/utils';

interface NavItem {
    path: string;
    label: string;
    icon: string;
}

const navItems: NavItem[] = [
    { path: '/dashboard', label: 'Home', icon: '🏠' },
    { path: '/transactions', label: 'Transactions', icon: '💳' },
    { path: '/tax', label: 'Tax', icon: '📊' },
    { path: '/profile', label: 'Me', icon: '👤' },
];

export function BottomNavigation() {
    return (
        <nav className={cn(
            'fixed bottom-0 left-0 right-0 z-50',
            'bg-white dark:bg-[hsl(240,27%,20%)]',
            'border-t border-gray-200 dark:border-[hsl(240,24%,30%)]',
            'safe-area-pb' // For iOS notch
        )}>
            <div className="flex justify-around h-16">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => cn(
                            'flex flex-col items-center justify-center flex-1 gap-1',
                            'text-gray-500 dark:text-gray-400',
                            'transition-colors',
                            isActive && 'text-[hsl(248,80%,36%)] dark:text-[hsl(248,36%,53%)]'
                        )}
                    >
                        <span className="text-xl">{item.icon}</span>
                        <span className="text-xs font-medium">{item.label}</span>
                    </NavLink>
                ))}
            </div>
        </nav>
    );
}
