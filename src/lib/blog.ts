import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Post = CollectionEntry<'posts'>;

/**
 * Get all blog posts sorted by date (newest first)
 */
export async function getAllPosts(): Promise<Post[]> {
    const posts = await getCollection('posts');
    return posts.sort((a, b) => {
        const dateA = new Date(a.data.date);
        const dateB = new Date(b.data.date);
        return dateB.getTime() - dateA.getTime();
    });
}

/**
 * Get a single post by slug
 */
export async function getPostBySlug(slug: string): Promise<Post | undefined> {
    const posts = await getCollection('posts');
    return posts.find(post => post.id === slug);
}

/**
 * Get all unique categories from blog posts
 */
export async function getAllCategories(): Promise<string[]> {
    const posts = await getAllPosts();
    const categories = new Set(
        posts
            .map(post => post.data.category)
            .filter((cat): cat is string => cat !== undefined)
    );
    return Array.from(categories);
}

/**
 * Get the featured post, or the newest post if none is featured
 */
export async function getFeaturedPost(): Promise<Post | undefined> {
    const posts = await getAllPosts();
    const featured = posts.find(post => post.data.featured);
    return featured || posts[0];
}

/**
 * Get all posts by a specific author
 */
export async function getPostsByAuthor(authorSlug: string): Promise<Post[]> {
    const posts = await getAllPosts();
    return posts.filter(post => post.data.author === authorSlug);
}

/**
 * Calculate reading time based on word count
 */
export function calculateReadTime(content: string): string {
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    const minutes = Math.ceil(words / wordsPerMinute);
    return `${minutes} min read`;
}
