import * as React from "react";
import { Menu, LogOut, User, LayoutDashboard } from "lucide-react";
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

const navLinks = [
    { href: "/childcarebusinessplans", label: "Plans" },
    { href: "/tools", label: "Tools" },
    { href: "/blog", label: "Blog" },
];

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

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    aria-label="Open menu"
                >
                    <Menu className="h-6 w-6" />
                </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-80 glass-panel flex flex-col">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                C
                            </div>
                            <span className="font-bold text-gray-900">Childcare Business Plan</span>
                        </div>
                    </SheetTitle>
                </SheetHeader>

                <nav className="flex-1 py-6">
                    <ul className="space-y-2">
                        {navLinks.map((link) => (
                            <li key={link.href}>
                                <SheetClose asChild>
                                    <a
                                        href={link.href}
                                        className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 hover:bg-white/60 hover:text-teal-700 transition-all font-medium"
                                    >
                                        {link.label}
                                    </a>
                                </SheetClose>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="mt-auto space-y-4 pb-6">
                    {user ? (
                        <>
                            <SheetClose asChild>
                                <a
                                    href="/portal"
                                    className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-5 py-3 shadow-lg shadow-teal-600/20 transition-all"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Go to Dashboard
                                </a>
                            </SheetClose>
                            <Button 
                                variant="ghost" 
                                onClick={handleLogout}
                                className="w-full rounded-full text-gray-600 hover:text-red-600 hover:bg-red-50 flex items-center justify-center gap-2"
                            >
                                <LogOut className="w-4 h-4" />
                                Logout
                            </Button>
                        </>
                    ) : (
                        <>
                            <SheetClose asChild>
                                <a
                                    href="/login"
                                    className="w-full inline-flex items-center justify-center rounded-full bg-gray-900 hover:bg-gray-800 text-white text-sm font-bold px-5 py-3 shadow-lg transition-all"
                                >
                                    Join Free
                                </a>
                            </SheetClose>
                            <SheetClose asChild>
                                <a
                                    href="/login"
                                    className="w-full inline-flex items-center justify-center rounded-full border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium px-5 py-3 transition-all"
                                >
                                    Login
                                </a>
                            </SheetClose>
                        </>
                    )}
                </div>
            </SheetContent>
        </Sheet>
    );
}
