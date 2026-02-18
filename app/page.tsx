"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import { calculateTax, fmt, pct, TAX_YEAR, POPULAR_SALARIES } from "@/lib/tax";

// ─── Grouped states for the select dropdown ───────────────────────────────────
const NO_TAX_STATES  = ALL_STATE_CONFIGS.filter((s) => s.noTax);
const FLAT_STATES    = ALL_STATE_CONFIGS.filter((s) => !s.noTax && s.flat !== undefined);
const PROG_STATES    = ALL_STATE_CONFIGS.filter((s) => !s.noTax && s.flat === undefined);

// Salary amounts shown in the showcase grid
const SHOWCASE_AMOUNTS = [50_000, 60_000, 75_000, 80_000, 90_000, 100_000, 110_000, 120_000, 125_000, 150_000, 175_000, 200_000];
const SHOWCASE_BADGES: Record<number, string> = { 75_000: "Popular", 100_000: "Most Searched", 125_000: "Popular" };

// $100K comparison bars — pre-computed at build time
const COMPARE_100K = [
  { label: "Texas",     slug: "texas",      color: "#22c55e" },
  { label: "Florida",   slug: "florida",    color: "#4ade80" },
  { label: "Illinois",  slug: "illinois",   color: "#facc15" },
  { label: "New York",  slug: "new-york",   color: "#fb923c" },
  { label: "California",slug: "california", color: "#f87171" },
].map((s) => {
  const cfg = STATE_BY_SLUG.get(s.slug)!;
  const take = Math.round(calculateTax(cfg, 100_000).takeHome);
  return { ...s, take };
});
const maxTake = Math.max(...COMPARE_100K.map((s) => s.take));

// Top no-tax states to feature in the "states preview" footer section
const FEATURED_NO_TAX = ["texas", "florida", "nevada", "wyoming", "washington"];
const FEATURED_TAXED  = ["new-york", "california", "illinois", "colorado", "virginia"];

