import React, { useState, useEffect } from 'react';
import { Calculator, AlertTriangle, TrendingUp, DollarSign, Info, Home, Building2 } from 'lucide-react';

const StartupCalculator = () => {
  const [mode, setMode] = useState('home'); // 'home' or 'center'

  // State for user inputs
  const [capacity, setCapacity] = useState(mode === 'home' ? 6 : 40);
  const [tuition, setTuition] = useState(300); // Weekly per child
  const [sqFt, setSqFt] = useState(mode === 'home' ? 0 : 2500);

  // Costs State
  const [rent, setRent] = useState(mode === 'home' ? 0 : 4500);
  const [insurance, setInsurance] = useState(mode === 'home' ? 1200 : 8000);
  const [renovations, setRenovations] = useState(mode === 'home' ? 2000 : 75000);
  const [staffCount, setStaffCount] = useState(mode === 'home' ? 1 : 6);
  const [hourlyWage, setHourlyWage] = useState(18);

  // Inflation Impact Toggle
  const [applyInflation, setApplyInflation] = useState(true);

  // Constants
  const INFLATION_MULTIPLIER_CONSTRUCTION = 1.35; // 35% increase since 2022
  const INFLATION_MULTIPLIER_INSURANCE = 2.5; // 150% increase (Hard Market)

  // Handlers
  const handleModeChange = (newMode: 'home' | 'center') => {
    setMode(newMode);
    if (newMode === 'home') {
      setCapacity(6);
      setSqFt(0);
      setRent(0);
      setInsurance(1200);
      setRenovations(2000);
      setStaffCount(1);
    } else {
      setCapacity(40);
      setSqFt(2500);
      setRent(4500);
      setInsurance(8000);
      setRenovations(75000);
      setStaffCount(6);
    }
  };

  // Calculations
  const adjustedRenovations = applyInflation ? renovations * INFLATION_MULTIPLIER_CONSTRUCTION : renovations;
  const adjustedInsurance = applyInflation ? insurance * INFLATION_MULTIPLIER_INSURANCE : insurance;

  const monthlyRevenue = capacity * tuition * 4.33; // 4.33 weeks in a month
  const monthlyLabor = staffCount * hourlyWage * 40 * 4.33;
  const monthlyFixed = rent + (adjustedInsurance / 12) + 500; // 500 misc utilities
  const totalMonthlyExpenses = monthlyLabor + monthlyFixed;
  const netProfit = monthlyRevenue - totalMonthlyExpenses;

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 font-sans">
      <div className="bg-blue-900 p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <Calculator className="w-6 h-6" />
          <h2 className="text-xl font-bold">2026 Childcare Business Modeler</h2>
        </div>
        <p className="text-blue-200 text-sm">
          Estimate your startup costs and profitability in the post-inflation economy.
        </p>
      </div>

      <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column: Inputs */}
        <div className="space-y-6">

          {/* Mode Selector */}
          <div className="flex bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => handleModeChange('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'home' ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Home className="w-4 h-4" /> Home-Based
            </button>
            <button
              onClick={() => handleModeChange('center')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-sm font-medium transition-all ${mode === 'center' ? 'bg-white shadow text-blue-900' : 'text-gray-500 hover:text-gray-700'
                }`}
            >
              <Building2 className="w-4 h-4" /> Commercial Center
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Licensed Capacity (Children)</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full border-gray-300 rounded-md shadow-sm p-2 border focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Weekly Tuition (Avg per Child)</label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">$</span>
                <input
                  type="number"
                  value={tuition}
                  onChange={(e) => setTuition(Number(e.target.value))}
                  className="w-full border-gray-300 rounded-md shadow-sm p-2 pl-7 border focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-800 mb-3">Expense Assumptions</h3>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Staff Count</label>
                  <input
                    type="number"
                    value={staffCount}
                    onChange={(e) => setStaffCount(Number(e.target.value))}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Hourly Wage ($)</label>
                  <input
                    type="number"
                    value={hourlyWage}
                    onChange={(e) => setHourlyWage(Number(e.target.value))}
                    className="w-full border p-2 rounded text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Base Monthly Rent/Mortgage</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-400 text-xs">$</span>
                  <input
                    type="number"
                    value={rent}
                    onChange={(e) => setRent(Number(e.target.value))}
                    className="w-full border p-2 pl-6 rounded text-sm"
                  />
                </div>
              </div>
            </div>

            {/* The 2026 Reality Check Toggle */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  <span className="text-sm font-bold text-amber-900">Apply 2026 Market Conditions?</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyInflation}
                    onChange={() => setApplyInflation(!applyInflation)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-600"></div>
                </label>
              </div>
              <p className="text-xs text-amber-700 mt-2">
                Simulates the "Hard Market" insurance spike (+150%) and construction inflation (+35%) seen in 2024-2026.
              </p>
            </div>

          </div>
        </div>

        {/* Right Column: Results */}
        <div className="bg-slate-50 rounded-lg p-6 flex flex-col justify-between border border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Financial Projection
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-sm text-slate-600">Est. Monthly Revenue</span>
                <span className="font-semibold text-green-700 text-lg">
                  ${monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Monthly Labor</span>
                  <span className="text-slate-700 font-medium">${monthlyLabor.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Rent & Utilities</span>
                  <span className="text-slate-700 font-medium">${(rent + 500).toLocaleString()}</span>
                </div>
                <div className={`flex justify-between items-center text-sm ${applyInflation ? 'bg-amber-100 p-1 -mx-1 rounded' : ''}`}>
                  <span className="text-slate-500 flex items-center gap-1">
                    Insurance
                    {applyInflation && <Info className="w-3 h-3 text-amber-600" />}
                  </span>
                  <span className={`font-medium ${applyInflation ? 'text-amber-700' : 'text-slate-700'}`}>
                    ${(adjustedInsurance / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}/mo
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200 mt-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-slate-800">Est. Monthly Net Profit</span>
                  <span className={`text-xl font-bold ${netProfit > 0 ? 'text-blue-700' : 'text-red-600'}`}>
                    ${netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <h4 className="text-sm font-semibold text-slate-700 mb-3">Startup Capital Required</h4>
            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-full">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Estimated Initial Investment</p>
                  <p className="text-lg font-bold text-slate-900">
                    ${(adjustedRenovations + 5000 + (adjustedInsurance / 4)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
              {applyInflation && (
                <div className="text-xs text-red-500 mt-1">
                  *Includes +${(adjustedRenovations - renovations).toLocaleString()} inflation adjustment on build-out.
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default StartupCalculator;