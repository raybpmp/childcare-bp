import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRightIcon } from 'lucide-react';
import { openModal } from '../store/modalStore';

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: { staggerChildren: 0.15, delayChildren: 0.3 }
    }
};

const item = {
    hidden: { y: 30, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring" as const, stiffness: 50, damping: 20 } }
};

export default function HeroSplit() {
    return (
        <section className="min-h-screen flex flex-col justify-center px-4 pt-28 pb-16">
            {/* Headline */}
            <div className="text-center mb-12">
                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="text-5xl md:text-7xl font-bold text-gray-900 tracking-tight mb-6"
                >
                    Launch & Grow<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-purple-600">
                        Your Childcare Business
                    </span>
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="text-xl text-gray-600 max-w-2xl mx-auto"
                >
                    The complete operating system for childcare founders and owners.
                </motion.p>
            </div>

            {/* Split Cards */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto w-full"
            >
                {/* Startup Card */}
                <motion.div variants={item}>
                    <Card
                        className="glass-panel cursor-pointer h-[420px] flex flex-col justify-between p-8 border-2 border-transparent hover:border-teal-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                        onClick={() => openModal('startup')}
                    >
                        <CardHeader className="p-0">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-semibold w-fit mb-4">
                                <span className="w-2 h-2 rounded-full bg-teal-600"></span>
                                New Founders
                            </span>
                            <CardTitle className="text-4xl md:text-5xl font-bold text-gray-900">
                                Start a<br />Daycare
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-4">
                                Business plan, budget calculator, and 90-day launch checklist.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0">
                            <Button variant="ghost" className="text-teal-700 font-bold text-lg group-hover:gap-4 transition-all p-0">
                                Get Startup Toolkit <ArrowRightIcon className="w-5 h-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>

                {/* Owner Card */}
                <motion.div variants={item}>
                    <Card
                        className="glass-panel cursor-pointer h-[420px] flex flex-col justify-between p-8 border-2 border-transparent hover:border-purple-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl group"
                        onClick={() => openModal('consulting')}
                    >
                        <CardHeader className="p-0">
                            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-sm font-semibold w-fit mb-4">
                                <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                                Existing Owners
                            </span>
                            <CardTitle className="text-4xl md:text-5xl font-bold text-gray-900">
                                Grow My<br />Daycare
                            </CardTitle>
                            <CardDescription className="text-lg text-gray-600 mt-4">
                                Enrollment forecasting, staff retention, and systems automation.
                            </CardDescription>
                        </CardHeader>
                        <CardFooter className="p-0">
                            <Button variant="ghost" className="text-purple-700 font-bold text-lg group-hover:gap-4 transition-all p-0">
                                Get Growth Toolkit <ArrowRightIcon className="w-5 h-5" />
                            </Button>
                        </CardFooter>
                    </Card>
                </motion.div>
            </motion.div>
        </section>
    );
}
