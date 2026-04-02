export const dynamic = "force-static";
export const dynamicParams = true;
export const revalidate = 86400;

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS } from "@/lib/states";

// ─── Top states by search volume for comparison queries ──────────────────────
// Top 10 pre-built (90 pairs); dynamicParams=true handles all other valid pairs
const COMPARE_STATE_SLUGS = [
  "texas", "california", "florida", "new-york", "washington",
  "nevada", "illinois", "georgia", "north-carolina", "ohio",
];

// Salary amounts to show in side-by-side table
const COMPARE_AMOUNTS = [
  40_000, 50_000, 60_000, 75_000, 100_000, 125_000, 150_000, 200_000,
];

type Params = Promise<{ slug?: string }>;

// Format: "{state1}-vs-{state2}"
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^([a-z-]+)-vs-([a-z-]+)$/);
  if (!m) return null;
  const s1 = STATE_BY_SLUG.get(m[1]);
  const s2 = STATE_BY_SLUG.get(m[2]);
  if (!s1 || !s2 || m[1] === m[2]) return null;
  return { slug1: m[1], slug2: m[2], state1: s1, state2: s2 };
}

export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const s1 of COMPARE_STATE_SLUGS) {
    for (const s2 of COMPARE_STATE_SLUGS) {
      if (s1 !== s2) {
        params.push({ slug: `${s1}-vs-${s2}` });
      }
    }
  }
  return params;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { state1, state2 } = parsed;
  const tax100k1 = calculateTax(state1, 100_000);
  const tax100k2 = calculateTax(state2, 100_000);
  const diff = Math.abs(tax100k1.takeHome - tax100k2.takeHome);
  const winner = tax100k1.takeHome > tax100k2.takeHome ? state1 : state2;
  const loser = tax100k1.takeHome > tax100k2.takeHome ? state2 : state1;

  const title = `${state1.name} vs ${state2.name} Income Tax (${TAX_YEAR})`;
  const desc = `Compare ${state1.name} vs ${state2.name} take-home pay (${TAX_YEAR}). ${winner.name} keeps ${fmt(diff)} more on $100K. $40K–$200K salary table — free, instant.`;

  return {
    title,
    description: desc,
    alternates: { canonical: `https://www.takehomeusa.com/compare/${slug}` },
    openGraph: {
      title: `${state1.name} vs ${state2.name} Income Tax ${TAX_YEAR} | TakeHomeUSA`,
      description: desc,
      url: `https://www.takehomeusa.com/compare/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: { card: "summary", title, description: desc },
  };
}

export default async function CompareSlugPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { slug1, slug2, state1, state2 } = parsed;

  // Pre-compute take-home for all comparison amounts
  const rows = COMPARE_AMOUNTS.map((gross) => {
    const t1 = calculateTax(state1, gross);
    const t2 = calculateTax(state2, gross);
    const diff = t1.takeHome - t2.takeHome;
    return { gross, t1, t2, diff };
  });

  // 100K reference for callout
  const ref = rows.find((r) => r.gross === 100_000)!;
  const winner = ref.diff >= 0 ? state1 : state2;
  const loser = ref.diff >= 0 ? state2 : state1;
  const absDiff100k = Math.abs(ref.diff);

  // For the top-rate comparison card
  const rate1 = state1.noTax ? "0%" : state1.topRateDisplay;
  const rate2 = state2.noTax ? "0%" : state2.topRateDisplay;

  const faqItems = [
    {
      q: `Which state has lower taxes, ${state1.name} or ${state2.name}?`,
      a: `${winner.name} has lower income taxes than ${loser.name}. On a $100,000 salary (${TAX_YEAR}), ${winner.name} residents take home ${fmt(absDiff100k)} more per year. ${winner.name} top state rate: ${winner.noTax ? "0% (no state income tax)" : winner.topRateDisplay}; ${loser.name}: ${loser.noTax ? "0% (no state income tax)" : loser.topRateDisplay}. At $200K the gap grows to ${fmt(Math.abs(rows.find(r => r.gross === 200_000)!.diff))}/year.`,
    },
    {
      q: `What is the income tax rate in ${state1.name} vs ${state2.name}?`,
      a: `${state1.name} top state income tax rate: ${rate1}${state1.noTax ? " (no state income tax)" : ""}. ${state2.name} top rate: ${rate2}${state2.noTax ? " (no state income tax)" : ""}. Both states also have the same federal income tax rates and FICA (Social Security + Medicare) taxes.`,
    },
    {
      q: `Is it worth moving from ${loser.name} to ${winner.name} for taxes?`,
      a: `Moving from ${loser.name} to ${winner.name} could save you ${fmt(absDiff100k)}/year on a $100K salary — that's ${fmt(absDiff100k / 12)}/month. Over 10 years, that's potentially ${fmt(absDiff100k * 10)} in tax savings, not accounting for raises or investment growth. However, cost of living differences (housing, property taxes, sales tax) should also factor in.`,
    },
    {
      q: `Does ${state1.name} or ${state2.name} have higher sales tax?`,
      a: `Income tax is only part of the picture. Be sure to also compare sales tax, property taxes, and cost of living. This tool focuses on state income tax differences. For a complete picture, research each state's total tax burden.`,
    },
    {
      q: `Which state is better for high earners, ${state1.name} or ${state2.name}?`,
      a: `At $200,000 gross salary, ${winner.name} take-home is ${fmt(rows.find(r => r.gross === 200_000)!.diff >= 0 ? rows.find(r => r.gross === 200_000)!.t1.takeHome : rows.find(r => r.gross === 200_000)!.t2.takeHome)} vs ${fmt(rows.find(r => r.gross === 200_000)!.diff >= 0 ? rows.find(r => r.gross === 200_000)!.t2.takeHome : rows.find(r => r.gross === 200_000)!.t1.takeHome)} in ${loser.name} — a difference of ${fmt(Math.abs(rows.find(r => r.gross === 200_000)!.diff))} per year. The gap widens significantly at higher incomes${state1.noTax || state2.noTax ? " because no-tax states save a larger absolute dollar amount as income rises" : " due to progressive tax brackets"}.`,
    },
    {
      q: `How are taxes calculated for ${state1.name} vs ${state2.name}?`,
      a: `All figures are for a single filer using the standard deduction with no other adjustments (no 401k, no pre-tax benefits). Federal income tax, Social Security (6.2% up to $176,100), and Medicare (1.45%) are the same in both states. The difference is entirely due to state income tax: ${state1.noTax ? `${state1.name} charges $0` : `${state1.name} charges up to ${rate1}`} vs ${state2.noTax ? `${state2.name} charges $0` : `${state2.name} charges up to ${rate2}`}.`,
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
      { "@type": "ListItem", position: 2, name: "State Comparison", item: "https://www.takehomeusa.com/compare" },
      { "@type": "ListItem", position: 3, name: `${state1.name} vs ${state2.name}`, item: `https://www.takehomeusa.com/compare/${slug}` },
    ],
  };

  // Other compare pairs for internal links (reverse + related pairs)
  const relatedPairs = COMPARE_STATE_SLUGS
    .filter((s) => s !== slug1 && s !== slug2)
    .slice(0, 8)
    .map((s) => ({
      slug: `${slug1}-vs-${s}`,
      name: STATE_BY_SLUG.get(s)!.name,
    }));

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white">
        <div className="container-page py-14 sm:py-18">
          <nav className="text-white/60 text-sm mb-6 flex items-center gap-2 flex-wrap">
            <Link href="/" className="hover:text-white transition-colors">Home</Link>
            <span>/</span>
            <Link href="/compare" className="hover:text-white transition-colors">Compare</Link>
            <span>/</span>
            <span className="text-white">{state1.name} vs {state2.name}</span>
          </nav>

          <div className="max-w-3xl">
            <div className="flex flex-wrap gap-2 mb-5">
              {(state1.noTax || state2.noTax) && (
                <span className="inline-flex items-center gap-1.5 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-semibold px-3 py-1 rounded-full">
                  ★ No-Tax State Advantage
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 text-white/90 text-xs font-semibold px-3 py-1 rounded-full">
                {TAX_YEAR} Tax Rates · Single Filer
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              {state1.name} vs {state2.name}<br />
              <span className="text-white/60">Income Tax Comparison</span>
            </h1>
            <p className="text-white/70 text-lg mb-8">
              On a $100K salary, {winner.name} keeps you <span className="text-green-400 font-bold">{fmt(absDiff100k)} more</span> than {loser.name}.
            </p>

            {/* Hero stat cards */}
            <div className="grid grid-cols-2 gap-4 max-w-2xl">
              <div className={`rounded-2xl p-5 border ${ref.diff >= 0 ? "bg-green-500/10 border-green-400/30" : "bg-white/5 border-white/10"}`}>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{state1.name}</p>
                <p className="text-3xl font-black text-white">{fmt(ref.t1.takeHome)}</p>
                <p className="text-sm text-white/60 mt-1">take-home on $100K</p>
                <p className="text-xs mt-2 font-semibold">
                  {state1.noTax
                    ? <span className="text-green-400">No state income tax</span>
                    : <span className="text-white/50">Top rate: {rate1}</span>}
                </p>
              </div>
              <div className={`rounded-2xl p-5 border ${ref.diff < 0 ? "bg-green-500/10 border-green-400/30" : "bg-white/5 border-white/10"}`}>
                <p className="text-xs text-white/50 uppercase tracking-wider mb-1">{state2.name}</p>
                <p className="text-3xl font-black text-white">{fmt(ref.t2.takeHome)}</p>
                <p className="text-sm text-white/60 mt-1">take-home on $100K</p>
                <p className="text-xs mt-2 font-semibold">
                  {state2.noTax
                    ? <span className="text-green-400">No state income tax</span>
                    : <span className="text-white/50">Top rate: {rate2}</span>}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ───────────────────────────────────────────────────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Key Differences Callout ───────────────────────────────────────────── */}
      <section className="container-page my-10">
        <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
            <p className="text-xs text-blue-500 uppercase tracking-wider mb-1">State Tax Rate</p>
            <p className="text-2xl font-black text-blue-800">{rate1}</p>
            <p className="text-sm text-blue-600 mt-1">{state1.name}</p>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5 text-center">
            <p className="text-xs text-green-600 uppercase tracking-wider mb-1">Annual Savings on $100K</p>
            <p className="text-2xl font-black text-green-700">{fmt(absDiff100k)}</p>
            <p className="text-sm text-green-600 mt-1">{winner.name} advantage</p>
          </div>
          <div className="bg-orange-50 border border-orange-200 rounded-2xl p-5 text-center">
            <p className="text-xs text-orange-500 uppercase tracking-wider mb-1">State Tax Rate</p>
            <p className="text-2xl font-black text-orange-800">{rate2}</p>
            <p className="text-sm text-orange-600 mt-1">{state2.name}</p>
          </div>
        </div>
      </section>

      {/* ── Side-by-Side Comparison Table ─────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {state1.name} vs {state2.name} — Take-Home Pay by Salary ({TAX_YEAR})
        </h2>
        <p className="text-gray-500 text-sm mb-6">Single filer, standard deduction, no other adjustments.</p>

        <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left py-3 px-4 text-gray-600 font-semibold">Gross Salary</th>
                <th className="text-right py-3 px-4 text-blue-700 font-semibold">{state1.name} Take-Home</th>
                <th className="text-right py-3 px-4 text-indigo-700 font-semibold">{state2.name} Take-Home</th>
                <th className="text-right py-3 px-4 text-green-700 font-semibold">{winner.name} Saves</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(({ gross, t1, t2, diff }) => {
                const winnerIsS1 = diff >= 0;
                const absDiffRow = Math.abs(diff);
                return (
                  <tr key={gross} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-gray-800 tabular-nums">
                      ${(gross / 1000).toFixed(0)}K
                    </td>
                    <td className={`py-3 px-4 text-right tabular-nums font-semibold ${winnerIsS1 ? "text-green-700" : "text-gray-700"}`}>
                      {fmt(t1.takeHome)}
                      <span className="text-xs text-gray-400 font-normal ml-1">({pct(t1.effectiveTotalRate)})</span>
                    </td>
                    <td className={`py-3 px-4 text-right tabular-nums font-semibold ${!winnerIsS1 ? "text-green-700" : "text-gray-700"}`}>
                      {fmt(t2.takeHome)}
                      <span className="text-xs text-gray-400 font-normal ml-1">({pct(t2.effectiveTotalRate)})</span>
                    </td>
                    <td className="py-3 px-4 text-right tabular-nums text-green-700 font-bold">
                      +{fmt(absDiffRow)}/yr
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          {TAX_YEAR} IRS brackets · FICA included · State tax estimated · Numbers rounded
        </p>
      </section>

      {/* ── Reverse Compare Link ─────────────────────────────────────────────── */}
      <div className="container-page mb-8">
        <Link
          href={`/compare/${slug2}-vs-${slug1}`}
          className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium border border-blue-200 rounded-xl px-4 py-2 hover:bg-blue-50 transition-colors"
        >
          ↔ View {state2.name} vs {state1.name} instead
        </Link>
      </div>

      {/* ── Mid Ad ───────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Detailed Tax Breakdown ────────────────────────────────────────────── */}
      <section className="container-page my-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Detailed Tax Breakdown on $100,000 Salary
        </h2>
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr><th colSpan={2}>{state1.name} — $100K Salary</th></tr>
              </thead>
              <tbody>
                <tr><td>Federal Income Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(ref.t1.federalTax)}</td></tr>
                {!state1.noTax && <tr><td>{state1.name} State Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(ref.t1.stateTax)}</td></tr>}
                <tr><td>Social Security (6.2%)</td><td className="text-orange-600 tabular-nums">−{fmt(ref.t1.socialSecurity)}</td></tr>
                <tr><td>Medicare (1.45%)</td><td className="text-orange-600 tabular-nums">−{fmt(ref.t1.medicare)}</td></tr>
                <tr className="bg-red-50"><td className="font-bold">Total Tax</td><td className="font-bold text-red-700 tabular-nums">−{fmt(ref.t1.totalTax)}</td></tr>
                <tr className="row-total"><td>Annual Take-Home</td><td className="tabular-nums">{fmt(ref.t1.takeHome)}</td></tr>
              </tbody>
            </table>
          </div>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr><th colSpan={2}>{state2.name} — $100K Salary</th></tr>
              </thead>
              <tbody>
                <tr><td>Federal Income Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(ref.t2.federalTax)}</td></tr>
                {!state2.noTax && <tr><td>{state2.name} State Tax</td><td className="text-red-600 font-semibold tabular-nums">−{fmt(ref.t2.stateTax)}</td></tr>}
                <tr><td>Social Security (6.2%)</td><td className="text-orange-600 tabular-nums">−{fmt(ref.t2.socialSecurity)}</td></tr>
                <tr><td>Medicare (1.45%)</td><td className="text-orange-600 tabular-nums">−{fmt(ref.t2.medicare)}</td></tr>
                <tr className="bg-red-50"><td className="font-bold">Total Tax</td><td className="font-bold text-red-700 tabular-nums">−{fmt(ref.t2.totalTax)}</td></tr>
                <tr className="row-total"><td>Annual Take-Home</td><td className="tabular-nums">{fmt(ref.t2.takeHome)}</td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-8">
          {state1.name} vs {state2.name} Income Tax — FAQ
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

      {/* ── Internal Links: Related Comparisons ──────────────────────────────── */}
      <section className="bg-gray-50 border-t border-gray-200 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Compare {state1.name} to Other States
          </h2>
          <p className="text-gray-500 text-sm mb-6">See how {state1.name} stacks up against other states.</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {relatedPairs.map(({ slug: pairSlug, name }) => (
              <Link
                key={pairSlug}
                href={`/compare/${pairSlug}`}
                className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
              >
                <p className="font-bold text-gray-900 text-sm">{state1.name}</p>
                <p className="text-xs text-gray-400">vs</p>
                <p className="font-bold text-blue-600 text-sm">{name}</p>
              </Link>
            ))}
          </div>

          {/* Also compare state2 to others */}
          <h2 className="text-xl font-bold text-gray-900 mt-10 mb-2">
            Compare {state2.name} to Other States
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {COMPARE_STATE_SLUGS
              .filter((s) => s !== slug1 && s !== slug2)
              .slice(0, 8)
              .map((s) => {
                const st = STATE_BY_SLUG.get(s)!;
                return (
                  <Link
                    key={s}
                    href={`/compare/${slug2}-vs-${s}`}
                    className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all"
                  >
                    <p className="font-bold text-gray-900 text-sm">{state2.name}</p>
                    <p className="text-xs text-gray-400">vs</p>
                    <p className="font-bold text-blue-600 text-sm">{st.name}</p>
                  </Link>
                );
              })}
          </div>
        </div>
      </section>

      {/* ── State Hub Links ───────────────────────────────────────────────────── */}
      <section className="container-page my-12">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Explore Each State</h2>
        <div className="grid sm:grid-cols-2 gap-4 max-w-lg">
          <Link
            href={`/${slug1}`}
            className="bg-blue-50 border border-blue-200 rounded-2xl p-6 hover:border-blue-500 hover:shadow-md transition-all"
          >
            <p className="text-sm text-blue-500 mb-1">Full tax guide for</p>
            <p className="text-xl font-black text-blue-900">{state1.name} →</p>
            <p className="text-sm text-blue-600 mt-1">{state1.description}</p>
          </Link>
          <Link
            href={`/${slug2}`}
            className="bg-indigo-50 border border-indigo-200 rounded-2xl p-6 hover:border-indigo-500 hover:shadow-md transition-all"
          >
            <p className="text-sm text-indigo-500 mb-1">Full tax guide for</p>
            <p className="text-xl font-black text-indigo-900">{state2.name} →</p>
            <p className="text-sm text-indigo-600 mt-1">{state2.description}</p>
          </Link>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────────── */}
      <section className="container-page my-12 text-center">
        <div className="bg-blue-900 text-white rounded-2xl p-8 sm:p-12">
          <h2 className="text-2xl font-bold mb-3">Calculate your exact take-home</h2>
          <p className="text-blue-300 mb-6">Add 401k, health insurance, filing status, and more for a precise number.</p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link href="/" className="inline-block bg-white text-blue-900 font-bold px-8 py-3 rounded-xl hover:bg-blue-50 transition-colors text-lg">
              Open Calculator →
            </Link>
            <Link href="/compare" className="inline-block border border-white/30 text-white px-8 py-3 rounded-xl hover:bg-white/10 transition-colors">
              Compare All States
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
