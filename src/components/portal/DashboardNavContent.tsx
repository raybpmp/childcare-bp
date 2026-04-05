import React from 'react';
import { LayoutDashboard, User as UserIcon, Settings, BarChart3 } from 'lucide-react';

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

    return (
        <nav className={`flex flex-col gap-1 ${className}`}>
            {navItems.map((item) => {
                const isActive = currentPath === item.href;
                return (
                    <a
                        key={item.name}
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                            isActive
                                ? "bg-teal-600 text-white shadow-lg shadow-teal-600/20"
                                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                        }`}
                    >
                        <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-gray-500"}`} />
                        <span>{item.name}</span>
                    </a>
                );
            })}
        </nav>
    );
};
