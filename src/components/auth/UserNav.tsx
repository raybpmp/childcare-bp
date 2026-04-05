import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '@/lib/firebase-client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LayoutDashboard, User as UserIcon, Settings, BarChart3, LogOut } from 'lucide-react';

import { AuthModal } from './AuthModal';

export const UserNav = () => {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    if (loading) {
        return <div className="w-24 h-9 bg-gray-100/50 animate-pulse rounded-full"></div>;
    }

    return (
        <div className="flex items-center gap-3">
            <AnimatePresence mode="wait">
                {user ? (
                    <motion.div 
                        key="logged-in"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-3"
                    >
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button className="relative rounded-full h-10 w-10 p-0 overflow-hidden bg-gray-900 hover:bg-gray-800 text-white shadow-lg border border-gray-200 focus-visible:ring-2 focus-visible:ring-teal-500 transition-transform hover:scale-105 active:scale-95">
                                    {user.photoURL ? (
                                        <img src={user.photoURL} alt="User Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <span className="font-bold text-sm">
                                            {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
                                        </span>
                                    )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent align="end" className="w-56 p-2 rounded-xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl glass-panel">
                                <div className="px-2 pb-2 mb-2 border-b border-gray-100/50">
                                    <p className="text-sm font-semibold text-gray-900 truncate">
                                        {user.displayName || 'Portal User'}
                                    </p>
                                    <p className="text-xs text-gray-500 truncate">
                                        {user.email}
                                    </p>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <a href="/portal" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <LayoutDashboard className="h-4 w-4" />
                                        <span>Dashboard</span>
                                    </a>
                                    <a href="/portal/profile" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <UserIcon className="h-4 w-4" />
                                        <span>Profile</span>
                                    </a>
                                    <a href="/portal/analytics" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <BarChart3 className="h-4 w-4" />
                                        <span>Analytics</span>
                                    </a>
                                    <a href="/portal/settings" className="flex items-center gap-2 px-2 py-2 text-sm text-gray-700 rounded-lg hover:bg-teal-50 hover:text-teal-700 transition-colors">
                                        <Settings className="h-4 w-4" />
                                        <span>Settings</span>
                                    </a>
                                    <Button 
                                        variant="ghost" 
                                        onClick={handleLogout}
                                        className="w-full justify-start gap-2 px-2 py-2 mt-1 h-9 rounded-lg text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors font-medium border-0"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        <span>Logout</span>
                                    </Button>
                                </div>
                            </PopoverContent>
                        </Popover>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="logged-out"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                    >
                        <AuthModal mode="login" />
                        <AuthModal mode="signup" />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
