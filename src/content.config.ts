import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const posts = defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: "./src/content/posts" }),
    schema: z.object({
        title: z.string(),
        date: z.string(),
        excerpt: z.string(),
        coverImage: z.string().optional(),
        author: z.string().default('junya-herron'),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        featured: z.boolean().optional().default(false),
    }),
});

export const collections = {
    'posts': posts,
};
