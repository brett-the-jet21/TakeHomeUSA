export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: { absolute: `See Exactly What You Take Home — Free ${TAX_YEAR} Calculator` },
  description: `Stop guessing what's left after taxes. Get your exact take-home pay — ${TAX_YEAR} federal & state brackets, 401k & HSA deductions. All 50 states. Free & instant.`,
  alternates: { canonical: "https://www.takehomeusa.com/" },
  openGraph: {
    title: `Take-Home Pay Calculator — All 50 States | TakeHomeUSA`,
    description: `Enter any salary, pick a state — see your exact take-home pay instantly. Free ${TAX_YEAR} calculator for all 50 states. Full federal + state tax breakdown.`,
    url: "https://www.takehomeusa.com",
    siteName: "TakeHomeUSA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Take-Home Pay Calculator — All 50 States | TakeHomeUSA`,
    description: `Enter any salary, pick a state — see your exact take-home pay in seconds. Free ${TAX_YEAR} calculator for all 50 states. No signup.`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TakeHomeUSA",
  url: "https://www.takehomeusa.com",
  description: `Free salary after-tax calculator for all 50 US states. ${TAX_YEAR} IRS tax brackets.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.takehomeusa.com/salary/{salary}-salary-after-tax-{state}",
    },
    "query-input": "required name=salary required name=state",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TakeHomeUSA",
  url: "https://www.takehomeusa.com",
  logo: "https://www.takehomeusa.com/logo.png",
  description: "Free, accurate salary after-tax calculators for all 50 US states.",
  foundingDate: "2024",
  areaServed: "US",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `TakeHomeUSA Salary Calculator ${TAX_YEAR}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  description: `Calculate your exact take-home pay after federal and state taxes for all 50 US states. Uses ${TAX_YEAR} IRS tax brackets.`,
  url: "https://www.takehomeusa.com",
  featureList: [
    "All 50 US states",
    `${TAX_YEAR} IRS tax brackets`,
    "Federal + state tax breakdown",
    "Monthly, bi-weekly, hourly pay",
    "Effective and marginal tax rates",
    "No signup required",
    "100% free",
  ],
};

