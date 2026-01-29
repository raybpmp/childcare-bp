import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Home Daycare Owner",
    content: "Joining this community was the turning point for my business. The resources and connections helped me fill my open spots in under a month.",
    rating: 5,
  },
  {
    name: "Marcus Thorne",
    role: "Center Director",
    content: "The membership paid for itself in the first week. Accessing these proven marketing strategies is like having a cheat code for enrollment.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Preschool Founder",
    content: "Being part of this group has completely changed our financial trajectory. I've learned more here than in any business course.",
    rating: 5,
  },
  {
    name: "Jennifer Wu",
    role: "Program Director",
    content: "I finally feel supported. This membership gives me the tools to market my center effectively without guessing what works.",
    rating: 5,
  },
  {
    name: "David Miller",
    role: "Multi-Site Owner",
    content: "The best investment I've made for my company. The network of other owners and the shared strategies helped us scale to location number two.",
    rating: 5,
  },
  {
    name: "Amanda Chen",
    role: "Early Learning Center",
    content: "Our waitlist is full, and my revenue is up 40%. Joining this membership gave me the roadmap I was missing.",
    rating: 5,
  },
  {
    name: "Robert Fox",
    role: "Daycare Owner",
    content: "I was struggling to find new families until I joined. The marketing systems inside this community are worth ten times the monthly cost.",
    rating: 5,
  },
  {
    name: "Lisa Watson",
    role: "Childcare Provider",
    content: "It's not just a subscription; it's a lifeline. The business growth strategies I've implemented from this community have saved my center.",
    rating: 5,
  },
  {
    name: "Patricia Cole",
    role: "Academy Director",
    content: "The ROI on this membership is undeniable. I stopped wasting money on bad ads and started investing in methods that actually bring in parents.",
    rating: 5,
  },
  {
    name: "James Wilson",
    role: "Facility Manager",
    content: "Every month I get value that exceeds the cost. Whether it's a new marketing template or advice from the group, it always drives business forward.",
    rating: 5,
  },
];

// Reusable Testimonial Card Component
const TestimonialCard = ({ testimonial }) => (
  <div className="flex-shrink-0 w-[380px] px-4">
    <div className="h-full border border-teal-100 bg-white/50 rounded-xl p-6 transition-all duration-300 hover:bg-white hover:shadow-md">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      {/* whitespace-normal ensures the testimonial text wraps instead of cutting off */}
      <blockquote className="text-gray-700 italic mb-6 leading-relaxed whitespace-normal">
        "{testimonial.content}"
      </blockquote>
      <div className="mt-auto">
        <cite className="not-italic font-semibold text-gray-900 block">
          {testimonial.name}
        </cite>
        <span className="text-sm text-gray-500">{testimonial.role}</span>
      </div>
    </div>
  </div>
);

export default function App() {
  // Duplicating for seamless infinite scroll
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 md:px-6 py-12 overflow-hidden">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold tracking-tight mb-4">What Providers Are Saying</h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Join 1,500+ providers who have turned their passion for childcare into a sustainable business.
        </p>
      </div>

      <div className="relative">
        {/* Container for the marquee animation */}
        <div className="flex overflow-hidden group py-4">
          <div className="flex animate-scroll group-hover:[animation-play-state:paused]">
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Side fades to mask the entry/exit of cards */}
        <div className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-slate-50 to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-20 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none z-10" />
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 35s linear infinite;
          display: flex;
          width: max-content;
        }
      `}} />
    </div>
  );
}