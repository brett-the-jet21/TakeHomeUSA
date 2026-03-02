// ─── City / Local Income Tax Configurations ──────────────────────────────────
// Rates reflect 2025–2026 enacted tax law
// Sources: NYC DOF, Philadelphia Revenue Dept, Detroit City Tax, Baltimore
// City Finance, Columbus CCA, KC/STL City Earnings Tax, Metro/Multnomah OR

export interface CityTaxConfig {
  name: string;
  slug: string;
  stateSlug: string;
  description: string;
  topRateDisplay: string;
  /** Flat rate applied to (gross − deduction). Use for wage/earnings taxes. */
  flat?: number;
  /** Progressive brackets [min, max, rate]. Applied to (gross − deduction). */
  brackets?: [number, number, number][];
  /** Deduction before rate(s) are applied. 0 for wage taxes on gross earnings. */
  deduction: number;
}

// ─── City Tax Calculator ─────────────────────────────────────────────────────
export function calcCityTax(city: CityTaxConfig, gross: number): number {
  const taxable = Math.max(0, gross - city.deduction);
  if (city.flat !== undefined) return taxable * city.flat;
  if (city.brackets) {
    let tax = 0;
    for (const [min, max, rate] of city.brackets) {
      if (taxable <= min) break;
      tax += (Math.min(taxable, max) - min) * rate;
    }
    return tax;
  }
  return 0;
}

// ─── City Definitions ────────────────────────────────────────────────────────

const NEW_YORK_CITY: CityTaxConfig = {
  name: "New York City",
  slug: "new-york-city",
  stateSlug: "new-york",
  topRateDisplay: "3.876%",
  description: "NYC levies a local income tax (3.078%–3.876%) on residents, on top of NY state tax.",
  deduction: 8_000, // mirrors NY state standard deduction for single filer
  brackets: [
    [0,      12_000,   0.03078],
    [12_000, 25_000,   0.03762],
    [25_000, 50_000,   0.03819],
    [50_000, Infinity, 0.03876],
  ],
};

const PHILADELPHIA: CityTaxConfig = {
  name: "Philadelphia",
  slug: "philadelphia",
  stateSlug: "pennsylvania",
  topRateDisplay: "3.75%",
  description: "Philadelphia levies a 3.75% wage tax on resident gross earnings (no deduction).",
  deduction: 0,
  flat: 0.0375,
};

const DETROIT: CityTaxConfig = {
  name: "Detroit",
  slug: "detroit",
  stateSlug: "michigan",
  topRateDisplay: "2.4%",
  description: "Detroit levies a 2.4% city income tax on residents after a $600 personal exemption.",
  deduction: 600,
  flat: 0.024,
};

const BALTIMORE: CityTaxConfig = {
  name: "Baltimore",
  slug: "baltimore",
  stateSlug: "maryland",
  topRateDisplay: "3.2%",
  description: "Baltimore City levies a 3.2% local income tax (piggyback on MD taxable income) on residents.",
  deduction: 2_400, // mirrors MD state standard deduction
  flat: 0.032,
};

const COLUMBUS: CityTaxConfig = {
  name: "Columbus",
  slug: "columbus",
  stateSlug: "ohio",
  topRateDisplay: "2.5%",
  description: "Columbus levies a 2.5% municipal income tax on resident gross earnings.",
  deduction: 0,
  flat: 0.025,
};

const KANSAS_CITY: CityTaxConfig = {
  name: "Kansas City",
  slug: "kansas-city",
  stateSlug: "missouri",
  topRateDisplay: "1%",
  description: "Kansas City levies a 1% earnings tax on resident gross earnings.",
  deduction: 0,
  flat: 0.01,
};

const ST_LOUIS: CityTaxConfig = {
  name: "St. Louis",
  slug: "st-louis",
  stateSlug: "missouri",
  topRateDisplay: "1%",
  description: "St. Louis levies a 1% earnings tax on resident gross earnings.",
  deduction: 0,
  flat: 0.01,
};

// Portland: Metro Supportive Housing Services (1%) + Multnomah County PFA (1.5%/3%)
// Both apply to Oregon taxable income over $125,000 (single filer threshold).
const PORTLAND: CityTaxConfig = {
  name: "Portland / Multnomah Co.",
  slug: "portland",
  stateSlug: "oregon",
  topRateDisplay: "4%",
  description: "Metro SHS (1%) + Multnomah Co. PFA tax (1.5%–3%) on Oregon taxable income over $125,000.",
  deduction: 2_270, // mirrors OR state standard deduction
  brackets: [
    [0,        125_000,  0.000],
    [125_000,  250_000,  0.025], // 1% Metro SHS + 1.5% Multnomah PFA
    [250_000,  Infinity, 0.040], // 1% Metro SHS + 3.0% Multnomah PFA
  ],
};

// ─── Lookup Maps ─────────────────────────────────────────────────────────────

export const ALL_CITIES: CityTaxConfig[] = [
  NEW_YORK_CITY,
  PHILADELPHIA,
  DETROIT,
  BALTIMORE,
  COLUMBUS,
  KANSAS_CITY,
  ST_LOUIS,
  PORTLAND,
];

export const CITY_BY_SLUG = new Map<string, CityTaxConfig>(
  ALL_CITIES.map((c) => [c.slug, c])
);

/** Maps state slug → cities that have a local income tax in that state */
export const CITIES_BY_STATE = new Map<string, CityTaxConfig[]>([
  ["new-york",     [NEW_YORK_CITY]],
  ["pennsylvania", [PHILADELPHIA]],
  ["michigan",     [DETROIT]],
  ["maryland",     [BALTIMORE]],
  ["ohio",         [COLUMBUS]],
  ["missouri",     [KANSAS_CITY, ST_LOUIS]],
  ["oregon",       [PORTLAND]],
]);
