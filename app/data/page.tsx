export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";

export const metadata: Metadata = {
  title: `Salary After-Tax Data Hub — All 50 States (${TAX_YEAR})`,
  description: `Pre-computed salary after-tax tables for all 50 US states at popular salary levels — $50K, $75K, $100K, $150K, $200K. Ranked, citable, and ready to reference. ${TAX_YEAR} IRS data.`,
  alternates: { canonical: "https://www.takehomeusa.com/data" },
  openGraph: {
    title: `US Salary After-Tax Data — All 50 States (${TAX_YEAR}) | TakeHomeUSA`,
    description: "Ranked take-home pay tables across all 50 states at $50K, $75K, $100K, $150K, and $200K salary levels. Free to cite and reference.",
    url: "https://www.takehomeusa.com/data",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

// Pre-compute all data at build time
const SHOWCASE_SALARIES = [50_000, 75_000, 100_000, 150_000, 200_000];

type StateResult = { cfg: (typeof ALL_STATE_CONFIGS)[0]; take: number; monthly: number; totalTax: number; effRate: number };

function rankStates(salary: number): StateResult[] {
  return ALL_STATE_CONFIGS
    .map((cfg) => {
      const tax = calculateTax(cfg, salary);
      return {
        cfg,
        take: Math.round(tax.takeHome),
        monthly: Math.round(tax.takeHome / 12),
        totalTax: Math.round(tax.totalTax),
        effRate: tax.effectiveTotalRate,
      };
    })
    .sort((a, b) => b.take - a.take);
}

// Build all datasets at module level (server component, build time)
const DATA_BY_SALARY = Object.fromEntries(
  SHOWCASE_SALARIES.map((s) => [s, rankStates(s)])
) as Record<number, StateResult[]>;

// State tax penalty table (vs. best no-tax state on $100K)
const ref100k = DATA_BY_SALARY[100_000];
const bestTake100 = ref100k[0].take;
const taxPenalty = ref100k
  .filter((r) => !r.cfg.noTax)
  .slice(0, 15)
  .map((r) => ({ ...r, gap: bestTake100 - r.take }));

// 10-year compound table
const no10yr = ref100k[0].take * 10;
const worst10yr = ref100k[ref100k.length - 1].take * 10;

const datasetSchema = {
  "@context": "https://schema.org",
  "@type": "Dataset",
  name: `US Salary After-Tax Data — All 50 States (${TAX_YEAR})`,
  description: `Pre-computed take-home pay for popular salary levels across all 50 US states, using ${TAX_YEAR} IRS federal tax brackets and state income tax rates.`,
  url: "https://www.takehomeusa.com/data",
  creator: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  dateModified: `${TAX_YEAR}-01-01`,
  license: "https://creativecommons.org/licenses/by/4.0/",
  variableMeasured: ["Take-Home Pay", "Federal Tax", "State Tax", "FICA Tax", "Effective Tax Rate"],
  spatialCoverage: { "@type": "Country", name: "United States" },
};

export default function DataPage() {
  const r100k = DATA_BY_SALARY[100_000];
  const noTaxStates = r100k.filter((r) => r.cfg.noTax);
  const topTaxHit = r100k.filter((r) => !r.cfg.noTax).slice(-5).reverse();
  const txR = r100k.find((r) => r.cfg.slug === "texas")!;
  const caR = r100k.find((r) => r.cfg.slug === "california")!;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(datasetSchema) }} />

      <main className="container-page py-12 max-w-5xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Data Hub</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-900 text-white rounded-2xl p-8 mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            {TAX_YEAR} IRS Data · All 50 States · Free to Cite
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Salary After-Tax Data Hub
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Pre-computed take-home pay tables, state rankings, and headline statistics
            for journalists, bloggers, and researchers. All data uses official {TAX_YEAR} IRS brackets.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-sm">
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">Single filer</span>
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">Standard deduction</span>
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">IRS Rev. Proc. 2025-32</span>
            <Link href="/methodology" className="bg-blue-600/40 border border-blue-400/30 rounded-lg px-3 py-1.5 text-blue-200 hover:text-white transition-colors">
              Full methodology →
            </Link>
          </div>
        </div>

        {/* Headline Stats Callouts */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Headline Statistics — Ready to Quote</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                stat: `${fmt(txR.take - caR.take)}/yr`,
                label: "More take-home in Texas vs California on $100K salary",
                detail: `TX: ${fmt(txR.take)} · CA: ${fmt(caR.take)}`,
                url: "/compare/texas-vs-california",
                color: "green",
              },
              {
                stat: `${fmt(bestTake100 - r100k[r100k.length - 1].take)}/yr`,
                label: "Gap between best and worst state for a $100K salary",
                detail: `Best: ${r100k[0].cfg.name} · Worst: ${r100k[r100k.length - 1].cfg.name}`,
                url: "/after-tax/100000-a-year-after-tax",
                color: "blue",
              },
              {
                stat: `${fmt(no10yr - worst10yr)}`,
                label: "10-year extra take-home: best vs worst state on $100K/yr",
                detail: "Without investment growth",
                url: "/compare/texas-vs-california",
                color: "indigo",
              },
              {
                stat: "9 states",
                label: "US states with zero state income tax",
                detail: "AK, FL, NV, NH, SD, TN, TX, WA, WY",
                url: "/blog/states-with-no-income-tax",
                color: "green",
              },
              {
                stat: pct(caR.effRate),
                label: "Effective all-in tax rate in California on $100K",
                detail: `Federal + state + FICA`,
                url: "/salary/100000-salary-after-tax-california",
                color: "red",
              },
              {
                stat: pct(txR.effRate),
                label: "Effective all-in tax rate in Texas on $100K",
                detail: "Federal + FICA only (no state tax)",
                url: "/salary/100000-salary-after-tax-texas",
                color: "green",
              },
            ].map(({ stat, label, detail, url, color }) => (
              <Link
                key={stat + label}
                href={url}
                className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5 hover:border-${color}-400 hover:shadow-md transition-all`}
              >
                <p className={`text-2xl sm:text-3xl font-black text-${color}-700 mb-2`}>{stat}</p>
                <p className="font-semibold text-gray-900 text-sm mb-1">{label}</p>
                <p className={`text-xs text-${color}-600`}>{detail}</p>
                <p className={`text-xs text-${color}-500 mt-2 font-semibold`}>Full data →</p>
              </Link>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Source: TakeHomeUSA analysis using {TAX_YEAR} IRS Rev. Proc. 2025-32 brackets. Single filer, standard deduction.{" "}
            <Link href="/methodology" className="text-blue-500 hover:underline">Full methodology →</Link>
          </p>
        </section>

        {/* All-States Tables by Salary */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Take-Home Pay by State — Popular Salary Levels</h2>
          <p className="text-gray-500 mb-8">
            Top 10 and bottom 5 states for each salary level. Click any salary for the full 50-state table.
          </p>
          <div className="space-y-10">
            {SHOWCASE_SALARIES.map((salary) => {
              const ranked = DATA_BY_SALARY[salary];
              const top10 = ranked.slice(0, 10);
              const bottom5 = ranked.slice(-5).reverse();
              const best = ranked[0];
              const worst = ranked[ranked.length - 1];
              const fmtSalary = salary.toLocaleString("en-US");

              return (
                <div key={salary} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-4 flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">${fmtSalary}/year After Taxes</h3>
                      <p className="text-sm text-gray-500">
                        Range: {fmt(best.take)}/yr ({best.cfg.name}) → {fmt(worst.take)}/yr ({worst.cfg.name})
                        · Gap: {fmt(best.take - worst.take)}/yr
                      </p>
                    </div>
                    <Link
                      href={`/after-tax/${salary}-a-year-after-tax`}
                      className="text-blue-600 text-sm font-semibold hover:underline"
                    >
                      All 50 states →
                    </Link>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-gray-200 bg-white">
                          <th className="text-left px-5 py-3 font-bold text-gray-600">Rank</th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600">State</th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600">Take-Home/Year</th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600">Monthly</th>
                          <th className="text-left px-5 py-3 font-bold text-gray-600">Eff. Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {top10.map((r, i) => (
                          <tr key={r.cfg.slug} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                            <td className="px-5 py-3 font-bold text-gray-400">#{i + 1}</td>
                            <td className="px-5 py-3">
                              <Link href={`/${r.cfg.slug}`} className="font-semibold text-gray-900 hover:text-blue-700 transition-colors">
                                {r.cfg.name}
                              </Link>
                              {r.cfg.noTax && (
                                <span className="ml-2 text-xs text-green-600 font-semibold bg-green-50 px-1.5 py-0.5 rounded-full">no state tax</span>
                              )}
                            </td>
                            <td className="px-5 py-3 font-bold tabular-nums text-green-700">{fmt(r.take)}</td>
                            <td className="px-5 py-3 tabular-nums text-gray-600">{fmt(r.monthly)}/mo</td>
                            <td className="px-5 py-3 tabular-nums text-gray-600">{pct(r.effRate)}</td>
                          </tr>
                        ))}
                        <tr className="border-b-2 border-t-2 border-dashed border-gray-200">
                          <td colSpan={5} className="px-5 py-2 text-xs text-center text-gray-400">— bottom 5 states —</td>
                        </tr>
                        {bottom5.map((r, i) => (
                          <tr key={r.cfg.slug} className="border-b border-gray-100 bg-red-50/30">
                            <td className="px-5 py-3 font-bold text-gray-400">#{50 - 4 + i}</td>
                            <td className="px-5 py-3">
                              <Link href={`/${r.cfg.slug}`} className="font-semibold text-gray-900 hover:text-blue-700 transition-colors">
                                {r.cfg.name}
                              </Link>
                            </td>
                            <td className="px-5 py-3 font-bold tabular-nums text-red-700">{fmt(r.take)}</td>
                            <td className="px-5 py-3 tabular-nums text-gray-600">{fmt(r.monthly)}/mo</td>
                            <td className="px-5 py-3 tabular-nums text-gray-600">{pct(r.effRate)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* No-Tax States Snapshot */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No-Income-Tax States — $100K Take-Home</h2>
          <p className="text-gray-500 mb-6">
            All 9 states with no state income tax — showing identical federal + FICA burden.{" "}
            <Link href="/blog/states-with-no-income-tax" className="text-blue-600 hover:underline">Full guide →</Link>
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            {noTaxStates.map((r) => (
              <Link
                key={r.cfg.slug}
                href={`/salary/100000-salary-after-tax-${r.cfg.slug}`}
                className="bg-green-50 border border-green-200 rounded-xl p-5 hover:border-green-400 hover:shadow-sm transition-all"
              >
                <p className="font-bold text-gray-900 mb-1">{r.cfg.name}</p>
                <p className="text-2xl font-black text-green-700">{fmt(r.take)}</p>
                <p className="text-xs text-green-600 mt-1">{fmt(r.monthly)}/mo · {pct(r.effRate)} eff. rate</p>
                <p className="text-xs text-gray-400 mt-2">No state income tax</p>
              </Link>
            ))}
          </div>
        </section>

        {/* State Tax Penalty Table */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">State Tax Penalty — $100K Salary</h2>
          <p className="text-gray-500 mb-6">
            How much less you keep per year in each state compared to the best no-tax state ({r100k[0].cfg.name}).
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-bold text-gray-700">State</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Take-Home</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">State Tax Penalty/yr</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">10-Year Cost</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Top State Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {taxPenalty.map((r, i) => (
                    <tr key={r.cfg.slug} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                      <td className="px-5 py-3">
                        <Link href={`/${r.cfg.slug}`} className="font-semibold text-gray-900 hover:text-blue-700">
                          {r.cfg.name}
                        </Link>
                      </td>
                      <td className="px-5 py-3 tabular-nums text-blue-700 font-semibold">{fmt(r.take)}</td>
                      <td className="px-5 py-3 tabular-nums text-red-600 font-bold">−{fmt(r.gap)}</td>
                      <td className="px-5 py-3 tabular-nums text-red-500 text-sm">−{fmt(r.gap * 10)}</td>
                      <td className="px-5 py-3 text-gray-500 text-sm">{r.cfg.topRateDisplay}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Penalty = take-home gap vs. {r100k[0].cfg.name} (highest take-home no-tax state). Single filer, standard deduction, {TAX_YEAR}.
          </p>
        </section>

        {/* Popular Compare Links */}
        <section className="mb-14">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Popular State Comparisons</h2>
          <p className="text-gray-500 mb-6">Most-referenced state-vs-state take-home comparisons.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              ["texas", "california"], ["texas", "new-york"], ["florida", "new-york"],
              ["washington", "california"], ["nevada", "california"], ["texas", "illinois"],
              ["florida", "california"], ["texas", "new-jersey"], ["wyoming", "new-york"],
            ].map(([s1, s2]) => {
              const cfg1 = STATE_BY_SLUG.get(s1)!;
              const cfg2 = STATE_BY_SLUG.get(s2)!;
              const t1 = calculateTax(cfg1, 100_000);
              const t2 = calculateTax(cfg2, 100_000);
              const diff = Math.abs(Math.round(t1.takeHome - t2.takeHome));
              const winner = t1.takeHome > t2.takeHome ? cfg1.name : cfg2.name;
              return (
                <Link
                  key={`${s1}-${s2}`}
                  href={`/compare/${s1}-vs-${s2}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900 text-sm mb-1 capitalize">
                    {cfg1.name} vs {cfg2.name}
                  </p>
                  <p className="text-green-700 font-semibold text-sm">
                    {winner} keeps {fmt(diff)} more/yr
                  </p>
                  <p className="text-xs text-gray-400 mt-1">on $100K salary</p>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Citation block */}
        <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-blue-900 mb-3">Citing This Data</h2>
          <p className="text-sm text-blue-800 leading-relaxed mb-4">
            All data on this page is free to cite with attribution. Suggested citation:
          </p>
          <div className="bg-white border border-blue-100 rounded-xl p-4 font-mono text-sm text-gray-700">
            TakeHomeUSA. ({TAX_YEAR}). Salary After-Tax Data — All 50 US States [Dataset].
            Retrieved from https://www.takehomeusa.com/data.
            Data based on {TAX_YEAR} IRS Rev. Proc. 2025-32 tax brackets.
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href="/press" className="text-blue-700 text-sm font-semibold hover:underline">Press & media resources →</Link>
            <Link href="/methodology" className="text-blue-700 text-sm font-semibold hover:underline">Full methodology →</Link>
            <Link href="/embed" className="text-blue-700 text-sm font-semibold hover:underline">Embed widgets →</Link>
          </div>
        </section>
      </main>
    </>
  );
}
