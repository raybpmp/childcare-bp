export const BLOG_CATEGORIES = {
    'Industry Trends': {
        color: 'bg-purple-100 text-purple-700',
        seoPrefix: 'Analysis of the Daycare Business Plan landscape: ',
    },
    'Startup Guides': {
        color: 'bg-teal-100 text-teal-700',
        seoPrefix: 'Essential starting a daycare center checklist item: ',
    },
    Operations: {
        color: 'bg-blue-100 text-blue-700',
        seoPrefix: 'Modern childcare management software interface for: ',
    },
    Marketing: {
        color: 'bg-amber-100 text-amber-700',
        seoPrefix: 'Strategist planning childcare advertising: ',
    },
} as const;

export const DEFAULT_CATEGORY_STYLE = 'bg-gray-100 text-gray-700';
export const DEFAULT_SEO_PREFIX = 'B2B Childcare Business Strategy: ';

export function getCategoryStyle(category: string | undefined): string {
    if (!category || !(category in BLOG_CATEGORIES)) {
        return DEFAULT_CATEGORY_STYLE;
    }
    return BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES].color;
}

export function getSeoAlt(title: string, category: string | undefined): string {
    if (!category || !(category in BLOG_CATEGORIES)) {
        return `${DEFAULT_SEO_PREFIX}${title}`;
    }
    return `${BLOG_CATEGORIES[category as keyof typeof BLOG_CATEGORIES].seoPrefix}${title}`;
}
