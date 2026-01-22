export interface Review {
    id: string;
    author: string;
    role: string;
    location: string;
    content: string;
    rating: number;
    avatar: string; // Background color or image URL
}

export const reviews: Review[] = [
    {
        id: "1",
        author: "Sarah Jenkins",
        role: "Founder, Little Stars Academy",
        location: "Houston, TX",
        content: "I spent months reading everything I could find online. Nothing made sense until I saw my own numbers using this toolkit. It gave me the roadmap I actually needed.",
        rating: 5,
        avatar: "bg-teal-500"
    },
    {
        id: "2",
        author: "Michelle Torres",
        role: "Owner, Bright Beginnings",
        location: "Denver, CO",
        content: "The revenue potential calculator was a game-changer. Seeing the real numbers for my state gave me the confidence to finally sign my first lease.",
        rating: 5,
        avatar: "bg-purple-500"
    },
    {
        id: "3",
        author: "Amanda Chen",
        role: "Director, Little Explorers",
        location: "Seattle, WA",
        content: "The licensing checklist saved me at least 40 hours of research. It's like having a consultant in your pocket for a fraction of the cost.",
        rating: 5,
        avatar: "bg-amber-500"
    },
    {
        id: "4",
        author: "Jessica Williams",
        role: "Home Daycare Provider",
        location: "Atlanta, GA",
        content: "I didn't think I could afford to hire staff. This plan showed me how to scale while keeping my margins healthy. Simply indispensable.",
        rating: 5,
        avatar: "bg-rose-500"
    },
    {
        id: "5",
        author: "Elena Rodriguez",
        role: "Founder, Casa de Niños",
        location: "Miami, FL",
        content: "Marketing was my biggest fear. The enrollment strategies here are so practical and easy to follow. I was at 80% capacity within three months.",
        rating: 5,
        avatar: "bg-blue-500"
    },
    {
        id: "6",
        author: "Dr. Karen Smith",
        role: "Owner, Oak Tree Center",
        location: "Chicago, IL",
        content: "A professional business plan is non-negotiable for SBA loans. This template was exactly what my bank was looking for. Loan approved!",
        rating: 5,
        avatar: "bg-emerald-500"
    },
    {
        id: "7",
        author: "Tasha Miller",
        role: "Future Provider",
        location: "Charlotte, NC",
        content: "I was overwhelmed by the 'what-ifs'. This toolkit breaks down every cost and every step so clearly. I finally feel in control of my dream.",
        rating: 5,
        avatar: "bg-orange-500"
    },
    {
        id: "8",
        author: "Maria Garcia",
        role: "Director, Sunshine Kids",
        location: "San Diego, CA",
        content: "The staffing ratios and benefit advice were spot on for my region. It's rare to find something so tailored to the childcare industry.",
        rating: 5,
        avatar: "bg-indigo-500"
    },
    {
        id: "9",
        author: "Rachel King",
        role: "Owner, King's Meadow Daycare",
        location: "Columbus, OH",
        content: "I've tried free templates before, but they don't compare. The quality and depth here are on another level. Worth every penny.",
        rating: 5,
        avatar: "bg-pink-500"
    },
    {
        id: "10",
        author: "Sofia Patel",
        role: "Founder, Little Scholars",
        location: "Austin, TX",
        content: "Truly a mobile-first experience that I could use while in my classroom. The layout is beautiful and the information is even better.",
        rating: 5,
        avatar: "bg-cyan-500"
    }
];
