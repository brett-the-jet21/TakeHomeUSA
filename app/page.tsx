"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POPULAR_SALARIES, calculateTexasTax, fmt, TAX_YEAR } from "@/lib/tax";

const STATES = [{ slug: "texas", name: "Texas" }];

// Salary ranges shown as clickable cards on the homepage
const SALARY_SHOWCASE = [
  { amount: 50_000,  badge: null },
  { amount: 60_000,  badge: null },
  { amount: 75_000,  badge: "Popular" },
  { amount: 80_000,  badge: null },
  { amount: 90_000,  badge: null },
  { amount: 100_000, badge: "Most Searched" },
  { amount: 110_000, badge: null },
  { amount: 120_000, badge: null },
  { amount: 125_000, badge: "Popular" },
  { amount: 150_000, badge: null },
  { amount: 175_000, badge: null },
  { amount: 200_000, badge: null },
];

// $100K take-home comparison — 2026 figures (TX = $79,180; state estimates approximate)
const COMPARISON_DATA = [
  { state: "Texas",      take: 79_180, color: "#22c55e", pct: 100 },
  { state: "Florida",    take: 79_180, color: "#4ade80", pct: 100 },
  { state: "Illinois",   take: 74_230, color: "#facc15", pct: 94 },
  { state: "New York",   take: 73_400, color: "#fb923c", pct: 93 },
  { state: "California", take: 71_580, color: "#f87171", pct: 90 },
];

