import React, { useEffect, useState } from 'react';
import { auth, onAuthStateChanged, signOut } from '@/lib/firebase-client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

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
                        <a href="/portal">
                            <Button className="rounded-full bg-teal-600 hover:bg-teal-700 text-white shadow-lg shadow-teal-600/20 px-6">
                                Dashboard
                            </Button>
                        </a>
                        <Button 
                            variant="ghost" 
                            onClick={handleLogout}
                            className="rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                            Logout
                        </Button>
                    </motion.div>
                ) : (
                    <motion.div 
                        key="logged-out"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        className="flex items-center gap-2"
                    >
                        <a href="/login">
                            <Button variant="ghost" className="rounded-full text-gray-700 hover:text-teal-600 transition-colors">
                                Login
                            </Button>
                        </a>
                        <a href="/login?mode=signup">
                            <Button className="rounded-full bg-gray-900 hover:bg-gray-800 text-white shadow-lg px-6">
                                Join Free
                            </Button>
                        </a>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
