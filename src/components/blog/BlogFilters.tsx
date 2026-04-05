import React, { useState } from 'react';
import { BLOG_CATEGORIES, getCategoryStyle, getSeoAlt } from '@/config/blog';

interface PostData {
    slug: string;
    title: string;
    excerpt: string;
    coverImage?: string;
    category?: string;
    date: string;
    readTime: string;
}

interface Props {
    posts: PostData[];
    categories: string[];
}

export function BlogFilters({ posts: initialPosts, categories }: Props) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Filter posts based on category and search query
    const filteredPosts = initialPosts.filter(post => {
        const matchesCategory = !selectedCategory || post.category === selectedCategory;
        const matchesSearch = !searchQuery ||
            post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="w-full">
            {/* Filters Section */}
            <div className="mb-6 md:mb-8">
                {/* Category Pills - Tiny Wrapping */}
                <div className="flex flex-wrap items-center justify-center gap-1.5 mb-4 px-1">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${!selectedCategory
                            ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                            : 'bg-white/50 text-gray-500 border-gray-100'
                            }`}
                    >
                        All
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-all border ${selectedCategory === category
                                ? 'bg-teal-600 text-white border-teal-600 shadow-sm'
                                : 'bg-white/50 text-gray-500 border-gray-100'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search Input - Glassmorphic */}
                <div className="max-w-xl mx-auto relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400 group-focus-within:text-teal-500 transition-colors" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        placeholder="Search strategies..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 focus:outline-none focus:ring-4 focus:ring-teal-500/5 focus:border-teal-500/50 transition-all text-xs shadow-sm placeholder-gray-400"
                    />
                </div>

                {/* Results count indicator */}
                <div className="mt-4 flex items-center justify-center gap-2">
                    <div className="h-px w-6 bg-teal-200"></div>
                    <p className="pro-text-meta">
                        {filteredPosts.length} Results Found
                    </p>
                    <div className="h-px w-6 bg-teal-200"></div>
                </div>
            </div>

            {/* Post Grid - Ultra High Density 2-Col */}
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <article
                            key={post.slug}
                            className="pro-card group relative flex flex-col p-0 overflow-hidden border-teal-50/50"
                        >
                            <a href={`/blog/${post.slug}`} className="cursor-pointer flex flex-col h-full">
                                {/* Image */}
                                <div className="aspect-[4/3] overflow-hidden relative shrink-0">
                                    <img
                                        src={post.coverImage || '/images/blog/default-cover.webp'}
                                        alt={getSeoAlt(post.title, post.category)}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                        loading="lazy"
                                    />
                                    {/* Category Floating Badge - Mini */}
                                    {post.category && (
                                        <div className="absolute top-1.5 left-1.5">
                                            <span className={`px-1.5 py-0.5 rounded-md text-[8px] font-black uppercase tracking-[0.1em] shadow-lg backdrop-blur-md ${getCategoryStyle(post.category)}`}>
                                                {post.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-2 flex flex-col">
                                    {/* Date */}
                                    <time dateTime={post.date} className="text-[9px] font-bold text-teal-600/50 uppercase tracking-wider mb-1">
                                        {new Date(post.date + "T12:00:00").toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric'
                                        })}
                                    </time>

                                    {/* Title - Dense 2-Line */}
                                    <h3 className="text-[11px] font-black text-gray-900 leading-tight mb-1 line-clamp-2">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt - HIDDEN ON MOBILE GRID */}
                                    <p className="hidden md:block text-gray-500 text-[10px] leading-tight mb-2 line-clamp-2">
                                        {post.excerpt}
                                    </p>
                                </div>
                            </a>
                        </article>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="inline-block p-6 rounded-3xl bg-white/30 backdrop-blur-md border-2 border-white/50 shadow-xl">
                            <span className="text-5xl mb-4 block">🔍</span>
                            <h3 className="text-2xl font-bold text-gray-900 mb-2">No matching articles</h3>
                            <p className="text-gray-600">Try adjusting your search or filters to find what you're looking for.</p>
                            <button
                                onClick={() => { setSearchQuery(''); setSelectedCategory(null); }}
                                className="mt-6 text-teal-600 font-bold hover:text-teal-700 transition-colors underline decoration-2 underline-offset-4"
                            >
                                Clear all filters
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

