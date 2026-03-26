export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("w4-form-guide-withholding")!;
const SLUG = "w4-form-guide-withholding";
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

const W4_STEPS = [
  {
    step: "Step 1",
    title: "Personal Information",
    desc: "Your name, address, SSN, and filing status. Filing status is the most impactful choice: Single/MFS withholds more (safer against underpayment). MFJ withholds less (appropriate if your combined income fits the married brackets).",
    tip: "Married filers who both work should NOT select 'Married filing jointly' on Step 1 without completing Step 2. Doing so will under-withhold.",
  },
  {
    step: "Step 2",
    title: "Multiple Jobs / Spouse Works",
    desc: "Required if you have more than one job or your spouse works. Three options: (a) use the IRS Tax Withholding Estimator, (b) use the Multiple Jobs worksheet on page 3 of the W-4, or (c) check the box (less precise but simple).",
    tip: "This step is the most commonly skipped — and skipping it is the most common cause of underpayment penalties for dual-income households.",
  },
  {
    step: "Step 3",
    title: "Claim Dependents",
    desc: "Reduces withholding by your estimated tax credits. For one qualifying child under 17: enter $2,000. For other dependents: $500 each. Only complete this step on ONE W-4 if you have multiple jobs.",
    tip: "If your income exceeds $400K (MFJ) or $200K (other), child tax credit phases out. Don't overclaim credits.",
  },
  {
    step: "Step 4",
    title: "Other Adjustments (Optional)",
    desc: "(a) Other income: add non-wage income (freelance, dividends) so it gets withheld. (b) Deductions: if itemizing, enter estimated deductions above the standard deduction to reduce withholding. (c) Extra withholding: flat extra amount per paycheck.",
    tip: "Step 4(a) is useful if you have a side business. Step 4(c) is the simplest way to ensure you don't owe at tax time.",
  },
  {
    step: "Step 5",
    title: "Sign and Date",
    desc: "Required. Unsigned W-4 forms are invalid and your employer must withhold at the default single rate.",
    tip: null,
  },
];

export default function W4FormGuidePost() {
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
        name: "Should I claim 0 or 1 on my W-4?",
        acceptedAnswer: { "@type": "Answer", text: "The 2020 W-4 redesign eliminated allowances (0 or 1 claims). The new form uses a dollar-based system instead. To withhold more conservatively (reducing the chance of owing at tax time), leave Steps 3 and 4 blank and choose 'Single' in Step 1 even if you're married. To withhold less, complete Step 3 with your dependent credits and use Step 4(b) if you itemize deductions." },
      },
      {
        "@type": "Question",
        name: "How do I fill out a W-4 if I have two jobs?",
        acceptedAnswer: { "@type": "Answer", text: "Complete Step 2 on the W-4 for your higher-paying job. On the lower-paying job's W-4, leave Steps 2–4 blank. This prevents under-withholding that would otherwise occur when both employers withhold independently without knowing about the other income. Alternatively, use the IRS Tax Withholding Estimator for the most precise calculation." },
      },
      {
        "@type": "Question",
        name: "When should I update my W-4?",
        acceptedAnswer: { "@type": "Answer", text: "You should update your W-4 after any major life change: marriage or divorce, birth or adoption of a child, getting a second job, a significant raise or pay cut, buying a home (changes deductions), or getting a large tax refund or bill (both signal miscalibrated withholding). You can submit a new W-4 to your employer at any time during the year." },
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
          <span className="text-gray-800">W-4 Form Guide</span>
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
            The W-4 (Employee's Withholding Certificate) tells your employer how much federal income tax to deduct from each paycheck. Get it right and you'll owe a small amount or get a modest refund at tax time. Get it wrong and you'll either owe the IRS a surprise bill — possibly with penalties — or get a large refund that amounts to an interest-free loan you gave the government.
          </p>
          <p>
            The IRS redesigned the W-4 form in 2020, eliminating the old allowance system entirely. The new form is more precise but also more confusing. Here's what each step actually means.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The W-4 Step by Step</h2>

          <div className="space-y-4 my-4">
            {W4_STEPS.map((s) => (
              <div key={s.step} className="border border-gray-200 rounded-xl p-5 bg-white">
                <div className="flex items-center gap-3 mb-2">
                  <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full">{s.step}</span>
                  <h3 className="font-bold text-gray-900">{s.title}</h3>
                </div>
                <p className="text-sm text-gray-700 mb-2">{s.desc}</p>
                {s.tip && (
                  <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <strong>Watch out:</strong> {s.tip}
                  </p>
                )}
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Common W-4 Mistakes</h2>

          <p><strong>Mistake 1: Married couple, both working, both select "Married filing jointly" without completing Step 2.</strong></p>
          <p className="text-sm">
            Both employers withhold at the low married rate, ignoring each other. Your combined income pushes you into higher brackets at filing time. Fix: complete Step 2 on one W-4.
          </p>

          <p><strong>Mistake 2: Forgetting about non-wage income.</strong></p>
          <p className="text-sm">
            If you have freelance income, investment dividends, or rental income, no one is withholding from those payments. Use Step 4(a) to add these amounts, or make quarterly estimated tax payments.
          </p>

          <p><strong>Mistake 3: Not updating after a life change.</strong></p>
          <p className="text-sm">
            Getting married, having a child, getting a second job, or buying a home all change your optimal withholding. A W-4 filed years ago may no longer reflect your situation.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">The Refund vs. Owing Tradeoff</h2>
          <p>
            Many people aim for a large tax refund as a forced savings mechanism. This is rational for some people — but financially, a large refund means you over-withheld all year, giving the IRS an interest-free loan. The average US tax refund in recent years has been $3,000+. Invested at even a modest 5% return, that's $150 in lost interest annually.
          </p>
          <p>
            On the other hand, underpaying by more than $1,000 can trigger an underpayment penalty. The IRS safe harbor rule: you avoid penalties if your withholding covers 100% of last year's tax bill (110% if your prior year income exceeded $150K).
          </p>
          <p>
            The ideal outcome: withhold roughly what you'll owe, aiming for a refund or balance due of under $500. The IRS Tax Withholding Estimator is the most reliable tool for achieving this.
          </p>

          <h2 className="text-xl font-bold text-gray-900 mt-8 mb-3">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-gray-900 mb-1">Should I claim 0 or 1 on my W-4?</h3>
              <p className="text-sm">The new W-4 doesn't use allowances anymore. Leave Steps 3–4 blank for maximum withholding (conservative). Fill in Step 3 credits to reduce withholding if you have dependents.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">How do I fill out a W-4 with two jobs?</h3>
              <p className="text-sm">Complete Step 2 on your higher-paying job's W-4. Leave Steps 2–4 blank on the lower-paying job's form. Or use the IRS Tax Withholding Estimator.</p>
            </div>
            <div>
              <h3 className="font-bold text-gray-900 mb-1">When should I update my W-4?</h3>
              <p className="text-sm">After any major life change: marriage, divorce, new child, second job, large raise, home purchase, or receiving a tax bill/large refund.</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">See what your paycheck should look like</h2>
          <p className="text-blue-300 text-sm mb-5">Compare your expected take-home with our free {TAX_YEAR} calculator.</p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">Open Calculator →</Link>
            <Link href="/blog/how-to-read-pay-stub" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Read Your Pay Stub</Link>
            <Link href="/glossary" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors">Tax Glossary</Link>
          </div>
        </div>
      </article>
    </>
  );
}
