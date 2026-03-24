export const dynamic = "force-static";
export const dynamicParams = false;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS } from "@/lib/states";
import SalaryCalculator from "@/app/salary/[slug]/SalaryCalculator";

// ─── Hourly Rates ─────────────────────────────────────────────────────────────
// $10–$30 every dollar (minimum wage / entry level — very high search volume)
// $32–$100 at key round numbers
const HOURLY_RATES = [
  10, 11, 12, 13, 14, 15, 16, 17, 18, 19,
  20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30,
  32, 35, 38, 40, 42, 45, 48, 50, 55, 60, 65, 70, 75, 80, 85, 90, 100,
];

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

// ─── Slug Parser ──────────────────────────────────────────────────────────────
// Format: "{rate}-an-hour-after-tax-{state}"
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-an-hour-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const rate = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(rate) || rate < 1 || rate > 9999) return null;
  const stateConfig = STATE_BY_SLUG.get(stateSlug);
  if (!stateConfig) return null;
  return { rate, stateSlug, stateConfig };
}

// ─── Static Generation ────────────────────────────────────────────────────────
export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const rate of HOURLY_RATES) {
    for (const [stateSlug] of STATE_BY_SLUG) {
      params.push({ slug: `${rate}-an-hour-after-tax-${stateSlug}` });
    }
  }
  return params;
}

