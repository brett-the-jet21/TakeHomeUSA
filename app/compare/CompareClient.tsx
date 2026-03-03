"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";

function fmtInput(val: string): string {
  const digits = val.replace(/[^\d]/g, "");
  if (!digits) return "";
  return Number(digits).toLocaleString("en-US");
}

const COMPARE_SALARIES = [50_000, 75_000, 100_000, 125_000, 150_000, 200_000];

const STATE_OPTIONS = ALL_STATE_CONFIGS.map((s) => ({
  value: s.slug,
  label: s.name,
  noTax: s.noTax,
}));

// Bar chart colors per slot
const SLOT_COLORS = ["#3b82f6", "#ef4444", "#10b981"];
const SLOT_BORDER = ["border-blue-400", "border-red-400", "border-emerald-400"];
const SLOT_BG     = ["bg-blue-50", "bg-red-50", "bg-emerald-50"];
const SLOT_LABEL  = ["text-blue-700", "text-red-700", "text-emerald-700"];
const SLOT_DOT    = ["bg-blue-500", "bg-red-500", "bg-emerald-500"];

const FILING_OPTIONS: { value: "single" | "married"; label: string }[] = [
  { value: "single",  label: "Single" },
  { value: "married", label: "Married Filing Jointly" },
];

export default function CompareClient() {
  const [states, setStates] = useState<string[]>(["texas", "california", "new-york"]);
  const [filing, setFiling] = useState<"single" | "married">("single");

  // Salary: free-text input + debounced numeric value
  const [salaryInput, setSalaryInput] = useState("100,000");
  const [focusSalary, setFocusSalary] = useState(100_000);

  // Debounce: update focusSalary 300ms after the user stops typing
  useEffect(() => {
    const n = Number(salaryInput.replace(/[^\d]/g, ""));
    if (n >= 1_000 && n <= 999_999_999_999) {
      const t = setTimeout(() => setFocusSalary(n), 300);
      return () => clearTimeout(t);
    }
  }, [salaryInput]);

  const numSlots = 3;

  function setSlot(idx: number, slug: string) {
    setStates((prev) => {
      const next = [...prev];
      next[idx] = slug;
      return next;
    });
  }

  // Pre-computed results for the table (preset salary levels only)
  const results = useMemo(() =>
    states.map((slug) => {
      const cfg = STATE_BY_SLUG.get(slug);
      if (!cfg) return null;
      return COMPARE_SALARIES.map((sal) =>
        calculateTax(cfg, sal, { filingStatus: filing })
      );
    }),
    [states, filing]
  );

  // Focus results: computed directly for any focusSalary (not limited to presets)
  const focusResults = useMemo(() =>
    states.map((slug) => {
      const cfg = STATE_BY_SLUG.get(slug);
      if (!cfg) return null;
      return calculateTax(cfg, focusSalary, { filingStatus: filing });
    }),
    [states, filing, focusSalary]
  );

  const maxTakeHome = Math.max(...focusResults.map((r) => r?.takeHome ?? 0), 1);
  const activeCfgs = states.map((s) => STATE_BY_SLUG.get(s));

  // Current parsed input value — used to highlight the matching preset button
  const inputNum = Number(salaryInput.replace(/[^\d]/g, ""));

  return (
    <div className="container-page pb-16">
      {/* Header */}
      <div className="mb-8 pt-6">
        <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wider">
          Interactive Tool · {TAX_YEAR} Brackets
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
          State Income Tax Comparison
        </h1>
        <p className="text-gray-500 text-base max-w-2xl">
          Pick up to 3 states and see exactly how your take-home pay changes.
          Perfect for relocation decisions.
        </p>
      </div>

      {/* Controls */}
      <div className="compare-card bg-white border border-gray-200 rounded-2xl p-5 mb-8 shadow-sm">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* State selectors */}
          {Array.from({ length: numSlots }).map((_, i) => (
            <div key={i}>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                <span
                  className={`inline-block w-2 h-2 rounded-full mr-1.5 ${SLOT_DOT[i]}`}
                />
                State {i + 1}
              </label>
              <select
                value={states[i] ?? ""}
                onChange={(e) => setSlot(i, e.target.value)}
                className={`w-full border-2 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all ${SLOT_BORDER[i]}`}
              >
                {STATE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}{o.noTax ? " ★" : ""}
                  </option>
                ))}
              </select>
            </div>
          ))}

          {/* Filing status */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
              Filing Status
            </label>
            <select
              value={filing}
              onChange={(e) => setFiling(e.target.value as "single" | "married")}
              className="w-full border-2 border-gray-200 rounded-xl px-3 py-2.5 text-sm font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
            >
              {FILING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-3">★ = no state income tax</p>
      </div>

      {/* Bar Chart + custom salary input */}
      <div className="compare-card bg-white border border-gray-200 rounded-2xl p-6 mb-8 shadow-sm">

        {/* ── Salary input ────────────────────────────────────────── */}
        <div className="mb-6">
          <label className="block">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-2">
              Annual Salary
            </span>
            <div className="relative mb-3">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold pointer-events-none">
                $
              </span>
              <input
                inputMode="numeric"
                value={salaryInput}
                onChange={(e) => setSalaryInput(fmtInput(e.target.value))}
                placeholder="100,000"
                aria-label="Annual salary for comparison"
                className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
              />
            </div>
          </label>

          {/* Quick-fill preset buttons */}
          <div className="flex flex-wrap gap-2">
            {COMPARE_SALARIES.map((sal) => (
              <button
                key={sal}
                type="button"
                onClick={() => {
                  setSalaryInput(fmtInput(String(sal)));
                  setFocusSalary(sal);
                }}
                className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  sal === inputNum
                    ? "bg-blue-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                ${(sal / 1_000).toFixed(0)}K
              </button>
            ))}
          </div>
        </div>

        {/* ── Bars ─────────────────────────────────────────────────── */}
        <div className="space-y-5">
          {focusResults.map((res, i) => {
            const cfg = activeCfgs[i];
            if (!cfg || !res) return null;
            const barPct = maxTakeHome > 0 ? (res.takeHome / maxTakeHome) * 100 : 0;
            return (
              <div key={i}>
                <div className="flex justify-between items-end mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-3 h-3 rounded-full ${SLOT_DOT[i]} flex-shrink-0`} />
                    <span className="font-semibold text-gray-800">{cfg.name}</span>
                    {cfg.noTax && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-semibold">No state tax</span>
                    )}
                  </div>
                  <div className="text-right">
                    <span className="font-black text-gray-900 text-lg tabular-nums">{fmt(res.takeHome)}/yr</span>
                    <span className="text-gray-400 text-xs ml-2">{fmt(res.takeHome / 12)}/mo</span>
                  </div>
                </div>
                <div className="h-8 bg-gray-100 rounded-lg overflow-hidden">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center justify-end pr-2"
                    style={{ width: `${barPct}%`, backgroundColor: SLOT_COLORS[i] }}
                  >
                    {barPct > 25 && (
                      <span className="text-white text-xs font-bold">
                        {pct(res.takeHome / focusSalary)} kept
                      </span>
                    )}
                  </div>
                </div>
                <div className="compare-detail-row flex gap-4 text-xs text-gray-500 mt-1">
                  <span>Fed: <strong className="text-gray-700">{fmt(res.federalTax)}</strong></span>
                  <span>FICA: <strong className="text-gray-700">{fmt(res.ficaTotal)}</strong></span>
                  {!cfg.noTax && (
                    <span>State: <strong className="text-gray-700">{fmt(res.stateTax)}</strong></span>
                  )}
                  <span>Effective: <strong className="text-gray-700">{pct(res.effectiveTotalRate)}</strong></span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Savings callout */}
        {focusResults[0] && focusResults[1] && (
          <div className="mt-6 pt-5 border-t border-gray-100">
            <p className="text-sm text-gray-500">
              At ${focusSalary.toLocaleString()} salary:{" "}
              {focusResults.map((res, i) => {
                if (i === 0 || !res || !focusResults[0]) return null;
                const diff = focusResults[0].takeHome - res.takeHome;
                const diffAbs = Math.abs(Math.round(diff));
                const moreLess = diff > 0 ? "more" : "less";
                const stateName0 = activeCfgs[0]?.name ?? "";
                const stateNameI = activeCfgs[i]?.name ?? "";
                return (
                  <span key={i} className="mr-4">
                    <strong className={diff > 0 ? "text-green-700" : "text-red-700"}>
                      {diff > 0 ? "+" : "−"}${diffAbs.toLocaleString()}/yr
                    </strong>{" "}
                    {stateName0} {moreLess} than {stateNameI}.{" "}
                  </span>
                );
              })}
            </p>
          </div>
        )}
      </div>

      {/* Full Comparison Table */}
      <div className="compare-table-card bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-8">
        <div className="compare-table-header px-6 py-4 border-b border-gray-100">
          <h2 className="font-extrabold text-gray-900">Full Take-Home Comparison — All Salary Levels</h2>
          <p className="text-sm text-gray-500 mt-0.5">{TAX_YEAR} · {filing === "married" ? "Married filing jointly" : "Single filer"} · Standard deduction</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left px-5 py-3 font-bold text-gray-600 text-xs uppercase tracking-wide">
                  Gross Salary
                </th>
                {activeCfgs.map((cfg, i) => cfg && (
                  <th key={i} className="text-right px-5 py-3 font-bold text-xs uppercase tracking-wide">
                    <span className={`flex items-center justify-end gap-1.5 ${SLOT_LABEL[i]}`}>
                      <span className={`w-2 h-2 rounded-full ${SLOT_DOT[i]}`} />
                      {cfg.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE_SALARIES.map((sal, rowIdx) => (
                <tr
                  key={sal}
                  className={`border-b border-gray-100 ${sal === focusSalary ? "bg-blue-50" : rowIdx % 2 === 0 ? "" : "bg-gray-50/50"}`}
                  onClick={() => { setFocusSalary(sal); setSalaryInput(fmtInput(String(sal))); }}
                  style={{ cursor: "pointer" }}
                >
                  <td className="px-5 py-3 font-semibold text-gray-900">
                    ${sal.toLocaleString()}
                    {sal === focusSalary && (
                      <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Selected</span>
                    )}
                  </td>
                  {results.map((stateResults, i) => {
                    const res = stateResults?.[rowIdx];
                    const cfg = activeCfgs[i];
                    if (!cfg || !res) return <td key={i} />;
                    return (
                      <td key={i} className="px-5 py-3 text-right">
                        <p className={`font-bold tabular-nums ${SLOT_LABEL[i]}`}>{fmt(res.takeHome)}</p>
                        <p className="text-xs text-gray-400">{pct(res.effectiveTotalRate)} eff.</p>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Breakdown for Focus Salary */}
      <div className="compare-detail-section mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-4">
          Detailed Breakdown at ${focusSalary.toLocaleString()}
        </h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {focusResults.map((res, i) => {
            const cfg = activeCfgs[i];
            if (!cfg || !res) return null;
            return (
              <div key={i} className={`compare-detail-card rounded-2xl border-2 p-5 ${SLOT_BORDER[i]} ${SLOT_BG[i]}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className={`w-3 h-3 rounded-full ${SLOT_DOT[i]}`} />
                  <h3 className={`font-extrabold text-base ${SLOT_LABEL[i]}`}>{cfg.name}</h3>
                </div>
                <div className="space-y-2 text-sm">
                  {[
                    { label: "Gross Salary",         val: fmt(res.gross),                     bold: false },
                    { label: "Federal Income Tax",    val: `−${fmt(res.federalTax)}`,          red: true   },
                    { label: "Social Security",       val: `−${fmt(res.socialSecurity)}`,      red: true   },
                    { label: "Medicare",              val: `−${fmt(res.medicare)}`,             red: true   },
                    { label: `${cfg.name} State Tax`, val: cfg.noTax ? "$0" : `−${fmt(res.stateTax)}`, green: cfg.noTax, red: !cfg.noTax },
                    { label: "Total Tax",             val: `−${fmt(res.totalTax)}`,            bold: true, red: true  },
                    { label: "Take-Home Pay",         val: fmt(res.takeHome),                  bold: true, green: true },
                  ].map(({ label, val, bold, red, green }) => (
                    <div key={label} className="flex justify-between border-b border-gray-200/60 pb-1.5 last:border-0">
                      <span className={`text-gray-600 ${bold ? "font-bold" : ""}`}>{label}</span>
                      <span className={`tabular-nums ${bold ? "font-bold" : "font-medium"} ${green ? "text-green-700" : red ? "text-red-600" : "text-gray-800"}`}>
                        {val}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200/60 space-y-1 text-xs text-gray-500">
                  <div className="flex justify-between">
                    <span>Effective Rate</span>
                    <span className="font-semibold text-gray-700">{pct(res.effectiveTotalRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Marginal Rate</span>
                    <span className="font-semibold text-gray-700">{pct(res.marginalRate)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monthly Take-Home</span>
                    <span className="font-semibold text-gray-700">{fmt(res.takeHome / 12)}</span>
                  </div>
                </div>
                <div className="mt-4">
                  <Link
                    href={`/salary/${focusSalary}-salary-after-tax-${cfg.slug}`}
                    className="block text-center text-xs font-bold py-2 rounded-xl transition-colors text-white"
                    style={{ backgroundColor: SLOT_COLORS[i] }}
                  >
                    Full {cfg.name} Breakdown →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FAQ */}
      <div className="compare-card bg-gray-50 border border-gray-200 rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-extrabold text-gray-900 mb-5">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            {
              q: "Which US state has the lowest income tax?",
              a: "Nine states have no state income tax at all: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Of states with income tax, North Dakota (2.5% flat) and Arizona (2.5% flat) have among the lowest rates.",
            },
            {
              q: "How much more do you keep in Texas vs California?",
              a: `On a $100,000 salary, Texas residents keep approximately $7,420 more per year than California residents. On $200,000, the gap widens to roughly $18,000+. The exact difference depends on your specific income and deductions.`,
            },
            {
              q: "Is it worth relocating to a no-tax state?",
              a: "The tax savings can be substantial — $5,000–$20,000+ per year for high earners. However, factor in cost of living differences (housing is typically higher in no-tax states like Texas), and any other state-specific taxes (e.g., Washington has no income tax but has high sales and property taxes).",
            },
            {
              q: "Does this comparison include all taxes?",
              a: "The comparison includes federal income tax, FICA (Social Security and Medicare), and state income tax. It does not include sales tax, property tax, estate tax, or local/city income taxes, which vary widely.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="border border-gray-200 rounded-xl p-4 bg-white">
              <h3 className="font-semibold text-gray-900 mb-1.5 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-block bg-blue-700 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-800 transition-colors mr-3"
        >
          Use Full Calculator →
        </Link>
        <Link
          href="/states"
          className="inline-block border border-gray-300 text-gray-700 font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-50 transition-colors"
        >
          All 50 States →
        </Link>
      </div>
    </div>
  );
}
