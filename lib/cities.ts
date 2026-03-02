// ─── City / Local Income Tax Configurations ──────────────────────────────────
// Rates reflect 2025–2026 enacted tax law
// Sources: NYC DOF, Philadelphia Revenue Dept, Detroit City Tax, Baltimore
// City Finance, Columbus CCA, KC/STL City Earnings Tax, Metro/Multnomah OR,
// MD Comptroller 2024 county income tax rates

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
  /**
   * When true, this city/county config fully replaces the state's additionalRate.
   * Used for Maryland counties: the state average additionalRate (2.5%) is
   * stripped so only the selected county rate applies — avoids double-counting.
   */
  overridesAdditionalRate?: boolean;
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

// ─── Maryland County Income Tax ───────────────────────────────────────────────
// Source: MD Comptroller 2024 county income tax rates
// All MD counties levy a piggyback tax on MD taxable income (= gross − MD
// standard deduction of $2,400 for single filers).
// overridesAdditionalRate: true strips the state's default additionalRate (2.5%
// average) so only the selected county rate is applied — no double-counting.
function mdCounty(name: string, slug: string, rate: number, desc?: string): CityTaxConfig {
  return {
    name,
    slug,
    stateSlug: "maryland",
    topRateDisplay: (rate * 100).toFixed(2) + "%",
    description: desc ?? `${name} levies a ${(rate * 100).toFixed(2)}% county income tax on Maryland taxable income.`,
    deduction: 2_400, // MD state standard deduction for single filer
    flat: rate,
    overridesAdditionalRate: true,
  };
}

const MD_ALLEGANY       = mdCounty("Allegany County",         "allegany",       0.0305);
const MD_ANNE_ARUNDEL   = mdCounty("Anne Arundel County",     "anne-arundel",   0.0281);
const MD_BALTIMORE_CITY = mdCounty("Baltimore City",          "baltimore",      0.0320,
  "Baltimore City levies a 3.20% local income tax on Maryland taxable income.");
const MD_BALTIMORE_CO   = mdCounty("Baltimore County",        "baltimore-county", 0.0320);
const MD_CALVERT        = mdCounty("Calvert County",          "calvert",        0.0300);
const MD_CAROLINE       = mdCounty("Caroline County",         "caroline",       0.0320);
const MD_CARROLL        = mdCounty("Carroll County",          "carroll",        0.0305);
const MD_CECIL          = mdCounty("Cecil County",            "cecil",          0.0300);
const MD_CHARLES        = mdCounty("Charles County",          "charles",        0.0303);
const MD_DORCHESTER     = mdCounty("Dorchester County",       "dorchester",     0.0320);
const MD_FREDERICK      = mdCounty("Frederick County",        "frederick",      0.0296);
const MD_GARRETT        = mdCounty("Garrett County",          "garrett",        0.0265);
const MD_HARFORD        = mdCounty("Harford County",          "harford",        0.0306);
const MD_HOWARD         = mdCounty("Howard County",           "howard",         0.0320);
const MD_KENT           = mdCounty("Kent County",             "kent",           0.0320);
const MD_MONTGOMERY     = mdCounty("Montgomery County",       "montgomery",     0.0320);
const MD_PRINCE_GEORGES = mdCounty("Prince George's County",  "prince-georges", 0.0320);
const MD_QUEEN_ANNES    = mdCounty("Queen Anne's County",     "queen-annes",    0.0320);
const MD_ST_MARYS       = mdCounty("St. Mary's County",       "st-marys",       0.0300);
const MD_SOMERSET       = mdCounty("Somerset County",         "somerset",       0.0320);
const MD_TALBOT         = mdCounty("Talbot County",           "talbot",         0.0240);
const MD_WASHINGTON     = mdCounty("Washington County",       "washington",     0.0300);
const MD_WICOMICO       = mdCounty("Wicomico County",         "wicomico",       0.0320);
const MD_WORCESTER      = mdCounty("Worcester County",        "worcester",      0.0225);

export const MD_COUNTIES: CityTaxConfig[] = [
  MD_ALLEGANY, MD_ANNE_ARUNDEL, MD_BALTIMORE_CITY, MD_BALTIMORE_CO,
  MD_CALVERT, MD_CAROLINE, MD_CARROLL, MD_CECIL, MD_CHARLES,
  MD_DORCHESTER, MD_FREDERICK, MD_GARRETT, MD_HARFORD, MD_HOWARD,
  MD_KENT, MD_MONTGOMERY, MD_PRINCE_GEORGES, MD_QUEEN_ANNES,
  MD_ST_MARYS, MD_SOMERSET, MD_TALBOT, MD_WASHINGTON, MD_WICOMICO,
  MD_WORCESTER,
];

// ─── Other Cities ─────────────────────────────────────────────────────────────

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
  ...MD_COUNTIES,
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
  ["maryland",     MD_COUNTIES],
  ["ohio",         [COLUMBUS]],
  ["missouri",     [KANSAS_CITY, ST_LOUIS]],
  ["oregon",       [PORTLAND]],
]);
