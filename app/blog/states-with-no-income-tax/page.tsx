export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("states-with-no-income-tax")!;

export const metadata: Metadata = {
  title: POST.metaTitle,
  description: POST.description,
  alternates: { canonical: "https://www.takehomeusa.com/blog/states-with-no-income-tax" },
  openGraph: {
    title: POST.title,
    description: POST.description,
    url: "https://www.takehomeusa.com/blog/states-with-no-income-tax",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

const NO_TAX_SLUGS = [
  "alaska", "florida", "nevada", "new-hampshire",
  "south-dakota", "tennessee", "texas", "washington", "wyoming",
];
const HIGH_TAX_SLUGS = ["california", "new-york", "new-jersey", "oregon", "illinois"];

export default function StatesNoIncomeTaxPost() {
  const noTaxStates  = NO_TAX_SLUGS.map((s) => STATE_BY_SLUG.get(s)!).filter(Boolean);
  const highTaxStates = HIGH_TAX_SLUGS.map((s) => STATE_BY_SLUG.get(s)!).filter(Boolean);
  const texasCfg = STATE_BY_SLUG.get("texas")!;
  const txT100   = calculateTax(texasCfg, 100_000);

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: POST.title,
    datePublished: POST.date,
    dateModified: POST.date,
    author:    { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    url: "https://www.takehomeusa.com/blog/states-with-no-income-tax",
    mainEntityOfPage: "https://www.takehomeusa.com/blog/states-with-no-income-tax",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Which states have no state income tax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Nine states have no state income tax on wages: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. New Hampshire taxes interest and dividend income at 3% in 2026, but not wages.",
        },
      },
      {
        "@type": "Question",
        name: "How much more do I take home living in Texas vs California?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a $100,000 salary in ${TAX_YEAR}, Texas residents take home approximately $7,000–$12,000 more per year than California residents due to the absence of state income tax.`,
        },
      },
      {
        "@type": "Question",
        name: "Do no-income-tax states have lower overall taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Not always. No-income-tax states typically offset lost revenue with higher sales, property, or excise taxes. Texas has property taxes of 1.6–2.5% annually and an 8.25% sales tax. However, for wage earners, the net result is almost always more take-home pay compared to high-income-tax states.",
        },
      },
      {
        "@type": "Question",
        name: "Does New Hampshire really have no income tax?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "New Hampshire does not tax wages or salaries. It levies a 3% tax on interest and dividend income in 2026 (phasing out by 2027). If your income is entirely from employment, you pay $0 in NH state income tax.",
        },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.takehomeusa.com/blog" },
      { "@type": "ListItem", position: 3, name: POST.title, item: "https://www.takehomeusa.com/blog/states-with-no-income-tax" },
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
          <span className="text-gray-800">9 States With No Income Tax</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
            {POST.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-3 leading-tight">
            {POST.title}
          </h1>
          <p className="text-gray-400 text-sm">{POST.readTime} min read · Updated for {TAX_YEAR}</p>
        </header>

        {/* Lead */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Nine US states collect <strong>zero state income tax on wages</strong> in {TAX_YEAR}. For a
          full-time worker earning $75K–$150K, that means <strong>thousands of extra dollars</strong> in
          take-home pay every year — no state withholding, no state tax return. Here&apos;s exactly what
          you keep in each state, with real computed numbers.
        </p>

        {/* ── Table 1: All 9 No-Tax States ─────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-10 mb-4">
          Take-Home Pay in All 9 No-Income-Tax States ({TAX_YEAR})
        </h2>
        <p className="text-gray-600 mb-4">
          Single filer, standard deduction ($16,100), {TAX_YEAR} IRS federal brackets. State tax = $0 in all
          nine states, so the only deductions are federal income tax and FICA (Social Security + Medicare).
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-3">
          <table className="tax-table">
            <thead>
              <tr>
                <th>State</th>
                <th>$75K Take-Home</th>
                <th>$75K / Mo</th>
                <th>$100K Take-Home</th>
                <th>$100K / Mo</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              {noTaxStates.map((state) => {
                const t75  = calculateTax(state, 75_000);
                const t100 = calculateTax(state, 100_000);
                return (
                  <tr key={state.slug}>
                    <td className="font-semibold">
                      <Link href={`/${state.slug}`} className="text-blue-700 hover:text-blue-900">
                        {state.name}
                      </Link>
                    </td>
                    <td className="font-bold text-green-700">{fmt(t75.takeHome)}</td>
                    <td className="text-gray-600">{fmt(t75.takeHome / 12)}</td>
                    <td className="font-bold text-green-700">{fmt(t100.takeHome)}</td>
                    <td className="text-gray-600">{fmt(t100.takeHome / 12)}</td>
                    <td>
                      <Link
                        href={`/salary/100000-salary-after-tax-${state.slug}`}
                        className="text-blue-600 text-sm hover:text-blue-800 font-medium"
                      >
                        Full breakdown →
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mb-10">
          All nine no-tax states show identical take-home because federal + FICA rates are the same regardless of state.
        </p>

        {/* ── Table 2: No-Tax vs High-Tax ──────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          No-Tax States vs High-Tax States — $100K Comparison
        </h2>
        <p className="text-gray-600 mb-4">
          The difference between a no-tax state and a high-tax state can exceed{" "}
          <strong>$14,000/year</strong> on a six-figure salary:
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-10">
          <table className="tax-table">
            <thead>
              <tr>
                <th>State</th>
                <th>Top State Rate</th>
                <th>$100K Take-Home</th>
                <th>$100K Monthly</th>
                <th>vs Texas</th>
              </tr>
            </thead>
            <tbody>
              {[...noTaxStates.slice(0, 4), ...highTaxStates].map((state) => {
                const t100 = calculateTax(state, 100_000);
                const diff  = t100.takeHome - txT100.takeHome;
                return (
                  <tr key={state.slug}>
                    <td className="font-semibold text-gray-900">
                      <Link href={`/${state.slug}`} className="hover:text-blue-700">{state.name}</Link>
                    </td>
                    <td>
                      {state.noTax ? (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">$0</span>
                      ) : (
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                          Up to {state.topRateDisplay}
                        </span>
                      )}
                    </td>
                    <td className={`font-bold ${state.noTax ? "text-green-700" : "text-blue-700"}`}>
                      {fmt(t100.takeHome)}
                    </td>
                    <td className="text-gray-600">{fmt(t100.takeHome / 12)}</td>
                    <td className={`font-semibold text-sm ${diff >= -25 ? "text-green-600" : "text-red-500"}`}>
                      {diff > -25 ? "—" : fmt(diff) + "/yr"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ── Nuances ──────────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          Important Nuances: Not All &quot;No-Tax&quot; States Are Equal
        </h2>

        <div className="space-y-4 mb-10">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-1">New Hampshire</h3>
            <p className="text-sm text-gray-700">
              NH does not tax wages or salaries, but levies a <strong>3% tax on interest and dividend
              income</strong> in {TAX_YEAR} (phasing out completely by 2027). Wage earners pay $0 NH state tax.
            </p>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-1">Washington State</h3>
            <p className="text-sm text-gray-700">
              No income tax on wages, but Washington introduced a <strong>7% capital gains tax</strong> in 2023
              on net long-term gains above $250,000. Most wage earners are unaffected.
            </p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-1">Tennessee</h3>
            <p className="text-sm text-gray-700">
              Tennessee fully eliminated the "Hall Tax" on interest and dividends in 2021. As of {TAX_YEAR},
              Tennessee is a true zero-income-tax state for all wage earners.
            </p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <h3 className="font-bold text-gray-900 mb-1">Alaska</h3>
            <p className="text-sm text-gray-700">
              No income tax and no sales tax, but Alaska has the highest cost of living of the nine states
              due to its remoteness. The state pays residents an annual <strong>Permanent Fund Dividend</strong> —
              roughly $1,300–$3,300/year depending on oil revenues.
            </p>
          </div>
        </div>

        {/* ── Trade-offs ───────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          The Trade-Off: What No-Tax States Tax Instead
        </h2>
        <p className="text-gray-600 mb-4">
          States need revenue. No-income-tax states typically fund themselves through:
        </p>
        <ul className="space-y-2 text-gray-700 mb-4 list-disc list-inside">
          <li><strong>Sales tax:</strong> Texas 8.25%, Nevada up to 8.38%, Washington up to 10.4% in some areas</li>
          <li><strong>Property tax:</strong> Texas is notably high — average effective rate 1.6–2.5% of home value annually</li>
          <li><strong>Excise taxes:</strong> Alaska and Wyoming rely heavily on oil and mineral severance taxes</li>
          <li><strong>Lottery and gaming:</strong> Nevada funds significant public services through gaming revenue</li>
        </ul>
        <p className="text-gray-700 mb-10">
          <strong>Bottom line:</strong> Even accounting for higher sales and property taxes, wage earners in
          no-income-tax states typically take home thousands more per year than equivalent workers in
          high-income-tax states. The higher your salary, the larger the advantage.
        </p>

        {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {[
            {
              q: "Should I move to a no-tax state to save money?",
              a: `It depends on your salary, cost of living, and lifestyle. At $100K, moving from California to Texas can save $7,000–$12,000/year in state income tax. However, Texas has higher property taxes and rising home prices in Austin, Dallas, and Houston. Run a full cost-of-living comparison before deciding — but for most $100K+ earners, the math favors the move.`,
            },
            {
              q: "Do I still owe federal income tax in a no-tax state?",
              a: `Yes. Federal income tax applies to all US workers regardless of state. The ${TAX_YEAR} federal brackets range from 10% to 37% on taxable income. FICA taxes (Social Security 6.2% + Medicare 1.45%) also apply everywhere. Only state income tax is eliminated in these nine states.`,
            },
            {
              q: "Which no-tax state has the lowest cost of living?",
              a: "South Dakota, Wyoming, and Tennessee generally have the lowest cost of living among no-tax states. Florida and Texas are moderate but rising fast. Nevada (Las Vegas) and Washington (Seattle) are higher-cost. Alaska is the most expensive due to remoteness.",
            },
            {
              q: "Will more states eliminate income tax?",
              a: `There's a strong trend toward income tax elimination. Iowa is phasing to a flat rate and eyeing full elimination. Louisiana and North Carolina have both cut rates significantly in recent years. Several other states are in active debate. It's likely that within the next decade, the no-income-tax club will grow beyond nine members.`,
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* ── State links ──────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          Calculate Your Take-Home in Each No-Tax State
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mb-10">
          {noTaxStates.map((state) => (
            <Link
              key={state.slug}
              href={`/${state.slug}`}
              className="border border-gray-200 rounded-xl py-2.5 px-3 text-center text-sm font-semibold text-gray-700 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all"
            >
              {state.name}
            </Link>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-2">Calculate Your Take-Home in Any State</h2>
          <p className="text-blue-300 text-sm mb-4">
            Free calculator — any salary, any state, {TAX_YEAR} IRS data. No signup required.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              Open Calculator →
            </Link>
            <Link href="/compare" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Compare States
            </Link>
          </div>
        </div>

      </article>
    </>
  );
}
