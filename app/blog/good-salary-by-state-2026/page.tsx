export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("good-salary-by-state-2026")!;
const SLUG = "good-salary-by-state-2026";
const CANONICAL = `https://www.takehomeusa.com/blog/${SLUG}`;

export const metadata: Metadata = {
  title: POST.metaTitle,
  description: POST.description,
  alternates: { canonical: CANONICAL },
  openGraph: {
    title: POST.title,
    description: POST.description,
    url: CANONICAL,
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

const FEATURED_SLUGS = [
  "texas", "california", "new-york", "florida", "washington",
  "illinois", "colorado", "massachusetts", "georgia", "ohio",
  "pennsylvania", "nevada", "tennessee", "oregon", "arizona",
];

export default function GoodSalaryByStatePost() {
  const results = FEATURED_SLUGS
    .map((slug) => {
      const cfg = ALL_STATE_CONFIGS.find((c) => c.slug === slug)!;
      const tax75 = calculateTax(cfg, 75_000);
      const tax100 = calculateTax(cfg, 100_000);
      return {
        name: cfg.name,
        slug,
        noTax: cfg.noTax,
        takeHome75: tax75.takeHome,
        takeHome100: tax100.takeHome,
        monthly75: tax75.takeHome / 12,
        effRate75: tax75.effectiveTotalRate,
      };
    })
    .sort((a, b) => b.takeHome75 - a.takeHome75);

  const best = results[0];
  const worst = results[results.length - 1];

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: POST.title,
    datePublished: POST.date,
    dateModified: POST.date,
    author:    { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    url: CANONICAL,
    mainEntityOfPage: CANONICAL,
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What is considered a good salary in the US in 2026?",
        acceptedAnswer: { "@type": "Answer", text: `The US median household income is approximately $77,000/year. A salary above $90,000 is generally considered "above average" nationally. However, purchasing power varies enormously: $75,000 in ${best.name} provides ${fmt(best.takeHome75)}/year take-home, while the same salary in ${worst.name} provides ${fmt(worst.takeHome75)}/year — a difference of ${fmt(best.takeHome75 - worst.takeHome75)}/year.` },
      },
      {
        "@type": "Question",
        name: "Which state gives you the most take-home pay?",
        acceptedAnswer: { "@type": "Answer", text: "No-tax states — Texas, Florida, Nevada, Washington, Tennessee, Wyoming, South Dakota, Alaska, and New Hampshire — offer the highest take-home pay since they charge $0 in state income tax. The difference on a $75,000 salary can be several thousand dollars per year compared to high-tax states like California or New York." },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.takehomeusa.com/blog" },
      { "@type": "ListItem", position: 3, name: POST.title, item: CANONICAL },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="container-page py-12 max-w-3xl">
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-800">Good Salary by State</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Salary Guides</span>
            <span className="text-xs text-gray-400">{POST.readTime} min read · {TAX_YEAR}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{POST.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{POST.excerpt}</p>
        </header>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            "Is this a good salary?" is one of the most common questions people have about job offers — and it's also one of the most context-dependent. A $70,000 salary is genuinely comfortable in Des Moines. The same salary in San Francisco barely covers rent. And beyond cost of living, the state you live in determines how much of that salary you actually take home after taxes.
          </p>
          <p>
            This guide provides {TAX_YEAR} take-home pay benchmarks across major states and the context to judge whether a given salary is good for your specific situation.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The National Benchmarks</h2>
          <p>
            The US Census Bureau reports a median household income of approximately $77,000/year and a median individual earner income of about $60,000/year. These are national averages — actual medians vary by state from roughly $45,000 in Mississippi to over $90,000 in Maryland and Massachusetts.
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Above $175,000:</strong> Top 5% — high income in virtually every US city</li>
            <li><strong>$90,000–$175,000:</strong> Above average to top 10% — comfortable in most cities, tight in the most expensive</li>
            <li><strong>$60,000–$90,000:</strong> Near to above national median — livable in mid-sized cities, tight in NYC/SF/LA</li>
            <li><strong>$40,000–$60,000:</strong> Near or below median — comfortable in lower cost-of-living areas</li>
            <li><strong>Under $40,000:</strong> Entry level — challenging in most metros, workable in rural or low-cost areas</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">$75,000 After Taxes Across 15 States ({TAX_YEAR})</h2>
          <p>The same gross salary produces very different take-home pay depending on your state:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">State</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Take-Home/Year</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Per Month</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Eff. Rate</th>
                  <th className="text-center p-3 border border-gray-200 font-semibold">No State Tax</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.slug} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-200">
                      <Link href={`/salary/75000-salary-after-tax-${r.slug}`} className="text-blue-600 hover:underline font-medium">{r.name}</Link>
                    </td>
                    <td className="text-right p-3 border border-gray-200 font-bold text-gray-900">{fmt(r.takeHome75)}</td>
                    <td className="text-right p-3 border border-gray-200">{fmt(r.monthly75)}</td>
                    <td className="text-right p-3 border border-gray-200">{pct(r.effRate75)}</td>
                    <td className="text-center p-3 border border-gray-200">{r.noTax ? "✓" : "–"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            The spread between the best and worst states is {fmt(best.takeHome75 - worst.takeHome75)}/year on a $75,000 salary — an extra {fmt((best.takeHome75 - worst.takeHome75) / 12)}/month that you keep just by being in the right state.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What Makes a Salary "Good" in Practice</h2>
          <p>
            The most honest answer is that a good salary is one that covers your needs, allows for savings, and gives some discretionary spending room. A common target is saving 15–20% of gross income. At $75,000 in Texas, that's $11,250–$15,000/year toward retirement and emergency funds — very achievable given the {fmt(best.monthly75)}/month take-home.
          </p>
          <p>
            The 50/30/20 budget rule (50% needs, 30% wants, 20% savings) is a reasonable starting point. Apply it to your <em>take-home</em> pay, not gross — that's the number your budget actually runs on.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">State Taxes and Offer Evaluation</h2>
          <p>
            Most salary negotiations happen in gross terms. Your employer says $75,000. You should be thinking: which $75,000? The one in Texas that yields {fmt(best.takeHome75)}/year take-home, or the one in California or New York that yields thousands less after state taxes?
          </p>
          <p>
            When comparing offers in different cities, always run the take-home numbers for your specific situation. A $90,000 offer in San Francisco and an $80,000 offer in Austin may yield nearly identical take-home pay — and Austin's lower cost of living makes the $80K offer financially superior.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What is considered a good salary in the US in {TAX_YEAR}?</h3>
              <p className="text-sm">Above $77,000 (US median household income) is generally solid. Above $90,000 is above average nationally. What's comfortable depends heavily on your state and city.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Which states give the most take-home pay?</h3>
              <p className="text-sm">No-tax states: Texas, Florida, Nevada, Washington, Tennessee, Wyoming, South Dakota, Alaska, New Hampshire. Zero state income tax means more of every paycheck stays with you.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Find your take-home pay by state</h2>
          <p className="text-blue-300 text-sm mb-5">Free calculator — enter any salary and compare all 50 states instantly.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Open Calculator →</Link>
            <Link href="/states" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">All 50 States</Link>
            <Link href="/compare" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Compare States</Link>
          </div>
        </div>
      </article>
    </>
  );
}
