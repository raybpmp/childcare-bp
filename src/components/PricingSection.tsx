import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Switch } from '@/components/ui/switch';
import { CheckIcon, SparklesIcon, RocketIcon, CrownIcon, TrendingUpIcon, XIcon } from 'lucide-react';
import EmbeddedCheckoutForm from './EmbeddedCheckoutForm';

interface PricingTier {
    name: string;
    tagline: string;
    description: string;
    monthlyPrice: number;
    yearlyPrice: number;
    tierId: 'launchpad' | 'director' | 'ceo';
    featured?: boolean;
    badge?: string;
    bundleBonus?: string;
    icon: React.ReactNode;
    benefits: string[];
    everythingIn?: string;
}

const tiers: PricingTier[] = [
    {
        name: 'The Launchpad',
        tagline: 'Start Right',
        description: 'Everything you need to get licensed and open your doors.',
        monthlyPrice: 99,
        yearlyPrice: 499,
        tierId: 'launchpad',
        bundleBonus: 'FREE: 90-Day Startup Checklist ($500 Value)',
        icon: <RocketIcon className="w-5 h-5" />,
        benefits: [
            'State-specific licensing roadmap',
            'Done-for-you waitlist system',
            'Startup community access',
            'Monthly live Q&A calls',
            'Resource library access',
        ],
    },
    {
        name: 'The Director',
        tagline: 'Scale Smart',
        description: 'Systems and support to maximize enrollment and profit.',
        monthlyPrice: 349,
        yearlyPrice: 2499,
        tierId: 'director',
        featured: true,
        badge: 'Most Popular',
        bundleBonus: 'FREE: Complete Staff Toolkit ($997 Value)',
        icon: <TrendingUpIcon className="w-5 h-5" />,
        everythingIn: 'Launchpad',
        benefits: [
            'Revenue optimization strategies',
            'Staff management systems',
            'Tax & profit maximization',
            'Bi-weekly group coaching',
            'Priority email support',
        ],
    },
    {
        name: 'The CEO Circle',
        tagline: 'Build Empire',
        description: 'High-touch mentorship for multi-location growth.',
        monthlyPrice: 749,
        yearlyPrice: 5500,
        tierId: 'ceo',
        bundleBonus: 'FREE: Exit Strategy Blueprint ($2,500 Value)',
        icon: <CrownIcon className="w-5 h-5" />,
        everythingIn: 'Director',
        benefits: [
            'Direct founder access',
            'Private mastermind group',
            'Multi-site expansion playbook',
            'Quarterly strategy sessions',
            'Exclusive retreat invites',
        ],
    },
];

