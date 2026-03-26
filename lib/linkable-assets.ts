/**
 * Linkable Assets Registry — TakeHomeUSA
 *
 * Central config of the site's strongest outreach-worthy assets.
 * Used to generate "Resources" sections, outreach copy, and press pages.
 */

export interface LinkableAsset {
  title: string;
  url: string;
  description: string;
  /** One-liner pitch for use in outreach emails / partner pages */
  outreachPitch: string;
  /** Who should link to this */
  targetAudience: string[];
  category: "calculator" | "data" | "guide" | "comparison" | "embed" | "methodology";
}

export const LINKABLE_ASSETS: LinkableAsset[] = [
  // ── CALCULATORS ──────────────────────────────────────────────────────────────
  {
    title: "Free Paycheck Calculator — All 50 States (2026)",
    url: "https://www.takehomeusa.com/",
    description:
      "Enter any salary and see exact take-home pay after federal, state, and FICA taxes. Supports all 50 states with 2026 IRS brackets. Instant, free, no signup.",
    outreachPitch:
      "A free, no-signup salary after-tax calculator covering all 50 US states — useful for anyone writing about salaries, relocation, or personal finance.",
    targetAudience: ["finance bloggers", "HR sites", "relocation writers", "career sites", "Reddit personal finance"],
    category: "calculator",
  },
  {
    title: "Texas Salary After-Tax Calculator 2026",
    url: "https://www.takehomeusa.com/texas",
    description:
      "Texas has no state income tax. See exactly how much of your salary you keep — $100K → $79,180/yr. Granular $1K steps from $20K to $500K.",
    outreachPitch:
      "Texas take-home pay calculator with $1K salary granularity — every salary from $20K to $500K pre-computed with 2026 IRS data.",
    targetAudience: ["Texas relocation writers", "remote work guides", "salary negotiation content"],
    category: "calculator",
  },
  {
    title: "California Salary After-Tax Calculator 2026",
    url: "https://www.takehomeusa.com/california",
    description:
      "California has the highest state income tax in the US at up to 13.3%. See exactly how much you keep on any salary.",
    outreachPitch:
      "California salary calculator — shows how the 13.3% top state rate affects real take-home pay for any income level.",
    targetAudience: ["CA cost-of-living writers", "salary comparison content", "relocation from CA content"],
    category: "calculator",
  },

  // ── DATA PAGES ───────────────────────────────────────────────────────────────
  {
    title: "$100K Salary After Taxes — All 50 States (2026)",
    url: "https://www.takehomeusa.com/after-tax/100000-a-year-after-tax",
    description:
      "How much does $100,000 take home in each US state? Full table from best (Wyoming $79,180) to worst (California $71,760). Includes monthly breakdown and state tax comparison.",
    outreachPitch:
      "A ranked table of $100K take-home pay across all 50 US states — frequently referenced in salary negotiation and relocation articles.",
    targetAudience: ["salary comparison writers", "HR content sites", "relocation guides", "Reddit finance"],
    category: "data",
  },
  {
    title: "Salary After Taxes — All 50 States Data Hub",
    url: "https://www.takehomeusa.com/data",
    description:
      "Pre-computed take-home pay tables for popular salary levels — $50K, $75K, $100K, $150K, $200K — ranked by state. Includes state tax penalty rankings and 10-year savings differences.",
    outreachPitch:
      "A journalist-friendly data hub with ranked take-home pay tables across all 50 states at multiple salary levels. Free to cite and share.",
    targetAudience: ["journalists", "bloggers", "researchers", "podcast writers"],
    category: "data",
  },
  {
    title: "No Income Tax States 2026 — Complete Guide",
    url: "https://www.takehomeusa.com/blog/states-with-no-income-tax",
    description:
      "All 9 no-income-tax states explained — how much more you keep, eligibility rules, and salary-level comparisons.",
    outreachPitch:
      "A reference guide to the 9 states with no income tax — with specific dollar amounts showing how much more you keep at each income level.",
    targetAudience: ["relocation writers", "tax guides", "financial independence content", "nomad/remote work sites"],
    category: "guide",
  },

  // ── COMPARISON PAGES ─────────────────────────────────────────────────────────
  {
    title: "Texas vs California Taxes 2026 — Take-Home Pay Compared",
    url: "https://www.takehomeusa.com/compare/texas-vs-california",
    description:
      "Side-by-side: Texas vs California take-home pay at $50K–$200K. Texas keeps $7,420 more on $100K. Full breakdown of tax gap.",
    outreachPitch:
      "The Texas vs California tax comparison people search most — with exact dollar differences at every major salary level.",
    targetAudience: ["CA-to-TX relocation writers", "remote work content", "personal finance bloggers"],
    category: "comparison",
  },
  {
    title: "State Tax Comparison Tool",
    url: "https://www.takehomeusa.com/compare",
    description:
      "Pick any two US states and instantly compare take-home pay side by side at any salary level. 400+ pre-computed state pairs available.",
    outreachPitch:
      "An interactive state tax comparison tool — useful for any article about moving between states for salary or tax reasons.",
    targetAudience: ["relocation sites", "HR sites", "career content", "finance blogs"],
    category: "comparison",
  },

  // ── EMBED ────────────────────────────────────────────────────────────────────
  {
    title: "Embeddable Salary Calculator Widget",
    url: "https://www.takehomeusa.com/embed",
    description:
      "Free embeddable salary after-tax widgets for blogs, HR sites, and relocation pages. Clean iframe code with attribution back to TakeHomeUSA.",
    outreachPitch:
      "Free embeddable paycheck calculator widget — drop one line of iframe code and your readers get a full salary after-tax tool.",
    targetAudience: ["HR sites", "relocation bloggers", "finance publishers", "career content"],
    category: "embed",
  },

  // ── METHODOLOGY ──────────────────────────────────────────────────────────────
  {
    title: "Methodology — How TakeHomeUSA Calculates Take-Home Pay",
    url: "https://www.takehomeusa.com/methodology",
    description:
      "Full technical explanation of the tax calculation engine: federal brackets, state tax rules, FICA, standard deduction, and assumptions. Updated for 2026 IRS data.",
    outreachPitch:
      "A transparent, detailed methodology page explaining every assumption behind our calculations — useful for journalists who need to cite their data sources accurately.",
    targetAudience: ["journalists", "academic references", "researchers", "tax professionals"],
    category: "methodology",
  },

  // ── GUIDES ───────────────────────────────────────────────────────────────────
  {
    title: "Best States for Take-Home Pay — Relocation Guide 2026",
    url: "https://www.takehomeusa.com/relocate",
    description:
      "Which US state maximizes your salary? See take-home pay rankings across all 50 states, salary-level breakdowns, and the real cost of high-tax states.",
    outreachPitch:
      "A data-backed guide to which US states maximize take-home pay — useful for remote worker, relocation, and financial independence content.",
    targetAudience: ["relocation writers", "remote work guides", "financial independence blogs", "FIRE community"],
    category: "guide",
  },
  {
    title: "Federal Tax Brackets 2026 — Complete Guide",
    url: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026",
    description:
      "2026 IRS federal tax brackets for all filing statuses, with real-world take-home examples at common salary levels.",
    outreachPitch:
      "An accurate 2026 federal tax bracket reference with real-world take-home examples — easier to cite than the raw IRS publication.",
    targetAudience: ["tax guides", "personal finance writers", "HR content"],
    category: "guide",
  },
];

/** Assets most suitable for outreach to journalists/media */
export const PRESS_ASSETS = LINKABLE_ASSETS.filter((a) =>
  ["data", "methodology", "guide"].includes(a.category)
);

/** Assets most suitable for embedding by other sites */
export const EMBED_ASSETS = LINKABLE_ASSETS.filter((a) =>
  ["embed", "calculator", "comparison"].includes(a.category)
);

/** Top 6 assets for homepage "Resources" section */
export const TOP_FEATURED_ASSETS = LINKABLE_ASSETS.slice(0, 6);

/** Boilerplate citation language for press/outreach use */
export const CITATION_BOILERPLATE = {
  short: "TakeHomeUSA (takehomeusa.com)",
  standard: "According to TakeHomeUSA (takehomeusa.com), a free salary after-tax calculator covering all 50 US states using 2026 IRS tax brackets.",
  academic: `TakeHomeUSA. (2026). Salary After-Tax Calculator [Online Tool]. Retrieved from https://www.takehomeusa.com. Data based on 2026 IRS Rev. Proc. 2025-32 tax brackets.`,
};
