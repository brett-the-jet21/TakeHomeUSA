"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { POPULAR_SALARIES, calculateTexasTax, fmt } from "@/lib/tax";

const STATES = [{ slug: "texas", name: "Texas — No State Income Tax" }];

const SALARY_RANGES = [
  { label: "Entry Level", salaries: [30_000, 35_000, 40_000, 45_000, 50_000] },
  { label: "Mid Career",  salaries: [55_000, 60_000, 65_000, 70_000, 75_000] },
  { label: "Experienced", salaries: [80_000, 85_000, 90_000, 95_000, 100_000] },
  { label: "Senior",      salaries: [110_000, 120_000, 125_000, 150_000, 175_000] },
  { label: "Executive",   salaries: [200_000, 250_000, 300_000, 400_000, 500_000] },
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
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="container-page py-16 sm:py-20">
          <div className="max-w-2xl mx-auto text-center">
            <div className="inline-block bg-blue-700 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
              2024 Tax Data · Updated
            </div>
            <h1 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-4">
              Salary After Tax Calculator
            </h1>
            <p className="text-blue-200 text-lg mb-10">
              See your exact take-home pay in seconds. Real federal tax brackets,
              FICA, and state taxes — no guesswork.
            </p>

            {/* Calculator Card */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-2xl text-gray-900">
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <label className="block text-left">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    Annual Salary
                  </span>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-medium">
                      $
                    </span>
                    <input
                      inputMode="numeric"
                      value={salary}
                      onChange={(e) => setSalary(e.target.value)}
                      placeholder="100,000"
                      className="w-full border border-gray-300 rounded-lg pl-7 pr-4 py-3 text-lg font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </label>

                <label className="block text-left">
                  <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-1.5">
                    State
                  </span>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-3 text-base font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  >
                    {STATES.map((s) => (
                      <option key={s.slug} value={s.slug}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Live Preview */}
              {previewTax && (
                <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-4 mb-4 flex items-center justify-between">
                  <div className="text-left">
                    <p className="text-xs text-green-700 font-medium uppercase tracking-wide">
                      Estimated Take-Home
                    </p>
                    <p className="text-3xl font-bold text-green-700">
                      {fmt(previewTax.takeHome)}
                      <span className="text-base font-medium text-green-600">
                        /yr
                      </span>
                    </p>
                  </div>
                  <div className="text-right text-sm text-gray-600">
                    <p>
                      <span className="font-semibold">
                        {fmt(previewTax.takeHome / 12)}
                      </span>{" "}
                      / mo
                    </p>
                    <p>
                      <span className="font-semibold">
                        {fmt(previewTax.takeHome / 26)}
                      </span>{" "}
                      / bi-wk
                    </p>
                  </div>
                </div>
              )}

              <button
                onClick={handleCalculate}
                disabled={!cleaned || Number(cleaned) < 1000}
                className="w-full bg-blue-700 text-white font-bold py-3.5 rounded-xl text-lg hover:bg-blue-800 active:scale-95 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                See Full Tax Breakdown →
              </button>

              <p className="text-xs text-gray-400 mt-3">
                Based on 2024 IRS brackets · Single filer · Standard deduction
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad Slot: Leaderboard ─────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard">
          {/* AdSense: replace with <ins class="adsbygoogle"> once approved */}
        </div>
      </div>

      {/* ── Trust Badges ─────────────────────────────────────────────────── */}
      <section className="container-page">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { icon: "✓", label: "2024 Tax Brackets", sub: "IRS-verified data" },
            { icon: "⚡", label: "Instant Results", sub: "No signup required" },
            { icon: "$", label: "100% Free", sub: "No hidden fees" },
            { icon: "🔒", label: "Private", sub: "No data stored" },
          ].map(({ icon, label, sub }) => (
            <div
              key={label}
              className="flex items-center gap-3 bg-gray-50 rounded-xl p-4 border border-gray-100"
            >
              <span className="text-2xl">{icon}</span>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{label}</p>
                <p className="text-xs text-gray-500">{sub}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Popular Salaries by Range ─────────────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="flex items-baseline justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            Texas Salary Calculator — Popular Amounts
          </h2>
          <span className="text-sm text-gray-500 hidden sm:block">
            No state income tax
          </span>
        </div>

        <div className="space-y-6">
          {SALARY_RANGES.map(({ label, salaries }) => {
            return (
              <div key={label}>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                  {label}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {salaries.map((amount) => {
                    const tax = calculateTexasTax(amount);
                    return (
                      <Link
                        key={amount}
                        href={`/salary/${amount}-salary-after-tax-texas`}
                        className="group bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-md transition-all text-center"
                      >
                        <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700">
                          ${amount.toLocaleString()}
                        </p>
                        <p className="text-green-600 font-semibold text-xs mt-0.5">
                          {fmt(tax.takeHome)}/yr
                        </p>
                        <p className="text-gray-400 text-xs mt-0.5">
                          {fmt(tax.takeHome / 12)}/mo
                        </p>
                      </Link>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ── Ad Slot: In-content ───────────────────────────────────────────── */}
      <div className="container-page mt-10">
        <div className="ad-slot ad-in-content" />
      </div>

      {/* ── Texas Tax Explainer ───────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="grid sm:grid-cols-2 gap-8 items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Why Texas? No State Income Tax
            </h2>
            <p className="text-gray-600 mb-4">
              Texas is one of only <strong>9 US states with zero state income
              tax</strong>. That means every dollar you earn stays in your pocket
              — unlike California (up to 13.3%), New York (up to 10.9%), or New
              Jersey (up to 10.75%).
            </p>
            <p className="text-gray-600 mb-4">
              On a <strong>$100,000 salary</strong>, a Texan takes home roughly{" "}
              <strong className="text-green-700">$78,509/year</strong>. The same
              salary in California nets only around <strong>$68,000</strong> —
              that's{" "}
              <strong className="text-blue-700">$10,500+ more every year</strong>{" "}
              just by living in Texas.
            </p>
            <Link
              href="/salary/100000-salary-after-tax-texas"
              className="inline-block bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              See $100K Texas Breakdown →
            </Link>
          </div>

          <div className="bg-gray-50 rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-4 text-center">
              $100,000 Salary Comparison
            </h3>
            <div className="space-y-3">
              {[
                { state: "Texas", take: 78_509, color: "bg-green-500" },
                { state: "Florida", take: 78_509, color: "bg-green-400" },
                { state: "Illinois", take: 73_554, color: "bg-yellow-400" },
                { state: "New York", take: 68_200, color: "bg-orange-400" },
                { state: "California", take: 67_900, color: "bg-red-400" },
              ].map(({ state: st, take, color }) => (
                <div key={st}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-700">{st}</span>
                    <span className="font-semibold text-gray-900">
                      ${take.toLocaleString()}/yr
                    </span>
                  </div>
                  <div className="h-2.5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${color} rounded-full`}
                      style={{ width: `${(take / 100_000) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mt-4 text-center">
              * Estimates for single filer, standard deduction
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 mt-16 py-14">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            How TakeHomeUSA Calculates Your Pay
          </h2>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                title: "Enter Your Salary",
                desc: "Type any annual salary from $20,000 to $500,000. Our live preview updates as you type.",
              },
              {
                step: "2",
                title: "We Apply Real Tax Brackets",
                desc: "We use the 2024 IRS federal tax brackets, Social Security (6.2%), and Medicare (1.45%) to calculate your exact liability.",
              },
              {
                step: "3",
                title: "See Your Full Breakdown",
                desc: "Get your annual, monthly, bi-weekly, weekly, daily, and hourly take-home pay — plus your effective and marginal tax rates.",
              },
            ].map(({ step, title, desc }) => (
              <div key={step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-blue-700 text-white text-xl font-bold flex items-center justify-center mx-auto mb-4">
                  {step}
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Browse All Texas Salaries ─────────────────────────────────────── */}
      <section className="container-page mt-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Browse All Texas Salary Calculations
        </h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {POPULAR_SALARIES.map((amount) => (
            <Link
              key={amount}
              href={`/salary/${amount}-salary-after-tax-texas`}
              className="text-center text-sm bg-white border border-gray-200 rounded-lg py-2 px-1 hover:border-blue-400 hover:text-blue-700 transition-colors"
            >
              ${(amount / 1000).toFixed(0)}K
            </Link>
          ))}
        </div>
        <p className="text-sm text-gray-500 mt-4 text-center">
          Don&apos;t see yours?{" "}
          <button
            onClick={() =>
              document
                .querySelector("input")
                ?.scrollIntoView({ behavior: "smooth" })
            }
            className="text-blue-700 underline hover:no-underline"
          >
            Use the calculator above
          </button>{" "}
          for any salary from $20K to $500K.
        </p>
      </section>

      {/* ── Bottom Ad ────────────────────────────────────────────────────── */}
      <div className="container-page mt-10 mb-4">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
