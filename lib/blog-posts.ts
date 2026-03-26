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
  {
    slug: "80000-salary-after-taxes",
    metaTitle: "Is $80,000 a Good Salary After Taxes?",
    title: "Is $80,000 a Good Salary? What It Really Means After Taxes",
    description:
      "Is $80K a good salary? After federal and state taxes your actual take-home ranges from $57,700 in California to $63,300 in Texas. See what $80K really means in 2026.",
    date: "2026-03-01",
    readTime: 6,
    category: "Salary Guides",
    excerpt:
      "The number on your offer letter isn't what lands in your bank account. Here's what $80,000 actually means after taxes — and whether it's good depends heavily on where you live.",
  },
  {
    slug: "moving-california-to-texas",
    metaTitle: "California to Texas: Real Tax Savings (2026)",
    title: "Moving from California to Texas: The Real Tax Savings",
    description:
      "Moving from California to Texas can save $8,000–$22,000/year in taxes depending on income. See the exact numbers at $75K, $100K, $150K, and $200K for 2026.",
    date: "2026-03-05",
    readTime: 7,
    category: "State Guides",
    excerpt:
      "Thousands of Californians move to Texas every year. Here's the honest math: how much you actually save in taxes at different income levels — and what the tradeoffs are.",
  },
  {
    slug: "afford-rent-nyc-salary",
    metaTitle: "Salary Needed to Afford Rent in NYC (2026)",
    title: "How Much Do You Need to Make to Afford Rent in NYC?",
    description:
      "The 30% rule means you need $100,000+ to comfortably afford average NYC rent after taxes. See the exact salary needed at different rent levels in 2026.",
    date: "2026-03-08",
    readTime: 6,
    category: "Salary Guides",
    excerpt:
      "NYC is one of the most expensive cities on earth — and that's before accounting for New York state taxes. Here's the gross salary you actually need for different rent levels.",
  },
  {
    slug: "good-salary-by-state-2026",
    metaTitle: "What Is a Good Salary in Each State? (2026)",
    title: "What Is a Good Salary in Each State in 2026?",
    description:
      "A good salary varies wildly by state: $70K is comfortable in Iowa, tight in California. See take-home pay benchmarks and cost-of-living context for all 50 states.",
    date: "2026-03-10",
    readTime: 8,
    category: "Salary Guides",
    excerpt:
      "What counts as a good salary depends entirely on where you live. We looked at median incomes, take-home pay, and cost of living to benchmark every state in 2026.",
  },
  {
    slug: "how-to-read-pay-stub",
    metaTitle: "How to Read Your Pay Stub (Plain-English Guide)",
    title: "How to Read Your Pay Stub: A Plain-English Guide",
    description:
      "Confused by your pay stub? This guide explains every line: gross pay, federal withholding, state tax, Social Security, Medicare, and net pay — with plain-English examples.",
    date: "2026-03-12",
    readTime: 5,
    category: "Tax Guides",
    excerpt:
      "Your pay stub is full of acronyms and deductions that most people never bother to understand. This guide explains every single line — so you can verify you're being paid correctly.",
  },
  {
    slug: "w4-form-guide-withholding",
    metaTitle: "W-4 Form: How to Fill It Out for 2026",
    title: "W-4 Changes: How to Fill It Out to Get the Right Withholding",
    description:
      "The W-4 form changed in 2020. Learn how to fill it out correctly in 2026 to avoid a big tax bill or a huge refund — with step-by-step instructions for common situations.",
    date: "2026-03-14",
    readTime: 7,
    category: "Tax Guides",
    excerpt:
      "The W-4 form was completely redesigned in 2020 — and most people still fill it out wrong. Here's how to do it correctly to get the right amount withheld from each paycheck.",
  },
  {
    slug: "salary-vs-hourly-after-taxes",
    metaTitle: "Salary vs Hourly: Which Pays More After Taxes?",
    title: "Salary vs. Hourly: Which Is Better After Taxes?",
    description:
      "Salary and hourly jobs can pay the same before taxes but differ after. Learn how overtime, FICA, and benefits affect real take-home pay — with 2026 calculations.",
    date: "2026-03-16",
    readTime: 6,
    category: "Salary Guides",
    excerpt:
      "A $75,000 salary and a $36/hour job might look identical at first glance — but the tax treatment, overtime rules, and benefits can make a big difference to your real take-home.",
  },
  {
    slug: "austin-vs-san-francisco-cost",
    metaTitle: "Austin vs San Francisco: Cost of Living 2026",
    title: "The True Cost of Living in Austin vs. San Francisco",
    description:
      "Austin vs San Francisco: TX residents on $100K keep $14,000 more/year than CA residents before accounting for housing. See the full financial picture for 2026.",
    date: "2026-03-18",
    readTime: 7,
    category: "State Guides",
    excerpt:
      "Austin has been called 'the new San Francisco' — but the financial reality is very different. Here's a side-by-side of taxes, housing, and what each city actually costs you.",
  },
];

export function getPostMeta(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
