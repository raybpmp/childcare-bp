export interface Author {
    slug: string;
    name: string;
    role: string;
    bio: string;
    avatar: string;
    social?: {
        linkedin?: string;
        twitter?: string;
    };
}

export const authors: Record<string, Author> = {
    'junya-herron': {
        slug: 'junya-herron',
        name: 'Junya Herron',
        role: 'Co-Founder',
        bio: 'Childcare industry expert helping owners build sustainable, profitable centers.',
        avatar: '/hero-woman.webp',
    },
};

export function getAuthor(slug: string): Author | undefined {
    return authors[slug];
}

export function getAllAuthors(): Author[] {
    return Object.values(authors);
}
