import React from 'react';
import { Star } from 'lucide-react';

const testimonials = [
  {
    name: "Sarah Jenkins",
    role: "Home Daycare Owner",
    content: "The resources and connections helped me fill my open spots in under a month.",
    rating: 5,
  },
  {
    name: "Marcus Thorne",
    role: "Center Director",
    content: "Accessing these proven marketing strategies is like having a cheat code for enrollment.",
    rating: 5,
  },
  {
    name: "Elena Rodriguez",
    role: "Preschool Founder",
    content: "Being part of this group has completely changed our financial trajectory.",
    rating: 5,
  },
  {
    name: "Jennifer Wu",
    role: "Program Director",
    content: "I finally feel supported. This membership gives me the tools to market effectively.",
    rating: 5,
  },
  {
    name: "David Miller",
    role: "Multi-Site Owner",
    content: "The best investment I've made. The shared strategies helped us scale.",
    rating: 5,
  },
  {
    name: "Amanda Chen",
    role: "Early Learning Center",
    content: "Our waitlist is full, and my revenue is up 40%. The roadmap I was missing.",
    rating: 5,
  }
];

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

const TestimonialCard = ({ testimonial }: { testimonial: Testimonial }) => (
  <div className="flex-shrink-0 w-[280px] md:w-[320px] px-2 md:px-3">
    <div className="pro-card h-full bg-white/50 border-teal-200/20 backdrop-blur-xl">
      <div className="flex gap-0.5 mb-2 md:mb-3">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-3 h-3 ${i < testimonial.rating ? "fill-amber-400 text-amber-400" : "text-gray-200"}`}
          />
        ))}
      </div>
      <blockquote className="text-gray-700 italic mb-3 text-xs md:text-sm leading-relaxed whitespace-normal font-medium">
        "{testimonial.content}"
      </blockquote>
      <div className="mt-auto flex flex-col">
        <cite className="not-italic font-bold text-gray-900 text-xs">
          {testimonial.name}
        </cite>
        <span className="text-[10px] text-gray-500 uppercase tracking-tighter">{testimonial.role}</span>
      </div>
    </div>
  </div>
);

export default function App() {
  const duplicatedTestimonials = [...testimonials, ...testimonials];

  return (
    <div className="w-full pro-section overflow-hidden">
      <div className="text-center mb-4 md:mb-6 px-4">
        <h2 className="text-lg md:text-2xl font-bold tracking-tight mb-1">What Providers Are Saying</h2>
        <p className="text-gray-500 text-xs md:text-sm max-w-xl mx-auto">
          Join 1,500+ providers who have turned their passion into a sustainable business.
        </p>
      </div>

      <div className="relative">
        <div className="flex overflow-hidden group py-2">
          <div className="flex animate-scroll group-hover:[animation-play-state:paused]">
            {duplicatedTestimonials.map((testimonial, index) => (
              <TestimonialCard key={index} testimonial={testimonial} />
            ))}
          </div>
        </div>

        {/* Dense Side Fades */}
        <div className="absolute inset-y-0 left-0 w-12 bg-gradient-to-r from-[#fafaf8] to-transparent pointer-events-none z-10" />
        <div className="absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fafaf8] to-transparent pointer-events-none z-10" />
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-scroll {
          animation: scroll 25s linear infinite;
          display: flex;
          width: max-content;
        }
      `}} />
    </div>
  );
}