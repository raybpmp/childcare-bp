import React, { useState } from 'react';
import { useStore } from '@nanostores/react';
import { motion, AnimatePresence } from 'framer-motion';
import { isModalOpen, selectedFunnel, closeModal, type FunnelType } from '../store/modalStore';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Need to make sure this is installed or use svg

export default function EmailCaptureModal() {
    const $isOpen = useStore(isModalOpen);
    const $funnel = useStore(selectedFunnel);
    const [email, setEmail] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');

    // Local state for immediate UI toggle, synced initially with store
    const [activeTab, setActiveTab] = useState<FunnelType>($funnel);

    // Sync tab when store changes (e.g. opened from different button)
    React.useEffect(() => {
        if ($isOpen) setActiveTab($funnel);
    }, [$isOpen, $funnel]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        // Simulate API call
        setTimeout(() => {
            console.log('Lead submitted:', { email, funnel: activeTab });
            setStatus('success');
            setTimeout(() => {
                closeModal();
                setStatus('idle');
                setEmail('');
                window.location.href = `/thank-you?funnel=${activeTab}`;
            }, 1500);
        }, 1000);
    };

    return (
        <AnimatePresence>
            {$isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeModal}
                        className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
                    >
                        <div className="glass-panel w-full max-w-lg rounded-3xl p-8 shadow-2xl pointer-events-auto relative overflow-hidden">

                            {/* Close Button */}
                            <button
                                onClick={closeModal}
                                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-black/5 transition-colors"
                            >
                                <span className="sr-only">Close</span>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            <div className="text-center mb-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Get Your Free {activeTab === 'startup' ? 'Startup' : 'Growth'} Toolkit
                                </h2>
                                <p className="text-gray-600">
                                    Enter your email to unlock the {activeTab === 'startup' ? 'financial calculator & launch checklist' : 'staffing model & expansion guide'}.
                                </p>
                            </div>

                            {/* Funnel Toggle */}
                            <div className="flex bg-gray-100/50 p-1 rounded-full mb-8 relative">
                                {/* Sliding Background */}
                                <motion.div
                                    className="absolute bg-white shadow-sm rounded-full h-[calc(100%-8px)] top-1"
                                    initial={false}
                                    animate={{
                                        width: '50%',
                                        x: activeTab === 'startup' ? 0 : '100%',
                                    }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                />
                                <button
                                    onClick={() => setActiveTab('startup')}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-medium rounded-full transition-colors ${activeTab === 'startup' ? 'text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Start a Daycare
                                </button>
                                <button
                                    onClick={() => setActiveTab('growth')}
                                    className={`flex-1 relative z-10 py-2.5 text-sm font-medium rounded-full transition-colors ${activeTab === 'growth' ? 'text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
                                >
                                    Own a Daycare
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div>
                                    <label htmlFor="email" className="sr-only">Email address</label>
                                    <input
                                        type="email"
                                        id="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full px-5 py-3 rounded-xl border border-gray-200 bg-white/50 focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all placeholder:text-gray-400"
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={status === 'loading'}
                                    className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-3.5 rounded-full shadow-lg shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {status === 'loading' ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Processing...
                                        </>
                                    ) : status === 'success' ? (
                                        'Check your inbox!'
                                    ) : (
                                        `Get My ${activeTab === 'startup' ? 'Startup' : 'Growth'} Toolkit`
                                    )}
                                </button>

                                <p className="text-xs text-center text-gray-400 mt-4">
                                    We respect your privacy. Unsubscribe at any time.
                                </p>
                            </form>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
