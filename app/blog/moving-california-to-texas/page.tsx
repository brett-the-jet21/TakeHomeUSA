export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("moving-california-to-texas")!;
const SLUG = "moving-california-to-texas";
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

export default function MovingCalToTexasPost() {
  const tx = STATE_BY_SLUG.get("texas")!;
  const ca = STATE_BY_SLUG.get("california")!;

  const rows = SALARY_LEVELS.map((amt) => {
    const txTax = calculateTax(tx, amt);
    const caTax = calculateTax(ca, amt);
    const gap = txTax.takeHome - caTax.takeHome;
    return {
      amount: amt,
      txTakeHome: txTax.takeHome,
      caTakeHome: caTax.takeHome,
      gap,
      tenYrGap: gap * 10,
    };
  });

  const row100k = rows.find((r) => r.amount === 100_000)!;

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
        name: "How much do you save in taxes moving from California to Texas?",
        acceptedAnswer: { "@type": "Answer", text: `The annual tax savings from moving California to Texas ranges from roughly ${fmt(rows[0].gap)} on a $75,000 salary to ${fmt(rows[rows.length - 1].gap)} on a $200,000 salary. Over 10 years, a $100,000 earner saves approximately ${fmt(row100k.tenYrGap)} in taxes.` },
      },
      {
        "@type": "Question",
        name: "Does Texas really have no income tax?",
        acceptedAnswer: { "@type": "Answer", text: "Yes. Texas has no state income tax on wages or salary income. The state funds itself primarily through property taxes and sales taxes. Residents pay only federal income tax and FICA (Social Security and Medicare)." },
      },
      {
        "@type": "Question",
        name: "What are the downsides of moving from California to Texas?",
        acceptedAnswer: { "@type": "Answer", text: "Texas has higher property taxes than California — often 2–2.5% of home value annually vs. California's Prop 13-limited rates. Texas also has no state income tax deduction to reduce federal taxes. The climate is hot and humid in most of the state. Healthcare and education quality varies by metro area." },
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
          <span className="text-gray-800">California to Texas</span>
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
          <p className="text-sm font-semibold text-green-700 mb-1">On a $100,000 salary:</p>
          <p className="text-3xl font-black text-green-800">{fmt(row100k.gap)}/year savings</p>
          <p className="text-sm text-green-600 mt-1">moving from California to Texas · {fmt(row100k.tenYrGap)} over 10 years</p>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            More than 100,000 Californians move to Texas every year, and a large part of the reason is money. California has among the highest state income tax rates in the country — up to 13.3% on the highest earners. Texas has exactly zero. The difference in your paycheck is not subtle.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Tax Savings at Different Salary Levels</h2>
          <p>Here's the {TAX_YEAR} take-home comparison for Texas vs. California:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Salary</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Texas Take-Home</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">California Take-Home</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Annual Savings</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">10-Year Savings</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.amount} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-200 font-semibold">${r.amount.toLocaleString()}</td>
                    <td className="text-right p-3 border border-gray-200 text-green-700 font-bold">{fmt(r.txTakeHome)}</td>
                    <td className="text-right p-3 border border-gray-200 text-red-700">{fmt(r.caTakeHome)}</td>
                    <td className="text-right p-3 border border-gray-200 font-bold">{fmt(r.gap)}</td>
                    <td className="text-right p-3 border border-gray-200 text-blue-700">{fmt(r.tenYrGap)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Notice how the gap grows with income. This is a feature of progressive taxation — California's top rate kicks in harder at higher incomes. A $200K earner in California faces a combined effective state rate well above 8%, while a Texas resident pays zero state tax at every income level.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What the Move Actually Costs You</h2>
          <p>
            The tax savings look enormous — and they are. But it's worth understanding the full picture before packing up.
          </p>
          <p>
            <strong>Property taxes:</strong> Texas property taxes average 2–2.5% of assessed home value annually. California's Prop 13 limits increases to 2%/year from purchase price, so long-term California homeowners often pay very low effective rates. If you buy a $500,000 home in Texas, expect $10,000–$12,500/year in property taxes. A comparable California homeowner might pay significantly less.
          </p>
          <p>
            <strong>Cost of living:</strong> Texas cities have grown substantially in cost over the past decade. Austin in particular has seen housing prices surge toward Bay Area levels in some neighborhoods. However, Houston, San Antonio, and Dallas remain far more affordable than coastal California.
          </p>
          <p>
            <strong>Federal taxes:</strong> The 2017 SALT (state and local tax) deduction cap limits federal deductions for state taxes to $10,000/year. California residents no longer get a major federal deduction benefit from high state taxes. This further improves the relative math for Texas residents.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Break-Even Analysis</h2>
          <p>
            For most white-collar workers earning above $75,000, the annual income tax savings from living in Texas vs. California exceed {fmt(rows[0].gap)}/year. That's meaningful money that compounds — {fmt(rows[0].tenYrGap)} over 10 years at $75K, and nearly {fmt(rows[rows.length-1].tenYrGap)} over 10 years at $200K.
          </p>
          <p>
            The question isn't whether the tax math works (it clearly does). The question is whether the move makes sense for your career, family, and lifestyle. Silicon Valley salaries at major tech companies often don't have equivalent offers in Texas cities — yet. That gap is closing, but it's worth factoring into the decision.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How much do you save in taxes moving from California to Texas?</h3>
              <p className="text-sm">The savings range from {fmt(rows[0].gap)}/year on $75K to {fmt(rows[rows.length-1].gap)}/year on $200K. The higher your income, the more you save.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Does Texas really have no income tax?</h3>
              <p className="text-sm">Yes. Texas has zero state income tax. You only pay federal income tax and FICA. The state funds itself via property and sales taxes.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What are the downsides of moving from California to Texas?</h3>
              <p className="text-sm">Higher property taxes (2–2.5% vs. Prop 13-limited rates), no income tax deduction to offset federal taxes, heat and humidity, and varying public service quality by area.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">See the exact difference for your salary</h2>
          <p className="text-blue-300 text-sm mb-5">Use our free calculator to compare any two states side by side.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/compare/texas-vs-california" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">TX vs CA Calculator →</Link>
            <Link href="/texas" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Texas Guide</Link>
            <Link href="/relocate" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Relocation Guide</Link>
          </div>
        </div>
      </article>
    </>
  );
}
