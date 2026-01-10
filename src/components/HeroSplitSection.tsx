import React from 'react';
import { motion } from 'framer-motion';
import { openModal } from '../store/modalStore';
import { ArrowRightIcon } from '@heroicons/react/24/outline';
import { Section } from './layout/Section';
import { Container } from './layout/Container';
import { ResponsiveStack } from './layout/ResponsiveStack';
import { TouchCard } from './layout/TouchCard';

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
        <Section spacing="xl" className="min-h-screen flex flex-col justify-center">
            <Container size="lg">
                {/* Main Text Intro */}
                <div className="text-center mb-12 relative z-10">
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 tracking-tight mb-6"
                    >
                        Launch &amp; Grow<br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-purple-600">
                            Your Childcare Business
                        </span>
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto"
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
                >
                    <ResponsiveStack breakpoint="md" gap="6">
                        {/* Startup Card (Left) */}
                        <motion.div variants={item} className="flex-1">
                            <TouchCard
                                onClick={() => openModal('startup')}
                                glowColor="brand"
                            >
                                <div>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-100 text-brand-700 text-sm font-semibold mb-6">
                                        <span className="w-2 h-2 rounded-full bg-brand-600"></span>
                                        New Founders
                                    </span>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                        Start a<br />Daycare
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-600 max-w-sm">
                                        Get the business plan, budget calculator, and 90-day launch checklist.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-brand-700 font-bold text-base md:text-lg group-hover:gap-4 transition-all min-h-[48px]">
                                    Get Startup Toolkit <ArrowRightIcon className="w-6 h-6" />
                                </div>
                            </TouchCard>
                        </motion.div>

                        {/* Owner Card (Right) */}
                        <motion.div variants={item} className="flex-1">
                            <TouchCard
                                onClick={() => openModal('growth')}
                                glowColor="purple"
                            >
                                <div>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold mb-6">
                                        <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                        Existing Owners
                                    </span>
                                    <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                        Grow My<br />Daycare
                                    </h2>
                                    <p className="text-base md:text-lg text-gray-600 max-w-sm">
                                        Optimize staff retention, boost enrollment, and automate operations.
                                    </p>
                                </div>

                                <div className="flex items-center gap-2 text-purple-700 font-bold text-base md:text-lg group-hover:gap-4 transition-all min-h-[48px]">
                                    Get Growth Toolkit <ArrowRightIcon className="w-6 h-6" />
                                </div>
                            </TouchCard>
                        </motion.div>
                    </ResponsiveStack>
                </motion.div>
            </Container>
        </Section>
    );
}
