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
            <div className="mb-10 md:mb-16">
                {/* Category Pills - premium horizontal scroll */}
                <div className="flex gap-3 overflow-x-auto pb-6 snap-x snap-mandatory scrollbar-hide md:flex-wrap md:justify-center md:pb-0 mb-8">
                    <button
                        onClick={() => setSelectedCategory(null)}
                        className={`group relative flex-shrink-0 px-6 py-3 rounded-full text-base font-bold transition-all duration-300 snap-start min-h-[48px] border-2 shadow-sm ${!selectedCategory
                            ? 'bg-teal-600 text-white border-teal-600 shadow-teal-500/20 scale-105'
                            : 'bg-white/40 backdrop-blur-md text-gray-700 border-white/50 hover:bg-white hover:border-teal-200 hover:scale-105'
                            }`}
                    >
                        <span>All Posts</span>
                    </button>
                    {categories.map(category => (
                        <button
                            key={category}
                            onClick={() => setSelectedCategory(category)}
                            className={`group relative flex-shrink-0 px-6 py-3 rounded-full text-base font-bold transition-all duration-300 snap-start min-h-[48px] border-2 shadow-sm ${selectedCategory === category
                                ? 'bg-teal-600 text-white border-teal-600 shadow-teal-500/20 scale-105'
                                : 'bg-white/40 backdrop-blur-md text-gray-700 border-white/50 hover:bg-white hover:border-teal-200 hover:scale-105'
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
                        placeholder="Search strategies & insights..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white/30 backdrop-blur-xl border-2 border-white/40 focus:outline-none focus:ring-4 focus:ring-teal-500/10 focus:border-teal-500 transition-all text-lg shadow-xl placeholder-gray-400"
                    />
                </div>

                {/* Results count indicator */}
                <div className="mt-8 flex items-center justify-center gap-2">
                    <div className="h-px w-8 bg-teal-200"></div>
                    <p className="text-gray-500 font-medium tracking-wide">
                        {filteredPosts.length} Results Found
                    </p>
                    <div className="h-px w-8 bg-teal-200"></div>
                </div>
            </div>

            {/* Post Grid - Premium Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                {filteredPosts.length > 0 ? (
                    filteredPosts.map((post) => (
                        <article
                            key={post.slug}
                            className="group relative flex flex-col bg-white/40 backdrop-blur-md rounded-3xl border-2 border-white/60 overflow-hidden hover:border-teal-200/60 hover:shadow-2xl hover:shadow-teal-500/5 transition-all duration-500"
                        >
                            <a href={`/blog/${post.slug}`} className="cursor-pointer">
                                {/* Image Container */}
                                <div className="aspect-[16/10] overflow-hidden relative">
                                    <img
                                        src={post.coverImage || '/images/blog/default-cover.webp'}
                                        alt={getSeoAlt(post.title, post.category)}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                        loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                                    {/* Category Floating Badge */}
                                    {post.category && (
                                        <div className="absolute top-4 left-4">
                                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-lg backdrop-blur-md ${getCategoryStyle(post.category)}`}>
                                                {post.category}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-6 md:p-8 flex flex-col">
                                    {/* Published Date & Read Time */}
                                    <div className="flex items-center gap-3 text-sm font-semibold text-teal-600 mb-4">
                                        <time dateTime={post.date} className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            {new Date(post.date + "T12:00:00").toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric',
                                            })}
                                        </time>
                                        <span className="w-1 h-1 rounded-full bg-teal-200"></span>
                                        <span className="flex items-center gap-1.5">
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            {post.readTime}
                                        </span>
                                    </div>

                                    {/* Title */}
                                    <h3 className="text-2xl font-extrabold text-gray-900 mb-3 group-hover:text-teal-600 transition-colors duration-300 line-clamp-2 leading-tight">
                                        {post.title}
                                    </h3>

                                    {/* Excerpt */}
                                    <p className="text-gray-600 text-base leading-relaxed mb-6 line-clamp-2">
                                        {post.excerpt}
                                    </p>

                                    {/* Footer / Read More */}
                                    <div className="mt-auto pt-4 border-t border-white/40 flex items-center justify-between">
                                        <span className="text-teal-600 font-bold flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
                                            Read Article
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                            </svg>
                                        </span>
                                    </div>
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

