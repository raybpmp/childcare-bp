import React, { useState } from 'react';

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

const categoryColors: Record<string, string> = {
    'Industry Trends': 'bg-purple-100 text-purple-700',
    'Startup Guides': 'bg-teal-100 text-teal-700',
    'Operations': 'bg-blue-100 text-blue-700',
    'Marketing': 'bg-amber-100 text-amber-700',
};

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
        <div>
            {/* Filters Section */}
            <div className="mb-8 md:mb-12">
                {/* Category Pills - horizontal scroll on mobile, wrap on desktop */}
                <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory md:flex-wrap md:justify-center md:pb-0 mb-4">
                    <button
                        onClick={() => setSelectedCategory(null)}
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
                            onClick={() => setSelectedCategory(category)}
                            className={`flex-shrink-0 px-4 py-3 rounded-full text-base font-semibold transition-all snap-start min-h-[48px] ${selectedCategory === category
                                    ? 'bg-teal-600 text-white shadow-lg'
                                    : 'bg-white/80 text-gray-700 hover:bg-white shadow'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>

                {/* Search Input */}
                <div className="md:max-w-md md:mx-auto">
                    <input
                        type="search"
                        placeholder="Search articles..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-5 py-4 rounded-2xl bg-white/80 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-teal-500 transition-all min-h-[48px] text-base shadow"
                    />
                </div>

                {/* Results count */}
                <p className="text-center text-base text-gray-600 mt-4">
                    Showing {filteredPosts.length} {filteredPosts.length === 1 ? 'article' : 'articles'}
                </p>
            </div>

            {/* Post Grid - single column mobile, multi-column desktop */}
            <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6 mb-8 md:mb-16">
                {filteredPosts.map((post) => (
                    <article
                        key={post.slug}
                        className="glass-panel rounded-2xl overflow-hidden group hover:shadow-lg transition-all duration-300"
                    >
                        <a href={`/blog/${post.slug}`} className="block">
                            {/* Cover Image */}
                            <div className="aspect-[16/9] overflow-hidden bg-gray-100">
                                <img
                                    src={post.coverImage || '/images/blog/default-cover.webp'}
                                    alt={`B2B Childcare Business Strategy: ${post.title}`}
                                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    loading="lazy"
                                />
                            </div>

                            {/* Content */}
                            <div className="p-5 md:p-6">
                                {/* Category Badge */}
                                {post.category && (
                                    <span className={`inline-block px-3 py-1.5 rounded-full text-sm font-semibold mb-3 ${categoryColors[post.category] || 'bg-gray-100 text-gray-700'
                                        }`}>
                                        {post.category}
                                    </span>
                                )}

                                {/* Title */}
                                <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-600 transition-colors line-clamp-2">
                                    {post.title}
                                </h3>

                                {/* Excerpt */}
                                <p className="text-base text-gray-600 line-clamp-2 mb-4">
                                    {post.excerpt}
                                </p>

                                {/* Meta */}
                                <div className="flex items-center gap-2 text-base text-gray-500">
                                    <time dateTime={post.date}>
                                        {new Date(post.date).toLocaleDateString('en-US', {
                                            month: 'short',
                                            day: 'numeric',
                                            year: 'numeric',
                                        })}
                                    </time>
                                    <span>·</span>
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        </a>
                    </article>
                ))}
            </div>
        </div>
    );
}
