import React from 'react';
import { cn } from '@/lib/utils';

type Breakpoint = 'sm' | 'md' | 'lg' | 'xl';
type Gap = '2' | '3' | '4' | '5' | '6' | '8' | '10' | '12';

interface ResponsiveStackProps {
    breakpoint?: Breakpoint;
    gap?: Gap;
    children: React.ReactNode;
    className?: string;
}

const breakpointClasses: Record<Breakpoint, string> = {
    sm: 'sm:flex-row',
    md: 'md:flex-row',
    lg: 'lg:flex-row',
    xl: 'xl:flex-row',
};

/**
 * Mobile-first flex container that stacks vertically on mobile, 
 * then converts to horizontal at specified breakpoint
 * @param breakpoint - When to switch from column to row layout
 * @param gap - Tailwind gap value (mobile uses gap-4 by default)
 * 
 * Mobile: flex-col gap-4
 * Breakpoint+: flex-row with specified gap
 */
export function ResponsiveStack({
    breakpoint = 'md',
    gap = '6',
    children,
    className
}: ResponsiveStackProps) {
    const gapClass = `gap-4 ${breakpointClasses[breakpoint].replace('flex-row', `gap-${gap}`)}`;

    return (
        <div className={cn(
            'flex flex-col',
            `gap-4 ${breakpoint}:gap-${gap}`,
            breakpointClasses[breakpoint],
            className
        )}>
            {children}
        </div>
    );
}
