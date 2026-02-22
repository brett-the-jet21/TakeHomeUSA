"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ALL_STATES } from "@/lib/states";

export default function Home() {
  const router = useRouter();
  const [salary, setSalary] = useState("100000");
  const [state, setState] = useState("texas");
  const cleaned = useMemo(() => String(salary || "").replace(/[^\d]/g, ""), [salary]);

  const salaryNum = Number(cleaned);
  const outOfRange = cleaned !== "" && (salaryNum < 20_000 || salaryNum > 500_000);

  function handleCalculate() {
    if (!cleaned || outOfRange) return;
    router.push(`/${state}/${cleaned}-salary-after-tax`);
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Site navigation */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">TakeHomeUSA</Link>
        <nav aria-label="Main navigation" className="flex gap-4 text-sm">
          <Link href="/states" className="underline">State Guides</Link>
          <Link href="/about" className="underline">About</Link>
        </nav>
      </header>

      <main className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-xl">
          <h1 className="text-5xl font-bold leading-tight">Take Home Pay Calculator</h1>
          <p className="mt-3 text-lg opacity-80">
            Enter your salary and state to see your after-tax take-home pay.
            Updated for <strong>2026 federal &amp; state tax brackets</strong>.
          </p>

          <div className="mt-8 grid gap-4">
            <label className="grid gap-2">
              <span className="text-sm font-medium">Annual Salary</span>
              <input
                id="salary-input"
                inputMode="numeric"
                value={salary}
                onChange={(e) => setSalary(e.target.value)}
                placeholder="100000"
                className={`border rounded px-4 py-3 text-lg ${outOfRange ? "border-red-500" : ""}`}
                aria-label="Annual gross salary in dollars"
                aria-describedby={outOfRange ? "salary-error" : undefined}
                min={20000}
                max={500000}
              />
              {outOfRange && (
                <p id="salary-error" role="alert" className="text-sm text-red-600">
                  Please enter a salary between $20,000 and $500,000.
                </p>
              )}
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">State</span>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                className="border rounded px-4 py-3 text-lg"
                aria-label="State"
              >
                {ALL_STATES.map((s) => (
                  <option key={s.slug} value={s.slug}>{s.name}</option>
                ))}
              </select>
            </label>

            <button
              className="rounded bg-black text-white px-4 py-3 text-lg hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              onClick={handleCalculate}
              disabled={!cleaned || outOfRange}
              aria-disabled={!cleaned || outOfRange}
            >
              Calculate
            </button>
          </div>

          <p className="mt-4 text-sm opacity-70">
            Try:{" "}
            <a className="underline" href="/texas/100000-salary-after-tax">Texas $100,000</a>
            {" · "}
            <a className="underline" href="/california/100000-salary-after-tax">California $100,000</a>
            {" · "}
            <a className="underline" href="/new-york/100000-salary-after-tax">New York $100,000</a>
          </p>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-xs opacity-60 flex gap-4">
        <Link href="/about">About</Link>
        <Link href="/states">State Guides</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
