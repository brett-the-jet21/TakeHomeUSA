export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTexasTax, fmt, pct, TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: `Texas Salary Calculator ${TAX_YEAR} — $0 State Tax | Free`,
  description:
    `Texas has NO state income tax. $100K salary → $79,180/yr ($6,598/mo). $75K → $59,785/yr. $50K → $41,283/yr. All salaries $20K–$500K. Free ${TAX_YEAR} breakdown.`,
  alternates: { canonical: "https://www.takehomeusa.com/texas" },
  openGraph: {
    title: `Texas Salary After Tax Calculator (${TAX_YEAR})`,
    description: "Texas = $0 state income tax. $100K → $79,180/yr take-home. $75K → $59,785/yr. Free, instant.",
    url: "https://www.takehomeusa.com/texas",
    siteName: "TakeHomeUSA",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: `Texas Salary Calculator ${TAX_YEAR} — $0 State Tax`,
    description: "$100K → $79,180/yr take-home. $75K → $59,785/yr. Free Texas salary after tax calculator.",
  },
};

const SALARY_RANGES = [
  {
    label: "Entry Level",
    icon: "🌱",
    desc: "$20,000 – $49,000",
    salaries: [20_000, 25_000, 30_000, 35_000, 40_000, 45_000],
  },
  {
    label: "Mid Career",
    icon: "📈",
    desc: "$50,000 – $74,000",
    salaries: [50_000, 55_000, 60_000, 65_000, 70_000, 75_000],
  },
  {
    label: "Experienced",
    icon: "💼",
    desc: "$75,000 – $99,000",
    salaries: [75_000, 80_000, 85_000, 90_000, 95_000, 99_000],
  },
  {
    label: "Senior",
    icon: "⭐",
    desc: "$100,000 – $149,000",
    salaries: [100_000, 110_000, 120_000, 125_000, 130_000, 140_000],
  },
  {
    label: "Six Figures+",
    icon: "🚀",
    desc: "$150,000 – $300,000",
    salaries: [150_000, 175_000, 200_000, 225_000, 250_000, 300_000],
  },
];

const TX_FAQS = [
  {
    q: "Does Texas have a state income tax?",
    a: `No. Texas has no state income tax — one of only 9 states in the US with $0 state income tax. This means your entire salary is only subject to federal income tax and FICA (Social Security + Medicare). For a $100,000 salary in ${TAX_YEAR}, Texans take home roughly $79,180/year compared to about $71,580 in California.`,
  },
  {
    q: "How is take-home pay calculated in Texas?",
    a: `Texas take-home pay = Gross Salary − Federal Income Tax − Social Security (6.2%) − Medicare (1.45%). There is no state income tax deduction. Federal income tax uses the ${TAX_YEAR} IRS brackets (10% to 37%) applied to taxable income after the $16,100 standard deduction (per IRS Rev. Proc. 2025-32).`,
  },
  {
    q: "What is the average take-home pay in Texas?",
    a: `The median household income in Texas is around $67,000/year. After ${TAX_YEAR} federal taxes and FICA, the average Texas worker takes home approximately $52,000–$55,000 per year, or about $4,300–$4,600 per month.`,
  },
  {
    q: "How much of my paycheck goes to taxes in Texas?",
    a: `In Texas, your paycheck deductions are: federal income tax (varies by income, effective rate ~10–22% for most workers), Social Security (6.2% up to $184,500 for ${TAX_YEAR}), and Medicare (1.45%). No state tax. For a $75,000 salary in ${TAX_YEAR}, total taxes are roughly $14,700 — an effective rate of about 19.6%.`,
  },
  {
    q: "Is Texas a good state to live in for taxes?",
    a: `Yes — Texas is one of the most tax-friendly states for workers. With zero state income tax, residents keep significantly more of their paycheck. The trade-off is higher property and sales taxes, but for most wage earners, Texas remains financially advantageous compared to high-income-tax states.`,
  },
  {
    q: "What other states have no income tax like Texas?",
    a: `The 9 states with no state income tax are: Texas, Florida, Nevada, Wyoming, South Dakota, Alaska, Tennessee, New Hampshire (on earned income), and Washington. Of these, Texas and Florida are the most popular destinations for workers relocating from high-tax states like California or New York.`,
  },
];

