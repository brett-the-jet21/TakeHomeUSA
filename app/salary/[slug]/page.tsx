export const dynamic = "force-static";
export const dynamicParams = false;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS, getStateSalaryAmounts } from "@/lib/states";
import SalaryCalculator from "./SalaryCalculator";

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

// ─── Slug Parser ──────────────────────────────────────────────────────────────
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const amount = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(amount) || amount < 1_000 || amount > 100_000_000_000_000) return null;
  const stateConfig = STATE_BY_SLUG.get(stateSlug);
  if (!stateConfig) return null;
  return { amount, stateSlug, stateConfig };
}

// ─── Static Generation: All 50 states ────────────────────────────────────────
// Texas → $1K steps (481 pages); all others → $5K steps (97 pages × 49 states)
export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const [stateSlug] of STATE_BY_SLUG) {
    for (const amount of getStateSalaryAmounts(stateSlug)) {
      params.push({ slug: `${amount}-salary-after-tax-${stateSlug}` });
    }
  }
  return params;
}

// ─── Per-Page SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { amount, stateConfig } = parsed;
  const { name: stateName, noTax } = stateConfig;
  const tax = calculateTax(stateConfig, amount);
  const amtFmt = amount.toLocaleString("en-US");
  const moFmt = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);

  const desc = noTax
    ? `Earning $${amtFmt}/year in ${stateName}? Take-home = $${moFmt}/month (${TAX_YEAR}). Effective rate ${effRate}%. No state income tax — free full breakdown, instant, no signup.`
    : `Earning $${amtFmt}/year in ${stateName}? Take-home = $${moFmt}/month (${TAX_YEAR}). Effective rate ${effRate}%. Full federal + state breakdown — free, instant, no signup.`;

  return {
    title: `$${amtFmt} After Taxes in ${stateName} — $${moFmt}/mo`,
    description: desc,
    alternates: {
      canonical: `https://www.takehomeusa.com/salary/${slug}`,
    },
    openGraph: {
      title: `$${amtFmt} a Year After Taxes in ${stateName} = $${moFmt}/mo | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/salary/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `$${amtFmt} a Year After Taxes in ${stateName} = $${moFmt}/mo`,
      description: desc,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function SalaryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { amount, stateSlug, stateConfig } = parsed;
  const { name: stateName, noTax, topRateDisplay, heroGradient } = stateConfig;
  const tax = calculateTax(stateConfig, amount);
  const amtFmt = amount.toLocaleString("en-US");
  const monthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const weekly = tax.takeHome / 52;
  const hourly = tax.takeHome / 2080;

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
      q: `Does ${stateName} have a state income tax?`,
      a: noTax
        ? `No. ${stateName} is one of nine US states with zero state income tax. On a $${amtFmt} salary you pay $0 in state tax — a significant advantage over states like California (up to 13.3%) or New York (up to 10.9%).`
        : `Yes. ${stateName} has a state income tax with a top rate of ${topRateDisplay}. On a $${amtFmt} salary, your estimated ${stateName} state tax is ${fmt(tax.stateTax)} (effective state rate: ${pct(tax.stateTax / amount)}).`,
    },
    {
      q: `What is the effective tax rate on a $${amtFmt} salary in ${stateName}?`,
      a: `The effective total tax rate on a $${amtFmt} salary in ${stateName} is ${pct(tax.effectiveTotalRate)}. This combines federal income tax (${pct(tax.effectiveFederalRate)} effective), FICA taxes — Social Security (${pct(tax.socialSecurity / amount)}) and Medicare (${pct(tax.medicare / amount)})${noTax ? `. ${stateName} has no state income tax.` : `, and ${stateName} state tax (${pct(tax.stateTax / amount)} effective).`}`,
    },
    {
      q: `What is the marginal (top) federal tax bracket for $${amtFmt}?`,
      a: `The marginal federal tax rate on a $${amtFmt} salary is ${pct(tax.marginalRate)}. Not all income is taxed at this rate — your effective federal rate is only ${pct(tax.effectiveFederalRate)} because lower income portions are taxed at 10%, 12%, and so on. The US uses progressive brackets.`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${stateName}?`,
      a: `Based on a 40-hour work week (2,080 hours/year), a $${amtFmt} salary in ${stateName} works out to ${fmt(hourly)} per hour after taxes (${fmt(hourly * 8)}/day). Gross hourly rate is ${fmt(amount / 2080)}/hr.`,
    },
  ];

  // ── HowTo schema (step-by-step calculation) ─────────────────────────────────
  const howToSchema = {
    "@context": "https://schema.org",
    "@type": "HowTo",
    name: `How to calculate take-home pay for a $${amtFmt} salary in ${stateName}`,
    description: `Step-by-step calculation of the net take-home pay for a $${amtFmt} annual salary in ${stateName} using ${TAX_YEAR} IRS federal tax brackets.`,
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
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax in ${stateName}`, item: `https://www.takehomeusa.com/salary/${slug}` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `$${amtFmt} Salary After Tax in ${stateName} (${TAX_YEAR})`,
    description: `Exact take-home pay for a $${amtFmt} salary in ${stateName} based on ${TAX_YEAR} federal tax brackets and official state tax tables.`,
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

  // ── Popular states for this same salary ────────────────────────────────────
  const popularStates = ["texas", "california", "new-york", "florida", "washington", "georgia", "illinois", "pennsylvania"]
    .map((s) => STATE_BY_SLUG.get(s)!)
    .filter(Boolean)
    .filter((s) => s.slug !== stateSlug);

  // ── "Is X a good salary?" context ──────────────────────────────────────────
  let salaryTier: string;
  let salaryContext: string;
  if (amount >= 500_000) {
    salaryTier = "Top 1%";
    salaryContext = `$${amtFmt} places you in the top 1% of US individual earners. After taxes in ${stateName}, your take-home of ${fmt(tax.takeHome)}/year puts you in an elite category — even after paying ${fmt(tax.totalTax)} in taxes.`;
  } else if (amount >= 175_000) {
    salaryTier = "Top 5%";
    salaryContext = `$${amtFmt} is a top-5% US income. After taxes in ${stateName}, you take home ${fmt(tax.takeHome)}/year — ${fmt(monthly)}/month. Your combined tax burden is ${fmt(tax.totalTax)} (${pct(tax.effectiveTotalRate)} effective rate).`;
  } else if (amount >= 130_000) {
    salaryTier = "Top 10%";
    salaryContext = `$${amtFmt} is a top-10% US income. In ${stateName}, that's ${fmt(tax.takeHome)}/year take-home (${fmt(monthly)}/month). Comfortable in most US cities, including moderate cost-of-living metros.`;
  } else if (amount >= 90_000) {
    salaryTier = "Above Average";
    salaryContext = `$${amtFmt} is above the US median household income (~$77,000). In ${stateName}, take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — a solid income in most metro areas.`;
  } else if (amount >= 60_000) {
    salaryTier = "Near Median";
    salaryContext = `$${amtFmt} is near the US median individual income (~$60,000). In ${stateName}, take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month) — livable in lower cost-of-living areas, tighter in major cities.`;
  } else if (amount >= 40_000) {
    salaryTier = "Entry Level";
    salaryContext = `$${amtFmt} is below the US median individual income. In ${stateName}, take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month). Cost of living varies widely — this budget works comfortably in many mid-sized US cities.`;
  } else {
    salaryTier = "Part-Time / Entry";
    salaryContext = `$${amtFmt}/year is below the US median. In ${stateName}, take-home is ${fmt(tax.takeHome)}/year (${fmt(monthly)}/month). This may represent part-time work or a lower cost-of-living area.`;
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
              ${amtFmt} a Year After Taxes<br />
              <span className="text-white/60">in {stateName}</span>
            </h1>

            {/* ── The Answer — immediately visible ── */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
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
