import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * BusinessPlanApp — 3-Stage Lead-Gen Wizard
 *
 * LAYOUT: Full page, not a card-in-a-void.
 * - Top: swipeable preview of actual plan sections
 * - Below: form steps (name/email first, then optional enrichment)
 */

interface FormData {
    name: string;
    email: string;
    companyName: string;
    address: string;
    cityStateZip: string;
    title: string;
    phone: string;
    website: string;
}

type AppState = 'form' | 'generating' | 'success' | 'error';

const INITIAL: FormData = {
    name: '', email: '', companyName: '', address: '',
    cityStateZip: '', title: '', phone: '', website: '',
};

const STEPS = [
    {
        emoji: '👋',
        title: 'Get your free business plan',
        subtitle: 'Enter your name and email to get started.',
        fields: [
            { key: 'name' as const, label: 'Your Name', placeholder: 'Jane Smith', type: 'text', required: true },
            { key: 'email' as const, label: 'Email Address', placeholder: 'you@email.com', type: 'email', required: true },
        ],
    },
    {
        emoji: '🏫',
        title: 'Tell us about your daycare',
        subtitle: "We'll print these on your plan's cover page.",
        fields: [
            { key: 'companyName' as const, label: 'Daycare Name', placeholder: 'Sunshine Kids Learning Center', type: 'text', required: false },
            { key: 'title' as const, label: 'Your Title', placeholder: 'Owner / Director', type: 'text', required: false },
        ],
    },
    {
        emoji: '📍',
        title: 'Contact details (optional)',
        subtitle: 'These go on your cover page too.',
        fields: [
            { key: 'phone' as const, label: 'Phone', placeholder: '(555) 123-4567', type: 'tel', required: false },
            { key: 'cityStateZip' as const, label: 'City, State', placeholder: 'Atlanta, GA 30301', type: 'text', required: false },
        ],
    },
];

const LOADING_STEPS = [
    { icon: '📝', text: 'Customizing your cover page...' },
    { icon: '📄', text: 'Rendering your 23-page blueprint...' },
    { icon: '✉️', text: 'Sending a copy to your inbox...' },
    { icon: '✅', text: 'Preparing your download...' },
];

