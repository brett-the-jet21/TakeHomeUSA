import type { MetadataRoute } from "next";
import { getTexasSalaryAmounts } from "@/lib/tax";

const BASE = "https://www.takehomeusa.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date().toISOString();
  const amounts = getTexasSalaryAmounts(); // $20K–$500K in $1K steps

  const salaryPages: MetadataRoute.Sitemap = amounts.map((amount) => ({
    url: `${BASE}/salary/${amount}-salary-after-tax-texas`,
    lastModified: now,
    changeFrequency: "monthly",
    // Boost priority for round-number amounts that get more search traffic
    priority: amount % 10_000 === 0 ? 0.9 : amount % 5_000 === 0 ? 0.8 : 0.7,
  }));

  return [
    // ── Core pages ──────────────────────────────────────────────────────────
    { url: BASE,                         lastModified: now, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE}/texas`,              lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${BASE}/states`,             lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/about`,              lastModified: now, changeFrequency: "yearly",  priority: 0.5 },
    { url: `${BASE}/privacy`,            lastModified: now, changeFrequency: "yearly",  priority: 0.4 },
    // ── State preview pages (coming soon — still indexable) ─────────────────
    { url: `${BASE}/california`,         lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/florida`,            lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/new-york`,           lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    // ── Texas salary pages ───────────────────────────────────────────────────
    ...salaryPages,
  ];
}
