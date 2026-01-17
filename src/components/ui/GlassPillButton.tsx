import React from 'react';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface GlassPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    href?: string;
    className?: string;
}

export default function GlassPillButton({
    variant = 'primary',
    size = 'md',
    href,
    className,
    children,
    ...props
}: GlassPillButtonProps) {
    const baseStyles = 'inline-flex items-center justify-center rounded-full font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    const variants = {
        primary: 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg shadow-brand-500/20 border border-transparent',
        secondary: 'bg-white/40 backdrop-blur-md border border-white/50 text-gray-900 hover:bg-white/60 shadow-glass',
        ghost: 'bg-transparent text-gray-700 hover:bg-black/5 hover:text-gray-900',
    };

    const sizes = {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-8 text-base',
        lg: 'h-14 px-10 text-lg',
    };

    const Component = href ? motion.a : motion.button;
    const content = (
        <>
            {children}
        </>
    );

    return (
        <Component
            href={href}
            className={cn(baseStyles, variants[variant], sizes[size], className)}
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            {...(props as any)}
        >
            {content}
        </Component>
    );
}
