export const dynamic = "force-static";

import type { MetadataRoute } from "next";
import { ALL_STATE_CONFIGS, getStateSalaryAmounts } from "@/lib/states";

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
    { url: BASE,              lastModified: LAST_MODIFIED, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/texas`,   lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/states`,  lastModified: LAST_MODIFIED, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`,   lastModified: LAST_MODIFIED, changeFrequency: "yearly",  priority: 0.50 },
    { url: `${BASE}/privacy`, lastModified: LAST_MODIFIED, changeFrequency: "yearly",  priority: 0.40 },
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

  return [...corePages, ...stateHubPages, ...salaryPages];
}