export default function PricingSection() {
    const [isYearly, setIsYearly] = useState(true);
    const [checkoutTier, setCheckoutTier] = useState<'launchpad' | 'director' | 'ceo' | null>(null);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            minimumFractionDigits: 0,
        }).format(price);
    };

    const getSavings = (monthly: number, yearly: number) => {
        const annualMonthly = monthly * 12;
        return annualMonthly - yearly;
    };

    const getMonthlyEquivalent = (yearly: number) => {
        return Math.round(yearly / 12);
    };

    const handleCheckout = (tierId: 'launchpad' | 'director' | 'ceo') => {
        setCheckoutTier(tierId);
    };

    const closeCheckout = () => {
        setCheckoutTier(null);
    };

    return (
        <>
            <section className="py-12 md:py-20">
                {/* Header */}
                <div className="text-center mb-8 px-4">
                    <span className="inline-block px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-semibold mb-3">
                        Membership Plans
                    </span>
                    <h1 className="text-2xl font-bold text-gray-900 mb-3 md:text-4xl">
                        The Complete Childcare Business System
                    </h1>
                    <p className="text-base text-gray-600 max-w-2xl mx-auto md:text-lg">
                        Stop piecing it together. Get the proven systems, support, and strategies that top daycare owners use to build profitable businesses.
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-3 mt-6">
                        <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                            Monthly
                        </span>
                        <Switch
                            checked={isYearly}
                            onCheckedChange={setIsYearly}
                            className="data-[state=checked]:bg-teal-600"
                        />
                        <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-gray-900' : 'text-gray-500'}`}>
                            Yearly
                            <span className="text-teal-600 text-xs ml-1 font-bold">(Best Value)</span>
                        </span>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="px-4 max-w-7xl mx-auto">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-stretch lg:gap-8">
                        {tiers.map((tier, index) => (
                            <motion.div
                                key={tier.name}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`
                                    relative flex flex-col rounded-2xl w-full
                                    ${tier.featured
                                        ? 'bg-gray-900 text-white shadow-2xl lg:-mt-4 lg:mb-4 z-10'
                                        : 'glass-panel'
                                    }
                                `}
                            >
                                {/* Featured Badge */}
                                {tier.badge && (
                                    <div className="absolute -top-3 inset-x-0 flex justify-center">
                                        <span className="bg-gradient-to-r from-teal-500 to-teal-400 text-white px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide shadow-lg">
                                            {tier.badge}
                                        </span>
                                    </div>
                                )}

                                <div className="p-6 md:p-8 flex-1 flex flex-col">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.featured
                                            ? 'bg-teal-500/20 text-teal-400'
                                            : 'bg-teal-100 text-teal-600'
                                            }`}>
                                            {tier.icon}
                                        </div>
                                        <div>
                                            <h3 className={`text-lg font-bold ${tier.featured ? 'text-white' : 'text-gray-900'}`}>
                                                {tier.name}
                                            </h3>
                                            <p className={`text-xs font-semibold uppercase tracking-wide ${tier.featured ? 'text-teal-400' : 'text-teal-600'}`}>
                                                {tier.tagline}
                                            </p>
                                        </div>
                                    </div>

                                    <p className={`text-sm mb-4 ${tier.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                                        {tier.description}
                                    </p>

                                    {/* Pricing */}
                                    <div className="mb-6">
                                        {isYearly ? (
                                            <>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-4xl font-bold ${tier.featured ? 'text-white' : 'text-gray-900'} md:text-5xl`}>
                                                        {formatPrice(tier.yearlyPrice)}
                                                    </span>
                                                    <span className={`text-lg ${tier.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        /year
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className={`text-sm line-through ${tier.featured ? 'text-gray-500' : 'text-gray-400'}`}>
                                                        {formatPrice(tier.monthlyPrice * 12)}/yr
                                                    </span>
                                                    <span className="text-xs font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                                                        SAVE {formatPrice(getSavings(tier.monthlyPrice, tier.yearlyPrice))}
                                                    </span>
                                                </div>
                                                <p className={`text-xs mt-1 ${tier.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                                                    Just {formatPrice(getMonthlyEquivalent(tier.yearlyPrice))}/month
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-baseline gap-2">
                                                    <span className={`text-4xl font-bold ${tier.featured ? 'text-white' : 'text-gray-900'} md:text-5xl`}>
                                                        {formatPrice(tier.monthlyPrice)}
                                                    </span>
                                                    <span className={`text-lg ${tier.featured ? 'text-gray-400' : 'text-gray-500'}`}>
                                                        /month
                                                    </span>
                                                </div>
                                                <p className="text-xs text-amber-600 font-medium mt-1">
                                                    💡 Switch to yearly and save {formatPrice(getSavings(tier.monthlyPrice, tier.yearlyPrice))}
                                                </p>
                                            </>
                                        )}
                                    </div>

                                    {/* Bundle Bonus (yearly only) */}
                                    {isYearly && tier.bundleBonus && (
                                        <div className={`rounded-lg p-3 mb-6 border ${tier.featured
                                            ? 'bg-teal-500/10 border-teal-500/30'
                                            : 'bg-teal-50 border-teal-100'
                                            }`}>
                                            <div className="flex items-center gap-2">
                                                <SparklesIcon className={`w-4 h-4 ${tier.featured ? 'text-teal-400' : 'text-teal-600'}`} />
                                                <span className={`text-sm font-semibold ${tier.featured ? 'text-teal-300' : 'text-teal-800'}`}>
                                                    {tier.bundleBonus}
                                                </span>
                                            </div>
                                        </div>
                                    )}

                                    {/* Everything In Badge */}
                                    {tier.everythingIn && (
                                        <div className={`text-sm font-semibold mb-4 py-2 px-3 rounded-lg border ${tier.featured
                                                ? 'bg-white/5 border-white/10 text-white'
                                                : 'bg-gray-100 border-gray-200 text-gray-800'
                                            }`}>
                                            <span className="text-teal-500">✓</span> Includes everything in <span className="font-bold">{tier.everythingIn}</span>, plus:
                                        </div>
                                    )}

                                    {/* Benefits */}
                                    <ul className="space-y-3 mb-6 flex-1">
                                        {tier.benefits.map((benefit, i) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckIcon className={`w-4 h-4 mt-0.5 flex-shrink-0 ${tier.featured ? 'text-teal-400' : 'text-teal-600'}`} />
                                                <span className={`text-sm ${tier.featured ? 'text-gray-300' : 'text-gray-600'}`}>
                                                    {benefit}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>

                                    {/* CTA Button - Now triggers embedded checkout */}
                                    <button
                                        onClick={() => handleCheckout(tier.tierId)}
                                        className={`block w-full min-h-[48px] font-bold py-3 px-4 rounded-lg text-center transition-all shadow-lg cursor-pointer ${tier.featured
                                            ? 'bg-white hover:bg-gray-100 text-gray-900'
                                            : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-500/30'
                                            }`}
                                    >
                                        {tier.featured ? 'Get Started Today' : 'Join Now'}
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Upgrade Guarantee + Trust */}
                <div className="mt-12 text-center px-4 space-y-4">
                    <div className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 px-4 py-2 rounded-full text-sm font-medium">
                        <TrendingUpIcon className="w-4 h-4" />
                        Upgrade anytime — 100% of your payment applies to higher tiers
                    </div>
                    <p className="text-sm text-gray-400">
                        Cancel anytime. No contracts. No hidden fees.
                    </p>
                </div>
            </section>

            {/* Embedded Checkout Modal */}
            <AnimatePresence>
                {checkoutTier && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
                        onClick={closeCheckout}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-auto"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={closeCheckout}
                                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                                aria-label="Close checkout"
                            >
                                <XIcon className="w-5 h-5 text-gray-600" />
                            </button>
                            <div className="p-6">
                                <EmbeddedCheckoutForm
                                    tier={checkoutTier}
                                    billing={isYearly ? 'yearly' : 'monthly'}
                                    onClose={closeCheckout}
                                />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
