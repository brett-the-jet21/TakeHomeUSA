export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { ALL_STATE_CONFIGS, getStateSalaryAmounts } from "@/lib/states";

// Hourly rates generated in /hourly/[slug]/page.tsx
const HOURLY_RATES = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  32, 35, 38, 40, 42, 45, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100,
];

// High-priority hourly rates (min wage adjacent and round numbers)
const HIGH_PRIORITY_HOURLY = new Set([10, 12, 15, 20, 25, 30, 40, 50, 75, 100]);

// Monthly amounts generated in /monthly/[slug]/page.tsx
const MONTHLY_AMOUNTS = [
  1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 4_500,
  5_000, 5_500, 6_000, 6_500, 7_000, 7_500, 8_000, 8_500,
  9_000, 9_500, 10_000, 11_000, 12_000, 13_000, 14_000, 15_000,
  16_000, 17_000, 18_000, 19_000, 20_000,
];
const HIGH_PRIORITY_MONTHLY = new Set([3_000, 4_000, 5_000, 6_000, 7_000, 8_000, 10_000]);

// Top states for state-vs-state comparison pages
const COMPARE_STATE_SLUGS = [
  "texas", "california", "florida", "new-york", "washington",
  "nevada", "illinois", "georgia", "north-carolina", "ohio",
  "michigan", "arizona", "colorado", "virginia", "tennessee",
  "pennsylvania", "new-jersey", "massachusetts", "north-dakota", "wyoming",
];

// Salary amounts generated in /after-tax/[slug]/page.tsx
const AFTER_TAX_AMOUNTS = [
  20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000,
  55_000, 60_000, 65_000, 70_000, 75_000, 80_000, 85_000, 90_000, 95_000,
  100_000, 105_000, 110_000, 115_000, 120_000, 125_000, 130_000, 135_000,
  140_000, 145_000, 150_000, 160_000, 175_000, 200_000, 225_000, 250_000,
  300_000, 350_000, 400_000, 500_000,
];
const HIGH_PRIORITY_AFTER_TAX = new Set([
  50_000, 60_000, 65_000, 70_000, 75_000, 80_000, 90_000,
  100_000, 110_000, 120_000, 125_000, 150_000, 175_000, 200_000,
]);

const BASE = "https://www.takehomeusa.com";
const LAST_MODIFIED = "2026-01-01T00:00:00.000Z";

// Salary amounts that get traffic bumps (round numbers people search for)
const HIGH_PRIORITY_AMOUNTS = new Set([
  50_000, 60_000, 65_000, 70_000, 75_000, 80_000, 90_000,
  100_000, 110_000, 120_000, 125_000, 130_000, 150_000,
  175_000, 200_000, 250_000, 300_000,
]);
const MED_PRIORITY_AMOUNTS = new Set([
  55_000, 85_000, 95_000, 115_000, 140_000, 160_000, 225_000,
]);

function salaryPriority(amount: number, isNoTax: boolean): number {
  const base = isNoTax ? 0.05 : 0;
  if (HIGH_PRIORITY_AMOUNTS.has(amount)) return 0.88 + base;
  if (MED_PRIORITY_AMOUNTS.has(amount)) return 0.72 + base;
  if (amount % 10_000 === 0) return 0.65 + base;
  if (amount % 5_000 === 0) return 0.60 + base;
  return 0.55; // $1K steps (Texas only)
}

