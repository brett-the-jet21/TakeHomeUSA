export type StateTaxType = "none" | "flat" | "progressive";

export interface StateInfo {
  name: string;
  slug: string;
  taxType: StateTaxType;
  /** Flat rate (0–1) for "flat" states; top marginal for "progressive"; 0 for "none" */
  taxRate: number;
  /** Short description of state income tax */
  taxNote: string;
}

export const ALL_STATES: StateInfo[] = [
  { name: "Alabama", slug: "alabama", taxType: "progressive", taxRate: 0.05, taxNote: "Up to 5%" },
  { name: "Alaska", slug: "alaska", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "Arizona", slug: "arizona", taxType: "flat", taxRate: 0.025, taxNote: "Flat 2.5%" },
  { name: "Arkansas", slug: "arkansas", taxType: "progressive", taxRate: 0.044, taxNote: "Up to 4.4%" },
  { name: "California", slug: "california", taxType: "progressive", taxRate: 0.093, taxNote: "Up to 9.3%" },
  { name: "Colorado", slug: "colorado", taxType: "flat", taxRate: 0.044, taxNote: "Flat 4.4%" },
  { name: "Connecticut", slug: "connecticut", taxType: "progressive", taxRate: 0.0699, taxNote: "Up to 6.99%" },
  { name: "Delaware", slug: "delaware", taxType: "progressive", taxRate: 0.066, taxNote: "Up to 6.6%" },
  { name: "Florida", slug: "florida", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "Georgia", slug: "georgia", taxType: "flat", taxRate: 0.0549, taxNote: "Flat 5.49%" },
  { name: "Hawaii", slug: "hawaii", taxType: "progressive", taxRate: 0.11, taxNote: "Up to 11%" },
  { name: "Idaho", slug: "idaho", taxType: "flat", taxRate: 0.05695, taxNote: "Flat 5.695%" },
  { name: "Illinois", slug: "illinois", taxType: "flat", taxRate: 0.0495, taxNote: "Flat 4.95%" },
  { name: "Indiana", slug: "indiana", taxType: "flat", taxRate: 0.0305, taxNote: "Flat 3.05%" },
  { name: "Iowa", slug: "iowa", taxType: "flat", taxRate: 0.038, taxNote: "Flat 3.8%" },
  { name: "Kansas", slug: "kansas", taxType: "progressive", taxRate: 0.057, taxNote: "Up to 5.7%" },
  { name: "Kentucky", slug: "kentucky", taxType: "flat", taxRate: 0.04, taxNote: "Flat 4.0%" },
  { name: "Louisiana", slug: "louisiana", taxType: "progressive", taxRate: 0.0425, taxNote: "Up to 4.25%" },
  { name: "Maine", slug: "maine", taxType: "progressive", taxRate: 0.0715, taxNote: "Up to 7.15%" },
  { name: "Maryland", slug: "maryland", taxType: "progressive", taxRate: 0.0575, taxNote: "Up to 5.75%" },
  { name: "Massachusetts", slug: "massachusetts", taxType: "flat", taxRate: 0.05, taxNote: "Flat 5.0%" },
  { name: "Michigan", slug: "michigan", taxType: "flat", taxRate: 0.0405, taxNote: "Flat 4.05%" },
  { name: "Minnesota", slug: "minnesota", taxType: "progressive", taxRate: 0.0985, taxNote: "Up to 9.85%" },
  { name: "Mississippi", slug: "mississippi", taxType: "flat", taxRate: 0.047, taxNote: "Flat 4.7%" },
  { name: "Missouri", slug: "missouri", taxType: "progressive", taxRate: 0.048, taxNote: "Up to 4.8%" },
  { name: "Montana", slug: "montana", taxType: "progressive", taxRate: 0.0675, taxNote: "Up to 6.75%" },
  { name: "Nebraska", slug: "nebraska", taxType: "progressive", taxRate: 0.0584, taxNote: "Up to 5.84%" },
  { name: "Nevada", slug: "nevada", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "New Hampshire", slug: "new-hampshire", taxType: "none", taxRate: 0, taxNote: "No tax on wages" },
  { name: "New Jersey", slug: "new-jersey", taxType: "progressive", taxRate: 0.1075, taxNote: "Up to 10.75%" },
  { name: "New Mexico", slug: "new-mexico", taxType: "progressive", taxRate: 0.059, taxNote: "Up to 5.9%" },
  { name: "New York", slug: "new-york", taxType: "progressive", taxRate: 0.109, taxNote: "Up to 10.9%" },
  { name: "North Carolina", slug: "north-carolina", taxType: "flat", taxRate: 0.045, taxNote: "Flat 4.5%" },
  { name: "North Dakota", slug: "north-dakota", taxType: "progressive", taxRate: 0.025, taxNote: "Up to 2.5%" },
  { name: "Ohio", slug: "ohio", taxType: "progressive", taxRate: 0.035, taxNote: "Up to 3.5%" },
  { name: "Oklahoma", slug: "oklahoma", taxType: "progressive", taxRate: 0.0475, taxNote: "Up to 4.75%" },
  { name: "Oregon", slug: "oregon", taxType: "progressive", taxRate: 0.099, taxNote: "Up to 9.9%" },
  { name: "Pennsylvania", slug: "pennsylvania", taxType: "flat", taxRate: 0.0307, taxNote: "Flat 3.07%" },
  { name: "Rhode Island", slug: "rhode-island", taxType: "progressive", taxRate: 0.0599, taxNote: "Up to 5.99%" },
  { name: "South Carolina", slug: "south-carolina", taxType: "progressive", taxRate: 0.065, taxNote: "Up to 6.5%" },
  { name: "South Dakota", slug: "south-dakota", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "Tennessee", slug: "tennessee", taxType: "none", taxRate: 0, taxNote: "No tax on wages" },
  { name: "Texas", slug: "texas", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "Utah", slug: "utah", taxType: "flat", taxRate: 0.0455, taxNote: "Flat 4.55%" },
  { name: "Vermont", slug: "vermont", taxType: "progressive", taxRate: 0.0875, taxNote: "Up to 8.75%" },
  { name: "Virginia", slug: "virginia", taxType: "progressive", taxRate: 0.0575, taxNote: "Up to 5.75%" },
  { name: "Washington", slug: "washington", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
  { name: "West Virginia", slug: "west-virginia", taxType: "progressive", taxRate: 0.0512, taxNote: "Up to 5.12%" },
  { name: "Wisconsin", slug: "wisconsin", taxType: "progressive", taxRate: 0.0765, taxNote: "Up to 7.65%" },
  { name: "Wyoming", slug: "wyoming", taxType: "none", taxRate: 0, taxNote: "No state income tax" },
];

export const STATES_BY_SLUG: Record<string, StateInfo> = Object.fromEntries(
  ALL_STATES.map((s) => [s.slug, s])
);

export const NO_INCOME_TAX_STATES = ALL_STATES.filter((s) => s.taxType === "none");
export const FLAT_TAX_STATES = ALL_STATES.filter((s) => s.taxType === "flat");
export const PROGRESSIVE_TAX_STATES = ALL_STATES.filter((s) => s.taxType === "progressive");
