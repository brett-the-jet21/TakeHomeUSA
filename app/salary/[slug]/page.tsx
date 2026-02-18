import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  calculateTexasTax,
  fmt,
  pct,
  TAX_YEAR,
  getTexasSalaryAmounts,
} from "@/lib/tax";

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = { slug?: string };

const STATES: Record<string, { name: string; slug: string }> = {
  texas: { name: "Texas", slug: "texas" },
};

// ─── Slug Parser ──────────────────────────────────────────────────────────────
function parseSlug(slug: unknown): { amount: number; stateSlug: string } | null {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const amount = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(amount) || amount < 1_000 || amount > 2_000_000) return null;
  if (!STATES[stateSlug]) return null;
  return { amount, stateSlug };
}

// ─── Static Generation: $20K–$500K in $1K steps (481 pages) ─────────────────
export function generateStaticParams() {
  return getTexasSalaryAmounts().map((a) => ({
    slug: `${a}-salary-after-tax-texas`,
  }));
}

// ─── Per-Page SEO Metadata (with real numbers for high CTR) ──────────────────
export function generateMetadata({ params }: { params: Params }): Metadata {
  const parsed = parseSlug(params?.slug);
  if (!parsed) return {};

  const { amount, stateSlug } = parsed;
  const state = STATES[stateSlug].name;
  const tax = calculateTexasTax(amount);
  const amtFmt = amount.toLocaleString("en-US");
  const takeFmt = Math.round(tax.takeHome).toLocaleString("en-US");
  const moFmt = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);

  return {
    title: `$${amtFmt} Salary After Tax in ${state} (${TAX_YEAR})`,
    description: `$${amtFmt}/yr in ${state} → $${takeFmt} take-home ($${moFmt}/mo). ${state} has NO state income tax! Effective rate: ${effRate}%. Full ${TAX_YEAR} federal tax breakdown, hourly & monthly pay.`,
    alternates: {
      canonical: `https://www.takehomeusa.com/salary/${params.slug}`,
    },
    openGraph: {
      title: `$${amtFmt} Salary After Tax in ${state} | TakeHomeUSA`,
      description: `Take-home: $${takeFmt}/yr · $${moFmt}/mo · ${state} has no state income tax!`,
      url: `https://www.takehomeusa.com/salary/${params.slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `$${amtFmt} After Tax in ${state}: $${takeFmt}/yr`,
      description: `$${moFmt}/month take-home. ${state} = $0 state income tax. See full ${TAX_YEAR} breakdown.`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default function SalaryPage({ params }: { params: Params }) {
  const parsed = parseSlug(params?.slug);
  if (!parsed) return notFound();

  const { amount, stateSlug } = parsed;
  const state = STATES[stateSlug].name;
  const tax = calculateTexasTax(amount);
  const amtFmt = amount.toLocaleString("en-US");

  // Pay period breakdown
  const periods = [
    { label: "Annual",    divisor: 1 },
    { label: "Monthly",   divisor: 12 },
    { label: "Bi-Weekly", divisor: 26 },
    { label: "Weekly",    divisor: 52 },
    { label: "Daily",     divisor: 260 },
    { label: "Hourly",    divisor: 2080 },
  ];

  // Nearby salary internal links (great for crawlability + user retention)
  const nearbySteps = [-10_000, -5_000, -1_000, 1_000, 5_000, 10_000];
  const nearbyLinks = nearbySteps
    .map((d) => amount + d)
    .filter((a) => a >= 20_000 && a <= 500_000);

  const popularLinks = [
    50_000, 60_000, 75_000, 80_000, 90_000, 100_000,
    110_000, 125_000, 150_000, 175_000, 200_000, 250_000,
  ].filter((a) => Math.abs(a - amount) > 2_000);

  // ── JSON-LD: FAQ Page (drives featured snippets) ──────────────────────────
  const monthly   = tax.takeHome / 12;
  const biweekly  = tax.takeHome / 26;
  const hourly    = tax.takeHome / 2080;

  const faqItems = [
    {
      q: `What is the take-home pay for a $${amtFmt} salary in ${state}?`,
      a: `With a $${amtFmt} salary in ${state}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. ${state} has no state income tax, so your deductions are federal income tax (${fmt(tax.federalTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`,
    },
    {
      q: `Does ${state} have a state income tax?`,
      a: `No. ${state} is one of nine US states with zero state income tax. On a $${amtFmt} salary you pay $0 in state tax, which is a significant financial advantage over states like California (up to 13.3%) or New York (up to 10.9%).`,
    },
    {
      q: `What is $${amtFmt} a year per month after taxes in ${state}?`,
      a: `A $${amtFmt} annual salary in ${state} works out to ${fmt(monthly)} per month after taxes, or ${fmt(biweekly)} bi-weekly (every two weeks).`,
    },
    {
      q: `What is the effective tax rate on a $${amtFmt} salary in ${state}?`,
      a: `The effective total tax rate on a $${amtFmt} salary in ${state} is ${pct(tax.effectiveTotalRate)}. This combines federal income tax (${pct(tax.effectiveFederalRate)} effective rate) and FICA taxes (Social Security + Medicare). ${state} has no state income tax.`,
    },
    {
      q: `What is the marginal tax bracket for $${amtFmt} in ${state}?`,
      a: `The marginal (top) federal tax rate on a $${amtFmt} salary is ${pct(tax.marginalRate)}. However, not all income is taxed at this rate — your effective federal rate is only ${pct(tax.effectiveFederalRate)} because lower income portions are taxed at 10%, 12%, etc.`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${state}?`,
      a: `Based on a 40-hour work week (2,080 hours/year), a $${amtFmt} salary in ${state} works out to ${fmt(hourly)} per hour after taxes.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
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
      { "@type": "ListItem", position: 2, name: `${state} Salary Calculator`, item: "https://www.takehomeusa.com/texas" },
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax in ${state}`, item: `https://www.takehomeusa.com/salary/${params.slug}` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `$${amtFmt} Salary After Tax in ${state} (${TAX_YEAR})`,
    description: `Exact take-home pay for a $${amtFmt} salary in ${state} based on ${TAX_YEAR} federal tax brackets.`,
    url: `https://www.takehomeusa.com/salary/${params.slug}`,
    isPartOf: { "@type": "WebSite", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  };

  return (
    <>
      {/* ── Structured Data ─────────────────────────────────────────────── */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }} />

      {/* ── Ad: Leaderboard (728×90) below sticky header ────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      <main className="container-page pb-16">
        {/* ── Breadcrumb ─────────────────────────────────────────────────── */}
        <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
          <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
          <span>/</span>
          <Link href="/texas" className="hover:text-blue-700 transition-colors">
            Texas Salary Calculator
          </Link>
          <span>/</span>
          <span className="text-gray-700">${amtFmt} Salary</span>
        </nav>

        {/* ── H1 + Sub ────────────────────────────────────────────────────── */}
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
          ${amtFmt} Salary After Tax in {state} ({TAX_YEAR})
        </h1>
        <p className="text-gray-500 mb-8">
          {TAX_YEAR} IRS federal tax brackets · Single filer · Standard deduction ($14,600) ·{" "}
          <span className="text-green-700 font-medium">{state} has no state income tax</span>
        </p>

        {/* ── Summary Hero Card ────────────────────────────────────────────── */}
        <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 sm:p-8 text-white mb-8">
          <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
            Annual Take-Home Pay
          </p>
          <p className="text-5xl sm:text-6xl font-black mb-6 tracking-tight">
            {fmt(tax.takeHome)}
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Monthly",   value: fmt(tax.takeHome / 12) },
              { label: "Bi-Weekly", value: fmt(tax.takeHome / 26) },
              { label: "Weekly",    value: fmt(tax.takeHome / 52) },
              { label: "Hourly",    value: fmt(tax.takeHome / 2080) },
            ].map(({ label, value }) => (
              <div key={label} className="bg-blue-700/50 rounded-xl p-3 text-center">
                <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">{label}</p>
                <p className="text-lg sm:text-xl font-bold">{value}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-6 mt-4 pt-4 border-t border-blue-700">
            <div>
              <span className="text-blue-300 text-xs">Effective Tax Rate</span>
              <p className="font-bold text-lg">{pct(tax.effectiveTotalRate)}</p>
            </div>
            <div>
              <span className="text-blue-300 text-xs">Marginal Rate</span>
              <p className="font-bold text-lg">{pct(tax.marginalRate)}</p>
            </div>
            <div>
              <span className="text-blue-300 text-xs">{state} State Tax</span>
              <p className="font-bold text-lg text-green-400">$0</p>
            </div>
          </div>
        </div>

        {/* ── Main Grid: Content + Sidebar ─────────────────────────────────── */}
        <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

          {/* ── Left Column ───────────────────────────────────────────────── */}
          <div className="space-y-10">

            {/* Tax Breakdown Table */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {TAX_YEAR} Tax Breakdown for ${amtFmt} in {state}
              </h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="tax-table">
                  <thead>
                    <tr>
                      <th>Tax</th>
                      <th>Rate</th>
                      <th>Annual Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-medium">Gross Salary</td>
                      <td className="text-gray-400">—</td>
                      <td className="font-bold text-gray-900">{fmt(tax.gross)}</td>
                    </tr>
                    <tr>
                      <td>
                        <span className="font-medium">Federal Income Tax</span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Taxable income: {fmt(tax.federalTaxable)} (after ${tax.standardDeduction.toLocaleString()} std. deduction)
                        </span>
                      </td>
                      <td className="text-gray-600">{pct(tax.effectiveFederalRate)}</td>
                      <td className="text-red-600 font-semibold">−{fmt(tax.federalTax)}</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="pl-8 text-sm text-gray-500">Social Security (6.2%{tax.gross > 168_600 ? " · capped at $168,600" : ""})</td>
                      <td className="text-gray-400 text-sm">6.20%</td>
                      <td className="text-red-500 text-sm">−{fmt(tax.socialSecurity)}</td>
                    </tr>
                    <tr>
                      <td className="pl-8 text-sm text-gray-500">Medicare (1.45%)</td>
                      <td className="text-gray-400 text-sm">1.45%</td>
                      <td className="text-red-500 text-sm">−{fmt(tax.medicare)}</td>
                    </tr>
                    {tax.additionalMedicare > 0 && (
                      <tr className="bg-gray-50">
                        <td className="pl-8 text-sm text-gray-500">Additional Medicare (0.9% over $200K)</td>
                        <td className="text-gray-400 text-sm">0.90%</td>
                        <td className="text-red-500 text-sm">−{fmt(tax.additionalMedicare)}</td>
                      </tr>
                    )}
                    <tr className="bg-green-50">
                      <td className="font-medium text-gray-700">
                        {state} State Income Tax
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">
                          No State Tax!
                        </span>
                      </td>
                      <td className="text-green-700 font-medium">0%</td>
                      <td className="text-green-700 font-semibold">$0</td>
                    </tr>
                    <tr className="bg-gray-50">
                      <td className="font-medium text-gray-700">Total Tax</td>
                      <td className="text-gray-600">{pct(tax.effectiveTotalRate)}</td>
                      <td className="text-red-600 font-bold">−{fmt(tax.totalTax)}</td>
                    </tr>
                    <tr className="row-total">
                      <td>Take-Home Pay</td>
                      <td>{pct(1 - tax.effectiveTotalRate)}</td>
                      <td className="text-xl">{fmt(tax.takeHome)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* Pay Period Breakdown */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Pay Period Breakdown
              </h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="tax-table">
                  <thead>
                    <tr>
                      <th>Pay Period</th>
                      <th>Gross Pay</th>
                      <th>Total Tax</th>
                      <th>Take-Home</th>
                    </tr>
                  </thead>
                  <tbody>
                    {periods.map(({ label, divisor }) => (
                      <tr
                        key={label}
                        className={label === "Monthly" ? "row-highlight" : ""}
                      >
                        <td className="font-medium">{label}</td>
                        <td className="text-gray-600">{fmt(tax.gross / divisor)}</td>
                        <td className="text-red-500">−{fmt(tax.totalTax / divisor)}</td>
                        <td className="font-bold text-green-700">{fmt(tax.takeHome / divisor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                Hourly assumes 2,080 hrs/year (40 hrs/week × 52 weeks).
                Daily assumes 260 working days/year.
              </p>
            </section>

            {/* ── Ad: In-Content ──────────────────────────────────────────── */}
            <div className="ad-slot ad-in-content" />

            {/* Texas No-Tax Highlight */}
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl">⭐</div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900 mb-2">
                    {state} Has No State Income Tax — Here&apos;s What That Means for You
                  </h2>
                  <p className="text-gray-700 text-sm leading-relaxed mb-3">
                    {state} is one of only <strong>9 states</strong> that levies{" "}
                    <strong>zero state income tax</strong>. On your $
                    {amtFmt} salary, you save:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 text-center mb-3">
                    {[
                      { label: "vs. California (13.3%)", saving: Math.round(amount * 0.093) },
                      { label: "vs. New York (6.85%)",   saving: Math.round(amount * 0.048) },
                      { label: "vs. Illinois (4.95%)",   saving: Math.round(amount * 0.0495) },
                    ].map(({ label, saving }) => (
                      <div
                        key={label}
                        className="bg-white border border-amber-200 rounded-xl p-3"
                      >
                        <p className="text-xs text-gray-500 mb-1">{label}</p>
                        <p className="text-green-700 font-bold text-lg">
                          +${saving.toLocaleString()}/yr
                        </p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500">
                    * Estimated state tax savings. Actual amounts vary by
                    filing status and deductions.
                  </p>
                </div>
              </div>
            </section>

            {/* Federal Tax Brackets Explainer */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {TAX_YEAR} Federal Tax Brackets (Single Filer)
              </h2>
              <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
                <table className="tax-table">
                  <thead>
                    <tr>
                      <th>Bracket</th>
                      <th>Taxable Income Range</th>
                      <th>Tax Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { range: "$0 – $11,600",          rate: "10%",  applies: tax.federalTaxable > 0 },
                      { range: "$11,601 – $47,150",     rate: "12%",  applies: tax.federalTaxable > 11_600 },
                      { range: "$47,151 – $100,525",    rate: "22%",  applies: tax.federalTaxable > 47_150 },
                      { range: "$100,526 – $191,950",   rate: "24%",  applies: tax.federalTaxable > 100_525 },
                      { range: "$191,951 – $243,725",   rate: "32%",  applies: tax.federalTaxable > 191_950 },
                      { range: "$243,726 – $609,350",   rate: "35%",  applies: tax.federalTaxable > 243_725 },
                      { range: "Over $609,350",         rate: "37%",  applies: tax.federalTaxable > 609_350 },
                    ].map(({ range, rate, applies }) => (
                      <tr
                        key={rate}
                        className={
                          applies && rate === pct(tax.marginalRate)
                            ? "bg-blue-50 font-semibold"
                            : applies
                            ? ""
                            : "opacity-40"
                        }
                      >
                        <td>{applies && rate === pct(tax.marginalRate) ? "← Your top bracket" : ""}</td>
                        <td>{range}</td>
                        <td className="font-semibold">{rate}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                After applying the $14,600 standard deduction, your federal
                taxable income is {fmt(tax.federalTaxable)}.
              </p>
            </section>

            {/* FAQ Section — drives featured snippets */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Frequently Asked Questions
              </h2>
              <div className="space-y-5">
                {faqItems.map(({ q, a }) => (
                  <div
                    key={q}
                    className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">
                      {q}
                    </h3>
                    <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Related Salaries Grid */}
            <section>
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                More Texas Salary Calculations
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  30_000, 40_000, 50_000, 60_000, 70_000, 75_000, 80_000, 85_000,
                  90_000, 95_000, 100_000, 110_000, 120_000, 125_000, 150_000, 200_000,
                  250_000, 300_000, 400_000, 500_000,
                ]
                  .filter((a) => a !== amount)
                  .slice(0, 16)
                  .map((a) => (
                    <Link
                      key={a}
                      href={`/salary/${a}-salary-after-tax-texas`}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700">
                        ${a.toLocaleString()}
                      </p>
                      <p className="text-green-600 text-xs mt-0.5 font-medium">
                        {fmt(calculateTexasTax(a).takeHome)}/yr
                      </p>
                    </Link>
                  ))}
              </div>
            </section>
          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <aside className="space-y-5 lg:sticky lg:top-20">

            {/* Ad: Rectangle 300×250 */}
            <div className="ad-slot ad-rectangle" />

            {/* Try Another Salary */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3">
                Calculate a Different Salary
              </h3>
              <Link
                href="/"
                className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-800 transition-colors"
              >
                Use Calculator →
              </Link>
            </div>

            {/* Quick Stats */}
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
              <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
                Quick Stats — ${amtFmt} in {state}
              </h3>
              <div className="space-y-3">
                {[
                  { label: "Take-Home (Annual)", value: fmt(tax.takeHome), green: true },
                  { label: "Monthly Take-Home",  value: fmt(tax.takeHome / 12), green: true },
                  { label: "Federal Tax",        value: fmt(tax.federalTax), red: true },
                  { label: "FICA Total",         value: fmt(tax.ficaTotal), red: true },
                  { label: "State Tax",          value: "$0", green: true },
                  { label: "Effective Rate",     value: pct(tax.effectiveTotalRate) },
                  { label: "Marginal Rate",      value: pct(tax.marginalRate) },
                ].map(({ label, value, green, red }) => (
                  <div key={label} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                    <span className="text-gray-600">{label}</span>
                    <span
                      className={
                        green
                          ? "font-bold text-green-700"
                          : red
                          ? "font-semibold text-red-600"
                          : "font-semibold text-gray-900"
                      }
                    >
                      {value}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nearby Salaries */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Nearby Salaries in {state}
              </h3>
              <div className="space-y-1">
                {nearbyLinks.map((a) => (
                  <Link
                    key={a}
                    href={`/salary/${a}-salary-after-tax-texas`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 hover:text-blue-700 transition-colors"
                  >
                    <span>${a.toLocaleString()}/yr</span>
                    <span className="text-gray-400 text-xs">→ {fmt(calculateTexasTax(a).takeHome)}</span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Popular Salaries */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">
                Popular {state} Salaries
              </h3>
              <div className="space-y-1">
                {popularLinks.slice(0, 8).map((a) => (
                  <Link
                    key={a}
                    href={`/salary/${a}-salary-after-tax-texas`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 hover:text-blue-700 transition-colors"
                  >
                    <span>${a.toLocaleString()}/yr</span>
                    <span className="text-green-600 text-xs font-medium">
                      {fmt(calculateTexasTax(a).takeHome)}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
              <strong className="text-gray-800">Disclaimer:</strong> These
              calculations are estimates based on {TAX_YEAR} IRS tax brackets for
              a single filer taking the standard deduction. Actual taxes may vary.
              Consult a CPA for personalized tax advice.
            </div>
          </aside>
        </div>

        {/* ── Bottom Ad ────────────────────────────────────────────────────── */}
        <div className="ad-slot ad-bottom mt-12" />
      </main>
    </>
  );
}