export default function sitemap(): MetadataRoute.Sitemap {
  // ── Core pages ─────────────────────────────────────────────────────────────
  const corePages: MetadataRoute.Sitemap = [
    { url: BASE,               lastModified: LAST_MODIFIED, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/texas`,    lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/states`,   lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/compare`,  lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.82 },
    { url: `${BASE}/about`,    lastModified: LAST_MODIFIED, changeFrequency: "yearly",  priority: 0.50 },
    { url: `${BASE}/privacy`,  lastModified: LAST_MODIFIED, changeFrequency: "yearly",  priority: 0.40 },
  ];

  // ── State hub pages + salary pages ────────────────────────────────────────
  const stateHubPages: MetadataRoute.Sitemap = [];
  const salaryPages: MetadataRoute.Sitemap = [];

  for (const cfg of ALL_STATE_CONFIGS) {
    const { slug, noTax } = cfg;

    // Skip Texas (hub already in corePages above)
    if (slug !== "texas") {
      const hubPriority = noTax ? 0.90 : 0.80;
      stateHubPages.push({
        url: `${BASE}/${slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: hubPriority,
      });
    }

    // Salary detail pages for this state
    for (const amount of getStateSalaryAmounts(slug)) {
      salaryPages.push({
        url: `${BASE}/salary/${amount}-salary-after-tax-${slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: salaryPriority(amount, noTax),
      });
    }
  }

  // ── Hourly wage pages ─────────────────────────────────────────────────────
  const hourlyPages: MetadataRoute.Sitemap = [];
  for (const rate of HOURLY_RATES) {
    const isHighPriority = HIGH_PRIORITY_HOURLY.has(rate);
    for (const cfg of ALL_STATE_CONFIGS) {
      hourlyPages.push({
        url: `${BASE}/hourly/${rate}-an-hour-after-tax-${cfg.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: isHighPriority ? (cfg.noTax ? 0.78 : 0.72) : 0.60,
      });
    }
  }

  // ── After-tax all-states comparison pages ─────────────────────────────────
  const afterTaxPages: MetadataRoute.Sitemap = AFTER_TAX_AMOUNTS.map((amount) => ({
    url: `${BASE}/after-tax/${amount}-a-year-after-tax`,
    lastModified: LAST_MODIFIED,
    changeFrequency: "monthly" as const,
    priority: HIGH_PRIORITY_AFTER_TAX.has(amount) ? 0.85 : 0.70,
  }));

  // ── Monthly salary pages ───────────────────────────────────────────────────
  const monthlyPages: MetadataRoute.Sitemap = [];
  for (const monthly of MONTHLY_AMOUNTS) {
    const isHigh = HIGH_PRIORITY_MONTHLY.has(monthly);
    for (const cfg of ALL_STATE_CONFIGS) {
      monthlyPages.push({
        url: `${BASE}/monthly/${monthly}-a-month-after-tax-${cfg.slug}`,
        lastModified: LAST_MODIFIED,
        changeFrequency: "monthly",
        priority: isHigh ? (cfg.noTax ? 0.78 : 0.72) : 0.60,
      });
    }
  }

  // ── Blog pages ────────────────────────────────────────────────────────────
  const blogPages: MetadataRoute.Sitemap = [
    { url: `${BASE}/blog`,                                          lastModified: LAST_MODIFIED, changeFrequency: "weekly",  priority: 0.80 },
    { url: `${BASE}/blog/states-with-no-income-tax`,               lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/federal-tax-brackets-2026`,               lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/100k-salary-after-taxes-all-states`,      lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/texas-vs-california-taxes-2026`,          lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.75 },
  ];

  // ── State-vs-state comparison pages ──────────────────────────────────────
  const comparePages: MetadataRoute.Sitemap = [];
  for (const s1 of COMPARE_STATE_SLUGS) {
    for (const s2 of COMPARE_STATE_SLUGS) {
      if (s1 !== s2) {
        const isHighValuePair =
          (s1 === "texas" || s1 === "california" || s1 === "florida" || s1 === "new-york") &&
          (s2 === "texas" || s2 === "california" || s2 === "florida" || s2 === "new-york");
        comparePages.push({
          url: `${BASE}/compare/${s1}-vs-${s2}`,
          lastModified: LAST_MODIFIED,
          changeFrequency: "monthly",
          priority: isHighValuePair ? 0.82 : 0.68,
        });
      }
    }
  }

  return [...corePages, ...blogPages, ...stateHubPages, ...salaryPages, ...hourlyPages, ...afterTaxPages, ...monthlyPages, ...comparePages];
}
