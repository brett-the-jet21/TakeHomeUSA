// ─── 2026 Federal Tax Constants ───────────────────────────────────────────────
// Source: IRS Revenue Procedure 2025-32 · SSA COLA 2026 announcement
export const TAX_YEAR = 2026;

const STANDARD_DEDUCTION_SINGLE  = 16_100;
const STANDARD_DEDUCTION_MARRIED = 32_200;
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
export interface CalcOptions {
  filingStatus?: "single" | "married";
  contribution401k?: number;
  /** Annual Section 125 health insurance premium — reduces federal, FICA, and state taxable income */
  healthInsurance?: number;
  /** Annual HSA payroll contribution — reduces federal, FICA, and state taxable income */
  hsa?: number;
  cityConfig?: CityTaxConfig;
}

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
  contribution401k: number;
  healthInsurancePremium: number;
  hsaContribution: number;
  cityTax: number;
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

// ─── Generic Multi-State Tax Calculator ──────────────────────────────────────
import type { StateTaxConfig } from "./states";
import { calcStateOnly } from "./states";
import type { CityTaxConfig } from "./cities";
import { calcCityTax } from "./cities";

export function calculateTax(stateConfig: StateTaxConfig, gross: number, options: CalcOptions = {}): TaxResult {
  const { filingStatus = "single", contribution401k = 0, healthInsurance = 0, hsa = 0, cityConfig } = options;
  const stdDeduction = filingStatus === "married" ? STANDARD_DEDUCTION_MARRIED : STANDARD_DEDUCTION_SINGLE;

  // 401k reduces federal + state taxable income but NOT FICA wages
  const preTax401k = Math.max(0, Math.min(contribution401k, gross));
  // Section 125 health + HSA reduce FICA wages AND federal + state taxable income
  const healthInsPreTax = Math.max(0, Math.min(healthInsurance, gross));
  const hsaPreTax = Math.max(0, Math.min(hsa, gross));

  // FICA is computed on wages minus Section 125 deductions (health, HSA), but NOT 401k
  const ficaWages = Math.max(0, gross - healthInsPreTax - hsaPreTax);
  const socialSecurity = Math.min(ficaWages, SS_WAGE_BASE) * 0.062;
  const medicare = ficaWages * 0.0145;
  const additionalMedicare = Math.max(0, ficaWages - ADDL_MEDICARE_THRESHOLD) * 0.009;
  const ficaTotal = socialSecurity + medicare + additionalMedicare;

  // Federal + state taxable income is reduced by all pre-tax deductions
  const allPreTax = preTax401k + healthInsPreTax + hsaPreTax;
  const federalTaxable = Math.max(0, gross - stdDeduction - allPreTax);
  const { tax: federalTax, marginalRate } = calcFederal(federalTaxable);

  const adjustedGross = Math.max(0, gross - allPreTax);

  // MD county (and similar): when cityConfig overrides the state's additionalRate,
  // strip the state average so only the selected county rate is applied
  const stateConfigForCalc = cityConfig?.overridesAdditionalRate
    ? { ...stateConfig, additionalRate: undefined }
    : stateConfig;
  const stateTax = calcStateOnly(stateConfigForCalc, adjustedGross);
  const cityTax = cityConfig ? calcCityTax(cityConfig, adjustedGross) : 0;
  const totalTax = federalTax + ficaTotal + stateTax + cityTax;
  const takeHome = gross - totalTax - allPreTax;

  return {
    gross,
    standardDeduction: stdDeduction,
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
    contribution401k: preTax401k,
    healthInsurancePremium: healthInsPreTax,
    hsaContribution: hsaPreTax,
    cityTax,
  };
}

// ─── Texas Tax Calculator (No State Income Tax) ───────────────────────────────
export function calculateTexasTax(gross: number): TaxResult {
  const federalTaxable = Math.max(0, gross - STANDARD_DEDUCTION_SINGLE);
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
    standardDeduction: STANDARD_DEDUCTION_SINGLE,
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
    contribution401k: 0,
    healthInsurancePremium: 0,
    hsaContribution: 0,
    cityTax: 0,
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
