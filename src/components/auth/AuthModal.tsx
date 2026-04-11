import React from 'react';
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LoginForm } from "./LoginForm";
import { LogIn, Shield } from "lucide-react";

interface AuthModalProps {
    mode?: 'login' | 'signup';
    trigger?: React.ReactNode;
}

export const AuthModal = ({ mode = 'login', trigger }: AuthModalProps) => {
    const [open, setOpen] = React.useState(false);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button
                        variant={mode === 'login' ? 'ghost' : 'default'}
                        className={`rounded-full px-6 h-10 font-bold transition-all ${mode === 'login'
                            ? 'text-gray-700 hover:text-teal-600 hover:bg-teal-50'
                            : 'bg-gray-900 hover:bg-gray-800 text-white shadow-lg'
                            }`}
                    >
                        {mode === 'login' ? (
                            <span className="flex items-center gap-2">
                                <LogIn className="w-4 h-4" />
                                Sign In
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Shield className="w-4 h-4" />
                                Join Free
                            </span>
                        )}
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="p-0 border-none bg-transparent shadow-none w-full max-w-md sm:max-w-[420px] overflow-hidden">
                <LoginForm initialMode={mode} />
            </DialogContent>
        </Dialog>
    );
};
