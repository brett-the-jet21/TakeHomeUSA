export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { STATES_DIRECTORY, ALL_STATE_CONFIGS } from "@/lib/states";
import { TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: `Salary After Tax Calculator — All 50 States (${TAX_YEAR}) | TakeHomeUSA`,
  description:
    `Free salary after-tax calculator for all 50 US states. See your exact take-home pay, federal and state tax breakdown, and monthly paycheck — powered by ${TAX_YEAR} tax brackets.`,
  alternates: { canonical: "https://www.takehomeusa.com/states" },
};

const noTaxStates = ALL_STATE_CONFIGS.filter((s) => s.noTax);

export default function StatesPage() {
  return (
    <>
      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="container-page py-14 text-center">
          <div className="inline-block bg-blue-700 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            {TAX_YEAR} Tax Brackets · All 50 States
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Salary After Tax Calculator<br />
            <span className="text-blue-300">All 50 States</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-8">
            See your exact take-home pay for any salary in any state. Every calculator
            uses real {TAX_YEAR} federal and state tax brackets.
          </p>
          <div className="flex justify-center gap-4 text-sm flex-wrap">
            <div className="bg-green-500 text-white px-4 py-1.5 rounded-full font-semibold">
              ✓ All 50 states live
            </div>
            <div className="bg-blue-700 text-blue-200 px-4 py-1.5 rounded-full">
              {TAX_YEAR} brackets updated
            </div>
          </div>
        </div>
      </section>

      {/* ── Ad ─────────────────────────────────────────────────────────────── */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── No-Tax States Callout ─────────────────────────────────────────── */}
      <section className="container-page mb-10">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            States With No Income Tax (9 Total)
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            These states collect zero state income tax — keeping your paycheck
            significantly higher than high-tax states like California or New York.
          </p>
          <div className="flex flex-wrap gap-3">
            {noTaxStates.map((s) => (
              <Link
                key={s.slug}
                href={`/${s.slug}`}
                className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                {s.name}
                <span className="text-green-200 text-xs">— 0% ✓</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── All States Grid ───────────────────────────────────────────────── */}
      <section className="container-page mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All 50 States</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {STATES_DIRECTORY.map((state) => {
            const href = state.externalSite
              ? state.externalSite
              : `/${state.slug}`;
            const isExternal = !!state.externalSite;

            const card = (
              <div className="rounded-xl border border-blue-300 bg-blue-50 hover:shadow-md hover:border-blue-400 cursor-pointer transition-all p-4">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{state.name}</span>
                  <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                    Live
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      state.tax === "0%"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {state.tax} state tax
                  </span>
                </div>
                <p className="text-xs text-blue-600 font-medium mt-2">
                  {isExternal ? "View calculator ↗" : "View calculator →"}
                </p>
              </div>
            );

            return isExternal ? (
              <a key={state.slug} href={href} target="_blank" rel="noopener noreferrer">
                {card}
              </a>
            ) : (
              <Link key={state.slug} href={href}>
                {card}
              </Link>
            );
          })}
        </div>
      </section>

      {/* ── Bottom Ad ──────────────────────────────────────────────────────── */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
