export const dynamic = "force-static";
export const dynamicParams = true;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS } from "@/lib/states";
import SalaryCalculator from "@/app/salary/[slug]/SalaryCalculator";

// ─── Monthly Amounts to Generate ─────────────────────────────────────────────
// Top round-number amounts pre-built; dynamicParams=true handles everything else
const MONTHLY_AMOUNTS = [
  1_000, 2_000, 3_000, 4_000, 5_000, 6_000,
  7_000, 8_000, 10_000, 12_000, 15_000, 20_000,
];

type Params = Promise<{ slug?: string }>;

// Format: "{amount}-a-month-after-tax-{state}"
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-a-month-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const monthly = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(monthly) || monthly < 100 || monthly > 10_000_000) return null;
  const stateConfig = STATE_BY_SLUG.get(stateSlug);
  if (!stateConfig) return null;
  return { monthly, stateSlug, stateConfig };
}

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const monthly of MONTHLY_AMOUNTS) {
    for (const [stateSlug] of STATE_BY_SLUG) {
      params.push({ slug: `${monthly}-a-month-after-tax-${stateSlug}` });
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { monthly, stateConfig } = parsed;
  const { name: stateName, noTax } = stateConfig;
  const annualGross = monthly * 12;
  const tax = calculateTax(stateConfig, annualGross);
  const netMonthly = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const annualNet = Math.round(tax.takeHome).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);
  const moFmt = monthly.toLocaleString("en-US");

  const title = `$${moFmt}/Month After Taxes in ${stateName} — $${netMonthly}/mo`;
  const desc = noTax
    ? `Earning $${moFmt}/month in ${stateName}? Take-home = $${netMonthly}/mo (${TAX_YEAR}). No state income tax — effective rate ${effRate}%. Free, instant, no signup.`
    : `Earning $${moFmt}/month in ${stateName}? Take-home = $${netMonthly}/mo (${TAX_YEAR}). Effective rate ${effRate}%. Federal + state breakdown — free, instant, no signup.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.takehomeusa.com/monthly/${slug}` },
    openGraph: {
      title: `$${moFmt}/Month After Taxes in ${stateName} = $${netMonthly}/mo | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/monthly/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: { card: "summary", title, description: desc },
  };
}

export default async function MonthlyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { monthly, stateSlug, stateConfig } = parsed;
  const { name: stateName, noTax, heroGradient } = stateConfig;

  const annualGross = monthly * 12;
  const tax = calculateTax(stateConfig, annualGross);
  const netMonthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const weekly = tax.takeHome / 52;
  const netHourly = tax.takeHome / 2080;
  const moFmt = monthly.toLocaleString("en-US");
  const annualFmt = annualGross.toLocaleString("en-US");

  const faqItems = [
    {
      q: `How much is $${moFmt} a month after taxes in ${stateName}?`,
      a: `$${moFmt}/month ($${annualFmt}/year gross) in ${stateName} leaves you with ${fmt(netMonthly)} per month after federal${noTax ? "" : " and state"} taxes. That's ${fmt(tax.takeHome)} per year take-home, with an effective total tax rate of ${pct(tax.effectiveTotalRate)}.`,
    },
    {
      q: `What is $${moFmt} a month as an annual salary after taxes?`,
      a: `$${moFmt}/month × 12 = $${annualFmt}/year gross. After taxes in ${stateName}, your annual take-home is ${fmt(tax.takeHome)} — an effective rate of ${pct(tax.effectiveTotalRate)}.`,
    },
    {
      q: `What is $${moFmt} a month after taxes biweekly?`,
      a: `At $${moFmt}/month ($${annualFmt}/year), your biweekly take-home in ${stateName} is ${fmt(biweekly)} (26 pay periods per year). Weekly take-home: ${fmt(weekly)}.`,
    },
    {
      q: `What is the hourly rate for $${moFmt} a month after taxes?`,
      a: `$${moFmt}/month = $${annualFmt}/year gross = ${fmt(annualGross / 2080)}/hr gross. After taxes in ${stateName}, take-home is ${fmt(netHourly)}/hr (based on 2,080 hours/year, 40 hrs/week).`,
    },
    {
      q: `Is $${moFmt} a month a good salary in ${stateName}?`,
      a: `$${moFmt}/month ($${annualFmt}/year) is ${annualGross >= 77_000 ? "above the US median household income (~$77K)" : annualGross >= 60_000 ? "near the US median individual income (~$60K)" : "below the US median individual income"}. After taxes in ${stateName}, take-home is ${fmt(netMonthly)}/month${noTax ? " (no state tax)" : ""}.`,
    },
    {
      q: `What taxes are deducted from $${moFmt} a month in ${stateName}?`,
      a: `On a $${annualFmt}/year ($${moFmt}/month) salary in ${stateName}: federal income tax ${fmt(tax.federalTax)}/year${noTax ? "" : `, ${stateName} state tax ${fmt(tax.stateTax)}/year`}, Social Security ${fmt(tax.socialSecurity)}/year, Medicare ${fmt(tax.medicare)}/year. Total: ${fmt(tax.totalTax)}/year (${pct(tax.effectiveTotalRate)} effective rate).`,
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
      { "@type": "ListItem", position: 2, name: `${stateName} Salary Calculator`, item: `https://www.takehomeusa.com/${stateSlug}` },
      { "@type": "ListItem", position: 3, name: `$${moFmt}/mo After Tax in ${stateName}`, item: `https://www.takehomeusa.com/monthly/${slug}` },
    ],
  };

  const allStateResults = ALL_STATE_CONFIGS.map((s) => ({
    state: s,
    takeHome: calculateTax(s, annualGross).takeHome,
    netMonthly: calculateTax(s, annualGross).takeHome / 12,
  })).sort((a, b) => b.takeHome - a.takeHome);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className={`bg-gradient-to-br ${heroGradient} text-white`}>
        <div className="container-page py-14 sm:py-18">
          <nav className="text-white/60 text-sm mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href={`/${stateSlug}`} className="hover:text-white transition-colors">{stateName}</Link>
            <span>/</span>
            <span className="text-white">${moFmt}/mo After Tax</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-5">
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-3 py-1 rounded-full">
                ${moFmt}/mo × 12 = ${annualFmt} gross/year
              </span>
              {noTax && (
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                  ★ No {stateName} State Tax
                </span>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              ${moFmt} a Month After Taxes<br />
              <span className="text-white/60">in {stateName}</span>
            </h1>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mt-6">
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-green-400">{fmt(netMonthly)}</p>
                <p className="text-xs text-white/60 mt-1">Per Month Net</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white">{fmt(tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Per Year Net</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white">{fmt(biweekly)}</p>
                <p className="text-xs text-white/60 mt-1">Biweekly Net</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-xl sm:text-2xl font-black text-white/70">{pct(tax.effectiveTotalRate)}</p>
                <p className="text-xs text-white/60 mt-1">Effective Rate</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ───────────────────────────────────────────────────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Summary Tables ───────────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ${moFmt}/Month After Taxes in {stateName} — {TAX_YEAR} Breakdown
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead><tr><th colSpan={2}>Tax Deductions on ${annualFmt}/yr</th></tr></thead>
              <tbody>
                <tr><td>Federal Income Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.federalTax)}</td></tr>
                {!noTax && <tr><td>{stateName} State Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.stateTax)}</td></tr>}
                <tr><td>Social Security (6.2%)</td><td className="text-orange-600 tabular-nums">−{fmt(tax.socialSecurity)}</td></tr>
                <tr><td>Medicare (1.45%)</td><td className="text-orange-600 tabular-nums">−{fmt(tax.medicare)}</td></tr>
                <tr className="bg-red-50"><td className="font-bold">Total Tax</td><td className="font-bold text-red-700 tabular-nums">−{fmt(tax.totalTax)}</td></tr>
                <tr className="row-total"><td>Annual Take-Home</td><td className="tabular-nums">{fmt(tax.takeHome)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead><tr><th colSpan={2}>Take-Home by Pay Period</th></tr></thead>
              <tbody>
                <tr><td>Per Month</td><td className="font-bold text-green-700 tabular-nums">{fmt(netMonthly)}</td></tr>
                <tr><td>Biweekly (26×/yr)</td><td className="font-semibold text-blue-700 tabular-nums">{fmt(biweekly)}</td></tr>
                <tr><td>Weekly</td><td className="tabular-nums">{fmt(weekly)}</td></tr>
                <tr><td>Hourly (2,080 hrs)</td><td className="tabular-nums">{fmt(netHourly)}</td></tr>
                <tr className="row-total"><td>Annual</td><td className="tabular-nums">{fmt(tax.takeHome)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {TAX_YEAR} IRS brackets, single filer, standard deduction. State tax is estimated.
        </p>
      </section>

      {/* ── Interactive Calculator ───────────────────────────────────────────── */}
      <SalaryCalculator initialAmount={annualGross} stateConfig={stateConfig} />

      {/* ── Mid Ad ───────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ${moFmt} a Month After Taxes in {stateName} — FAQ
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

      {/* ── Same Amount, All States ───────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ${moFmt}/Month After Taxes — All 50 States
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            How much does ${moFmt}/month take home in every state? Sorted best to worst.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allStateResults.map(({ state: s, takeHome, netMonthly: nm }) => (
              <Link
                key={s.slug}
                href={`/monthly/${monthly}-a-month-after-tax-${s.slug}`}
                className={`bg-white border rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-left ${
                  s.slug === stateSlug ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                {s.noTax && <p className="text-xs text-green-600 font-semibold">No state tax</p>}
                <p className="font-bold text-blue-600 text-sm mt-1">{fmt(nm)}/mo</p>
                <p className="text-gray-400 text-xs">{fmt(takeHome)}/yr</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Monthly Amounts for This State ─────────────────────────────── */}
      <section className="container-page my-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Other Monthly Salaries in {stateName}
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {MONTHLY_AMOUNTS.map((mo) => {
            const t = calculateTax(stateConfig, mo * 12);
            return (
              <Link
                key={mo}
                href={`/monthly/${mo}-a-month-after-tax-${stateSlug}`}
                className={`text-center border rounded-lg py-3 px-1 text-xs sm:text-sm transition-all font-medium ${
                  mo === monthly
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <p className="font-bold">${mo >= 1000 ? `${mo / 1000}K` : mo}/mo</p>
                <p className={`text-xs mt-0.5 ${mo === monthly ? "text-blue-200" : "text-gray-400"}`}>
                  {fmt(t.takeHome / 12)}/mo net
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Get your exact take-home</h2>
          <p className="text-blue-300 mb-6">Add 401k, health insurance, filing status and more.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/" className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Open Calculator →
            </Link>
            <Link href={`/${stateSlug}`} className="inline-block border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              {stateName} Salary Guide
            </Link>
          </div>
        </div>
      </section>

      {/* ── Bottom Ad ────────────────────────────────────────────────────────── */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