/** Preview slides — designed representations of actual plan sections */
const PREVIEW_SLIDES = [
    {
        label: 'Cover Page',
        accent: 'from-teal-600 to-teal-800',
        content: (
            <div className="h-full flex flex-col justify-between p-5">
                <div>
                    <div className="w-10 h-1 bg-teal-400 rounded mb-3" />
                    <div className="text-[11px] uppercase tracking-[0.2em] text-teal-300 font-bold mb-1">Strategic Business Plan</div>
                    <div className="text-white text-lg font-black leading-tight">Daycare<br />Business Plan</div>
                </div>
                <div className="space-y-2">
                    <div className="text-[8px] uppercase tracking-widest text-teal-300 font-bold">Prepared For</div>
                    <div className="h-[1px] bg-teal-400/30 w-full" />
                    <div className="text-[9px] text-teal-200">Company Name</div>
                    <div className="h-[1px] bg-teal-400/30 w-full" />
                    <div className="text-[9px] text-teal-200">Owner / Director</div>
                </div>
                <div className="text-[7px] text-teal-400 mt-auto pt-3">Confidential • 23 Pages</div>
            </div>
        ),
        bg: 'bg-gradient-to-br from-gray-900 to-teal-900',
    },
    {
        label: 'Executive Summary',
        accent: 'from-teal-500 to-emerald-500',
        content: (
            <div className="h-full p-5">
                <div className="text-teal-600 text-xs font-black uppercase tracking-widest mb-2">Executive Summary</div>
                <div className="space-y-2">
                    <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-11/12 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-4/5 bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-full bg-gray-200 rounded-full" />
                    <div className="h-1.5 w-3/4 bg-gray-200 rounded-full" />
                </div>
                <div className="mt-4 border-l-2 border-teal-400 pl-2">
                    <div className="text-[8px] font-bold text-gray-600 mb-1">Mission Statement</div>
                    <div className="space-y-1">
                        <div className="h-1 w-full bg-teal-100 rounded-full" />
                        <div className="h-1 w-5/6 bg-teal-100 rounded-full" />
                        <div className="h-1 w-2/3 bg-teal-100 rounded-full" />
                    </div>
                </div>
                <div className="mt-3">
                    <div className="text-[8px] font-bold text-gray-600 mb-1">Key Objectives</div>
                    <div className="space-y-1.5 pl-2">
                        {['Revenue targets', 'Enrollment goals', 'Market positioning'].map((t, i) => (
                            <div key={i} className="flex items-center gap-1.5">
                                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 flex-shrink-0" />
                                <div className="text-[7px] text-gray-500">{t}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        ),
        bg: 'bg-white',
    },
    {
        label: 'Financial Analysis',
        accent: 'from-blue-500 to-teal-500',
        content: (
            <div className="h-full p-5">
                <div className="text-teal-600 text-xs font-black uppercase tracking-widest mb-3">Revenue & Profitability</div>
                {/* Mini chart representation */}
                <div className="flex items-end gap-1 h-16 mb-3">
                    {[40, 55, 45, 65, 70, 80, 75, 90, 85, 95].map((h, i) => (
                        <div key={i} className="flex-1 bg-gradient-to-t from-teal-500 to-teal-300 rounded-t-sm" style={{ height: `${h}%` }} />
                    ))}
                </div>
                <div className="flex justify-between text-[7px] text-gray-400 mb-3">
                    <span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span>
                </div>
                {/* Table preview */}
                <div className="border border-gray-100 rounded-md overflow-hidden">
                    {['Full-Time Tuition', 'Part-Time Revenue', 'Subsidy Income', 'USDA Food Program'].map((label, i) => (
                        <div key={i} className={`flex justify-between px-2 py-1 text-[7px] ${i % 2 ? 'bg-gray-50' : 'bg-white'}`}>
                            <span className="text-gray-600">{label}</span>
                            <span className="text-gray-400 font-mono">$XX,XXX</span>
                        </div>
                    ))}
                </div>
            </div>
        ),
        bg: 'bg-white',
    },
];

/** Swipeable preview carousel */
const PlanPreviewCarousel = () => {
    const [active, setActive] = useState(0);
    const touchRef = useRef<{ x: number } | null>(null);

    const handleTouchStart = (e: React.TouchEvent) => {
        touchRef.current = { x: e.touches[0].clientX };
    };
    const handleTouchEnd = (e: React.TouchEvent) => {
        if (!touchRef.current) return;
        const dx = e.changedTouches[0].clientX - touchRef.current.x;
        if (Math.abs(dx) > 40) {
            if (dx < 0 && active < PREVIEW_SLIDES.length - 1) setActive(a => a + 1);
            if (dx > 0 && active > 0) setActive(a => a - 1);
        }
        touchRef.current = null;
    };

    return (
        <div className="w-full">
            <div
                className="relative w-full aspect-[3/4] max-w-[240px] mx-auto rounded-xl shadow-2xl shadow-gray-900/10 overflow-hidden"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
            >
                <AnimatePresence mode="wait">
                    <motion.div
                        key={active}
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -50 }}
                        transition={{ duration: 0.25 }}
                        className={`absolute inset-0 ${PREVIEW_SLIDES[active].bg}`}
                    >
                        {PREVIEW_SLIDES[active].content}
                    </motion.div>
                </AnimatePresence>
                {/* Page label badge */}
                <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm rounded-full px-2.5 py-1 text-[9px] font-bold text-white">
                    {PREVIEW_SLIDES[active].label}
                </div>
            </div>
            {/* Dots + swipe hint */}
            <div className="flex justify-center gap-2 mt-3">
                {PREVIEW_SLIDES.map((_, i) => (
                    <button
                        key={i}
                        onClick={() => setActive(i)}
                        className={`h-2 rounded-full transition-all duration-300 ${i === active ? 'bg-teal-500 w-5' : 'bg-gray-300 w-2'}`}
                        aria-label={`Preview page ${i + 1}`}
                    />
                ))}
            </div>
            <p className="text-[10px] text-gray-400 text-center mt-1">Swipe to preview</p>
        </div>
    );
};

export default function BusinessPlanApp() {
    const [form, setForm] = useState<FormData>(INITIAL);
    const [appState, setAppState] = useState<AppState>('form');
    const [step, setStep] = useState(0);
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const updateField = (key: keyof FormData, v: string) => setForm(p => ({ ...p, [key]: v }));

    const stepValid = () => {
        const s = STEPS[step];
        return s.fields.filter(f => f.required).every(f => form[f.key].trim().length > 0);
    };

    const handleNext = () => {
        if (!stepValid()) return;
        if (step < STEPS.length - 1) {
            setStep(s => s + 1);
        } else {
            handleSubmit();
        }
    };

    const handleSkip = () => {
        if (step === STEPS.length - 1) {
            handleSubmit();
        } else {
            setStep(s => s + 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        setAppState('generating');
        setErrorMsg('');

        try {
            const res = await fetch('/api/generate-business-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, ownerName: form.name }),
            });

            if (!res.ok) {
                const err = await res.json().catch(() => ({ error: 'Server error' }));
                throw new Error(err.error || `Server returned ${res.status}`);
            }

            const data = await res.json();
            if (data.pdf) {
                const bytes = atob(data.pdf);
                const arr = new Uint8Array(bytes.length);
                for (let i = 0; i < bytes.length; i++) arr[i] = bytes.charCodeAt(i);
                setPdfUrl(URL.createObjectURL(new Blob([arr], { type: 'application/pdf' })));
            }
            setAppState('success');
        } catch (err: any) {
            setErrorMsg(err.message || 'Something went wrong.');
            setAppState('error');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDownload = () => {
        if (!pdfUrl) return;
        const a = document.createElement('a');
        a.href = pdfUrl;
        a.download = `${(form.companyName || form.name).replace(/[^a-zA-Z0-9 ]/g, '').trim() || 'Daycare'}_Business_Plan.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    // ──────────── GENERATING ────────────
    if (appState === 'generating') {
        return (
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="glass-panel border-0 overflow-hidden">
                    <CardContent className="p-8">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="flex flex-col items-center text-center"
                        >
                            <motion.div
                                animate={{ rotate: [0, 5, -5, 5, 0], scale: [1, 1.05, 1, 1.05, 1] }}
                                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                                className="text-5xl mb-4"
                            >📋</motion.div>
                            <h2 className="text-xl font-bold text-gray-900 mb-1">Building Your Plan...</h2>
                            <p className="text-gray-500 text-sm mb-6">This takes just a moment.</p>
                            <div className="space-y-3 w-full max-w-xs text-left mb-6">
                                {LOADING_STEPS.map((s, i) => (
                                    <motion.div
                                        key={i}
                                        initial={{ opacity: 0, x: -16 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: i * 1.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 1.1 + 0.2 }} className="text-lg">{s.icon}</motion.span>
                                        <span className="text-sm text-gray-600">{s.text}</span>
                                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 1.1 + 0.6 }} className="ml-auto text-teal-500 text-sm">✓</motion.span>
                                    </motion.div>
                                ))}
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden w-full">
                                <motion.div className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'easeInOut' }} />
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ──────────── SUCCESS ────────────
    if (appState === 'success') {
        return (
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="glass-panel border-0 overflow-hidden">
                    <CardContent className="p-8">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-5xl mb-4">🎉</motion.div>
                            <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Your Plan is Ready!</h2>
                            <p className="text-gray-500 text-sm mb-1">We sent a copy to <strong className="text-gray-700">{form.email}</strong></p>
                            <p className="text-gray-400 text-xs mb-6">Check your inbox for the full 23-page PDF.</p>
                            {pdfUrl && (
                                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={handleDownload}
                                    className="w-full py-4 px-6 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white text-lg font-bold rounded-2xl shadow-xl shadow-teal-600/20 transition-all min-h-[56px] flex items-center justify-center gap-3 mb-4"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    Download PDF
                                </motion.button>
                            )}
                            <a href="/tools" className="text-sm font-semibold text-teal-600 hover:text-teal-800 transition-colors">← Back to Tools</a>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ──────────── ERROR ────────────
    if (appState === 'error') {
        return (
            <div className="max-w-md mx-auto px-4 py-16">
                <Card className="glass-panel border-0 overflow-hidden">
                    <CardContent className="p-8 text-center">
                        <div className="text-5xl mb-4">⚠️</div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">Something went wrong</h2>
                        <p className="text-gray-500 mb-6">{errorMsg}</p>
                        <button onClick={() => { setAppState('form'); setStep(0); }} className="px-6 py-3 bg-gray-900 text-white font-semibold rounded-xl hover:bg-gray-800 transition-colors">Try Again</button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // ──────────── MAIN: PREVIEW + FORM ────────────
    const current = STEPS[step];
    const isFirstStep = step === 0;

    return (
        <div className="max-w-lg mx-auto px-4 space-y-8">
            {/* SECTION 1: Live Preview Carousel */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <PlanPreviewCarousel />
            </motion.div>

            {/* SECTION 2: Headline */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="text-center">
                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-1">
                    Free 23-Page{' '}
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 to-emerald-500">Daycare Business Plan</span>
                </h2>
                <p className="text-gray-500 text-sm">Customized with your details. Emailed as a PDF.</p>
            </motion.div>

            {/* SECTION 3: Form Card */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <Card className="glass-panel border-0 overflow-hidden">
                    <CardContent className="p-6">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Progress */}
                                <div className="mb-5">
                                    <div className="flex justify-between text-xs text-gray-500 mb-2">
                                        <span>Step {step + 1} of {STEPS.length}</span>
                                        <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
                                    </div>
                                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                                            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Step header */}
                                <div className="flex items-center gap-3 mb-4">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="text-3xl"
                                    >{current.emoji}</motion.div>
                                    <div>
                                        <h3 className="text-base font-bold text-gray-900">{current.title}</h3>
                                        <p className="text-xs text-gray-500">{current.subtitle}</p>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-4">
                                    {current.fields.map((field, fi) => (
                                        <div key={field.key}>
                                            <label htmlFor={`bp-${field.key}`} className="block text-sm font-semibold text-gray-700 mb-1.5">
                                                {field.label}
                                                {field.required && <span className="text-red-400 ml-0.5">*</span>}
                                            </label>
                                            <input
                                                id={`bp-${field.key}`}
                                                type={field.type}
                                                placeholder={field.placeholder}
                                                value={form[field.key]}
                                                onChange={e => updateField(field.key, e.target.value)}
                                                required={field.required}
                                                autoFocus={fi === 0}
                                                className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white/80 text-base text-gray-900 placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all min-h-[48px]"
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation */}
                                <div className="mt-6 space-y-2">
                                    <div className="flex gap-3">
                                        {step > 0 && (
                                            <button onClick={() => setStep(s => s - 1)} className="px-4 py-3 rounded-xl border border-gray-200 text-gray-500 font-semibold hover:bg-gray-50 transition-colors min-h-[48px]">←</button>
                                        )}
                                        <motion.button
                                            whileHover={stepValid() ? { scale: 1.02 } : {}}
                                            whileTap={stepValid() ? { scale: 0.98 } : {}}
                                            onClick={handleNext}
                                            disabled={!stepValid()}
                                            className={`flex-1 py-3 px-6 text-base font-bold rounded-xl transition-all min-h-[48px] ${
                                                stepValid()
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white shadow-lg shadow-teal-600/20'
                                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {step === STEPS.length - 1 ? 'Generate My Plan →' : 'Next →'}
                                        </motion.button>
                                    </div>
                                    {!isFirstStep && (
                                        <button onClick={handleSkip} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 transition-colors py-1">
                                            {step === STEPS.length - 1 ? 'Skip & generate now' : 'Skip this step'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
