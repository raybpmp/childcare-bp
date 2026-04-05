import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';

// Federal HHS/OCC (CCDF) and USDA CACFP Data Integration
// Revenue Breakdown: 1. Tuition (Market), 2. Subsidy Floor (HHS), 3. Food Reimbursement (USDA)
const STATE_DATA: Record<string, {
    name: string;
    hasLargeLicense: boolean;
    smallCap: number; // 1 Provider
    largeCap: number; // 2 Providers
    maxInfantsSmall: number;
    maxInfantsLarge: number;
    marketWeeklyInfant: number;
    marketWeeklyToddler: number;
    marketWeeklyPreschool: number;
    subsidyWeeklyInfant: number; // OCC Reimbursement Floor
    foodWeeklyPerChild: number;   // USDA CACFP (Avg $28/child/week)
    centerMaxCapacity: number; // Max center capacity for state (typical licensed limit)
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

export default function IncomeBuilderTool() {
    // Business type selector: 'home' or 'center'
    const [businessType, setBusinessType] = useState<'home' | 'center'>('home');

    // Shared state
    const [selectedState, setSelectedState] = useState('');
    const [showResults, setShowResults] = useState(false);

    // Home-based specific state
    const [licenseType, setLicenseType] = useState('small');
    const [infants, setInfants] = useState(0);
    const [toddlers, setToddlers] = useState(0);
    const [preschool, setPreschool] = useState(0);

    // Center-based specific state
    const [centerCapacity, setCenterCapacity] = useState(40);
    const [centerInfants, setCenterInfants] = useState(8);
    const [centerToddlers, setCenterToddlers] = useState(12);
    const [centerPreschool, setCenterPreschool] = useState(15);
    const [centerSchoolAge, setCenterSchoolAge] = useState(5);

    const stateInfo = selectedState ? STATE_DATA[selectedState] : null;
    const totalKids = infants + toddlers + preschool;

    // Dynamic Limits based on License Type
    const maxTotalKids = stateInfo ? (licenseType === 'large' ? stateInfo.largeCap : stateInfo.smallCap) : 0;
    const maxInfantsLimit = stateInfo ? (licenseType === 'large' ? stateInfo.maxInfantsLarge : stateInfo.maxInfantsSmall) : 0;

    // Remaining capacity
    const maxInfants = Math.max(0, Math.min(maxInfantsLimit, maxTotalKids - toddlers - preschool));
    const maxToddlers = Math.max(0, maxTotalKids - infants - preschool);
    const maxPreschool = Math.max(0, maxTotalKids - infants - toddlers);

    // Revenue Breakdown
    const tuitionWeekly = stateInfo ? (
        (infants * stateInfo.marketWeeklyInfant) +
        (toddlers * stateInfo.marketWeeklyToddler) +
        (preschool * stateInfo.marketWeeklyPreschool)
    ) : 0;

    const foodWeekly = stateInfo ? (totalKids * stateInfo.foodWeeklyPerChild) : 0;
    const totalWeekly = tuitionWeekly + foodWeekly;
    const monthlyIncome = Math.round(totalWeekly * 4.33);

    const subsidyWeekly = stateInfo ? (
        (infants * stateInfo.subsidyWeeklyInfant) +
        (toddlers * (stateInfo.subsidyWeeklyInfant * 0.85)) + // Estimate toddler floor
        (preschool * (stateInfo.subsidyWeeklyInfant * 0.75))  // Estimate preschool floor
    ) : 0;

    const minMonthlyIncome = Math.round((subsidyWeekly + foodWeekly) * 4.33);
    const maxMonthlyIncome = Math.round((tuitionWeekly + foodWeekly) * 4.33);

    // Center-based calculations
    const centerTotalKids = centerInfants + centerToddlers + centerPreschool + centerSchoolAge;
    const schoolAgeWeeklyRate = stateInfo ? Math.round(stateInfo.marketWeeklyPreschool * 0.6) : 0; // Before/after school rate

    const centerTuitionWeekly = stateInfo ? (
        (centerInfants * stateInfo.marketWeeklyInfant) +
        (centerToddlers * stateInfo.marketWeeklyToddler) +
        (centerPreschool * stateInfo.marketWeeklyPreschool) +
        (centerSchoolAge * schoolAgeWeeklyRate)
    ) : 0;

    const centerFoodWeekly = stateInfo ? (centerTotalKids * stateInfo.foodWeeklyPerChild) : 0;
    const centerMonthlyGross = Math.round((centerTuitionWeekly + centerFoodWeekly) * 4.33);
    const centerAnnualGross = centerMonthlyGross * 12;

    // Validation for each mode
    const canCalculateHome = selectedState && totalKids > 0;
    const canCalculateCenter = selectedState && centerTotalKids > 0;
    const canCalculate = businessType === 'home' ? canCalculateHome : canCalculateCenter;

    // VIEW 1: Input form
    if (!showResults) {
        return (
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4">
                    {/* Business Type Selector */}
                    <div className="space-y-2">
                        <h1 className="pro-heading-dense text-center">
                            {businessType === 'home' ? 'Home Daycare' : 'Childcare Center'} Income Builder
                        </h1>
                        <div className="flex gap-1 p-1 glass-panel rounded-md">
                            <button
                                onClick={() => {
                                    setBusinessType('home');
                                    setSelectedState('');
                                    setShowResults(false);
                                }}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${businessType === 'home' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}`}
                            >
                                🏠 Home
                            </button>
                            <button
                                onClick={() => {
                                    setBusinessType('center');
                                    setSelectedState('');
                                    setShowResults(false);
                                }}
                                className={`flex-1 py-2 text-xs font-bold rounded transition-all ${businessType === 'center' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-900 hover:bg-white/40'}`}
                            >
                                🏢 Center
                            </button>
                        </div>
                        <p className="pro-text-meta text-center">
                            {businessType === 'home' ? 'For new small daycares' : 'For commercial centers'}
                        </p>
                        <div className="mt-1 p-2 glass-panel rounded-md border-teal-100 bg-teal-50/20">
                            <p className="text-[11px] text-center text-teal-800 font-bold tracking-tight">
                                💰 Live Rate Estimates Based on Your State
                            </p>
                        </div>
                    </div>

                        {/* State */}
                        <div>
                            <Label>Your State</Label>
                            <Select value={selectedState} onValueChange={(val) => {
                                setSelectedState(val);
                                setInfants(0);
                                setToddlers(0);
                                setPreschool(0);
                            }}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(STATE_DATA).map(([code, info]) => (
                                        <SelectItem key={code} value={code}>{info.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Home-based license type */}
                            {businessType === 'home' && stateInfo && stateInfo.hasLargeLicense && (
                                <div className="mt-4 p-3 glass-panel rounded-lg">
                                    <Label className="mb-2 block text-blue-900">License Type</Label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLicenseType('small')}
                                            className={`flex-1 py-2 text-sm rounded-md transition-all ${licenseType === 'small' ? 'bg-blue-600 text-white shadow-lg' : 'glass-button text-blue-700'}`}
                                        >
                                            Small (Solo)
                                        </button>
                                        <button
                                            onClick={() => setLicenseType('large')}
                                            className={`flex-1 py-2 text-sm rounded-md transition-all ${licenseType === 'large' ? 'bg-blue-600 text-white shadow-lg' : 'glass-button text-blue-700'}`}
                                        >
                                            Large (Group)
                                        </button>
                                    </div>
                                    <p className="text-xs text-blue-600 mt-2">
                                        {licenseType === 'large'
                                            ? `Requires 2 providers. Capacity: ${stateInfo.largeCap} kids`
                                            : `1 provider. Capacity: ${stateInfo.smallCap} kids`}
                                    </p>
                                </div>
                            )}

                            {businessType === 'home' && stateInfo && !stateInfo.hasLargeLicense && (
                                <p className="text-xs text-teal-600 mt-2">
                                    Max Capacity: {stateInfo.smallCap} kids (1 provider)
                                </p>
                            )}
                        </div>

                        {/* HOME-BASED SLIDERS - Always visible so users see it's a calculator */}
                        {businessType === 'home' && (
                            <div className={!stateInfo ? 'opacity-60 pointer-events-none' : ''}>
                                {/* Total Capacity Slider */}
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Total Children</Label>
                                        <span className="font-semibold">{totalKids} / {maxTotalKids} kids</span>
                                    </div>
                                    <Slider
                                        value={[totalKids]}
                                        onValueChange={(val) => {
                                            const newTotal = val[0];
                                            // Maximize revenue: fill highest-paying age groups first
                                            // Infants pay most, then toddlers, then preschool
                                            const infantsFirst = Math.min(newTotal, maxInfantsLimit);
                                            const remaining = newTotal - infantsFirst;
                                            // Split remaining between toddlers and preschool (favor toddlers)
                                            const toddlersNext = Math.min(remaining, Math.ceil(remaining * 0.6));
                                            const preschoolLast = remaining - toddlersNext;
                                            setInfants(infantsFirst);
                                            setToddlers(toddlersNext);
                                            setPreschool(preschoolLast);
                                        }}
                                        min={0}
                                        max={maxTotalKids}
                                        step={1}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Drag to quickly set enrollment size</p>
                                </div>

                                <div className="p-3 glass-panel rounded-lg space-y-4">
                                    <Label className="block text-blue-900 font-medium">Age Group Mix</Label>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Infants (0-1)</span>
                                            <span className="font-semibold text-blue-700">{infants}</span>
                                        </div>
                                        <Slider
                                            value={[infants]}
                                            onValueChange={(val) => setInfants(val[0])}
                                            min={0}
                                            max={maxInfants}
                                            step={1}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Toddlers (1-3)</span>
                                            <span className="font-semibold text-blue-700">{toddlers}</span>
                                        </div>
                                        <Slider
                                            value={[toddlers]}
                                            onValueChange={(val) => setToddlers(val[0])}
                                            min={0}
                                            max={maxToddlers}
                                            step={1}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Preschool (3-5)</span>
                                            <span className="font-semibold text-blue-700">{preschool}</span>
                                        </div>
                                        <Slider
                                            value={[preschool]}
                                            onValueChange={(val) => setPreschool(val[0])}
                                            min={0}
                                            max={maxPreschool}
                                            step={1}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CENTER-BASED SLIDERS - Always visible so users see it's a calculator */}
                        {businessType === 'center' && (
                            <div className={!stateInfo ? 'opacity-60 pointer-events-none' : ''}>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Total Capacity</Label>
                                        <span className="font-semibold">{centerCapacity} kids</span>
                                    </div>
                                    <Slider
                                        value={[centerCapacity]}
                                        onValueChange={(val) => {
                                            const newCap = val[0];
                                            setCenterCapacity(newCap);
                                            // Maximize revenue: fill highest-paying age groups first
                                            // Infants pay most, then toddlers, then preschool, then school-age
                                            const maxCenterInfants = Math.min(30, newCap); // Cap infants at 30
                                            const infantsFirst = Math.min(maxCenterInfants, Math.floor(newCap * 0.2)); // 20% infants max
                                            const remaining1 = newCap - infantsFirst;
                                            const toddlersNext = Math.floor(remaining1 * 0.35); // 35% toddlers
                                            const remaining2 = remaining1 - toddlersNext;
                                            const preschoolNext = Math.floor(remaining2 * 0.65); // 65% of rest preschool
                                            const schoolAgeLast = remaining2 - preschoolNext;
                                            setCenterInfants(infantsFirst);
                                            setCenterToddlers(toddlersNext);
                                            setCenterPreschool(preschoolNext);
                                            setCenterSchoolAge(schoolAgeLast);
                                        }}
                                        min={20}
                                        max={stateInfo?.centerMaxCapacity || 100}
                                        step={5}
                                    />
                                    <p className="text-xs text-gray-500 mt-1">
                                        {stateInfo?.name || 'Select state'} max center capacity: {stateInfo?.centerMaxCapacity || 100} kids
                                    </p>
                                </div>

                                <div className="p-3 glass-panel rounded-lg space-y-4">
                                    <Label className="block text-purple-900 font-medium">Age Group Mix</Label>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Infants (0-1)</span>
                                            <span className="font-semibold text-purple-700">{centerInfants}</span>
                                        </div>
                                        <Slider
                                            value={[centerInfants]}
                                            onValueChange={(val) => setCenterInfants(val[0])}
                                            min={0}
                                            max={Math.min(30, centerCapacity)}
                                            step={1}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Toddlers (1-3)</span>
                                            <span className="font-semibold text-purple-700">{centerToddlers}</span>
                                        </div>
                                        <Slider
                                            value={[centerToddlers]}
                                            onValueChange={(val) => setCenterToddlers(val[0])}
                                            min={0}
                                            max={Math.min(50, centerCapacity)}
                                            step={1}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">Preschool (3-5)</span>
                                            <span className="font-semibold text-purple-700">{centerPreschool}</span>
                                        </div>
                                        <Slider
                                            value={[centerPreschool]}
                                            onValueChange={(val) => setCenterPreschool(val[0])}
                                            min={0}
                                            max={Math.min(60, centerCapacity)}
                                            step={1}
                                        />
                                    </div>

                                    <div>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-sm text-gray-600">School-Age (5+)</span>
                                            <span className="font-semibold text-purple-700">{centerSchoolAge}</span>
                                        </div>
                                        <Slider
                                            value={[centerSchoolAge]}
                                            onValueChange={(val) => setCenterSchoolAge(val[0])}
                                            min={0}
                                            max={Math.min(40, centerCapacity)}
                                            step={1}
                                        />
                                    </div>
                                </div>

                                <div className="text-center py-2 glass-panel rounded-lg">
                                    <span className="text-lg font-bold text-purple-700">{centerTotalKids}</span> total enrolled
                                </div>
                            </div>
                        )}

                    <button
                        onClick={() => setShowResults(true)}
                        disabled={!canCalculate}
                        className={`w-full py-3.5 px-6 text-sm font-bold rounded-xl transition-all min-h-[48px] ${
                            canCalculate 
                                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 hover:opacity-90' 
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        }`}
                    >
                        Calculate My Revenue →
                    </button>
                </div>
            </div>
        );
    }

    // VIEW 2: Results + CTAs
    if (businessType === 'home') {
        // HOME-BASED RESULTS
        return (
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4">
                    <div className="text-center">
                        <p className="pro-text-meta mb-1">{stateInfo?.name} • {totalKids} kids</p>
                        <div className="text-3xl font-bold text-teal-600 tracking-tighter">
                            ${(Math.max(minMonthlyIncome, maxMonthlyIncome) * 12).toLocaleString()}
                        </div>
                        <p className="pro-text-meta lowercase">potential revenue yearly</p>
                        <p className="text-xl font-bold text-teal-500 mt-1">
                            ${Math.min(minMonthlyIncome, maxMonthlyIncome).toLocaleString()} - ${Math.max(minMonthlyIncome, maxMonthlyIncome).toLocaleString()}/mo
                        </p>
                    </div>

                        <div className="glass-panel rounded-lg p-4 text-center">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                This range represents the difference between guaranteed minimum government subsidy rates and potential maximum private market rates. Both figures include your federal food program reimbursement.
                            </p>
                        </div>

                        <div className="space-y-3">
                            <Button className="w-full bg-teal-600 hover:bg-teal-700 text-lg py-6">
                                Get Setup Package - $500
                            </Button>
                            <Button variant="outline" className="w-full py-5">
                                90-Day Launch Sprint - $2,500
                            </Button>
                        </div>

                        <button
                            onClick={() => {
                                setShowResults(false);
                                setSelectedState('');
                                setLicenseType('small');
                                setInfants(0);
                                setToddlers(0);
                                setPreschool(0);
                            }}
                            className="w-full text-sm text-gray-500 py-2"
                        >
                            ← Start Over
                        </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                    Source: Federal Government HHS/OCC
                </p>
            </div>
        );
    }

    // CENTER-BASED RESULTS
    return (
            <div className="max-w-md mx-auto">
                <div className="pro-card glass-panel shadow-sm space-y-4">
                    <div className="text-center">
                        <p className="pro-text-meta mb-1">{stateInfo?.name} • {centerTotalKids} enrolled</p>
                        <div className="text-4xl font-bold text-teal-600 tracking-tighter">
                            ${centerAnnualGross.toLocaleString()}
                        </div>
                        <p className="pro-text-meta lowercase">potential revenue yearly</p>
                        <p className="text-xl font-bold text-teal-500 mt-1">
                            ${centerMonthlyGross.toLocaleString()}/mo
                        </p>
                    </div>

                    <div className="glass-panel rounded-lg p-4 space-y-3">
                        <h3 className="font-semibold text-purple-900 text-center">Revenue Breakdown</h3>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tuition Revenue</span>
                            <span className="font-medium">${Math.round(centerTuitionWeekly * 4.33).toLocaleString()}/mo</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Food Program (CACFP)</span>
                            <span className="font-medium">${Math.round(centerFoodWeekly * 4.33).toLocaleString()}/mo</span>
                        </div>
                        <div className="h-px bg-purple-200 my-2" />
                        <p className="text-xs text-gray-500 text-center">
                            Based on {stateInfo?.name} market rates at full enrollment
                        </p>
                    </div>

                    <div className="space-y-3">
                        <Button className="w-full bg-purple-600 hover:bg-purple-700 text-lg py-6">
                            Growth Consultation - $500
                        </Button>
                        <Button variant="outline" className="w-full py-5 border-purple-300 text-purple-700 hover:bg-purple-50">
                            Center Launch Package - $5,000
                        </Button>
                    </div>

                    <button
                        onClick={() => {
                            setShowResults(false);
                            setSelectedState('');
                            setCenterCapacity(40);
                            setCenterInfants(8);
                            setCenterToddlers(12);
                            setCenterPreschool(15);
                            setCenterSchoolAge(5);
                        }}
                        className="w-full text-sm text-gray-500 py-2"
                    >
                        ← Start Over
                    </button>
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                    Source: Federal Government HHS/OCC Market Rate Survey
                </p>
            </div>
        );
    }
