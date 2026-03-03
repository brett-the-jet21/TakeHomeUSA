"use client";

import { useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";

const DEFAULT_STATE_SLUGS = [
  "texas",
  "florida",
  "nevada",
  "washington",
  "california",
  "new-york",
  "illinois",
  "colorado",
  "virginia",
  "oregon",
];

const NO_TAX_SLUGS = ALL_STATE_CONFIGS.filter((s) => s.noTax).map((s) => s.slug);

export default function CompareClient() {
  const [salary, setSalary] = useState("100000");
  const [filing, setFiling] = useState<"single" | "married">("single");
  const [selectedSlugs, setSelectedSlugs] = useState<string[]>(DEFAULT_STATE_SLUGS);
  const [addSlug, setAddSlug] = useState("");

  const cleanSalary = useMemo(() => {
    const n = Number(salary.replace(/[^\d]/g, ""));
    return n >= 1_000 && n <= 100_000_000 ? n : 0;
  }, [salary]);

  const rows = useMemo(() => {
    if (!cleanSalary) return [];
    return selectedSlugs
      .flatMap((slug) => {
        const cfg = STATE_BY_SLUG.get(slug);
        if (!cfg) return [];
        const tax = calculateTax(cfg, cleanSalary, { filingStatus: filing });
        return [{ slug, cfg, tax }];
      })
      .sort((a, b) => b.tax.takeHome - a.tax.takeHome);
  }, [cleanSalary, selectedSlugs, filing]);

  const maxTakeHome = rows.length > 0 ? Math.max(...rows.map((r) => r.tax.takeHome)) : 1;

  const availableToAdd = ALL_STATE_CONFIGS.filter((s) => !selectedSlugs.includes(s.slug));

  const removeState = useCallback((slug: string) => {
    setSelectedSlugs((prev) => prev.filter((s) => s !== slug));
  }, []);

  const handleAddSlugChange = useCallback(
    (slug: string) => {
      setAddSlug("");
      if (!slug || selectedSlugs.includes(slug)) return;
      setSelectedSlugs((prev) => [...prev, slug]);
    },
    [selectedSlugs]
  );

  const resetToDefaults = useCallback(() => {
    setSelectedSlugs(DEFAULT_STATE_SLUGS);
  }, []);

  const addAllNoTax = useCallback(() => {
    setSelectedSlugs((prev) => {
      const toAdd = NO_TAX_SLUGS.filter((s) => !prev.includes(s));
      return [...prev, ...toAdd];
    });
  }, []);

  const amtLabel = cleanSalary ? `$${cleanSalary.toLocaleString("en-US")}` : "—";
  const filingLabel = filing === "married" ? "Married filing jointly" : "Single filer";

  return (
    <>
      {/* ── Hero / Salary Input ──────────────────────────────────────────────── */}
      <section
        className="text-white py-10"
        style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)" }}
      >
        <div className="container-page">
          {/* Breadcrumb */}
          <nav className="text-blue-300 text-sm mb-5 flex items-center gap-2">
            <Link href="/" className="hover:text-white transition-colors">
              Home
            </Link>
            <span>/</span>
            <span className="text-white">Compare States</span>
          </nav>

          <h1 className="text-3xl sm:text-4xl font-extrabold mb-2">
            State Tax Comparison
          </h1>
          <p className="text-blue-200 mb-7 max-w-xl">
            Enter any salary to instantly compare take-home pay across states.{" "}
            {TAX_YEAR} federal &amp; state brackets.
          </p>

          {/* Input card */}
          <div className="bg-white rounded-3xl shadow-2xl p-5 sm:p-7 text-gray-900 max-w-lg">
            {/* Salary input */}
            <label className="block mb-4">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Annual Gross Salary
              </span>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold pointer-events-none">
                  $
                </span>
                <input
                  inputMode="numeric"
                  value={salary}
                  onChange={(e) => setSalary(e.target.value)}
                  placeholder="100,000"
                  aria-label="Annual gross salary"
                  className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                />
              </div>
            </label>

            {/* Filing status */}
            <label className="block">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                Filing Status
              </span>
              <select
                value={filing}
                onChange={(e) => setFiling(e.target.value as "single" | "married")}
                className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
              >
                <option value="single">Single</option>
                <option value="married">Married Filing Jointly</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* ── State Selector ───────────────────────────────────────────────────── */}
      <section className="container-page mt-7">
        {/* Selected state pills */}
        <div className="mb-3">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
            States being compared ({selectedSlugs.length})
          </p>
          <div className="flex flex-wrap gap-2">
            {selectedSlugs.map((slug) => {
              const cfg = STATE_BY_SLUG.get(slug);
              if (!cfg) return null;
              return (
                <span
                  key={slug}
                  className={`inline-flex items-center gap-1 text-sm font-semibold px-3 py-1.5 rounded-full ${
                    cfg.noTax
                      ? "bg-green-100 text-green-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {cfg.name}
                  <button
                    type="button"
                    onClick={() => removeState(slug)}
                    aria-label={`Remove ${cfg.name}`}
                    className="ml-0.5 text-current opacity-50 hover:opacity-100 transition-opacity w-5 h-5 flex items-center justify-center rounded-full hover:bg-black/10"
                  >
                    ×
                  </button>
                </span>
              );
            })}
            {selectedSlugs.length === 0 && (
              <span className="text-sm text-gray-400 italic">No states selected</span>
            )}
          </div>
        </div>

        {/* Add state dropdown + utility buttons */}
        <div className="flex flex-wrap gap-3 items-center">
          <select
            value={addSlug}
            onChange={(e) => handleAddSlugChange(e.target.value)}
            disabled={availableToAdd.length === 0}
            aria-label="Add a state to compare"
            className="border-2 border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold focus:outline-none focus:border-blue-500 bg-white transition-all min-w-0 flex-1 sm:flex-none sm:w-60 disabled:opacity-40"
          >
            <option value="">+ Add a state…</option>
            <optgroup label="No State Income Tax">
              {availableToAdd
                .filter((s) => s.noTax)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — $0 state tax
                  </option>
                ))}
            </optgroup>
            <optgroup label="Flat Rate States">
              {availableToAdd
                .filter((s) => !s.noTax && s.flat !== undefined)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — {s.topRateDisplay} flat
                  </option>
                ))}
            </optgroup>
            <optgroup label="Progressive Tax States">
              {availableToAdd
                .filter((s) => !s.noTax && s.flat === undefined)
                .map((s) => (
                  <option key={s.slug} value={s.slug}>
                    {s.name} — up to {s.topRateDisplay}
                  </option>
                ))}
            </optgroup>
          </select>

          <button
            type="button"
            onClick={addAllNoTax}
            className="text-xs text-green-700 font-semibold hover:text-green-900 border border-green-300 hover:border-green-500 bg-green-50 hover:bg-green-100 px-3 py-2.5 rounded-xl transition-colors whitespace-nowrap"
          >
            + All no-tax states
          </button>

          <button
            type="button"
            onClick={resetToDefaults}
            className="text-xs text-gray-500 hover:text-gray-800 underline transition-colors py-2.5 px-1"
          >
            Reset defaults
          </button>
        </div>
      </section>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {cleanSalary > 0 && rows.length > 0 ? (
        <section className="container-page mt-6 mb-14">
          <p className="text-sm text-gray-500 mb-4">
            Take-home pay for{" "}
            <span className="font-bold text-gray-900">{amtLabel}/yr</span> across{" "}
            {rows.length} state{rows.length !== 1 ? "s" : ""} ·{" "}
            {TAX_YEAR} brackets
          </p>

          {/* ── Mobile: vertical cards ─────────────────────────────────────── */}
          <div className="flex flex-col gap-3 sm:hidden">
            {rows.map(({ slug, cfg, tax }, i) => (
              <div
                key={slug}
                className={`bg-white rounded-2xl p-4 border ${
                  i === 0 ? "border-green-300 shadow-md" : "border-gray-200"
                }`}
              >
                {/* Card header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs text-gray-400 font-bold tabular-nums">
                        #{i + 1}
                      </span>
                      <span className="font-extrabold text-gray-900 text-base">
                        {cfg.name}
                      </span>
                      {cfg.noTax ? (
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                          $0 state tax
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-gray-500">
                          up to {cfg.topRateDisplay}
                        </span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/${slug}`}
                    className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors ml-2 shrink-0"
                  >
                    View →
                  </Link>
                </div>

                {/* Take-home bar */}
                <div className="h-2 bg-gray-100 rounded-full mb-3 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      cfg.noTax ? "bg-green-400" : "bg-blue-400"
                    }`}
                    style={{ width: `${(tax.takeHome / maxTakeHome) * 100}%` }}
                  />
                </div>

                {/* Key numbers grid */}
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-gray-50 rounded-xl py-2.5 px-1">
                    <p className="text-xs text-gray-400 mb-0.5">Annual</p>
                    <p
                      className={`font-extrabold text-sm tabular-nums ${
                        cfg.noTax ? "text-green-600" : "text-blue-700"
                      }`}
                    >
                      {fmt(tax.takeHome)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl py-2.5 px-1">
                    <p className="text-xs text-gray-400 mb-0.5">Monthly</p>
                    <p className="font-bold text-sm text-gray-900 tabular-nums">
                      {fmt(tax.takeHome / 12)}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-xl py-2.5 px-1">
                    <p className="text-xs text-gray-400 mb-0.5">Eff. Rate</p>
                    <p className="font-bold text-sm text-gray-700 tabular-nums">
                      {pct(tax.effectiveTotalRate)}
                    </p>
                  </div>
                </div>

                {/* Remove button */}
                <button
                  type="button"
                  onClick={() => removeState(slug)}
                  className="w-full text-xs text-gray-300 hover:text-red-400 transition-colors pt-2.5 pb-0.5 border-t border-gray-100"
                >
                  Remove from comparison
                </button>
              </div>
            ))}
          </div>

          {/* ── Desktop: table ─────────────────────────────────────────────── */}
          <div className="hidden sm:block overflow-x-auto rounded-2xl border border-gray-200 shadow-sm">
            <table className="tax-table">
              <thead>
                <tr>
                  <th className="w-8 text-center">#</th>
                  <th>State</th>
                  <th>State Tax</th>
                  <th>Take-Home / Year</th>
                  <th>Monthly</th>
                  <th>Bi-Weekly</th>
                  <th>Eff. Rate</th>
                  <th>State Tax $</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {rows.map(({ slug, cfg, tax }, i) => (
                  <tr key={slug} className={i === 0 ? "row-highlight" : ""}>
                    {/* Rank */}
                    <td className="text-center text-gray-400 text-xs font-bold">
                      {i + 1}
                    </td>

                    {/* State name + mini bar */}
                    <td>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-gray-900">{cfg.name}</span>
                          {cfg.noTax && (
                            <span className="text-xs font-bold bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full">
                              $0
                            </span>
                          )}
                        </div>
                        <div className="h-1.5 w-24 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              cfg.noTax ? "bg-green-400" : "bg-blue-400"
                            }`}
                            style={{
                              width: `${(tax.takeHome / maxTakeHome) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* State tax rate label */}
                    <td>
                      <span
                        className={`font-semibold ${
                          cfg.noTax ? "text-green-700" : "text-purple-700"
                        }`}
                      >
                        {cfg.noTax ? "None" : `up to ${cfg.topRateDisplay}`}
                      </span>
                    </td>

                    {/* Take-home year */}
                    <td>
                      <span
                        className={`font-black tabular-nums ${
                          cfg.noTax ? "text-green-700" : "text-blue-700"
                        }`}
                      >
                        {fmt(tax.takeHome)}
                      </span>
                    </td>

                    {/* Monthly */}
                    <td className="font-semibold text-gray-700 tabular-nums">
                      {fmt(tax.takeHome / 12)}
                    </td>

                    {/* Bi-weekly */}
                    <td className="font-semibold text-gray-600 tabular-nums">
                      {fmt(tax.takeHome / 26)}
                    </td>

                    {/* Effective rate */}
                    <td className="text-gray-600 tabular-nums">
                      {pct(tax.effectiveTotalRate)}
                    </td>

                    {/* State tax $ */}
                    <td className="text-gray-500 tabular-nums">
                      {cfg.noTax ? "$0" : fmt(tax.stateTax)}
                    </td>

                    {/* Actions */}
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <Link
                          href={`/${slug}`}
                          className="text-blue-600 hover:text-blue-800 text-xs font-medium whitespace-nowrap transition-colors"
                        >
                          Details →
                        </Link>
                        <button
                          type="button"
                          onClick={() => removeState(slug)}
                          aria-label={`Remove ${cfg.name}`}
                          className="text-gray-300 hover:text-red-400 transition-colors text-sm leading-none w-5 h-5 flex items-center justify-center"
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Footer note */}
          <p className="text-xs text-gray-400 mt-4 text-center">
            * {filingLabel}, standard deduction, no 401(k) contribution.{" "}
            {TAX_YEAR} IRS federal + state brackets.
          </p>
        </section>
      ) : cleanSalary === 0 ? (
        <section className="container-page my-14 text-center">
          <div className="bg-gray-50 rounded-2xl p-10 text-gray-400">
            <p className="text-lg font-semibold mb-2">Enter a salary above</p>
            <p className="text-sm">Type any amount to see the state comparison instantly.</p>
          </div>
        </section>
      ) : (
        <section className="container-page my-14 text-center">
          <div className="bg-gray-50 rounded-2xl p-10 text-gray-400">
            <p className="text-lg font-semibold mb-2">No states selected</p>
            <p className="text-sm">
              Use the dropdown above to add states to compare.{" "}
              <button
                type="button"
                onClick={resetToDefaults}
                className="text-blue-600 underline hover:no-underline"
              >
                Reset to defaults
              </button>
            </p>
          </div>
        </section>
      )}
    </>
  );
}
