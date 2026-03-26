export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("austin-vs-san-francisco-cost")!;
const SLUG = "austin-vs-san-francisco-cost";
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

const SALARY_LEVELS = [75_000, 100_000, 150_000, 200_000];

// Approximate monthly costs (2026 estimates, single person)
const COST_COMPARISON = [
  { item: "1BR apartment (median)",    austin: 1_650, sf: 3_200 },
  { item: "Groceries/month",           austin: 420,   sf: 580   },
  { item: "Transportation/month",      austin: 380,   sf: 220   },
  { item: "Dining out (10x/mo)",       austin: 350,   sf: 500   },
  { item: "Utilities",                 austin: 160,   sf: 140   },
  { item: "Total (approx.)",           austin: 2_960,  sf: 4_640 },
];

export default function AustinVsSFPost() {
  const tx = STATE_BY_SLUG.get("texas")!;
  const ca = STATE_BY_SLUG.get("california")!;

  const rows = SALARY_LEVELS.map((amt) => {
    const txTax = calculateTax(tx, amt);
    const caTax = calculateTax(ca, amt);
    return {
      amount: amt,
      txTakeHome: txTax.takeHome,
      caTakeHome: caTax.takeHome,
      txMonthly: txTax.takeHome / 12,
      caMonthly: caTax.takeHome / 12,
      taxGap: txTax.takeHome - caTax.takeHome,
    };
  });

  const row100k = rows.find((r) => r.amount === 100_000)!;
  const costGap = COST_COMPARISON[COST_COMPARISON.length - 1];
  const annualCostGap = (costGap.sf - costGap.austin) * 12;
  const annualTotalGap = row100k.taxGap + annualCostGap;

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
        name: "Is Austin cheaper than San Francisco?",
        acceptedAnswer: { "@type": "Answer", text: `Yes, significantly. Estimated monthly living costs in Austin are approximately $2,960 for a single person vs. $4,640 in San Francisco — a gap of roughly $1,680/month ($20,160/year). When combined with the income tax advantage, a $100,000 earner in Austin keeps approximately ${fmt(annualTotalGap)} more per year than in San Francisco.` },
      },
      {
        "@type": "Question",
        name: "How much is $100,000 after taxes in Texas vs California?",
        acceptedAnswer: { "@type": "Answer", text: `On a $100,000 salary, Texas residents take home ${fmt(row100k.txTakeHome)}/year (${fmt(row100k.txMonthly)}/month) while California residents take home ${fmt(row100k.caTakeHome)}/year (${fmt(row100k.caMonthly)}/month). The income tax difference alone is ${fmt(row100k.taxGap)}/year.` },
      },
      {
        "@type": "Question",
        name: "What salary do you need to live comfortably in Austin?",
        acceptedAnswer: { "@type": "Answer", text: `With estimated monthly costs around $2,960/month for a single person, you need roughly $3,700–$4,000/month after taxes to live comfortably (saving 20% after essentials). That corresponds to a gross salary of approximately $65,000–$75,000 in Texas. A $75,000 salary in Texas produces ${fmt(calculateTax(STATE_BY_SLUG.get("texas")!, 75_000).takeHome / 12)}/month take-home.` },
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
          <span className="text-gray-800">Austin vs San Francisco</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-full">State Guides</span>
            <span className="text-xs text-gray-400">{POST.readTime} min read · {TAX_YEAR}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{POST.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{POST.excerpt}</p>
        </header>

        {/* Key stat */}
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6 my-8">
          <p className="text-sm font-semibold text-green-700 mb-1">On a $100,000 salary: combined tax + cost-of-living advantage</p>
          <p className="text-3xl font-black text-green-800">{fmt(annualTotalGap)}/year</p>
          <p className="text-sm text-green-600 mt-1">Austin advantage vs. San Francisco ({fmt(row100k.taxGap)} taxes + {fmt(annualCostGap)} cost of living)</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            Austin has become a magnet for tech workers, startups, and remote workers fleeing San Francisco's costs. But "cheaper than SF" covers a wide range, and the real financial picture is more detailed than "Texas has no income tax." Here's a complete side-by-side.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Income Tax Comparison ({TAX_YEAR})</h2>
          <p>The income tax gap is substantial at every salary level:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Salary</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Austin Take-Home</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">SF Take-Home</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Tax Gap/Year</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.amount} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-200 font-semibold">${r.amount.toLocaleString()}</td>
                    <td className="text-right p-3 border border-gray-200 text-green-700 font-bold">{fmt(r.txTakeHome)}</td>
                    <td className="text-right p-3 border border-gray-200 text-red-700">{fmt(r.caTakeHome)}</td>
                    <td className="text-right p-3 border border-gray-200 font-bold">{fmt(r.taxGap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Monthly Cost of Living Comparison</h2>
          <p>Beyond taxes, everyday living expenses diverge significantly:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Expense</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold text-green-700">Austin, TX</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold text-red-700">San Francisco, CA</th>
                </tr>
              </thead>
              <tbody>
                {COST_COMPARISON.map((row, i) => (
                  <tr key={row.item} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className={`p-3 border border-gray-200 ${i === COST_COMPARISON.length - 1 ? "font-bold" : ""}`}>{row.item}</td>
                    <td className={`text-right p-3 border border-gray-200 ${i === COST_COMPARISON.length - 1 ? "font-bold text-green-700" : "text-green-700"}`}>${row.austin.toLocaleString()}/mo</td>
                    <td className={`text-right p-3 border border-gray-200 ${i === COST_COMPARISON.length - 1 ? "font-bold text-red-700" : "text-red-700"}`}>${row.sf.toLocaleString()}/mo</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            The cost-of-living gap of ~{fmt(annualCostGap)}/year (for a single person renting a one-bedroom) plus the income tax advantage adds up to {fmt(annualTotalGap)}/year on a $100,000 salary. That's the equivalent of getting a $25,000+ raise without any negotiation — just by choosing the right city.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What Austin Has Caught Up On</h2>
          <p>
            Austin's cost advantage has narrowed considerably since 2019. The tech migration drove apartment rents from ~$1,100/month (2018) to $1,600–$2,000/month (2026) for a one-bedroom. Home prices in Zilker, South Congress, and East Austin now rival some San Francisco suburbs.
          </p>
          <p>
            Traffic has also gotten significantly worse as the city's population grew by 30%+ in five years. Austin's car-dependence (minimal public transit) makes transportation less flexible and more expensive than SF's BART/Muni system.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Where SF Still Wins</h2>
          <p>
            San Francisco offers genuinely higher salaries for tech roles — particularly at major companies (Google, Meta, Apple, Salesforce). Total compensation for senior engineers at FAANG companies in SF often exceeds $300K–$500K, versus $200K–$350K for comparable roles at Austin-based or remote employers. At very high income levels, the SF salary premium can outweigh the tax and cost disadvantages.
          </p>
          <p>
            SF also has world-class public transit (relative to Austin), a more walkable urban core, and significantly lower transportation costs for those who don't own a car.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Is Austin cheaper than San Francisco?</h3>
              <p className="text-sm">Yes — by roughly $20,000/year in cost of living alone for a single person, plus the income tax advantage. Total gap on $100K: approximately {fmt(annualTotalGap)}/year.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How much is $100K after taxes in Austin vs San Francisco?</h3>
              <p className="text-sm">Austin (TX): {fmt(row100k.txTakeHome)}/year. San Francisco (CA): {fmt(row100k.caTakeHome)}/year. Tax difference: {fmt(row100k.taxGap)}/year.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Run the numbers for your salary</h2>
          <p className="text-blue-300 text-sm mb-5">Compare any salary in Texas vs. California — or any two states — with our free {TAX_YEAR} calculator.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/compare/texas-vs-california" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">TX vs CA →</Link>
            <Link href="/salary/100000-salary-after-tax-austin-tx" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">$100K in Austin</Link>
            <Link href="/relocate" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Relocation Guide</Link>
          </div>
        </div>
      </article>
    </>
  );
}
