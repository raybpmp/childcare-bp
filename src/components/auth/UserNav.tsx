import { useStore } from '@nanostores/react';
import { $authStore } from '../../store/authStore';
import { auth, signOut } from '@/lib/firebase-client';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LayoutDashboard, User as UserIcon, Settings, BarChart3, LogOut, LogIn, Shield } from 'lucide-react';
import { AuthModal } from './AuthModal';

export const UserNav = () => {
    const user = useStore($authStore);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

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
                            <PopoverContent align="end" className="w-52 p-2 rounded-xl bg-white/90 backdrop-blur-xl border border-white/40 shadow-2xl glass-panel">
                                <div className="px-2 pb-2 mb-2 border-b border-gray-100/50">
                                    <p className="text-xs font-black text-gray-900 truncate uppercase tracking-tight">
                                        {user.displayName || 'Portal User'}
                                    </p>
                                    <p className="pro-text-meta truncate lowercase">
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
                        className="flex items-center gap-1"
                    >
                        <AuthModal
                            mode="login"
                            trigger={
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-700 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all">
                                    <LogIn className="w-3.5 h-3.5" />
                                    <span className="sr-only">Sign In</span>
                                </Button>
                            }
                        />
                        <AuthModal
                            mode="signup"
                            trigger={
                                <Button className="h-8 px-2.5 text-[10px] font-black uppercase tracking-wider bg-gray-900 hover:bg-gray-800 text-white shadow-md rounded-lg transition-all">
                                    <span className="flex items-center gap-1.5">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Join Free</span>
                                    </span>
                                </Button>
                            }
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