// ─── Metadata ─────────────────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { rate, stateConfig } = parsed;
  const { name: stateName, noTax } = stateConfig;
  const annualGross = rate * 2080;
  const tax = calculateTax(stateConfig, annualGross);
  const annualFmt = Math.round(tax.takeHome).toLocaleString("en-US");
  const moFmt = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);

  const title = `$${rate}/hr After Taxes in ${stateName} — $${annualFmt}/yr`;
  const desc = noTax
    ? `Earning $${rate}/hr in ${stateName}? Take-home = $${annualFmt}/year ($${moFmt}/mo) in ${TAX_YEAR}. No state tax — effective rate ${effRate}%. Free, instant, no signup.`
    : `Earning $${rate}/hr in ${stateName}? Take-home = $${annualFmt}/year ($${moFmt}/mo) in ${TAX_YEAR}. Effective rate ${effRate}%. Federal + state breakdown — free & instant.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.takehomeusa.com/hourly/${slug}` },
    openGraph: {
      title: `$${rate} an Hour After Taxes in ${stateName} = $${annualFmt}/yr | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/hourly/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title,
      description: desc,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function HourlyPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { rate, stateSlug, stateConfig } = parsed;
  const { name: stateName, noTax, heroGradient } = stateConfig;

  const annualGross = rate * 2080; // 40 hrs/wk × 52 wks
  const tax = calculateTax(stateConfig, annualGross);
  const monthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const hourlyAfterTax = tax.takeHome / 2080;

  // ── FAQ Items ───────────────────────────────────────────────────────────────
  const faqItems = [
    {
      q: `How much is $${rate} an hour annually after taxes in ${stateName}?`,
      a: `At $${rate} per hour (40 hours/week, 52 weeks/year = $${annualGross.toLocaleString()} gross), your take-home pay in ${stateName} is ${fmt(tax.takeHome)} per year — or ${fmt(monthly)} per month after federal${noTax ? "" : " and state"} taxes.`,
    },
    {
      q: `What is $${rate} an hour as a yearly salary?`,
      a: `$${rate} per hour × 2,080 hours (40 hrs/week × 52 weeks) = $${annualGross.toLocaleString()} gross annual salary. After taxes in ${stateName}, your take-home is ${fmt(tax.takeHome)}/year (${pct(tax.effectiveTotalRate)} effective tax rate).`,
    },
    {
      q: `What is $${rate} an hour after taxes per month in ${stateName}?`,
      a: `$${rate}/hr in ${stateName} works out to ${fmt(monthly)} per month after taxes — based on $${annualGross.toLocaleString()} annual gross (2,080 hours/year, standard deduction, single filer).`,
    },
    {
      q: `What is $${rate} per hour biweekly after taxes in ${stateName}?`,
      a: `$${rate}/hr in ${stateName} = ${fmt(biweekly)} per biweekly paycheck after taxes (26 pay periods/year). Your biweekly gross is ${fmt(annualGross / 26)}.`,
    },
    {
      q: `What is the effective tax rate on $${rate} per hour in ${stateName}?`,
      a: `The effective total tax rate on $${rate}/hr ($${annualGross.toLocaleString()}/year) in ${stateName} is ${pct(tax.effectiveTotalRate)}. This includes federal income tax (${pct(tax.effectiveFederalRate)} effective) and FICA (${pct(tax.ficaTotal / annualGross)} effective)${noTax ? `. ${stateName} has no state income tax.` : `, plus ${stateName} state tax (${pct(tax.stateTax / annualGross)} effective).`}`,
    },
    {
      q: `Is $${rate} an hour a good wage in ${stateName}?`,
      a: `$${rate}/hr is $${annualGross.toLocaleString()}/year gross and ${fmt(tax.takeHome)}/year take-home in ${stateName}. ${
        annualGross >= 75_000
          ? `This is above the US median household income (~$75,000), making it a solid wage in most areas.`
          : annualGross >= 50_000
          ? `This is near the US median individual income — a livable wage in lower cost-of-living areas.`
          : `This is below the US median individual income. Cost of living varies widely by city and region.`
      }`,
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
      { "@type": "ListItem", position: 3, name: `$${rate}/hr After Tax in ${stateName}`, item: `https://www.takehomeusa.com/hourly/${slug}` },
    ],
  };

  const allStateResults = ALL_STATE_CONFIGS.map((s) => ({
    state: s,
    takeHome: calculateTax(s, annualGross).takeHome,
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
            <span className="text-white">${rate}/hr After Tax</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-3 mb-5">
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/90 text-sm font-semibold px-4 py-1.5 rounded-full">
                ${rate}/hr × 2,080 hrs = ${annualGross.toLocaleString()}/year gross
              </div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 text-xs font-semibold px-3 py-1.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-white/60 animate-pulse" />
                {TAX_YEAR} IRS Brackets
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              ${rate} an Hour After Taxes<br />
              <span className="text-white/60">in {stateName}</span>
            </h1>
            <p className="text-white/70 text-lg mb-8 max-w-2xl">
              {noTax
                ? `${stateName} has no state income tax. Your only deductions are federal income tax and FICA.`
                : `${stateName} state tax is deducted on top of federal income tax and FICA.`}
            </p>

            {/* Key stat cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl">
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-black text-green-400">{fmt(tax.takeHome)}</p>
                <p className="text-xs text-white/60 mt-1">Per Year</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-black text-white">{fmt(monthly)}</p>
                <p className="text-xs text-white/60 mt-1">Per Month</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-black text-white">{fmt(biweekly)}</p>
                <p className="text-xs text-white/60 mt-1">Biweekly</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 sm:p-4 text-center backdrop-blur-sm">
                <p className="text-lg sm:text-2xl font-black text-white/70">{pct(tax.effectiveTotalRate)}</p>
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

      {/* ── Quick Summary Table ───────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ${rate}/hr After Taxes in {stateName} — {TAX_YEAR} Summary
        </h2>
        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm max-w-xl">
          <table className="tax-table">
            <thead>
              <tr>
                <th>Period</th>
                <th>Gross</th>
                <th>Take-Home</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="font-medium text-gray-700">Hourly</td>
                <td className="tabular-nums">${rate}.00</td>
                <td className="font-bold text-green-700 tabular-nums">{fmt(hourlyAfterTax)}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">Daily (8 hrs)</td>
                <td className="tabular-nums">{fmt(rate * 8)}</td>
                <td className="font-bold text-blue-700 tabular-nums">{fmt(hourlyAfterTax * 8)}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">Weekly (40 hrs)</td>
                <td className="tabular-nums">{fmt(rate * 40)}</td>
                <td className="font-bold text-blue-700 tabular-nums">{fmt(tax.takeHome / 52)}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">Biweekly (80 hrs)</td>
                <td className="tabular-nums">{fmt(rate * 80)}</td>
                <td className="font-bold text-blue-700 tabular-nums">{fmt(biweekly)}</td>
              </tr>
              <tr>
                <td className="font-medium text-gray-700">Monthly</td>
                <td className="tabular-nums">{fmt(annualGross / 12)}</td>
                <td className="font-bold text-blue-700 tabular-nums">{fmt(monthly)}</td>
              </tr>
              <tr className="row-total">
                <td>Annual (2,080 hrs)</td>
                <td className="tabular-nums">{fmt(annualGross)}</td>
                <td className="tabular-nums">{fmt(tax.takeHome)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Based on 40 hrs/week, 52 weeks/year. {TAX_YEAR} IRS brackets, single filer, standard deduction.
        </p>
      </section>

      {/* ── Interactive Calculator ─────────────────────────────────────────────── */}
      <SalaryCalculator initialAmount={annualGross} stateConfig={stateConfig} />

      {/* ── Mid Ad ───────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          ${rate} an Hour After Taxes in {stateName} — FAQ
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

      {/* ── Same Rate, All States ─────────────────────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            ${rate} an Hour After Taxes — All 50 States
          </h2>
          <p className="text-gray-500 text-sm mb-6">
            How much does ${rate}/hr take home in every state? Sorted highest to lowest.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {allStateResults.map(({ state: s, takeHome }) => (
              <Link
                key={s.slug}
                href={`/hourly/${rate}-an-hour-after-tax-${s.slug}`}
                className={`bg-white border rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-left ${
                  s.slug === stateSlug ? "border-blue-500 ring-2 ring-blue-200 bg-blue-50" : "border-gray-200"
                }`}
              >
                <p className="font-bold text-gray-900 text-sm">{s.name}</p>
                {s.noTax && <p className="text-xs text-green-600 font-semibold">No state tax</p>}
                <p className="font-bold text-blue-600 text-sm mt-1">{fmt(takeHome)}/yr</p>
                <p className="text-gray-400 text-xs">{fmt(takeHome / 12)}/mo</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Other Hourly Rates for This State ────────────────────────────────── */}
      <section className="container-page my-12">
        <h2 className="text-xl font-bold text-gray-900 mb-2">
          Other Hourly Rates in {stateName}
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          See take-home pay for different hourly wages in {stateName}.
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 gap-2">
          {HOURLY_RATES.map((r) => {
            const t = calculateTax(stateConfig, r * 2080);
            const isCurrent = r === rate;
            return (
              <Link
                key={r}
                href={`/hourly/${r}-an-hour-after-tax-${stateSlug}`}
                className={`text-center border rounded-lg py-3 px-2 text-xs sm:text-sm transition-all font-medium ${
                  isCurrent
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white border-gray-200 hover:border-blue-400 hover:text-blue-700 hover:bg-blue-50"
                }`}
              >
                <p className="font-bold">${r}/hr</p>
                <p className={`text-xs mt-0.5 ${isCurrent ? "text-blue-200" : "text-gray-400"}`}>
                  {fmt(t.takeHome / 12)}/mo
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Want to customize your calculation?</h2>
          <p className="text-blue-300 mb-6">
            Adjust your 401k, health insurance, filing status, and more with the free calculator.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link
              href="/"
              className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg"
            >
              Open Calculator →
            </Link>
            <Link
              href={`/${stateSlug}`}
              className="inline-block border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
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
