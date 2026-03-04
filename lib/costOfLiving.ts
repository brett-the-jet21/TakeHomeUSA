// ─── Cost of Living Estimates ─────────────────────────────────────────────────
// Monthly estimates for a single person in a mid-size city / suburban area.
// Source: BLS Consumer Expenditure Survey 2024, Numbeo, Rentdata.org.
// These are editorial approximations — not official government figures.

export interface ColData {
  /** Average monthly rent for a 1-bedroom apartment (mid-range area) */
  rent: number;
  /** Monthly grocery cost for a single person */
  groceries: number;
  /** Monthly transportation (gas + insurance or transit pass) */
  transport: number;
  /** Monthly utilities estimate (electric, gas, internet) */
  utilities: number;
  /** Short descriptor for the state's COL tier */
  tier: "low" | "below-avg" | "average" | "above-avg" | "high" | "very-high";
}

// Monthly cost-of-living estimates by state slug
export const COST_OF_LIVING: Record<string, ColData> = {
  "alabama":        { rent: 950,  groceries: 310, transport: 340, utilities: 160, tier: "low" },
  "alaska":         { rent: 1450, groceries: 440, transport: 380, utilities: 280, tier: "high" },
  "arizona":        { rent: 1300, groceries: 360, transport: 370, utilities: 170, tier: "average" },
  "arkansas":       { rent: 850,  groceries: 300, transport: 330, utilities: 155, tier: "low" },
  "california":     { rent: 2200, groceries: 430, transport: 420, utilities: 220, tier: "very-high" },
  "colorado":       { rent: 1700, groceries: 390, transport: 380, utilities: 180, tier: "above-avg" },
  "connecticut":    { rent: 1800, groceries: 410, transport: 370, utilities: 210, tier: "high" },
  "delaware":       { rent: 1350, groceries: 370, transport: 340, utilities: 185, tier: "average" },
  "florida":        { rent: 1650, groceries: 375, transport: 390, utilities: 200, tier: "above-avg" },
  "georgia":        { rent: 1350, groceries: 355, transport: 365, utilities: 175, tier: "average" },
  "hawaii":         { rent: 2400, groceries: 510, transport: 390, utilities: 240, tier: "very-high" },
  "idaho":          { rent: 1100, groceries: 340, transport: 350, utilities: 155, tier: "below-avg" },
  "illinois":       { rent: 1450, groceries: 370, transport: 370, utilities: 185, tier: "above-avg" },
  "indiana":        { rent: 950,  groceries: 320, transport: 340, utilities: 155, tier: "low" },
  "iowa":           { rent: 900,  groceries: 315, transport: 335, utilities: 150, tier: "low" },
  "kansas":         { rent: 900,  groceries: 315, transport: 335, utilities: 155, tier: "low" },
  "kentucky":       { rent: 900,  groceries: 305, transport: 325, utilities: 155, tier: "low" },
  "louisiana":      { rent: 1000, groceries: 320, transport: 350, utilities: 175, tier: "below-avg" },
  "maine":          { rent: 1300, groceries: 375, transport: 345, utilities: 195, tier: "average" },
  "maryland":       { rent: 1800, groceries: 400, transport: 380, utilities: 200, tier: "high" },
  "massachusetts":  { rent: 2100, groceries: 420, transport: 370, utilities: 215, tier: "very-high" },
  "michigan":       { rent: 1050, groceries: 330, transport: 350, utilities: 165, tier: "below-avg" },
  "minnesota":      { rent: 1250, groceries: 360, transport: 355, utilities: 175, tier: "average" },
  "mississippi":    { rent: 800,  groceries: 290, transport: 315, utilities: 150, tier: "low" },
  "missouri":       { rent: 1000, groceries: 325, transport: 340, utilities: 160, tier: "below-avg" },
  "montana":        { rent: 1150, groceries: 355, transport: 355, utilities: 160, tier: "below-avg" },
  "nebraska":       { rent: 950,  groceries: 320, transport: 335, utilities: 155, tier: "low" },
  "nevada":         { rent: 1450, groceries: 370, transport: 390, utilities: 180, tier: "average" },
  "new-hampshire":  { rent: 1550, groceries: 390, transport: 355, utilities: 195, tier: "above-avg" },
  "new-jersey":     { rent: 1950, groceries: 415, transport: 375, utilities: 215, tier: "high" },
  "new-mexico":     { rent: 1050, groceries: 335, transport: 345, utilities: 160, tier: "below-avg" },
  "new-york":       { rent: 2400, groceries: 450, transport: 130, utilities: 210, tier: "very-high" },
  "north-carolina": { rent: 1250, groceries: 355, transport: 360, utilities: 165, tier: "average" },
  "north-dakota":   { rent: 900,  groceries: 320, transport: 340, utilities: 155, tier: "low" },
  "ohio":           { rent: 950,  groceries: 325, transport: 345, utilities: 160, tier: "low" },
  "oklahoma":       { rent: 900,  groceries: 315, transport: 340, utilities: 160, tier: "low" },
  "oregon":         { rent: 1550, groceries: 390, transport: 360, utilities: 185, tier: "above-avg" },
  "pennsylvania":   { rent: 1200, groceries: 360, transport: 350, utilities: 175, tier: "average" },
  "rhode-island":   { rent: 1600, groceries: 395, transport: 355, utilities: 200, tier: "above-avg" },
  "south-carolina": { rent: 1100, groceries: 335, transport: 350, utilities: 165, tier: "below-avg" },
  "south-dakota":   { rent: 900,  groceries: 310, transport: 340, utilities: 155, tier: "low" },
  "tennessee":      { rent: 1200, groceries: 340, transport: 360, utilities: 170, tier: "below-avg" },
  "texas":          { rent: 1350, groceries: 360, transport: 385, utilities: 185, tier: "average" },
  "utah":           { rent: 1350, groceries: 360, transport: 360, utilities: 170, tier: "average" },
  "vermont":        { rent: 1350, groceries: 385, transport: 340, utilities: 195, tier: "average" },
  "virginia":       { rent: 1600, groceries: 385, transport: 370, utilities: 185, tier: "above-avg" },
  "washington":     { rent: 1900, groceries: 410, transport: 390, utilities: 195, tier: "high" },
  "west-virginia":  { rent: 750,  groceries: 295, transport: 315, utilities: 150, tier: "low" },
  "wisconsin":      { rent: 1000, groceries: 330, transport: 345, utilities: 160, tier: "below-avg" },
  "wyoming":        { rent: 950,  groceries: 325, transport: 345, utilities: 160, tier: "low" },
};

export const COL_TIER_LABEL: Record<ColData["tier"], string> = {
  "low":        "Low Cost of Living",
  "below-avg":  "Below Average",
  "average":    "Average Cost of Living",
  "above-avg":  "Above Average",
  "high":       "High Cost of Living",
  "very-high":  "Very High Cost of Living",
};

export const COL_TIER_COLOR: Record<ColData["tier"], string> = {
  "low":        "text-green-700 bg-green-50 border-green-200",
  "below-avg":  "text-teal-700 bg-teal-50 border-teal-200",
  "average":    "text-blue-700 bg-blue-50 border-blue-200",
  "above-avg":  "text-amber-700 bg-amber-50 border-amber-200",
  "high":       "text-orange-700 bg-orange-50 border-orange-200",
  "very-high":  "text-red-700 bg-red-50 border-red-200",
};
