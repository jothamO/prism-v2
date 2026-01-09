// =====================================================
// PRISM V2 - User Layout (Mobile-First)
// Wrapper with bottom navigation for user section
// =====================================================

import { Outlet } from 'react-router-dom';
import { BottomNavigation } from '@/ui/components';

export function UserLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,30%,16%)]">
            {/* Main Content */}
            <main className="pb-16">
                <Outlet />
            </main>

            {/* Bottom Navigation */}
            <BottomNavigation />
        </div>
    );
}
