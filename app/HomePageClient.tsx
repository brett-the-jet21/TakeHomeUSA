"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_STATE_CONFIGS, STATE_BY_SLUG } from "@/lib/states";
import { calculateTax, fmt, pct, TAX_YEAR, POPULAR_SALARIES, FILING_STATUS_LABELS } from "@/lib/tax";
import type { FilingStatus } from "@/lib/tax";
import { CITIES_BY_STATE, CITY_BY_SLUG } from "@/lib/cities";

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

// IANA timezone → best-match state slug for auto-detect on first visit
const TIMEZONE_TO_STATE: Record<string, string> = {
  "America/New_York":               "new-york",
  "America/Detroit":                "michigan",
  "America/Indiana/Indianapolis":   "indiana",
  "America/Indiana/Tell_City":      "indiana",
  "America/Indiana/Knox":           "indiana",
  "America/Indiana/Winamac":        "indiana",
  "America/Indiana/Marengo":        "indiana",
  "America/Indiana/Petersburg":     "indiana",
  "America/Indiana/Vevay":          "indiana",
  "America/Indiana/Vincennes":      "indiana",
  "America/Kentucky/Louisville":    "kentucky",
  "America/Kentucky/Monticello":    "kentucky",
  "America/Chicago":                "illinois",
  "America/Menominee":              "michigan",
  "America/North_Dakota/Center":    "north-dakota",
  "America/North_Dakota/New_Salem": "north-dakota",
  "America/North_Dakota/Beulah":    "north-dakota",
  "America/Denver":                 "colorado",
  "America/Boise":                  "idaho",
  "America/Phoenix":                "arizona",
  "America/Los_Angeles":            "california",
  "America/Anchorage":              "alaska",
  "America/Juneau":                 "alaska",
  "America/Sitka":                  "alaska",
  "America/Yakutat":                "alaska",
  "America/Nome":                   "alaska",
  "America/Metlakatla":             "alaska",
  "America/Adak":                   "alaska",
  "Pacific/Honolulu":               "hawaii",
};

