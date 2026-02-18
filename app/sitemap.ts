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
    priority: amount % 10_000 === 0 ? 0.9 : amount % 5_000 === 0 ? 0.8 : 0.7,
  }));

  return [
    {
      url: BASE,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1.0,
    },
    ...salaryPages,
  ];
}
