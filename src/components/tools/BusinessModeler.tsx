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
    <div className="max-w-md mx-auto">
      <div className="pro-card glass-panel shadow-sm space-y-4">
        {/* Header */}
        <div className="text-center space-y-1">
          <h2 className="pro-heading-dense flex items-center justify-center gap-2">
            <Calculator className="w-5 h-5 text-teal-600" />
            Business Modeler
          </h2>
          <p className="pro-text-meta">2026 Startup cost & profit estimates</p>
        </div>

        {/* Inputs */}
        <div className="space-y-4">
          <div className="flex bg-gray-100/50 p-1 rounded-md glass-panel">
            <button
              onClick={() => handleModeChange('home')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-bold transition-all ${mode === 'home' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Home className="w-3 h-3" /> Home
            </button>
            <button
              onClick={() => handleModeChange('center')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-sm text-xs font-bold transition-all ${mode === 'center' ? 'bg-teal-600 text-white shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
            >
              <Building2 className="w-3 h-3" /> Center
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="pro-text-meta mb-1 block">Capacity</label>
              <input
                type="number"
                value={capacity}
                onChange={(e) => setCapacity(Number(e.target.value))}
                className="w-full bg-white/50 border-gray-200 rounded p-2 text-sm focus:ring-teal-500 outline-none"
              />
            </div>
            <div>
              <label className="pro-text-meta mb-1 block">Weekly Rate</label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-sm">$</span>
                <input
                  type="number"
                  value={tuition}
                  onChange={(e) => setTuition(Number(e.target.value))}
                  className="w-full bg-white/50 border-gray-200 rounded p-2 pl-5 text-sm focus:ring-teal-500 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="pro-text-meta mb-1 block">Staff</label>
                <input
                  type="number"
                  value={staffCount}
                  onChange={(e) => setStaffCount(Number(e.target.value))}
                  className="w-full bg-white/50 border-gray-200 rounded p-2 text-sm"
                />
              </div>
              <div>
                <label className="pro-text-meta mb-1 block">Wage ($/hr)</label>
                <input
                  type="number"
                  value={hourlyWage}
                  onChange={(e) => setHourlyWage(Number(e.target.value))}
                  className="w-full bg-white/50 border-gray-200 rounded p-2 text-sm"
                />
              </div>
            </div>
            <div>
              <label className="pro-text-meta mb-1 block">Monthly Rent / Mortgage</label>
              <div className="relative">
                <span className="absolute left-2 top-2 text-gray-400 text-xs">$</span>
                <input
                  type="number"
                  value={rent}
                  onChange={(e) => setRent(Number(e.target.value))}
                  className="w-full bg-white/50 border-gray-200 rounded p-2 pl-5 text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="pt-4 border-t border-gray-100 space-y-3">
          <div className="bg-teal-50/30 rounded-lg p-3 border border-teal-100/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="pro-text-meta">Monthly Revenue</span>
              <span className="text-lg font-bold text-teal-600">
                ${monthlyRevenue.toLocaleString('en-US', { maximumFractionDigits: 0 })}
              </span>
            </div>

            <div className="space-y-1.5 pt-2 border-t border-teal-100/20">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Labor Cost</span>
                <span className="text-gray-800 font-bold">${monthlyLabor.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Rent & Fixed</span>
                <span className="text-gray-800 font-bold">${(rent + 500).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500">Insurance</span>
                <span className="text-gray-800 font-bold">${(adjustedInsurance / 12).toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="pt-2 border-t border-teal-200 mt-1">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-teal-900">Est. Net Profit</span>
                <span className={`text-xl font-bold tracking-tighter ${netProfit > 0 ? 'text-teal-600' : 'text-red-600'}`}>
                  ${netProfit.toLocaleString('en-US', { maximumFractionDigits: 0 })}/mo
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-white/60 rounded border border-teal-100 flex items-center justify-between">
            <div>
              <p className="pro-text-meta">Startup Capital</p>
              <p className="text-lg font-bold text-teal-900 leading-none">
                ${(adjustedRenovations + 5000 + (adjustedInsurance / 4)).toLocaleString(undefined, { maximumFractionDigits: 0 })}
              </p>
            </div>
            <div className="bg-teal-600 p-1.5 rounded-full shadow-sm shadow-teal-600/20">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StartupCalculator;