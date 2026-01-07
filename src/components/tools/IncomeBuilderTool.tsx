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
}> = {
    AL: { name: 'Alabama', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 166, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28 },
    AK: { name: 'Alaska', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 250, marketWeeklyToddler: 225, marketWeeklyPreschool: 200, subsidyWeeklyInfant: 230, foodWeeklyPerChild: 32 },
    AZ: { name: 'Arizona', hasLargeLicense: true, smallCap: 4, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 190, foodWeeklyPerChild: 28 },
    AR: { name: 'Arkansas', hasLargeLicense: true, smallCap: 6, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 155, marketWeeklyToddler: 140, marketWeeklyPreschool: 125, subsidyWeeklyInfant: 140, foodWeeklyPerChild: 28 },
    CA: { name: 'California', hasLargeLicense: true, smallCap: 8, largeCap: 14, maxInfantsSmall: 4, maxInfantsLarge: 4, marketWeeklyInfant: 385, marketWeeklyToddler: 350, marketWeeklyPreschool: 310, subsidyWeeklyInfant: 345, foodWeeklyPerChild: 32 },
    CO: { name: 'Colorado', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 325, marketWeeklyToddler: 290, marketWeeklyPreschool: 255, subsidyWeeklyInfant: 295, foodWeeklyPerChild: 28 },
    CT: { name: 'Connecticut', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 340, marketWeeklyToddler: 305, marketWeeklyPreschool: 270, subsidyWeeklyInfant: 310, foodWeeklyPerChild: 28 },
    DE: { name: 'Delaware', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 240, marketWeeklyToddler: 215, marketWeeklyPreschool: 190, subsidyWeeklyInfant: 220, foodWeeklyPerChild: 28 },
    FL: { name: 'Florida', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 4, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 195, foodWeeklyPerChild: 28 },
    GA: { name: 'Georgia', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 200, marketWeeklyToddler: 180, marketWeeklyPreschool: 160, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28 },
    HI: { name: 'Hawaii', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 300, marketWeeklyToddler: 270, marketWeeklyPreschool: 240, subsidyWeeklyInfant: 275, foodWeeklyPerChild: 32 },
    ID: { name: 'Idaho', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 165, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28 },
    IL: { name: 'Illinois', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 290, marketWeeklyToddler: 260, marketWeeklyPreschool: 230, subsidyWeeklyInfant: 265, foodWeeklyPerChild: 28 },
    IN: { name: 'Indiana', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 195, foodWeeklyPerChild: 28 },
    IA: { name: 'Iowa', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28 },
    KS: { name: 'Kansas', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 200, marketWeeklyToddler: 180, marketWeeklyPreschool: 160, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28 },
    KY: { name: 'Kentucky', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28 },
    LA: { name: 'Louisiana', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 185, marketWeeklyToddler: 165, marketWeeklyPreschool: 145, subsidyWeeklyInfant: 170, foodWeeklyPerChild: 28 },
    ME: { name: 'Maine', hasLargeLicense: true, smallCap: 10, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 250, marketWeeklyToddler: 225, marketWeeklyPreschool: 200, subsidyWeeklyInfant: 225, foodWeeklyPerChild: 28 },
    MD: { name: 'Maryland', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28 },
    MA: { name: 'Massachusetts', hasLargeLicense: true, smallCap: 6, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 3, marketWeeklyInfant: 400, marketWeeklyToddler: 360, marketWeeklyPreschool: 320, subsidyWeeklyInfant: 365, foodWeeklyPerChild: 32 },
    MI: { name: 'Michigan', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 235, marketWeeklyToddler: 210, marketWeeklyPreschool: 185, subsidyWeeklyInfant: 215, foodWeeklyPerChild: 28 },
    MN: { name: 'Minnesota', hasLargeLicense: true, smallCap: 10, largeCap: 14, maxInfantsSmall: 3, maxInfantsLarge: 3, marketWeeklyInfant: 320, marketWeeklyToddler: 285, marketWeeklyPreschool: 250, subsidyWeeklyInfant: 290, foodWeeklyPerChild: 28 },
    MS: { name: 'Mississippi', hasLargeLicense: false, smallCap: 5, largeCap: 5, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 148, marketWeeklyToddler: 135, marketWeeklyPreschool: 120, subsidyWeeklyInfant: 135, foodWeeklyPerChild: 28 },
    MO: { name: 'Missouri', hasLargeLicense: true, smallCap: 10, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28 },
    MT: { name: 'Montana', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 190, marketWeeklyToddler: 170, marketWeeklyPreschool: 150, subsidyWeeklyInfant: 175, foodWeeklyPerChild: 28 },
    NE: { name: 'Nebraska', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 210, marketWeeklyToddler: 190, marketWeeklyPreschool: 170, subsidyWeeklyInfant: 190, foodWeeklyPerChild: 28 },
    NV: { name: 'Nevada', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 240, marketWeeklyToddler: 215, marketWeeklyPreschool: 190, subsidyWeeklyInfant: 220, foodWeeklyPerChild: 28 },
    NH: { name: 'New Hampshire', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28 },
    NJ: { name: 'New Jersey', hasLargeLicense: false, smallCap: 5, largeCap: 5, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 335, marketWeeklyToddler: 300, marketWeeklyPreschool: 265, subsidyWeeklyInfant: 310, foodWeeklyPerChild: 28 },
    NM: { name: 'New Mexico', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28 },
    NY: { name: 'New York', hasLargeLicense: true, smallCap: 8, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 365, marketWeeklyToddler: 325, marketWeeklyPreschool: 290, subsidyWeeklyInfant: 387, foodWeeklyPerChild: 32 },
    NC: { name: 'North Carolina', hasLargeLicense: true, smallCap: 8, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 220, marketWeeklyToddler: 200, marketWeeklyPreschool: 180, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28 },
    ND: { name: 'North Dakota', hasLargeLicense: true, smallCap: 7, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28 },
    OH: { name: 'Ohio', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 3, maxInfantsLarge: 3, marketWeeklyInfant: 220, marketWeeklyToddler: 200, marketWeeklyPreschool: 180, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28 },
    OK: { name: 'Oklahoma', hasLargeLicense: true, smallCap: 7, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 175, marketWeeklyToddler: 158, marketWeeklyPreschool: 140, subsidyWeeklyInfant: 160, foodWeeklyPerChild: 28 },
    OR: { name: 'Oregon', hasLargeLicense: true, smallCap: 10, largeCap: 16, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 290, marketWeeklyToddler: 260, marketWeeklyPreschool: 230, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28 },
    PA: { name: 'Pennsylvania', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 260, marketWeeklyToddler: 235, marketWeeklyPreschool: 210, subsidyWeeklyInfant: 240, foodWeeklyPerChild: 28 },
    RI: { name: 'Rhode Island', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 295, marketWeeklyToddler: 265, marketWeeklyPreschool: 235, subsidyWeeklyInfant: 270, foodWeeklyPerChild: 28 },
    SC: { name: 'South Carolina', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 180, marketWeeklyToddler: 162, marketWeeklyPreschool: 145, subsidyWeeklyInfant: 165, foodWeeklyPerChild: 28 },
    SD: { name: 'South Dakota', hasLargeLicense: true, smallCap: 12, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 166, marketWeeklyToddler: 150, marketWeeklyPreschool: 135, subsidyWeeklyInfant: 155, foodWeeklyPerChild: 28 },
    TN: { name: 'Tennessee', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28 },
    TX: { name: 'Texas', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 225, marketWeeklyToddler: 205, marketWeeklyPreschool: 185, subsidyWeeklyInfant: 210, foodWeeklyPerChild: 28 },
    UT: { name: 'Utah', hasLargeLicense: true, smallCap: 8, largeCap: 16, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 215, marketWeeklyToddler: 195, marketWeeklyPreschool: 175, subsidyWeeklyInfant: 200, foodWeeklyPerChild: 28 },
    VT: { name: 'Vermont', hasLargeLicense: true, smallCap: 10, largeCap: 10, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 310, marketWeeklyToddler: 280, marketWeeklyPreschool: 250, subsidyWeeklyInfant: 285, foodWeeklyPerChild: 28 },
    VA: { name: 'Virginia', hasLargeLicense: true, smallCap: 5, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 265, marketWeeklyToddler: 240, marketWeeklyPreschool: 215, subsidyWeeklyInfant: 245, foodWeeklyPerChild: 28 },
    WA: { name: 'Washington', hasLargeLicense: true, smallCap: 12, largeCap: 12, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 340, marketWeeklyToddler: 305, marketWeeklyPreschool: 270, subsidyWeeklyInfant: 315, foodWeeklyPerChild: 32 },
    WV: { name: 'West Virginia', hasLargeLicense: true, smallCap: 6, largeCap: 12, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 160, marketWeeklyToddler: 145, marketWeeklyPreschool: 130, subsidyWeeklyInfant: 150, foodWeeklyPerChild: 28 },
    WI: { name: 'Wisconsin', hasLargeLicense: true, smallCap: 8, largeCap: 8, maxInfantsSmall: 3, maxInfantsLarge: 4, marketWeeklyInfant: 255, marketWeeklyToddler: 230, marketWeeklyPreschool: 205, subsidyWeeklyInfant: 235, foodWeeklyPerChild: 28 },
    WY: { name: 'Wyoming', hasLargeLicense: true, smallCap: 10, largeCap: 15, maxInfantsSmall: 2, maxInfantsLarge: 4, marketWeeklyInfant: 195, marketWeeklyToddler: 175, marketWeeklyPreschool: 155, subsidyWeeklyInfant: 180, foodWeeklyPerChild: 28 },
    DC: { name: 'Washington D.C.', hasLargeLicense: false, smallCap: 6, largeCap: 6, maxInfantsSmall: 2, maxInfantsLarge: 2, marketWeeklyInfant: 504, marketWeeklyToddler: 450, marketWeeklyPreschool: 400, subsidyWeeklyInfant: 480, foodWeeklyPerChild: 35 },
};

