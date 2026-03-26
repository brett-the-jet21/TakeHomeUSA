export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("how-to-read-pay-stub")!;
const SLUG = "how-to-read-pay-stub";
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

const PAY_STUB_LINES = [
  {
    label: "Gross Pay",
    abbrev: null,
    what: "Your total earnings before any deductions. This is the number in your employment contract.",
    example: "Biweekly: $3,846.15 (= $100,000 ÷ 26 pay periods)",
  },
  {
    label: "Federal Income Tax",
    abbrev: "Fed Tax / FIT",
    what: "Withheld based on your W-4 form and the IRS tax tables. Using the 2020+ W-4, this depends on your filing status and Step 3 (credits) and Step 4 (extra withholding).",
    example: "For $100K single filer: ~$492/paycheck (biweekly)",
  },
  {
    label: "Social Security",
    abbrev: "OASDI / SS Tax",
    what: "6.2% of gross wages up to the Social Security wage base ($184,500 in 2026). If you earn above this cap, withholding stops for the year.",
    example: "$3,846.15 × 6.2% = $238.46/paycheck",
  },
  {
    label: "Medicare",
    abbrev: "Med Tax / HI",
    what: "1.45% of all wages with no income cap. High earners (above $200K single) also pay an additional 0.9% Additional Medicare Tax.",
    example: "$3,846.15 × 1.45% = $55.77/paycheck",
  },
  {
    label: "State Income Tax",
    abbrev: "State Tax / SIT",
    what: "Varies by state. Nine states have no state income tax (Texas, Florida, Nevada, Washington, Wyoming, Alaska, South Dakota, Tennessee, New Hampshire). Others range from flat rates (e.g., Illinois 4.95%) to progressive rates up to 13.3% (California).",
    example: "TX residents: $0. NY residents on $100K: ~$375/paycheck",
  },
  {
    label: "401(k) / 403(b)",
    abbrev: "401K / 403B",
    what: "Pre-tax retirement contributions. Reduces your taxable income for federal and state purposes. 2026 employee contribution limit: $23,500 ($31,000 if age 50+).",
    example: "5% contribution on $3,846: $192.31/paycheck",
  },
  {
    label: "Health Insurance",
    abbrev: "Med / Dental / Vision",
    what: "Your share of employer-sponsored health insurance premiums. Usually pre-tax (reduces taxable income). Employer typically covers 70–80% of the total premium.",
    example: "Varies widely: $100–$400/paycheck for individual coverage",
  },
  {
    label: "Net Pay",
    abbrev: "Take-Home / Net",
    what: "What actually hits your bank account. Gross pay minus all taxes and voluntary deductions.",
    example: "The number that matters for your monthly budget",
  },
];

