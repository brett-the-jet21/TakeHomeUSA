export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("texas-vs-california-taxes-2026")!;

export const metadata: Metadata = {
  title: POST.metaTitle,
  description: POST.description,
  alternates: { canonical: "https://www.takehomeusa.com/blog/texas-vs-california-taxes-2026" },
  openGraph: {
    title: POST.title,
    description: POST.description,
    url: "https://www.takehomeusa.com/blog/texas-vs-california-taxes-2026",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

const SALARY_LEVELS = [50_000, 75_000, 100_000, 150_000, 200_000];

export default function TexasVsCaliforniaPost() {
  const texasCfg    = ALL_STATE_CONFIGS.find((s) => s.slug === "texas")!;
  const californiaCfg = ALL_STATE_CONFIGS.find((s) => s.slug === "california")!;

  const rows = SALARY_LEVELS.map((gross) => {
    const tx = calculateTax(texasCfg, gross);
    const ca = calculateTax(californiaCfg, gross);
    return {
      gross,
      txTakeHome:  tx.takeHome,
      caTakeHome:  ca.takeHome,
      diff:        tx.takeHome - ca.takeHome,
      txEffRate:   tx.effectiveTotalRate,
      caEffRate:   ca.effectiveTotalRate,
      caStateTax:  ca.stateTax,
    };
  });

  // Use $100K row for headline numbers
  const r100 = rows.find((r) => r.gross === 100_000)!;
  const r75  = rows.find((r) => r.gross === 75_000)!;
  const r200 = rows.find((r) => r.gross === 200_000)!;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: POST.title,
    datePublished: POST.date,
    dateModified: POST.date,
    author:    { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    url: "https://www.takehomeusa.com/blog/texas-vs-california-taxes-2026",
    mainEntityOfPage: "https://www.takehomeusa.com/blog/texas-vs-california-taxes-2026",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much more do you keep in Texas vs California?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a $100,000 salary in ${TAX_YEAR}, Texas residents take home ${fmt(r100.txTakeHome)}/year vs ${fmt(r100.caTakeHome)}/year in California — a difference of ${fmt(r100.diff)}/year (${fmt(r100.diff / 12)}/month). The gap grows at higher incomes: on $200K, the difference is ${fmt(r200.diff)}/year.`,
        },
      },
      {
        "@type": "Question",
        name: "Does Texas have state income tax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `No. Texas has no state income tax. Residents pay only federal income tax and FICA (Social Security + Medicare). On a $100K salary in ${TAX_YEAR}, Texans keep ${fmt(r100.txTakeHome)}/year with an effective total rate of ${pct(r100.txEffRate)}.`,
        },
      },
      {
        "@type": "Question",
        name: "What is California's income tax rate?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `California has the highest state income tax in the US, with marginal rates from 1% to 13.3% (for income over $1M). On a $100K salary in ${TAX_YEAR}, California's effective state income tax rate is approximately ${pct(r100.caStateTax / 100_000)}, costing about ${fmt(r100.caStateTax)} in state tax alone.`,
        },
      },
      {
        "@type": "Question",
        name: "Is it worth moving from California to Texas for taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a $100K salary, moving from California to Texas saves ${fmt(r100.diff)}/year in taxes — equivalent to ${fmt(r100.diff / 12)}/month. At $150K, the savings jump higher. However, consider that California may offer higher salaries in some industries, and Texas has higher property taxes (typically 1.5–2.5% vs California's Prop 13 cap of ~1.1%).`,
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",  item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog",  item: "https://www.takehomeusa.com/blog" },
      { "@type": "ListItem", position: 3, name: POST.title, item: "https://www.takehomeusa.com/blog/texas-vs-california-taxes-2026" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="container-page max-w-3xl py-10 sm:py-14">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-700">Blog</Link>
          <span>/</span>
          <span className="text-gray-800">Texas vs California Taxes</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
            {POST.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-3 leading-tight">
            {POST.title}
          </h1>
          <p className="text-gray-400 text-sm">{POST.readTime} min read · Updated for {TAX_YEAR} · Single filer, standard deduction</p>
        </header>

        {/* Lead */}
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          Texas has <strong>zero state income tax</strong>. California has rates up to <strong>13.3%</strong> — the
          highest in the nation. On a $100K salary in {TAX_YEAR}, that difference translates to{" "}
          <strong>{fmt(r100.diff)}/year</strong> ({fmt(r100.diff / 12)}/month) more take-home pay in Texas.
        </p>
        <p className="text-gray-700 mb-8">
          Below is the exact, computed take-home pay at five common salary levels — $50K through $200K —
          so you can see precisely what the gap means for your paycheck.
        </p>

        {/* ── Headline stat cards ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "TX Take-Home ($100K)", value: fmt(r100.txTakeHome), sub: `${pct(r100.txEffRate)} effective rate` },
            { label: "CA Take-Home ($100K)", value: fmt(r100.caTakeHome), sub: `${pct(r100.caEffRate)} effective rate` },
            { label: "Annual Difference",    value: fmt(r100.diff),       sub: `${fmt(r100.diff / 12)}/month` },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Comparison table ──────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Texas vs California Take-Home Pay — {TAX_YEAR}
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-3">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Salary</th>
                <th>Texas Take-Home</th>
                <th>California Take-Home</th>
                <th>TX Wins By</th>
                <th>CA State Tax</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.gross} className={r.gross === 100_000 ? "bg-blue-50/40 font-semibold" : ""}>
                  <td className="font-semibold text-gray-900">{fmt(r.gross)}</td>
                  <td className="text-green-700 font-bold tabular-nums">{fmt(r.txTakeHome)}</td>
                  <td className="text-blue-700 tabular-nums">{fmt(r.caTakeHome)}</td>
                  <td className="text-orange-600 font-bold tabular-nums">{fmt(r.diff)}</td>
                  <td className="text-red-500 tabular-nums">{fmt(r.caStateTax)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mb-10">
          Single filer, standard deduction ($16,100), {TAX_YEAR} IRS + CA FTB brackets. Does not include local/city taxes
          (e.g. NYC surcharge). Highlighted row = $100K.
        </p>

        {/* ── How the gap works ─────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Why the Gap Exists</h2>
        <p className="text-gray-700 mb-4">
          The entire difference comes from <strong>California's state income tax</strong>. Both states pay the same federal
          income tax and FICA (Social Security + Medicare). The only variable is the state layer:
        </p>
        <ul className="space-y-3 text-gray-700 mb-8">
          <li className="flex gap-2">
            <span className="text-green-500 font-bold flex-shrink-0">TX</span>
            <span>
              <strong>Texas state income tax: $0.</strong> No state income tax code, no state tax return to file.
              Every dollar saved is take-home pay.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 font-bold flex-shrink-0">CA</span>
            <span>
              <strong>California state income tax: up to 13.3%.</strong> On a $100K salary, California's effective
              state rate is ~{pct(r100.caStateTax / 100_000)}, costing {fmt(r100.caStateTax)} in state tax.
              California also levies a 1% Mental Health Services Tax on income over $1M.
            </span>
          </li>
        </ul>

        {/* ── The gap at different income levels ────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">How the Gap Grows With Income</h2>
        <p className="text-gray-700 mb-6">
          Because California's tax system is steeply progressive, the gap between Texas and California
          widens significantly as income rises:
        </p>
        <div className="space-y-3 mb-10">
          {rows.map((r) => {
            const pctMore = ((r.diff / r.caTakeHome) * 100).toFixed(1);
            return (
              <div key={r.gross} className="flex items-center gap-3">
                <div className="w-20 text-sm font-semibold text-gray-600 flex-shrink-0">{fmt(r.gross)}</div>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full flex items-center justify-end pr-3"
                    style={{ width: `${Math.min(100, (r.diff / r200.diff) * 100)}%` }}
                  >
                    <span className="text-xs font-bold text-white">{fmt(r.diff)}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 flex-shrink-0 w-16 text-right">{pctMore}% more</div>
              </div>
            );
          })}
        </div>

        {/* ── What California's taxes pay for ───────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">The Full Picture: What Texas Doesn't Have</h2>
        <p className="text-gray-700 mb-4">
          No state income tax doesn't mean no taxes. Before relocating for the tax savings, consider:
        </p>
        <div className="grid sm:grid-cols-2 gap-4 mb-10">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5">
            <p className="font-bold text-amber-900 mb-2">Texas Higher Property Tax</p>
            <p className="text-sm text-amber-800">
              Texas property tax rates average <strong>1.5–2.5%</strong> of assessed value — among the highest in the US.
              On a $400K home, that's $6,000–$10,000/year in property tax. California's Prop 13 caps increases at ~1.1%
              of purchase price.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <p className="font-bold text-blue-900 mb-2">Cost of Living Differences</p>
            <p className="text-sm text-blue-800">
              Major Texas metros (Austin, Dallas, Houston) are significantly cheaper than LA or the Bay Area —
              but Austin has seen rapid appreciation. The tax savings compound on top of lower housing costs
              in most TX markets.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <p className="font-bold text-green-900 mb-2">High Income? Gap Is Even Larger</p>
            <p className="text-sm text-green-800">
              At $200K, the Texas advantage is {fmt(r200.diff)}/year. California's 9.3% bracket kicks in
              at $66,296, and 10.3% at $338,639 — so every dollar above those thresholds costs more.
            </p>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-5">
            <p className="font-bold text-purple-900 mb-2">Remote Workers: Biggest Win</p>
            <p className="text-sm text-purple-800">
              Remote workers who can live anywhere capture 100% of the tax savings while keeping a
              California (or higher) salary. A {fmt(r100.diff)}/year raise with no actual raise.
            </p>
          </div>
        </div>

        {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-6 mb-10">
          <div>
            <h3 className="font-bold text-gray-900 mb-1">How much more do you keep in Texas vs California on $75K?</h3>
            <p className="text-gray-700">
              On a $75,000 salary in {TAX_YEAR}, Texas take-home is {fmt(r75.txTakeHome)}/year vs{" "}
              {fmt(r75.caTakeHome)}/year in California — a difference of {fmt(r75.diff)}/year
              ({fmt(r75.diff / 12)}/month).
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Do remote workers owe California taxes if they move to Texas?</h3>
            <p className="text-gray-700">
              Generally no — once you establish Texas residency, you owe California state income tax only on
              California-sourced income. If your employer is in California but you work from Texas, the rules
              are nuanced; consult a tax professional. Many remote workers who fully relocate to Texas owe
              $0 in California state taxes.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-gray-900 mb-1">Is California's tax rate 13.3% on all income?</h3>
            <p className="text-gray-700">
              No — California uses a progressive tax system. The 13.3% rate applies only to income over $1M
              (single filer). On a $100K salary, only the income above each bracket threshold is taxed at that
              bracket's rate. The <em>effective</em> California state rate on $100K is approximately{" "}
              {pct(r100.caStateTax / 100_000)}.
            </p>
          </div>
        </div>

        {/* ── CTA ───────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-2">See Your Exact Numbers</h2>
          <p className="text-blue-300 text-sm mb-4">
            Enter your salary and compare Texas vs California side by side — or any two states.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/compare/texas-vs-california"
              className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
            >
              Texas vs California →
            </Link>
            <Link
              href="/"
              className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm"
            >
              Open Calculator
            </Link>
          </div>
        </div>

      </article>
    </>
  );
}
