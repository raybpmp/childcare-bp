import * as React from "react";
import { Menu } from "lucide-react";
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
    { href: "/", label: "Home" },
    { href: "/startup", label: "Startup" },
    { href: "/consulting", label: "Consulting" },
];

export function MobileNav() {
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
            <SheetContent side="right" className="w-full sm:w-80 glass-panel">
                <SheetHeader>
                    <SheetTitle className="text-left">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-br from-teal-400 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                                C
                            </div>
                            <span className="font-bold text-gray-900">Menu</span>
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

                <SheetFooter className="border-t border-gray-200 pt-4">
                    <SheetClose asChild>
                        <a
                            href="#toolkit"
                            className="w-full inline-flex items-center justify-center rounded-full bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium px-5 py-3 shadow-lg shadow-teal-600/20 transition-all"
                        >
                            Get the Free Toolkit
                        </a>
                    </SheetClose>
                </SheetFooter>
            </SheetContent>
        </Sheet>
    );
}
