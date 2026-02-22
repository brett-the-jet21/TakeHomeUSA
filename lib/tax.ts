/**
 * 2026 U.S. federal income tax calculation utilities.
 * Assumes single filer with standard deduction.
 * Tax Year: 2026
 */

// 2026 standard deduction for single filers
export const STANDARD_DEDUCTION_2026 = 16_100;

// 2026 federal income tax brackets (single filer)
const FEDERAL_BRACKETS_2026 = [
  { rate: 0.10, min: 0, max: 11_925 },
  { rate: 0.12, min: 11_925, max: 48_475 },
  { rate: 0.22, min: 48_475, max: 103_350 },
  { rate: 0.24, min: 103_350, max: 197_300 },
  { rate: 0.32, min: 197_300, max: 250_525 },
  { rate: 0.35, min: 250_525, max: 626_350 },
  { rate: 0.37, min: 626_350, max: Infinity },
] as const;

// 2026 Social Security wage base
const SS_WAGE_BASE_2026 = 176_100;

export interface TaxBreakdown {
  grossSalary: number;
  standardDeduction: number;
  federalTaxableIncome: number;
  federalTax: number;
  socialSecurityTax: number;
  medicareTax: number;
  additionalMedicareTax: number;
  ficaTax: number;
  stateTax: number;
  totalTax: number;
  takeHomePay: number;
  effectiveFederalRate: number;
  effectiveTotalRate: number;
}

export function calcFederalTax(taxableIncome: number): number {
  let tax = 0;
  for (const bracket of FEDERAL_BRACKETS_2026) {
    if (taxableIncome <= bracket.min) break;
    const taxable = Math.min(taxableIncome, bracket.max) - bracket.min;
    tax += taxable * bracket.rate;
  }
  return tax;
}

export function calcFicaTax(grossSalary: number): {
  socialSecurity: number;
  medicare: number;
  additionalMedicare: number;
  total: number;
} {
  const socialSecurity = Math.min(grossSalary, SS_WAGE_BASE_2026) * 0.062;
  const medicare = grossSalary * 0.0145;
  const additionalMedicare = grossSalary > 200_000 ? (grossSalary - 200_000) * 0.009 : 0;
  return {
    socialSecurity,
    medicare,
    additionalMedicare,
    total: socialSecurity + medicare + additionalMedicare,
  };
}

/**
 * Calculate full tax breakdown for a given gross salary and state tax rate.
 * @param grossSalary  Annual gross salary in USD
 * @param stateTaxRate Effective state income tax rate as a decimal (e.g., 0.05 for 5%)
 */
export function calcTaxBreakdown(grossSalary: number, stateTaxRate: number): TaxBreakdown {
  const federalTaxableIncome = Math.max(0, grossSalary - STANDARD_DEDUCTION_2026);
  const federalTax = calcFederalTax(federalTaxableIncome);

  const fica = calcFicaTax(grossSalary);
  const ficaTax = fica.total;

  // State tax is applied to federal taxable income (simplified — no state-specific deduction)
  const stateTax = federalTaxableIncome * stateTaxRate;

  const totalTax = federalTax + ficaTax + stateTax;
  const takeHomePay = grossSalary - totalTax;

  return {
    grossSalary,
    standardDeduction: STANDARD_DEDUCTION_2026,
    federalTaxableIncome,
    federalTax,
    socialSecurityTax: fica.socialSecurity,
    medicareTax: fica.medicare,
    additionalMedicareTax: fica.additionalMedicare,
    ficaTax,
    stateTax,
    totalTax,
    takeHomePay,
    effectiveFederalRate: grossSalary > 0 ? federalTax / grossSalary : 0,
    effectiveTotalRate: grossSalary > 0 ? totalTax / grossSalary : 0,
  };
}

export function formatCurrency(n: number): string {
  return "$" + Math.round(n).toLocaleString("en-US");
}

export function formatPct(rate: number): string {
  return (rate * 100).toFixed(1) + "%";
}