export default function HomePage() {
  const router = useRouter();
  const [salary, setSalary] = useState("100000");
  const [stateSlug, setStateSlug] = useState("texas");

  const cfg = useMemo(() => STATE_BY_SLUG.get(stateSlug) ?? STATE_BY_SLUG.get("texas")!, [stateSlug]);

  const cleaned = useMemo(() => String(salary || "").replace(/[^\d]/g, ""), [salary]);

  const previewTax = useMemo(() => {
    const n = Number(cleaned);
    if (!n || n < 1_000 || n > 2_000_000) return null;
    return calculateTax(cfg, n);
  }, [cleaned, cfg]);

  function handleCalculate() {
    if (!cleaned || Number(cleaned) < 1_000) return;
    router.push(`/salary/${cleaned}-salary-after-tax-${stateSlug}`);
  }

  const { name: stateName, noTax, topRateDisplay } = cfg;

  return (
    <>
      {/* ── Authority Banner ──────────────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white text-center py-2 px-4 text-sm font-medium">
        <span className="mr-2">✓</span>
        Updated for {TAX_YEAR} Federal &amp; State Tax Brackets — All 50 States
        <span className="mx-3 opacity-50">·</span>
        Real IRS brackets &amp; official state tax tables
      </div>

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)" }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 60%), " +
              "radial-gradient(circle at 80% 20%, rgba(16,185,129,0.1) 0%, transparent 50%)",
          }}
        />

        <div className="container-page relative py-16 sm:py-22">
          <div className="grid lg:grid-cols-2 gap-12 items-center">

            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-green-500/20 border border-green-400/30 text-green-300 text-xs font-bold px-4 py-1.5 rounded-full mb-6 uppercase tracking-wider">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                All 50 States · {TAX_YEAR} Tax Brackets
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
                What Do You
                <span
                  className="block text-transparent"
                  style={{
                    WebkitTextFillColor: "transparent",
                    backgroundImage: "linear-gradient(90deg, #60a5fa, #34d399)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                  }}
                >
                  Actually Take Home?
                </span>
              </h1>

              <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-lg">
                Your salary isn&apos;t what hits your bank account. Calculate your exact
                take-home pay for any state with accurate {TAX_YEAR} federal &amp;
                state tax brackets — instantly, free, no signup.
              </p>

              <div className="flex flex-wrap gap-4 text-sm text-blue-300">
                {[
                  `✓ Real ${TAX_YEAR} IRS brackets`,
                  "✓ All 50 states",
                  "✓ Instant results",
                  "✓ 100% free",
                ].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            </div>

            {/* Right: Calculator card */}
            <div>
              <div className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 text-gray-900">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 text-center">
                  Salary After Tax Calculator — {TAX_YEAR}
                </p>

                <div className="space-y-4 mb-4">
                  {/* Salary input */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Annual Gross Salary
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                      <input
                        inputMode="numeric"
                        value={salary}
                        onChange={(e) => setSalary(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                        placeholder="100,000"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </label>

                  {/* State select — all 50 states, grouped */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      State
                    </span>
                    <select
                      value={stateSlug}
                      onChange={(e) => setStateSlug(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      <optgroup label="No State Income Tax (9 States)">
                        {NO_TAX_STATES.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.name} — $0 state income tax
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Flat Rate States">
                        {FLAT_STATES.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.name} — {s.topRateDisplay} flat
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="Progressive Tax States">
                        {PROG_STATES.map((s) => (
                          <option key={s.slug} value={s.slug}>
                            {s.name} — up to {s.topRateDisplay}
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </label>
                </div>

                {/* Live Preview */}
                {previewTax ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
                      {stateName} Take-Home — {TAX_YEAR}
                    </p>
                    <p className="text-4xl font-black text-green-700 mb-3 tabular-nums">
                      {fmt(previewTax.takeHome)}
                      <span className="text-lg font-semibold text-green-500 ml-1">/yr</span>
                    </p>
                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      {[
                        { label: "Monthly",   val: previewTax.takeHome / 12 },
                        { label: "Bi-Weekly", val: previewTax.takeHome / 26 },
                        { label: "Hourly",    val: previewTax.takeHome / 2080 },
                      ].map(({ label, val }) => (
                        <div key={label} className="bg-white rounded-xl p-2.5 border border-green-100">
                          <p className="text-xs text-gray-500">{label}</p>
                          <p className="font-bold text-gray-900 text-sm tabular-nums">{fmt(val)}</p>
                        </div>
                      ))}
                    </div>
                    {/* Stacked tax bar */}
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div className="bg-red-400"    style={{ width: `${(previewTax.federalTax / previewTax.gross) * 100}%` }} />
                      {!noTax && (
                        <div className="bg-purple-400" style={{ width: `${(previewTax.stateTax / previewTax.gross) * 100}%` }} />
                      )}
                      <div className="bg-orange-300" style={{ width: `${(previewTax.ficaTotal / previewTax.gross) * 100}%` }} />
                      <div className="bg-green-400 flex-1" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {noTax ? "No state tax · " : `State tax: ${pct(previewTax.stateTax / previewTax.gross)} · `}
                      Effective rate: {(previewTax.effectiveTotalRate * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-5 mb-4 text-center text-gray-400 text-sm">
                    Enter a salary above to see your take-home pay
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={!cleaned || Number(cleaned) < 1_000}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #1d4ed8, #2563eb)" }}
                >
                  See Full Tax Breakdown →
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  {TAX_YEAR} IRS brackets · Single filer · Standard deduction · No signup
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ────────────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Salary Showcase (state-reactive) ─────────────────────────────────── */}
      <section className="container-page">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              {stateName} Salaries — How Much Will You Take Home?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Click any amount for the full {TAX_YEAR} breakdown ·{" "}
              {noTax ? "$0 state income tax" : `${topRateDisplay} top state rate`}
            </p>
          </div>
          <Link
            href={`/${stateSlug}`}
            className="text-blue-700 text-sm font-semibold hover:underline hidden sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SHOWCASE_AMOUNTS.map((amount) => {
            const tax = calculateTax(cfg, amount);
            const badge = SHOWCASE_BADGES[amount];
            return (
              <Link
                key={amount}
                href={`/salary/${amount}-salary-after-tax-${stateSlug}`}
                className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200"
              >
                {badge && (
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${badge === "Most Searched" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {badge}
                  </span>
                )}
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Gross</p>
                <p className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 mb-3">
                  ${amount.toLocaleString()}
                </p>
                <div className="h-px bg-gray-100 mb-3" />
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Take-Home</p>
                <p className="text-2xl font-black text-green-600 tabular-nums">{fmt(tax.takeHome)}</p>
                <p className="text-sm text-gray-500 mt-1 tabular-nums">
                  {fmt(tax.takeHome / 12)}/mo · {(tax.effectiveTotalRate * 100).toFixed(1)}% eff.
                </p>
                <p className="text-xs text-blue-500 font-medium mt-3 group-hover:text-blue-700">
                  Full breakdown →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Ad ────────────────────────────────────────────────────────────────── */}
      <div className="container-page mt-10">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Why No-Tax States / State Tax Info ───────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="grid sm:grid-cols-2 gap-8 items-stretch">
          {/* Left: state tax info */}
          <div className={`border rounded-3xl p-8 ${noTax ? "bg-gradient-to-br from-green-50 to-emerald-50 border-green-200" : "bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200"}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white text-lg font-black mb-5 ${noTax ? "bg-green-500" : "bg-blue-600"}`}>
              {noTax ? "$0" : topRateDisplay}
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              {noTax ? `${stateName} = Zero State Income Tax` : `${stateName} State Income Tax: ${topRateDisplay}`}
            </h2>
            <p className="text-gray-600 mb-5 leading-relaxed">
              {noTax
                ? `${stateName} is one of only 9 states that collects no state income tax. Every dollar you earn is only subject to federal tax and FICA — no state deduction.`
                : `${stateName} has a ${topRateDisplay} top income tax rate. Use our calculator to see the exact impact on your paycheck for any salary level.`}
            </p>
            <Link
              href={`/${stateSlug}`}
              className={`inline-block font-bold px-5 py-2.5 rounded-xl transition-colors text-sm text-white ${noTax ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"}`}
            >
              {stateName} Salary Guide →
            </Link>
          </div>

          {/* Right: $100K state comparison */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="font-extrabold text-gray-900 mb-1 text-lg">
              $100,000 Salary — State Comparison ({TAX_YEAR})
            </h3>
            <p className="text-gray-500 text-xs mb-6">Annual take-home pay after all taxes</p>
            <div className="space-y-4">
              {COMPARE_100K.map(({ label, slug, take, color }) => (
                <Link key={slug} href={`/${slug}`} className="block group">
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">{label}</span>
                    <span className="font-bold text-gray-900 tabular-nums">${take.toLocaleString()}/yr</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${(take / maxTake) * 100}%`, backgroundColor: color }}
                    />
                  </div>
                </Link>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-6">
              * Single filer, standard deduction. {TAX_YEAR} federal + state brackets.
            </p>
            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link href="/states" className="text-blue-700 text-sm font-semibold hover:underline">
                Compare all 50 states →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────────── */}
      <section className="mt-16 py-14" style={{ background: "#f8fafc" }}>
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">Instant, Accurate, Free</h2>
            <p className="text-gray-500">No spreadsheets. No signups. Just your real take-home pay.</p>
          </div>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { step: "1", icon: "💰", title: "Enter Your Salary", desc: "Type any annual salary from $20,000 to $500,000. The live preview updates instantly as you type." },
              { step: "2", icon: "🗺️", title: "Choose Your State", desc: `Pick any of the 50 US states. We apply the correct ${TAX_YEAR} state tax brackets automatically — from $0 for Texas to 13.3% for California.` },
              { step: "3", icon: "📊", title: "See Everything", desc: "Annual, monthly, bi-weekly, weekly, daily, and hourly take-home. Effective rate, marginal rate, visual tax bar, and full breakdown by category." },
            ].map(({ step, icon, title, desc }) => (
              <div key={step} className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow">
                <div className="text-3xl mb-3">{icon}</div>
                <div className="w-7 h-7 rounded-full bg-blue-700 text-white text-sm font-extrabold flex items-center justify-center mx-auto mb-3">
                  {step}
                </div>
                <h3 className="font-extrabold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse Salary Grid (state-reactive) ──────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Browse Every {stateName} Salary
          </h2>
          <Link href={`/${stateSlug}`} className="text-blue-700 text-sm font-semibold hover:underline hidden sm:block">
            Full {stateName} hub →
          </Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          Popular amounts — click any for the complete {TAX_YEAR} tax breakdown in {stateName}.
        </p>
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {POPULAR_SALARIES.map((amount) => (
            <Link
              key={amount}
              href={`/salary/${amount}-salary-after-tax-${stateSlug}`}
              className="text-center text-sm bg-white border border-gray-200 rounded-xl py-2.5 font-semibold hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 transition-all"
            >
              ${(amount / 1_000).toFixed(0)}K
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-400 mt-4 text-center">
          Need an exact number?{" "}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="text-blue-700 underline hover:no-underline"
          >
            Use the calculator ↑
          </button>
        </p>
      </section>

      {/* ── States Directory Preview ──────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
          Salary After Tax Calculators — All 50 States
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Every state calculator uses real {TAX_YEAR} federal + state tax brackets.
        </p>
        <div className="grid sm:grid-cols-2 gap-6 mb-6">
          {/* No-tax states */}
          <div className="bg-green-50 border border-green-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">
              No State Income Tax (9 States)
            </h3>
            <div className="flex flex-wrap gap-2">
              {FEATURED_NO_TAX.map((slug) => {
                const s = STATE_BY_SLUG.get(slug)!;
                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
                    className="inline-flex items-center gap-1 bg-white border border-green-300 text-green-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors"
                  >
                    {s.name} — $0
                  </Link>
                );
              })}
              <Link href="/states" className="inline-flex items-center gap-1 bg-green-600 text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors">
                + 4 more →
              </Link>
            </div>
          </div>
          {/* Taxed states */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">
              High-Income-Tax States
            </h3>
            <div className="flex flex-wrap gap-2">
              {FEATURED_TAXED.map((slug) => {
                const s = STATE_BY_SLUG.get(slug)!;
                const href = s.externalSite ? s.externalSite : `/${slug}`;
                return (
                  <Link
                    key={slug}
                    href={href}
                    {...(s.externalSite ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className="inline-flex items-center gap-1 bg-white border border-blue-200 text-blue-800 text-xs font-semibold px-3 py-1.5 rounded-full hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-colors"
                  >
                    {s.name} — {s.topRateDisplay}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
        <div className="text-center">
          <Link
            href="/states"
            className="inline-block bg-blue-700 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-800 transition-colors"
          >
            View All 50 States →
          </Link>
        </div>
      </section>

      {/* ── Bottom Ad ─────────────────────────────────────────────────────────── */}
      <div className="container-page mt-10 mb-4">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