export default function HowToReadPayStubPost() {
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
        name: "What is OASDI on my pay stub?",
        acceptedAnswer: { "@type": "Answer", text: "OASDI stands for Old Age, Survivors, and Disability Insurance — the formal name for Social Security tax. It's 6.2% of your gross wages up to the annual wage base ($184,500 in 2026). Once you hit that cap, no more Social Security tax is withheld for the rest of the year." },
      },
      {
        "@type": "Question",
        name: "Why is my federal withholding different from what I expected?",
        acceptedAnswer: { "@type": "Answer", text: "Federal withholding is based on your W-4 form and the IRS withholding tables. The most common reasons it seems off: (1) you claimed withholding adjustments on Step 3 or 4 of the W-4, (2) you have multiple jobs, or (3) the IRS tables use an annualized method that may produce uneven results early in the year. Use the IRS Tax Withholding Estimator to verify your W-4 settings." },
      },
      {
        "@type": "Question",
        name: "What is the difference between gross pay and net pay?",
        acceptedAnswer: { "@type": "Answer", text: "Gross pay is your total earnings before any deductions — the number in your employment contract. Net pay (take-home pay) is what remains after federal income tax, state income tax, Social Security, Medicare, and any voluntary deductions (401k, health insurance) are subtracted. Net pay is typically 65–80% of gross pay, depending on your state and deductions." },
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
          <span className="text-gray-800">How to Read Your Pay Stub</span>
        </nav>

        <header className="mb-8">
          <div className="flex items-center gap-3 mb-3">
            <span className="bg-purple-100 text-purple-700 text-xs font-bold px-2.5 py-1 rounded-full">Tax Guides</span>
            <span className="text-xs text-gray-400">{POST.readTime} min read · {TAX_YEAR}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-3">{POST.title}</h1>
          <p className="text-lg text-gray-600 leading-relaxed">{POST.excerpt}</p>
        </header>

        <div className="prose prose-gray max-w-none space-y-6 text-gray-700 leading-relaxed">
          <p>
            Most people glance at the "Net Pay" line, confirm the money arrived, and move on. But your pay stub is a detailed record of exactly where your money goes — and knowing how to read it lets you catch errors, optimize your W-4, and understand why your take-home feels smaller than you expected.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Every Line on Your Pay Stub, Explained</h2>

          <div className="space-y-4 my-4">
            {PAY_STUB_LINES.map((line, i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-4 bg-white">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="font-bold text-gray-900">{line.label}</h3>
                  {line.abbrev && (
                    <span className="text-xs font-mono bg-gray-100 text-gray-600 px-2 py-0.5 rounded whitespace-nowrap">{line.abbrev}</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 mb-2">{line.what}</p>
                <p className="text-xs text-gray-500 italic">{line.example}</p>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Why Your Tax Withholding Might Be Off</h2>
          <p>
            Two common reasons your federal withholding surprises you:
          </p>
          <p>
            <strong>Multiple jobs:</strong> If you and your spouse both work, or if you hold two jobs, the IRS withholds for each job as if it's your only income. But your combined income pushes you into higher brackets. The W-4 has a "Multiple Jobs" section specifically to correct this.
          </p>
          <p>
            <strong>Outdated W-4:</strong> If you filed a pre-2020 W-4 with your employer, you were using allowances (each one reducing withholding). The 2020+ W-4 eliminated allowances entirely. If you haven't updated your W-4 since 2019, your withholding may be miscalibrated.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Pre-Tax vs. Post-Tax Deductions</h2>
          <p>
            Some deductions reduce your taxable income before taxes are calculated. Others come out after taxes. This matters a lot.
          </p>
          <p>
            <strong>Pre-tax (reduces taxable income):</strong> 401(k)/403(b) traditional contributions, HSA contributions, employer-sponsored health/dental/vision insurance premiums, FSA contributions.
          </p>
          <p>
            <strong>Post-tax (no tax reduction):</strong> Roth 401(k) contributions, after-tax life insurance beyond $50K, union dues in most cases, wage garnishments.
          </p>
          <p>
            The practical implication: contributing $500/month to a traditional 401(k) doesn't reduce your take-home by $500 — because the contribution reduces your taxes too. Your actual take-home reduction is closer to $350–$380, depending on your tax bracket. The "cost" of saving for retirement is much lower than the contribution amount.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">How to Verify Your Pay Stub Is Correct</h2>
          <p>
            Use a take-home pay calculator (like the one at TakeHomeUSA) to estimate your expected net pay. Enter your gross salary, state, and filing status. If the calculator's estimate and your actual net pay are off by more than a few percent:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-sm">
            <li>Check your W-4 on file with HR — you may have old settings or extra withholding requested</li>
            <li>Verify your benefit deductions match your enrollment selections</li>
            <li>Look for one-time deductions (back-owed benefits, overpayment corrections)</li>
            <li>Confirm your pay period type (weekly/biweekly/semimonthly/monthly) matches expectations</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What is OASDI on my pay stub?</h3>
              <p className="text-sm">Social Security tax (Old Age, Survivors, Disability Insurance). 6.2% of gross wages up to $184,500 in {TAX_YEAR}.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Why is my federal withholding different from what I expected?</h3>
              <p className="text-sm">Usually due to W-4 settings, multiple jobs, or extra withholding elections. Review your W-4 with HR, or use the IRS Tax Withholding Estimator.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">What is the difference between gross pay and net pay?</h3>
              <p className="text-sm">Gross pay is your salary before taxes. Net pay (take-home) is what remains after all tax and benefit deductions — typically 65–80% of gross.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Calculate your expected take-home pay</h2>
          <p className="text-blue-300 text-sm mb-5">Verify your pay stub against our {TAX_YEAR} tax tables — any salary, any state.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Open Calculator →</Link>
            <Link href="/methodology" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">How We Calculate</Link>
            <Link href="/glossary" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Tax Glossary</Link>
          </div>
        </div>
      </article>
    </>
  );
}
