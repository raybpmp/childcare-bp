import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
    type: 'content', // Markdown
    schema: z.object({
        title: z.string(),
        description: z.string(),
        funnel: z.enum(['startup', 'growth', 'both']),
        benefits: z.array(z.string()),
        downloadUrl: z.string().optional(),
        gated: z.boolean().default(true),
    }),
});

const proofCollection = defineCollection({
    type: 'data', // JSON/YAML
    schema: z.object({
        type: z.enum(['testimonial', 'case_study', 'stat']),
        content: z.string(),
        author: z.string(),
        role: z.string().optional(),
        metrics: z.array(z.object({
            label: z.string(),
            value: z.string(),
            trend: z.string().optional(),
        })).optional(),
    }),
});

const offersCollection = defineCollection({
    type: 'data',
    schema: z.object({
        id: z.string(),
        title: z.string(),
        price: z.string(),
        features: z.array(z.string()),
        ctaLabel: z.string(),
        link: z.string(),
        funnel: z.enum(['startup', 'growth']),
        recommended: z.boolean().default(false),
    }),
});

const posts = defineCollection({
    type: 'content',
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
    'tools': toolsCollection,
    'proof': proofCollection,
    'offers': offersCollection,
    'posts': posts,
};
