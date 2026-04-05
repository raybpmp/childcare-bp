import * as React from "react";
import { 
    Menu, 
    LogOut, 
    User, 
    LayoutDashboard, 
    Home, 
    FileText, 
    MessageSquare, 
    ChevronRight,
    Settings,
    BarChart3,
    Shield,
    LogIn
} from "lucide-react";
import { auth, onAuthStateChanged, signOut } from "@/lib/firebase-client";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetTrigger,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetFooter,
    SheetClose,
} from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

const mainNavLinks = [
    { href: "/", label: "Home", icon: Home },
    { href: "/childcarebusinessplans", label: "Plans", icon: FileText },
    { href: "/blog", label: "Blog", icon: MessageSquare },
];

const portalNavLinks = [
    { href: "/portal", label: "Dashboard", icon: LayoutDashboard },
    { href: "/portal/profile", label: "Profile", icon: User },
    { href: "/portal/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/portal/settings", label: "Settings", icon: Settings },
];

import { AuthModal } from "./auth/AuthModal";

export function MobileNav() {
    const [user, setUser] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    if (loading) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-700 hover:bg-teal-50 hover:text-teal-600 transition-all active:scale-90"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[380px] p-0 border-l border-white/20 glass-panel-dark flex flex-col shadow-2xl">
                <SheetHeader className="p-6 border-b border-white/10">
                    <SheetTitle className="text-left">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-teal-400 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-teal-500/20">
                                C
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 tracking-tight leading-none text-base">Childcare</span>
                                <span className="text-xs text-gray-500 font-medium tracking-wide uppercase mt-1">Business Plan</span>
                            </div>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-6 scrollbar-hide flex flex-col">
                    {/* Main Section */}
                    <div className="mb-8">
                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-3">Main Navigation</h4>
                        <div className="space-y-1">
                            {mainNavLinks.map((link, idx) => (
                                <SheetClose key={link.href} asChild>
                                    <motion.a
                                        href={link.href}
                                        initial={{ opacity: 0, x: 20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="group flex items-center justify-between px-4 py-3 rounded-2xl text-gray-600 hover:text-teal-700 hover:bg-white/40 transition-all duration-300"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 rounded-xl bg-gray-100/50 text-gray-500 group-hover:bg-teal-100 group-hover:text-teal-600 transition-all">
                                                <link.icon className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-sm">{link.label}</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                    </motion.a>
                                </SheetClose>
                            ))}
                        </div>
                    </div>

                    {/* Authenticated Portal Section */}
                    <AnimatePresence>
                        {user && (
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: 10 }}
                                className="mb-6"
                            >
                                <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] px-4 mb-3">Your Account</h4>
                                <div className="space-y-1">
                                    {portalNavLinks.map((link, idx) => (
                                        <SheetClose key={link.href} asChild>
                                            <motion.a
                                                href={link.href}
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 + idx * 0.05 }}
                                                className="group flex items-center justify-between px-4 py-3 rounded-2xl text-gray-600 hover:text-teal-700 hover:bg-white/40 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-sm">
                                                        <link.icon className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-sm">{link.label}</span>
                                                </div>
                                                <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                            </motion.a>
                                        </SheetClose>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 mt-auto bg-gray-100/30 border-t border-white/20 backdrop-blur-xl">
                    {user ? (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-3 rounded-2xl h-14 bg-red-50/50 hover:bg-red-50 text-red-600 border border-red-100 transition-all font-bold"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Logout</span>
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-3">
                            <AuthModal 
                                mode="signup" 
                                trigger={
                                    <Button className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl bg-gray-900 hover:bg-gray-800 text-white font-bold transition-all shadow-lg active:scale-95">
                                        <Shield className="w-4 h-4" />
                                        <span>Create Account</span>
                                    </Button>
                                } 
                            />
                            <AuthModal 
                                mode="login" 
                                trigger={
                                    <Button variant="ghost" className="w-full h-14 flex items-center justify-center gap-2 rounded-2xl border-2 border-gray-200 bg-white/50 hover:bg-white text-gray-700 font-bold transition-all active:scale-95">
                                        <LogIn className="w-4 h-4" />
                                        <span>Sign In</span>
                                    </Button>
                                } 
                            />
                        </div>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}

