// =====================================================
// PRISM V2 - Admin Sidebar (Tablet/Desktop)
// Collapsible sidebar for admin section
// =====================================================

import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/shared/utils';

interface NavGroup {
    title: string;
    items: Array<{
        path: string;
        label: string;
        icon: string;
    }>;
}

const navGroups: NavGroup[] = [
    {
        title: 'Overview',
        items: [
            { path: '/admin', label: 'Dashboard', icon: '📊' },
            { path: '/admin/users', label: 'Users', icon: '👥' },
            { path: '/admin/filings', label: 'Filings', icon: '📋' },
        ],
    },
    {
        title: 'Compliance',
        items: [
            { path: '/admin/compliance', label: 'Knowledge Base', icon: '⚖️' },
            { path: '/admin/compliance/documents', label: 'Documents', icon: '📄' },
            { path: '/admin/compliance/rules', label: 'Rules', icon: '📜' },
            { path: '/admin/compliance/gaps', label: 'Gap Tracking', icon: '🔍' },
        ],
    },
    {
        title: 'System',
        items: [
            { path: '/admin/analytics', label: 'Analytics', icon: '📈' },
            { path: '/admin/settings', label: 'Settings', icon: '⚙️' },
        ],
    },
];

export function AdminSidebar() {
    const [collapsed, setCollapsed] = useState(false);
    const [openGroups, setOpenGroups] = useState<string[]>(navGroups.map(g => g.title));
    const location = useLocation();

    // Persist sidebar state
    useEffect(() => {
        const saved = localStorage.getItem('admin-sidebar-collapsed');
        if (saved) setCollapsed(JSON.parse(saved));
    }, []);

    const toggleCollapsed = () => {
        const newState = !collapsed;
        setCollapsed(newState);
        localStorage.setItem('admin-sidebar-collapsed', JSON.stringify(newState));
    };

    const toggleGroup = (title: string) => {
        setOpenGroups(prev =>
            prev.includes(title)
                ? prev.filter(g => g !== title)
                : [...prev, title]
        );
    };

    return (
        <aside className={cn(
            'h-screen fixed left-0 top-0 z-40',
            'bg-white dark:bg-[hsl(240,27%,20%)]',
            'border-r border-gray-200 dark:border-[hsl(240,24%,30%)]',
            'transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Header */}
            <div className={cn(
                'h-16 flex items-center px-4 border-b border-gray-200 dark:border-[hsl(240,24%,30%)]',
                collapsed ? 'justify-center' : 'justify-between'
            )}>
                {!collapsed && (
                    <span className="text-xl font-bold text-[hsl(248,80%,36%)]">PRISM</span>
                )}
                <button
                    onClick={toggleCollapsed}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[hsl(240,24%,26%)]"
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>

            {/* Navigation */}
            <nav className="p-3 space-y-6 overflow-y-auto h-[calc(100%-4rem)]">
                {navGroups.map((group) => (
                    <div key={group.title}>
                        {!collapsed && (
                            <button
                                onClick={() => toggleGroup(group.title)}
                                className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider"
                            >
                                {group.title}
                                <span className="text-xs">{openGroups.includes(group.title) ? '▼' : '▶'}</span>
                            </button>
                        )}

                        {(collapsed || openGroups.includes(group.title)) && (
                            <div className="space-y-1 mt-1">
                                {group.items.map((item) => (
                                    <NavLink
                                        key={item.path}
                                        to={item.path}
                                        end={item.path === '/admin'}
                                        className={({ isActive }) => cn(
                                            'flex items-center gap-3 px-3 py-2.5 rounded-lg',
                                            'transition-colors',
                                            isActive
                                                ? 'bg-[hsl(248,80%,36%)]/10 text-[hsl(248,80%,36%)] dark:bg-[hsl(248,36%,53%)]/20 dark:text-[hsl(248,36%,53%)]'
                                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[hsl(240,24%,26%)]',
                                            collapsed && 'justify-center'
                                        )}
                                        title={collapsed ? item.label : undefined}
                                    >
                                        <span className="text-lg">{item.icon}</span>
                                        {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                                    </NavLink>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </nav>
        </aside>
    );
}
