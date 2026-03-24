export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { FEDERAL_BRACKETS_2026, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { getPostMeta } from "@/lib/blog-posts";

const POST = getPostMeta("federal-tax-brackets-2026")!;

export const metadata: Metadata = {
  title: POST.metaTitle,
  description: POST.description,
  alternates: { canonical: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026" },
  openGraph: {
    title: POST.title,
    description: POST.description,
    url: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

// 2026 MFJ brackets (2× single for lower brackets)
const MFJ_BRACKETS = [
  { min:      0, max:  24_800, rate: 0.10 },
  { min: 24_800, max: 100_800, rate: 0.12 },
  { min: 100_800, max: 211_400, rate: 0.22 },
  { min: 211_400, max: 403_550, rate: 0.24 },
  { min: 403_550, max: 512_450, rate: 0.32 },
  { min: 512_450, max: 768_800, rate: 0.35 },
  { min: 768_800, max: Infinity, rate: 0.37 },
];

function fmtBracket(n: number): string {
  if (n === Infinity) return "No limit";
  return "$" + n.toLocaleString("en-US");
}

// Step-by-step $100K calculation for a single filer
const GROSS  = 100_000;
const STDDED = 16_100;
const TAXABLE = GROSS - STDDED; // $83,900

const STEPS = [
  { bracket: "10%",  on: "$0 – $12,400",           taxable: 12_400,                  tax: 12_400 * 0.10 },
  { bracket: "12%",  on: "$12,400 – $50,400",       taxable: 50_400 - 12_400,         tax: (50_400 - 12_400) * 0.12 },
  { bracket: "22%",  on: "$50,400 – $83,900",       taxable: TAXABLE - 50_400,        tax: (TAXABLE - 50_400) * 0.22 },
];
const FEDERAL_TAX = STEPS.reduce((s, r) => s + r.tax, 0);
const FICA = GROSS * 0.0765; // 6.2% + 1.45%
const TOTAL_TAX = FEDERAL_TAX + FICA;
const TAKE_HOME = GROSS - TOTAL_TAX;

export default function FederalTaxBrackets2026Post() {
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: POST.title,
    datePublished: POST.date,
    dateModified: POST.date,
    author:    { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    url: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026",
    mainEntityOfPage: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026",
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What are the 2026 federal tax brackets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 2026 single-filer federal income tax brackets are: 10% on taxable income $0–$12,400; 12% on $12,400–$50,400; 22% on $50,400–$105,700; 24% on $105,700–$201,775; 32% on $201,775–$256,225; 35% on $256,225–$640,600; 37% above $640,600. The standard deduction is $16,100 for single filers.",
        },
      },
      {
        "@type": "Question",
        name: "What is the standard deduction in 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "The 2026 standard deduction is $16,100 for single filers and married filing separately, $32,200 for married filing jointly, and $24,150 for head of household. These amounts are adjusted annually for inflation per IRS Rev. Proc. 2025-32.",
        },
      },
      {
        "@type": "Question",
        name: "Will earning more money ever reduce my take-home pay due to tax brackets?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "No. The US uses a progressive (marginal) tax system. Each bracket rate applies only to income within that range — not to your entire income. Moving into a higher bracket never reduces your total take-home pay. You always net more from a raise than from not getting one.",
        },
      },
      {
        "@type": "Question",
        name: "How much federal income tax do I pay on a $100,000 salary?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `On a $100,000 salary in ${TAX_YEAR} (single filer, standard deduction), federal income tax is approximately $13,170 — an effective rate of about 13.2%. Your marginal (top) rate is 22%, but most of your income is taxed at 10% and 12%.`,
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
      { "@type": "ListItem", position: 3, name: POST.title, item: "https://www.takehomeusa.com/blog/federal-tax-brackets-2026" },
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
          <span className="text-gray-800">2026 Federal Tax Brackets</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <span className="text-xs font-bold bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full uppercase tracking-wide">
            {POST.category}
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-4 mb-3 leading-tight">
            {POST.title}
          </h1>
          <p className="text-gray-400 text-sm">{POST.readTime} min read · Updated for {TAX_YEAR} · Source: IRS Rev. Proc. 2025-32</p>
        </header>

        {/* Lead */}
        <p className="text-lg text-gray-700 leading-relaxed mb-8">
          Every year the IRS adjusts tax brackets for inflation. For {TAX_YEAR}, the brackets shifted
          upward by roughly 2–4%, which means the same salary results in slightly <strong>lower federal
          taxes</strong> than in 2025. Here&apos;s everything you need to know — with a full step-by-step
          calculation for a $100,000 salary.
        </p>

        {/* ── Single Brackets Table ─────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          {TAX_YEAR} Federal Tax Brackets — Single Filers
        </h2>
        <p className="text-gray-600 mb-4">
          Standard deduction: <strong>$16,100</strong> (reduces gross income before brackets apply).
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-8">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Tax Rate</th>
                <th>Taxable Income Range</th>
                <th>Tax on This Bracket</th>
              </tr>
            </thead>
            <tbody>
              {FEDERAL_BRACKETS_2026.map((b) => (
                <tr key={b.rate}>
                  <td className="font-bold text-gray-900">{(b.rate * 100).toFixed(0)}%</td>
                  <td className="text-gray-700">{fmtBracket(b.min)} – {fmtBracket(b.max)}</td>
                  <td className="text-gray-600">
                    {b.max === Infinity
                      ? `${(b.rate * 100).toFixed(0)}% of amount over ${fmtBracket(b.min)}`
                      : `${(b.rate * 100).toFixed(0)}% × ${fmtBracket(b.max - b.min)} max = ${fmt((b.max - b.min) * b.rate)}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── MFJ Brackets ─────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          {TAX_YEAR} Federal Tax Brackets — Married Filing Jointly
        </h2>
        <p className="text-gray-600 mb-4">
          Standard deduction: <strong>$32,200</strong>. MFJ brackets are generally twice the single-filer
          thresholds at the lower end.
        </p>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-10">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Tax Rate</th>
                <th>Taxable Income Range (MFJ)</th>
              </tr>
            </thead>
            <tbody>
              {MFJ_BRACKETS.map((b) => (
                <tr key={b.rate}>
                  <td className="font-bold text-gray-900">{(b.rate * 100).toFixed(0)}%</td>
                  <td className="text-gray-700">{fmtBracket(b.min)} – {fmtBracket(b.max)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* ── Step-by-step $100K ───────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          Step-by-Step: $100,000 Salary, Single Filer ({TAX_YEAR})
        </h2>
        <p className="text-gray-600 mb-6">
          Here&apos;s exactly how a $100,000 annual salary is taxed under {TAX_YEAR} federal brackets.
          Notice that the top bracket rate (22%) only applies to the last $33,500 of income — not the
          full $100,000.
        </p>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 mb-4 space-y-3">
          <div className="flex justify-between items-center text-gray-700">
            <span className="font-semibold">Gross salary</span>
            <span className="font-bold text-gray-900 tabular-nums">{fmt(GROSS)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span>− Standard deduction ({TAX_YEAR})</span>
            <span className="text-red-500 tabular-nums">−{fmt(STDDED)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 pt-2 font-semibold text-gray-900">
            <span>= Federal taxable income</span>
            <span className="tabular-nums">{fmt(TAXABLE)}</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-sm mb-4">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Bracket</th>
                <th>Income in Bracket</th>
                <th>Tax</th>
              </tr>
            </thead>
            <tbody>
              {STEPS.map((s) => (
                <tr key={s.bracket}>
                  <td className="font-bold text-gray-900">{s.bracket}</td>
                  <td className="text-gray-700">{s.on} = {fmt(s.taxable)}</td>
                  <td className="font-semibold tabular-nums text-red-600">{fmt(s.tax)}</td>
                </tr>
              ))}
              <tr className="bg-red-50">
                <td colSpan={2} className="font-bold text-gray-800">Total federal income tax</td>
                <td className="font-bold text-red-700 tabular-nums">{fmt(FEDERAL_TAX)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-5 sm:p-6 mb-4 space-y-3">
          <div className="flex justify-between items-center text-gray-700">
            <span>Federal income tax</span>
            <span className="text-red-500 tabular-nums">−{fmt(FEDERAL_TAX)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span>Social Security (6.2%)</span>
            <span className="text-orange-500 tabular-nums">−{fmt(GROSS * 0.062)}</span>
          </div>
          <div className="flex justify-between items-center text-gray-700">
            <span>Medicare (1.45%)</span>
            <span className="text-orange-500 tabular-nums">−{fmt(GROSS * 0.0145)}</span>
          </div>
          <div className="flex justify-between items-center border-t border-gray-300 pt-2">
            <span className="font-semibold text-gray-700">Total tax</span>
            <span className="font-bold text-red-700 tabular-nums">−{fmt(TOTAL_TAX)}</span>
          </div>
          <div className="flex justify-between items-center bg-green-50 rounded-xl p-3 mt-2">
            <span className="font-extrabold text-gray-900 text-lg">Take-home pay</span>
            <span className="font-extrabold text-green-700 text-xl tabular-nums">{fmt(TAKE_HOME)}/yr</span>
          </div>
          <p className="text-xs text-gray-400">
            Effective total rate: {pct(TOTAL_TAX / GROSS)} — Federal: {pct(FEDERAL_TAX / GROSS)} — Marginal federal bracket: 22%
          </p>
        </div>

        {/* ── Misconception box ────────────────────────────────────────────────── */}
        <div className="bg-amber-50 border border-amber-300 rounded-2xl p-5 sm:p-6 mb-10">
          <h3 className="font-bold text-gray-900 mb-2 text-lg">
            Common Misconception: &quot;I Don&apos;t Want a Raise — It&apos;ll Push Me Into a Higher Bracket&quot;
          </h3>
          <p className="text-gray-700 text-sm leading-relaxed">
            This is a myth. Because the US uses <strong>marginal (progressive) taxation</strong>, only the
            dollars above a bracket threshold are taxed at the higher rate. If you earn $105,000 instead of
            $100,000, only the extra $5,000 is taxed at 22% (or 24% for the portion above $105,700) —
            not your entire $105,000. A raise <em>always</em> increases your take-home pay. You can never
            take home less money by earning more.
          </p>
        </div>

        {/* ── Reducing taxable income ──────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4">
          How to Reduce Your {TAX_YEAR} Taxable Income
        </h2>
        <p className="text-gray-600 mb-4">
          Pre-tax contributions reduce your federal taxable income dollar-for-dollar:
        </p>
        <ul className="space-y-2 text-gray-700 mb-6 list-disc list-inside">
          <li><strong>401(k) traditional contributions:</strong> Up to $23,500 in {TAX_YEAR} ($31,000 if age 50+)</li>
          <li><strong>HSA contributions:</strong> Up to $4,300 (self-only) or $8,550 (family) in {TAX_YEAR}</li>
          <li><strong>FSA contributions:</strong> Up to $3,300 in {TAX_YEAR}</li>
          <li><strong>Pre-tax health insurance premiums:</strong> Deducted before federal income tax (Section 125)</li>
        </ul>
        <p className="text-gray-700 mb-10">
          For example, maxing out a 401(k) at $23,500 on a $100,000 salary reduces federal taxable income
          to about <strong>{fmt(TAXABLE - 23_500)}</strong>, dropping your entire income into the 12%
          bracket and saving roughly <strong>{fmt(23_500 * (0.22 - 0.12))}</strong> in federal taxes.
        </p>

        {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
        <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4 mb-10">
          {[
            {
              q: `What are the 2026 federal tax brackets?`,
              a: `Single filers: 10% ($0–$12,400), 12% ($12,400–$50,400), 22% ($50,400–$105,700), 24% ($105,700–$201,775), 32% ($201,775–$256,225), 35% ($256,225–$640,600), 37% (above $640,600). Standard deduction: $16,100.`,
            },
            {
              q: "What is the 2026 standard deduction?",
              a: "$16,100 for single filers (and married filing separately); $32,200 for married filing jointly; $24,150 for head of household. These are adjusted annually for inflation.",
            },
            {
              q: "How much did brackets change from 2025 to 2026?",
              a: "The lower brackets (10% and 12%) increased by approximately 4% compared to 2025, while upper brackets increased by about 2.3%. This means the same nominal income results in slightly lower taxes in 2026 vs 2025 — a benefit of the inflation adjustment.",
            },
            {
              q: `How much federal income tax do I owe on $75,000?`,
              a: `On $75,000 (single filer, standard deduction), federal taxable income is $58,900. Taxes: 10% on first $12,400 ($1,240) + 12% on $12,400–$50,400 ($4,560) + 22% on $50,400–$58,900 ($1,870) = total $7,670 federal income tax. Effective federal rate: 10.2%.`,
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-gray-200 rounded-xl p-5">
              <h3 className="font-bold text-gray-900 mb-2">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>

        {/* ── CTA ──────────────────────────────────────────────────────────────── */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-6 sm:p-8">
          <h2 className="text-xl font-bold mb-2">See Your Exact Take-Home Pay</h2>
          <p className="text-blue-300 text-sm mb-4">
            Enter your salary and state — get the full federal + state breakdown instantly, free.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link href="/" className="bg-white text-blue-900 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm">
              Open Calculator →
            </Link>
            <Link href="/after-tax/100000-a-year-after-tax" className="border border-white/30 text-white px-6 py-2.5 rounded-xl hover:bg-white/10 transition-colors text-sm">
              $100K in All 50 States
            </Link>
          </div>
        </div>

      </article>
    </>
  );
}
