import { defineCollection, z } from 'astro:content';

const toolsCollection = defineCollection({
    type: 'content', // Markdown
    schema: z.object({
        title: z.string(),
        description: z.string(),
        funnel: z.enum(['startup', 'consulting', 'both']),
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
        funnel: z.enum(['startup', 'consulting']),
        recommended: z.boolean().default(false),
    }),
});

export const collections = {
    'tools': toolsCollection,
    'proof': proofCollection,
    'offers': offersCollection,
};
