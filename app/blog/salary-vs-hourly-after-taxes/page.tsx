export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("salary-vs-hourly-after-taxes")!;
const SLUG = "salary-vs-hourly-after-taxes";
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

// Compare: $75K salary vs. equivalent hourly rates, in Texas
const ANNUAL_SALARY = 75_000;
const HOURS_PER_YEAR = 2_080; // 40hr × 52wk
const HOURLY_EQUIV = ANNUAL_SALARY / HOURS_PER_YEAR; // $36.06/hr

export default function SalaryVsHourlyPost() {
  const tx = STATE_BY_SLUG.get("texas")!;
  const ca = STATE_BY_SLUG.get("california")!;

  // Salary
  const txSalary = calculateTax(tx, ANNUAL_SALARY);
  const caSalary = calculateTax(ca, ANNUAL_SALARY);

  // Hourly: overtime scenario (10hr/wk OT at 1.5x for 4 weeks/yr = 40 extra hours)
  const overtimeHours = 40;
  const overtimePay = overtimeHours * HOURLY_EQUIV * 1.5;
  const overtimeTotal = ANNUAL_SALARY + overtimePay;
  const txOvertime = calculateTax(tx, Math.round(overtimeTotal));

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
        name: "Is salary or hourly pay better after taxes?",
        acceptedAnswer: { "@type": "Answer", text: "Salary and hourly pay are taxed identically by the IRS — both are ordinary income. The key differences are overtime eligibility (hourly workers generally earn 1.5x for hours over 40/week; salaried exempt workers typically do not), benefits (salaried roles more often include health insurance, 401k matching, PTO), and income stability (salary is predictable; hourly varies with hours worked)." },
      },
      {
        "@type": "Question",
        name: "Do hourly workers pay more taxes than salaried workers?",
        acceptedAnswer: { "@type": "Answer", text: "No. The IRS taxes wages the same whether you're paid hourly or salary. If an hourly worker and a salaried employee earn the same annual income, they pay the same federal income tax, Social Security, and Medicare. The difference is that hourly workers may earn overtime pay, which increases their total income and therefore their tax." },
      },
      {
        "@type": "Question",
        name: "What is $75,000 a year hourly?",
        acceptedAnswer: { "@type": "Answer", text: `$75,000/year ÷ 2,080 hours (40 hours/week × 52 weeks) = $${HOURLY_EQUIV.toFixed(2)}/hour gross. After taxes in Texas, the annual take-home is ${fmt(txSalary.takeHome)}, or approximately $${(txSalary.takeHome / HOURS_PER_YEAR).toFixed(2)}/hour net.` },
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
          <span className="text-gray-800">Salary vs. Hourly After Taxes</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-green-100 text-green-700 text-xs font-bold px-2.5 py-1 rounded-full">Salary Guides</span>
            <span className="text-xs text-gray-400">{POST.readTime} min read · {TAX_YEAR}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{POST.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{POST.excerpt}</p>
        </header>

        {/* Key numbers */}
        <div className="grid sm:grid-cols-2 gap-4 my-8">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">$75,000 salary (TX)</p>
            <p className="text-2xl font-black text-blue-900">{fmt(txSalary.takeHome)}/yr</p>
            <p className="text-sm text-blue-700">{fmt(txSalary.takeHome / 12)}/month · {pct(txSalary.effectiveTotalRate)} tax</p>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-green-500 uppercase tracking-wide mb-1">${HOURLY_EQUIV.toFixed(2)}/hr equiv. + OT (TX)</p>
            <p className="text-2xl font-black text-green-900">{fmt(txOvertime.takeHome)}/yr</p>
            <p className="text-sm text-green-700">With 40hr OT/yr · {pct(txOvertime.effectiveTotalRate)} effective rate</p>
          </div>
        </div>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            The tax code treats salary and hourly income identically — both are ordinary income subject to the same federal brackets, FICA rates, and state taxes. So from a pure tax perspective, a $75,000 salary and $36.06/hour × 2,080 hours produce the same tax bill. The differences lie in overtime, benefits, stability, and career trajectory.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Tax Treatment Is Identical</h2>
          <p>
            Whether your employer calls it a salary or an hourly wage, the IRS sees it as wages and salaries on line 1 of your 1040. The withholding may look different on each paycheck (because hourly income varies week to week), but the annual tax calculation is the same.
          </p>
          <p>
            At ${ANNUAL_SALARY.toLocaleString()}/year in Texas: <strong>{fmt(txSalary.takeHome)}</strong> take-home ({fmt(txSalary.takeHome / 12)}/month). In California: <strong>{fmt(caSalary.takeHome)}</strong> take-home — {fmt(txSalary.takeHome - caSalary.takeHome)}/year less, because California state income tax applies equally to salary and hourly income.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Overtime Advantage of Hourly Pay</h2>
          <p>
            The Fair Labor Standards Act (FLSA) requires employers to pay non-exempt hourly workers at least 1.5x their regular rate for hours over 40 per week. Most salaried employees classified as "exempt" (executive, administrative, professional roles earning above $35,568/year) are not entitled to overtime pay.
          </p>
          <p>
            This is where the math can shift. If an hourly worker at ${HOURLY_EQUIV.toFixed(2)}/hr works 40 hours of overtime in a year (about 10 hours of OT in 4 separate weeks), they earn an additional {fmt(overtimePay)} — bringing gross income to {fmt(Math.round(overtimeTotal))} and take-home in Texas to {fmt(txOvertime.takeHome)}.
          </p>
          <p>
            A salaried employee at $75,000 working those same extra hours earns nothing additional. The overtime earnings potential is a real, tangible financial advantage for hourly workers in industries where overtime is available.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Benefits: Where Salaried Roles Often Win</h2>
          <p>
            Benefits are not included in the calculator numbers above — but they're a significant part of total compensation. Full-time salaried roles commonly include:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li><strong>Health insurance:</strong> Employer covers 70–80% of premiums. Individual coverage can cost $500–$800/month on the open market, so employer-sponsored coverage is worth $4,200–$7,680/year in after-tax value.</li>
            <li><strong>401(k) matching:</strong> Common structure is 50–100% match up to 3–6% of salary. On $75K with 4% match: $3,000/year in free retirement contributions.</li>
            <li><strong>Paid time off:</strong> Two weeks of paid vacation = $2,885 in effective hourly value (2 weeks ÷ 52 × $75K).</li>
            <li><strong>Disability and life insurance:</strong> Often free or subsidized for salaried employees.</li>
          </ul>
          <p>
            Adding up health insurance, 401k match, and PTO alone can add $10,000–$15,000 in annual value. Many hourly roles — especially in retail, food service, and gig work — do not offer these benefits.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Which Should You Choose?</h2>
          <p>
            When evaluating a salary offer vs. an hourly rate, convert them to the same basis. Divide annual salary by 2,080 for hourly equivalent. Then factor in:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Benefits value (add $10K–$20K for full benefits packages)</li>
            <li>Overtime potential (add expected OT hours × 1.5 × hourly rate)</li>
            <li>Income stability (salary is more predictable)</li>
            <li>Career advancement (salaried roles often have clearer promotion paths)</li>
          </ul>
          <p>
            For someone choosing between two similar offers, the state of employment is often a bigger factor than salary vs. hourly — because state taxes apply equally to both. A $75,000 salary in Texas yields {fmt(txSalary.takeHome)}/year; the same in California yields {fmt(caSalary.takeHome)}/year — a {fmt(txSalary.takeHome - caSalary.takeHome)} annual difference that has nothing to do with how the compensation is structured.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Is salary or hourly better after taxes?</h3>
              <p className="text-sm">Taxes are identical — both are ordinary income. Overtime eligibility, benefits, and income stability are the real differences between the two pay structures.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Do hourly workers pay more taxes?</h3>
              <p className="text-sm">No. The IRS taxes wages the same regardless of how they're structured. If hourly workers earn more due to overtime, they pay more tax — but that's because they earned more, not because of the hourly structure.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What is $75,000 a year hourly?</h3>
              <p className="text-sm">${ANNUAL_SALARY.toLocaleString()} ÷ 2,080 hours = ${HOURLY_EQUIV.toFixed(2)}/hour gross. After taxes in Texas: ~${(txSalary.takeHome / HOURS_PER_YEAR).toFixed(2)}/hour net.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Calculate your salary take-home</h2>
          <p className="text-blue-300 text-sm mb-5">See annual, monthly, biweekly, and hourly take-home for any salary in any state.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/salary/75000-salary-after-tax-texas" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">$75K in Texas →</Link>
            <Link href="/salary/75000-salary-after-tax-california" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">$75K in California</Link>
            <Link href="/" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">All States</Link>
          </div>
        </div>
      </article>
    </>
  );
}
