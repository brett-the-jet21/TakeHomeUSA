export const dynamic = "force-static";
export const dynamicParams = false;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";

// ─── Salary Amounts to Generate ───────────────────────────────────────────────
// Popular round-number salary queries that don't specify a state
const SALARY_AMOUNTS = [
  20_000, 25_000, 30_000, 35_000, 40_000, 45_000, 50_000,
  55_000, 60_000, 65_000, 70_000, 75_000, 80_000, 85_000, 90_000, 95_000,
  100_000, 105_000, 110_000, 115_000, 120_000, 125_000, 130_000, 135_000,
  140_000, 145_000, 150_000, 160_000, 175_000, 200_000, 225_000, 250_000,
  300_000, 350_000, 400_000, 500_000,
];

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

// ─── Slug Parser ──────────────────────────────────────────────────────────────
// Format: "{amount}-a-year-after-tax"
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-a-year-after-tax$/);
  if (!m) return null;
  const amount = Number(m[1]);
  if (!SALARY_AMOUNTS.includes(amount)) return null;
  return { amount };
}

// ─── Static Generation ────────────────────────────────────────────────────────
export function generateStaticParams() {
  return SALARY_AMOUNTS.map((amount) => ({
    slug: `${amount}-a-year-after-tax`,
  }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { amount } = parsed;
  const amtFmt = amount.toLocaleString("en-US");

  // Compute Texas take-home as the reference "best case" (no state tax)
  const texasCfg = STATE_BY_SLUG.get("texas")!;
  const texasTax = calculateTax(texasCfg, amount);
  const texasFmt = Math.round(texasTax.takeHome).toLocaleString("en-US");
  const texasMoFmt = Math.round(texasTax.takeHome / 12).toLocaleString("en-US");

  // California for "worst case" comparison
  const caCfg = STATE_BY_SLUG.get("california")!;
  const caTax = calculateTax(caCfg, amount);
  const caFmt = Math.round(caTax.takeHome).toLocaleString("en-US");

  const title = `$${amtFmt} a Year After Taxes — All 50 States (${TAX_YEAR})`;
  const desc = `How much is $${amtFmt}/year after taxes? Texas → $${texasFmt}/yr ($${texasMoFmt}/mo). California → $${caFmt}/yr. All 50 states — ${TAX_YEAR} IRS brackets, free & instant.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.takehomeusa.com/after-tax/${slug}` },
    openGraph: {
      title: `$${amtFmt} a Year After Taxes — All 50 States | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/after-tax/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function AfterTaxPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { amount } = parsed;
  const amtFmt = amount.toLocaleString("en-US");

  // Compute results for all states, sorted best to worst take-home
  const allResults = ALL_STATE_CONFIGS.map((cfg) => {
    const tax = calculateTax(cfg, amount);
    return { cfg, tax };
  }).sort((a, b) => b.tax.takeHome - a.tax.takeHome);

  const best = allResults[0];
  const worst = allResults[allResults.length - 1];
  const texasResult = allResults.find((r) => r.cfg.slug === "texas")!;
  const californiaResult = allResults.find((r) => r.cfg.slug === "california")!;

  // Key comparable salaries for navigation
  const idx = SALARY_AMOUNTS.indexOf(amount);
  const prevAmount = idx > 0 ? SALARY_AMOUNTS[idx - 1] : null;
  const nextAmount = idx < SALARY_AMOUNTS.length - 1 ? SALARY_AMOUNTS[idx + 1] : null;

  const noTaxStates = allResults.filter((r) => r.cfg.noTax);
  const taxedStates = allResults.filter((r) => !r.cfg.noTax);

  // Marginal federal rate for this salary
  const federalMarginalRate = best.tax.marginalRate;

  const faqItems = [
    {
      q: `How much is $${amtFmt} a year after taxes?`,
      a: `It depends on your state. $${amtFmt}/year take-home ranges from ${fmt(best.tax.takeHome)} in ${best.cfg.name} (${best.cfg.noTax ? "no state income tax" : `${best.cfg.topRateDisplay} state tax`}) to ${fmt(worst.tax.takeHome)} in ${worst.cfg.name} (${worst.cfg.topRateDisplay} state tax). In Texas (no state tax), take-home is ${fmt(texasResult.tax.takeHome)}/year ($${Math.round(texasResult.tax.takeHome / 12).toLocaleString()}/month).`,
    },
    {
      q: `What is $${amtFmt} a year monthly after taxes?`,
      a: `At $${amtFmt}/year, monthly take-home after taxes varies by state: Texas ($${Math.round(texasResult.tax.takeHome / 12).toLocaleString()}/mo), California ($${Math.round(californiaResult.tax.takeHome / 12).toLocaleString()}/mo). The range across all 50 states is ${fmt(worst.tax.takeHome / 12)} to ${fmt(best.tax.takeHome / 12)} per month.`,
    },
    {
      q: `What is the federal tax on a $${amtFmt} salary?`,
      a: `Federal income tax on $${amtFmt} (single filer, standard deduction) is ${fmt(texasResult.tax.federalTax)} — an effective federal rate of ${pct(texasResult.tax.effectiveFederalRate)}. Your marginal federal bracket is ${Math.round(federalMarginalRate * 100)}%. FICA (Social Security + Medicare) adds ${fmt(texasResult.tax.ficaTotal)}.`,
    },
    {
      q: `Which states have the lowest taxes on a $${amtFmt} salary?`,
      a: `The 9 no-income-tax states give you the highest take-home: ${noTaxStates.map((r) => r.cfg.name).join(", ")}. At $${amtFmt}, all these states yield approximately ${fmt(noTaxStates[0].tax.takeHome)}/year take-home (differences are rounding only).`,
    },
    {
      q: `How does $${amtFmt} take-home differ between Texas and California?`,
      a: `At $${amtFmt}: Texas take-home is ${fmt(texasResult.tax.takeHome)}/year; California is ${fmt(californiaResult.tax.takeHome)}/year. That's ${fmt(texasResult.tax.takeHome - californiaResult.tax.takeHome)}/year more in Texas — ${fmt((texasResult.tax.takeHome - californiaResult.tax.takeHome) / 12)}/month.`,
    },
    {
      q: `Is $${amtFmt} a good salary?`,
      a: `$${amtFmt}/year${
        amount >= 200_000
          ? ` is well above the US median household income (~$75K) and puts you in the top income brackets.`
          : amount >= 100_000
          ? ` is above the US median household income (~$75K) and considered a solid six-figure income.`
          : amount >= 75_000
          ? ` is near the US median household income (~$75K), providing a comfortable living in most states.`
          : amount >= 50_000
          ? ` is near the US median individual earnings. Comfortable in lower cost-of-living areas; tighter in high-cost cities.`
          : ` is below the US median individual earnings. Take-home in a no-tax state like Texas is ${fmt(texasResult.tax.takeHome)}/year.`
      } After-tax take-home ranges from ${fmt(worst.tax.takeHome)}/yr (${worst.cfg.name}) to ${fmt(best.tax.takeHome)}/yr (${best.cfg.name}).`,
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
      { "@type": "ListItem", position: 2, name: "Salary After Tax", item: "https://www.takehomeusa.com/states" },
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax`, item: `https://www.takehomeusa.com/after-tax/${slug}` },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white">
        <div className="container-page py-14 sm:py-18">
          <nav className="text-white/60 text-sm mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-white transition-colors">All States</Link>
            <span>/</span>
            <span className="text-white">${amtFmt} After Tax</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full">
                All 50 States Compared
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                {TAX_YEAR} IRS Brackets
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              ${amtFmt} a Year After Taxes<br />
              <span className="text-white/60">— All 50 States ({TAX_YEAR})</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl">
              How much do you actually keep? Your take-home depends heavily on which state you live in.
              Here&apos;s the full breakdown.
            </p>

            {/* Hero stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl">
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-green-400">{fmt(best.tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Best: {best.cfg.name}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white">{fmt(texasResult.tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Texas (no state tax)</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm col-span-2 sm:col-span-1">
                <p className="text-xl sm:text-2xl font-black text-red-300">{fmt(worst.tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Lowest: {worst.cfg.name}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ───────────────────────────────────────────────────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Quick Key Facts ───────────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-blue-600 mb-1">Federal Tax (single)</p>
            <p className="text-2xl font-black text-blue-900">{fmt(texasResult.tax.federalTax)}</p>
            <p className="text-xs text-blue-500 mt-1">{pct(texasResult.tax.effectiveFederalRate)} effective rate</p>
          </div>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-gray-600 mb-1">FICA (SS + Medicare)</p>
            <p className="text-2xl font-black text-gray-900">{fmt(texasResult.tax.ficaTotal)}</p>
            <p className="text-xs text-gray-400 mt-1">Same in all 50 states</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-green-700 mb-1">Top Take-Home (no tax states)</p>
            <p className="text-2xl font-black text-green-900">{fmt(best.tax.takeHome)}</p>
            <p className="text-xs text-green-500 mt-1">{fmt(best.tax.takeHome / 12)}/month</p>
          </div>
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="text-sm font-semibold text-red-700 mb-1">Lowest Take-Home</p>
            <p className="text-2xl font-black text-red-900">{fmt(worst.tax.takeHome)}</p>
            <p className="text-xs text-red-400 mt-1">{worst.cfg.name} — {worst.cfg.topRateDisplay} state tax</p>
          </div>
        </div>
      </section>

      {/* ── All 50 States Table ───────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          ${amtFmt} Salary After Taxes — All 50 States
        </h2>
        <p className="text-gray-500 mb-6">
          Sorted highest to lowest take-home. Click any state for the full breakdown.
        </p>

        {/* No-tax states */}
        <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
          <span className="text-green-600">★</span> No State Income Tax (9 States)
        </h3>
        <div className="overflow-hidden rounded-2xl border border-green-200 shadow-sm mb-8">
          <div className="overflow-x-auto">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>State Tax</th>
                  <th>Federal Tax</th>
                  <th>Monthly</th>
                  <th>Take-Home / Year</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {noTaxStates.map(({ cfg, tax }) => (
                  <tr key={cfg.slug}>
                    <td className="font-semibold text-gray-900">{cfg.name}</td>
                    <td className="text-green-700 font-semibold">$0</td>
                    <td className="text-gray-600 tabular-nums">{fmt(tax.federalTax)}</td>
                    <td className="text-gray-600 tabular-nums">{fmt(tax.takeHome / 12)}</td>
                    <td className="font-bold text-green-700 tabular-nums">{fmt(tax.takeHome)}</td>
                    <td>
                      <Link
                        href={`/salary/${amount}-salary-after-tax-${cfg.slug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Full breakdown →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* States with income tax */}
        <h3 className="text-lg font-bold text-gray-800 mb-3">States with Income Tax</h3>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <div className="overflow-x-auto">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>State</th>
                  <th>State Tax</th>
                  <th>Federal Tax</th>
                  <th>Monthly</th>
                  <th>Take-Home / Year</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {taxedStates.map(({ cfg, tax }) => (
                  <tr key={cfg.slug}>
                    <td className="font-semibold text-gray-900">{cfg.name}</td>
                    <td className="text-purple-700 tabular-nums">{fmt(tax.stateTax)}</td>
                    <td className="text-gray-600 tabular-nums">{fmt(tax.federalTax)}</td>
                    <td className="text-gray-600 tabular-nums">{fmt(tax.takeHome / 12)}</td>
                    <td className="font-bold text-blue-700 tabular-nums">{fmt(tax.takeHome)}</td>
                    <td>
                      <Link
                        href={`/salary/${amount}-salary-after-tax-${cfg.slug}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        Full breakdown →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {TAX_YEAR} IRS brackets, single filer, standard deduction. State taxes are estimates — actual amounts vary by credits and local taxes.
        </p>
      </section>

      {/* ── Mid Ad ───────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ${amtFmt} a Year After Taxes — FAQ
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {faqItems.map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors">
              <h3 className="font-bold text-gray-900 mb-3 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular State Picks ───────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border-y border-blue-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            ${amtFmt} Salary — Popular States
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {["texas", "california", "new-york", "florida", "washington", "georgia", "illinois", "pennsylvania"].map((stateSlug) => {
              const cfg = STATE_BY_SLUG.get(stateSlug);
              if (!cfg) return null;
              const tax = calculateTax(cfg, amount);
              return (
                <Link
                  key={stateSlug}
                  href={`/salary/${amount}-salary-after-tax-${stateSlug}`}
                  className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                >
                  <p className="font-bold text-gray-900">{cfg.name}</p>
                  {cfg.noTax && <p className="text-xs text-green-600 font-semibold">No state tax</p>}
                  <p className="font-bold text-blue-700 text-lg mt-1">{fmt(tax.takeHome)}</p>
                  <p className="text-gray-400 text-sm">{fmt(tax.takeHome / 12)}/mo</p>
                  <p className="text-xs text-gray-400 mt-1">{pct(tax.effectiveTotalRate)} eff. rate</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Browse Other Salaries ─────────────────────────────────────────────── */}
      <section className="container-page my-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">Browse Other Salaries</h2>
        <p className="text-gray-500 text-sm mb-6">See take-home pay for other annual salaries across all 50 states.</p>
        <div className="flex flex-wrap gap-2">
          {SALARY_AMOUNTS.map((amt) => {
            const isCurrent = amt === amount;
            return (
              <Link
                key={amt}
                href={`/after-tax/${amt}-a-year-after-tax`}
                className={`border rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:text-blue-700"
                }`}
              >
                ${amt >= 1_000_000 ? `${amt / 1_000_000}M` : amt >= 1_000 ? `${(amt / 1_000).toFixed(0)}K` : amt}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Prev / Next navigation ────────────────────────────────────────────── */}
      {(prevAmount || nextAmount) && (
        <section className="container-page mb-8">
          <div className="flex justify-between gap-4">
            {prevAmount ? (
              <Link
                href={`/after-tax/${prevAmount}-a-year-after-tax`}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-sm"
              >
                ← ${prevAmount.toLocaleString()}/year
              </Link>
            ) : <div />}
            {nextAmount ? (
              <Link
                href={`/after-tax/${nextAmount}-a-year-after-tax`}
                className="flex items-center gap-2 text-blue-700 hover:text-blue-900 font-semibold text-sm"
              >
                ${nextAmount.toLocaleString()}/year →
              </Link>
            ) : <div />}
          </div>
        </section>
      )}

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Enter your exact salary</h2>
          <p className="text-blue-300 mb-6">
            Adjust for 401k, health insurance, filing status, and city taxes — free, instant results.
          </p>
          <Link
            href="/"
            className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
          >
            Open Calculator →
          </Link>
        </div>
      </section>

      {/* ── Bottom Ad ────────────────────────────────────────────────────────── */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
