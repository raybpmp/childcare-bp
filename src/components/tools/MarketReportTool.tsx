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
  const [allData, setAllData] = useState<CountyData[]>([]);

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

  const parseCSV = (content: string): CountyData[] => {
    const cleanContent = content.replace(/^\uFEFF/, '');
    const lines = cleanContent.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim());
    
    return lines.slice(1).map(line => {
      const values = line.split(',').map(v => v.trim());
      const row: any = {};
      
      headers.forEach((header, index) => {
        const val = values[index] || "";
        switch (header) {
          case "County Fips Code": row.fipsCode = val; break;
          case "State Name": row.stateName = val; break;
          case "County Name": row.countyName = val; break;
          case "Flfpr 20To64": row.flfpr = val; break;
          case "Fme 2022": row.fme2022 = val; break;
          case "Hispanic": row.hispanic = val; break;
          case "Mfi": row.mfi = val; break;
          case "Onerace A": row.oneraceA = val; break;
          case "Onerace B": row.oneraceB = val; break;
          case "Onerace W": row.oneraceW = val; break;
          case "Pr F": row.prF = val; break;
          case "Totalpop": row.totalpop = val; break;
        }
      });

      const getVal = (h: string) => values[headers.indexOf(h)] || "0";

      row.infantCenter = { p22: getVal("Infant Center 2022"), p24: getVal("Infant Center 2024"), share: getVal("Infant Center Faminc") };
      row.infantHome = { p22: getVal("Infant Home 2022"), p24: getVal("Infant Home 2024"), share: getVal("Infant Home Faminc") };
      row.toddlerCenter = { p22: getVal("Toddler Center 2022"), p24: getVal("Toddler Center 2024"), share: getVal("Toddler Center Faminc") };
      row.toddlerHome = { p22: getVal("Toddler Home 2022"), p24: getVal("Toddler Home 2024"), share: getVal("Toddler Home Faminc") };
      row.preschoolCenter = { p22: getVal("Preschool Center 2022"), p24: getVal("Preschool Center 2024"), share: getVal("Preschool Center Faminc") };
      row.preschoolHome = { p22: getVal("Preschool Home 2022"), p24: getVal("Preschool Home 2024"), share: getVal("Preschool Home Faminc") };
      row.schoolageCenter = { p22: getVal("Schoolage Center 2022"), p24: getVal("Schoolage Center 2024"), share: getVal("Schoolage Center Faminc") };
      row.schoolageHome = { p22: getVal("Schoolage Home 2022"), p24: getVal("Schoolage Home 2024"), share: getVal("Schoolage Home Faminc") };

      return row as CountyData;
    });
  };

  useEffect(() => {
    async function initData() {
      try {
        const res = await fetch('/data/comprehensive.csv');
        const text = await res.text();
        const parsed = parseCSV(text);
        setAllData(parsed);
        
        const list = parsed.map(d => ({
          state: d.stateName,
          county: d.countyName,
          fips: d.fipsCode
        })).sort((a, b) => a.state.localeCompare(b.state) || a.county.localeCompare(b.county));
        
        setCounties(list);
      } catch (err) {
        console.error("Failed to load market data:", err);
      } finally {
        setLoading(false);
      }
    }
    initData();
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
    
    // Artificial delay for UX feel, but logic is local
    await new Promise(resolve => setTimeout(resolve, 600));
    
    const result = allData.find(d => 
      d.stateName === selectedState && d.countyName === selectedCounty
    );
    
    if (result) {
      setReportData(result);
      setShowResults(true);
    }
    
    setDataLoading(false);
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
      <div className="max-w-md mx-auto">
        <h1 className="pro-heading-dense text-center mb-3">
          Market Intelligence
        </h1>

        <div className="pro-card glass-panel shadow-sm space-y-4">
          <div className="bg-teal-50/50 p-3 rounded-lg border border-teal-100/50 flex items-center gap-3">
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

            <button
              onClick={generateReport}
              disabled={!selectedCounty || dataLoading}
              className={`w-full py-3.5 px-6 text-sm font-bold rounded-xl transition-all min-h-[48px] ${
                !selectedCounty || dataLoading
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-lg shadow-teal-600/20 hover:opacity-90'
              }`}
            >
              {dataLoading ? "ASSEMBLING REPORT..." : "VIEW MARKET REPORT →"}
            </button>

            <p className="pro-text-meta text-center leading-relaxed">
              Based on U.S. Dept of Labor Women’s Bureau<br />Latest Federal Report
            </p>
          </div>
        </div>
    );
  }

  // VIEW 2: Results View
  const currentType = CARE_TYPES[typeIndex[0]];
  const currentPriceData = (reportData as any)[currentType.id] as CareTypeData;

  return (
    <div className="max-w-md mx-auto pb-10 space-y-3">
      <div className="text-center bg-teal-600 rounded-xl py-2 px-4 shadow-sm border border-teal-500">
        <p className="text-[10px] font-black text-teal-100 uppercase tracking-widest">{reportData?.stateName}</p>
        <h2 className="text-lg font-black text-white uppercase tracking-tight leading-none">{reportData?.countyName}</h2>
      </div>

      {/* PRICE DISCOVERY SLIDER (SOT Polish) */}
      <div className="pro-card glass-panel shadow-sm space-y-3">
        <div className="text-center space-y-1">
          <p className="pro-text-meta">Care Format Selection</p>
          <h3 className="pro-heading-dense text-teal-700 uppercase tracking-tight">{currentType.label}</h3>
        </div>

        <div className="px-2 relative">
          <Slider
            value={typeIndex}
            onValueChange={setTypeIndex}
            min={0}
            max={7}
            step={1}
            className="py-2"
          />
        </div>

        <div className="flex justify-between items-center px-1 pro-text-meta text-gray-300">
          <span className={typeIndex[0] < 2 ? "text-teal-500 font-bold" : ""}>Infant</span>
          <span className={typeIndex[0] >= 2 && typeIndex[0] < 4 ? "text-teal-500 font-bold" : ""}>Toddler</span>
          <span className={typeIndex[0] >= 4 && typeIndex[0] < 6 ? "text-teal-500 font-bold" : ""}>Pre-K</span>
          <span className={typeIndex[0] >= 6 ? "text-teal-500 font-bold" : ""}>School</span>
        </div>
      </div>

      {/* SECTION 1: PRICE CONTEXT */}
      <div className="space-y-4">
        <h4 className="text-[10px] font-black uppercase text-teal-900/20 tracking-[0.3em] flex items-center ml-1">
          <div className="h-1 w-3 bg-teal-200 mr-2 rounded-full" />
          Price Context
        </h4>
        <div className="pro-card glass-panel shadow-sm space-y-3">
          <div className="text-center">
            <motion.div
              key={currentType.id}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-teal-600 tracking-tighter"
            >
              {formatCurrency(currentPriceData.p24)}
            </motion.div>
            <p className="pro-text-meta lowercase">Estimated Price (Latest Federal Data)</p>
          </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="p-2 glass-panel-warm rounded-lg text-center">
                <p className="pro-text-meta lowercase leading-tight mb-1">Median Price<br />(Latest Report)</p>
                <p className="text-lg font-bold text-gray-900 tracking-tight">{formatCurrency(currentPriceData.p22)}</p>
              </div>
              <div className="p-2 glass-panel-warm rounded-lg text-center">
                <p className="pro-text-meta lowercase leading-tight mb-1">Income<br />Share</p>
                <p className="text-lg font-bold text-teal-600 tracking-tight">{currentPriceData.share}</p>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center pro-text-meta">
                <span>Income share</span>
                <span className="text-teal-600 font-bold">{currentPriceData.share}</span>
              </div>
              <div className="h-1.5 w-full bg-teal-50 rounded-full overflow-hidden border border-teal-100/50">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(parseFloat(currentPriceData.share) * 3, 100)}%` }}
                  className="h-full bg-teal-500"
                />
              </div>
            </div>
          </div>
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
          Demographics
        </h4>
        <div className="pro-card glass-panel shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-teal-50 pb-2">
            <span className="pro-text-meta">Total population</span>
            <span className="text-2xl font-bold text-gray-900 tracking-tighter">{new Intl.NumberFormat('en-US').format(parseInt(reportData?.totalpop || "0"))}</span>
          </div>

          <div className="space-y-4">
            <div className="h-1.5 w-full flex rounded-full overflow-hidden border border-teal-100/30">
              <div style={{ flex: parseFloat(reportData?.oneraceW || "0") }} className="bg-teal-600" />
              <div style={{ flex: parseFloat(reportData?.oneraceB || "0") }} className="bg-teal-500" />
              <div style={{ flex: parseFloat(reportData?.oneraceA || "0") }} className="bg-teal-400" />
              <div style={{ flex: parseFloat(reportData?.hispanic || "0") }} className="bg-teal-300" />
              <div className="bg-teal-100 flex-grow" />
            </div>

            <div className="grid grid-cols-2 gap-y-3 gap-x-4">
              <RaceItem color="bg-teal-600" label="White" value={reportData?.oneraceW || "0"} />
              <RaceItem color="bg-teal-500" label="Black" value={reportData?.oneraceB || "0"} />
              <RaceItem color="bg-teal-400" label="Asian" value={reportData?.oneraceA || "0"} />
              <RaceItem color="bg-teal-300" label="Hispanic" value={reportData?.hispanic || "0"} />
            </div>
          </div>
        </div>
      </div>


      <div className="pt-6 flex flex-col items-center">
        <button onClick={reset} className="pro-text-meta transition-colors py-3 px-6 bg-teal-50/50 rounded-full border border-teal-100">
          ← SWITCH COUNTY
        </button>
      </div>
    </div>
  );
}

// Internal Pure Helpers
const MetricTile = ({ label, value }: { label: string, value: string }) => (
  <div className="pro-card glass-panel flex flex-col justify-between h-full">
    <span className="pro-text-meta leading-tight mb-2 line-clamp-2">{label}</span>
    <span className="text-lg font-bold text-gray-900 tracking-tight">{value}</span>
  </div>
);

const RaceItem = ({ color, label, value }: any) => (
  <div className="flex items-center gap-2">
    <div className={`h-2 w-2 rounded-full ${color} shrink-0`} />
    <div className="flex flex-col">
      <span className="pro-text-meta lowercase leading-none mb-0.5">{label}</span>
      <span className="text-xs font-bold text-gray-800 tracking-tight">{parseFloat(value).toFixed(1)}%</span>
    </div>
  </div>
);
