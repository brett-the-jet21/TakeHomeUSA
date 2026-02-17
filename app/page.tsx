"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

const STATES = [{ slug: "texas", name: "Texas" }];

export default function Home() {
  const router = useRouter();
  const [salary, setSalary] = useState("100000");
  const [state, setState] = useState("texas");
  const cleaned = useMemo(() => String(salary || "").replace(/[^\d]/g, ""), [salary]);

  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-xl">
        <h1 className="text-5xl font-bold leading-tight">Take Home Pay Calculator</h1>
        <p className="mt-3 text-lg opacity-80">
          Enter your salary and state to see your after-tax take-home pay.
        </p>

        <div className="mt-8 grid gap-4">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Annual Salary</span>
            <input
              inputMode="numeric"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              placeholder="100000"
              className="border rounded px-4 py-3 text-lg"
            />
          </label>

          <label className="grid gap-2">
            <span className="text-sm font-medium">State</span>
            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
              className="border rounded px-4 py-3 text-lg"
            >
              {STATES.map((s) => (
                <option key={s.slug} value={s.slug}>{s.name}</option>
              ))}
            </select>
          </label>

          <button
            className="rounded bg-black text-white px-4 py-3 text-lg hover:opacity-90"
            onClick={() => {
              if (!cleaned) return;
              router.push(`/${state}/${cleaned}-salary-after-tax`);
            }}
          >
            Calculate
          </button>

          <p className="text-sm opacity-70">
            Try: <a className="underline" href="/salary/100000-salary-after-tax-texas">Texas $100,000</a>
          </p>
        </div>
      </div>
    </main>
  );
}
