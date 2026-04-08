export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS, getStateSalaryAmounts } from "@/lib/states";
import { CITY_BY_PAGE_SLUG, CITY_SALARY_AMOUNTS } from "@/lib/city-pages";
import { CITY_BY_SLUG, calcCityTax } from "@/lib/cities";
import SalaryCalculator from "./SalaryCalculator";

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

// ─── Slug Parser ──────────────────────────────────────────────────────────────
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const amount = Number(m[1]);
  const locationSlug = m[2];
  if (!Number.isFinite(amount) || amount < 1_000 || amount > 100_000_000_000_000) return null;

  // Try state lookup first
  const stateConfig = STATE_BY_SLUG.get(locationSlug);
  if (stateConfig) return { amount, stateSlug: locationSlug, stateConfig, cityConfig: null };

  // Fall back to city lookup
  const cityConfig = CITY_BY_PAGE_SLUG.get(locationSlug);
  if (cityConfig) {
    const cityStateConfig = STATE_BY_SLUG.get(cityConfig.stateSlug);
    if (!cityStateConfig) return null;
    return { amount, stateSlug: cityConfig.stateSlug, stateConfig: cityStateConfig, cityConfig };
  }

  return null;
}

// ─── Static Generation: Round-number salaries × 50 states + 20 cities ──────
// 23 round-number amounts × 50 states = 1,150 pages
// 20 cities × 5 amounts = 100 pages → total ≈ 1,250 pages
// dynamicParams = true so any other valid URL renders on-demand (no 404)
const STATIC_SALARY_AMOUNTS = [
  20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000,
  60_000, 70_000, 75_000, 80_000, 90_000, 100_000,
  110_000, 120_000, 125_000, 150_000, 175_000, 200_000,
  250_000, 300_000, 400_000, 500_000,
];

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const [stateSlug] of STATE_BY_SLUG) {
    for (const amount of STATIC_SALARY_AMOUNTS) {
      params.push({ slug: `${amount}-salary-after-tax-${stateSlug}` });
    }
  }
  for (const [citySlug] of CITY_BY_PAGE_SLUG) {
    for (const amount of CITY_SALARY_AMOUNTS) {
      params.push({ slug: `${amount}-salary-after-tax-${citySlug}` });
    }
  }
  return params;
}

