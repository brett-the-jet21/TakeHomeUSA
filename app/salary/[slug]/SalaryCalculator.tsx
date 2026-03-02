"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { calculateTax, fmt, pct, TAX_YEAR, FEDERAL_BRACKETS_2026 } from "@/lib/tax";
import type { StateTaxConfig } from "@/lib/states";
import { CITIES_BY_STATE, CITY_BY_SLUG } from "@/lib/cities";

const BRACKET_LABELS = [
  "$0 – $12,400",
  "$12,401 – $50,400",
  "$50,401 – $105,700",
  "$105,701 – $201,775",
  "$201,776 – $256,225",
  "$256,226 – $640,600",
  "Over $640,600",
];

interface Props {
  initialAmount: number;
  stateConfig: StateTaxConfig;
}

export default function SalaryCalculator({ initialAmount, stateConfig }: Props) {
  const router = useRouter();
  const [salaryInput, setSalaryInput] = useState(initialAmount.toString());
  const [showHowWeCalc, setShowHowWeCalc] = useState(false);
  const [filing, setFiling] = useState<"single" | "married">("single");
  const [contribution401k, setContribution401k] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [inputMode, setInputMode] = useState<"annual" | "hourly">("annual");
  const [hourlyRate, setHourlyRate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [initialized, setInitialized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get("mode");
    if (m === "hourly") setInputMode("hourly");
    const r = params.get("rate");
    if (r && /^\d+(\.\d+)?$/.test(r) && parseFloat(r) > 0) setHourlyRate(r);
    const hw = params.get("hours");
    if (hw && /^\d+$/.test(hw) && Number(hw) >= 1 && Number(hw) <= 168) setHoursPerWeek(hw);
    const f = params.get("filing");
    if (f === "married") setFiling("married");
    const k = params.get("401k");
    if (k && /^\d+$/.test(k) && Number(k) > 0) setContribution401k(k);
    const c = params.get("city");
    if (c && CITY_BY_SLUG.has(c)) setCitySlug(c);
    setInitialized(true);
  }, []);

  // Write URL params when inputs change (only after initialization)
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    if (inputMode === "hourly") {
      params.set("mode", "hourly");
      const r = parseFloat(hourlyRate);
      if (r > 0) params.set("rate", String(r));
      if (hoursPerWeek !== "40") params.set("hours", hoursPerWeek);
    }
    if (filing !== "single") params.set("filing", filing);
    const k = Number(contribution401k.replace(/[^\d]/g, ""));
    if (k > 0) params.set("401k", String(k));
    if (citySlug) params.set("city", citySlug);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${window.location.pathname}?${qs}` : window.location.pathname);
  }, [inputMode, hourlyRate, hoursPerWeek, filing, contribution401k, citySlug, initialized]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const amount = useMemo(() => {
    if (inputMode === "hourly") {
      const r = parseFloat(hourlyRate) || 0;
      const h = parseInt(hoursPerWeek) || 40;
      const annual = Math.round(r * h * 52);
      return annual >= 1_000 ? annual : initialAmount;
    }
    const n = Number(salaryInput.replace(/[^0-9]/g, ""));
    return n >= 1_000 && n <= 100_000_000_000_000 ? n : initialAmount;
  }, [inputMode, salaryInput, hourlyRate, hoursPerWeek, initialAmount]);

  const annualHours = useMemo(() => {
    if (inputMode === "hourly") {
      const h = parseInt(hoursPerWeek) || 40;
      return h * 52;
    }
    return 2080;
  }, [inputMode, hoursPerWeek]);

  const contrib401kNum = useMemo(() => {
    const n = Number(contribution401k.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [contribution401k]);

  const citiesForState = useMemo(() => CITIES_BY_STATE.get(stateConfig.slug) ?? [], [stateConfig.slug]);

  const cityConfig = useMemo(() => {
    const city = CITY_BY_SLUG.get(citySlug);
    return city?.stateSlug === stateConfig.slug ? city : undefined;
  }, [citySlug, stateConfig.slug]);

  const tax = useMemo(
    () => calculateTax(stateConfig, amount, { filingStatus: filing, contribution401k: contrib401kNum, cityConfig }),
    [stateConfig, amount, filing, contrib401kNum, cityConfig]
  );

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSalaryInput(e.target.value);
  }, []);

  const handleNavigate = useCallback(() => {
    const n = inputMode === "hourly"
      ? Math.round((parseFloat(hourlyRate) || 0) * (parseInt(hoursPerWeek) || 40) * 52)
      : Number(salaryInput.replace(/[^0-9]/g, ""));
    if (n >= 1_000 && n <= 100_000_000_000_000) {
      const params = new URLSearchParams();
      if (inputMode === "hourly") {
        params.set("mode", "hourly");
        const r = parseFloat(hourlyRate);
        if (r > 0) params.set("rate", String(r));
        if (hoursPerWeek !== "40") params.set("hours", hoursPerWeek);
      }
      if (filing !== "single") params.set("filing", filing);
      const k = Number(contribution401k.replace(/[^\d]/g, ""));
      if (k > 0) params.set("401k", String(k));
      if (citySlug) params.set("city", citySlug);
      const qs = params.toString();
      router.push(`/salary/${n}-salary-after-tax-${stateConfig.slug}${qs ? `?${qs}` : ""}`);
    }
  }, [inputMode, salaryInput, hourlyRate, hoursPerWeek, router, stateConfig.slug, filing, contribution401k, citySlug]);

  const { name: stateName, noTax, slug: stateSlug, topRateDisplay } = stateConfig;

  const amtFmt = amount.toLocaleString("en-US");
  const monthly  = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const hourly   = tax.takeHome / annualHours;

  // Visual bar percentages
  const fedPct   = tax.gross > 0 ? (tax.federalTax  / tax.gross) * 100 : 0;
  const statePct = tax.gross > 0 ? (tax.stateTax    / tax.gross) * 100 : 0;
  const cityPct  = tax.gross > 0 ? (tax.cityTax     / tax.gross) * 100 : 0;
  const ficaPct  = tax.gross > 0 ? (tax.ficaTotal   / tax.gross) * 100 : 0;
  const takePct  = tax.gross > 0 ? (tax.takeHome    / tax.gross) * 100 : 100;

  const periods = [
    { label: "Annual",    divisor: 1          },
    { label: "Monthly",   divisor: 12         },
    { label: "Bi-Weekly", divisor: 26         },
    { label: "Weekly",    divisor: 52         },
    { label: "Daily",     divisor: 260        },
    { label: "Hourly",    divisor: annualHours },
  ];

  // Scale nearby steps to the magnitude of the current amount
  const nearbyStep = amount >= 10_000_000_000_000 ? 1_000_000_000_000
    : amount >= 1_000_000_000_000 ? 100_000_000_000
    : amount >= 100_000_000_000   ? 10_000_000_000
    : amount >= 10_000_000_000    ? 1_000_000_000
    : amount >= 1_000_000_000     ? 100_000_000
    : amount >= 100_000_000       ? 10_000_000
    : amount >= 10_000_000        ? 1_000_000
    : amount >= 1_000_000         ? 100_000
    : 10_000;
  const nearbyLinks = [-3, -2, -1, 1, 2, 3]
    .map((d) => amount + d * nearbyStep)
    .filter((a) => a >= 20_000 && a <= 100_000_000_000_000);

  const popularLinks = [
    50_000, 60_000, 75_000, 80_000, 90_000, 100_000,
    110_000, 125_000, 150_000, 175_000, 200_000, 250_000,
  ].filter((a) => Math.abs(a - amount) > 2_000);

  const texasTakeHome = useMemo(() => {
    if (stateSlug === "texas") return null;
    // Reuse the calculation with a Texas-like no-tax config
    const txTax = calculateTax({ ...stateConfig, noTax: true, flat: undefined, brackets: undefined, additionalRate: undefined, deduction: 0 }, amount);
    return txTax.takeHome;
  }, [amount, stateConfig, stateSlug]);

  const faqItems = [
    {
      q: `What is the take-home pay for a $${amtFmt} salary in ${stateName}?`,
      a: `With a $${amtFmt} salary in ${stateName}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. Your deductions include federal income tax (${fmt(tax.federalTax)}), Social Security (${fmt(tax.socialSecurity)}), Medicare (${fmt(tax.medicare)})${noTax ? `, and $0 state income tax` : `, and ${stateName} state income tax (${fmt(tax.stateTax)})`}.`,
    },
    {
      q: `Does ${stateName} have a state income tax?`,
      a: noTax
        ? `No. ${stateName} has no state income tax — one of only 9 US states with $0 state income tax. On a $${amtFmt} salary you pay $0 in state tax, keeping significantly more of your paycheck.`
        : `Yes. ${stateName} has a state income tax with a top rate of ${topRateDisplay}. On a $${amtFmt} salary you pay an estimated ${fmt(tax.stateTax)} in state income tax.`,
    },
    {
      q: `What is $${amtFmt} a year per month after taxes in ${stateName}?`,
      a: `A $${amtFmt} annual salary in ${stateName} works out to ${fmt(monthly)} per month after taxes, or ${fmt(biweekly)} bi-weekly (every two weeks).`,
    },
    {
      q: `What is the effective tax rate on a $${amtFmt} salary in ${stateName}?`,
      a: `The effective total tax rate on a $${amtFmt} salary in ${stateName} is ${pct(tax.effectiveTotalRate)}. This combines federal income tax (${pct(tax.effectiveFederalRate)}) and FICA (Social Security + Medicare)${noTax ? ` — no state income tax.` : ` plus ${stateName} state income tax.`}`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${stateName}?`,
      a: `Based on ${annualHours.toLocaleString()} hours/year (${parseInt(hoursPerWeek) || 40} hrs/week × 52 weeks), a $${amtFmt} salary in ${stateName} works out to ${fmt(hourly)} per hour after taxes.`,
    },
  ];

  return (
    <main className="container-page pb-16">

      {/* Authority Banner */}
      <div className="flex items-center gap-2.5 bg-blue-50 border border-blue-200 rounded-xl px-4 py-2.5 mb-5 text-sm">
        <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
        <span className="font-semibold text-blue-900">
          Updated for {TAX_YEAR} Federal &amp; State Tax Brackets
        </span>
        <span className="text-blue-400 text-xs ml-auto hidden sm:inline">
          IRS Rev. Proc. 2025-32
        </span>
      </div>

      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-5 flex items-center gap-1.5 flex-wrap">
        <Link href="/" className="hover:text-blue-700 transition-colors">Home</Link>
        <span>/</span>
        <Link href={`/${stateSlug}`} className="hover:text-blue-700 transition-colors">
          {stateName} Salary Calculator
        </Link>
        <span>/</span>
        <span className="text-gray-700">${amtFmt} Salary</span>
      </nav>

      {/* Real-Time Salary Input */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5 mb-7">
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700">
            Adjust Pay — All Results Update Instantly
          </label>
          <div className="flex bg-blue-100 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setInputMode("annual")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${inputMode === "annual" ? "bg-white shadow text-gray-900" : "text-blue-600 hover:text-blue-800"}`}
            >
              Annual
            </button>
            <button
              type="button"
              onClick={() => setInputMode("hourly")}
              className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${inputMode === "hourly" ? "bg-white shadow text-gray-900" : "text-blue-600 hover:text-blue-800"}`}
            >
              Hourly
            </button>
          </div>
        </div>
        {inputMode === "annual" ? (
          <div className="flex gap-3 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-lg pointer-events-none">$</span>
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
              className="bg-blue-700 text-white px-5 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors whitespace-nowrap text-sm shadow-sm"
            >
              Full Page →
            </button>
          </div>
        ) : (
          <div className="flex gap-2 mb-3">
            <div className="relative flex-1">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-base pointer-events-none">$</span>
              <input
                type="text"
                inputMode="decimal"
                value={hourlyRate}
                onChange={(e) => setHourlyRate(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
                className="w-full pl-7 pr-2 py-3.5 border-2 border-blue-300 rounded-xl text-xl font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-all"
                placeholder="25.00"
                aria-label="Hourly wage"
              />
            </div>
            <div className="w-20 flex-shrink-0">
              <input
                type="text"
                inputMode="numeric"
                value={hoursPerWeek}
                onChange={(e) => setHoursPerWeek(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleNavigate()}
                className="w-full px-2 py-3.5 border-2 border-blue-300 rounded-xl text-xl font-extrabold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-center transition-all"
                aria-label="Hours per week"
              />
              <p className="text-xs text-center text-gray-400 mt-0.5">hrs/wk</p>
            </div>
            <button
              onClick={handleNavigate}
              className="bg-blue-700 text-white px-4 py-3.5 rounded-xl font-bold hover:bg-blue-800 transition-colors whitespace-nowrap text-sm shadow-sm"
            >
              Full Page →
            </button>
          </div>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Filing Status</label>
            <select
              value={filing}
              onChange={(e) => setFiling(e.target.value as "single" | "married")}
              className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              <option value="single">Single</option>
              <option value="married">Married Filing Jointly</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">401(k) Pre-Tax Contribution</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm pointer-events-none">$</span>
              <input
                type="text"
                inputMode="numeric"
                value={contribution401k}
                onChange={(e) => setContribution401k(e.target.value)}
                placeholder="0"
                className="w-full pl-7 pr-3 py-2 border border-blue-200 rounded-xl text-sm font-semibold text-gray-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
          </div>
          {citiesForState.length > 0 && (
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-600 mb-1">City / Local Tax</label>
              <select
                value={citySlug}
                onChange={(e) => setCitySlug(e.target.value)}
                className="w-full border border-blue-200 rounded-xl px-3 py-2 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="">No city tax</option>
                {citiesForState.map((c) => (
                  <option key={c.slug} value={c.slug}>{c.name} — {c.topRateDisplay}</option>
                ))}
              </select>
            </div>
          )}
        </div>
        <p className="text-xs text-gray-400 mt-2">
          {inputMode === "hourly"
            ? `$${hourlyRate || "0"}/hr × ${hoursPerWeek}h/wk × 52 = ${amount >= 1_000 ? fmt(amount) : "$0"}/yr · Enter or click Full Page to navigate`
            : "Type any salary · Numbers refresh live · Enter or click to navigate to a dedicated page"
          }
        </p>
      </div>

      {/* H1 + Credibility */}
      <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2 leading-tight">
        ${amtFmt} Salary After Tax in {stateName} ({TAX_YEAR})
      </h1>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mb-6 text-sm text-gray-500">
        <span>Calculations based on current IRS brackets and official state tax tables.</span>
        <span className="bg-gray-100 text-gray-500 text-xs px-2 py-0.5 rounded-full font-medium">
          Last Updated: Tax Year {TAX_YEAR}
        </span>
        {noTax
          ? <span className="text-green-700 font-medium">{stateName} has no state income tax</span>
          : <span className="text-orange-600 font-medium">{stateName} top rate: {topRateDisplay}</span>
        }
      </div>

      {/* Summary Hero Card */}
      <div className="bg-gradient-to-br from-blue-800 to-blue-900 rounded-2xl p-6 sm:p-8 text-white mb-8">
        <p className="text-blue-300 text-xs font-semibold uppercase tracking-widest mb-1">
          Annual Take-Home Pay
        </p>
        <p className="text-5xl sm:text-6xl font-black mb-6 tracking-tight tabular-nums">
          {fmt(tax.takeHome)}
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Monthly",   value: fmt(monthly)           },
            { label: "Bi-Weekly", value: fmt(biweekly)          },
            { label: "Weekly",    value: fmt(tax.takeHome / 52) },
            { label: "Hourly",    value: fmt(hourly)            },
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
            <span className="text-blue-300 text-xs">Fed Marginal Rate</span>
            <p className="font-bold text-lg">{pct(tax.marginalRate)}</p>
          </div>
          <div>
            <span className="text-blue-300 text-xs">{stateName} State Tax</span>
            <p className={`font-bold text-lg ${noTax ? "text-green-400" : "text-orange-300"}`}>
              {noTax ? "$0" : fmt(tax.stateTax)}
            </p>
          </div>
          <div>
            <span className="text-blue-300 text-xs">You Keep</span>
            <p className="font-bold text-lg text-green-400">{pct(tax.takeHome / tax.gross)}</p>
          </div>
          <div className="ml-auto self-end">
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-xs text-blue-300 hover:text-white transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
              </svg>
              {copied ? "Link copied!" : "Copy link"}
            </button>
          </div>
        </div>
      </div>

      {/* Visual Tax Breakdown Bar */}
      <section className="mb-10">
        <h2 className="text-lg font-bold text-gray-900 mb-3">
          Where Does Your ${amtFmt} Go?
        </h2>
        <div
          className="flex h-10 rounded-xl overflow-hidden shadow-sm mb-3"
          role="img"
          aria-label="Tax breakdown bar chart"
        >
          <div
            className="bg-red-500 flex items-center justify-center transition-all duration-300"
            style={{ width: `${fedPct}%` }}
            title={`Federal Tax: ${pct(fedPct / 100)}`}
          >
            {fedPct > 7 && (
              <span className="text-white text-xs font-bold px-1 truncate">Fed {pct(fedPct / 100)}</span>
            )}
          </div>
          {!noTax && statePct > 0 && (
            <div
              className="bg-purple-500 flex items-center justify-center transition-all duration-300"
              style={{ width: `${statePct}%` }}
              title={`State Tax: ${pct(statePct / 100)}`}
            >
              {statePct > 3 && (
                <span className="text-white text-xs font-bold px-1 truncate">State {pct(statePct / 100)}</span>
              )}
            </div>
          )}
          {cityPct > 0 && (
            <div
              className="bg-teal-500 flex items-center justify-center transition-all duration-300"
              style={{ width: `${cityPct}%` }}
              title={`City Tax: ${pct(cityPct / 100)}`}
            >
              {cityPct > 3 && (
                <span className="text-white text-xs font-bold px-1 truncate">City {pct(cityPct / 100)}</span>
              )}
            </div>
          )}
          <div
            className="bg-orange-400 flex items-center justify-center transition-all duration-300"
            style={{ width: `${ficaPct}%` }}
            title={`FICA: ${pct(ficaPct / 100)}`}
          >
            {ficaPct > 5 && (
              <span className="text-white text-xs font-bold px-1 truncate">FICA {pct(ficaPct / 100)}</span>
            )}
          </div>
          <div
            className="bg-green-500 flex items-center justify-center transition-all duration-300"
            style={{ width: `${takePct}%` }}
          >
            {takePct > 10 && (
              <span className="text-white text-xs font-bold px-1 truncate">Keep {pct(takePct / 100)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-red-500 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">Federal: <strong>{fmt(tax.federalTax)}</strong></span>
          </span>
          {!noTax && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-purple-500 rounded-sm inline-block flex-shrink-0" />
              <span className="text-gray-700">State: <strong>{fmt(tax.stateTax)}</strong></span>
            </span>
          )}
          {tax.cityTax > 0 && cityConfig && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-teal-500 rounded-sm inline-block flex-shrink-0" />
              <span className="text-gray-700">City ({cityConfig.name}): <strong>{fmt(tax.cityTax)}</strong></span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-orange-400 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">FICA: <strong>{fmt(tax.ficaTotal)}</strong></span>
          </span>
          {noTax && (
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-gray-200 rounded-sm inline-block flex-shrink-0" />
              <span className="text-gray-700">State Tax: <strong className="text-green-700">$0</strong></span>
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 bg-green-500 rounded-sm inline-block flex-shrink-0" />
            <span className="text-gray-700">Take-Home: <strong className="text-green-700">{fmt(tax.takeHome)}</strong></span>
          </span>
        </div>
      </section>

      {/* Main Grid */}
      <div className="grid lg:grid-cols-[1fr_300px] gap-8 items-start">

        {/* Left Column */}
        <div className="space-y-10">

          {/* Tax Breakdown Table */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {TAX_YEAR} Tax Breakdown for ${amtFmt} in {stateName}
            </h2>
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="tax-table">
                <thead>
                  <tr><th>Tax</th><th>Rate</th><th>Annual Amount</th></tr>
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
                        After ${tax.standardDeduction.toLocaleString()} std. deduction → {fmt(tax.federalTaxable)} taxable
                      </span>
                    </td>
                    <td className="text-gray-600 tabular-nums">{pct(tax.effectiveFederalRate)}</td>
                    <td className="text-red-600 font-semibold tabular-nums">−{fmt(tax.federalTax)}</td>
                  </tr>
                  <tr className="bg-gray-50">
                    <td className="pl-8 text-sm text-gray-500">
                      Social Security (6.2%{tax.gross > 184_500 ? " · capped at $184,500" : ""})
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
                      <td className="pl-8 text-sm text-gray-500">Additional Medicare (0.9% over $200K)</td>
                      <td className="text-gray-400 text-sm">0.90%</td>
                      <td className="text-red-500 text-sm tabular-nums">−{fmt(tax.additionalMedicare)}</td>
                    </tr>
                  )}
                  {noTax ? (
                    <tr className="bg-green-50">
                      <td className="font-medium text-gray-700">
                        {stateName} State Income Tax
                        <span className="ml-2 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-semibold">No State Tax!</span>
                      </td>
                      <td className="text-green-700 font-medium">0%</td>
                      <td className="text-green-700 font-semibold">$0</td>
                    </tr>
                  ) : (
                    <tr className="bg-purple-50">
                      <td className="font-medium text-gray-700">
                        {stateName} State Income Tax
                        <span className="block text-xs text-gray-400 mt-0.5">
                          Top rate: {topRateDisplay} · {stateConfig.deduction > 0 ? `$${stateConfig.deduction.toLocaleString()} state deduction` : "No standard deduction"}
                          {stateConfig.additionalRate ? ` + ${pct(stateConfig.additionalRate)} additional (SDI/local)` : ""}
                        </span>
                      </td>
                      <td className="text-purple-700 tabular-nums">{pct(tax.stateTax / tax.gross)}</td>
                      <td className="text-purple-700 font-semibold tabular-nums">−{fmt(tax.stateTax)}</td>
                    </tr>
                  )}
                  {tax.cityTax > 0 && cityConfig && (
                    <tr className="bg-teal-50">
                      <td className="font-medium text-gray-700">
                        {cityConfig.name} City Tax
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {cityConfig.description}
                        </span>
                      </td>
                      <td className="text-teal-700 tabular-nums">{pct(tax.cityTax / tax.gross)}</td>
                      <td className="text-teal-700 font-semibold tabular-nums">−{fmt(tax.cityTax)}</td>
                    </tr>
                  )}
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
            <p className="text-xs text-gray-400 mt-2">
              Calculations based on {TAX_YEAR} IRS brackets and official state tax tables. {filing === "married" ? "Married filing jointly" : "Single filer"}, standard deduction applied. State tax is estimated — actual amounts vary by credits and deductions.
            </p>
          </section>

          {/* How We Calculate — Collapsible */}
          <section className="border border-gray-200 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowHowWeCalc(!showHowWeCalc)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
              aria-expanded={showHowWeCalc}
            >
              <span className="font-semibold text-gray-800 text-sm">How We Calculate Your Take-Home Pay</span>
              <span className="text-gray-400 text-lg ml-2 flex-shrink-0">{showHowWeCalc ? "▲" : "▼"}</span>
            </button>
            {showHowWeCalc && (
              <div className="px-5 pb-5 border-t border-gray-100 space-y-4 text-sm text-gray-600 leading-relaxed">
                <div className="pt-4 grid sm:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">1. Federal Income Tax</p>
                    <p>
                      We apply the {TAX_YEAR} IRS progressive brackets to your federal taxable income
                      (gross − ${tax.standardDeduction.toLocaleString()} standard deduction = {fmt(tax.federalTaxable)}).
                      Each bracket applies only to the slice of income within it (10% → 12% → 22% → ... up to 37%).
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">2. Social Security (OASDI)</p>
                    <p>
                      6.2% on all wages up to the {TAX_YEAR} wage base of $184,500 (per SSA COLA 2026).
                      Your SS tax: {fmt(tax.socialSecurity)}.
                    </p>
                  </div>
                  <div className="bg-orange-50 rounded-xl p-4">
                    <p className="font-bold text-gray-900 mb-1">3. Medicare (HI)</p>
                    <p>
                      1.45% on all wages with no cap.
                      {tax.additionalMedicare > 0
                        ? ` Plus 0.9% on wages over $200,000 — additional Medicare: ${fmt(tax.additionalMedicare)}.`
                        : " No additional Medicare for wages under $200,000."
                      }
                      {" "}Your Medicare: {fmt(tax.medicare)}.
                    </p>
                  </div>
                  <div className={`rounded-xl p-4 ${noTax ? "bg-green-50" : "bg-purple-50"}`}>
                    <p className="font-bold text-gray-900 mb-1">4. {stateName} State Income Tax</p>
                    <p>
                      {noTax
                        ? `${stateName} levies zero state income tax — one of only 9 states in the US. Your state tax: $0.`
                        : stateConfig.flat !== undefined
                          ? `${stateName} has a flat ${topRateDisplay} income tax. Applied to taxable income after a $${stateConfig.deduction.toLocaleString()} state deduction. Your state tax: ${fmt(tax.stateTax)}.`
                          : `${stateName} uses progressive brackets up to ${topRateDisplay}, applied to income after a $${stateConfig.deduction.toLocaleString()} state deduction. Your estimated state tax: ${fmt(tax.stateTax)}.`
                      }
                      {stateConfig.additionalRate ? ` Includes ${pct(stateConfig.additionalRate)} additional tax (SDI/local).` : ""}
                    </p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="font-bold text-gray-900 mb-1">Filing Assumptions</p>
                  <ul className="list-disc list-inside space-y-1 text-xs text-gray-500">
                    <li>Filing status: {filing === "married" ? "Married Filing Jointly" : "Single filer"}</li>
                    <li>Federal standard deduction: ${tax.standardDeduction.toLocaleString()} ({TAX_YEAR}, IRS Rev. Proc. 2025-32)</li>
                    <li>No additional credits, itemized deductions, or pre-tax contributions assumed</li>
                    <li>Social Security wage base: $184,500 ({TAX_YEAR}, SSA COLA 2026 announcement)</li>
                    <li>State tax figures are estimates — consult a CPA for exact liability</li>
                    <li>Employer pays matching FICA — figures reflect employee share only</li>
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
                    <tr key={label} className={label === "Monthly" ? "row-highlight" : ""}>
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
              Hourly assumes {annualHours.toLocaleString()} hrs/year ({parseInt(hoursPerWeek) || 40} hrs/week × 52 weeks). Daily assumes 260 working days/year.
            </p>
          </section>

          {/* Ad */}
          <div className="ad-slot ad-in-content" />

          {/* State Tax / Relocation Section */}
          {noTax ? (
            <section className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">📍</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {stateName} Relocation Savings
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Moving from a high-tax state? On a ${amtFmt} salary, here&apos;s how much more you&apos;d keep in {stateName}:
                  </p>
                  <div className="grid sm:grid-cols-3 gap-3 mb-3">
                    {[
                      { from: "California", rate: 0.093, topRate: "13.3%" },
                      { from: "New York",   rate: 0.048, topRate: "10.9%" },
                      { from: "Illinois",   rate: 0.0495,topRate: "4.95% flat" },
                    ].map(({ from, rate, topRate }) => {
                      const saving = Math.round(amount * rate);
                      return (
                        <div key={from} className="bg-white border border-amber-200 rounded-xl p-4 text-center">
                          <p className="text-xs text-gray-500 mb-0.5">vs. {from}</p>
                          <p className="text-xs text-gray-400 mb-2">({topRate} top rate)</p>
                          <p className="text-green-700 font-black text-xl">+${saving.toLocaleString()}</p>
                          <p className="text-gray-500 text-xs mt-0.5">per year</p>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">* Estimated state income tax savings only. Other costs vary.</p>
                </div>
              </div>
            </section>
          ) : (
            <section className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <div className="text-3xl flex-shrink-0">🔄</div>
                <div className="flex-1">
                  <h2 className="text-lg font-bold text-gray-900 mb-1">
                    {stateName} vs. No-Tax States
                  </h2>
                  <p className="text-gray-600 text-sm mb-4">
                    Workers in no-tax states like Texas or Florida keep more of their paycheck. On ${amtFmt}:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3 mb-3">
                    {[
                      { state: "Texas",   slug: "texas"   },
                      { state: "Florida", slug: "florida" },
                    ].map(({ state: s, slug }) => {
                      const saving = texasTakeHome ? texasTakeHome - tax.takeHome : 0;
                      return (
                        <div key={s} className="bg-white border border-blue-200 rounded-xl p-4">
                          <p className="text-sm font-semibold text-gray-800 mb-1">{s} (0% state tax)</p>
                          <p className="text-green-700 font-black text-lg tabular-nums">
                            {texasTakeHome ? fmt(texasTakeHome) : "—"}/yr
                          </p>
                          {saving > 0 && (
                            <p className="text-xs text-blue-600 mt-1">
                              +${saving.toLocaleString()}/yr more than {stateName}
                            </p>
                          )}
                          <Link
                            href={`/salary/${Math.round(amount / 1_000) * 1_000}-salary-after-tax-${slug}`}
                            className="text-xs text-blue-600 hover:underline mt-1 block"
                          >
                            See {s} breakdown →
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                  <p className="text-xs text-gray-400">* No-tax states have the same federal/FICA burden. State savings are approximate.</p>
                </div>
              </div>
            </section>
          )}

          {/* Federal Tax Brackets */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {TAX_YEAR} Federal Tax Brackets (Single Filer)
            </h2>
            <div className="rounded-xl border border-gray-200 overflow-hidden shadow-sm">
              <table className="tax-table">
                <thead>
                  <tr><th>Bracket</th><th>Taxable Income Range</th><th>Rate</th></tr>
                </thead>
                <tbody>
                  {BRACKET_LABELS.map((label, i) => {
                    const bracketMin = FEDERAL_BRACKETS_2026[i].min;
                    const bracketRate = FEDERAL_BRACKETS_2026[i].rate;
                    const applies = tax.federalTaxable > bracketMin;
                    const isTop = applies && bracketRate === tax.marginalRate;
                    return (
                      <tr
                        key={label}
                        className={isTop ? "bg-blue-50 font-semibold" : applies ? "" : "opacity-40"}
                      >
                        <td>{isTop && <span className="text-blue-700 text-xs font-bold">← Your top bracket</span>}</td>
                        <td>{label}</td>
                        <td className="font-semibold">{Math.round(bracketRate * 100)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 mt-2">
              After ${tax.standardDeduction.toLocaleString()} standard deduction, your federal taxable income is {fmt(tax.federalTaxable)}.
            </p>
          </section>

          {/* State Comparison Teaser */}
          <section className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-5">
            <h2 className="text-lg font-bold text-gray-900 mb-1">
              How Does ${amtFmt} Compare Across States?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              The same gross salary delivers very different take-home pay depending on where you live.
            </p>
            <div className="grid sm:grid-cols-2 gap-3 mb-3">
              {[
                { s: "Texas",       slug: "texas",      stateTaxEff: 0      },
                { s: "Florida",     slug: "florida",    stateTaxEff: 0      },
                { s: "New York",    slug: "new-york",   stateTaxEff: 0.048  },
                { s: "California",  slug: "california", stateTaxEff: 0.093  },
              ]
                .filter((r) => r.slug !== stateSlug)
                .slice(0, 4)
                .map(({ s, slug, stateTaxEff }) => {
                  const estTakeHome = tax.gross - tax.federalTax - tax.ficaTotal - Math.round(amount * stateTaxEff);
                  return (
                    <div key={s} className="bg-white rounded-xl p-3 flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{s}</p>
                        <p className="text-xs text-gray-400">
                          {stateTaxEff === 0 ? "No state tax" : `~${pct(stateTaxEff)} eff. state tax`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black text-lg tabular-nums text-gray-800">{fmt(estTakeHome)}</p>
                        <Link
                          href={`/salary/${Math.round(amount / 1_000) * 1_000}-salary-after-tax-${slug}`}
                          className="text-xs text-blue-600 hover:underline"
                        >
                          See breakdown →
                        </Link>
                      </div>
                    </div>
                  );
                })}
            </div>
            <p className="text-xs text-gray-400">* State estimates are approximate. Actual amounts vary by local taxes and deductions.</p>
          </section>

          {/* FAQ */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <div className="space-y-4">
              {faqItems.map(({ q, a }) => (
                <div key={q} className="border border-gray-200 rounded-xl p-5 hover:border-blue-200 transition-colors">
                  <h3 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{q}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Related Salaries */}
          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              More {stateName} Salary Calculations
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                30_000, 40_000, 50_000, 60_000, 70_000, 75_000, 80_000, 85_000,
                90_000, 95_000, 100_000, 110_000, 120_000, 125_000, 150_000, 200_000,
                250_000, 300_000, 400_000, 500_000,
              ]
                .filter((a) => a !== amount)
                .slice(0, 16)
                .map((a) => {
                  const t = calculateTax(stateConfig, a);
                  return (
                    <Link
                      key={a}
                      href={`/salary/${a}-salary-after-tax-${stateSlug}`}
                      className="bg-white border border-gray-200 rounded-xl p-3 text-center hover:border-blue-300 hover:shadow-md transition-all group"
                    >
                      <p className="font-bold text-gray-900 text-sm group-hover:text-blue-700">${a.toLocaleString()}</p>
                      <p className="text-green-600 text-xs mt-0.5 font-medium tabular-nums">{fmt(t.takeHome)}/yr</p>
                    </Link>
                  );
                })}
            </div>
          </section>

        </div>

        {/* Sidebar */}
        <aside className="space-y-5 lg:sticky lg:top-20">

          <div className="ad-slot ad-rectangle" />

          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Calculate a Different Salary</h3>
            <Link
              href="/"
              className="flex items-center justify-center gap-2 w-full bg-blue-700 text-white rounded-xl py-3 font-semibold text-sm hover:bg-blue-800 transition-colors"
            >
              Use Full Calculator →
            </Link>
            <Link
              href={`/${stateSlug}`}
              className="flex items-center justify-center gap-2 w-full mt-2 border border-gray-200 text-gray-700 rounded-xl py-2.5 text-sm hover:bg-gray-50 transition-colors"
            >
              {stateName} Salary Hub →
            </Link>
          </div>

          {/* Quick Stats */}
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
            <h3 className="font-bold text-gray-900 mb-4 text-sm uppercase tracking-wide">
              Quick Stats — ${amtFmt}
            </h3>
            <div className="space-y-3">
              {[
                { label: "Take-Home (Annual)",    value: fmt(tax.takeHome),         green: true  },
                { label: "Monthly Take-Home",     value: fmt(monthly),              green: true  },
                { label: "Bi-Weekly",             value: fmt(biweekly),             green: true  },
                { label: "Hourly (after tax)",    value: fmt(hourly),               green: true  },
                { label: "Federal Tax",           value: fmt(tax.federalTax),       red: true    },
                { label: "FICA Total",            value: fmt(tax.ficaTotal),        red: true    },
                { label: `${stateName} State Tax`,value: noTax ? "$0" : fmt(tax.stateTax), green: noTax, red: !noTax },
                { label: "Effective Rate",        value: pct(tax.effectiveTotalRate)            },
                { label: "Fed Marginal Rate",     value: pct(tax.marginalRate)                  },
              ].map(({ label, value, green, red }) => (
                <div key={label} className="flex items-center justify-between text-sm border-b border-gray-100 pb-2 last:border-0 last:pb-0">
                  <span className="text-gray-600">{label}</span>
                  <span className={green ? "font-bold text-green-700 tabular-nums" : red ? "font-semibold text-red-600 tabular-nums" : "font-semibold text-gray-900 tabular-nums"}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Nearby Salaries */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Nearby Salaries in {stateName}</h3>
            <div className="space-y-1">
              {nearbyLinks.map((a) => {
                const t = calculateTax(stateConfig, a);
                return (
                  <Link
                    key={a}
                    href={`/salary/${a}-salary-after-tax-${stateSlug}`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 hover:text-blue-700 transition-colors"
                  >
                    <span>${a.toLocaleString()}/yr</span>
                    <span className="text-gray-400 text-xs tabular-nums">→ {fmt(t.takeHome)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Popular Salaries */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-3 text-sm">Popular {stateName} Salaries</h3>
            <div className="space-y-1">
              {popularLinks.slice(0, 8).map((a) => {
                const t = calculateTax(stateConfig, a);
                return (
                  <Link
                    key={a}
                    href={`/salary/${a}-salary-after-tax-${stateSlug}`}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-gray-50 last:border-0 hover:text-blue-700 transition-colors"
                  >
                    <span>${a.toLocaleString()}/yr</span>
                    <span className="text-green-600 text-xs font-medium tabular-nums">{fmt(t.takeHome)}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-xs text-gray-600 leading-relaxed">
            <strong className="text-gray-800">Disclaimer:</strong> These calculations are estimates based on {TAX_YEAR} IRS and state tax tables for a single filer. Actual taxes vary. State tax is approximate. Consult a CPA for personalized advice.
          </div>

        </aside>
      </div>

      <div className="ad-slot ad-bottom mt-12" />

    </main>
  );
}
