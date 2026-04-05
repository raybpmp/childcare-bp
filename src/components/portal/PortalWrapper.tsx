import React from 'react';
import { DashboardNavContent } from './DashboardNavContent';

export const PortalWrapper = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className="flex min-h-[calc(100vh-6rem)] w-full max-w-7xl mx-auto px-4 md:px-8 gap-4 md:gap-8 py-4 md:py-8">
            {/* Desktop Sidebar (hidden on mobile, visible on md+) */}
            <aside className="hidden md:block w-64 shrink-0">
                <div className="sticky top-28 space-y-4">
                    <div className="p-4 bg-white/50 backdrop-blur-xl border border-white/20 rounded-2xl shadow-sm">
                        <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 mb-4">
                            Platform Navigation
                        </h3>
                        <DashboardNavContent />
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 min-w-0">
                {children}
            </main>
        </div>
    );
};