// ─── Per-Page SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { amount, stateConfig, cityConfig } = parsed;
  const { name: stateName, noTax } = stateConfig;
  const displayName = cityConfig ? cityConfig.name : stateName;
  const baseTaxMeta = calculateTax(stateConfig, amount);
  const cityTaxAmtMeta = cityConfig?.cityTaxSlug ? calcCityTax(CITY_BY_SLUG.get(cityConfig.cityTaxSlug)!, amount) : 0;
  const takeHomeMeta = baseTaxMeta.takeHome - cityTaxAmtMeta;
  const amtFmt = amount.toLocaleString("en-US");
  const moFmt = Math.round(takeHomeMeta / 12).toLocaleString("en-US");

  const kAmount = amount % 1000 === 0 ? `${amount / 1000}k` : `${(amount / 1000).toFixed(1)}k`;
  const desc = `See exactly how much of a $${amtFmt} salary you keep in ${displayName} in ${TAX_YEAR}. Free calculator. No signup. Real ${TAX_YEAR} IRS tax brackets.`;

  return {
    title: `$${kAmount} in ${displayName} After Tax ${TAX_YEAR} — Instant Take-Home Pay Result`,
    description: desc,
    alternates: {
      canonical: `https://www.takehomeusa.com/salary/${slug}`,
    },
    openGraph: {
      title: `$${amtFmt} a Year After Taxes in ${displayName} = $${moFmt}/mo | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/salary/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `$${amtFmt} a Year After Taxes in ${displayName} = $${moFmt}/mo`,
      description: desc,
    },
  };
}

// ─── State-Specific Context Data ─────────────────────────────────────────────
// Median household income (US Census ACS 2023) and average rent (Zillow 2024)
// used for contextual "Is X a good salary?" and "What can you afford?" sections.
const STATE_CONTEXT: Record<string, { median: number; rent: number; majorCity: string }> = {
  california:    { median: 84_097, rent: 2_200, majorCity: "Los Angeles" },
  "new-york":    { median: 74_314, rent: 1_900, majorCity: "New York City" },
  texas:         { median: 67_321, rent: 1_350, majorCity: "Houston" },
  florida:       { median: 63_062, rent: 1_650, majorCity: "Miami" },
  washington:    { median: 84_247, rent: 1_850, majorCity: "Seattle" },
  illinois:      { median: 72_205, rent: 1_450, majorCity: "Chicago" },
  pennsylvania:  { median: 67_587, rent: 1_300, majorCity: "Philadelphia" },
  georgia:       { median: 65_030, rent: 1_450, majorCity: "Atlanta" },
  "new-jersey":  { median: 89_296, rent: 1_950, majorCity: "Newark" },
  arizona:       { median: 66_023, rent: 1_450, majorCity: "Phoenix" },
  colorado:      { median: 80_184, rent: 1_750, majorCity: "Denver" },
  nevada:        { median: 65_686, rent: 1_400, majorCity: "Las Vegas" },
  oregon:        { median: 70_084, rent: 1_550, majorCity: "Portland" },
  virginia:      { median: 80_963, rent: 1_650, majorCity: "Arlington" },
  massachusetts: { median: 89_645, rent: 2_100, majorCity: "Boston" },
  michigan:      { median: 63_498, rent: 1_100, majorCity: "Detroit" },
  ohio:          { median: 62_262, rent: 1_050, majorCity: "Columbus" },
  north_carolina:{ median: 65_458, rent: 1_350, majorCity: "Charlotte" },
};
const DEFAULT_STATE_CONTEXT = { median: 77_000, rent: 1_450, majorCity: null as string | null };

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function SalaryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { amount, stateSlug, stateConfig, cityConfig } = parsed;
  const { name: stateName, noTax, topRateDisplay, heroGradient } = stateConfig;
  const displayName = cityConfig ? cityConfig.name : stateName;
  const baseTax = calculateTax(stateConfig, amount);
  const cityTaxAmt = cityConfig?.cityTaxSlug ? calcCityTax(CITY_BY_SLUG.get(cityConfig.cityTaxSlug)!, amount) : 0;
  const tax = cityTaxAmt > 0
    ? { ...baseTax, takeHome: baseTax.takeHome - cityTaxAmt, totalTax: baseTax.totalTax + cityTaxAmt }
    : baseTax;
  const amtFmt = amount.toLocaleString("en-US");
  const monthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const weekly = tax.takeHome / 52;
  const hourly = tax.takeHome / 2080;

  // ── State-specific affordability context ──────────────────────────────────
  const stateCtxData = STATE_CONTEXT[stateSlug] ?? DEFAULT_STATE_CONTEXT;
  const stateMedian = stateCtxData.median;
  const affordableRent = Math.round(monthly * 0.3);
  const avgRent = stateCtxData.rent;
  const majorCity = stateCtxData.majorCity ?? stateName;
  const grossHourly = amount / 2080;

  // ── FAQ items (rendered visibly AND in schema) ──────────────────────────────
  const faqItems = [
    {
      q: `What is the take-home pay for a $${amtFmt} salary in ${stateName}?`,
      a: noTax
        ? `With a $${amtFmt} salary in ${stateName}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. ${stateName} has no state income tax, so your only deductions are federal income tax (${fmt(tax.federalTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`
        : `With a $${amtFmt} salary in ${stateName}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. Deductions include federal income tax (${fmt(tax.federalTax)}), ${stateName} state income tax (${fmt(tax.stateTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`,
    },
    {
      q: `What is $${amtFmt} a year per month after taxes in ${stateName}?`,
      a: `A $${amtFmt} annual salary in ${stateName} works out to ${fmt(monthly)} per month after taxes, or ${fmt(biweekly)} bi-weekly (every two weeks), or ${fmt(weekly)} per week.`,
    },
    {
      q: `Is $${amtFmt} a good salary in ${stateName}?`,
      a: `A $${amtFmt} salary in ${stateName} results in ${fmt(monthly)}/month take-home after taxes (${TAX_YEAR}). ${
        amount >= 175_000 ? "This is a top-5% US income — well above average in most states." :
        amount >= 90_000  ? "This is above the US median household income (~$77K) — comfortable in many areas." :
        amount >= 60_000  ? "This is near the US median individual income — livable in most mid-sized cities." :
                            "This is below the US median — workable in lower cost-of-living areas."
      } Your purchasing power also depends on your specific location within ${stateName}.`,
    },
    {
      q: `What taxes are taken out of a $${amtFmt} salary in ${stateName}?`,
      a: noTax
        ? `On a $${amtFmt} salary in ${stateName}, deductions are: Federal income tax ${fmt(tax.federalTax)} (${pct(tax.effectiveFederalRate)} effective, ${pct(tax.marginalRate)} marginal), Social Security ${fmt(tax.socialSecurity)} (6.2%), and Medicare ${fmt(tax.medicare)} (1.45%). ${stateName} has no state income tax. Total tax withheld: ${fmt(tax.totalTax)}.`
        : `On a $${amtFmt} salary in ${stateName}, deductions are: Federal income tax ${fmt(tax.federalTax)} (${pct(tax.effectiveFederalRate)} effective), ${stateName} state tax ${fmt(tax.stateTax)} (${pct(tax.stateTax / amount)} effective), Social Security ${fmt(tax.socialSecurity)} (6.2%), and Medicare ${fmt(tax.medicare)} (1.45%). Total tax withheld: ${fmt(tax.totalTax)}.`,
    },
    {
      q: `Does ${stateName} have a state income tax?`,
      a: noTax
        ? `No. ${stateName} is one of nine US states with zero state income tax. On a $${amtFmt} salary you pay $0 in state tax — a significant advantage over states like California (up to 13.3%) or New York (up to 10.9%).`
        : `Yes. ${stateName} has a state income tax with a top rate of ${topRateDisplay}. On a $${amtFmt} salary, your estimated ${stateName} state tax is ${fmt(tax.stateTax)} (effective state rate: ${pct(tax.stateTax / amount)}).`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${stateName}?`,
      a: `Based on a 40-hour work week (2,080 hours/year), a $${amtFmt} salary in ${stateName} works out to ${fmt(hourly)} per hour after taxes (${fmt(hourly * 8)}/day). Gross hourly rate is ${fmt(amount / 2080)}/hr.`,
    },
    {
      q: `How much is $${amtFmt} after tax in ${displayName}?`,
      a: `Use the calculator above to see your exact ${TAX_YEAR} net pay on a $${amtFmt} salary in ${displayName}, including federal tax, state tax, and FICA deductions.`,
    },
    {
      q: `What is the effective tax rate on $${amtFmt} in ${displayName}?`,
      a: `Your effective tax rate on $${amtFmt} in ${displayName} is your total tax divided by your gross income. The calculator above shows your exact effective rate for ${TAX_YEAR}.`,
    },
    {
      q: `How much is $${amtFmt}/year per hour before taxes in ${displayName}?`,
      a: `$${amtFmt} ÷ 2,080 annual work hours = $${grossHourly.toFixed(2)}/hr gross. After all taxes in ${displayName}, your after-tax hourly rate is ${fmt(hourly)}/hr ($${(hourly * 8).toFixed(0)}/day).`,
    },
    noTax
      ? {
          q: `How much state income tax do you pay on $${amtFmt} in ${stateName}?`,
          a: `Zero. ${stateName} has no state income tax. On a $${amtFmt} salary, your only deductions are federal income tax (${fmt(tax.federalTax)}) and FICA (${fmt(tax.ficaTotal)}). Total tax burden: ${fmt(tax.totalTax)} (${pct(tax.effectiveTotalRate)} effective rate).`,
        }
      : {
          q: `What is the ${stateName} state income tax on $${amtFmt}?`,
          a: `On a $${amtFmt} salary, your estimated ${stateName} state income tax is ${fmt(tax.stateTax)} — an effective state rate of ${pct(tax.stateTax / amount)}. Combined with federal tax (${fmt(tax.federalTax)}) and FICA (${fmt(tax.ficaTotal)}), total tax is ${fmt(tax.totalTax)} (${pct(tax.effectiveTotalRate)} overall effective rate).`,
        },
    {
      q: `Is $${amtFmt} enough to live in ${majorCity}?`,
      a: `On $${amtFmt} in ${stateName}, your monthly take-home is ${fmt(monthly)}. Using the 30% housing rule, you can budget up to ${fmt(affordableRent)}/month for rent. Average rent in ${stateName} runs ~$${avgRent.toLocaleString()}/month — so you ${affordableRent >= avgRent ? `can comfortably cover typical ${majorCity} housing costs and still have room for savings` : `may find ${majorCity}'s average rent (~$${avgRent.toLocaleString()}/mo) a stretch on this income`}.`,
    },
  ];

  // ── HowTo schema (step-by-step calculation) ─────────────────────────────────
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to calculate take-home pay for a $${amtFmt} salary in ${displayName}`,
    description: `Step-by-step calculation of the net take-home pay for a $${amtFmt} annual salary in ${displayName} using ${TAX_YEAR} IRS federal tax brackets.`,
    step: [
      {
        "@type": "HowToStep",
        name: "Start with gross salary",
        text: `Begin with your gross annual salary: $${amtFmt}.`,
      },
      {
        "@type": "HowToStep",
        name: "Subtract the standard deduction",
        text: `Subtract the ${TAX_YEAR} standard deduction ($16,100 for single filers) to get federal taxable income of ${fmt(tax.federalTaxable)}.`,
      },
      {
        "@type": "HowToStep",
        name: "Apply federal income tax brackets",
        text: `Apply ${TAX_YEAR} IRS progressive brackets (10%–37%) to get federal income tax of ${fmt(tax.federalTax)} (${pct(tax.effectiveFederalRate)} effective rate, ${pct(tax.marginalRate)} marginal rate).`,
      },
      {
        "@type": "HowToStep",
        name: "Calculate FICA taxes",
        text: `Social Security: 6.2% on wages up to $184,500 = ${fmt(tax.socialSecurity)}. Medicare: 1.45% on all wages = ${fmt(tax.medicare)}. Total FICA: ${fmt(tax.ficaTotal)}.`,
      },
      ...(noTax
        ? []
        : [
            {
              "@type": "HowToStep",
              name: `Calculate ${stateName} state income tax`,
              text: `${stateName} state income tax on $${amtFmt}: ${fmt(tax.stateTax)} (effective rate: ${pct(tax.stateTax / amount)}).`,
            },
          ]),
      {
        "@type": "HowToStep",
        name: "Calculate take-home pay",
        text: `Subtract all taxes from gross: $${amtFmt} − ${fmt(tax.totalTax)} total tax = ${fmt(tax.takeHome)} annual take-home (${fmt(monthly)}/month).`,
      },
    ],
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: `${stateName} Salary Calculator`, item: `https://www.takehomeusa.com/${stateSlug}` },
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax in ${displayName}`, item: `https://www.takehomeusa.com/salary/${slug}` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `$${amtFmt} Salary After Tax in ${displayName} (${TAX_YEAR})`,
    description: `Exact take-home pay for a $${amtFmt} salary in ${displayName} based on ${TAX_YEAR} federal tax brackets and official state tax tables.`,
    url: `https://www.takehomeusa.com/salary/${slug}`,
    isPartOf: { "@type": "WebSite", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    dateModified: `${TAX_YEAR}-01-01`,
    datePublished: "2024-01-01",
    author: { "@type": "Organization", name: "TakeHomeUSA" },
  };

  // ── Related salary amounts ──────────────────────────────────────────────────
  const allAmounts = getStateSalaryAmounts(stateSlug);
  const idx = allAmounts.indexOf(amount);
  const relatedAmounts = [
    ...allAmounts.slice(Math.max(0, idx - 4), idx),
    ...allAmounts.slice(idx + 1, idx + 5),
  ].filter((a) => a !== amount);

  const nearbyAmounts = [amount - 10_000, amount + 10_000].filter(
    (a) => a > 0 && allAmounts.includes(a)
  );

  // ── Popular states for this same salary ────────────────────────────────────
  // Guard: only include states that actually have a page for this exact amount.
  // Non-Texas states use $5K steps — Texas-specific $1K amounts (e.g. $97K) would
  // otherwise produce broken links to /salary/97000-salary-after-tax-california.
  const popularStates = ["texas", "california", "new-york", "florida", "washington", "georgia", "illinois", "pennsylvania"]
    .map((s) => STATE_BY_SLUG.get(s)!)
    .filter(Boolean)
    .filter((s) => s.slug !== stateSlug)
    .filter((s) => getStateSalaryAmounts(s.slug).includes(amount));

  // ── "Is X a good salary?" context — state-specific median ─────────────────
  const medianRatio = amount / stateMedian;
  let salaryTier: string;
  let salaryContext: string;
  if (amount >= 500_000) {
    salaryTier = "Top 1%";
    salaryContext = `$${amtFmt} is ${medianRatio.toFixed(1)}× the ${stateName} median household income ($${stateMedian.toLocaleString()}), placing you in the top 1% of earners nationally. After taxes in ${stateName}, your take-home of ${fmt(tax.takeHome)}/year remains substantial even after ${fmt(tax.totalTax)} in total taxes.`;
  } else if (medianRatio >= 3.5) {
    salaryTier = "Top 5%";
    salaryContext = `$${amtFmt} is ${medianRatio.toFixed(1)}× the ${stateName} median household income ($${stateMedian.toLocaleString()}), a top-5% national income. After taxes you take home ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — well above what most ${stateName} households earn.`;
  } else if (medianRatio >= 2) {
    salaryTier = "Top 10%";
    salaryContext = `$${amtFmt} is roughly ${medianRatio.toFixed(1)}× the ${stateName} median household income ($${stateMedian.toLocaleString()}), a top-10% income. In ${stateName}, that's ${fmt(tax.takeHome)}/year take-home (${fmt(monthly)}/month) — comfortable in most ${stateName} metro areas.`;
  } else if (medianRatio >= 1.2) {
    salaryTier = "Above Median";
    salaryContext = `$${amtFmt} is ${Math.round((medianRatio - 1) * 100)}% above the ${stateName} median household income ($${stateMedian.toLocaleString()}). After taxes, you take home ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — a solid income across most ${stateName} metro areas.`;
  } else if (medianRatio >= 0.9) {
    salaryTier = "Near Median";
    salaryContext = `$${amtFmt} is ${medianRatio >= 1 ? "near" : "just below"} the ${stateName} median household income ($${stateMedian.toLocaleString()}). Your take-home of ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) is workable across many ${stateName} areas, though high-cost cities may be a stretch.`;
  } else if (medianRatio >= 0.6) {
    salaryTier = "Entry Level";
    salaryContext = `$${amtFmt} is below the ${stateName} median household income ($${stateMedian.toLocaleString()}). After taxes, take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — manageable in lower cost-of-living areas of ${stateName} but tight in major metro areas.`;
  } else {
    salaryTier = "Part-Time / Entry";
    salaryContext = `$${amtFmt}/year is well below the ${stateName} median household income ($${stateMedian.toLocaleString()}). Take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — this may represent part-time work or an entry-level position.`;
  }

  // ── After-tax all-states page availability ─────────────────────────────────
  // /after-tax pages exist for: $5K steps $20K-$150K, then $160K,$175K,$200K,
  // $225K,$250K,$300K,$350K,$400K,$500K
  const AFTER_TAX_SPECIALS = new Set([
    160_000, 175_000, 200_000, 225_000, 250_000, 300_000, 350_000, 400_000, 500_000,
  ]);
  const hasAfterTaxPage =
    (amount % 5_000 === 0 && amount >= 20_000 && amount <= 150_000) ||
    AFTER_TAX_SPECIALS.has(amount);

  // ── Texas comparison (the standard benchmark) ──────────────────────────────
  const texasTax = calculateTax(STATE_BY_SLUG.get("texas")!, amount);
  const texasDiff = texasTax.takeHome - tax.takeHome;

  return (
    <>
      {/* ── Structured Data ─────────────────────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      {/* ── Ad: Leaderboard ─────────────────────────────────────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Quick Answer Hero ────────────────────────────────────────────────── */}
      <section className={`bg-gradient-to-br ${heroGradient} text-white`}>
        <div className="container-page py-10 sm:py-14">
          <nav className="text-white/60 text-sm mb-5 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/${stateSlug}`} className="hover:text-white transition-colors">{stateName}</Link>
            <span>/</span>
            <span className="text-white">${amtFmt} After Tax</span>
          </nav>

          <div className="max-w-4xl">
            <div className="flex flex-wrap gap-2 mb-4">
              {noTax ? (
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                  ★ No {stateName} State Tax
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full">
                  {stateName} state tax: up to {topRateDisplay}
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                {TAX_YEAR} IRS Brackets
              </span>
            </div>

            <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight mb-3">
              ${amtFmt} After Tax ({TAX_YEAR})<br />
              <span className="text-white/60">in {displayName}</span>
            </h1>
            <p className="text-white/70 text-base sm:text-lg mt-3 mb-2 max-w-2xl">
              See your exact take-home pay on a ${amtFmt} salary in {displayName} after federal income tax{noTax && !cityTaxAmt ? ", Social Security, and Medicare" : `, ${stateName} state income tax, Social Security, and Medicare`}.
            </p>

            {/* ── The Answer — immediately visible ── */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-green-400">{fmt(tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Per Year</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white">{fmt(monthly)}</p>
                <p className="text-xs text-white/60 mt-1">Per Month</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white">{fmt(biweekly)}</p>
                <p className="text-xs text-white/60 mt-1">Biweekly</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white/70">{pct(tax.effectiveTotalRate)}</p>
                <p className="text-xs text-white/60 mt-1">Effective Rate</p>
              </div>
            </div>

            <p className="mt-5 text-white/60 text-sm max-w-xl">
              Single filer, standard deduction, {TAX_YEAR} IRS brackets.
              Adjust filing status, 401k, and more in the calculator below.
            </p>
          </div>
        </div>
      </section>

      {/* ── Tax Summary Table (server-rendered) ─────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ${amtFmt} Salary Tax Breakdown — {stateName} ({TAX_YEAR})
        </h2>
        <p className="text-gray-500 mb-6">
          Exact federal{noTax ? "" : " and state"} tax deductions on a ${amtFmt} annual salary in {stateName}.
        </p>

        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          {/* Deductions table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr>
                  <th colSpan={2}>Tax Deductions on ${amtFmt}</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-gray-700">Federal Income Tax</td>
                  <td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.federalTax)}</td>
                </tr>
                {!noTax && (
                  <tr>
                    <td className="text-gray-700">{stateName} State Tax</td>
                    <td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.stateTax)}</td>
                  </tr>
                )}
                <tr>
                  <td className="text-gray-700">Social Security (6.2%)</td>
                  <td className="text-orange-600 tabular-nums">−{fmt(tax.socialSecurity)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Medicare (1.45%)</td>
                  <td className="text-orange-600 tabular-nums">−{fmt(tax.medicare)}</td>
                </tr>
                <tr className="bg-red-50">
                  <td className="font-bold text-gray-800">Total Tax</td>
                  <td className="font-bold text-red-700 tabular-nums">−{fmt(tax.totalTax)}</td>
                </tr>
                <tr className="row-total">
                  <td>Take-Home Pay</td>
                  <td className="tabular-nums">{fmt(tax.takeHome)}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Pay frequency table */}
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr>
                  <th colSpan={2}>Take-Home by Pay Period</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="text-gray-700">Annual</td>
                  <td className="font-bold text-green-700 tabular-nums">{fmt(tax.takeHome)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Monthly</td>
                  <td className="font-semibold text-blue-700 tabular-nums">{fmt(monthly)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Semi-Monthly (24×)</td>
                  <td className="tabular-nums">{fmt(tax.takeHome / 24)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Biweekly (26×)</td>
                  <td className="tabular-nums">{fmt(biweekly)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Weekly</td>
                  <td className="tabular-nums">{fmt(weekly)}</td>
                </tr>
                <tr>
                  <td className="text-gray-700">Hourly (2,080 hrs)</td>
                  <td className="tabular-nums">{fmt(hourly)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Based on {TAX_YEAR} IRS brackets, single filer, standard deduction of $16,100. State tax is estimated — actual amounts vary by credits and local taxes.
        </p>
      </section>

      {/* ── Interactive Calculator ───────────────────────────────────────────── */}
      <SalaryCalculator initialAmount={amount} stateConfig={stateConfig} />

      {/* ── Mid-page Ad ──────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Is X a Good Salary? ──────────────────────────────────────────────── */}
      <section className="container-page my-12">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg">
              {salaryTier.includes("1%") ? "1%" : salaryTier.includes("5%") ? "5%" : salaryTier.includes("10%") ? "10%" : "≈"}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">
                Is ${amtFmt} a Good Salary in {stateName}? — {salaryTier}
              </h2>
              <p className="text-gray-700 leading-relaxed">{salaryContext}</p>
              {!noTax && texasDiff > 0 && (
                <p className="mt-3 text-sm text-gray-600">
                  <strong>State tax cost:</strong> Compared to a no-tax state like Texas, you pay {fmt(texasDiff)}/year more in taxes living in {stateName}.
                  That&apos;s {fmt(texasDiff / 12)}/month going to state taxes.
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── How We Calculate: Step-by-Step ──────────────────────────────────── */}
      <section className="container-page my-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          How to Calculate ${amtFmt} After Taxes in {stateName}
        </h2>
        <div className="space-y-4 max-w-2xl">
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">1</div>
            <div>
              <p className="font-semibold text-gray-900">Gross salary: ${amtFmt}</p>
              <p className="text-gray-600 text-sm">Your starting point before any deductions.</p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">2</div>
            <div>
              <p className="font-semibold text-gray-900">Subtract standard deduction: −$16,100</p>
              <p className="text-gray-600 text-sm">
                {TAX_YEAR} standard deduction for single filers. Federal taxable income: {fmt(tax.federalTaxable)}.
                {tax.federalTaxable <= 0 && " (Below the standard deduction — no federal income tax.)"}
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">3</div>
            <div>
              <p className="font-semibold text-gray-900">Federal income tax: −{fmt(tax.federalTax)}</p>
              <p className="text-gray-600 text-sm">
                {TAX_YEAR} progressive brackets (10%–37%) on {fmt(tax.federalTaxable)} taxable income.
                Effective rate: {pct(tax.effectiveFederalRate)}. Marginal rate: {pct(tax.marginalRate)}.
              </p>
            </div>
          </div>
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">4</div>
            <div>
              <p className="font-semibold text-gray-900">FICA taxes: −{fmt(tax.ficaTotal)}</p>
              <p className="text-gray-600 text-sm">
                Social Security: 6.2% on wages up to $184,500 = {fmt(tax.socialSecurity)}.
                Medicare: 1.45% on all wages = {fmt(tax.medicare)}.
                {tax.additionalMedicare > 0 && ` Additional 0.9% Medicare surtax: ${fmt(tax.additionalMedicare)}.`}
              </p>
            </div>
          </div>
          {!noTax && (
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center">5</div>
              <div>
                <p className="font-semibold text-gray-900">{stateName} state tax: −{fmt(tax.stateTax)}</p>
                <p className="text-gray-600 text-sm">
                  {stateName} top rate {topRateDisplay}. Effective state rate on ${amtFmt}: {pct(tax.stateTax / amount)}.
                </p>
              </div>
            </div>
          )}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-600 text-white font-bold text-sm flex items-center justify-center">=</div>
            <div>
              <p className="font-bold text-gray-900 text-lg">Take-home: {fmt(tax.takeHome)}/year = {fmt(monthly)}/month</p>
              <p className="text-gray-600 text-sm">
                Total tax: {fmt(tax.totalTax)} ({pct(tax.effectiveTotalRate)} effective rate).
                You keep {pct(1 - tax.effectiveTotalRate)} of your gross income.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Visible FAQ Section ──────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ${amtFmt} Salary in {stateName} — Frequently Asked Questions
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {faqItems.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── What Can You Afford? ────────────────────────────────────────────── */}
      <section className="container-page my-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What can you afford on ${amtFmt} in {stateName}?
          </h2>
          <p className="text-gray-700 leading-relaxed mb-3">
            Your monthly take-home of {fmt(monthly)} supports a housing budget of up to{" "}
            {fmt(affordableRent)}/month under the standard 30% rule. Average rent in{" "}
            {stateName} runs ~${avgRent.toLocaleString()}/month
            {affordableRent >= avgRent
              ? `, leaving roughly ${fmt(Math.round(monthly) - avgRent)}/month after rent for food, transportation, and savings.`
              : `. That puts typical ${stateName} rent ${fmt(avgRent - affordableRent)}/month above the 30% threshold, meaning housing takes an outsized share of your budget.`}
          </p>
          {!noTax && texasDiff > 0 && (
            <p className="text-gray-600 text-sm">
              {stateName}&apos;s state income tax of {fmt(tax.stateTax)}/year reduces your
              purchasing power by {fmt(texasDiff)}/year ({fmt(Math.round(texasDiff / 12))}/month)
              compared to a no-tax state like Texas — the equivalent of roughly{" "}
              {Math.round((texasDiff / 12) / avgRent * 10) / 10} months of average{" "}
              {stateName} rent per year.
            </p>
          )}
        </div>
      </section>

      {/* ── How Does [State] Compare? ───────────────────────────────────────── */}
      {!noTax && texasDiff > 0 && (
        <section className="container-page my-8">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 sm:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-3">
              How does {stateName} compare for take-home pay?
            </h2>
            <p className="text-gray-700 leading-relaxed">
              On a ${amtFmt} salary, {stateName} residents keep {fmt(tax.takeHome)}/year
              after taxes — {fmt(texasDiff)} less per year than in Texas, which has no state income tax.
              Over a 10-year career, that gap amounts to {fmt(texasDiff * 10)} in
              additional take-home pay you&apos;d keep in a no-tax state.{" "}
              {stateSlug !== "texas" && (
                <Link
                  href={`/salary/${amount}-salary-after-tax-texas`}
                  className="text-green-700 font-semibold hover:underline"
                >
                  See ${amtFmt} after tax in Texas →
                </Link>
              )}
            </p>
          </div>
        </section>
      )}

      {/* ── Same Salary, Popular States ─────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 border-y border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ${amtFmt} Salary After Tax — Other States
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            How does ${amtFmt} compare in popular states?
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {popularStates.map((s) => {
              const t = calculateTax(s, amount);
              const diff = t.takeHome - tax.takeHome;
              return (
                <Link
                  key={s.slug}
                  href={`/salary/${amount}-salary-after-tax-${s.slug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                  {s.noTax && <p className="text-xs text-green-600 font-semibold">No state tax</p>}
                  <p className="font-bold text-blue-700 mt-1">{fmt(t.takeHome)}/yr</p>
                  <p className="text-gray-400 text-xs">{fmt(t.takeHome / 12)}/mo</p>
                  {Math.abs(diff) > 100 && (
                    <p className={`text-xs font-semibold mt-1 ${diff > 0 ? "text-green-600" : "text-red-500"}`}>
                      {diff > 0 ? "+" : ""}{fmt(diff)}/yr vs {stateName}
                    </p>
                  )}
                </Link>
              );
            })}
          </div>
          {hasAfterTaxPage && (
            <div className="mt-4">
              <Link href={`/after-tax/${amount}-a-year-after-tax`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
                See all 50 states for ${amtFmt} →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ── Related Salary Navigation ─────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Related {stateName} Salary Calculations
        </h2>
        <div className="flex flex-wrap gap-2">
          {relatedAmounts.map((amt) => {
            const t = calculateTax(stateConfig, amt);
            return (
              <Link
                key={amt}
                href={`/salary/${amt}-salary-after-tax-${stateSlug}`}
                className="border border-gray-200 bg-white hover:border-blue-400 hover:bg-blue-50 rounded-xl px-4 py-3 text-sm transition-all"
              >
                <span className="font-semibold text-gray-900">${amt.toLocaleString()}</span>
                <span className="text-gray-400 mx-1">→</span>
                <span className="font-bold text-blue-700">{fmt(t.takeHome)}/yr</span>
              </Link>
            );
          })}
        </div>
        <div className="mt-4">
          <Link href={`/${stateSlug}`} className="text-blue-600 hover:text-blue-800 font-semibold text-sm">
            Browse all {stateName} salary calculations →
          </Link>
        </div>
      </section>

      {/* ── Related Salaries ─────────────────────────────────────────────────── */}
      <section className="container-page my-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
        <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-4">Related Salaries</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Same salary, other popular states */}
          <div>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">${amtFmt} in other states</p>
            <ul className="space-y-1">
              {popularStates.slice(0, 4).map((s) => {
                const t = calculateTax(s, amount);
                return (
                  <li key={s.slug}>
                    <Link
                      href={`/salary/${amount}-salary-after-tax-${s.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      ${amtFmt} in {s.name} — {fmt(t.takeHome)}/yr
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
          {/* Nearby salaries in same state */}
          {nearbyAmounts.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Nearby salaries in {stateName}</p>
              <ul className="space-y-1">
                {nearbyAmounts.map((amt) => {
                  const t = calculateTax(stateConfig, amt);
                  return (
                    <li key={amt}>
                      <Link
                        href={`/salary/${amt}-salary-after-tax-${stateSlug}`}
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        ${amt.toLocaleString()} in {stateName} — {fmt(t.takeHome)}/yr
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Refine your estimate</h2>
          <p className="text-blue-300 mb-6">
            Add 401k contributions, health insurance, HSA, and more to get your exact take-home.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/" className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Full Calculator →
            </Link>
            <Link href="/compare" className="inline-block border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Compare States
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom Ad ────────────────────────────────────────────────────────── */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
