import React from 'react';
import { motion } from 'framer-motion';
import { openModal } from '../store/modalStore';
import { ArrowRightIcon } from '@heroicons/react/24/outline';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.2
        }
    }
};

const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 50, damping: 20 } }
};

export default function HeroSplitSection() {
    return (
        <section className="min-h-screen flex flex-col justify-center px-4 pt-24 pb-12 relative overflow-hidden">
            {/* Main Text Intro */}
            <div className="text-center mb-12 relative z-10">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6"
                >
                    Launch & Grow<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
                        Your Childcare Business
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-gray-600 max-w-2xl mx-auto"
                >
                    The complete operating system for childcare founders and owners. <br className="hidden md:block" />
                    Choose your path to get the free toolkit.
                </motion.p>
            </div>

            {/* Split Cards Container */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full relative z-10"
            >
                {/* Startup Card (Left) */}
                <motion.div
                    variants={item}
                    whileHover={{ y: -8, scale: 1.01 }}
                    onClick={() => openModal('startup')}
                    className="glass-panel group rounded-[32px] p-8 md:p-12 cursor-pointer relative overflow-hidden h-[400px] md:h-[500px] flex flex-col justify-between transition-all duration-300 border-2 border-transparent hover:border-brand-200"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-brand-100/30 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>

                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
                            <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                            New Founders
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Start a<br />Daycare
                        </h2>
                        <p className="text-lg text-gray-600 max-w-sm">
                            Get the business plan, budget calculator, and 90-day launch checklist.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-brand-700 font-bold text-lg group-hover:gap-4 transition-all">
                        Get Startup Toolkit <ArrowRightIcon className="w-6 h-6" />
                    </div>
                </motion.div>

                {/* Owner Card (Right) */}
                <motion.div
                    variants={item}
                    whileHover={{ y: -8, scale: 1.01 }}
                    onClick={() => openModal('consulting')}
                    className="glass-panel group rounded-[32px] p-8 md:p-12 cursor-pointer relative overflow-hidden h-[400px] md:h-[500px] flex flex-col justify-between transition-all duration-300 border-2 border-transparent hover:border-purple-200"
                >
                    <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100/30 rounded-full blur-3xl -mr-16 -mt-16 transition-opacity group-hover:opacity-100 opacity-50"></div>

                    <div>
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
                            <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                            Existing Owners
                        </span>
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                            Grow My<br />Daycare
                        </h2>
                        <p className="text-lg text-gray-600 max-w-sm">
                            Optimize staff retention, boost enrollment, and automate operations.
                        </p>
                    </div>

                    <div className="flex items-center gap-2 text-purple-700 font-bold text-lg group-hover:gap-4 transition-all">
                        Get Growth Toolkit <ArrowRightIcon className="w-6 h-6" />
                    </div>
                </motion.div>

            </motion.div>
        </section>
    );
}
