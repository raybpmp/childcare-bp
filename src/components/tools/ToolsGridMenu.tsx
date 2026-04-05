import React from 'react';
import { 
    LayoutGrid, 
    BarChart3, 
    DollarSign, 
    Briefcase, 
    FileText, 
    Home,
    Grid,
    ChevronRight
} from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const tools = [
    {
        name: "Market Intelligence",
        href: "/tools/market-report",
        icon: BarChart3,
        color: "text-teal-600",
        bg: "bg-teal-50"
    },
    {
        name: "Income Builder",
        href: "/tools/income-builder",
        icon: DollarSign,
        color: "text-purple-600",
        bg: "bg-purple-50"
    },
    {
        name: "Business Modeler",
        href: "/tools/business-modeler",
        icon: Briefcase,
        color: "text-blue-600",
        bg: "bg-blue-50"
    },
    {
        name: "Daycare Business Plan Generator",
        href: "/tools/business-plan-generator",
        icon: FileText,
        color: "text-emerald-600",
        bg: "bg-emerald-50"
    }
];

export const ToolsGridMenu = () => {
    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="rounded-full hover:bg-gray-100/80 text-gray-700 active:scale-90 transition-all w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10"
                    aria-label="Toggle Apps Menu"
                >
                    <LayoutGrid className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 h-6" />
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="glass-panel-dark border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    <DialogHeader className="p-4 border-b border-white/10 bg-white/40 backdrop-blur-md">
                        <DialogTitle className="text-lg font-bold flex items-center gap-2 text-gray-900">
                            <div className="w-8 h-8 rounded-lg bg-teal-600 flex items-center justify-center text-white shadow-lg">
                                <Grid className="w-5 h-5" />
                            </div>
                            <span className="uppercase tracking-tight">Childcare Business Tools</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-4 pb-6 bg-white/60 backdrop-blur-xl">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            <AnimatePresence>
                                {tools.map((tool, index) => (
                                    <motion.div
                                        key={tool.name}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <DialogClose asChild>
                                            <a 
                                                href={tool.href}
                                                className="group relative flex flex-col items-center justify-between p-3 rounded-2xl bg-white/50 border border-white/40 hover:bg-white hover:shadow-xl hover:-translate-y-0.5 transition-all h-full text-center"
                                            >
                                                <div className={`
                                                    w-10 h-10 
                                                    rounded-xl
                                                    ${tool.bg} ${tool.color} 
                                                    flex items-center justify-center 
                                                    mb-2
                                                    group-hover:scale-110 
                                                    transition-transform duration-300
                                                    shadow-sm
                                                `}>
                                                    <tool.icon className="w-5 h-5" />
                                                </div>
                                                <span className="text-[10px] font-black text-gray-800 leading-tight tracking-tight px-1 uppercase">
                                                    {tool.name}
                                                </span>
                                            </a>
                                        </DialogClose>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="px-4 py-3 bg-gray-100/50 border-t border-white/10 flex items-center justify-between">
                        <DialogClose asChild>
                            <a 
                                href="/tools"
                                className="text-[10px] font-black text-teal-700 hover:text-teal-800 flex items-center gap-1 group uppercase tracking-wider"
                            >
                                <span>Browse All</span>
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </DialogClose>
                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Premium Apps Suite</span>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
