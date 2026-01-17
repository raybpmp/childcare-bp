import React, { useState } from 'react';

interface Props {
    categories: string[];
    onCategoryChange?: (category: string | null) => void;
}

export function BlogCategoryPills({ categories, onCategoryChange }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const handleCategoryClick = (category: string | null) => {
        setSelectedCategory(category);
        onCategoryChange?.(category);
    };

    return (
        <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:flex-wrap md:justify-center md:pb-0 mb-6 md:mb-8">
            <button
                onClick={() => handleCategoryClick(null)}
                className={`flex-shrink-0 px-4 py-3 rounded-full text-base font-semibold transition-all snap-start min-h-[48px] ${!selectedCategory
                        ? 'bg-teal-600 text-white shadow-lg'
                        : 'bg-white/80 text-gray-700 hover:bg-white shadow'
                    }`}
            >
                All Posts
            </button>
            {categories.map(category => (
                <button
                    key={category}
                    onClick={() => handleCategoryClick(category)}
                    className={`flex-shrink-0 px-4 py-3 rounded-full text-base font-semibold transition-all snap-start min-h-[48px] ${selectedCategory === category
                            ? 'bg-teal-600 text-white shadow-lg'
                            : 'bg-white/80 text-gray-700 hover:bg-white shadow'
                        }`}
                >
                    {category}
                </button>
            ))}
        </div>
    );
}