export default function IncomeBuilderTool() {
    const [selectedState, setSelectedState] = useState('');
    const [licenseType, setLicenseType] = useState('small'); // 'small' | 'large'
    const [infants, setInfants] = useState(0);
    const [toddlers, setToddlers] = useState(0);
    const [preschool, setPreschool] = useState(0);
    const [showResults, setShowResults] = useState(false);

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

    const canCalculate = selectedState && totalKids > 0;

    // VIEW 1: Input form
    if (!showResults) {
        return (
            <div className="max-w-md mx-auto px-4">
                <Card>
                    <CardContent className="p-6 space-y-6">
                        <div>
                            <h1 className="text-xl font-bold">Home Daycare Income Builder</h1>
                            <p className="text-sm text-gray-500">For new home-based daycares</p>
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
                            {stateInfo && stateInfo.hasLargeLicense && (
                                <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                                    <Label className="mb-2 block text-blue-900">License Type</Label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setLicenseType('small')}
                                            className={`flex-1 py-2 text-sm rounded-md transition-colors ${licenseType === 'small' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
                                        >
                                            Small (Solo)
                                        </button>
                                        <button
                                            onClick={() => setLicenseType('large')}
                                            className={`flex-1 py-2 text-sm rounded-md transition-colors ${licenseType === 'large' ? 'bg-blue-600 text-white shadow-sm' : 'bg-white text-blue-700 hover:bg-blue-50'}`}
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

                            {stateInfo && !stateInfo.hasLargeLicense && (
                                <p className="text-xs text-teal-600 mt-2">
                                    Max Capacity: {stateInfo.smallCap} kids (1 provider)
                                </p>
                            )}
                        </div>

                        {/* Sliders - only show after state selected */}
                        {stateInfo && (
                            <>
                                <div>
                                    <div className="flex justify-between mb-2">
                                        <Label>Infants (0-1)</Label>
                                        <span className="font-semibold">{infants}</span>
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
                                    <div className="flex justify-between mb-2">
                                        <Label>Toddlers (1-3)</Label>
                                        <span className="font-semibold">{toddlers}</span>
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
                                    <div className="flex justify-between mb-2">
                                        <Label>Preschool (3-5)</Label>
                                        <span className="font-semibold">{preschool}</span>
                                    </div>
                                    <Slider
                                        value={[preschool]}
                                        onValueChange={(val) => setPreschool(val[0])}
                                        min={0}
                                        max={maxPreschool}
                                        step={1}
                                    />
                                </div>

                                <div className="text-center py-2 bg-gray-50 rounded">
                                    <span className="text-lg font-bold">{totalKids}</span> / {maxTotalKids} kids selected
                                </div>
                            </>
                        )}

                        <Button
                            onClick={() => setShowResults(true)}
                            disabled={!canCalculate}
                            className="w-full bg-teal-600 hover:bg-teal-700"
                        >
                            Calculate My Income
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // VIEW 2: Results + CTAs
    return (
        <div className="max-w-md mx-auto px-4">
            <Card>
                <CardContent className="p-6 space-y-6">
                    <div className="text-center">
                        <p className="text-sm text-gray-500 mb-1">{stateInfo?.name} • {totalKids} kids</p>
                        <div className="text-4xl font-bold text-teal-600">
                            ${Math.min(minMonthlyIncome, maxMonthlyIncome).toLocaleString()} - ${Math.max(minMonthlyIncome, maxMonthlyIncome).toLocaleString()}
                        </div>
                        <p className="text-gray-600">potential monthly income</p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 text-center">
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
                        onClick={() => setShowResults(false)}
                        className="w-full text-sm text-gray-500 py-2"
                    >
                        ← Change numbers
                    </button>
                </CardContent>
            </Card>

            <p className="text-xs text-gray-400 text-center mt-4">
                Source: Federal Government HHS/OCC
            </p>
        </div>
    );
}
