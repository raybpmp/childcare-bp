"use client";

import React, { useState, useMemo } from "react";
import * as Tabs from "@radix-ui/react-tabs";
import { cn } from "@/lib/utils";

interface StackedTabsProps<T> {
    items: T[];
    renderItem: (item: T, index: number, isActive: boolean) => React.ReactNode;
    getTabLabel: (item: T, index: number) => string;
    defaultValue?: string;
    className?: string;
    tabListLabel?: string;
    cardsId?: string;
}

export function StackedTabs<T>({
    items,
    renderItem,
    getTabLabel,
    defaultValue,
    className,
    tabListLabel = "Select an option",
    cardsId,
}: StackedTabsProps<T>) {
    const initialIndex = useMemo(() => {
        if (!defaultValue) return 0;
        const index = items.findIndex((item: any) =>
            item.id === defaultValue ||
            item.label === defaultValue ||
            item.title === defaultValue ||
            item.name === defaultValue
        );
        return index >= 0 ? index : 0;
    }, [items, defaultValue]);

    const [activeIndex, setActiveIndex] = useState(initialIndex);

    return (
        <div className={cn("w-full", className)}>
            <Tabs.Root
                value={activeIndex.toString()}
                onValueChange={(val) => setActiveIndex(parseInt(val))}
                className="flex flex-col"
            >
                <Tabs.List
                    className="flex p-1 bg-slate-100/80 backdrop-blur-sm rounded-xl mb-8 gap-1 shadow-inner mx-auto w-fit max-w-[calc(100vw-3rem)] border border-slate-200 z-50 sticky top-20 overflow-x-auto scrollbar-hide"
                    aria-label={tabListLabel}
                >
                    {items.map((_, idx) => (
                        <Tabs.Trigger
                            key={idx}
                            value={idx.toString()}
                            className={cn(
                                "py-2.5 px-5 rounded-lg text-sm font-bold transition-all duration-200 outline-none whitespace-nowrap cursor-pointer",
                                "text-slate-500 hover:text-primary",
                                "data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-md border border-transparent data-[state=active]:border-slate-100"
                            )}
                        >
                            {getTabLabel(items[idx], idx)}
                        </Tabs.Trigger>
                    ))}
                </Tabs.List>

                {/* Stacked Cards Container - Natural Height */}
                <div id={cardsId} className="relative w-full px-4 pt-8 flex items-start justify-center">
                    {items.map((item, idx) => {
                        const isActive = idx === activeIndex;

                        // Calculate position with wrapping
                        let offset = idx - activeIndex;
                        if (activeIndex === 0 && idx === items.length - 1) {
                            // First tab active, last tab wraps to left
                            offset = -1;
                        } else if (activeIndex === items.length - 1 && idx === 0) {
                            // Last tab active, first tab wraps to right
                            offset = 1;
                        }

                        return (
                            <div
                                key={idx}
                                className={cn(
                                    "transition-all duration-500 ease-out w-full max-w-xl",
                                    isActive ? "relative z-30" : "absolute top-8 z-10 cursor-pointer hover:brightness-95"
                                )}
                                onClick={() => setActiveIndex(idx)}
                                style={{
                                    transform: isActive
                                        ? 'none'
                                        : `translateX(${offset * 15}%) scale(0.9)`,
                                    opacity: isActive ? 1 : 0.6,
                                }}
                            >
                                {renderItem(item, idx, isActive)}
                            </div>
                        );
                    })}
                </div>
            </Tabs.Root>
        </div>
    );
}
