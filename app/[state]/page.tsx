import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";

type Params = Promise<{ state: string }>;

// ─── Static Generation ────────────────────────────────────────────────────────
// Texas → app/texas/page.tsx; California → app/california/page.tsx (both take precedence)
export function generateStaticParams() {
  return ALL_STATE_CONFIGS
    .filter((s) => s.slug !== "texas" && s.slug !== "california")
    .map((s) => ({ state: s.slug }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { state: stateParam } = await params;
  const cfg = STATE_BY_SLUG.get(stateParam);
  if (!cfg) return {};

  const { name, noTax, topRateDisplay, slug } = cfg;

  // Compute real take-home numbers for the metadata description
  const t75  = calculateTax(cfg, 75_000);
  const t100 = calculateTax(cfg, 100_000);
  const take75  = Math.round(t75.takeHome).toLocaleString("en-US");
  const take100 = Math.round(t100.takeHome).toLocaleString("en-US");
  const mo100   = Math.round(t100.takeHome / 12).toLocaleString("en-US");

  const title = noTax
    ? `${name} Salary Calculator ${TAX_YEAR} — $0 State Tax | Free`
    : `${name} Salary After Tax ${TAX_YEAR} — Up to ${topRateDisplay} State Tax`;

  const description = noTax
    ? `${name} has NO state income tax. $100K salary → $${take100}/yr ($${mo100}/mo). $75K → $${take75}/yr. Real ${TAX_YEAR} brackets, instant, free.`
    : `$100K salary in ${name} → $${take100}/yr take-home ($${mo100}/mo). $75K → $${take75}/yr. State tax up to ${topRateDisplay}. Free ${TAX_YEAR} breakdown.`;

  return {
    title,
    description,
    alternates: { canonical: `https://www.takehomeusa.com/${slug}` },
    openGraph: {
      title: `${name} Salary After Tax Calculator (${TAX_YEAR})`,
      description,
      url: `https://www.takehomeusa.com/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

// ─── Salary Ranges ────────────────────────────────────────────────────────────
const SALARY_RANGES = [
  { label: "Entry Level",  icon: "🌱", desc: "$20K – $49K",   salaries: [20_000, 25_000, 30_000, 35_000, 40_000, 45_000] },
  { label: "Mid Career",   icon: "📈", desc: "$50K – $74K",   salaries: [50_000, 55_000, 60_000, 65_000, 70_000, 75_000] },
  { label: "Experienced",  icon: "💼", desc: "$75K – $99K",   salaries: [75_000, 80_000, 85_000, 90_000, 95_000, 99_000] },
  { label: "Senior",       icon: "⭐", desc: "$100K – $149K", salaries: [100_000, 110_000, 120_000, 125_000, 130_000, 140_000] },
  { label: "Six Figures+", icon: "🚀", desc: "$150K – $300K", salaries: [150_000, 175_000, 200_000, 225_000, 250_000, 300_000] },
];

const COMPARE_SALARIES = [30_000, 50_000, 75_000, 100_000, 125_000, 150_000, 200_000];

// ─── Page ─────────────────────────────────────────────────────────────────────
export default async function StatePage({ params }: { params: Params }) {
  const { state: stateParam } = await params;
  const cfg = STATE_BY_SLUG.get(stateParam);
  if (!cfg) return notFound();

  const { name, noTax, topRateDisplay, description, heroGradient, slug, flat, deduction } = cfg;
  const texasConfig = STATE_BY_SLUG.get("texas")!;

  // ── Build state-specific FAQs ──────────────────────────────────────────────
  const tax75k = calculateTax(cfg, 75_000);
  const tax100k = calculateTax(cfg, 100_000);
  const texasTax100k = calculateTax(texasConfig, 100_000);

  const faqs = noTax
    ? [
        {
          q: `Does ${name} have a state income tax?`,
          a: `No. ${name} is one of nine US states with zero state income tax. You pay $0 in state tax on your wages — a major advantage over states like California (up to 13.3%) or New York (up to 10.9%).`,
        },
        {
          q: `How is take-home pay calculated in ${name}?`,
          a: `${name} take-home = Gross Salary − Federal Income Tax − Social Security (6.2%) − Medicare (1.45%). No state income tax. Federal brackets use ${TAX_YEAR} IRS rates (10%–37%) after the $16,100 standard deduction.`,
        },
        {
          q: `What is the average take-home pay in ${name}?`,
          a: `At $65,000 in ${name}, take-home is approximately ${fmt(calculateTax(cfg, 65_000).takeHome)}/year or ${fmt(calculateTax(cfg, 65_000).takeHome / 12)}/month in ${TAX_YEAR} — identical to Texas since both have no state income tax.`,
        },
        {
          q: `How much of my paycheck goes to taxes in ${name}?`,
          a: `In ${name}: federal income tax (varies by income), Social Security (6.2% up to $184,500), and Medicare (1.45%). No state tax. At $75,000, the effective total rate is ${pct(tax75k.effectiveTotalRate)}.`,
        },
        {
          q: `Is ${name} a good state for taxes?`,
          a: `Yes — ${name} is one of the most tax-friendly states for workers. Zero state income tax means residents keep thousands more per year compared to high-tax states like California or New York.`,
        },
        {
          q: `What other states have no income tax like ${name}?`,
          a: `The 9 no-income-tax states are: Texas, Florida, Nevada, Wyoming, South Dakota, Alaska, Tennessee, New Hampshire (wages only), and Washington. Moving from a high-tax state can add thousands annually to your take-home.`,
        },
      ]
    : [
        {
          q: `Does ${name} have a state income tax?`,
          a: `Yes. ${name} has a state income tax with a top rate of ${topRateDisplay}. This is applied on top of federal income tax and FICA, reducing take-home compared to no-tax states like Texas or Florida.`,
        },
        {
          q: `How is take-home pay calculated in ${name}?`,
          a: `${name} take-home = Gross − Federal Tax − ${name} State Tax − Social Security (6.2%) − Medicare (1.45%). ${name} state tax applies to income above the $${deduction.toLocaleString()} deduction using ${flat !== undefined ? `a flat ${topRateDisplay} rate` : "progressive brackets"}.`,
        },
        {
          q: `What is the ${name} state income tax rate?`,
          a: `${name}'s top rate is ${topRateDisplay}. ${flat !== undefined ? `${name} uses a flat ${topRateDisplay} applied to income above the $${deduction.toLocaleString()} deduction.` : `${name} uses progressive brackets — lower income is taxed at lower rates, with the top rate kicking in at higher thresholds.`}`,
        },
        {
          q: `How much of my paycheck goes to taxes in ${name}?`,
          a: `At $75,000 in ${name}: effective total rate = ${pct(tax75k.effectiveTotalRate)}, combining federal (${pct(tax75k.effectiveFederalRate)} eff.), state (${pct(tax75k.stateTax / 75_000)} eff.), and FICA (${pct(tax75k.ficaTotal / 75_000)} eff.).`,
        },
        {
          q: `How does ${name} compare to Texas for take-home pay?`,
          a: `At $100,000: ${name} take-home is ${fmt(tax100k.takeHome)}/year vs. ${fmt(texasTax100k.takeHome)}/year in Texas. That's ${fmt(texasTax100k.takeHome - tax100k.takeHome)}/year more in Texas due to no state income tax.`,
        },
        {
          q: `What is the top income tax bracket in ${name}?`,
          a: `${name}'s top state rate is ${topRateDisplay}. Your effective (average) state rate will be lower — ${pct(tax100k.stateTax / 100_000)} effective at $100K — because only income above each threshold is taxed at the top rate.`,
        },
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",       item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "All States", item: "https://www.takehomeusa.com/states" },
      { "@type": "ListItem", position: 3, name: `${name} Salary Calculator`, item: `https://www.takehomeusa.com/${slug}` },
    ],
  };

  const browseAmounts = Array.from({ length: 48 }, (_, i) => (i + 2) * 10_000);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className={`bg-gradient-to-br ${heroGradient} text-white`}>
        <div className="container-page py-14 sm:py-18">
          <nav className="text-white/60 text-sm mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-white transition-colors">States</Link>
            <span>/</span>
            <span className="text-white">{name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              {noTax ? (
                <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-sm font-semibold px-4 py-1.5 rounded-full">
                  <span>★</span>
                  <span>{name} has ZERO state income tax</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full">
                  <span>{name} state income tax: up to {topRateDisplay}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                Updated for {TAX_YEAR} IRS Brackets
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              {name} Salary After Tax<br />
              <span className="text-white/60">Calculator {TAX_YEAR}</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl">
              {description} See your exact take-home pay for any salary, powered by real {TAX_YEAR} federal and state tax data.
            </p>

            {/* Key stat cards */}
            <div className="grid grid-cols-3 gap-4 max-w-lg">
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className={`text-2xl font-black ${noTax ? "text-green-400" : "text-white"}`}>
                  {noTax ? "$0" : topRateDisplay}
                </p>
                <p className="text-xs text-white/60 mt-1">
                  {noTax ? "State Income Tax" : "Top State Rate"}
                </p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white">7.65%</p>
                <p className="text-xs text-white/60 mt-1">FICA (SS + Medicare)</p>
              </div>
              <div className="bg-white/10 rounded-xl p-4 text-center backdrop-blur-sm">
                <p className="text-2xl font-black text-white/70">10–37%</p>
                <p className="text-xs text-white/60 mt-1">Federal Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ─────────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Salary Ranges ─────────────────────────────────────────────────── */}
      <section className="container-page">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {name} Take-Home Pay — By Salary Range
        </h2>
        <p className="text-gray-500 mb-8">
          Click any salary for the full {TAX_YEAR} breakdown, monthly tables, and more.
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
                  const t = calculateTax(cfg, amount);
                  return (
                    <Link
                      key={amount}
                      href={`/salary/${amount}-salary-after-tax-${slug}`}
                      className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-lg transition-all text-center"
                    >
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700 mb-1">
                        ${amount.toLocaleString()}
                      </p>
                      <p className={`font-bold text-sm ${noTax ? "text-green-600" : "text-blue-600"}`}>
                        {fmt(t.takeHome)}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">{fmt(t.takeHome / 12)}/mo</p>
                      <p className="text-gray-300 text-xs">{pct(t.effectiveTotalRate)} eff.</p>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Mid-page Ad ────────────────────────────────────────────────────── */}
      <div className="container-page my-10">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Tax Breakdown Table ────────────────────────────────────────────── */}
      <section className={`${noTax ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"} border-y py-12`}>
        <div className="container-page">
          <div className="max-w-3xl mx-auto text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              {name} Take-Home Pay — {TAX_YEAR} Summary
            </h2>
            <p className="text-gray-600">
              {noTax
                ? `${name} has no state income tax — saving you thousands vs. high-tax states.`
                : `${name} state tax tops out at ${topRateDisplay}. Here's what you actually keep.`}
            </p>
          </div>

          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Annual Salary</th>
                  <th>Take-Home in {name}</th>
                  {!noTax && <th>State Tax</th>}
                  <th>Monthly</th>
                  <th>Effective Rate</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {COMPARE_SALARIES.map((amt) => {
                  const t = calculateTax(cfg, amt);
                  return (
                    <tr key={amt}>
                      <td className="font-semibold text-gray-900">${amt.toLocaleString()}</td>
                      <td className={`font-bold ${noTax ? "text-green-700" : "text-blue-700"}`}>
                        {fmt(t.takeHome)}
                      </td>
                      {!noTax && (
                        <td className="text-purple-700 text-sm">{fmt(t.stateTax)}</td>
                      )}
                      <td className="text-gray-600">{fmt(t.takeHome / 12)}</td>
                      <td className="text-gray-600">{pct(t.effectiveTotalRate)}</td>
                      <td>
                        <Link
                          href={`/salary/${amt}-salary-after-tax-${slug}`}
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

          {/* Comparison vs. Texas for taxed states */}
          {!noTax && (
            <div className="mt-8 bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-bold text-gray-900 mb-4">
                {name} vs. Texas (No State Tax) — Side-by-Side
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {[75_000, 100_000, 150_000].map((amt) => {
                  const stTax = calculateTax(cfg, amt);
                  const txTax = calculateTax(texasConfig, amt);
                  const diff = txTax.takeHome - stTax.takeHome;
                  return (
                    <div key={amt} className="p-4 bg-gray-50 rounded-xl">
                      <p className="font-bold text-gray-900 mb-2">${amt.toLocaleString()} salary</p>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">{name}:</span>
                          <span className="font-semibold text-blue-700">{fmt(stTax.takeHome)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Texas:</span>
                          <span className="font-semibold text-green-700">{fmt(txTax.takeHome)}</span>
                        </div>
                        <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                          <span className="text-gray-500">TX advantage:</span>
                          <span className="font-black text-gray-900">{fmt(diff)}/yr</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── FAQ ────────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {name} Income Tax — Frequently Asked Questions
        </h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {faqs.map(({ q, a }) => (
            <div
              key={q}
              className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors"
            >
              <h3 className="font-bold text-gray-900 mb-3 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Browse All ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Browse All {name} Salary Calculations
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            Every salary from $20,000 to $500,000 — click any amount for the full {TAX_YEAR} breakdown.
          </p>
          <div className="grid grid-cols-4 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {browseAmounts.map((amt) => (
              <Link
                key={amt}
                href={`/salary/${amt}-salary-after-tax-${slug}`}
                className="text-center text-xs sm:text-sm bg-white border border-gray-200 rounded-lg py-2 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50 transition-all font-medium"
              >
                ${amt / 1000}K
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Don&apos;t see your exact salary?</h2>
          <p className="text-blue-300 mb-6">
            Use the calculator for a precise result for any salary from $20,000 to $500,000.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Use the Calculator →
            </Link>
            <Link
              href="/states"
              className="inline-block border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              All 50 States
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom Ad ──────────────────────────────────────────────────────── */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