export default function TexasPage() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: TX_FAQS.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Texas Salary Calculator", item: "https://www.takehomeusa.com/texas" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Hero */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container-page py-14 sm:py-18">
          <nav className="text-blue-300 text-sm mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <span className="text-white">Texas</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full">
                <span>★</span>
                <span>Texas has ZERO state income tax</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Updated for {TAX_YEAR} IRS Brackets
              </div>
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Texas Salary After Tax<br />
              <span className="text-blue-300">Calculator {TAX_YEAR}</span>
            </h1>
            <p className="text-blue-200 text-lg mb-8 max-w-2xl">
              See your exact take-home pay for any Texas salary. No state income
              tax means you keep more of every dollar you earn. Powered by real{" "}
              {TAX_YEAR} IRS federal tax brackets.
            </p>

            {/* Key stat cards */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-green-400">$0</p>
                <p className="text-xs text-blue-300 mt-1">State Income Tax</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black">7.65%</p>
                <p className="text-xs text-blue-300 mt-1">FICA (Social Sec + Medicare)</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-blue-300">10–37%</p>
                <p className="text-xs text-blue-300 mt-1">Federal Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ad slot */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* Salary ranges */}
      <section className="container-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Texas Take-Home Pay — By Salary Range
        </h2>
        <p className="text-gray-500 mb-8">
          Click any salary for the full {TAX_YEAR} tax breakdown, period tables, and more.
        </p>

        <div className="space-y-10">
          {SALARY_RANGES.map(({ label, icon, desc, salaries }) => (
            <div key={label}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{icon}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{label}</h3>
                  <p className="text-sm text-gray-500">{desc}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                {salaries.map((amount) => {
                  const tax = calculateTexasTax(amount);
                  return (
                    <Link
                      key={amount}
                      href={`/salary/${amount}-salary-after-tax-texas`}
                      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all text-center"
                    >
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 mb-1">
                        ${amount.toLocaleString()}
                      </p>
                      <p className="text-green-600 font-bold text-sm">
                        {fmt(tax.takeHome)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {fmt(tax.takeHome / 12)}/mo
                      </p>
                      <p className="text-gray-300 text-xs">
                        {pct(tax.effectiveTotalRate)} eff.
                      </p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Ad slot in-content */}
      <div className="container-page my-10">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* Texas tax explainer */}
      <section className="bg-gradient-to-r from-green-50 to-emerald-50 border-y border-green-200 py-12">
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Why Texas Is One of the Best States for Income
            </h2>
            <p className="text-gray-600">
              Texas is one of only 9 states that collects zero state income tax.
              Here's what that means for real salaries:
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Annual Salary</th>
                  <th>Take-Home in Texas</th>
                  <th>Monthly</th>
                  <th>Effective Tax Rate</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {[30_000, 50_000, 75_000, 100_000, 125_000, 150_000, 200_000].map((amt) => {
                  const tax = calculateTexasTax(amt);
                  return (
                    <tr key={amt}>
                      <td className="font-semibold text-gray-900">${amt.toLocaleString()}</td>
                      <td className="font-bold text-green-700">{fmt(tax.takeHome)}</td>
                      <td className="text-gray-600">{fmt(tax.takeHome / 12)}</td>
                      <td className="text-gray-600">{pct(tax.effectiveTotalRate)}</td>
                      <td>
                        <Link
                          href={`/salary/${amt}-salary-after-tax-texas`}
                          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
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
        </div>
      </section>

      {/* FAQ */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          Texas Income Tax — Frequently Asked Questions
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {TX_FAQS.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Browse all by $1K */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Browse All Texas Salary Calculations
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Every salary from $20,000 to $500,000 in $1,000 increments — click any amount for the full breakdown.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {Array.from({ length: 48 }, (_, i) => (i + 2) * 10_000).map((amt) => (
              <Link
                key={amt}
                href={`/salary/${amt}-salary-after-tax-texas`}
                className="text-center text-xs sm:text-sm bg-white border border-gray-200 rounded-lg py-2 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all font-medium"
              >
                ${amt / 1000}K
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">
            Don&apos;t see your exact salary?
          </h2>
          <p className="text-blue-300 mb-6">
            Use the calculator to get a precise result for any salary from $20,000 to $500,000.
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Use the Calculator →
          </Link>
        </div>
      </section>

      {/* Bottom ad */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
