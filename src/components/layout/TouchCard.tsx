import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface TouchCardProps {
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
    glowColor?: 'brand' | 'purple' | 'warm';
}

const glowColors = {
    brand: 'bg-brand-100/30 hover:opacity-100 group-hover:opacity-100',
    purple: 'bg-purple-100/30 hover:opacity-100 group-hover:opacity-100',
    warm: 'bg-orange-100/30 hover:opacity-100 group-hover:opacity-100',
};

const borderColors = {
    brand: 'border-transparent hover:border-brand-200',
    purple: 'border-transparent hover:border-purple-200',
    warm: 'border-transparent hover:border-orange-200',
};

/**
 * Touch-optimized interactive card with glassmorphism
 * Designed for mobile-first with proper touch feedback
 * @param glowColor - Accent color for hover glow effect
 * 
 * Mobile: min-h-[320px] with content-driven sizing
 * Desktop: md:min-h-[400px]
 * Touch feedback: active:scale-[0.98] for tactile response
 * 48px minimum touch targets enforced via padding
 */
export function TouchCard({
    children,
    onClick,
    className,
    glowColor = 'brand'
}: TouchCardProps) {
    return (
        <motion.div
            whileHover={{ y: -8, scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={cn(
                'glass-panel group rounded-3xl p-8 md:p-12',
                'cursor-pointer relative overflow-hidden',
                'min-h-[320px] md:min-h-[400px]',
                'flex flex-col justify-between',
                'transition-all duration-300',
                'border-2',
                borderColors[glowColor],
                className
            )}
        >
            {/* Glow effect */}
            <div className={cn(
                'absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16',
                'transition-opacity opacity-50',
                glowColors[glowColor]
            )} />

            {children}
        </motion.div>
    );
}
