export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("100k-salary-after-taxes-all-states")!;

export const metadata: Metadata = {
  title: POST.metaTitle,
  description: POST.description,
  alternates: { canonical: "https://www.takehomeusa.com/blog/100k-salary-after-taxes-all-states" },
  openGraph: {
    title: POST.title,
    description: POST.description,
    url: "https://www.takehomeusa.com/blog/100k-salary-after-taxes-all-states",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

export default function HundredKAllStatesPost() {
  // Compute $100K take-home for all 50 states, sorted highest first
  const results = ALL_STATE_CONFIGS
    .map((state) => {
      const tax = calculateTax(state, 100_000);
      return {
        state,
        takeHome: tax.takeHome,
        monthly:  tax.takeHome / 12,
        effRate:  tax.effectiveTotalRate,
        stateTax: tax.stateTax,
      };
    })
    .sort((a, b) => b.takeHome - a.takeHome);

  const best   = results[0];
  const worst  = results[results.length - 1];
  const spread = best.takeHome - worst.takeHome;

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: POST.title,
    datePublished: POST.date,
    dateModified: POST.date,
    author:    { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    url: "https://www.takehomeusa.com/blog/100k-salary-after-taxes-all-states",
    mainEntityOfPage: "https://www.takehomeusa.com/blog/100k-salary-after-taxes-all-states",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "How much is $100,000 a year after taxes?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `In ${TAX_YEAR}, a $100,000 salary after taxes ranges from ${fmt(best.takeHome)}/year (${best.state.name}) to ${fmt(worst.takeHome)}/year (${worst.state.name}). The national range is ${fmt(spread)}/year depending on which state you live in. In a no-tax state like Texas, take-home is ${fmt(results.find(r => r.state.slug === "texas")?.takeHome ?? 0)}/year.`,
        },
      },
      {
        "@type": "Question",
        name: "Which state has the highest take-home pay on $100K?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `States with no income tax have the highest take-home pay on $100K. In ${TAX_YEAR}, that's ${fmt(best.takeHome)}/year (${fmt(best.monthly)}/month). No-tax states include Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming — all showing identical take-home since federal and FICA rates are the same.`,
        },
      },
      {
        "@type": "Question",
        name: "Which state takes the most taxes from a $100K salary?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `In ${TAX_YEAR}, ${worst.state.name} has one of the highest effective tax rates on a $100K salary. Take-home is approximately ${fmt(worst.takeHome)}/year, meaning over ${fmt(100_000 - worst.takeHome)} goes to combined federal, state, and FICA taxes.`,
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
      { "@type": "ListItem", position: 3, name: POST.title, item: "https://www.takehomeusa.com/blog/100k-salary-after-taxes-all-states" },
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
          <span className="text-gray-800">$100K After Taxes — All 50 States</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="text-xs font-bold bg-green-100 text-green-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
            {POST.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-3 leading-tight">
            {POST.title}
          </h1>
          <p className="text-gray-400 text-sm">{POST.readTime} min read · Updated for {TAX_YEAR} · Single filer, standard deduction</p>
        </header>

        {/* Lead */}
        <p className="text-lg text-gray-700 leading-relaxed mb-4">
          <strong>How much is $100,000 a year after taxes?</strong> The answer depends heavily on where you live.
          In {TAX_YEAR}, take-home pay on a $100K salary ranges from{" "}
          <strong>{fmt(best.takeHome)}/year</strong> in {best.state.name} to{" "}
          <strong>{fmt(worst.takeHome)}/year</strong> in {worst.state.name} — a difference of{" "}
          <strong>{fmt(spread)}</strong> per year, or{" "}
          <strong>{fmt(spread / 12)}/month</strong>.
        </p>
        <p className="text-gray-700 mb-8">
          Below is the complete {TAX_YEAR} ranking for all 50 states, sorted by take-home pay from highest
          to lowest. Click any state for a full breakdown including federal tax, FICA, and state income tax.
        </p>

        {/* ── Key stats ────────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { label: "Best Take-Home",  value: fmt(best.takeHome),   sub: best.state.name  },
            { label: "Worst Take-Home", value: fmt(worst.takeHome),  sub: worst.state.name },
            { label: "Annual Spread",   value: fmt(spread),           sub: "best vs worst"  },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-center">
              <p className="text-xs text-gray-500 mb-1">{label}</p>
              <p className="text-xl font-extrabold text-gray-900">{value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        {/* ── Full rankings table ──────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          $100K After Taxes — All 50 States Ranked ({TAX_YEAR})
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-3">
          <table className="tax-table">
            <thead>
              <tr>
                <th>#</th>
                <th>State</th>
                <th>Take-Home / Year</th>
                <th>Per Month</th>
                <th>Effective Rate</th>
                <th>State Tax</th>
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => (
                <tr key={r.state.slug} className={r.state.noTax ? "bg-green-50/40" : ""}>
                  <td className="text-gray-400 text-sm tabular-nums">{i + 1}</td>
                  <td className="font-semibold">
                    <Link
                      href={`/salary/100000-salary-after-tax-${r.state.slug}`}
                      className="hover:text-blue-700"
                    >
                      {r.state.name}
                    </Link>
                    {r.state.noTax && (
                      <span className="ml-1.5 text-xs text-green-600 font-bold">No state tax</span>
                    )}
                  </td>
                  <td className={`font-bold tabular-nums ${r.state.noTax ? "text-green-700" : "text-blue-700"}`}>
                    {fmt(r.takeHome)}
                  </td>
                  <td className="text-gray-600 tabular-nums">{fmt(r.monthly)}</td>
                  <td className="text-gray-600 tabular-nums">{pct(r.effRate)}</td>
                  <td className={`tabular-nums ${r.state.noTax ? "text-green-600" : "text-red-500"}`}>
                    {r.state.noTax ? "$0" : fmt(r.stateTax)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mb-10">
          Single filer, standard deduction ($16,100), {TAX_YEAR} IRS brackets. Does not include local/city taxes.
          Green rows = states with no state income tax.
        </p>

        {/* ── Key takeaways ────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">Key Takeaways</h2>
        <ul className="space-y-3 text-gray-700 mb-10">
          <li className="flex gap-2">
            <span className="text-green-500 font-bold flex-shrink-0">✓</span>
            <span>
              <strong>No-tax states win on take-home:</strong> All 9 no-income-tax states (Alaska, Florida,
              Nevada, NH, South Dakota, Tennessee, Texas, Washington, Wyoming) tie at the top with{" "}
              {fmt(best.takeHome)}/year — the full federal + FICA deductions with zero state tax.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-blue-500 font-bold flex-shrink-0">→</span>
            <span>
              <strong>Flat-rate states are middle of the pack:</strong> States like Illinois (4.95% flat),
              Pennsylvania (3.07% flat), and Colorado (4.40% flat) have predictable, moderate state taxes.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-red-500 font-bold flex-shrink-0">!</span>
            <span>
              <strong>High-income-tax states make a big dent:</strong> States like California, New York,
              New Jersey, and Oregon can cost $8,000–$14,000+ in additional state income tax on a $100K
              salary, compared to no-tax states.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="text-gray-500 font-bold flex-shrink-0">$</span>
            <span>
              <strong>Monthly impact is significant:</strong> The {fmt(spread / 12)}/month difference
              between best and worst states equals a car payment, a month of groceries, or real
              wealth-building capacity over time.
            </span>
          </li>
        </ul>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-2">Calculate Any Salary in Any State</h2>
          <p className="text-blue-300 text-sm mb-4">
            Try $75K, $150K, $200K — or enter your exact salary for a full breakdown.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              Open Calculator →
            </Link>
            <Link href="/after-tax/100000-a-year-after-tax" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              Full $100K Comparison
            </Link>
          </div>
        </div>

      </article>
    </>
  );
}
