// =====================================================
// PRISM V2 - Admin Layout (Tablet/Desktop)
// Wrapper with sidebar for admin section
// =====================================================

import { Outlet } from 'react-router-dom';
import { AdminSidebar } from '@/ui/components';

export function AdminLayout() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-[hsl(240,30%,16%)]">
            {/* Sidebar */}
            <AdminSidebar />

            {/* Main Content - offset for sidebar */}
            <main className="ml-16 lg:ml-64 transition-all duration-300">
                <Outlet />
            </main>
        </div>
    );
}
