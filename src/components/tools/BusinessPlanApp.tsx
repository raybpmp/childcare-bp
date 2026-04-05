import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

/**
 * BusinessPlanApp — 3-Stage Lead-Gen Wizard
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
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4 py-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex flex-col items-center text-center"
                    >
                        <motion.div
                            animate={{ rotate: [0, 5, -5, 5, 0], scale: [1, 1.05, 1, 1.05, 1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                            className="text-4xl mb-4"
                        >📋</motion.div>
                        <h2 className="pro-heading-dense mb-1">Building Your Plan...</h2>
                        <p className="pro-text-meta mb-4">This takes just a moment.</p>
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
                        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden w-full">
                            <motion.div className="h-full bg-teal-600 rounded-full" initial={{ width: '0%' }} animate={{ width: '100%' }} transition={{ duration: 5, ease: 'easeInOut' }} />
                        </div>
                    </motion.div>
                </div>
            </div>
        );
    }

    // ──────────── SUCCESS ────────────
    if (appState === 'success') {
        return (
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4 py-10">
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center text-center">
                        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 12 }} className="text-4xl mb-4">🎉</motion.div>
                        <h2 className="pro-heading-dense mb-2">Your Plan is Ready!</h2>
                        <p className="pro-text-meta mb-1">Sent to <strong className="text-gray-700">{form.email}</strong></p>
                        <p className="text-[11px] text-gray-400 font-bold mb-4">Check your inbox for the full 23-page PDF.</p>
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
                        </motion.div>
                    </div>
                </div>
        );
    }

    // ──────────── ERROR ────────────
    if (appState === 'error') {
        return (
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4 py-10 text-center">
                    <div className="text-4xl mb-4">⚠️</div>
                    <h2 className="pro-heading-dense mb-2">Something went wrong</h2>
                    <p className="pro-text-meta mb-6">{errorMsg}</p>
                    <button onClick={() => { setAppState('form'); setStep(0); }} className="px-6 py-3 bg-gray-900 text-white font-bold rounded-xl text-sm transition-colors">Try Again</button>
                </div>
            </div>
        );
    }

    // ──────────── MAIN: PREVIEW + FORM ────────────
    const current = STEPS[step];
    const isFirstStep = step === 0;

    return (
        <div className="max-w-md mx-auto space-y-4 pt-4">
            {/* Headline */}
            <div className="text-center">
                <h1 className="pro-heading-dense">
                    Free 23-Page Business Plan
                </h1>
                <p className="pro-text-meta mt-1">Customized with your details. Emailed as a PDF.</p>
            </div>

            {/* SECTION 3: Form Card */}
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                <div className="pro-card glass-panel shadow-sm">
                    <div className="space-y-4">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={step}
                                initial={{ opacity: 0, x: 40 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -40 }}
                                transition={{ duration: 0.25 }}
                            >
                                {/* Progress */}
                                <div className="mb-4">
                                    <div className="flex justify-between pro-text-meta mb-1.5">
                                        <span>Step {step + 1} of {STEPS.length}</span>
                                        <span>{Math.round(((step + 1) / STEPS.length) * 100)}%</span>
                                    </div>
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <motion.div
                                            className="h-full bg-teal-600"
                                            animate={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
                                            transition={{ duration: 0.3 }}
                                        />
                                    </div>
                                </div>

                                {/* Step header */}
                                <div className="flex items-center gap-3 mb-3">
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                                        className="text-2xl"
                                    >{current.emoji}</motion.div>
                                    <div>
                                        <h3 className="pro-text-meta uppercase font-bold text-gray-900 leading-none">{current.title}</h3>
                                        <p className="text-[10px] text-gray-400 font-bold tracking-tight">{current.subtitle}</p>
                                    </div>
                                </div>

                                {/* Fields */}
                                <div className="space-y-3">
                                    {current.fields.map((field, fi) => (
                                        <div key={field.key}>
                                            <label htmlFor={`bp-${field.key}`} className="pro-text-meta mb-1.5 block">
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
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-100 bg-white shadow-sm text-sm text-gray-900 focus:ring-2 focus:ring-teal-50 outline-none transition-all min-h-[44px]"
                                                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleNext(); } }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* Navigation */}
                                <div className="mt-5 space-y-2">
                                    <div className="flex gap-2">
                                        {step > 0 && (
                                            <button onClick={() => setStep(s => s - 1)} className="px-4 py-2.5 rounded-xl border border-gray-100 text-gray-400 font-bold hover:bg-gray-50 transition-colors min-h-[48px]">←</button>
                                        )}
                                        <button
                                            onClick={handleNext}
                                            disabled={!stepValid()}
                                            className={`flex-1 py-3 px-6 text-sm font-bold rounded-xl transition-all min-h-[48px] ${
                                                stepValid()
                                                    ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20'
                                                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                            }`}
                                        >
                                            {step === STEPS.length - 1 ? 'Generate My Plan →' : 'Next →'}
                                        </button>
                                    </div>
                                    {!isFirstStep && (
                                        <button onClick={handleSkip} className="w-full text-center pro-text-meta tracking-normal text-gray-400 hover:text-gray-600 transition-colors py-1">
                                            {step === STEPS.length - 1 ? 'Skip & generate now' : 'Skip this step'}
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