export default function HomePage() {
  const router = useRouter();
  const [salary, setSalary] = useState("100000");
  const [state, setState] = useState("texas");

  const cleaned = useMemo(
    () => String(salary || "").replace(/[^\d]/g, ""),
    [salary]
  );

  const previewTax = useMemo(() => {
    const n = Number(cleaned);
    if (!n || n < 1000 || n > 2_000_000) return null;
    return calculateTexasTax(n);
  }, [cleaned]);

  function handleCalculate() {
    if (!cleaned || Number(cleaned) < 1000) return;
    router.push(`/salary/${cleaned}-salary-after-tax-${state}`);
  }

  return (
    <>
      {/* ── Phase 1: Authority Banner ─────────────────────────────────────────── */}
      <div className="bg-blue-700 text-white text-center py-2 px-4 text-sm font-medium">
        <span className="mr-2">✓</span>
        Updated for {TAX_YEAR} Federal &amp; State Tax Brackets
        <span className="mx-3 opacity-50">·</span>
        Calculations based on current IRS brackets and official state tax tables
      </div>

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden text-white"
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
        }}
      >
        {/* Decorative blobs */}
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
                Texas: $0 state income tax
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-5">
                What Do You
                <span className="block text-transparent" style={{
                  WebkitTextFillColor: "transparent",
                  backgroundImage: "linear-gradient(90deg, #60a5fa, #34d399)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                }}>
                  Actually Take Home?
                </span>
              </h1>

              <p className="text-blue-200 text-lg leading-relaxed mb-8 max-w-lg">
                Your salary isn&apos;t what hits your bank account. Find out your
                real take-home pay in Texas — with accurate {TAX_YEAR} federal tax
                brackets, FICA, and zero state tax.
              </p>

              {/* Quick trust signals */}
              <div className="flex flex-wrap gap-4 text-sm text-blue-300">
                {[
                  `✓ Real ${TAX_YEAR} IRS brackets`,
                  "✓ Instant results",
                  "✓ No signup",
                  "✓ 100% free",
                ].map((t) => (
                  <span key={t} className="flex items-center">{t}</span>
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
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Annual Gross Salary
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">
                        $
                      </span>
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

                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      State
                    </span>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      {STATES.map((s) => (
                        <option key={s.slug} value={s.slug}>
                          {s.name} — No state income tax!
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                {/* Live Preview */}
                {previewTax ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
                      Your Estimated Take-Home
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
                    {/* Mini visual bar */}
                    <div className="flex h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-red-400"
                        style={{ width: `${(previewTax.federalTax / previewTax.gross) * 100}%` }}
                      />
                      <div
                        className="bg-orange-300"
                        style={{ width: `${(previewTax.ficaTotal / previewTax.gross) * 100}%` }}
                      />
                      <div className="bg-green-400 flex-1" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      Fed tax + FICA vs. take-home — effective rate: {(previewTax.effectiveTotalRate * 100).toFixed(1)}%
                    </p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-5 mb-4 text-center text-gray-400 text-sm">
                    Enter a salary above to see your take-home pay
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={!cleaned || Number(cleaned) < 1000}
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

      {/* ── Ad: Leaderboard ──────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Popular Salary Cards ─────────────────────────────────────────────── */}
      <section className="container-page">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900">
              Texas Salaries — How Much Will You Take Home?
            </h2>
            <p className="text-gray-500 text-sm mt-1">
              Click any amount for the full {TAX_YEAR} breakdown
            </p>
          </div>
          <Link
            href="/texas"
            className="text-blue-700 text-sm font-semibold hover:underline hidden sm:block"
          >
            View all →
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SALARY_SHOWCASE.map(({ amount, badge }) => {
            const tax = calculateTexasTax(amount);
            const pctTax = (tax.effectiveTotalRate * 100).toFixed(1);
            return (
              <Link
                key={amount}
                href={`/salary/${amount}-salary-after-tax-texas`}
                className="group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200"
              >
                {badge && (
                  <span
                    className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${
                      badge === "Most Searched"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {badge}
                  </span>
                )}
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Gross
                </p>
                <p className="text-xl font-extrabold text-gray-900 group-hover:text-blue-700 mb-3">
                  ${amount.toLocaleString()}
                </p>
                <div className="h-px bg-gray-100 mb-3" />
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">
                  Take-Home
                </p>
                <p className="text-2xl font-black text-green-600 tabular-nums">
                  {fmt(tax.takeHome)}
                </p>
                <p className="text-sm text-gray-500 mt-1 tabular-nums">
                  {fmt(tax.takeHome / 12)}/mo · {pctTax}% eff.
                </p>
                <p className="text-xs text-blue-500 font-medium mt-3 group-hover:text-blue-700">
                  Full breakdown →
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Ad: In-content ───────────────────────────────────────────────────── */}
      <div className="container-page mt-10">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Why Texas Section ────────────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="grid sm:grid-cols-2 gap-8 items-stretch">

          {/* Left: text */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-8">
            <div className="w-12 h-12 bg-green-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-5">
              $0
            </div>
            <h2 className="text-2xl font-extrabold text-gray-900 mb-3">
              Texas = Zero State Income Tax
            </h2>
            <p className="text-gray-600 mb-4 leading-relaxed">
              Texas is one of only <strong>9 states</strong> that collects no
              state income tax. On a $100K salary in {TAX_YEAR}, you keep{" "}
              <strong className="text-green-700">$79,180</strong> — that&apos;s{" "}
              <strong className="text-green-700">$7,600+ more</strong> than
              California workers earning the same amount.
            </p>
            <div className="space-y-2 mb-5">
              {[
                "No state income tax to file",
                "Only federal + FICA deductions",
                "Same take-home as Florida",
                "One of 9 no-tax states in the US",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 text-sm text-gray-700">
                  <span className="text-green-500 font-bold">✓</span>
                  {item}
                </div>
              ))}
            </div>
            <Link
              href="/texas"
              className="inline-block bg-green-600 text-white font-bold px-5 py-2.5 rounded-xl hover:bg-green-700 transition-colors text-sm"
            >
              Texas Salary Guide →
            </Link>
          </div>

          {/* Right: comparison bars */}
          <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
            <h3 className="font-extrabold text-gray-900 mb-1 text-lg">
              $100,000 Salary — State Comparison ({TAX_YEAR})
            </h3>
            <p className="text-gray-500 text-xs mb-6">Annual take-home pay after all taxes</p>

            <div className="space-y-4">
              {COMPARISON_DATA.map(({ state: st, take, color, pct }) => (
                <div key={st}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="font-semibold text-gray-800">{st}</span>
                    <span className="font-bold text-gray-900 tabular-nums">${take.toLocaleString()}/yr</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-gray-400 mt-6">
              * Single filer, standard deduction. {TAX_YEAR} federal brackets. State estimates approximate.
            </p>

            <div className="mt-5 pt-5 border-t border-gray-100">
              <Link
                href="/states"
                className="text-blue-700 text-sm font-semibold hover:underline"
              >
                Compare all 50 states →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="mt-16 py-14" style={{ background: "#f8fafc" }}>
        <div className="container-page">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-extrabold text-gray-900 mb-2">
              Instant, Accurate, Free
            </h2>
            <p className="text-gray-500">
              No spreadsheets. No signups. Just your real take-home pay.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: "💰",
                title: "Enter Your Salary",
                desc: "Type any annual salary from $20,000 to $500,000. The live preview updates instantly as you type.",
              },
              {
                step: "2",
                icon: "🧮",
                title: "We Do the Math",
                desc: `Real ${TAX_YEAR} IRS progressive tax brackets. FICA (Social Security + Medicare). State tax (Texas = $0). Standard deduction applied.`,
              },
              {
                step: "3",
                icon: "📊",
                title: "See Everything",
                desc: "Annual, monthly, bi-weekly, weekly, daily, and hourly take-home pay. Plus effective rate, marginal rate, visual tax bar, and full breakdown.",
              },
            ].map(({ step, icon, title, desc }) => (
              <div
                key={step}
                className="bg-white rounded-2xl border border-gray-200 p-6 text-center shadow-sm hover:shadow-md transition-shadow"
              >
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

      {/* ── Full Salary Browse ────────────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="flex items-end justify-between mb-4">
          <h2 className="text-2xl font-extrabold text-gray-900">
            Browse Every Texas Salary
          </h2>
          <Link href="/texas" className="text-blue-700 text-sm font-semibold hover:underline hidden sm:block">
            Full Texas hub →
          </Link>
        </div>
        <p className="text-gray-500 text-sm mb-6">
          From $20,000 to $500,000 — click any amount for the complete {TAX_YEAR} tax breakdown.
        </p>

        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {POPULAR_SALARIES.map((amount) => (
            <Link
              key={amount}
              href={`/salary/${amount}-salary-after-tax-texas`}
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

      {/* ── States preview ───────────────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">
          More States — Coming Soon
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { name: "Texas",      href: "/texas",       live: true,  tax: "0% state tax",       color: "border-green-300 bg-green-50" },
            { name: "Florida",    href: "/florida",     live: false, tax: "0% state tax",       color: "border-amber-200 bg-amber-50" },
            { name: "New York",   href: "/new-york",    live: false, tax: "10.9% top rate",     color: "border-gray-200 bg-gray-50" },
            { name: "California", href: "/california",  live: false, tax: "13.3% top rate",     color: "border-gray-200 bg-gray-50", external: "https://californiasalaryaftertax.com" },
          ].map(({ name, href, live, tax, color, external }) => (
            <Link
              key={name}
              href={external || href}
              {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
              className={`block border-2 rounded-2xl p-5 hover:shadow-md transition-all ${color}`}
            >
              <div className="flex items-start justify-between mb-2">
                <span className="font-extrabold text-gray-900">{name}</span>
                {live ? (
                  <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Live</span>
                ) : (
                  <span className="text-xs bg-white text-gray-500 border border-gray-300 px-2 py-0.5 rounded-full">Soon</span>
                )}
              </div>
              <p className="text-sm text-gray-500">{tax}</p>
              <p className="text-xs text-blue-600 font-medium mt-2">
                {live ? "Open calculator →" : "Learn more →"}
              </p>
            </Link>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/states" className="text-blue-700 font-semibold text-sm hover:underline">
            View all 50 states →
          </Link>
        </div>
      </section>

      {/* ── Bottom Ad ────────────────────────────────────────────────────────── */}
      <div className="container-page mt-10 mb-4">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
