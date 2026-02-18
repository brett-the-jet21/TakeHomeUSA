"use client";

import { useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  calculateTexasTax,
  fmt,
  pct,
  TAX_YEAR,
  FEDERAL_BRACKETS_2026,
} from "@/lib/tax";

// ─── Bracket display labels for 2026 ─────────────────────────────────────────
const BRACKET_LABELS = [
  { rate: 0.10, label: "$0 – $12,400" },
  { rate: 0.12, label: "$12,401 – $50,400" },
  { rate: 0.22, label: "$50,401 – $105,700" },
  { rate: 0.24, label: "$105,701 – $201,775" },
  { rate: 0.32, label: "$201,776 – $256,225" },
  { rate: 0.35, label: "$256,226 – $640,600" },
  { rate: 0.37, label: "Over $640,600" },
];

interface Props {
  initialAmount: number;
  state: string;
  stateSlug: string;
}

export default function SalaryCalculator({ initialAmount, state, stateSlug }: Props) {
  const router = useRouter();
  const [salaryInput, setSalaryInput] = useState(initialAmount.toString());
  const [showHowWeCalc, setShowHowWeCalc] = useState(false);

  // Parse the live amount from input
  const amount = useMemo(() => {
    const n = Number(salaryInput.replace(/[^0-9]/g, ""));
    return n >= 1_000 && n <= 10_000_000 ? n : initialAmount;
  }, [salaryInput, initialAmount]);

  const tax = useMemo(() => calculateTexasTax(amount), [amount]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryInput(e.target.value);
  }, []);

  const handleNavigate = useCallback(() => {
    const n = Number(salaryInput.replace(/[^0-9]/g, ""));
    if (n >= 20_000 && n <= 500_000) {
      const rounded = Math.round(n / 1_000) * 1_000;
      router.push(`/salary/${rounded}-salary-after-tax-${stateSlug}`);
    }
  }, [salaryInput, router, stateSlug]);

  const amtFmt = amount.toLocaleString("en-US");
  const monthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const hourly = tax.takeHome / 2080;

  // Visual bar percentages
  const fedPct = tax.gross > 0 ? (tax.federalTax / tax.gross) * 100 : 0;
  const ficaPct = tax.gross > 0 ? (tax.ficaTotal / tax.gross) * 100 : 0;
  const takePct = tax.gross > 0 ? (tax.takeHome / tax.gross) * 100 : 100;

  const periods = [
    { label: "Annual",    divisor: 1 },
    { label: "Monthly",   divisor: 12 },
    { label: "Bi-Weekly", divisor: 26 },
    { label: "Weekly",    divisor: 52 },
    { label: "Daily",     divisor: 260 },
    { label: "Hourly",    divisor: 2080 },
  ];

  const nearbyLinks = [-10_000, -5_000, -1_000, 1_000, 5_000, 10_000]
    .map((d) => amount + d)
    .filter((a) => a >= 20_000 && a <= 500_000);

  const popularLinks = [
    50_000, 60_000, 75_000, 80_000, 90_000, 100_000,
    110_000, 125_000, 150_000, 175_000, 200_000, 250_000,
  ].filter((a) => Math.abs(a - amount) > 2_000);

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

  return (
    <main className="container-page pb-16">

      {/* ── Phase 1: Authority Banner ───────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-5 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-blue-900">
          Updated for {TAX_YEAR} Federal &amp; State Tax Brackets
        </span>
        <span className="text-blue-400 text-xs ml-auto hidden sm:inline">
          IRS Rev. Proc. 2025-32 · SSA COLA 2026
        </span>
      </div>

      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href="/texas" className="hover:text-blue-700 transition-colors">
          Texas Salary Calculator
        </Link>
        <span>/</span>
        <span className="text-gray-700">${amtFmt} Salary</span>
      </nav>

      {/* ── Phase 4: Real-Time Salary Input ────────────────────────────────── */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-7">
        <label className="block text-sm font-bold text-gray-700 mb-2">
          Adjust Salary — All Results Update Instantly
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg pointer-events-none">
              $
            </span>
            <input
              type="text"
              inputMode="numeric"
              value={salaryInput}
              onChange={handleChange}
              onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
              className="w-full pl-8 pr-4 py-3.5 border-2 border-blue-300 rounded-xl text-xl font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
              placeholder="100000"
              aria-label="Annual salary amount"
            />
          </div>
          <button
            onClick={handleNavigate}
            className="bg-blue-700 text-white px-5 py-3.5 rounded-xl font-bold hover:bg-blue-800 active:bg-blue-900 transition-colors whitespace-nowrap text-sm shadow-sm"
          >
            Full Page →
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          Type any salary · Numbers refresh live · Enter or click to navigate to a dedicated page
        </p>
      </div>

      {/* ── H1 + Credibility Line ───────────────────────────────────────────── */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
        ${amtFmt} Salary After Tax in {state} ({TAX_YEAR})
      </h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6 text-sm text-gray-500">
        <span>Calculations based on current IRS brackets and official state tax tables.</span>
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
          Last Updated: Tax Year {TAX_YEAR}
        </span>
        <span className="text-green-700 font-medium">{state} has no state income tax</span>
      </div>

      {/* ── Summary Hero Card ───────────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 sm:p-8 text-white mb-8">
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
          Annual Take-Home Pay
        </p>
        <p className="text-5xl sm:text-6xl font-black mb-6 tracking-tight tabular-nums">
          {fmt(tax.takeHome)}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Monthly",   value: fmt(monthly) },
            { label: "Bi-Weekly", value: fmt(biweekly) },
            { label: "Weekly",    value: fmt(tax.takeHome / 52) },
            { label: "Hourly",    value: fmt(hourly) },
          ].map(({ label, value }) => (
            <div key={label} className="bg-blue-700/50 rounded-xl p-3 text-center">
              <p className="text-blue-300 text-xs uppercase tracking-wide mb-1">{label}</p>
              <p className="text-lg sm:text-xl font-bold tabular-nums">{value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-6 mt-4 pt-4 border-t border-blue-700">
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
          <div>
            <span className="text-blue-300 text-xs">You Keep</span>
            <p className="font-bold text-lg text-green-400">{pct(tax.takeHome / tax.gross)}</p>
          </div>
        </div>
      </div>

      {/* ── Phase 4: Visual Tax Breakdown Bar ──────────────────────────────── */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Where Does Your ${amtFmt} Go?
        </h2>
        <div className="flex h-10 rounded-xl overflow-hidden shadow-sm mb-3" role="img" aria-label="Tax breakdown bar chart">
          <div
            className="bg-red-500 flex items-center justify-center transition-all duration-300"
            style={{ width: `${fedPct}%` }}
            title={`Federal Tax: ${pct(fedPct / 100)}`}
          >
            {fedPct > 8 && (
              <span className="text-white text-xs font-bold px-1 truncate">
                Fed {pct(fedPct / 100)}
              </span>
            )}
          </div>
          <div
            className="bg-orange-400 flex items-center justify-center transition-all duration-300"
            style={{ width: `${ficaPct}%` }}
            title={`FICA: ${pct(ficaPct / 100)}`}
          >
            {ficaPct > 5 && (
              <span className="text-white text-xs font-bold px-1 truncate">
                FICA {pct(ficaPct / 100)}
              </span>
            )}
          </div>
          <div
            className="bg-green-500 flex items-center justify-center transition-all duration-300"
            style={{ width: `${takePct}%` }}
            title={`Take-Home: ${pct(takePct / 100)}`}
          >
            {takePct > 10 && (
              <span className="text-white text-xs font-bold px-1 truncate">
                Take-Home {pct(takePct / 100)}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">Federal Tax: <strong>{fmt(tax.federalTax)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-orange-400 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">FICA: <strong>{fmt(tax.ficaTotal)}</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-gray-200 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">State Tax: <strong className="text-green-700">$0</strong></span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">Take-Home: <strong className="text-green-700">{fmt(tax.takeHome)}</strong></span>
          </span>
        </div>
      </section>

      {/* ── Main Grid: Content + Sidebar ─────────────────────────────────────── */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* ── Left Column ─────────────────────────────────────────────────── */}
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
                    <td className="font-bold text-gray-900 tabular-nums">{fmt(tax.gross)}</td>
                  </tr>
                  <tr>
                    <td>
                      <span className="font-medium">Federal Income Tax</span>
                      <span className="block text-xs text-gray-400 mt-0.5">
                        Taxable income: {fmt(tax.federalTaxable)} (after ${tax.standardDeduction.toLocaleString()} std. deduction)
                      </span>
                    </td>
                    <td className="text-gray-600 tabular-nums">{pct(tax.effectiveFederalRate)}</td>
                    <td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.federalTax)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="pl-8 text-sm text-gray-500">
                      Social Security (6.2%
                      {tax.gross > 184_500 ? " · capped at $184,500" : ""})
                    </td>
                    <td className="text-gray-400 text-sm">6.20%</td>
                    <td className="text-red-500 text-sm tabular-nums">−{fmt(tax.socialSecurity)}</td>
                  </tr>
                  <tr>
                    <td className="pl-8 text-sm text-gray-500">Medicare (1.45%)</td>
                    <td className="text-gray-400 text-sm">1.45%</td>
                    <td className="text-red-500 text-sm tabular-nums">−{fmt(tax.medicare)}</td>
                  </tr>
                  {tax.additionalMedicare > 0 && (
                    <tr className="bg-gray-50">
                      <td className="pl-8 text-sm text-gray-500">
                        Additional Medicare (0.9% over $200K)
                      </td>
                      <td className="text-gray-400 text-sm">0.90%</td>
                      <td className="text-red-500 text-sm tabular-nums">−{fmt(tax.additionalMedicare)}</td>
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
                    <td className="text-gray-600 tabular-nums">{pct(tax.effectiveTotalRate)}</td>
                    <td className="text-red-600 font-bold tabular-nums">−{fmt(tax.totalTax)}</td>
                  </tr>
                  <tr className="row-total">
                    <td>Take-Home Pay</td>
                    <td className="tabular-nums">{pct(1 - tax.effectiveTotalRate)}</td>
                    <td className="text-xl tabular-nums">{fmt(tax.takeHome)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Phase 1: Credibility line */}
            <p className="text-xs text-gray-400 mt-2">
              Calculations based on {TAX_YEAR} IRS brackets and official state tax tables. Single filer, standard deduction applied.
            </p>
          </section>

          {/* Phase 1: How We Calculate — Collapsible */}
          <section className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHowWeCalc(!showHowWeCalc)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              aria-expanded={showHowWeCalc}
            >
              <span className="font-semibold text-gray-800 text-sm">
                How We Calculate Your Take-Home Pay
              </span>
              <span className="text-gray-400 text-lg ml-2 flex-shrink-0">
                {showHowWeCalc ? "▲" : "▼"}
              </span>
            </button>
            {showHowWeCalc && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-4 text-sm text-gray-600 leading-relaxed">
                <div className="pt-4 grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">1. Federal Income Tax</p>
                    <p>
                      We apply the {TAX_YEAR} IRS progressive brackets to your taxable income.
                      First, we subtract the ${tax.standardDeduction.toLocaleString()} standard deduction
                      from your gross salary to get federal taxable income of {fmt(tax.federalTaxable)}.
                      Then each bracket is applied only to the income within that range
                      (10% → 12% → 22% → ... up to 37%).
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">2. Social Security (OASDI)</p>
                    <p>
                      6.2% on all wages up to the $184,500 {TAX_YEAR} wage base
                      (per SSA COLA 2026 announcement). Above $184,500, no additional
                      Social Security is owed. Your SS tax: {fmt(tax.socialSecurity)}.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">3. Medicare (HI)</p>
                    <p>
                      1.45% on all wages with no cap.
                      {tax.additionalMedicare > 0
                        ? ` An additional 0.9% applies to wages over $200,000 — you owe ${fmt(tax.additionalMedicare)} in additional Medicare tax.`
                        : " For wages under $200,000, no additional Medicare applies."}
                      {" "}Your Medicare tax: {fmt(tax.medicare)}.
                    </p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">4. {state} State Income Tax</p>
                    <p>
                      {state} levies <strong>zero state income tax</strong> — one of only 9 states
                      to do so. No state return to file for wage income. You pay $0 in state tax
                      regardless of your salary.
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-bold text-gray-900 mb-1">Filing Assumptions</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
                    <li>Filing status: Single filer</li>
                    <li>Standard deduction: ${tax.standardDeduction.toLocaleString()} ({TAX_YEAR})</li>
                    <li>No additional credits, deductions, or withholding adjustments</li>
                    <li>No pre-tax retirement contributions (401k, HSA) assumed</li>
                    <li>Employer pays matching FICA — these figures reflect employee share only</li>
                    <li>Source: IRS Revenue Procedure 2025-32; SSA COLA 2026</li>
                  </ul>
                </div>
              </div>
            )}
          </section>

          {/* Pay Period Breakdown */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">Pay Period Breakdown</h2>
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
                      <td className="text-gray-600 tabular-nums">{fmt(tax.gross / divisor)}</td>
                      <td className="text-red-500 tabular-nums">−{fmt(tax.totalTax / divisor)}</td>
                      <td className="font-bold text-green-700 tabular-nums">{fmt(tax.takeHome / divisor)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              Hourly assumes 2,080 hrs/year (40 hrs/week × 52 weeks). Daily assumes 260 working days/year.
            </p>
          </section>

          {/* ── Ad: In-Content ─────────────────────────────────────────────── */}
          <div className="ad-slot ad-in-content" />

          {/* Phase 3: Relocation Savings Calculator */}
          <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">📍</div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-gray-900 mb-1">
                  {state} Relocation Savings
                </h2>
                <p className="text-gray-600 text-sm mb-4">
                  Moving from a high-tax state? On a ${amtFmt} salary, here&apos;s how much more you&apos;d keep in {state}:
                </p>
                <div className="grid sm:grid-cols-3 gap-3 mb-4">
                  {[
                    { from: "California", rate: 0.093, topRate: "13.3%" },
                    { from: "New York",   rate: 0.048, topRate: "10.9%" },
                    { from: "Illinois",   rate: 0.0495, topRate: "4.95% flat" },
                  ].map(({ from, rate, topRate }) => {
                    const saving = Math.round(amount * rate);
                    return (
                      <div
                        key={from}
                        className="bg-white border border-amber-200 rounded-xl p-4 text-center"
                      >
                        <p className="text-xs text-gray-500 mb-0.5">vs. {from}</p>
                        <p className="text-xs text-gray-400 mb-2">({topRate} top rate)</p>
                        <p className="text-green-700 font-black text-xl">
                          +${saving.toLocaleString()}
                        </p>
                        <p className="text-gray-500 text-xs mt-0.5">per year</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-gray-400">
                  * Estimated state income tax savings only. Property tax, cost of living, and other factors vary. Consult a financial advisor.
                </p>
              </div>
            </div>
          </section>

          {/* Federal Tax Brackets for 2026 */}
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
                    <th>Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {BRACKET_LABELS.map(({ rate, label }, i) => {
                    const bracketMin = FEDERAL_BRACKETS_2026[i].min;
                    const applies = tax.federalTaxable > bracketMin;
                    const isTopBracket = applies && rate === tax.marginalRate;
                    return (
                      <tr
                        key={rate}
                        className={
                          isTopBracket
                            ? "bg-blue-50 font-semibold"
                            : applies
                            ? ""
                            : "opacity-40"
                        }
                      >
                        <td>
                          {isTopBracket && (
                            <span className="text-blue-700 text-xs font-bold">
                              ← Your top bracket
                            </span>
                          )}
                        </td>
                        <td>{label}</td>
                        <td className="font-semibold">
                          {Math.round(rate * 100)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              After applying the ${tax.standardDeduction.toLocaleString()} standard deduction, your federal taxable income is{" "}
              {fmt(tax.federalTaxable)}. Brackets per IRS Rev. Proc. 2025-32.
            </p>
          </section>

          {/* Phase 3: Comparison Teaser */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              How Does ${amtFmt} Compare Across States?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The same gross salary delivers very different take-home pay depending on where you live.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {[
                { state: "Texas",    take: tax.takeHome, color: "text-green-700", note: "No state tax" },
                { state: "Florida",  take: tax.takeHome, color: "text-green-700", note: "No state tax" },
                { state: "New York", take: tax.takeHome - amount * 0.048, color: "text-gray-700", note: "~4.8% eff. state tax" },
                { state: "California", take: tax.takeHome - amount * 0.093, color: "text-gray-700", note: "~9.3% eff. state tax" },
              ].map(({ state: s, take, color, note }) => (
                <div key={s} className="bg-white rounded-xl p-3 flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">{s}</p>
                    <p className="text-xs text-gray-400">{note}</p>
                  </div>
                  <p className={`font-black text-lg tabular-nums ${color}`}>{fmt(take)}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400">
              * State tax estimates are approximate. Actual amounts vary by filing status, deductions, and local taxes (e.g. NYC city tax).
            </p>
          </section>

          {/* FAQ Section */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqItems.map(({ q, a }) => (
                <div
                  key={q}
                  className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors"
                >
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{q}</h3>
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
                    <p className="text-green-600 text-xs mt-0.5 font-medium tabular-nums">
                      {fmt(calculateTexasTax(a).takeHome)}/yr
                    </p>
                  </Link>
                ))}
            </div>
          </section>

        </div>

        {/* ── Sidebar ─────────────────────────────────────────────────────── */}
        <aside className="space-y-5 lg:sticky lg:top-20">

          {/* Ad: Rectangle 300×250 */}
          <div className="ad-slot ad-rectangle" />

          {/* Try Another Salary */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">
              Calculate a Different Salary
            </h3>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Use Full Calculator →
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Quick Stats — ${amtFmt} in {state}
            </h3>
            <div className="space-y-3">
              {[
                { label: "Take-Home (Annual)", value: fmt(tax.takeHome),       green: true },
                { label: "Monthly Take-Home",  value: fmt(monthly),            green: true },
                { label: "Bi-Weekly",          value: fmt(biweekly),           green: true },
                { label: "Hourly (after tax)", value: fmt(hourly),             green: true },
                { label: "Federal Tax",        value: fmt(tax.federalTax),     red: true  },
                { label: "FICA Total",         value: fmt(tax.ficaTotal),      red: true  },
                { label: "State Tax",          value: "$0",                    green: true },
                { label: "Effective Rate",     value: pct(tax.effectiveTotalRate) },
                { label: "Marginal Rate",      value: pct(tax.marginalRate) },
              ].map(({ label, value, green, red }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0"
                >
                  <span className="text-gray-600">{label}</span>
                  <span
                    className={
                      green
                        ? "font-bold text-green-700 tabular-nums"
                        : red
                        ? "font-semibold text-red-600 tabular-nums"
                        : "font-semibold text-gray-900 tabular-nums"
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
                  <span className="text-gray-400 text-xs tabular-nums">
                    → {fmt(calculateTexasTax(a).takeHome)}
                  </span>
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
                  <span className="text-green-600 text-xs font-medium tabular-nums">
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
            a single filer taking the standard deduction. Actual taxes may vary
            based on credits, deductions, and local taxes. Consult a CPA for
            personalized tax advice.
          </div>

        </aside>
      </div>

      {/* ── Bottom Ad ────────────────────────────────────────────────────────── */}
      <div className="ad-slot ad-bottom mt-12" />

    </main>
  );
}