export default function HomePageClient() {
  const router = useRouter();
  const [salary, setSalary] = useState("100,000");
  const [stateSlug, setStateSlug] = useState("texas");
  const [filing, setFiling] = useState<FilingStatus>("single");
  const [contribution401k, setContribution401k] = useState("");
  const [healthInsurance, setHealthInsurance] = useState("");
  const [hsa, setHsa] = useState("");
  const [useItemized, setUseItemized] = useState(false);
  const [mortgageInterest, setMortgageInterest] = useState("");
  const [charitable, setCharitable] = useState("");
  const [citySlug, setCitySlug] = useState("");
  const [inputMode, setInputMode] = useState<"annual" | "hourly">("annual");
  const [hourlyRate, setHourlyRate] = useState("");
  const [hoursPerWeek, setHoursPerWeek] = useState("40");
  const [initialized, setInitialized] = useState(false);
  const [copied, setCopied] = useState(false);

  // Read URL params on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("salary");
    if (s && /^\d+$/.test(s)) setSalary(Number(s).toLocaleString("en-US"));
    const st = params.get("state");
    if (st && STATE_BY_SLUG.has(st)) setStateSlug(st);
    const f = params.get("filing");
    if (f === "married" || f === "mfs" || f === "hoh" || f === "qss") setFiling(f as FilingStatus);
    const k = params.get("401k");
    if (k && /^\d+$/.test(k) && Number(k) > 0) setContribution401k(Number(k).toLocaleString("en-US"));
    const hi = params.get("health");
    if (hi && /^\d+$/.test(hi) && Number(hi) > 0) setHealthInsurance(Number(hi).toLocaleString("en-US"));
    const hsaParam = params.get("hsa");
    if (hsaParam && /^\d+$/.test(hsaParam) && Number(hsaParam) > 0) setHsa(Number(hsaParam).toLocaleString("en-US"));
    const c = params.get("city");
    if (c && CITY_BY_SLUG.has(c)) setCitySlug(c);
    if (params.get("itemized") === "1") setUseItemized(true);
    const mi = params.get("mortgage");
    if (mi && /^\d+$/.test(mi) && Number(mi) > 0) setMortgageInterest(Number(mi).toLocaleString("en-US"));
    const ch = params.get("charity");
    if (ch && /^\d+$/.test(ch) && Number(ch) > 0) setCharitable(Number(ch).toLocaleString("en-US"));
    const m = params.get("mode");
    if (m === "hourly") setInputMode("hourly");
    const r = params.get("rate");
    if (r && /^\d+(\.\d+)?$/.test(r) && parseFloat(r) > 0) setHourlyRate(r);
    const hw = params.get("hours");
    if (hw && /^\d+$/.test(hw) && Number(hw) >= 1 && Number(hw) <= 168) setHoursPerWeek(hw);
    // Auto-detect state from timezone only when no explicit ?state= param
    if (!params.get("state")) {
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        const tzState = TIMEZONE_TO_STATE[tz];
        if (tzState && STATE_BY_SLUG.has(tzState)) setStateSlug(tzState);
      } catch { /* ignore detection failures */ }
    }
    setInitialized(true);
  }, []);

  // Write URL params when inputs change (only after initialization)
  useEffect(() => {
    if (!initialized) return;
    const params = new URLSearchParams();
    const cleanSalary = salary.replace(/[^\d]/g, "");
    if (cleanSalary && cleanSalary !== "100000") params.set("salary", cleanSalary);
    if (stateSlug !== "texas") params.set("state", stateSlug);
    if (filing !== "single") params.set("filing", filing);
    const k = Number(contribution401k.replace(/[^\d]/g, ""));
    if (k > 0) params.set("401k", String(k));
    const hiNum = Number(healthInsurance.replace(/[^\d]/g, ""));
    if (hiNum > 0) params.set("health", String(hiNum));
    const hsaNum2 = Number(hsa.replace(/[^\d]/g, ""));
    if (hsaNum2 > 0) params.set("hsa", String(hsaNum2));
    if (citySlug) params.set("city", citySlug);
    if (useItemized) {
      params.set("itemized", "1");
      const mi = Number(mortgageInterest.replace(/[^\d]/g, ""));
      if (mi > 0) params.set("mortgage", String(mi));
      const ch = Number(charitable.replace(/[^\d]/g, ""));
      if (ch > 0) params.set("charity", String(ch));
    }
    if (inputMode === "hourly") {
      params.set("mode", "hourly");
      const r = parseFloat(hourlyRate);
      if (r > 0) params.set("rate", String(r));
      if (hoursPerWeek !== "40") params.set("hours", hoursPerWeek);
    }
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [salary, stateSlug, filing, contribution401k, healthInsurance, hsa, citySlug, inputMode, hourlyRate, hoursPerWeek, useItemized, mortgageInterest, charitable, initialized]);

  const handleCopyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, []);

  const cfg = useMemo(() => STATE_BY_SLUG.get(stateSlug) ?? STATE_BY_SLUG.get("texas")!, [stateSlug]);

  const cleaned = useMemo(() => String(salary || "").replace(/[^\d]/g, ""), [salary]);

  const contrib401kNum = useMemo(() => {
    const n = Number(contribution401k.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [contribution401k]);

  const healthInsNum = useMemo(() => {
    const n = Number(healthInsurance.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [healthInsurance]);

  const hsaNum = useMemo(() => {
    const n = Number(hsa.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [hsa]);

  const mortgageNum = useMemo(() => {
    const n = Number(mortgageInterest.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [mortgageInterest]);

  const charitableNum = useMemo(() => {
    const n = Number(charitable.replace(/[^\d]/g, ""));
    return n > 0 ? n : 0;
  }, [charitable]);

  const citiesForState = useMemo(() => CITIES_BY_STATE.get(stateSlug) ?? [], [stateSlug]);

  const cityConfig = useMemo(() => {
    const city = CITY_BY_SLUG.get(citySlug);
    return city?.stateSlug === stateSlug ? city : undefined;
  }, [citySlug, stateSlug]);

  const grossAnnual = useMemo(() => {
    if (inputMode === "hourly") {
      const r = parseFloat(hourlyRate) || 0;
      const h = parseInt(hoursPerWeek) || 40;
      return Math.round(r * h * 52);
    }
    return Number(cleaned) || 0;
  }, [inputMode, hourlyRate, hoursPerWeek, cleaned]);

  const previewTax = useMemo(() => {
    const n = grossAnnual;
    if (!n || n < 1_000) return null;
    return calculateTax(cfg, n, { filingStatus: filing, contribution401k: contrib401kNum, healthInsurance: healthInsNum, hsa: hsaNum, cityConfig, ...(useItemized ? { mortgageInterest: mortgageNum, charitable: charitableNum } : {}) });
  }, [grossAnnual, cfg, filing, contrib401kNum, healthInsNum, hsaNum, cityConfig, useItemized, mortgageNum, charitableNum]);

  function handleCalculate() {
    const raw = grossAnnual;
    if (!raw || raw < 1_000) return;
    let targetAmount: number;
    if (raw <= 500_000) {
      const step = stateSlug === "texas" ? 1_000 : 5_000;
      targetAmount = Math.max(20_000, Math.round(raw / step) * step);
    } else {
      targetAmount = raw;
    }
    const params = new URLSearchParams();
    if (filing !== "single") params.set("filing", filing);
    if (contrib401kNum > 0) params.set("401k", String(contrib401kNum));
    if (healthInsNum > 0) params.set("health", String(healthInsNum));
    if (hsaNum > 0) params.set("hsa", String(hsaNum));
    if (citySlug) params.set("city", citySlug);
    if (useItemized) {
      params.set("itemized", "1");
      if (mortgageNum > 0) params.set("mortgage", String(mortgageNum));
      if (charitableNum > 0) params.set("charity", String(charitableNum));
    }
    if (inputMode === "hourly") {
      params.set("mode", "hourly");
      const r = parseFloat(hourlyRate);
      if (r > 0) params.set("rate", String(r));
      if (hoursPerWeek !== "40") params.set("hours", hoursPerWeek);
    }
    const qs = params.toString();
    router.push(`/salary/${targetAmount}-salary-after-tax-${stateSlug}${qs ? `?${qs}` : ""}`);
  }

  const { name: stateName, noTax, topRateDisplay } = cfg;
  const filingLabel = FILING_STATUS_LABELS[filing];

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
                  {/* Input mode toggle */}
                  <div className="flex bg-gray-100 rounded-2xl p-1">
                    <button
                      type="button"
                      onClick={() => setInputMode("annual")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === "annual" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Annual Salary
                    </button>
                    <button
                      type="button"
                      onClick={() => setInputMode("hourly")}
                      className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${inputMode === "hourly" ? "bg-white shadow text-gray-900" : "text-gray-500 hover:text-gray-700"}`}
                    >
                      Hourly Wage
                    </button>
                  </div>

                  {/* Salary or Hourly input */}
                  {inputMode === "annual" ? (
                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                        Annual Gross Salary
                      </span>
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                        <input
                          inputMode="numeric"
                          value={salary}
                          onChange={(e) => {
                            const raw = e.target.value.replace(/[^\d]/g, "");
                            setSalary(raw ? Number(raw).toLocaleString("en-US") : "");
                          }}
                          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                          placeholder="100,000"
                          className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                        />
                      </div>
                    </label>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                          Hourly Rate
                        </span>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                          <input
                            inputMode="decimal"
                            value={hourlyRate}
                            onChange={(e) => setHourlyRate(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                            placeholder="25.00"
                            className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                          />
                        </div>
                      </label>
                      <label className="block">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                          Hours / Week
                        </span>
                        <input
                          inputMode="numeric"
                          value={hoursPerWeek}
                          onChange={(e) => setHoursPerWeek(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleCalculate()}
                          placeholder="40"
                          className="w-full border-2 border-gray-200 rounded-2xl px-4 py-4 text-2xl font-extrabold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 text-center transition-all"
                        />
                      </label>
                    </div>
                  )}

                  {/* State select — all 50 states, grouped */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      State
                    </span>
                    <select
                      value={stateSlug}
                      onChange={(e) => { setStateSlug(e.target.value); setCitySlug(""); }}
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

                  {/* City / county tax — only shown for states with local taxes */}
                  {citiesForState.length > 0 && (
                    <label className="block">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                        {stateSlug === "maryland" ? "County Income Tax" : "City / Local Tax"}{" "}
                        <span className="font-normal normal-case">(optional)</span>
                      </span>
                      <select
                        value={citySlug}
                        onChange={(e) => setCitySlug(e.target.value)}
                        className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                      >
                        <option value="">
                          {stateSlug === "maryland" ? "All counties — avg 2.5%" : "No city tax"}
                        </option>
                        {citiesForState.map((c) => (
                          <option key={c.slug} value={c.slug}>
                            {c.name} — {c.topRateDisplay}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  {/* Filing status */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Filing Status
                    </span>
                    <select
                      value={filing}
                      onChange={(e) => setFiling(e.target.value as FilingStatus)}
                      className="w-full border-2 border-gray-200 rounded-2xl px-4 py-3.5 text-base font-semibold focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white transition-all"
                    >
                      <option value="single">Single</option>
                      <option value="married">Married Filing Jointly</option>
                      <option value="mfs">Married Filing Separately</option>
                      <option value="hoh">Head of Household</option>
                      <option value="qss">Qualifying Surviving Spouse</option>
                    </select>
                  </label>

                  {/* 401(k) pre-tax contribution */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      401(k) Pre-Tax Contribution <span className="font-normal normal-case">(optional)</span>
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                      <input
                        inputMode="numeric"
                        value={contribution401k}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          setContribution401k(raw ? Number(raw).toLocaleString("en-US") : "");
                        }}
                        placeholder="0"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-3.5 text-base font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </label>

                  {/* Health insurance pre-tax premium (Section 125) */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      Health Insurance Premium <span className="font-normal normal-case">(optional — annual)</span>
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                      <input
                        inputMode="numeric"
                        value={healthInsurance}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          setHealthInsurance(raw ? Number(raw).toLocaleString("en-US") : "");
                        }}
                        placeholder="0"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-3.5 text-base font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </label>

                  {/* HSA payroll contribution */}
                  <label className="block">
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1.5">
                      HSA Contribution <span className="font-normal normal-case">(optional — annual)</span>
                    </span>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl font-bold">$</span>
                      <input
                        inputMode="numeric"
                        value={hsa}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/[^\d]/g, "");
                          setHsa(raw ? Number(raw).toLocaleString("en-US") : "");
                        }}
                        placeholder="0"
                        className="w-full border-2 border-gray-200 rounded-2xl pl-9 pr-4 py-3.5 text-base font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all"
                      />
                    </div>
                  </label>

                  {/* Itemized Deductions Toggle */}
                  <div className="border-t border-gray-100 pt-4">
                    <button
                      type="button"
                      onClick={() => setUseItemized((v) => !v)}
                      className="flex items-center gap-2 text-sm text-blue-700 font-semibold hover:text-blue-900 transition-colors"
                    >
                      <span className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all ${useItemized ? "bg-blue-600 border-blue-600" : "border-gray-300"}`}>
                        {useItemized && <span className="text-white text-xs leading-none">✓</span>}
                      </span>
                      Use itemized deductions instead of standard (${(16_100).toLocaleString()})
                    </button>
                    {useItemized && (
                      <div className="mt-3 grid grid-cols-2 gap-3">
                        <label className="block">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                            Mortgage Interest
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                            <input
                              inputMode="numeric"
                              value={mortgageInterest}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                setMortgageInterest(raw ? Number(raw).toLocaleString("en-US") : "");
                              }}
                              placeholder="0"
                              className="w-full border-2 border-blue-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                        </label>
                        <label className="block">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-wide block mb-1">
                            Charitable Giving
                          </span>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">$</span>
                            <input
                              inputMode="numeric"
                              value={charitable}
                              onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                setCharitable(raw ? Number(raw).toLocaleString("en-US") : "");
                              }}
                              placeholder="0"
                              className="w-full border-2 border-blue-200 rounded-xl pl-7 pr-3 py-2.5 text-sm font-semibold text-gray-900 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"
                            />
                          </div>
                        </label>
                        {(() => {
                          const total = mortgageNum + charitableNum;
                          return total > 0 && (
                            <p className={`col-span-2 text-xs px-3 py-2 rounded-lg ${total > 16_100 ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
                              {total > 16_100
                                ? `✓ Your itemized total ($${total.toLocaleString()}) exceeds the standard deduction — itemized deduction applied.`
                                : `⚠ Your itemized total ($${total.toLocaleString()}) is below the $16,100 standard deduction — standard deduction is being used.`}
                            </p>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                </div>

                {/* Live Preview */}
                {previewTax ? (
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-5 mb-4">
                    <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">
                      {stateName} Take-Home — {TAX_YEAR}
                    </p>
                    {inputMode === "hourly" && (
                      <p className="text-xs text-green-600 mb-1">
                        ${hourlyRate}/hr × {hoursPerWeek}h/wk × 52 = {fmt(grossAnnual)}/yr gross
                      </p>
                    )}
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
                      {previewTax.cityTax > 0 && (
                        <div className="bg-teal-400" style={{ width: `${(previewTax.cityTax / previewTax.gross) * 100}%` }} />
                      )}
                      <div className="bg-orange-300" style={{ width: `${(previewTax.ficaTotal / previewTax.gross) * 100}%` }} />
                      {previewTax.contribution401k > 0 && (
                        <div className="bg-blue-300" style={{ width: `${(previewTax.contribution401k / previewTax.gross) * 100}%` }} />
                      )}
                      {previewTax.healthInsurancePremium > 0 && (
                        <div className="bg-sky-300" style={{ width: `${(previewTax.healthInsurancePremium / previewTax.gross) * 100}%` }} />
                      )}
                      {previewTax.hsaContribution > 0 && (
                        <div className="bg-cyan-300" style={{ width: `${(previewTax.hsaContribution / previewTax.gross) * 100}%` }} />
                      )}
                      <div className="bg-green-400 flex-1" />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {noTax ? "No state tax · " : `State tax: ${pct(previewTax.stateTax / previewTax.gross)} · `}
                      {previewTax.cityTax > 0 && cityConfig ? `City tax: ${pct(previewTax.cityTax / previewTax.gross)} · ` : ""}
                      Effective rate: {(previewTax.effectiveTotalRate * 100).toFixed(1)}%
                    </p>
                    {/* Copy Link */}
                    <div className="mt-3 pt-3 border-t border-green-200">
                      <button
                        onClick={handleCopyLink}
                        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-600 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                        </svg>
                        {copied ? "Link copied!" : "Copy shareable link"}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-2xl p-5 mb-4 text-center text-gray-400 text-sm">
                    Enter a salary above to see your take-home pay
                  </div>
                )}

                <button
                  onClick={handleCalculate}
                  disabled={grossAnnual < 1_000}
                  className="w-full py-4 rounded-2xl text-white font-extrabold text-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                  style={{ background: "linear-gradient(90deg, #1d4ed8, #2563eb)" }}
                >
                  See Full Tax Breakdown →
                </button>
                <p className="text-center text-xs text-gray-400 mt-3">
                  {TAX_YEAR} IRS brackets · {filingLabel} · Standard deduction · No signup
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

        <div className="salary-showcase-grid grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {SHOWCASE_AMOUNTS.map((amount) => {
            const tax = calculateTax(cfg, amount);
            const badge = SHOWCASE_BADGES[amount];
            return (
              <Link
                key={amount}
                href={`/salary/${amount}-salary-after-tax-${stateSlug}`}
                className="salary-card-mobile group relative bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-400 hover:shadow-xl transition-all duration-200"
              >
                {badge && (
                  <span className={`absolute top-3 right-3 text-xs font-bold px-2 py-0.5 rounded-full ${badge === "Most Searched" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"}`}>
                    {badge}
                  </span>
                )}
                <p className="salary-gross-label text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Gross</p>
                <p className="salary-gross-amount text-xl font-extrabold text-gray-900 group-hover:text-blue-700 mb-3">
                  ${amount.toLocaleString()}
                </p>
                <div className="salary-divider h-px bg-gray-100 mb-3" />
                <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-1">Take-Home</p>
                <p className="salary-takehome-amount text-2xl font-black text-green-600 tabular-nums">{fmt(tax.takeHome)}</p>
                <p className="salary-monthly-line text-sm text-gray-500 mt-1 tabular-nums">
                  {fmt(tax.takeHome / 12)}/mo · {(tax.effectiveTotalRate * 100).toFixed(1)}% eff.
                </p>
                <p className="salary-cta text-xs text-blue-500 font-medium mt-3 group-hover:text-blue-700">
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
                return (
                  <Link
                    key={slug}
                    href={`/${slug}`}
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

      {/* ── Compare Tool CTA ──────────────────────────────────────────────────── */}
      <section className="container-page mt-14">
        <div className="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-3xl p-5 sm:p-8 text-white flex flex-col sm:flex-row items-center gap-6">
          <div className="flex-1">
            <h2 className="text-2xl font-extrabold mb-2">Compare States Side by Side</h2>
            <p className="text-blue-200 text-sm leading-relaxed max-w-lg">
              Thinking about relocating? Our interactive comparison tool shows your exact take-home pay across multiple states at once — pick any 3 and see all salary levels in seconds.
            </p>
          </div>
          <Link
            href="/compare"
            className="flex-shrink-0 bg-white text-blue-700 font-extrabold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap shadow-lg"
          >
            Compare States →
          </Link>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────────── */}
      <section className="container-page mt-14 mb-6">
        <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            {
              q: "Why is my take-home different from what this calculator shows?",
              a: "Several factors can create differences: employer health insurance premiums, FSA contributions, retirement beyond 401k, state-specific credits, local/city income taxes, or pre-tax commuter benefits. Use our optional fields (401k, health insurance, HSA) to get a closer estimate for your situation.",
            },
            {
              q: "Does this include Social Security and Medicare taxes?",
              a: `Yes. All FICA taxes are included: Social Security (6.2% on wages up to $184,500 for ${TAX_YEAR}) and Medicare (1.45% on all wages, plus 0.9% additional on wages over $200,000). These are shown separately in the full breakdown.`,
            },
            {
              q: "What's the difference between effective and marginal tax rate?",
              a: "Your marginal rate is the rate on your last dollar of income (e.g., 22%). Your effective rate is the average across all income — always lower than marginal because lower brackets apply to the first portions of your income. On a $100K salary, your marginal federal rate might be 22%, but your effective federal rate is ~14%.",
            },
            {
              q: "How do I calculate my hourly rate from an annual salary?",
              a: "Divide your annual take-home pay by 2,080 (52 weeks × 40 hours) to get your after-tax hourly rate. Use our \"Hourly Wage\" toggle above to enter your exact hourly rate and hours per week for a precise calculation.",
            },
          ].map(({ q, a }) => (
            <div key={q} className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-blue-200 transition-colors">
              <h3 className="font-bold text-gray-900 mb-2 text-sm">{q}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Bottom Ad ─────────────────────────────────────────────────────────── */}
      <div className="container-page mt-10 mb-4">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
