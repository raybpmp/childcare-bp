import fs from 'fs';
import path from 'path';

export const prerender = false;

export interface CountyData {
  fipsCode: string;
  stateName: string;
  countyName: string;
  flfpr: string; // Women’s labor force participation rate
  fme2022: string; // Women’s median earnings
  hispanic: string; // Percent Hispanic
  mfi: string; // Median family income
  oneraceA: string; // Percent Asian
  oneraceB: string; // Percent Black
  oneraceW: string; // Percent White
  prF: string; // Percent of families in poverty
  totalpop: string;
  
  // Care Types (2022, 2024, Faminc)
  infantCenter: { p22: string; p24: string; share: string };
  infantHome: { p22: string; p24: string; share: string };
  toddlerCenter: { p22: string; p24: string; share: string };
  toddlerHome: { p22: string; p24: string; share: string };
  preschoolCenter: { p22: string; p24: string; share: string };
  preschoolHome: { p22: string; p24: string; share: string };
  schoolageCenter: { p22: string; p24: string; share: string };
  schoolageHome: { p22: string; p24: string; share: string };
}

let cachedData: CountyData[] | null = null;

function parseCSV(filePath: string): CountyData[] {
  // Read file as UTF-8 (comprehensive.csv is UTF-8 with BOM)
  const content = fs.readFileSync(filePath, 'utf8').replace(/^\uFEFF/, '');
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  
  return lines.slice(1).map(line => {
    // Basic CSV split (handles simple comma separation for this specific file)
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

    // Map Care Types
    row.infantCenter = { p22: values[headers.indexOf("Infant Center 2022")], p24: values[headers.indexOf("Infant Center 2024")], share: values[headers.indexOf("Infant Center Faminc")] };
    row.infantHome = { p22: values[headers.indexOf("Infant Home 2022")], p24: values[headers.indexOf("Infant Home 2024")], share: values[headers.indexOf("Infant Home Faminc")] };
    row.toddlerCenter = { p22: values[headers.indexOf("Toddler Center 2022")], p24: values[headers.indexOf("Toddler Center 2024")], share: values[headers.indexOf("Toddler Center Faminc")] };
    row.toddlerHome = { p22: values[headers.indexOf("Toddler Home 2022")], p24: values[headers.indexOf("Toddler Home 2024")], share: values[headers.indexOf("Toddler Home Faminc")] };
    row.preschoolCenter = { p22: values[headers.indexOf("Preschool Center 2022")], p24: values[headers.indexOf("Preschool Center 2024")], share: values[headers.indexOf("Preschool Center Faminc")] };
    row.preschoolHome = { p22: values[headers.indexOf("Preschool Home 2022")], p24: values[headers.indexOf("Preschool Home 2024")], share: values[headers.indexOf("Preschool Home Faminc")] };
    row.schoolageCenter = { p22: values[headers.indexOf("Schoolage Center 2022")], p24: values[headers.indexOf("Schoolage Center 2024")], share: values[headers.indexOf("Schoolage Center Faminc")] };
    row.schoolageHome = { p22: values[headers.indexOf("Schoolage Home 2022")], p24: values[headers.indexOf("Schoolage Home 2024")], share: values[headers.indexOf("Schoolage Home Faminc")] };

    return row as CountyData;
  });
}

function getData() {
  if (cachedData) return cachedData;
  const filePath = path.join(process.cwd(), 'src/data/csv/county data/comprehensive.csv');
  if (fs.existsSync(filePath)) {
    cachedData = parseCSV(filePath);
  } else {
    cachedData = [];
  }
  return cachedData;
}

export async function GET({ request }: { request: Request }) {
  try {
    const url = new URL(request.url);
    const state = url.searchParams.get('state');
    const county = url.searchParams.get('county');
    const fips = url.searchParams.get('fips');

    const allData = getData();

    if (fips) {
      const result = allData.find(d => d.fipsCode === fips);
      return new Response(JSON.stringify(result || null), { status: 200 });
    }

    if (state && county) {
      const result = allData.find(d => 
        d.stateName.toLowerCase() === state.toLowerCase() && 
        d.countyName.toLowerCase() === county.toLowerCase()
      );
      return new Response(JSON.stringify(result || null), { status: 200 });
    }

    // List view for selection
    const list = allData.map(d => ({
      state: d.stateName,
      county: d.countyName,
      fips: d.fipsCode
    })).sort((a, b) => a.state.localeCompare(b.state) || a.county.localeCompare(b.county));

    return new Response(JSON.stringify(list), { 
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 500 });
  }
}
