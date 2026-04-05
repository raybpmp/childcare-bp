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
                    className="rounded-full hover:bg-gray-100/80 text-gray-700 active:scale-90 transition-all w-9 h-9 md:w-10 md:h-10"
                    aria-label="Toggle Apps Menu"
                >
                    <LayoutGrid className="w-5 h-5 md:w-6 h-6" />
                </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-2xl p-0 overflow-hidden border-none bg-transparent shadow-none">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.95, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    className="glass-panel-dark border border-white/20 rounded-[2rem] overflow-hidden shadow-2xl flex flex-col"
                >
                    <DialogHeader className="p-8 border-b border-white/10 bg-white/40 backdrop-blur-md">
                        <DialogTitle className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-lg">
                                <Grid className="w-6 h-6" />
                            </div>
                            <span>Childcare Tools</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="p-8 pb-10 bg-white/60 backdrop-blur-xl">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
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
                                                className="group relative flex flex-col items-center justify-between p-4 rounded-3xl bg-white/50 border border-white/40 hover:bg-white hover:shadow-xl hover:-translate-y-1 transition-all h-full text-center"
                                            >
                                                <div className={`
                                                    w-12 h-12 
                                                    rounded-2xl 
                                                    ${tool.bg} ${tool.color} 
                                                    flex items-center justify-center 
                                                    mb-4 
                                                    group-hover:scale-110 
                                                    transition-transform duration-300
                                                    shadow-sm
                                                `}>
                                                    <tool.icon className="w-6 h-6" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-800 leading-tight tracking-tight px-1">
                                                    {tool.name}
                                                </span>
                                                <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <ChevronRight className="w-4 h-4 text-teal-600" />
                                                </div>
                                            </a>
                                        </DialogClose>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>
                    </div>

                    <div className="px-8 py-4 bg-gray-100/50 border-t border-white/10 flex items-center justify-between">
                        <DialogClose asChild>
                            <a 
                                href="/tools"
                                className="text-xs font-bold text-teal-700 hover:text-teal-800 flex items-center gap-1 group"
                            >
                                <span>Browse All Tools</span>
                                <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </a>
                        </DialogClose>
                        <span className="text-[10px] text-gray-400 font-medium uppercase tracking-widest">Premium Apps Suite</span>
                    </div>
                </motion.div>
            </DialogContent>
        </Dialog>
    );
};
