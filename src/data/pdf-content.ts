export interface GuideSection {
    title: string;
    content: string;
}

export interface GuideData {
    slug: string;
    title: string;
    subtitle: string;
    sections: GuideSection[];
}

export const guides: GuideData[] = [
    {
        slug: "startup-essentials",
        title: "The Startup Essentials",
        subtitle: "A Blueprint for Opening Your Daycare",
        sections: [
            {
                title: "1. The Vision",
                content:
                    "Define your 'Why'. Are you building a small home daycare or a large center? What is your educational philosophy (Montessori, Reggio, Play-based)?",
            },
            {
                title: "2. The Market",
                content:
                    "Conduct a feasibility study. accessible location, demographics (parents' income, age), and competition analysis are crucial.",
            },
            {
                title: "3. The Budget",
                content:
                    "Calculate startup costs (renovations, licensing, equipment) and operating costs (rent, staff, insurance). Ensure you have 6 months of capital.",
            },
        ],
    },
    {
        slug: "licensing-essentials",
        title: "The Licensing Essentials",
        subtitle: "Navigating Regulations & Compliance",
        sections: [
            {
                title: "1. Zoning & Safety",
                content:
                    "Check local zoning laws first. Your location must be approved for childcare. Fire and health safety inspections are mandatory.",
            },
            {
                title: "2. Ratios & Staffing",
                content:
                    "Understand your state's child-to-staff ratios. This dictates your capacity and hiring needs. Background checks are non-negotiable.",
            },
            {
                title: "3. Policies & Handbook",
                content:
                    "You need a Parent Handbook and an Operations Manual. These cover sick policies, pickup procedures, and emergency protocols.",
            },
        ],
    },
    {
        slug: "marketing-essentials",
        title: "The Marketing Essentials",
        subtitle: "Filling Your Spots Before You Open",
        sections: [
            {
                title: "1. Digital Presence",
                content:
                    "A professional website is your #1 asset. Optimize for local SEO ('daycare near me'). Claim your Google Business Profile.",
            },
            {
                title: "2. Trust Signals",
                content:
                    "Collect testimonials early. Use certifications, high-quality photos, and transparent pricing to build trust with parents.",
            },
            {
                title: "3. The Funnel",
                content:
                    "Don't just rely on word-of-mouth. Use paid ads (Google/Facebook) to drive traffic to a lead capture form. Follow up immediately.",
            },
        ],
    },
    {
        slug: "operations-essentials",
        title: "The Operations Essentials",
        subtitle: "Running a Smooth Ship",
        sections: [
            {
                title: "1. Daily Rhythm",
                content:
                    "Structure is freedom. Define a daily schedule for different age groups. Include transitions, meals, nap times, and free play.",
            },
            {
                title: "2. Staff Culture",
                content:
                    "Hire for character, train for skill. Regular staff meetings and clear communication channels prevent burnout and turnover.",
            },
            {
                title: "3. Financial Cadence",
                content:
                    "Automate billing. Collect tuition in advance. Review your P&L monthly. Cash flow kills businesses faster than lack of profit.",
            },
        ],
    },
];
