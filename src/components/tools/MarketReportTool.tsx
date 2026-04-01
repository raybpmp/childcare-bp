import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { ArrowPathIcon, MagnifyingGlassIcon, ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

interface CareTypeData {
  p22: string;
  p24: string;
  share: string;
}

interface CountyData {
  countyName: string;
  stateName: string;
  fipsCode: string;
  flfpr: string;
  fme2022: string;
  hispanic: string;
  mfi: string;
  oneraceA: string;
  oneraceB: string;
  oneraceW: string;
  prF: string;
  totalpop: string;
  
  infantCenter: CareTypeData;
  infantHome: CareTypeData;
  toddlerCenter: CareTypeData;
  toddlerHome: CareTypeData;
  preschoolCenter: CareTypeData;
  preschoolHome: CareTypeData;
  schoolageCenter: CareTypeData;
  schoolageHome: CareTypeData;
}

interface CountyListItem {
  state: string;
  county: string;
  fips: string;
}

const CARE_TYPES = [
  { id: 'infantCenter', label: 'Infant Center' },
  { id: 'infantHome', label: 'Infant Home' },
  { id: 'toddlerCenter', label: 'Toddler Center' },
  { id: 'toddlerHome', label: 'Toddler Home' },
  { id: 'preschoolCenter', label: 'Preschool Center' },
  { id: 'preschoolHome', label: 'Preschool Home' },
  { id: 'schoolageCenter', label: 'School-age Center' },
  { id: 'schoolageHome', label: 'School-age Home' },
];

export default function MarketReportTool() {
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [counties, setCounties] = useState<CountyListItem[]>([]);
  
  // Selection State
  const [selectedState, setSelectedState] = useState<string>('');
  const [selectedCounty, setSelectedCounty] = useState<string>('');
  const [reportData, setReportData] = useState<CountyData | null>(null);
  const [typeIndex, setTypeIndex] = useState([0]);

  // Search State
  const [stateSearch, setStateSearch] = useState('');
  const [countySearch, setCountySearch] = useState('');
  const [stateOpen, setStateOpen] = useState(false);
  const [countyOpen, setCountyOpen] = useState(false);

  useEffect(() => {
    async function fetchCounties() {
      try {
        const res = await fetch('/api/market-data');
        const data = await res.json();
        setCounties(data);
      } catch (err) {
        console.error("Failed to fetch counties:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCounties();
  }, []);

  const states = useMemo(() => {
    return Array.from(new Set(counties.map(c => c.state))).sort();
  }, [counties]);

  const filteredStates = useMemo(() => {
    return states.filter(s => s.toLowerCase().includes(stateSearch.toLowerCase()));
  }, [states, stateSearch]);

  const filteredCounties = useMemo(() => {
    if (!selectedState) return [];
    return counties
      .filter(c => c.state === selectedState && c.county.toLowerCase().includes(countySearch.toLowerCase()))
      .sort((a, b) => a.county.localeCompare(b.county));
  }, [counties, selectedState, countySearch]);

  const generateReport = async () => {
    if (!selectedState || !selectedCounty) return;
    setDataLoading(true);
    try {
      const res = await fetch(`/api/market-data?state=${encodeURIComponent(selectedState)}&county=${encodeURIComponent(selectedCounty)}`);
      const data = await res.json();
      setReportData(data);
      setShowResults(true);
    } catch (err) {
      console.error("Failed to fetch report:", err);
    } finally {
      setDataLoading(false);
    }
  };

  const reset = () => {
    setShowResults(false);
    setSelectedCounty('');
    setCountySearch('');
    setTypeIndex([0]);
  };

  const formatCurrency = (val: string) => {
    if (!val || val === "NaN") return "N/A";
    const num = parseFloat(val.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? val : new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(num);
  };

  const formatPercent = (val: string) => {
    if (!val) return "0";
    const num = parseFloat(val);
    return isNaN(num) ? "0" : num.toFixed(1);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 space-y-4">
        <ArrowPathIcon className="h-10 w-10 animate-spin text-teal-600" />
        <p className="text-teal-800 font-bold tracking-tight text-center uppercase">Building Market Intelligence...</p>
      </div>
    );
  }

  // VIEW 1: Input Form
  if (!showResults) {
    return (
      <div className="max-w-md mx-auto px-4">
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 tracking-tight">
          Market Intelligence Tool
        </h1>
        
        <Card className="glass-panel">
          <CardContent className="p-6 space-y-6">
            <div className="bg-teal-50 p-4 rounded-xl border border-teal-100 flex items-center gap-3">
              <div className="bg-white p-2 rounded-lg shadow-sm border border-teal-100 items-center justify-center flex text-xl">
                 📊
              </div>
              <p className="text-sm font-medium text-teal-900 leading-tight">
                 Access comprehensive <b>Latest Federal Data</b> price projections and demographics for any US county.
              </p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">State</Label>
                <Popover open={stateOpen} onOpenChange={setStateOpen}>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-between h-12 text-lg font-bold border-teal-100 bg-white/50 px-4">
                      {selectedState || "Select state..."}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-white shadow-2xl border-teal-100" align="start">
                     <div className="p-2 border-b">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search..." 
                            className="pl-9 h-9 border-none bg-gray-50/50 focus-visible:ring-0"
                            value={stateSearch}
                            onChange={(e) => setStateSearch(e.target.value)}
                          />
                        </div>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                        {filteredStates.map(s => (
                          <button
                            key={s}
                            onClick={() => { setSelectedState(s); setSelectedCounty(''); setStateOpen(false); setStateSearch(''); }}
                            className="w-full flex items-center justify-between px-3 py-3 text-left text-sm font-bold rounded-md hover:bg-teal-50"
                          >
                            {s} {selectedState === s && <CheckIcon className="h-4 w-4 text-teal-600" />}
                          </button>
                        ))}
                     </div>
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-bold text-gray-400 uppercase tracking-widest ml-1">County</Label>
                <Popover open={countyOpen} onOpenChange={setCountyOpen}>
                  <PopoverTrigger asChild disabled={!selectedState}>
                    <Button variant="outline" className="w-full justify-between h-12 text-lg font-bold border-teal-100 bg-white/50 px-4 disabled:opacity-50">
                      {selectedCounty || (selectedState ? "Select county..." : "Pick State First")}
                      <ChevronDownIcon className="h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-1 bg-white shadow-2xl border-teal-100" align="start">
                     <div className="p-2 border-b">
                        <div className="relative">
                          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                          <Input 
                            placeholder="Search..." 
                            className="pl-9 h-9 border-none bg-gray-50/50 focus-visible:ring-0"
                            value={countySearch}
                            onChange={(e) => setCountySearch(e.target.value)}
                          />
                        </div>
                     </div>
                     <div className="max-h-[300px] overflow-y-auto p-1 custom-scrollbar">
                        {filteredCounties.map(c => (
                          <button
                            key={c.fips}
                            onClick={() => { setSelectedCounty(c.county); setCountyOpen(false); setCountySearch(''); }}
                            className="w-full flex items-center justify-between px-3 py-3 text-left text-sm font-bold rounded-md hover:bg-teal-50"
                          >
                            {c.county} {selectedCounty === c.county && <CheckIcon className="h-4 w-4 text-teal-600" />}
                          </button>
                        ))}
                     </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <Button 
              onClick={generateReport}
              disabled={!selectedCounty || dataLoading}
              className="w-full h-14 bg-teal-600 hover:bg-teal-700 text-lg font-black uppercase shadow-xl shadow-teal-600/20"
            >
              {dataLoading ? "ASSEMBLING REPORT..." : "VIEW MARKET REPORT"}
            </Button>

            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest font-black pt-2 leading-relaxed">
              Based on U.S. Dept of Labor Women’s Bureau<br/>Latest Federal Report
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // VIEW 2: Results View
  const currentType = CARE_TYPES[typeIndex[0]];
  const currentPriceData = (reportData as any)[currentType.id] as CareTypeData;

  return (
    <div className="max-w-md mx-auto px-4 pb-20 space-y-8">
      <div className="text-center pt-2">
        <p className="text-sm font-bold text-gray-400 mb-1 uppercase tracking-widest">{reportData?.stateName}</p>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-none">{reportData?.countyName}</h2>
      </div>

      {/* PRICE DISCOVERY SLIDER (SOT Polish) */}
      <Card className="glass-panel border-teal-100/40 shadow-xl">
        <CardContent className="p-6 space-y-6">
          <div className="text-center space-y-1 mb-2">
             <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Selected Care Format</p>
             <h3 className="text-xl font-black text-teal-700 uppercase tracking-tight">{currentType.label}</h3>
          </div>
          
          <div className="px-2 pt-2 relative">
            <Slider 
              value={typeIndex} 
              onValueChange={setTypeIndex}
              min={0} 
              max={7} 
              step={1}
              className="py-4"
            />
          </div>
          
          <div className="flex justify-between items-center px-1 text-[9px] font-black text-gray-300 uppercase tracking-[0.2em]">
             <span className={typeIndex[0] < 2 ? "text-teal-500" : ""}>Infants</span>
             <span className={typeIndex[0] >= 2 && typeIndex[0] < 4 ? "text-teal-500" : ""}>Toddlers</span>
             <span className={typeIndex[0] >= 4 && typeIndex[0] < 6 ? "text-teal-500" : ""}>Preschool</span>
             <span className={typeIndex[0] >= 6 ? "text-teal-500" : ""}>Schoolage</span>
          </div>
        </CardContent>
      </Card>

      {/* SECTION 1: PRICE CONTEXT */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-teal-900/20 tracking-[0.3em] flex items-center ml-1">
          <div className="h-1 w-3 bg-teal-200 mr-2 rounded-full" />
          Price Context
        </h4>
        <Card className="glass-panel">
          <CardContent className="p-6 space-y-6">
             <div className="text-center py-2">
                <motion.div 
                  key={currentType.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-5xl font-black text-teal-600 tracking-tighter"
                >
                  {formatCurrency(currentPriceData.p24)}
                </motion.div>
                <p className="text-xs font-bold text-gray-500 mt-2 uppercase tracking-widest">Estimated Price (Latest Federal Data)</p>
             </div>

             <div className="grid grid-cols-2 gap-3">
                <div className="glass-panel-warm p-4 rounded-2xl text-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-tight">Median Yearly Price<br/>(Latest Report)</p>
                   <p className="text-xl font-bold text-gray-900 tracking-tight">{formatCurrency(currentPriceData.p22)}</p>
                </div>
                <div className="glass-panel-warm p-4 rounded-2xl text-center">
                   <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1 leading-tight">Family Income<br/>Share</p>
                   <p className="text-xl font-bold text-teal-600 tracking-tight">{currentPriceData.share}</p>
                </div>
             </div>

             <div className="space-y-2 pt-2">
                <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                   <span className="text-[9px]">Childcare price as share of median family income</span>
                   <span className="text-teal-600">{currentPriceData.share}</span>
                </div>
                <div className="h-2 w-full bg-teal-50 rounded-full overflow-hidden border border-teal-100/50">
                   <motion.div 
                     initial={{ width: 0 }}
                     animate={{ width: `${Math.min(parseFloat(currentPriceData.share) * 3, 100)}%` }} 
                     className="h-full bg-teal-500 rounded-full"
                   />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      {/* SECTION 2: ECONOMIC CHARACTERISTICS */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-teal-900/20 tracking-[0.3em] flex items-center ml-1">
          <div className="h-1 w-3 bg-teal-200 mr-2 rounded-full" />
          County Economic Characteristics
        </h4>
        <div className="grid grid-cols-2 gap-3">
           <MetricTile label="Women’s labor force participation rate" value={`${reportData?.flfpr}%`} />
           <MetricTile label="Percent of families in poverty" value={`${reportData?.prF}%`} />
           <MetricTile label="Women’s median earnings" value={formatCurrency(reportData?.fme2022 || "0")} />
           <MetricTile label="Median family income" value={formatCurrency(reportData?.mfi || "0")} />
        </div>
      </div>

      {/* SECTION 3: DEMOGRAPHIC CHARACTERISTICS */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-teal-900/20 tracking-[0.3em] flex items-center ml-1">
          <div className="h-1 w-3 bg-teal-200 mr-2 rounded-full" />
          County Demographic Characteristics
        </h4>
        <Card className="glass-panel">
          <CardContent className="p-6 space-y-6">
             <div className="flex justify-between items-center border-b border-teal-50 pb-4">
                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Total population</span>
                <span className="text-3xl font-black text-gray-900 tracking-tighter">{new Intl.NumberFormat('en-US').format(parseInt(reportData?.totalpop || "0"))}</span>
             </div>

             <div className="space-y-5 pt-1">
                <div className="h-2 w-full flex rounded-full overflow-hidden border border-teal-100/30 shadow-inner">
                   <div style={{ flex: parseFloat(reportData?.oneraceW || "0") }} className="bg-teal-600" />
                   <div style={{ flex: parseFloat(reportData?.oneraceB || "0") }} className="bg-teal-500" />
                   <div style={{ flex: parseFloat(reportData?.oneraceA || "0") }} className="bg-teal-400" />
                   <div style={{ flex: parseFloat(reportData?.hispanic || "0") }} className="bg-teal-300" />
                   <div className="bg-teal-100 flex-grow" />
                </div>

                <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                   <RaceItem color="bg-teal-600" label="Percent White" value={reportData?.oneraceW || "0"} />
                   <RaceItem color="bg-teal-500" label="Percent Black" value={reportData?.oneraceB || "0"} />
                   <RaceItem color="bg-teal-400" label="Percent Asian" value={reportData?.oneraceA || "0"} />
                   <RaceItem color="bg-teal-300" label="Percent Hispanic (of any race)" value={reportData?.hispanic || "0"} />
                </div>
             </div>
          </CardContent>
        </Card>
      </div>

      <div className="pt-10 flex flex-col items-center">
         <button onClick={reset} className="text-[10px] font-black text-teal-600 hover:text-teal-700 uppercase tracking-[0.3em] transition-colors py-4 px-8 bg-teal-50/50 rounded-full border border-teal-100">
            ← SWITCH COUNTY
         </button>
         <p className="text-[9px] font-black text-gray-300 uppercase tracking-[0.5em] mt-10">ANTIGRAVITY MARKET DATA</p>
      </div>
    </div>
  );
}

// Internal Pure Helpers
const MetricTile = ({ label, value }: { label: string, value: string }) => (
  <div className="glass-panel p-4 rounded-2xl flex flex-col justify-between h-full border-teal-100/20">
    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-tight mb-3 line-clamp-2">{label}</span>
    <span className="text-xl font-black text-gray-900 tracking-tight">{value}</span>
  </div>
);

const RaceItem = ({ color, label, value }: any) => (
  <div className="flex items-center gap-3">
    <div className={`h-2.5 w-2.5 rounded-full ${color} shrink-0 shadow-sm`} />
    <div className="flex flex-col">
       <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider leading-none mb-1">{label}</span>
       <span className="text-sm font-bold text-gray-800 tracking-tight">{parseFloat(value).toFixed(1)}%</span>
    </div>
  </div>
);
