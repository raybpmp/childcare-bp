import React from 'react';
import { cn } from '@/lib/utils';

type SectionVariant = 'default' | 'glass' | 'glass-warm';
type SectionSpacing = 'sm' | 'md' | 'lg' | 'xl';

interface SectionProps {
    variant?: SectionVariant;
    spacing?: SectionSpacing;
    children: React.ReactNode;
    className?: string;
}

const variantClasses: Record<SectionVariant, string> = {
    default: 'bg-transparent',
    glass: 'glass-panel',
    'glass-warm': 'glass-panel-warm',
};

const spacingClasses: Record<SectionSpacing, string> = {
    sm: 'py-8 md:py-12',
    md: 'py-12 md:py-16',
    lg: 'py-16 lg:py-20',
    xl: 'py-20 lg:py-28',
};

/**
 * Semantic section component with built-in vertical rhythm and glass variants
 * @param variant - Visual style (default, glass, glass-warm)
 * @param spacing - Vertical padding preset
 * 
 * Mobile-first padding that scales up for larger viewports
 */
export function Section({
    variant = 'default',
    spacing = 'lg',
    children,
    className
}: SectionProps) {
    return (
        <section className={cn(
            'relative overflow-hidden',
            variantClasses[variant],
            spacingClasses[spacing],
            className
        )}>
            {children}
        </section>
    );
}
