// ─── 2026 Federal Tax Constants (Single Filer) ───────────────────────────────
// Source: IRS Revenue Procedure 2025-32 · SSA COLA 2026 announcement
export const TAX_YEAR = 2026;

const STANDARD_DEDUCTION = 16_100;
const SS_WAGE_BASE = 184_500; // Social Security taxable wage base
const ADDL_MEDICARE_THRESHOLD = 200_000; // Additional 0.9% Medicare kicks in here

// 2026 brackets per IRS Rev. Proc. 2025-32
// OBBBA provided ~4% adjustment for 10%/12% brackets, ~2.3% for higher brackets
const FEDERAL_BRACKETS: { min: number; max: number; rate: number }[] = [
  { min: 0,       max: 12_400,   rate: 0.10 },
  { min: 12_400,  max: 50_400,   rate: 0.12 },
  { min: 50_400,  max: 105_700,  rate: 0.22 },
  { min: 105_700, max: 201_775,  rate: 0.24 },
  { min: 201_775, max: 256_225,  rate: 0.32 },
  { min: 256_225, max: 640_600,  rate: 0.35 },
  { min: 640_600, max: Infinity, rate: 0.37 },
];

// Exported for use in display tables
export const FEDERAL_BRACKETS_2026 = FEDERAL_BRACKETS;

// ─── Types ────────────────────────────────────────────────────────────────────
export interface TaxResult {
  gross: number;
  standardDeduction: number;
  federalTaxable: number;
  federalTax: number;
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  ficaTotal: number;
  stateTax: number;
  totalTax: number;
  takeHome: number;
  effectiveFederalRate: number;
  effectiveTotalRate: number;
  marginalRate: number;
}

// ─── Federal Tax Calculator ───────────────────────────────────────────────────
function calcFederal(taxable: number): { tax: number; marginalRate: number } {
  if (taxable <= 0) return { tax: 0, marginalRate: 0.10 };
  let tax = 0;
  let marginalRate = 0.10;
  for (const b of FEDERAL_BRACKETS) {
    if (taxable <= b.min) break;
    tax += (Math.min(taxable, b.max) - b.min) * b.rate;
    marginalRate = b.rate;
  }
  return { tax, marginalRate };
}

// ─── Texas Tax Calculator (No State Income Tax) ───────────────────────────────
export function calculateTexasTax(gross: number): TaxResult {
  const federalTaxable = Math.max(0, gross - STANDARD_DEDUCTION);
  const { tax: federalTax, marginalRate } = calcFederal(federalTaxable);

  const socialSecurity = Math.min(gross, SS_WAGE_BASE) * 0.062;
  const medicare = gross * 0.0145;
  const additionalMedicare =
    Math.max(0, gross - ADDL_MEDICARE_THRESHOLD) * 0.009;
  const ficaTotal = socialSecurity + medicare + additionalMedicare;

  const stateTax = 0; // Texas has no state income tax
  const totalTax = federalTax + ficaTotal + stateTax;
  const takeHome = gross - totalTax;

  return {
    gross,
    standardDeduction: STANDARD_DEDUCTION,
    federalTaxable,
    federalTax,
    socialSecurity,
    medicare,
    additionalMedicare,
    ficaTotal,
    stateTax,
    totalTax,
    takeHome,
    effectiveFederalRate: gross > 0 ? federalTax / gross : 0,
    effectiveTotalRate: gross > 0 ? totalTax / gross : 0,
    marginalRate,
  };
}

// ─── Formatting Helpers ───────────────────────────────────────────────────────
export function fmt(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function pct(n: number, decimals = 1): string {
  return (n * 100).toFixed(decimals) + "%";
}

// ─── Static Generation Helpers ────────────────────────────────────────────────
/** All Texas salary amounts for static page generation: $20K–$500K in $1K steps */
export function getTexasSalaryAmounts(): number[] {
  const amounts: number[] = [];
  for (let a = 20_000; a <= 500_000; a += 1_000) {
    amounts.push(a);
  }
  return amounts;
}

/** Popular salary amounts shown as quick links on the homepage */
export const POPULAR_SALARIES = [
  30_000, 40_000, 45_000, 50_000, 55_000, 60_000, 65_000, 70_000,
  75_000, 80_000, 85_000, 90_000, 95_000, 100_000, 110_000, 120_000,
  125_000, 130_000, 140_000, 150_000, 175_000, 200_000, 250_000, 300_000,
];
