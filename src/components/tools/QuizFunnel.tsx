import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import PricingSection from '../PricingSection';

// STATE_DATA from IncomeBuilderTool.tsx
const STATE_DATA: Record<string, {
    name: string;
    hasLargeLicense: boolean;  // CRITICAL: Some states only allow small licenses
    smallCap: number;           // Max capacity for small (1 provider) license
    largeCap: number;           // Max capacity for large (2 provider) license
    maxInfantsSmall: number;    // Max infants for small license
    maxInfantsLarge: number;    // Max infants for large license
    marketWeeklyInfant: number;
    marketWeeklyToddler: number;
    marketWeeklyPreschool: number;
    subsidyWeeklyInfant: number;
    foodWeeklyPerChild: number;
    centerMaxCapacity: number;
}> = {
    AL: { name: 'Alabama', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 166, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    AK: { name: 'Alaska', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 250, marketWeeklyToddler: 225, marketWeeklyPreschool: 200, subsidyWeeklyInfant: 230, foodWeeklyPerChild: 32, centerMaxCapacity: 60 },
    AZ: { name: 'Arizona', hasLargeLicense: true, smallCap: 4, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 190, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    AR: { name: 'Arkansas', hasLargeLicense: true, smallCap: 6, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 155, marketWeeklyToddler: 140, marketWeeklyPreschool: 125, subsidyWeeklyInfant: 140, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    CA: { name: 'California', hasLargeLicense: true, smallCap: 8, largeCap: 14, maxInfantsSmall: 4, maxInfantsLarge: 4, marketWeeklyInfant: 385, marketWeeklyToddler: 350, marketWeeklyPreschool: 310, subsidyWeeklyInfant: 345, foodWeeklyPerChild: 32, centerMaxCapacity: 150 },
    CO: { name: 'Colorado', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 325, marketWeeklyToddler: 290, marketWeeklyPreschool: 255, subsidyWeeklyInfant: 295, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    CT: { name: 'Connecticut', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 340, marketWeeklyToddler: 305, marketWeeklyPreschool: 270, subsidyWeeklyInfant: 310, foodWeeklyPerChild: 28, centerMaxCapacity: 60 },
    DE: { name: 'Delaware', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 240, marketWeeklyToddler: 215, marketWeeklyPreschool: 190, subsidyWeeklyInfant: 220, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    FL: { name: 'Florida', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 4, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 195, foodWeeklyPerChild: 28, centerMaxCapacity: 150 },
    GA: { name: 'Georgia', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 200, marketWeeklyToddler: 180, marketWeeklyPreschool: 160, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    HI: { name: 'Hawaii', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 300, marketWeeklyToddler: 270, marketWeeklyPreschool: 240, subsidyWeeklyInfant: 275, foodWeeklyPerChild: 32, centerMaxCapacity: 50 },
    ID: { name: 'Idaho', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 165, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    IL: { name: 'Illinois', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 290, marketWeeklyToddler: 260, marketWeeklyPreschool: 230, subsidyWeeklyInfant: 265, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    IN: { name: 'Indiana', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 195, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    IA: { name: 'Iowa', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    KS: { name: 'Kansas', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 200, marketWeeklyToddler: 180, marketWeeklyPreschool: 160, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    KY: { name: 'Kentucky', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    LA: { name: 'Louisiana', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 185, marketWeeklyToddler: 165, marketWeeklyPreschool: 145, subsidyWeeklyInfant: 170, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    ME: { name: 'Maine', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 250, marketWeeklyToddler: 225, marketWeeklyPreschool: 200, subsidyWeeklyInfant: 225, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    MD: { name: 'Maryland', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    MA: { name: 'Massachusetts', hasLargeLicense: true, smallCap: 6, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 3, marketWeeklyInfant: 400, marketWeeklyToddler: 360, marketWeeklyPreschool: 320, subsidyWeeklyInfant: 365, foodWeeklyPerChild: 32, centerMaxCapacity: 70 },
    MI: { name: 'Michigan', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 235, marketWeeklyToddler: 210, marketWeeklyPreschool: 185, subsidyWeeklyInfant: 215, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    MN: { name: 'Minnesota', hasLargeLicense: true, smallCap: 10, largeCap: 14, maxInfantsSmall: 3, maxInfantsLarge: 3, marketWeeklyInfant: 320, marketWeeklyToddler: 285, marketWeeklyPreschool: 250, subsidyWeeklyInfant: 290, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    MS: { name: 'Mississippi', hasLargeLicense: false, smallCap: 5, largeCap: 5, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 148, marketWeeklyToddler: 135, marketWeeklyPreschool: 120, subsidyWeeklyInfant: 135, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    MO: { name: 'Missouri', hasLargeLicense: true, smallCap: 10, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    MT: { name: 'Montana', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 190, marketWeeklyToddler: 170, marketWeeklyPreschool: 150, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    NE: { name: 'Nebraska', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 210, marketWeeklyToddler: 190, marketWeeklyPreschool: 170, subsidyWeeklyInfant: 190, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    NV: { name: 'Nevada', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 240, marketWeeklyToddler: 215, marketWeeklyPreschool: 190, subsidyWeeklyInfant: 220, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    NH: { name: 'New Hampshire', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    NJ: { name: 'New Jersey', hasLargeLicense: false, smallCap: 5, largeCap: 5, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 335, marketWeeklyToddler: 300, marketWeeklyPreschool: 265, subsidyWeeklyInfant: 310, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    NM: { name: 'New Mexico', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28, centerMaxCapacity: 60 },
    NY: { name: 'New York', hasLargeLicense: true, smallCap: 8, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 365, marketWeeklyToddler: 325, marketWeeklyPreschool: 290, subsidyWeeklyInfant: 387, foodWeeklyPerChild: 32, centerMaxCapacity: 100 },
    NC: { name: 'North Carolina', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 220, marketWeeklyToddler: 200, marketWeeklyPreschool: 180, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    ND: { name: 'North Dakota', hasLargeLicense: true, smallCap: 7, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    OH: { name: 'Ohio', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 3, maxInfantsLarge: 3, marketWeeklyInfant: 220, marketWeeklyToddler: 200, marketWeeklyPreschool: 180, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    OK: { name: 'Oklahoma', hasLargeLicense: true, smallCap: 7, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    OR: { name: 'Oregon', hasLargeLicense: true, smallCap: 10, largeCap: 16, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 290, marketWeeklyToddler: 260, marketWeeklyPreschool: 230, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    PA: { name: 'Pennsylvania', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 260, marketWeeklyToddler: 235, marketWeeklyPreschool: 210, subsidyWeeklyInfant: 240, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    RI: { name: 'Rhode Island', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    SC: { name: 'South Carolina', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 180, marketWeeklyToddler: 162, marketWeeklyPreschool: 145, subsidyWeeklyInfant: 165, foodWeeklyPerChild: 28, centerMaxCapacity: 80 },
    SD: { name: 'South Dakota', hasLargeLicense: true, smallCap: 12, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 166, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 155, foodWeeklyPerChild: 28, centerMaxCapacity: 50 },
    TN: { name: 'Tennessee', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    TX: { name: 'Texas', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 225, marketWeeklyToddler: 205, marketWeeklyPreschool: 185, subsidyWeeklyInfant: 210, foodWeeklyPerChild: 28, centerMaxCapacity: 150 },
    UT: { name: 'Utah', hasLargeLicense: true, smallCap: 8, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    VT: { name: 'Vermont', hasLargeLicense: true, smallCap: 10, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 310, marketWeeklyToddler: 280, marketWeeklyPreschool: 250, subsidyWeeklyInfant: 285, foodWeeklyPerChild: 28, centerMaxCapacity: 40 },
    VA: { name: 'Virginia', hasLargeLicense: true, smallCap: 5, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 265, marketWeeklyToddler: 240, marketWeeklyPreschool: 215, subsidyWeeklyInfant: 245, foodWeeklyPerChild: 28, centerMaxCapacity: 100 },
    WA: { name: 'Washington', hasLargeLicense: true, smallCap: 12, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 340, marketWeeklyToddler: 305, marketWeeklyPreschool: 270, subsidyWeeklyInfant: 315, foodWeeklyPerChild: 32, centerMaxCapacity: 75 },
    WV: { name: 'West Virginia', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 160, marketWeeklyToddler: 145, marketWeeklyPreschool: 130, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28, centerMaxCapacity: 60 },
    WI: { name: 'Wisconsin', hasLargeLicense: true, smallCap: 8, largeCap: 8, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 255, marketWeeklyToddler: 230, marketWeeklyPreschool: 205, subsidyWeeklyInfant: 235, foodWeeklyPerChild: 28, centerMaxCapacity: 75 },
    WY: { name: 'Wyoming', hasLargeLicense: true, smallCap: 10, largeCap: 15, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28, centerMaxCapacity: 40 },
    DC: { name: 'Washington D.C.', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 504, marketWeeklyToddler: 450, marketWeeklyPreschool: 400, subsidyWeeklyInfant: 480, foodWeeklyPerChild: 35, centerMaxCapacity: 60 },
};

interface QuizAnswers {
    // Marketing data
    vision?: string;
    situation?: string;
    challenge?: string;
    successVision?: string;
    learningStyle?: string;
    timeline?: string;

    // Essential calculation data
    state?: string;
    businessType?: 'home' | 'center';
    licenseType?: 'small' | 'large';  // ONLY for home-based in states with hasLargeLicense
    totalKids?: number;                // For home-based
    centerCapacity?: number;           // For center-based

    // Email
    email?: string;
}

export default function QuizFunnel() {
    const [step, setStep] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswers>({});
    const [email, setEmail] = useState('');
    const [showEmailGate, setShowEmailGate] = useState(false);
    const [showCalculating, setShowCalculating] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    const stateInfo = answers.state ? STATE_DATA[answers.state] : null;

    // Calculate which step number shows email gate based on path
    const getEmailGateStep = () => {
        if (answers.businessType === 'home' && stateInfo?.hasLargeLicense) {
            return 10; // Home with large license: 0-9 questions, step 10 = email
        } else {
            return 9; // Center or home small-only: 0-8 questions, step 9 = email
        }
    };

    const handleAnswer = (key: keyof QuizAnswers, value: any) => {
        const newAnswers = { ...answers, [key]: value };
        setAnswers(newAnswers);

        setTimeout(() => {
            let nextStep = step + 1;

            // For existing owners at step 5, auto-set businessType and skip Q6
            if (nextStep === 5) {
                if (newAnswers.situation === 'running-home') {
                    setAnswers(prev => ({ ...prev, businessType: 'home' }));
                    nextStep = 6; // Skip Q6, go straight to license/capacity
                } else if (newAnswers.situation === 'running-center') {
                    setAnswers(prev => ({ ...prev, businessType: 'center' }));
                    nextStep = 6; // Skip Q6, go straight to capacity
                }
            }

            // Check if we should show email gate
            const emailStep = getEmailGateStep();
            if (nextStep === emailStep) {
                setShowEmailGate(true);
            } else {
                setStep(nextStep);
            }
        }, 300);
    };

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        setAnswers(prev => ({ ...prev, email }));
        setShowEmailGate(false);
        setShowCalculating(true);
        setSubmitting(false);

        // Show calculating animation for 5 seconds
        await new Promise(resolve => setTimeout(resolve, 5000));
        setShowCalculating(false);
        setShowResults(true);
    };

    // Calculate revenue using exact logic from IncomeBuilderTool.tsx
    const calculateRevenue = () => {
        if (!stateInfo) return { min: 0, max: 0 };

        if (answers.businessType === 'home') {
            const totalKids = answers.totalKids || 0;
            const maxInfantsLimit = answers.licenseType === 'large'
                ? stateInfo.maxInfantsLarge
                : stateInfo.maxInfantsSmall;

            // Auto-distribute like the original calculator does
            const infantsFirst = Math.min(totalKids, maxInfantsLimit);
            const remaining = totalKids - infantsFirst;
            const toddlersNext = Math.min(remaining, Math.ceil(remaining * 0.6));
            const preschoolLast = remaining - toddlersNext;

            const tuitionWeekly =
                (infantsFirst * stateInfo.marketWeeklyInfant) +
                (toddlersNext * stateInfo.marketWeeklyToddler) +
                (preschoolLast * stateInfo.marketWeeklyPreschool);

            const foodWeekly = totalKids * stateInfo.foodWeeklyPerChild;

            const subsidyWeekly =
                (infantsFirst * stateInfo.subsidyWeeklyInfant) +
                (toddlersNext * (stateInfo.subsidyWeeklyInfant * 0.85)) +
                (preschoolLast * (stateInfo.subsidyWeeklyInfant * 0.75));

            const min = Math.round((subsidyWeekly + foodWeekly) * 4.33 * 12);
            const max = Math.round((tuitionWeekly + foodWeekly) * 4.33 * 12);

            return { min, max };
        } else {
            // Center calculations
            const capacity = answers.centerCapacity || 50;

            // Auto-distribute like original calculator
            const maxCenterInfants = Math.min(30, capacity);
            const infantsFirst = Math.min(maxCenterInfants, Math.floor(capacity * 0.2));
            const remaining1 = capacity - infantsFirst;
            const toddlersNext = Math.floor(remaining1 * 0.35);
            const remaining2 = remaining1 - toddlersNext;
            const preschoolNext = Math.floor(remaining2 * 0.65);
            const schoolAgeLast = remaining2 - preschoolNext;

            const schoolAgeRate = Math.round(stateInfo.marketWeeklyPreschool * 0.6);

            const tuitionWeekly =
                (infantsFirst * stateInfo.marketWeeklyInfant) +
                (toddlersNext * stateInfo.marketWeeklyToddler) +
                (preschoolNext * stateInfo.marketWeeklyPreschool) +
                (schoolAgeLast * schoolAgeRate);

            const foodWeekly = capacity * stateInfo.foodWeeklyPerChild;
            const annual = Math.round((tuitionWeekly + foodWeekly) * 4.33 * 12);

            return { min: Math.round(annual * 0.7), max: annual };
        }
    };

    // Progress bar
    const ProgressBar = () => (
        <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
                <span>Question {Math.min(step + 1, 10)} of 10</span>
                <span>{Math.round(((step + 1) / 10) * 100)}%</span>
            </div>
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                    initial={{ width: 0 }}
                    animate={{ width: `${((step + 1) / 10) * 100}%` }}
                    transition={{ duration: 0.3 }}
                />
            </div>
        </div>
    );

    // Option button component
    const OptionButton = ({ emoji, label, value, selectedValue, onSelect }: {
        emoji: string;
        label: string;
        value: string;
        selectedValue?: string;
        onSelect: () => void;
    }) => (
        <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onSelect}
            className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-3 ${selectedValue === value
                ? 'bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-lg'
                : 'bg-white/60 hover:bg-white/80 border border-gray-200 hover:border-teal-300'
                }`}
        >
            <span className="text-2xl">{emoji}</span>
            <span className="font-medium">{label}</span>
        </motion.button>
    );

    // EMAIL GATE
    if (showEmailGate && !showResults) {
        const { min, max } = calculateRevenue();

        return (
            <div className="max-w-md mx-auto px-4">
                <Card className="glass-panel overflow-hidden aspect-[4/5]">
                    <CardContent className="p-6 h-full flex flex-col justify-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <span className="text-5xl mb-4 block">🎉</span>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                Your Revenue Report is Ready!
                            </h2>
                            <p className="text-gray-600">
                                We've calculated your personalized potential...
                            </p>
                        </motion.div>

                        <div className="relative p-6 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 text-center">
                            <p className="text-sm text-gray-500 mb-2">YOUR POTENTIAL</p>
                            <div className="text-3xl font-bold text-gray-400 blur-sm select-none">
                                ${min.toLocaleString()} - ${max.toLocaleString()}/year
                            </div>
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-lg font-medium text-teal-700">🔒 Enter email to unlock</span>
                            </div>
                        </div>

                        <form onSubmit={handleEmailSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Where should we send your breakdown?
                                </label>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@email.com"
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none transition-all"
                                />
                            </div>
                            <Button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white py-6 text-lg font-semibold rounded-xl"
                            >
                                {submitting ? '✨ Calculating...' : '🚀 Reveal My Results'}
                            </Button>
                            <p className="text-xs text-center text-gray-400">
                                Join 10,000+ childcare owners. No spam.
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // CALCULATING SCREEN - 5 second animated transition
    if (showCalculating) {
        const calculatingSteps = [
            { icon: '📊', text: 'Analyzing your state regulations...' },
            { icon: '💰', text: 'Calculating market rates...' },
            { icon: '👶', text: 'Optimizing age group distribution...' },
            { icon: '📈', text: 'Projecting annual revenue...' },
            { icon: '✨', text: 'Preparing your personalized report...' },
        ];

        return (
            <div className="max-w-md mx-auto px-4">
                <Card className="glass-panel overflow-hidden aspect-[4/5]">
                    <CardContent className="p-8 h-full flex flex-col items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="text-center space-y-8"
                        >
                            {/* Animated calculator icon */}
                            <motion.div
                                animate={{
                                    rotate: [0, 10, -10, 10, 0],
                                    scale: [1, 1.1, 1, 1.1, 1]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                                className="text-6xl"
                            >
                                🧮
                            </motion.div>

                            <div>
                                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                                    Crunching Your Numbers...
                                </h2>
                                <p className="text-gray-500">
                                    Building your personalized revenue report
                                </p>
                            </div>

                            {/* Animated progress steps */}
                            <div className="space-y-3 w-full max-w-xs mx-auto">
                                {calculatingSteps.map((step, index) => (
                                    <motion.div
                                        key={index}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: index * 0.9 }}
                                        className="flex items-center gap-3 text-left"
                                    >
                                        <motion.span
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: index * 0.9 + 0.2 }}
                                            className="text-xl"
                                        >
                                            {step.icon}
                                        </motion.span>
                                        <span className="text-sm text-gray-600">{step.text}</span>
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ delay: index * 0.9 + 0.5 }}
                                            className="ml-auto text-teal-500"
                                        >
                                            ✓
                                        </motion.span>
                                    </motion.div>
                                ))}
                            </div>

                            {/* Progress bar */}
                            <div className="w-full max-w-xs mx-auto">
                                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                                        initial={{ width: '0%' }}
                                        animate={{ width: '100%' }}
                                        transition={{ duration: 4.5, ease: "easeInOut" }}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // RESULTS SCREEN WITH INLINE PRICING
    if (showResults) {
        const { min, max } = calculateRevenue();

        return (
            <div className="w-full">
                {/* Condensed Revenue Summary */}
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="max-w-md mx-auto mb-8 px-4"
                >
                    <Card className="glass-panel overflow-hidden">
                        <CardContent className="p-6 text-center">
                            <span className="text-4xl mb-3 block">💰</span>
                            <p className="text-xs text-gray-500 mb-1">YOUR REVENUE POTENTIAL IN {stateInfo?.name.toUpperCase()}</p>
                            <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-teal-600 to-emerald-600 bg-clip-text text-transparent">
                                ${min.toLocaleString()} - ${max.toLocaleString()}/yr
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                ✨ Achievable with the right plan. Choose yours below.
                            </p>
                            <p className="text-xs text-gray-400 mt-2">
                                ✉️ Check your email for your detailed breakdown.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Inline Pricing Section */}
                <PricingSection />
            </div>
        );
    }

    // QUIZ QUESTIONS
    return (
        <div className="max-w-md mx-auto px-4">
            <Card className="glass-panel aspect-[4/5]">
                <CardContent className="p-6 h-full flex flex-col">
                    <ProgressBar />

                    <AnimatePresence mode="wait">
                        <motion.div
                            key={step}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.2 }}
                            className="flex-1 flex flex-col justify-center"
                        >
                            {/* Q1: Vision - UNIVERSAL WORDING */}
                            {step === 0 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        What type of childcare business interests you?
                                    </h2>
                                    <div className="space-y-3">
                                        <OptionButton emoji="🏡" label="Home-based daycare" value="home" selectedValue={answers.vision} onSelect={() => handleAnswer('vision', 'home')} />
                                        <OptionButton emoji="🏢" label="Professional childcare center" value="center" selectedValue={answers.vision} onSelect={() => handleAnswer('vision', 'center')} />
                                        <OptionButton emoji="💭" label="Still figuring it out" value="unsure" selectedValue={answers.vision} onSelect={() => handleAnswer('vision', 'unsure')} />
                                    </div>
                                </div>
                            )}

                            {/* Q2: Situation */}
                            {step === 1 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        Where are you in your journey?
                                    </h2>
                                    <div className="space-y-3">
                                        <OptionButton emoji="🌱" label="Just exploring the idea" value="exploring" selectedValue={answers.situation} onSelect={() => handleAnswer('situation', 'exploring')} />
                                        <OptionButton emoji="📋" label="Planning to launch soon" value="planning" selectedValue={answers.situation} onSelect={() => handleAnswer('situation', 'planning')} />
                                        <OptionButton emoji="🏠" label="Already running a home daycare" value="running-home" selectedValue={answers.situation} onSelect={() => handleAnswer('situation', 'running-home')} />
                                        <OptionButton emoji="🏢" label="Already running a center" value="running-center" selectedValue={answers.situation} onSelect={() => handleAnswer('situation', 'running-center')} />
                                    </div>
                                </div>
                            )}

                            {/* Q3: Challenge - CONTEXTUAL OPTIONS */}
                            {step === 2 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        {answers.situation === 'running-home' || answers.situation === 'running-center'
                                            ? "What's holding your business back?"
                                            : "What's your biggest hurdle?"}
                                    </h2>
                                    <div className="space-y-3">
                                        {answers.situation === 'running-home' || answers.situation === 'running-center' ? (
                                            <>
                                                <OptionButton emoji="💸" label="Not making enough profit" value="money" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'money')} />
                                                <OptionButton emoji="👥" label="Filling empty spots" value="enrollment" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'enrollment')} />
                                                <OptionButton emoji="📈" label="Ready to grow but unsure how" value="growth" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'growth')} />
                                                <OptionButton emoji="⏰" label="Overwhelmed and burned out" value="time" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'time')} />
                                            </>
                                        ) : (
                                            <>
                                                <OptionButton emoji="💸" label="Not sure if the money is there" value="money" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'money')} />
                                                <OptionButton emoji="📜" label="Licensing feels overwhelming" value="licensing" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'licensing')} />
                                                <OptionButton emoji="👥" label="Getting families to enroll" value="enrollment" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'enrollment')} />
                                                <OptionButton emoji="⏰" label="Finding time to figure it out" value="time" selectedValue={answers.challenge} onSelect={() => handleAnswer('challenge', 'time')} />
                                            </>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Q4: State - CONTEXTUAL WORDING */}
                            {step === 3 && (
                                <div className="space-y-8">
                                    <div className="text-center">
                                        <span className="text-4xl mb-4 block">🗺️</span>
                                        <h2 className="text-xl font-bold text-gray-900">
                                            {answers.situation === 'running-home' || answers.situation === 'running-center'
                                                ? 'Where is your business located?'
                                                : 'Where will your business be?'}
                                        </h2>
                                        <p className="text-gray-500 text-sm mt-2">
                                            We'll use local market rates for your calculation
                                        </p>
                                    </div>
                                    <Select value={answers.state || ''} onValueChange={(val) => handleAnswer('state', val)}>
                                        <SelectTrigger className="w-full py-6 text-lg border-2 border-gray-200 hover:border-teal-400 transition-colors">
                                            <SelectValue placeholder="Select your state..." />
                                        </SelectTrigger>
                                        <SelectContent className="max-h-[300px]">
                                            {Object.entries(STATE_DATA).map(([code, info]) => (
                                                <SelectItem key={code} value={code} className="py-3 text-base">
                                                    {info.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {answers.state && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="p-4 rounded-xl bg-gradient-to-r from-teal-50 to-emerald-50 text-center"
                                        >
                                            <p className="text-teal-700 font-medium">
                                                📈 {STATE_DATA[answers.state].name} — we have your local market rates!
                                            </p>
                                        </motion.div>
                                    )}
                                </div>
                            )}

                            {/* Q5: Success Vision - UNIVERSAL WORDING */}
                            {step === 4 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        What matters most to you?
                                    </h2>
                                    <div className="space-y-3">
                                        <OptionButton emoji="💰" label="Maximizing my income" value="financial" selectedValue={answers.successVision} onSelect={() => handleAnswer('successVision', 'financial')} />
                                        <OptionButton emoji="🏠" label="Flexibility and work-life balance" value="flexibility" selectedValue={answers.successVision} onSelect={() => handleAnswer('successVision', 'flexibility')} />
                                        <OptionButton emoji="👨‍👩‍👧" label="More time with my family" value="family" selectedValue={answers.successVision} onSelect={() => handleAnswer('successVision', 'family')} />
                                        <OptionButton emoji="❤️" label="Making a difference for kids" value="impact" selectedValue={answers.successVision} onSelect={() => handleAnswer('successVision', 'impact')} />
                                    </div>
                                </div>
                            )}

                            {/* Q6: Business Type (FORK POINT) - CONTEXTUAL WORDING */}
                            {step === 5 && (
                                <div className="space-y-6">
                                    <h2 className="text-xl font-bold text-gray-900 text-center">
                                        {answers.situation === 'running-home' || answers.situation === 'running-center'
                                            ? 'What type of business do you run?'
                                            : 'Which path are you taking?'}
                                    </h2>
                                    <div className="space-y-3">
                                        <OptionButton emoji="🏡" label="Home-based daycare" value="home" selectedValue={answers.businessType} onSelect={() => handleAnswer('businessType', 'home')} />
                                        <OptionButton emoji="🏢" label="Childcare center" value="center" selectedValue={answers.businessType} onSelect={() => handleAnswer('businessType', 'center')} />
                                    </div>
                                </div>
                            )}

                            {/* HOME PATH: Q7H - License Type (ONLY if hasLargeLicense) */}
                            {step === 6 && answers.businessType === 'home' && stateInfo?.hasLargeLicense && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                        How big do you want to go?
                                    </h2>
                                    <div className="space-y-3">
                                        <OptionButton
                                            emoji="🤱"
                                            label={`Solo provider (up to ${stateInfo.smallCap} kids)`}
                                            value="small"
                                            selectedValue={answers.licenseType}
                                            onSelect={() => handleAnswer('licenseType', 'small')}
                                        />
                                        <OptionButton
                                            emoji="👥"
                                            label={`With help (up to ${stateInfo.largeCap} kids)`}
                                            value="large"
                                            selectedValue={answers.licenseType}
                                            onSelect={() => handleAnswer('licenseType', 'large')}
                                        />
                                    </div>
                                </div>
                            )}

                            {/* HOME PATH: Capacity Slider (Step 6 for small-only states, Step 7 for large license states) */}
                            {step === 6 && answers.businessType === 'home' && !stateInfo?.hasLargeLicense && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                        How many children total?
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Children</span>
                                            <span className="font-bold text-teal-700 text-lg">{answers.totalKids || 0}</span>
                                        </div>
                                        <Slider
                                            value={[answers.totalKids || 0]}
                                            onValueChange={(val) => setAnswers(prev => ({ ...prev, totalKids: val[0] }))}
                                            min={0}
                                            max={stateInfo!.smallCap}
                                            step={1}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 text-center">
                                            Drag to set your target enrollment
                                        </p>
                                        {answers.totalKids && answers.totalKids > 0 && (
                                            <Button
                                                onClick={() => setStep(step + 1)}
                                                className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                                            >
                                                Continue →
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {step === 7 && answers.businessType === 'home' && stateInfo?.hasLargeLicense && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                        How many children total?
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Children</span>
                                            <span className="font-bold text-teal-700 text-lg">{answers.totalKids || 0}</span>
                                        </div>
                                        <Slider
                                            value={[answers.totalKids || 0]}
                                            onValueChange={(val) => setAnswers(prev => ({ ...prev, totalKids: val[0] }))}
                                            min={0}
                                            max={answers.licenseType === 'large' ? stateInfo!.largeCap : stateInfo!.smallCap}
                                            step={1}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 text-center">
                                            Drag to set your target enrollment
                                        </p>
                                        {answers.totalKids && answers.totalKids > 0 && (
                                            <Button
                                                onClick={() => setStep(step + 1)}
                                                className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                                            >
                                                Continue →
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* CENTER PATH: Q7C - Capacity Slider */}
                            {step === 6 && answers.businessType === 'center' && (
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900 mb-4 text-center">
                                        What's your target capacity?
                                    </h2>
                                    <div className="space-y-4">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Total Capacity</span>
                                            <span className="font-bold text-teal-700 text-lg">{answers.centerCapacity || 50}</span>
                                        </div>
                                        <Slider
                                            value={[answers.centerCapacity || 50]}
                                            onValueChange={(val) => setAnswers(prev => ({ ...prev, centerCapacity: val[0] }))}
                                            min={20}
                                            max={Math.min(150, stateInfo?.centerMaxCapacity || 150)}
                                            step={5}
                                            className="w-full"
                                        />
                                        <p className="text-xs text-gray-500 text-center">
                                            Drag to set your target enrollment
                                        </p>
                                        <Button
                                            onClick={() => setStep(step + 1)}
                                            className="w-full bg-teal-600 hover:bg-teal-700 mt-4"
                                        >
                                            Continue →
                                        </Button>
                                    </div>
                                </div>
                            )}

                            {/* Q9: Learning Style (Step 7 for center/home-small, Step 8 for home-large) */}
                            {((step === 7 && (answers.businessType === 'center' || !stateInfo?.hasLargeLicense)) ||
                                (step === 8 && answers.businessType === 'home' && stateInfo?.hasLargeLicense)) && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                            How do you prefer support?
                                        </h2>
                                        <div className="space-y-3">
                                            <OptionButton emoji="📚" label="DIY resources" value="diy" selectedValue={answers.learningStyle} onSelect={() => handleAnswer('learningStyle', 'diy')} />
                                            <OptionButton emoji="👥" label="Community" value="community" selectedValue={answers.learningStyle} onSelect={() => handleAnswer('learningStyle', 'community')} />
                                            <OptionButton emoji="🎯" label="One-on-one" value="guided" selectedValue={answers.learningStyle} onSelect={() => handleAnswer('learningStyle', 'guided')} />
                                            <OptionButton emoji="✅" label="Done-for-you" value="done-for-you" selectedValue={answers.learningStyle} onSelect={() => handleAnswer('learningStyle', 'done-for-you')} />
                                        </div>
                                    </div>
                                )}

                            {/* Q10: Timeline (Step 8 for center/home-small, Step 9 for home-large) */}
                            {((step === 8 && (answers.businessType === 'center' || !stateInfo?.hasLargeLicense)) ||
                                (step === 9 && answers.businessType === 'home' && stateInfo?.hasLargeLicense)) && (
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">
                                            When do you want to launch?
                                        </h2>
                                        <div className="space-y-3">
                                            <OptionButton emoji="⚡" label="ASAP" value="asap" selectedValue={answers.timeline} onSelect={() => handleAnswer('timeline', 'asap')} />
                                            <OptionButton emoji="📅" label="Next 6 months" value="6months" selectedValue={answers.timeline} onSelect={() => handleAnswer('timeline', '6months')} />
                                            <OptionButton emoji="🗓️" label="Within a year" value="year" selectedValue={answers.timeline} onSelect={() => handleAnswer('timeline', 'year')} />
                                            <OptionButton emoji="💭" label="Just exploring" value="exploring" selectedValue={answers.timeline} onSelect={() => handleAnswer('timeline', 'exploring')} />
                                        </div>
                                    </div>
                                )}
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation */}
                    <div className="flex justify-between pt-4">
                        <button
                            onClick={() => step > 0 && setStep(step - 1)}
                            className={`text-gray-500 hover:text-gray-700 ${step === 0 ? 'invisible' : ''}`}
                        >
                            ← Back
                        </button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
