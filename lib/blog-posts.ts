export type BlogPostMeta = {
  slug: string;
  /** Page title string fed into "%s | TakeHomeUSA" — keep ≤ 46 chars */
  metaTitle: string;
  /** Full display title shown on the page */
  title: string;
  /** 140–155 chars for meta description */
  description: string;
  /** ISO date string */
  date: string;
  readTime: number;
  category: "State Guides" | "Tax Guides" | "Salary Guides";
  /** 1–2 sentences for blog index cards */
  excerpt: string;
};

export const BLOG_POSTS: BlogPostMeta[] = [
  {
    slug: "states-with-no-income-tax",
    metaTitle: "9 States With No Income Tax (2026 Guide)",
    title: "9 States With No Income Tax: What You Actually Keep in 2026",
    description:
      "Nine states charge $0 state income tax on wages in 2026. See real take-home pay at $75K and $100K in Alaska, Florida, Nevada, Texas, Washington, Wyoming and more.",
    date: "2026-01-20",
    readTime: 6,
    category: "State Guides",
    excerpt:
      "Nine US states charge zero state income tax on wages. See exactly what workers keep in each — with real 2026 numbers at $75K and $100K salaries.",
  },
  {
    slug: "federal-tax-brackets-2026",
    metaTitle: "2026 Federal Tax Brackets — Complete Guide",
    title: "2026 Federal Tax Brackets: A Plain-English Guide",
    description:
      "2026 IRS tax brackets adjusted for inflation. Standard deduction $16,100 (single). Step-by-step: a $100K earner pays 13.2% effective federal rate, not 22%. Free calculator.",
    date: "2026-01-15",
    readTime: 7,
    category: "Tax Guides",
    excerpt:
      "The IRS adjusts tax brackets for inflation every year. Here's what changed for 2026 — with a step-by-step $100K example and the most common misconceptions explained.",
  },
  {
    slug: "100k-salary-after-taxes-all-states",
    metaTitle: "$100K After Taxes — All 50 States (2026)",
    title: "$100,000 Salary After Taxes in Every State — 2026 Rankings",
    description:
      "How much is $100,000 after taxes? Best state: $79,180/yr. Worst state: under $65,000. See all 50 states ranked by take-home pay with monthly amounts — 2026 IRS brackets.",
    date: "2026-02-01",
    readTime: 5,
    category: "Salary Guides",
    excerpt:
      "Where you live matters more than your raise. On a $100K salary, the best state pays over $14,000/year more take-home than the worst. See all 50 states ranked.",
  },
  {
    slug: "texas-vs-california-taxes-2026",
    metaTitle: "Texas vs California After-Tax Pay (2026)",
    title: "Texas vs California: Exact Take-Home Pay Differences in 2026",
    description:
      "Texas has no state income tax; California has rates up to 13.3%. See the exact take-home pay gap at $50K, $75K, $100K, $150K, and $200K salaries for 2026.",
    date: "2026-02-15",
    readTime: 6,
    category: "State Guides",
    excerpt:
      "The Texas vs California take-home pay debate settled with real math. See the exact dollar difference at 5 salary levels — and what it means for relocation.",
  },
];

export function getPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
