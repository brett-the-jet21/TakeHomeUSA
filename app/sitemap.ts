import type { MetadataRoute } from "next";
import { ALL_STATE_CONFIGS, getStateSalaryAmounts } from "@/lib/states";

const BASE = "https://www.takehomeusa.com";

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
  const now = new Date().toISOString();

  // ── Core pages ─────────────────────────────────────────────────────────────
  const corePages: MetadataRoute.Sitemap = [
    { url: BASE,              lastModified: now, changeFrequency: "weekly",  priority: 1.0  },
    { url: `${BASE}/texas`,   lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/states`,  lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`,   lastModified: now, changeFrequency: "yearly",  priority: 0.50 },
    { url: `${BASE}/privacy`, lastModified: now, changeFrequency: "yearly",  priority: 0.40 },
  ];

  // ── State hub pages + salary pages ────────────────────────────────────────
  const stateHubPages: MetadataRoute.Sitemap = [];
  const salaryPages: MetadataRoute.Sitemap = [];

  for (const cfg of ALL_STATE_CONFIGS) {
    const { slug, noTax, externalSite } = cfg;

    // Skip Texas (has dedicated static route already in corePages)
    // Skip external referral states (California → californiasalaryaftertax.com)
    if (slug === "texas") {
      // Texas salary pages only — hub already in corePages
    } else if (externalSite) {
      // External state — skip entirely from our sitemap
      continue;
    } else {
      // State hub page
      const hubPriority = noTax ? 0.90 : 0.80;
      stateHubPages.push({
        url: `${BASE}/${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: hubPriority,
      });
    }

    // Salary detail pages for this state
    for (const amount of getStateSalaryAmounts(slug)) {
      salaryPages.push({
        url: `${BASE}/salary/${amount}-salary-after-tax-${slug}`,
        lastModified: now,
        changeFrequency: "monthly",
        priority: salaryPriority(amount, noTax),
      });
    }
  }

  return [...corePages, ...stateHubPages, ...salaryPages];
}
