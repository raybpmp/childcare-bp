import React from 'react';
import { cn } from '@/lib/utils';

type ContainerSize = 'sm' | 'md' | 'lg' | 'xl';

interface ContainerProps {
    size?: ContainerSize;
    children: React.ReactNode;
    className?: string;
}

const sizeClasses: Record<ContainerSize, string> = {
    sm: 'max-w-2xl',
    md: 'max-w-4xl',
    lg: 'max-w-6xl',
    xl: 'max-w-7xl',
};

/**
 * Mobile-first responsive container component
 * @param size - Container max-width preset (sm: 672px, md: 896px, lg: 1152px, xl: 1280px)
 * 
 * Mobile: Full width with 20px horizontal padding
 * sm+: Increased horizontal padding to 24px
 * lg+: Increased horizontal padding to 32px
 * Centered with mx-auto at all breakpoints
 */
export function Container({ size = 'lg', children, className }: ContainerProps) {
    return (
        <div className={cn(
            'w-full px-5 sm:px-6 lg:px-8 mx-auto',
            sizeClasses[size],
            className
        )}>
            {children}
        </div>
    );
}