// FAQ items — rendered BOTH in JSON-LD AND visibly on page
const faqItems = [
  {
    q: "Why is my take-home pay different from what this calculator shows?",
    a: "Several factors can create differences: employer-specific deductions (health insurance premiums, FSA contributions, retirement beyond 401k), state-specific credits, local/city income taxes not included here, pre-tax commuter benefits, or different filing circumstances. This calculator uses standard deduction and standard FICA rates as the baseline. Use our optional fields for 401k, health insurance, and HSA to get a closer estimate.",
  },
  {
    q: "Does this calculator include Social Security and Medicare taxes?",
    a: `Yes. The calculator includes all FICA taxes: Social Security (6.2% on wages up to $184,500 for ${TAX_YEAR}) and Medicare (1.45% on all wages, plus an additional 0.9% on wages over $200,000). These are shown separately in the full breakdown.`,
  },
  {
    q: "What's the difference between effective and marginal tax rate?",
    a: "Your marginal tax rate is the rate applied to your last dollar of income — for example, 22% if your income falls in that bracket. Your effective tax rate is the average rate across all your income. Because the US uses progressive brackets, the effective rate is always lower than the marginal rate. For example, on a $100,000 salary, your marginal federal rate is 22%, but your effective federal rate is closer to 14% because the first $16,100 is deducted and the lower brackets apply to the rest.",
  },
  {
    q: "How do I calculate my hourly rate from my annual salary?",
    a: "Divide your annual salary by 2,080 (52 weeks × 40 hours/week) to get your gross hourly rate. To get your after-tax hourly rate, divide your annual take-home pay by 2,080. For example, a $100,000 salary with $79,180 take-home = $38.07/hr after tax. Use our hourly mode toggle to enter your exact rate and hours per week.",
  },
  {
    q: "Which states have no income tax in 2026?",
    a: "Nine states have zero state income tax: Alaska, Florida, Nevada, New Hampshire (wages only), South Dakota, Tennessee, Texas, Washington, and Wyoming. Residents of these states only pay federal income tax and FICA — keeping thousands more per year compared to high-tax states.",
  },
  {
    q: "How much is $100,000 after taxes in each state?",
    a: `$100,000 take-home varies significantly by state. No-tax states (Texas, Florida, etc.): ~$79,180/year. California: ~$71,760/year. New York: ~$68,915/year. The difference between the best and worst states can exceed $10,000/year on a $100K salary.`,
  },
  {
    q: "What is the federal income tax on a $75,000 salary?",
    a: `On a $75,000 salary (single filer, standard deduction), federal income tax is approximately $8,307 in ${TAX_YEAR} — an effective federal rate of 11.1%. Your marginal bracket is 22%. FICA adds another $5,738 (6.2% SS + 1.45% Medicare). Total federal burden: ~$14,045.`,
  },
  {
    q: "How are take-home pay calculations done?",
    a: `Take-home pay = Gross Salary − Federal Income Tax − State Income Tax − Social Security (6.2%) − Medicare (1.45%). Federal tax is calculated using ${TAX_YEAR} IRS progressive brackets after subtracting the $16,100 standard deduction (single filer). State tax varies by state — flat rate, progressive brackets, or zero. Optional deductions like 401k, HSA, and health insurance further reduce taxable income.`,
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map(({ q, a }) => ({
    "@type": "Question",
    name: q,
    acceptedAnswer: { "@type": "Answer", text: a },
  })),
};

// Pre-compute popular salary data for static content
const POPULAR_SALARIES_CONTENT = [50_000, 60_000, 75_000, 100_000, 125_000, 150_000];
const HIGHLIGHT_STATES = ["texas", "california", "new-york", "florida", "washington", "georgia"];

const POPULAR_SALARY_GRID = [50_000, 60_000, 65_000, 70_000, 75_000, 80_000, 90_000, 100_000, 110_000, 120_000, 125_000, 150_000];
const POPULAR_COMPARE_PAIRS: [string, string][] = [
  ["texas", "california"],
  ["texas", "new-york"],
  ["florida", "new-york"],
  ["washington", "california"],
  ["texas", "illinois"],
  ["nevada", "california"],
];

export default function HomePage() {
  // Pre-compute table data at build time
  const comparisonData = POPULAR_SALARIES_CONTENT.map((salary) => {
    const tx = calculateTax(STATE_BY_SLUG.get("texas")!, salary);
    const ca = calculateTax(STATE_BY_SLUG.get("california")!, salary);
    const ny = calculateTax(STATE_BY_SLUG.get("new-york")!, salary);
    return { salary, tx: tx.takeHome, ca: ca.takeHome, ny: ny.takeHome };
  });

  const salaryGridData = POPULAR_SALARY_GRID.map((salary) => {
    const tx = calculateTax(STATE_BY_SLUG.get("texas")!, salary);
    const ca = calculateTax(STATE_BY_SLUG.get("california")!, salary);
    return { salary, txTake: Math.round(tx.takeHome), caTake: Math.round(ca.takeHome) };
  });

  const compareGridData = POPULAR_COMPARE_PAIRS.map(([s1slug, s2slug]) => {
    const s1 = STATE_BY_SLUG.get(s1slug)!;
    const s2 = STATE_BY_SLUG.get(s2slug)!;
    const t1 = calculateTax(s1, 100_000);
    const t2 = calculateTax(s2, 100_000);
    const diff = t1.takeHome - t2.takeHome;
    return {
      label1: s1.name,
      label2: s2.name,
      compareSlug: `${s1slug}-vs-${s2slug}`,
      take1: Math.round(t1.takeHome),
      take2: Math.round(t2.takeHome),
      absDiff: Math.round(Math.abs(diff)),
      s1Wins: diff >= 0,
    };
  });

  const noTaxStates = ALL_STATE_CONFIGS.filter((s) => s.noTax);
  const topTaxStates = ALL_STATE_CONFIGS
    .filter((s) => !s.noTax)
    .sort((a, b) => {
      const aRate = parseFloat(a.topRateDisplay);
      const bRate = parseFloat(b.topRateDisplay);
      return bRate - aRate;
    })
    .slice(0, 5);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Interactive Calculator (client component) ────────────────────────── */}
      <HomePageClient />

      {/* ── Salary vs State Comparison Table ─────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How Much Do You Keep? — Salary After Tax by State ({TAX_YEAR})
        </h2>
        <p className="text-gray-500 mb-6">
          Your take-home pay varies dramatically by state. Here&apos;s a side-by-side comparison of three major states for popular salary amounts.
        </p>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Annual Salary</th>
                  <th>Texas <span className="text-green-600 font-normal text-xs">(no state tax)</span></th>
                  <th>California</th>
                  <th>New York</th>
                  <th>TX vs CA Difference</th>
                </tr>
              </thead>
              <tbody>
                {comparisonData.map(({ salary, tx, ca, ny }) => (
                  <tr key={salary}>
                    <td className="font-semibold text-gray-900">
                      <Link href={`/after-tax/${salary}-a-year-after-tax`} className="hover:text-blue-700 transition-colors">
                        ${salary.toLocaleString()}
                      </Link>
                    </td>
                    <td className="text-green-700 font-bold tabular-nums">
                      <Link href={`/salary/${salary}-salary-after-tax-texas`} className="hover:underline">
                        {fmt(tx)}
                      </Link>
                    </td>
                    <td className="text-blue-700 tabular-nums">
                      <Link href={`/salary/${salary}-salary-after-tax-california`} className="hover:underline">
                        {fmt(ca)}
                      </Link>
                    </td>
                    <td className="text-blue-700 tabular-nums">
                      <Link href={`/salary/${salary}-salary-after-tax-new-york`} className="hover:underline">
                        {fmt(ny)}
                      </Link>
                    </td>
                    <td className="font-bold text-gray-900 tabular-nums">+{fmt(tx - ca)}/yr</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">Single filer, standard deduction, {TAX_YEAR} IRS brackets.</p>
      </section>

      {/* ── States Overview ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-50 to-blue-50 border-y border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Browse by State</h2>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h3 className="font-bold text-green-800 mb-4 flex items-center gap-2">
                <span className="text-green-600">★</span> No State Income Tax (9 States)
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {noTaxStates.map((s) => {
                  const t = calculateTax(s, 100_000);
                  return (
                    <Link
                      key={s.slug}
                      href={`/${s.slug}`}
                      className="bg-white border border-green-200 rounded-xl p-3 hover:border-green-400 hover:shadow-sm transition-all"
                    >
                      <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                      <p className="text-green-700 font-bold text-sm">{fmt(t.takeHome)}/yr</p>
                      <p className="text-gray-400 text-xs">on $100K</p>
                    </Link>
                  );
                })}
              </div>
            </div>
            <div>
              <h3 className="font-bold text-gray-800 mb-4">Highest State Tax Rates</h3>
              <div className="space-y-2">
                {topTaxStates.map((s) => {
                  const t = calculateTax(s, 100_000);
                  return (
                    <Link
                      key={s.slug}
                      href={`/${s.slug}`}
                      className="flex items-center justify-between bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-300 hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{s.name}</p>
                        <p className="text-red-600 text-xs">Up to {s.topRateDisplay} state tax</p>
                      </div>
                      <div className="text-right">
                        <p className="text-blue-700 font-bold text-sm">{fmt(t.takeHome)}/yr</p>
                        <p className="text-gray-400 text-xs">on $100K</p>
                      </div>
                    </Link>
                  );
                })}
                <Link href="/states" className="block text-center text-blue-600 hover:text-blue-800 font-semibold text-sm pt-2">
                  View all 50 states →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Popular Salary Pages ──────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular Salary Calculations</h2>
        <p className="text-gray-500 mb-6">Most-searched salaries — see exact take-home for all 50 states.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {salaryGridData.map(({ salary, txTake }) => (
            <Link
              key={salary}
              href={`/after-tax/${salary}-a-year-after-tax`}
              className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
            >
              <p className="font-bold text-gray-900">${salary.toLocaleString()}/yr</p>
              <p className="text-green-700 font-semibold text-sm mt-1">TX: {fmt(txTake)}</p>
              <p className="text-blue-600 text-xs mt-0.5">All 50 states →</p>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Popular State Comparisons ─────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-50 to-indigo-50 border-y border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular State Comparisons</h2>
          <p className="text-gray-500 mb-6">See how much more you keep by living in a lower-tax state — on a $100K salary.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {compareGridData.map(({ label1, label2, compareSlug, take1, take2, absDiff, s1Wins }) => {
              const winner = s1Wins ? label1 : label2;
              const winnerTake = s1Wins ? take1 : take2;
              const loserTake = s1Wins ? take2 : take1;
              return (
                <Link
                  key={compareSlug}
                  href={`/compare/${compareSlug}`}
                  className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900 text-sm mb-3">{label1} vs {label2}</p>
                  <div className="flex items-end justify-between mb-2">
                    <div>
                      <p className="text-green-700 font-bold text-lg">{fmt(winnerTake)}</p>
                      <p className="text-gray-500 text-xs">{winner} on $100K</p>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-600 font-semibold text-sm">{fmt(loserTake)}</p>
                      <p className="text-gray-400 text-xs">{s1Wins ? label2 : label1}</p>
                    </div>
                  </div>
                  <p className="text-indigo-700 font-semibold text-sm">{winner} keeps {fmt(absDiff)} more/yr →</p>
                </Link>
              );
            })}
          </div>
          <p className="text-xs text-gray-400 mt-4">Single filer, standard deduction, {TAX_YEAR}. <Link href="/compare" className="text-blue-500 hover:underline">View all state comparisons →</Link></p>
        </div>
      </section>

      {/* ── Hourly Wage Section ───────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Hourly Wage After Taxes</h2>
        <p className="text-gray-500 mb-6">See your annual and monthly take-home for common hourly rates.</p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {[10, 12, 15, 18, 20, 25, 30, 35, 40, 45, 50, 60, 75, 100].map((rate) => {
            const t = calculateTax(STATE_BY_SLUG.get("texas")!, rate * 2080);
            return (
              <Link
                key={rate}
                href={`/hourly/${rate}-an-hour-after-tax-texas`}
                className="bg-white border border-gray-200 rounded-xl p-3 hover:border-blue-400 hover:shadow-sm transition-all text-center"
              >
                <p className="font-bold text-gray-900 text-sm">${rate}/hr</p>
                <p className="text-blue-600 text-xs mt-0.5">{fmt(t.takeHome / 12)}/mo</p>
              </Link>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mt-3">Shown for Texas (no state tax). Click any rate to see all 50 states.</p>
      </section>

      {/* ── FAQ — Visible Section ─────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Salary After Tax — Frequently Asked Questions
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

      {/* ── About / Methodology ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white py-12">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4">How TakeHomeUSA Calculates Your Paycheck</h2>
            <p className="text-blue-200 mb-6 leading-relaxed">
              Every calculation uses official {TAX_YEAR} IRS tax brackets (updated from IRS Rev. Proc. 2025-32),
              the standard deduction for your filing status, and each state&apos;s current tax law. FICA taxes
              (Social Security 6.2% + Medicare 1.45%) are applied to all wages. No ads, no signup required —
              just accurate, instant results.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 text-left">
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-bold text-white mb-1">Federal Tax</p>
                <p className="text-blue-200 text-sm">{TAX_YEAR} IRS brackets: 10%, 12%, 22%, 24%, 32%, 35%, 37%. Progressive — only income above each threshold is taxed at the higher rate.</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-bold text-white mb-1">State Tax</p>
                <p className="text-blue-200 text-sm">All 50 states. 9 states have zero income tax. Others use flat rates (2.5%–6.2%) or progressive brackets (up to 13.3% in California).</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4">
                <p className="font-bold text-white mb-1">FICA</p>
                <p className="text-blue-200 text-sm">Social Security: 6.2% on first $184,500. Medicare: 1.45% on all wages (+0.9% on wages above $200K). Same in all states.</p>
              </div>
            </div>
            <div className="mt-6">
              <Link href="/about" className="text-blue-300 hover:text-white text-sm underline">
                Full methodology and data sources →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
