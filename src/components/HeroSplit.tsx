import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon, RocketIcon, TrendingUpIcon } from 'lucide-react';
import { openModal } from '../store/modalStore';

export default function HeroSplit() {
    return (
        <section className="min-h-[85vh] flex flex-col justify-center px-4 pt-20 pb-12">
            {/* Hero Statement */}
            <div className="text-center mb-10 max-w-3xl mx-auto">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 tracking-tight mb-6 leading-tight"
                >
                    Launch & Grow{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600">
                        Your Childcare Business
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-base sm:text-lg md:text-xl text-gray-600"
                >
                    The complete operating system for childcare founders and owners.
                </motion.p>
            </div>

            {/* Funnel Selection Buttons */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col sm:flex-row items-center justify-center gap-4 max-w-xl mx-auto w-full"
            >
                {/* Startup Button */}
                <Button
                    size="lg"
                    className="w-full sm:w-auto rounded-full bg-teal-600 hover:bg-teal-700 text-white font-semibold px-6 py-6 shadow-lg shadow-teal-600/30 transition-all hover:shadow-xl hover:scale-105"
                    onClick={() => openModal('startup')}
                >
                    <RocketIcon className="mr-2 w-5 h-5" />
                    I'm Starting a Daycare
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Button>

                {/* Owner Button */}
                <Button
                    size="lg"
                    variant="outline"
                    className="w-full sm:w-auto rounded-full border-2 border-purple-300 hover:border-purple-500 hover:bg-purple-50 text-purple-700 font-semibold px-6 py-6 transition-all hover:scale-105"
                    onClick={() => openModal('consulting')}
                >
                    <TrendingUpIcon className="mr-2 w-5 h-5" />
                    I Own a Daycare
                    <ArrowRightIcon className="ml-2 w-4 h-4" />
                </Button>
            </motion.div>

            {/* Trust indicator */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="text-center text-sm text-gray-500 mt-8"
            >
                Trusted by 200+ childcare founders nationwide
            </motion.p>
        </section>
    );
}
