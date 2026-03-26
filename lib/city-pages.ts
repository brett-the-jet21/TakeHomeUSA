/**
 * City page configurations for /salary/[amount]-salary-after-tax-[city] routes.
 *
 * 20 cities × 5 salary amounts = 100 static pages.
 *
 * cityTaxSlug: if set, maps to a CityTaxConfig slug in lib/cities.ts.
 *              For cities with local income tax (NYC, Philadelphia, Portland).
 */

export interface CityPageConfig {
  /** Display name, e.g. "Austin, TX" */
  name: string;
  /** URL slug, e.g. "austin-tx" */
  slug: string;
  /** State slug from STATE_BY_SLUG, e.g. "texas" */
  stateSlug: string;
  /** Short state abbreviation for display, e.g. "TX" */
  abbr: string;
  /** If this city has local income tax, the slug key in CITY_BY_SLUG */
  cityTaxSlug?: string;
}

export const CITY_PAGE_CONFIGS: CityPageConfig[] = [
  { name: "New York, NY",      slug: "new-york-ny",      stateSlug: "new-york",        abbr: "NY", cityTaxSlug: "new-york-city" },
  { name: "Los Angeles, CA",   slug: "los-angeles-ca",   stateSlug: "california",      abbr: "CA" },
  { name: "Chicago, IL",       slug: "chicago-il",       stateSlug: "illinois",        abbr: "IL" },
  { name: "Houston, TX",       slug: "houston-tx",       stateSlug: "texas",           abbr: "TX" },
  { name: "Phoenix, AZ",       slug: "phoenix-az",       stateSlug: "arizona",         abbr: "AZ" },
  { name: "Philadelphia, PA",  slug: "philadelphia-pa",  stateSlug: "pennsylvania",    abbr: "PA", cityTaxSlug: "philadelphia" },
  { name: "San Antonio, TX",   slug: "san-antonio-tx",   stateSlug: "texas",           abbr: "TX" },
  { name: "San Diego, CA",     slug: "san-diego-ca",     stateSlug: "california",      abbr: "CA" },
  { name: "Dallas, TX",        slug: "dallas-tx",        stateSlug: "texas",           abbr: "TX" },
  { name: "Austin, TX",        slug: "austin-tx",        stateSlug: "texas",           abbr: "TX" },
  { name: "San Jose, CA",      slug: "san-jose-ca",      stateSlug: "california",      abbr: "CA" },
  { name: "Seattle, WA",       slug: "seattle-wa",       stateSlug: "washington",      abbr: "WA" },
  { name: "Denver, CO",        slug: "denver-co",        stateSlug: "colorado",        abbr: "CO" },
  { name: "Boston, MA",        slug: "boston-ma",        stateSlug: "massachusetts",   abbr: "MA" },
  { name: "Miami, FL",         slug: "miami-fl",         stateSlug: "florida",         abbr: "FL" },
  { name: "Atlanta, GA",       slug: "atlanta-ga",       stateSlug: "georgia",         abbr: "GA" },
  { name: "Portland, OR",      slug: "portland-or",      stateSlug: "oregon",          abbr: "OR", cityTaxSlug: "portland" },
  { name: "Las Vegas, NV",     slug: "las-vegas-nv",     stateSlug: "nevada",          abbr: "NV" },
  { name: "Minneapolis, MN",   slug: "minneapolis-mn",   stateSlug: "minnesota",       abbr: "MN" },
  { name: "Nashville, TN",     slug: "nashville-tn",     stateSlug: "tennessee",       abbr: "TN" },
];

export const CITY_BY_PAGE_SLUG = new Map(
  CITY_PAGE_CONFIGS.map((c) => [c.slug, c])
);

/** Salary amounts to generate city pages for */
export const CITY_SALARY_AMOUNTS = [50_000, 75_000, 100_000, 125_000, 150_000];
