"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ALL_STATES, StateTaxType } from "@/lib/states";

const TAX_TYPE_LABELS: Record<StateTaxType, string> = {
  none: "No income tax",
  flat: "Flat tax",
  progressive: "Progressive tax",
};

const TAX_TYPE_COLORS: Record<StateTaxType, string> = {
  none: "bg-green-100 text-green-800",
  flat: "bg-blue-100 text-blue-800",
  progressive: "bg-orange-100 text-orange-800",
};

export default function StatesPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<StateTaxType | "all">("all");

  const filtered = useMemo(() => {
    return ALL_STATES.filter((s) => {
      const matchesQuery =
        query.trim() === "" ||
        s.name.toLowerCase().includes(query.toLowerCase().trim());
      const matchesFilter = filter === "all" || s.taxType === filter;
      return matchesQuery && matchesFilter;
    });
  }, [query, filter]);

  return (
    <main className="min-h-screen p-8 flex justify-center">
      <div className="w-full max-w-4xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm opacity-70 mb-6">
          <Link href="/" className="underline">Home</Link>
          <span className="mx-2">/</span>
          <span>State Guides</span>
        </nav>

        <h1 className="text-4xl font-bold mb-2">State Salary Guides</h1>
        <p className="text-lg opacity-80 mb-8">
          After-tax salary calculators for all 50 U.S. states — updated for 2026 tax brackets.
        </p>

        {/* Search and filter controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <label className="sr-only" htmlFor="state-search">Search states</label>
          <input
            id="state-search"
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search states…"
            className="flex-1 border rounded px-4 py-2 text-base"
            aria-label="Search states"
          />

          <div role="group" aria-label="Filter by tax type" className="flex gap-2 flex-wrap">
            {(["all", "none", "flat", "progressive"] as const).map((type) => (
              <button
                key={type}
                onClick={() => setFilter(type)}
                aria-pressed={filter === type}
                className={`rounded px-3 py-2 text-sm font-medium border transition-colors ${
                  filter === type
                    ? "bg-black text-white border-black"
                    : "bg-white text-black border-gray-300 hover:border-gray-500"
                }`}
              >
                {type === "all"
                  ? "All states"
                  : TAX_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        {/* Result count */}
        <p className="text-sm opacity-60 mb-4" aria-live="polite">
          Showing {filtered.length} of {ALL_STATES.length} states
        </p>

        {/* State grid */}
        {filtered.length === 0 ? (
          <p className="text-lg opacity-70 py-12 text-center">
            No states match your search.
          </p>
        ) : (
          <ul
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3"
            aria-label="State salary guides"
          >
            {filtered.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/${s.slug}/100000-salary-after-tax`}
                  className="flex flex-col gap-1 rounded border p-4 hover:border-gray-400 transition-colors"
                  aria-label={`${s.name} salary calculator — ${s.taxNote}`}
                >
                  <span className="font-semibold">{s.name}</span>
                  <span
                    className={`self-start rounded-full px-2 py-0.5 text-xs font-medium ${TAX_TYPE_COLORS[s.taxType]}`}
                    aria-label={`Tax type: ${TAX_TYPE_LABELS[s.taxType]}`}
                  >
                    {TAX_TYPE_LABELS[s.taxType]}
                  </span>
                  <span className="text-xs opacity-60">{s.taxNote}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-12 border-t pt-6 flex gap-6 text-sm">
          <Link href="/" className="underline">Calculator</Link>
          <Link href="/about" className="underline">About</Link>
        </div>
      </div>
    </main>
  );
}
