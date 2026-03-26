export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("80000-salary-after-taxes")!;
const SLUG = "80000-salary-after-taxes";
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

const AMOUNT = 80_000;
const STATES = ["texas", "california", "new-york", "florida", "illinois", "washington", "colorado", "ohio"] as const;

export default function Post80kSalary() {
  const results = STATES.map((s) => {
    const cfg = STATE_BY_SLUG.get(s)!;
    const tax = calculateTax(cfg, AMOUNT);
    return { name: cfg.name, slug: s, takeHome: tax.takeHome, monthly: tax.takeHome / 12, totalTax: tax.totalTax, effRate: tax.effectiveTotalRate };
  });

  const texas    = results.find((r) => r.slug === "texas")!;
  const cali     = results.find((r) => r.slug === "california")!;
  const ny       = results.find((r) => r.slug === "new-york")!;
  const gap      = texas.takeHome - cali.takeHome;
  const usMedian = 77_000;

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
        name: "Is $80,000 a good salary in the US?",
        acceptedAnswer: { "@type": "Answer", text: `$80,000 is above the US median household income (~$${usMedian.toLocaleString()}), which makes it a solid salary in most parts of the country. After federal, state, and FICA taxes, you'll take home between ${fmt(cali.takeHome)} (California) and ${fmt(texas.takeHome)} (Texas) per year depending on where you live.` },
      },
      {
        "@type": "Question",
        name: "How much is $80,000 after taxes in Texas?",
        acceptedAnswer: { "@type": "Answer", text: `In Texas (no state income tax), a $80,000 salary leaves you with ${fmt(texas.takeHome)}/year take-home pay, or ${fmt(texas.monthly)}/month. Your effective total tax rate is ${pct(texas.effRate)}.` },
      },
      {
        "@type": "Question",
        name: "How much is $80,000 after taxes in California?",
        acceptedAnswer: { "@type": "Answer", text: `In California, a $80,000 salary results in ${fmt(cali.takeHome)}/year take-home pay, or ${fmt(cali.monthly)}/month after all taxes. The effective total tax rate is ${pct(cali.effRate)}.` },
      },
    ],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",    item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog",    item: "https://www.takehomeusa.com/blog" },
      { "@type": "ListItem", position: 3, name: POST.title, item: CANONICAL },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <article className="container-page py-12 max-w-3xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-6 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-600">Home</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-blue-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-800">$80K Salary After Taxes</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Salary Guides</span>
            <span className="text-xs text-gray-400">{POST.readTime} min read · {TAX_YEAR}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{POST.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{POST.excerpt}</p>
        </header>

        {/* Key Stats */}
        <div className="grid sm:grid-cols-3 gap-4 my-8">
          <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-green-700">{fmt(texas.takeHome)}</p>
            <p className="text-sm text-green-600 mt-1">Take-home in Texas</p>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-red-700">{fmt(cali.takeHome)}</p>
            <p className="text-sm text-red-600 mt-1">Take-home in California</p>
          </div>
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-center">
            <p className="text-2xl font-black text-blue-700">{fmt(gap)}</p>
            <p className="text-sm text-blue-600 mt-1">TX–CA annual gap</p>
          </div>
        </div>

        {/* Body */}
        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            $80,000 is a salary that sounds comfortable — and it is, in most of the country. It sits above the US median household income of approximately ${usMedian.toLocaleString()}, which means you're earning more than half of American households. But the number that actually matters is what you take home after taxes. And that varies enormously by state.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">$80,000 After Taxes: State-by-State</h2>
          <p>Here's what $80,000 looks like after federal income tax, FICA (Social Security + Medicare), and state income tax in {TAX_YEAR}:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">State</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Take-Home/Year</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Take-Home/Month</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Effective Rate</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={r.slug} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-200">
                      <Link href={`/salary/80000-salary-after-tax-${r.slug}`} className="text-blue-600 hover:underline font-medium">{r.name}</Link>
                    </td>
                    <td className="text-right p-3 border border-gray-200 font-bold text-gray-900">{fmt(r.takeHome)}</td>
                    <td className="text-right p-3 border border-gray-200">{fmt(r.monthly)}</td>
                    <td className="text-right p-3 border border-gray-200">{pct(r.effRate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why the Gap Is So Large</h2>
          <p>
            The difference between Texas and California on an $80,000 salary is {fmt(gap)} per year — nearly ${Math.round(gap / 12).toLocaleString()} per month. That's not a rounding error. It's a second car payment, a vacation fund, or a meaningful boost to your retirement savings.
          </p>
          <p>
            The gap comes from two sources. First, California has a progressive state income tax that reaches 9.3% on income above $66,295 (and higher on incomes above $338,639). Second, no-tax states like Texas and Florida have $0 state income tax. Federal taxes and FICA are identical regardless of where you live.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Is $80K Enough to Live On?</h2>
          <p>
            In Texas, your {fmt(texas.monthly)}/month take-home is genuinely comfortable in most cities. Austin's median rent for a one-bedroom is around $1,500–$1,800, leaving substantial room for savings. Houston, San Antonio, and Dallas are even more affordable.
          </p>
          <p>
            In New York City, your {fmt(ny.monthly)}/month take-home faces median rents of $3,500+ for a one-bedroom in Manhattan. $80,000 in NYC is technically above the city's median income, but it doesn't feel that way once rent is paid.
          </p>
          <p>
            In California, your {fmt(cali.monthly)}/month is stretched thin in San Francisco or Los Angeles, where one-bedroom rents regularly exceed $2,500–$3,000. But the same salary is quite livable in Sacramento, Fresno, or Bakersfield.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Monthly Reality</h2>
          <p>
            Beyond the annual take-home, it helps to think in monthly terms. If your employer pays biweekly (every two weeks), $80,000 produces 26 paychecks of approximately {fmt(texas.takeHome / 26)} each in Texas. After rent and basic living expenses, how much is left depends entirely on your location.
          </p>
          <p>
            A useful rule of thumb: spend no more than 30% of gross income on housing. For an $80,000 salary, that's $2,000/month. That works in most mid-sized US cities but falls short in the most expensive markets.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Is $80,000 a good salary in the US?</h3>
              <p className="text-sm">Yes, $80,000 is above the US median household income (~${usMedian.toLocaleString()}) and is a solid salary in most parts of the country. Purchasing power depends heavily on your state and city.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How much is $80,000 after taxes in Texas?</h3>
              <p className="text-sm">Texas has no state income tax, so your take-home on $80,000 is {fmt(texas.takeHome)}/year ({fmt(texas.monthly)}/month).</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How much is $80,000 after taxes in California?</h3>
              <p className="text-sm">In California, $80,000 nets {fmt(cali.takeHome)}/year ({fmt(cali.monthly)}/month) after all taxes — about {fmt(gap)}/year less than Texas.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">See your exact $80K take-home</h2>
          <p className="text-blue-300 text-sm mb-5">Choose any state and get an instant breakdown including federal, state, and FICA taxes.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/salary/80000-salary-after-tax-texas" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">$80K in Texas →</Link>
            <Link href="/salary/80000-salary-after-tax-california" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">$80K in California</Link>
            <Link href="/after-tax/80000-a-year-after-tax" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">All 50 States</Link>
          </div>
        </div>
      </article>
    </>
  );
}
