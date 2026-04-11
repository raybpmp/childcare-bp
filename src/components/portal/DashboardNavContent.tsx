import React from 'react';
import { useStore } from '@nanostores/react';
import { $authStore } from '@/store/authStore';
import { LayoutDashboard, User as UserIcon, Settings, BarChart3, Shield } from 'lucide-react';

const navItems = [
    {
        name: "Dashboard",
        href: "/portal",
        icon: LayoutDashboard,
    },
    {
        name: "Profile",
        href: "/portal/profile",
        icon: UserIcon,
    },
    {
        name: "Analytics",
        href: "/portal/analytics",
        icon: BarChart3,
    },
    {
        name: "Settings",
        href: "/portal/settings",
        icon: Settings,
    }
];

export const DashboardNavContent = ({ className = "" }: { className?: string }) => {
    // Detect active path if in browser
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';

    // Read role from Firebase Custom Claims (via auth store)
    const authUser = useStore($authStore);
    const isAdmin = authUser?.tierId !== undefined && authUser.tierId <= 2;

    return (
        <nav className={`flex flex-col gap-1 ${className}`}>
            {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                    <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                            isActive
                                ? "bg-teal-50/80 text-teal-700 border-l-2 border-teal-600 shadow-sm"
                                : "text-gray-500 hover:bg-gray-100/50 hover:text-gray-900"
                        }`}
                    >
                        <item.icon className={`h-3.5 w-3.5 ${isActive ? "text-teal-600" : "text-gray-400"}`} />
                        <span>{item.name}</span>
                    </a>
                );
            })}

            {/* Admin CRM link — only visible when Firebase token contains tierId <= 2 */}
            {isAdmin && (
                <>
                    <div className="my-2 border-t border-purple-100" />
                    <a
                        href="/portal/admin"
                        className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all duration-200 ${
                            currentPath === '/portal/admin'
                                ? "bg-purple-50/80 text-purple-700 border-l-2 border-purple-600 shadow-sm"
                                : "text-purple-500 hover:bg-purple-50/50 hover:text-purple-900"
                        }`}
                    >
                        <Shield className={`h-3.5 w-3.5 ${currentPath === '/portal/admin' ? "text-purple-600" : "text-purple-400"}`} />
                        <span>Admin CRM</span>
                    </a>
                </>
            )}
        </nav>
    );
};

