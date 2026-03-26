export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";

export const metadata: Metadata = {
  title: `Best States for Take-Home Pay — Relocation Guide ${TAX_YEAR}`,
  description: `Which US state gives you the most take-home pay? Ranked salary comparison across all 50 states — no-tax states, high-tax traps, and the real dollar impact on $50K–$200K salaries.`,
  alternates: { canonical: "https://www.takehomeusa.com/relocate" },
  openGraph: {
    title: `Best States for Take-Home Pay — Where Does Your Salary Go Furthest? (${TAX_YEAR})`,
    description: "Complete relocation guide for salary-maximizers: no-tax states ranked, state tax penalties, and exact take-home at every income level.",
    url: "https://www.takehomeusa.com/relocate",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

// Pre-compute all comparison data at build time
const COMPARE_SALARIES = [50_000, 75_000, 100_000, 150_000, 200_000];

const noTaxStates = ALL_STATE_CONFIGS.filter((s) => s.noTax);
const taxedStates = ALL_STATE_CONFIGS.filter((s) => !s.noTax);

// Build no-tax state data at $100K
const noTaxData = noTaxStates.map((cfg) => {
  const t = calculateTax(cfg, 100_000);
  return { cfg, take: Math.round(t.takeHome), monthly: Math.round(t.takeHome / 12), effRate: t.effectiveTotalRate };
});

// Build multi-salary comparison for top move destinations
const TOP_MOVE_STATES = ["texas", "florida", "nevada", "washington", "wyoming"];
const HIGH_TAX_STATES = ["california", "new-york", "new-jersey", "oregon", "minnesota"];

const moveStateData = TOP_MOVE_STATES.map((slug) => {
  const cfg = STATE_BY_SLUG.get(slug)!;
  const bySlug = COMPARE_SALARIES.map((salary) => {
    const t = calculateTax(cfg, salary);
    return { salary, take: Math.round(t.takeHome) };
  });
  return { cfg, bySlug };
});

const highTaxData = HIGH_TAX_STATES.map((slug) => {
  const cfg = STATE_BY_SLUG.get(slug)!;
  const bySlug = COMPARE_SALARIES.map((salary) => {
    const t = calculateTax(cfg, salary);
    return { salary, take: Math.round(t.takeHome) };
  });
  return { cfg, bySlug };
});

// Texas vs California gap by salary
const txCaGap = COMPARE_SALARIES.map((salary) => {
  const tx = calculateTax(STATE_BY_SLUG.get("texas")!, salary);
  const ca = calculateTax(STATE_BY_SLUG.get("california")!, salary);
  const ny = calculateTax(STATE_BY_SLUG.get("new-york")!, salary);
  return {
    salary,
    txTake: Math.round(tx.takeHome),
    caTake: Math.round(ca.takeHome),
    nyTake: Math.round(ny.takeHome),
    txVsCa: Math.round(tx.takeHome - ca.takeHome),
    txVsNy: Math.round(tx.takeHome - ny.takeHome),
  };
});

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: `Best States for Take-Home Pay — Relocation Guide ${TAX_YEAR}`,
  description: "Complete guide to which US states maximize salary after-tax. Covers no-tax states, state tax comparisons, and salary-level analysis for $50K–$200K earners.",
  url: "https://www.takehomeusa.com/relocate",
  author: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  dateModified: `${TAX_YEAR}-01-01`,
};

export default function RelocatePage() {
  const txR = noTaxData.find((d) => d.cfg.slug === "texas")!;
  const flR = noTaxData.find((d) => d.cfg.slug === "florida")!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <main className="container-page py-12 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Relocation Guide</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-green-900 to-blue-900 text-white rounded-2xl p-8 mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {TAX_YEAR} · All 50 States Compared
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Best States for Take-Home Pay
          </h1>
          <p className="text-green-100 text-lg max-w-2xl">
            Where does your salary go furthest after taxes? This guide compares
            all 50 states — no-tax havens, high-tax traps, and the exact dollar
            impact on real income levels.
          </p>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-black text-green-300">{fmt(txR.take - (highTaxData.find(d => d.cfg.slug === "california")?.bySlug.find(b => b.salary === 100_000)?.take ?? 0))}</p>
              <p className="text-green-100 text-sm mt-1">TX keeps more than CA on $100K/yr</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-black text-green-300">9 states</p>
              <p className="text-green-100 text-sm mt-1">with zero state income tax</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4">
              <p className="text-2xl font-black text-green-300">13.3%</p>
              <p className="text-green-100 text-sm mt-1">California&apos;s top state tax rate</p>
            </div>
          </div>
        </div>

        <div className="space-y-14">

          {/* No-Tax States */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">The 9 No Income Tax States</h2>
            <p className="text-gray-500 mb-6">
              These states levy zero state income tax on wages — you keep everything above federal + FICA.
              All nine states yield identical take-home for the same salary.
            </p>
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
              {noTaxData.map(({ cfg, take, monthly, effRate }) => (
                <Link
                  key={cfg.slug}
                  href={`/${cfg.slug}`}
                  className="bg-green-50 border border-green-200 rounded-xl p-5 hover:border-green-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900 mb-1">{cfg.name}</p>
                  <p className="text-2xl font-black text-green-700">{fmt(take)}</p>
                  <p className="text-sm text-green-600 mt-1">{fmt(monthly)}/mo after taxes</p>
                  <p className="text-xs text-gray-400 mt-2">{pct(effRate)} all-in eff. rate on $100K</p>
                </Link>
              ))}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-sm text-gray-700">
              <p><strong>Why all 9 give the same take-home:</strong> Since state tax = $0 for all, federal income
              tax and FICA are the only taxes. These are identical across states, so a $100K salary
              nets the same {fmt(txR.take)}/year in Texas, Florida, Nevada, or any other no-tax state
              (ignoring city/local taxes).</p>
            </div>
          </section>

          {/* Multi-Salary Comparison — No-Tax vs High-Tax */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Take-Home at Every Salary — No-Tax vs High-Tax States</h2>
            <p className="text-gray-500 mb-6">
              How much more you keep in Texas (no state tax) vs California and New York at each income level.
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-bold text-gray-700">Salary</th>
                      <th className="text-left px-5 py-3 font-bold text-green-700">Texas Take-Home</th>
                      <th className="text-left px-5 py-3 font-bold text-blue-700">California Take-Home</th>
                      <th className="text-left px-5 py-3 font-bold text-blue-700">New York Take-Home</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-700">TX vs CA Edge</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-700">10-Year Gap (TX vs CA)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {txCaGap.map(({ salary, txTake, caTake, nyTake, txVsCa, txVsNy }, i) => (
                      <tr key={salary} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-5 py-3 font-bold text-gray-900">
                          <Link href={`/after-tax/${salary}-a-year-after-tax`} className="hover:text-blue-700 transition-colors">
                            ${salary.toLocaleString()}
                          </Link>
                        </td>
                        <td className="px-5 py-3 font-bold tabular-nums text-green-700">{fmt(txTake)}</td>
                        <td className="px-5 py-3 tabular-nums text-blue-700">{fmt(caTake)}</td>
                        <td className="px-5 py-3 tabular-nums text-blue-700">{fmt(nyTake)}</td>
                        <td className="px-5 py-3 font-bold tabular-nums text-gray-900">+{fmt(txVsCa)}/yr</td>
                        <td className="px-5 py-3 tabular-nums text-gray-600">+{fmt(txVsCa * 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              Single filer, standard deduction, {TAX_YEAR} IRS brackets. State tax only — city/local taxes not included.
            </p>
          </section>

          {/* Popular Move Destinations */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Most Popular Low-Tax Move Destinations</h2>
            <p className="text-gray-500 mb-6">Take-home pay at key salary levels in the most popular no-income-tax states.</p>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-green-50 border-b border-gray-200">
                      <th className="text-left px-5 py-3 font-bold text-gray-700">State</th>
                      {COMPARE_SALARIES.map((s) => (
                        <th key={s} className="text-left px-4 py-3 font-bold text-gray-700">${(s / 1000).toFixed(0)}K</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {moveStateData.map(({ cfg, bySlug }, i) => (
                      <tr key={cfg.slug} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-5 py-3">
                          <Link href={`/${cfg.slug}`} className="font-bold text-gray-900 hover:text-blue-700 transition-colors">
                            {cfg.name}
                          </Link>
                          <span className="ml-2 text-xs text-green-600 font-semibold">no state tax</span>
                        </td>
                        {bySlug.map(({ salary, take }) => (
                          <td key={salary} className="px-4 py-3 tabular-nums font-semibold text-green-700">
                            <Link href={`/salary/${salary}-salary-after-tax-${cfg.slug}`} className="hover:underline">
                              {fmt(take)}
                            </Link>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          {/* High-Tax Warning */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">High-Tax States — The Real Cost</h2>
            <p className="text-gray-500 mb-6">
              How much less you keep in the highest-tax states — same salary, dramatically lower take-home.
            </p>
            <div className="overflow-hidden rounded-2xl border border-red-200 shadow-sm">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-red-50 border-b border-red-200">
                      <th className="text-left px-5 py-3 font-bold text-gray-700">State</th>
                      <th className="text-left px-5 py-3 font-bold text-gray-700">Top State Rate</th>
                      {COMPARE_SALARIES.map((s) => (
                        <th key={s} className="text-left px-4 py-3 font-bold text-gray-700">${(s / 1000).toFixed(0)}K</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {highTaxData.map(({ cfg, bySlug }, i) => (
                      <tr key={cfg.slug} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                        <td className="px-5 py-3">
                          <Link href={`/${cfg.slug}`} className="font-bold text-gray-900 hover:text-blue-700 transition-colors">
                            {cfg.name}
                          </Link>
                        </td>
                        <td className="px-5 py-3 text-red-600 font-semibold text-sm">{cfg.topRateDisplay}</td>
                        {bySlug.map(({ salary, take }) => (
                          <td key={salary} className="px-4 py-3 tabular-nums text-red-700">
                            <Link href={`/salary/${salary}-salary-after-tax-${cfg.slug}`} className="hover:underline">
                              {fmt(take)}
                            </Link>
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">Single filer, standard deduction, {TAX_YEAR}.</p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Relocation Tax FAQ</h2>
            <div className="grid sm:grid-cols-2 gap-5">
              {[
                {
                  q: "Which state is best for remote workers who want to maximize take-home?",
                  a: `Any of the 9 no-income-tax states will maximize your take-home: Alaska, Florida, Nevada, New Hampshire (wages), South Dakota, Tennessee, Texas, Washington, Wyoming. Among these, Texas and Florida are the most popular for remote workers due to population size, job markets, and infrastructure. At a $100K salary, these states yield approximately ${fmt(txR.take)}/year — compared to ${fmt(highTaxData.find(d => d.cfg.slug === "california")!.bySlug.find(b => b.salary === 100_000)!.take)}/year in California.`,
                },
                {
                  q: "Is moving from California to Texas worth it financially?",
                  a: `On pure income tax savings: yes, significantly. The annual take-home difference ranges from +$4,200 at $50K to +$18,000+ at $200K. Over 10 years, that's $42,000–$180,000 in extra take-home at typical tech salary levels. However, consider cost of living, housing, healthcare access, and quality of life factors before deciding. Texas has no state income tax but higher property taxes in many metro areas.`,
                },
                {
                  q: "Do I owe state taxes in my old state after moving?",
                  a: "Generally, you owe state income tax in the state where you are a resident for each part of the year. If you move mid-year, you file as a part-year resident in both states. States like California aggressively audit out-of-state moves — ensure you formally establish domicile in your new state with updated voter registration, driver's license, and other documentation.",
                },
                {
                  q: "What about cost of living — does moving to a no-tax state actually save money?",
                  a: "Tax savings are real and quantifiable; cost-of-living adjustments require more research. Texas and Florida have significantly lower housing costs than California in most metros, amplifying the benefit. Nevada and Washington have higher housing costs in major cities. The income tax benefit is guaranteed; cost of living depends on specific city and lifestyle choices.",
                },
                {
                  q: "Are there states with low income tax and low cost of living?",
                  a: "Tennessee, South Dakota, and Wyoming combine no state income tax with relatively low cost of living. Indiana (3.15% flat tax), Mississippi (4.7%), and Ohio have low taxes and low cost of living but are not zero-tax states. For the combination of zero state income tax + lower cost of living, Tennessee (Nashville), South Dakota, and central Texas metros are often cited.",
                },
                {
                  q: "How does New Hampshire's no-tax status work?",
                  a: "New Hampshire does not tax earned W-2 wages or self-employment income. It historically taxed dividend and interest income at 4% (the 'Interest and Dividends Tax'), but this was eliminated as of January 1, 2025. NH residents now enjoy full zero-income-tax status on all income, same as Texas or Florida.",
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
                  <h3 className="font-bold text-gray-900 mb-3 text-sm">{q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Popular State Comparisons */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">State-vs-State Comparison Pages</h2>
            <p className="text-gray-500 mb-6">Pick two states and see exact take-home differences at every salary level.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                ["texas", "california", "Texas vs California"],
                ["texas", "new-york", "Texas vs New York"],
                ["florida", "new-york", "Florida vs New York"],
                ["washington", "california", "Washington vs California"],
                ["nevada", "california", "Nevada vs California"],
                ["florida", "california", "Florida vs California"],
                ["texas", "new-jersey", "Texas vs New Jersey"],
                ["wyoming", "california", "Wyoming vs California"],
                ["texas", "oregon", "Texas vs Oregon"],
              ].map(([s1, s2, label]) => (
                <Link
                  key={`${s1}-${s2}`}
                  href={`/compare/${s1}-vs-${s2}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-center"
                >
                  <p className="font-semibold text-gray-900 text-sm">{label}</p>
                  <p className="text-blue-600 text-xs mt-1">See comparison →</p>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* CTA */}
        <div className="mt-14 bg-blue-900 text-white rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-3">Calculate your specific salary</h2>
          <p className="text-blue-300 mb-6">Enter your exact salary and see take-home in any state — with optional 401k, health insurance, and filing status adjustments.</p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">
              Open Calculator →
            </Link>
            <Link href="/compare" className="border border-white/30 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm">
              Compare Two States →
            </Link>
            <Link href="/data" className="border border-white/30 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm">
              Full Data Hub →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
