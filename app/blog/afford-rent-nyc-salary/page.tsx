export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("afford-rent-nyc-salary")!;
const SLUG = "afford-rent-nyc-salary";
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

// Rent levels and the gross salary needed (using 30% rule: rent ≤ 30% of gross)
const RENT_SCENARIOS = [
  { label: "Studio/shared room",    monthlyRent: 1_800 },
  { label: "1-bedroom (outer boroughs)", monthlyRent: 2_400 },
  { label: "1-bedroom (Manhattan)", monthlyRent: 3_500 },
  { label: "2-bedroom (outer boroughs)", monthlyRent: 3_200 },
  { label: "2-bedroom (Manhattan)", monthlyRent: 5_000 },
];

export default function AffordRentNYCPost() {
  const nyState = STATE_BY_SLUG.get("new-york")!;

  // For each rent level, compute the gross salary needed so that rent = 30% of gross
  const rows = RENT_SCENARIOS.map((s) => {
    const annualRent = s.monthlyRent * 12;
    // Round up to nearest $5K — NY salary pages are generated in $5K steps only.
    const grossNeeded = Math.ceil((annualRent / 0.30) / 5_000) * 5_000;
    const tax = calculateTax(nyState, grossNeeded);
    const monthlyTakeHome = tax.takeHome / 12;
    const rentPctTakeHome = (s.monthlyRent / monthlyTakeHome) * 100;
    return { ...s, annualRent, grossNeeded, monthlyTakeHome, rentPctTakeHome };
  });

  // $100K in NY
  const tax100k = calculateTax(nyState, 100_000);
  const monthly100k = tax100k.takeHome / 12;

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
        name: "How much do you need to make to afford rent in NYC?",
        acceptedAnswer: { "@type": "Answer", text: `Using the 30% rent-to-income rule, you need to earn at least $${rows[1].grossNeeded.toLocaleString()}/year gross to comfortably afford a one-bedroom apartment in NYC's outer boroughs. For a Manhattan one-bedroom at ~$3,500/month, you need approximately $${rows[2].grossNeeded.toLocaleString()}/year.` },
      },
      {
        "@type": "Question",
        name: "What is $100,000 after taxes in New York?",
        acceptedAnswer: { "@type": "Answer", text: `A $100,000 salary in New York State results in ${fmt(tax100k.takeHome)}/year take-home, or ${fmt(monthly100k)}/month after federal and NY state income taxes, Social Security, and Medicare.` },
      },
      {
        "@type": "Question",
        name: "Is the 30% rule realistic in NYC?",
        acceptedAnswer: { "@type": "Answer", text: "Many NYC residents spend 40–50% of their gross income on rent — but this leaves little room for savings or emergencies. Financial advisors generally recommend the 30% rule as a maximum, and ideally closer to 25% of your take-home pay. With NYC's high state and city taxes, using take-home pay (not gross) as the base gives a more realistic picture." },
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
          <span className="text-gray-800">Salary to Afford NYC Rent</span>
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
            New York City is simultaneously the highest-paying metro area in the US and one of the most expensive places to live. Understanding how much you need to earn — not just gross salary but actual take-home after New York's steep taxes — is the difference between financial stress and financial stability.
          </p>
          <p>
            New York State has a top marginal income tax rate of 10.9%. Add NYC's own local income tax (up to 3.876%) and the federal burden, and residents effectively face some of the heaviest tax loads in the country. A $100,000 salary leaves you with {fmt(monthly100k)}/month take-home — that's the number that actually matters when rent comes due.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The 30% Rule: Gross vs. Take-Home</h2>
          <p>
            Most landlords use the "40x rule" — your gross annual income should be 40 times the monthly rent. That means a $3,000/month apartment requires a $120,000 gross income. But this is a landlord's screening tool, not a personal finance rule.
          </p>
          <p>
            For your own budgeting, the standard guidance is that rent should be no more than 30% of your <em>gross</em> income — but after taxes in New York, 30% of gross can easily become 40–45% of your actual take-home pay. Using take-home as the baseline is more conservative and more realistic.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Salary Needed for Different NYC Rent Levels ({TAX_YEAR})</h2>
          <p>The following table shows the gross salary needed so that rent equals 30% of your gross income, and what that same salary actually leaves you with after New York state taxes:</p>

          <div className="overflow-x-auto my-4">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-semibold">Apartment Type</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Est. Monthly Rent</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Gross Salary Needed</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Monthly Take-Home (NY)</th>
                  <th className="text-right p-3 border border-gray-200 font-semibold">Rent % of Take-Home</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={r.label} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                    <td className="p-3 border border-gray-200">{r.label}</td>
                    <td className="text-right p-3 border border-gray-200">{fmt(r.monthlyRent)}</td>
                    <td className="text-right p-3 border border-gray-200 font-bold">
                      <Link href={`/salary/${r.grossNeeded}-salary-after-tax-new-york`} className="text-blue-600 hover:underline">
                        ${r.grossNeeded.toLocaleString()}
                      </Link>
                    </td>
                    <td className="text-right p-3 border border-gray-200">{fmt(r.monthlyTakeHome)}</td>
                    <td className={`text-right p-3 border border-gray-200 font-semibold ${r.rentPctTakeHome > 40 ? "text-red-600" : "text-green-700"}`}>
                      {r.rentPctTakeHome.toFixed(0)}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p>
            Notice that even at the "affordable" rent levels, rent eats 37–42% of your actual take-home pay. This is the NYC reality: the 30% gross rule effectively becomes a 38–45% take-home rule once New York's tax burden is accounted for.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Practical Advice for NYC Renters</h2>
          <p>
            <strong>Consider roommates:</strong> Splitting a two-bedroom in the outer boroughs ($3,200/month) with a roommate drops your cost to $1,600/month — a number that works even on a $65,000–$70,000 salary.
          </p>
          <p>
            <strong>Look at the outer boroughs:</strong> Brooklyn, Queens, and the Bronx offer rents 25–50% below Manhattan for comparable space. A one-bedroom in Astoria, Queens runs $2,200–$2,600 vs. $3,200–$4,000 in Midtown.
          </p>
          <p>
            <strong>Know your NYC take-home:</strong> If you work in NYC, you pay both New York State income tax AND NYC local income tax. This combination can add up to 10%+ of your income on top of federal taxes. Use a calculator to know what you'll actually take home before accepting an offer.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">What $100,000 Gets You in NYC</h2>
          <p>
            After New York state and federal taxes, a $100,000 salary leaves you with {fmt(tax100k.takeHome)}/year, or {fmt(monthly100k)}/month. At the 30% rule, your "affordable" rent ceiling is about {fmt(monthly100k * 0.30)}/month — which barely covers a studio in many neighborhoods.
          </p>
          <p>
            That's not a comfortable position in a city where the median one-bedroom runs $3,000–$3,500. $100K in NYC requires either a roommate, a long commute, or willingness to spend 40–45% of take-home on housing.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How much do you need to earn to afford NYC rent?</h3>
              <p className="text-sm">For a one-bedroom in the outer boroughs (~$2,400/month), you need at least ${rows[1].grossNeeded.toLocaleString()} gross. For Manhattan ($3,500/month), approximately ${rows[2].grossNeeded.toLocaleString()} gross.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Is $100,000 a good salary in NYC?</h3>
              <p className="text-sm">$100K in NYC gives you {fmt(monthly100k)}/month take-home after NY taxes. It's workable — especially with a roommate or in the outer boroughs — but won't feel luxurious in Manhattan.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Calculate your NYC take-home</h2>
          <p className="text-blue-300 text-sm mb-5">See exactly what any salary nets after New York state and federal taxes.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/salary/100000-salary-after-tax-new-york" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">$100K in New York →</Link>
            <Link href="/salary/75000-salary-after-tax-new-york" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">$75K in New York</Link>
            <Link href="/new-york" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">NY Salary Guide</Link>
          </div>
        </div>
      </article>
    </>
  );
}
