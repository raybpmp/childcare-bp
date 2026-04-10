import React, { useState } from "react";
import { useStore } from '@nanostores/react';
import { $authStore } from '../store/authStore';
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
import { auth, signOut } from "@/lib/firebase-client";
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
    const user = useStore($authStore);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            window.location.href = "/";
        } catch (error) {
            console.error("Logout failed:", error);
        }
    };

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden text-gray-700 hover:bg-gray-100/50 transition-all active:scale-90 w-9 h-9"
                    aria-label="Open menu"
                >
                    <Menu className="h-5 w-5" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] sm:w-[320px] p-0 border-l border-white/20 glass-panel-dark flex flex-col shadow-2xl">
                <SheetHeader className="p-4 border-b border-white/10 shrink-0">
                    <SheetTitle className="text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
                                C
                            </div>
                            <div className="flex flex-col">
                                <span className="font-bold text-gray-900 tracking-tight leading-none text-sm">Childcare</span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">Business Plan</span>
                            </div>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto px-4 py-4 scrollbar-hide flex flex-col">
                    {/* Main Section */}
                    <div className="mb-6">
                        <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] px-3 mb-2">Main</h4>
                        <ul className="space-y-0.5">
                            {mainNavLinks.map((link, idx) => (
                                <li key={link.href}>
                                    <SheetClose asChild>
                                        <motion.a
                                            href={link.href}
                                            initial={{ opacity: 0, x: 10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: idx * 0.03, duration: 0.2, ease: "easeOut" }}
                                            className="group flex items-center justify-between px-3 py-1.5 rounded-lg text-gray-700 hover:bg-gray-100/50 transition-all"
                                        >
                                            <div className="flex items-center gap-2.5">
                                                <link.icon className="w-4 h-4 text-gray-500 group-hover:text-teal-600 transition-colors" />
                                                <span className="font-medium text-[13px]">{link.label}</span>
                                            </div>
                                            <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-gray-400" />
                                        </motion.a>
                                    </SheetClose>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <AnimatePresence>
                        {user && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="mb-4"
                            >
                                <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2">Portal</h4>
                                <ul className="space-y-0.5">
                                    {portalNavLinks.map((link, idx) => (
                                        <li key={link.href}>
                                            <SheetClose asChild>
                                                <motion.a
                                                    href={link.href}
                                                    initial={{ opacity: 0, x: 10 }}
                                                    animate={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: 0.1 + idx * 0.03, duration: 0.2, ease: "easeOut" }}
                                                    className="group flex items-center justify-between px-3 py-1.5 rounded-lg text-gray-700 hover:bg-teal-50/50 hover:text-teal-800 transition-all"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        <link.icon className="w-4 h-4 text-teal-600/70 group-hover:text-teal-600 transition-colors" />
                                                        <span className="font-medium text-[13px]">{link.label}</span>
                                                    </div>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-teal-600" />
                                                </motion.a>
                                            </SheetClose>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-4 mt-auto bg-gray-50/50 border-t border-white/20 backdrop-blur-xl">
                    {user ? (
                        <Button
                            variant="ghost"
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 rounded-xl h-10 hover:bg-red-50 text-red-600 border border-red-100 transition-all text-xs font-bold"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>Logout</span>
                        </Button>
                    ) : (
                        <div className="flex flex-col gap-2">
                            <AuthModal
                                mode="signup"
                                trigger={
                                    <Button className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg bg-gray-900 hover:bg-gray-800 text-white text-[10px] font-black uppercase tracking-wider transition-all shadow-md active:scale-95">
                                        <Shield className="w-3.5 h-3.5" />
                                        <span>Create Account</span>
                                    </Button>
                                }
                            />
                            <AuthModal
                                mode="login"
                                trigger={
                                    <Button variant="ghost" className="w-full h-8 flex items-center justify-center gap-1.5 rounded-lg border border-gray-200 bg-white/50 hover:bg-white text-gray-700 text-[10px] font-black uppercase tracking-wider transition-all active:scale-95">
                                        <LogIn className="w-3.5 h-3.5" />
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

