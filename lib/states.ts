/**
 * TakeHomeUSA — All 50 State Tax Configurations
 * Source: 2026 state tax law; IRS Rev. Proc. 2025-32 for federal references
 *
 * NOTE: State calculations are estimates for salary-planning purposes.
 * Actual liability varies by filing status, credits, and local taxes.
 * All values are for SINGLE filers unless noted.
 */

// ─── Types ────────────────────────────────────────────────────────────────────
export interface StateTaxConfig {
  name: string;
  abbr: string;
  slug: string;
  noTax: boolean;
  /** Flat rate (if flat-rate state). Applied to (gross - deduction). */
  flat?: number;
  /** Progressive brackets [min, max, rate]. Applied to (gross - deduction). */
  brackets?: [number, number, number][];
  /** State standard deduction or personal exemption equivalent. */
  deduction: number;
  /** Extra tax rate on gross (e.g. CA SDI 1.1%, MD county avg 2.5%). */
  additionalRate?: number;
  /** Human-readable top rate for display (e.g. "13.3%"). */
  topRateDisplay: string;
  /** One-liner description for hub pages. */
  description: string;
  /** Tailwind gradient classes for the hub hero. */
  heroGradient: string;
}

// ─── State Tax Calculator ─────────────────────────────────────────────────────
export function calcStateOnly(config: StateTaxConfig, gross: number): number {
  if (config.noTax) return 0;

  const taxable = Math.max(0, gross - config.deduction);
  let tax = 0;

  if (config.flat !== undefined) {
    tax = taxable * config.flat;
  } else if (config.brackets) {
    for (const [min, max, rate] of config.brackets) {
      if (taxable <= min) break;
      tax += (Math.min(taxable, max) - min) * rate;
    }
  }

  // Additional flat rate on full gross (SDI, county/local avg, etc.)
  if (config.additionalRate) {
    tax += gross * config.additionalRate;
  }

  return Math.max(0, tax);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getStateConfig(slug: string): StateTaxConfig | null {
  return ALL_STATE_CONFIGS.find((c) => c.slug === slug) ?? null;
}

export function getStateSalaryAmounts(stateSlug: string): number[] {
  const step = stateSlug === "texas" ? 1_000 : 5_000;
  const amounts: number[] = [];
  for (let a = 20_000; a <= 500_000; a += step) amounts.push(a);
  return amounts;
}

// ─── All 50 State Configurations (2026) ──────────────────────────────────────
export const ALL_STATE_CONFIGS: StateTaxConfig[] = [

  // ── No State Income Tax (9 states) ─────────────────────────────────────────
  {
    name: "Alaska", abbr: "AK", slug: "alaska",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Alaska has no state income tax and even pays residents an annual dividend.",
    heroGradient: "from-blue-900 via-blue-800 to-teal-700",
  },
  {
    name: "Florida", abbr: "FL", slug: "florida",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Florida has no state income tax — identical take-home to Texas.",
    heroGradient: "from-orange-700 via-orange-600 to-amber-500",
  },
  {
    name: "Nevada", abbr: "NV", slug: "nevada",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Nevada has no state income tax and no personal income tax of any kind.",
    heroGradient: "from-red-800 via-red-700 to-orange-600",
  },
  {
    name: "New Hampshire", abbr: "NH", slug: "new-hampshire",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "New Hampshire has no tax on wages or salaries (interest/dividends tax is being phased out).",
    heroGradient: "from-slate-700 via-slate-600 to-blue-700",
  },
  {
    name: "South Dakota", abbr: "SD", slug: "south-dakota",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "South Dakota has no state income tax — every dollar you earn stays yours.",
    heroGradient: "from-sky-800 via-sky-700 to-blue-600",
  },
  {
    name: "Tennessee", abbr: "TN", slug: "tennessee",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Tennessee eliminated all state income taxes on wages in 2021.",
    heroGradient: "from-orange-800 via-orange-700 to-amber-600",
  },
  {
    name: "Texas", abbr: "TX", slug: "texas",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Texas has no state income tax — one of the most tax-friendly states for workers.",
    heroGradient: "from-blue-900 via-blue-800 to-indigo-900",
  },
  {
    name: "Washington", abbr: "WA", slug: "washington",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Washington state has no income tax on wages (capital gains tax applies to investments).",
    heroGradient: "from-green-900 via-green-800 to-emerald-700",
  },
  {
    name: "Wyoming", abbr: "WY", slug: "wyoming",
    noTax: true, deduction: 0, flat: undefined, topRateDisplay: "0%",
    description: "Wyoming has no state income tax and is one of the lowest-tax states overall.",
    heroGradient: "from-amber-800 via-amber-700 to-yellow-600",
  },

  // ── Flat Rate States (16 states) ────────────────────────────────────────────
  {
    name: "Arizona", abbr: "AZ", slug: "arizona",
    noTax: false, flat: 0.025, deduction: 14_600, topRateDisplay: "2.5%",
    description: "Arizona has a low 2.5% flat income tax rate — one of the lowest in the country.",
    heroGradient: "from-red-800 via-rose-700 to-orange-600",
  },
  {
    name: "Colorado", abbr: "CO", slug: "colorado",
    noTax: false, flat: 0.044, deduction: 16_100, topRateDisplay: "4.4%",
    description: "Colorado has a 4.4% flat state income tax applied to federal taxable income.",
    heroGradient: "from-blue-900 via-blue-800 to-sky-700",
  },
  {
    name: "Georgia", abbr: "GA", slug: "georgia",
    noTax: false, flat: 0.0549, deduction: 5_500, topRateDisplay: "5.49%",
    description: "Georgia moved to a 5.49% flat income tax rate, phasing down over time.",
    heroGradient: "from-red-900 via-red-800 to-rose-700",
  },
  {
    name: "Idaho", abbr: "ID", slug: "idaho",
    noTax: false, flat: 0.058, deduction: 14_600, topRateDisplay: "5.8%",
    description: "Idaho has a 5.8% flat state income tax rate for most earners.",
    heroGradient: "from-green-900 via-green-800 to-teal-700",
  },
  {
    name: "Illinois", abbr: "IL", slug: "illinois",
    noTax: false, flat: 0.0495, deduction: 2_425, topRateDisplay: "4.95%",
    description: "Illinois has a 4.95% flat state income tax with a modest personal exemption.",
    heroGradient: "from-blue-900 via-blue-800 to-indigo-800",
  },
  {
    name: "Indiana", abbr: "IN", slug: "indiana",
    noTax: false, flat: 0.0305, deduction: 1_000, topRateDisplay: "3.05%",
    description: "Indiana has a 3.05% flat state income tax — one of the lower flat rates.",
    heroGradient: "from-slate-800 via-slate-700 to-blue-800",
  },
  {
    name: "Iowa", abbr: "IA", slug: "iowa",
    noTax: false, flat: 0.038, deduction: 2_480, topRateDisplay: "3.8%",
    description: "Iowa reduced to a 3.8% flat state income tax rate starting 2025.",
    heroGradient: "from-yellow-800 via-yellow-700 to-amber-600",
  },
  {
    name: "Kentucky", abbr: "KY", slug: "kentucky",
    noTax: false, flat: 0.045, deduction: 3_160, topRateDisplay: "4.5%",
    description: "Kentucky has a 4.5% flat state income tax.",
    heroGradient: "from-blue-900 via-blue-800 to-sky-700",
  },
  {
    name: "Massachusetts", abbr: "MA", slug: "massachusetts",
    noTax: false, flat: 0.05, deduction: 4_400, topRateDisplay: "5.0%",
    description: "Massachusetts has a 5% flat income tax (+ 4% surtax on income over $1M).",
    heroGradient: "from-red-900 via-red-800 to-blue-800",
  },
  {
    name: "Michigan", abbr: "MI", slug: "michigan",
    noTax: false, flat: 0.0405, deduction: 5_600, topRateDisplay: "4.05%",
    description: "Michigan has a 4.05% flat state income tax with a personal exemption.",
    heroGradient: "from-blue-900 via-blue-800 to-sky-800",
  },
  {
    name: "Mississippi", abbr: "MS", slug: "mississippi",
    noTax: false, flat: 0.03, deduction: 2_300, topRateDisplay: "3.0%",
    description: "Mississippi has a 3.0% flat income tax and is phasing toward 0% over time.",
    heroGradient: "from-red-900 via-red-800 to-rose-700",
  },
  {
    name: "Missouri", abbr: "MO", slug: "missouri",
    noTax: false, flat: 0.047, deduction: 16_100, topRateDisplay: "4.7%",
    description: "Missouri has a 4.7% flat income tax on federal-conforming taxable income.",
    heroGradient: "from-slate-800 via-slate-700 to-red-900",
  },
  {
    name: "North Carolina", abbr: "NC", slug: "north-carolina",
    noTax: false, flat: 0.045, deduction: 10_750, topRateDisplay: "4.5%",
    description: "North Carolina has a 4.5% flat income tax and continues to reduce rates.",
    heroGradient: "from-blue-900 via-blue-800 to-red-800",
  },
  {
    name: "Pennsylvania", abbr: "PA", slug: "pennsylvania",
    noTax: false, flat: 0.0307, deduction: 0, topRateDisplay: "3.07%",
    description: "Pennsylvania has a 3.07% flat income tax with no standard deduction.",
    heroGradient: "from-blue-900 via-blue-800 to-yellow-700",
  },
  {
    name: "South Carolina", abbr: "SC", slug: "south-carolina",
    noTax: false, flat: 0.062, deduction: 13_850, topRateDisplay: "6.2%",
    description: "South Carolina has a 6.2% flat income tax (reduced from 7%, phasing down).",
    heroGradient: "from-blue-900 via-blue-800 to-indigo-800",
  },
  {
    name: "Utah", abbr: "UT", slug: "utah",
    noTax: false, flat: 0.0455, deduction: 14_600, topRateDisplay: "4.55%",
    description: "Utah has a 4.55% flat state income tax.",
    heroGradient: "from-red-800 via-red-700 to-orange-600",
  },

  // ── Progressive Bracket States (25 states) ──────────────────────────────────
  {
    name: "Alabama", abbr: "AL", slug: "alabama",
    noTax: false, topRateDisplay: "5.0%", deduction: 3_000,
    description: "Alabama has a progressive income tax up to 5% with a $3,000 standard deduction.",
    heroGradient: "from-red-900 via-red-800 to-gray-900",
    brackets: [
      [0,     500,      0.02],
      [500,   3_000,    0.04],
      [3_000, Infinity, 0.05],
    ],
  },
  {
    name: "Arkansas", abbr: "AR", slug: "arkansas",
    noTax: false, topRateDisplay: "4.4%", deduction: 2_270,
    description: "Arkansas has a progressive income tax up to 4.4%.",
    heroGradient: "from-red-900 via-red-800 to-green-900",
    brackets: [
      [0,      5_099,    0.02],
      [5_099,  10_299,   0.04],
      [10_299, Infinity, 0.044],
    ],
  },
  {
    name: "California", abbr: "CA", slug: "california",
    noTax: false, topRateDisplay: "13.3%", deduction: 5_202,
    additionalRate: 0.011, // SDI 1.1% on all wages
    description: "California has the highest state income tax in the US — up to 13.3%.",
    heroGradient: "from-blue-900 via-blue-800 to-yellow-700",
    brackets: [
      [0,        10_756,   0.010],
      [10_756,   25_499,   0.020],
      [25_499,   40_245,   0.040],
      [40_245,   55_866,   0.060],
      [55_866,   70_606,   0.080],
      [70_606,   360_659,  0.093],
      [360_659,  432_787,  0.103],
      [432_787,  721_314,  0.113],
      [721_314,  1_000_000,0.123],
      [1_000_000,Infinity, 0.133],
    ],
  },
  {
    name: "Connecticut", abbr: "CT", slug: "connecticut",
    noTax: false, topRateDisplay: "6.99%", deduction: 15_000,
    description: "Connecticut has a progressive income tax up to 6.99% with a $15,000 exemption.",
    heroGradient: "from-blue-900 via-blue-800 to-slate-700",
    brackets: [
      [0,       10_000,  0.030],
      [10_000,  50_000,  0.050],
      [50_000,  100_000, 0.055],
      [100_000, 200_000, 0.060],
      [200_000, 250_000, 0.065],
      [250_000, 500_000, 0.069],
      [500_000, Infinity,0.0699],
    ],
  },
  {
    name: "Delaware", abbr: "DE", slug: "delaware",
    noTax: false, topRateDisplay: "6.6%", deduction: 3_250,
    description: "Delaware has a progressive income tax up to 6.6%, with no sales tax.",
    heroGradient: "from-blue-900 via-blue-800 to-sky-700",
    brackets: [
      [0,      2_000,  0.000],
      [2_000,  5_000,  0.022],
      [5_000,  10_000, 0.039],
      [10_000, 20_000, 0.048],
      [20_000, 25_000, 0.052],
      [25_000, 60_000, 0.0555],
      [60_000, Infinity,0.066],
    ],
  },
  {
    name: "Hawaii", abbr: "HI", slug: "hawaii",
    noTax: false, topRateDisplay: "11.0%", deduction: 2_200,
    description: "Hawaii has one of the highest income tax rates in the US — up to 11%.",
    heroGradient: "from-green-900 via-green-800 to-teal-700",
    brackets: [
      [0,       2_400,   0.014],
      [2_400,   4_800,   0.032],
      [4_800,   9_600,   0.055],
      [9_600,   14_400,  0.064],
      [14_400,  19_200,  0.068],
      [19_200,  24_000,  0.072],
      [24_000,  36_000,  0.076],
      [36_000,  48_000,  0.079],
      [48_000,  150_000, 0.0825],
      [150_000, 175_000, 0.090],
      [175_000, 200_000, 0.100],
      [200_000, Infinity,0.110],
    ],
  },
  {
    name: "Kansas", abbr: "KS", slug: "kansas",
    noTax: false, topRateDisplay: "5.7%", deduction: 3_500,
    description: "Kansas has a progressive income tax up to 5.7%.",
    heroGradient: "from-yellow-800 via-yellow-700 to-amber-600",
    brackets: [
      [0,      15_000,  0.031],
      [15_000, 30_000,  0.0525],
      [30_000, Infinity,0.057],
    ],
  },
  {
    name: "Louisiana", abbr: "LA", slug: "louisiana",
    noTax: false, topRateDisplay: "4.25%", deduction: 4_500,
    description: "Louisiana recently reduced its top rate to 4.25% with broader brackets.",
    heroGradient: "from-purple-900 via-purple-800 to-yellow-700",
    brackets: [
      [0,      12_500,  0.030],
      [12_500, 50_000,  0.035],
      [50_000, Infinity,0.0425],
    ],
  },
  {
    name: "Maine", abbr: "ME", slug: "maine",
    noTax: false, topRateDisplay: "7.15%", deduction: 14_600,
    description: "Maine has a progressive income tax up to 7.15%.",
    heroGradient: "from-blue-900 via-blue-800 to-green-800",
    brackets: [
      [0,      24_500,  0.058],
      [24_500, 58_050,  0.0675],
      [58_050, Infinity,0.0715],
    ],
  },
  {
    name: "Maryland", abbr: "MD", slug: "maryland",
    noTax: false, topRateDisplay: "5.75% + county", deduction: 2_400,
    additionalRate: 0.025, // Average county/local income tax
    description: "Maryland has a progressive state tax up to 5.75% plus county/local tax (~2.5% avg).",
    heroGradient: "from-red-900 via-red-800 to-yellow-700",
    brackets: [
      [0,       1_000,   0.020],
      [1_000,   2_000,   0.030],
      [2_000,   3_000,   0.040],
      [3_000,   100_000, 0.0475],
      [100_000, 125_000, 0.050],
      [125_000, 150_000, 0.0525],
      [150_000, 250_000, 0.055],
      [250_000, Infinity,0.0575],
    ],
  },
  {
    name: "Minnesota", abbr: "MN", slug: "minnesota",
    noTax: false, topRateDisplay: "9.85%", deduction: 14_575,
    description: "Minnesota has a progressive income tax reaching 9.85% for high earners.",
    heroGradient: "from-blue-900 via-blue-800 to-red-800",
    brackets: [
      [0,       31_690,  0.0535],
      [31_690,  104_090, 0.0680],
      [104_090, 193_240, 0.0785],
      [193_240, Infinity,0.0985],
    ],
  },
  {
    name: "Montana", abbr: "MT", slug: "montana",
    noTax: false, topRateDisplay: "5.9%", deduction: 5_540,
    description: "Montana has a simple 2-bracket income tax: 4.7% and 5.9%.",
    heroGradient: "from-sky-900 via-sky-800 to-green-800",
    brackets: [
      [0,      20_500,  0.047],
      [20_500, Infinity,0.059],
    ],
  },
  {
    name: "Nebraska", abbr: "NE", slug: "nebraska",
    noTax: false, topRateDisplay: "5.84%", deduction: 7_900,
    description: "Nebraska has a progressive income tax up to 5.84%.",
    heroGradient: "from-red-900 via-red-800 to-yellow-700",
    brackets: [
      [0,      3_700,   0.0246],
      [3_700,  22_170,  0.0351],
      [22_170, 35_730,  0.0501],
      [35_730, Infinity,0.0584],
    ],
  },
  {
    name: "New Jersey", abbr: "NJ", slug: "new-jersey",
    noTax: false, topRateDisplay: "10.75%", deduction: 1_000,
    description: "New Jersey has a progressive income tax reaching 10.75% — among the highest in the US.",
    heroGradient: "from-blue-900 via-blue-800 to-yellow-600",
    brackets: [
      [0,       20_000,    0.014],
      [20_000,  35_000,    0.0175],
      [35_000,  40_000,    0.035],
      [40_000,  75_000,    0.05525],
      [75_000,  500_000,   0.0637],
      [500_000, 1_000_000, 0.0897],
      [1_000_000,Infinity, 0.1075],
    ],
  },
  {
    name: "New Mexico", abbr: "NM", slug: "new-mexico",
    noTax: false, topRateDisplay: "5.9%", deduction: 14_600,
    description: "New Mexico has a progressive income tax up to 5.9%.",
    heroGradient: "from-yellow-800 via-amber-700 to-red-700",
    brackets: [
      [0,      5_500,   0.017],
      [5_500,  11_000,  0.032],
      [11_000, 16_000,  0.047],
      [16_000, 210_000, 0.049],
      [210_000,Infinity,0.059],
    ],
  },
  {
    name: "New York", abbr: "NY", slug: "new-york",
    noTax: false, topRateDisplay: "10.9%", deduction: 8_000,
    description: "New York has a progressive income tax up to 10.9% — one of the highest in the US.",
    heroGradient: "from-blue-900 via-blue-800 to-gray-800",
    brackets: [
      [0,          17_150,     0.040],
      [17_150,     23_600,     0.045],
      [23_600,     27_900,     0.0525],
      [27_900,     161_550,    0.0585],
      [161_550,    323_200,    0.0625],
      [323_200,    2_155_350,  0.0685],
      [2_155_350,  5_000_000,  0.0965],
      [5_000_000,  25_000_000, 0.1030],
      [25_000_000, Infinity,   0.1090],
    ],
  },
  {
    name: "North Dakota", abbr: "ND", slug: "north-dakota",
    noTax: false, topRateDisplay: "2.5%", deduction: 14_600,
    description: "North Dakota has very low income tax — just 2.5% for higher earners.",
    heroGradient: "from-sky-900 via-sky-800 to-blue-700",
    brackets: [
      [0,       44_725,  0.000],
      [44_725,  225_975, 0.0195],
      [225_975, Infinity,0.025],
    ],
  },
  {
    name: "Ohio", abbr: "OH", slug: "ohio",
    noTax: false, topRateDisplay: "3.5%", deduction: 0,
    description: "Ohio has a low progressive income tax up to 3.5%, with no tax below $26,050.",
    heroGradient: "from-red-900 via-red-800 to-gray-800",
    brackets: [
      [0,      26_050,  0.000],
      [26_050, 46_100,  0.02765],
      [46_100, 92_150,  0.03226],
      [92_150, Infinity,0.035],
    ],
  },
  {
    name: "Oklahoma", abbr: "OK", slug: "oklahoma",
    noTax: false, topRateDisplay: "4.75%", deduction: 6_350,
    description: "Oklahoma has a progressive income tax up to 4.75%.",
    heroGradient: "from-red-900 via-red-800 to-orange-700",
    brackets: [
      [0,     1_000,  0.0025],
      [1_000, 2_500,  0.0075],
      [2_500, 3_750,  0.0175],
      [3_750, 4_900,  0.0275],
      [4_900, 7_200,  0.0375],
      [7_200, Infinity,0.0475],
    ],
  },
  {
    name: "Oregon", abbr: "OR", slug: "oregon",
    noTax: false, topRateDisplay: "9.9%", deduction: 2_270,
    description: "Oregon has one of the highest income tax rates — up to 9.9%.",
    heroGradient: "from-green-900 via-green-800 to-emerald-700",
    brackets: [
      [0,       18_400,  0.0475],
      [18_400,  46_200,  0.0675],
      [46_200,  250_000, 0.0875],
      [250_000, Infinity,0.099],
    ],
  },
  {
    name: "Rhode Island", abbr: "RI", slug: "rhode-island",
    noTax: false, topRateDisplay: "5.99%", deduction: 10_750,
    description: "Rhode Island has a progressive income tax up to 5.99%.",
    heroGradient: "from-blue-900 via-blue-800 to-indigo-700",
    brackets: [
      [0,       77_450,  0.0375],
      [77_450,  176_050, 0.0475],
      [176_050, Infinity,0.0599],
    ],
  },
  {
    name: "Vermont", abbr: "VT", slug: "vermont",
    noTax: false, topRateDisplay: "8.75%", deduction: 13_850,
    description: "Vermont has a progressive income tax up to 8.75%.",
    heroGradient: "from-green-900 via-green-800 to-blue-800",
    brackets: [
      [0,       45_400,  0.0335],
      [45_400,  110_050, 0.066],
      [110_050, 229_550, 0.076],
      [229_550, Infinity,0.0875],
    ],
  },
  {
    name: "Virginia", abbr: "VA", slug: "virginia",
    noTax: false, topRateDisplay: "5.75%", deduction: 8_000,
    description: "Virginia has a progressive income tax up to 5.75%.",
    heroGradient: "from-blue-900 via-blue-800 to-red-800",
    brackets: [
      [0,      3_000,  0.020],
      [3_000,  5_000,  0.030],
      [5_000,  17_000, 0.050],
      [17_000, Infinity,0.0575],
    ],
  },
  {
    name: "West Virginia", abbr: "WV", slug: "west-virginia",
    noTax: false, topRateDisplay: "5.12%", deduction: 2_000,
    description: "West Virginia has a progressive income tax up to 5.12%, with ongoing rate reductions.",
    heroGradient: "from-blue-900 via-blue-800 to-green-800",
    brackets: [
      [0,      10_000,  0.0236],
      [10_000, 25_000,  0.0315],
      [25_000, 40_000,  0.0354],
      [40_000, 60_000,  0.0472],
      [60_000, Infinity,0.0512],
    ],
  },
  {
    name: "Wisconsin", abbr: "WI", slug: "wisconsin",
    noTax: false, topRateDisplay: "7.65%", deduction: 12_380,
    description: "Wisconsin has a progressive income tax up to 7.65%.",
    heroGradient: "from-red-900 via-red-800 to-gray-800",
    brackets: [
      [0,       13_810,  0.035],
      [13_810,  27_630,  0.044],
      [27_630,  304_170, 0.053],
      [304_170, Infinity,0.0765],
    ],
  },
];

// ─── Lookup Maps ──────────────────────────────────────────────────────────────
export const STATE_BY_SLUG = new Map(
  ALL_STATE_CONFIGS.map((s) => [s.slug, s])
);

/** For the /states directory page */
export const STATES_DIRECTORY = ALL_STATE_CONFIGS.map((s) => ({
  name: s.name,
  slug: s.slug,
  tax: s.noTax ? "0%" : s.topRateDisplay,
  noTax: s.noTax,
})).sort((a, b) => a.name.localeCompare(b.name));
