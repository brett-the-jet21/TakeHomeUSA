export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR, calculateTax } from "@/lib/tax";
import { STATE_BY_SLUG } from "@/lib/states";
import { fmt, pct } from "@/lib/tax";

export const metadata: Metadata = {
  title: `How We Calculate Take-Home Pay — Methodology (${TAX_YEAR})`,
  description: `Full methodology behind TakeHomeUSA's salary after-tax calculations. Explains federal brackets, state tax rules, FICA, standard deduction, and 2026 IRS data sources. Transparent and citable.`,
  alternates: { canonical: "https://www.takehomeusa.com/methodology" },
  openGraph: {
    title: `TakeHomeUSA Methodology — How We Calculate Take-Home Pay (${TAX_YEAR})`,
    description: `Detailed, transparent methodology explaining every assumption in our paycheck calculations. 2026 IRS brackets, state tax rules, FICA, and more.`,
    url: "https://www.takehomeusa.com/methodology",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

// Pre-compute a worked example for $100K in Texas for the methodology page
const EXAMPLE_SALARY = 100_000;
const exTx = calculateTax(STATE_BY_SLUG.get("texas")!, EXAMPLE_SALARY);
const exCa = calculateTax(STATE_BY_SLUG.get("california")!, EXAMPLE_SALARY);

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "TechArticle",
  headline: `How TakeHomeUSA Calculates Take-Home Pay — Methodology (${TAX_YEAR})`,
  description: "Detailed methodology explaining federal tax bracket calculations, state income tax treatment, FICA taxes, standard deductions, and data sources.",
  url: "https://www.takehomeusa.com/methodology",
  author: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  publisher: { "@type": "Organization", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
  dateModified: `${TAX_YEAR}-01-01`,
  mainEntityOfPage: "https://www.takehomeusa.com/methodology",
};

export default function MethodologyPage() {
  const stdDeduction = 16_100; // 2026 single filer
  const ficaSS = 0.062;
  const ficaMed = 0.0145;
  const ssTaxableMax = 184_500;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <main className="container-page py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Methodology</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl p-8 mb-10">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
            Updated for {TAX_YEAR} IRS Rev. Proc. 2025-32
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            How We Calculate Take-Home Pay
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Every number on TakeHomeUSA comes from a transparent, documented formula
            based on official IRS data. Here is exactly how it works.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">Single filer default</span>
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">Standard deduction ${stdDeduction.toLocaleString()}</span>
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">{TAX_YEAR} IRS brackets</span>
            <span className="bg-white/10 rounded-lg px-3 py-1.5 text-white/80">All 50 states</span>
          </div>
        </div>

        <div className="space-y-12 text-gray-700">

          {/* Data Sources */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">1. Data Sources</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 space-y-3 text-sm">
              <div className="flex gap-3">
                <span className="font-bold text-blue-700 shrink-0 w-36">Federal Tax Brackets</span>
                <span>IRS Rev. Proc. 2025-32 — official {TAX_YEAR} inflation adjustments to tax brackets, standard deduction, and AMT thresholds. Published October 2025.</span>
              </div>
              <div className="flex gap-3 pt-3 border-t border-blue-100">
                <span className="font-bold text-blue-700 shrink-0 w-36">State Income Tax</span>
                <span>Each state&apos;s department of revenue official rate schedules and bracket tables for {TAX_YEAR}. Verified against state-published withholding guides.</span>
              </div>
              <div className="flex gap-3 pt-3 border-t border-blue-100">
                <span className="font-bold text-blue-700 shrink-0 w-36">FICA / Social Security</span>
                <span>IRS Publication 15 (Circular E) for {TAX_YEAR}: SS rate 6.2% up to ${ssTaxableMax.toLocaleString()} wage base; Medicare 1.45% on all wages; Additional Medicare 0.9% over $200,000.</span>
              </div>
              <div className="flex gap-3 pt-3 border-t border-blue-100">
                <span className="font-bold text-blue-700 shrink-0 w-36">City / Local Taxes</span>
                <span>New York City (3.078%–3.876%), Philadelphia (3.75%), Detroit (2.4%), and Maryland county piggyback rates sourced from respective municipal tax authorities.</span>
              </div>
            </div>
          </section>

          {/* Calculation Steps */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">2. Calculation Steps</h2>
            <p className="mb-5 leading-relaxed">
              The formula below applies to a single filer using the standard deduction — the default
              assumption on TakeHomeUSA. Every step is deterministic: given the same inputs, the
              result is always identical.
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-bold text-gray-700 w-8">Step</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Operation</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Example: $100K in Texas</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { step: "1", op: "Start with Gross Annual Salary", val: "$100,000.00" },
                    { step: "2", op: `Subtract Standard Deduction (${TAX_YEAR} single filer: $${stdDeduction.toLocaleString()})`, val: `− $${stdDeduction.toLocaleString()} = $${(EXAMPLE_SALARY - stdDeduction).toLocaleString()}` },
                    { step: "3", op: "Apply Federal Progressive Brackets to Taxable Income", val: `${fmt(exTx.federalTax)} (${pct(exTx.effectiveFederalRate)} eff.)` },
                    { step: "4", op: `Social Security: 6.2% on wages up to $${ssTaxableMax.toLocaleString()}`, val: fmt(exTx.socialSecurity) },
                    { step: "5", op: "Medicare: 1.45% on all wages (+ 0.9% over $200K)", val: fmt(exTx.medicare) },
                    { step: "6", op: "State Income Tax (Texas = $0; varies by state)", val: "$0.00 (no state tax)" },
                    { step: "7", op: "Optional: Pre-tax deductions (401k, HSA, health insurance)", val: "Reduces taxable income in steps 3 + 4" },
                    { step: "=", op: "Take-Home Pay = Gross − Federal − SS − Medicare − State", val: `${fmt(exTx.takeHome)}/year` },
                  ].map(({ step, op, val }, i) => (
                    <tr key={step} className={`border-b border-gray-100 ${step === "=" ? "bg-green-50 font-bold" : i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-5 py-3 font-bold text-blue-700">{step}</td>
                      <td className="px-5 py-3 text-gray-700">{op}</td>
                      <td className="px-5 py-3 tabular-nums text-gray-900">{val}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Federal Tax Brackets */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">3. Federal Tax Brackets ({TAX_YEAR})</h2>
            <p className="mb-5 leading-relaxed">
              The US uses a <strong>progressive bracket system</strong>: only the income within each
              bracket is taxed at that bracket&apos;s rate. A taxpayer in the 22% bracket does
              <em> not</em> pay 22% on their entire income — only on the portion above the 12%
              bracket threshold.
            </p>
            <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Rate</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Single Filer — Taxable Income</th>
                    <th className="text-left px-5 py-3 font-bold text-gray-700">Married Filing Jointly</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["10%", "$0 – $11,925", "$0 – $23,850"],
                    ["12%", "$11,926 – $48,475", "$23,851 – $96,950"],
                    ["22%", "$48,476 – $103,350", "$96,951 – $206,700"],
                    ["24%", "$103,351 – $197,300", "$206,701 – $394,600"],
                    ["32%", "$197,301 – $250,525", "$394,601 – $501,050"],
                    ["35%", "$250,526 – $626,350", "$501,051 – $751,600"],
                    ["37%", "Over $626,350", "Over $751,600"],
                  ].map(([rate, single, mfj], i) => (
                    <tr key={rate} className={`border-b border-gray-100 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/50"}`}>
                      <td className="px-5 py-3 font-bold text-blue-700">{rate}</td>
                      <td className="px-5 py-3 tabular-nums text-gray-700">{single}</td>
                      <td className="px-5 py-3 tabular-nums text-gray-700">{mfj}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-gray-500">
              Source: IRS Rev. Proc. 2025-32. Taxable income = Gross Salary − Standard Deduction.
              Standard deduction for {TAX_YEAR}: Single ${stdDeduction.toLocaleString()} · MFJ $32,200 · HOH $24,200.
            </p>
          </section>

          {/* FICA */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">4. FICA Taxes (Social Security + Medicare)</h2>
            <p className="mb-5 leading-relaxed">
              FICA taxes are the same in every US state — they are federal payroll taxes applied to
              earned income regardless of where you live. Employees pay the employee share shown below;
              employers pay an identical matching amount separately.
            </p>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                {
                  label: "Social Security",
                  rate: "6.2%",
                  detail: `On wages up to $${ssTaxableMax.toLocaleString()} (the ${TAX_YEAR} wage base). No SS on wages above this ceiling.`,
                  example: `$100K → ${fmt(exTx.socialSecurity)}/yr`,
                  color: "blue",
                },
                {
                  label: "Medicare",
                  rate: "1.45%",
                  detail: "On all wages — no cap. Same rate regardless of income level.",
                  example: `$100K → ${fmt(exTx.medicare)}/yr`,
                  color: "indigo",
                },
                {
                  label: "Additional Medicare",
                  rate: "0.9%",
                  detail: "On wages above $200,000 (single). Not matched by employer.",
                  example: "Only applies above $200K",
                  color: "purple",
                },
              ].map(({ label, rate, detail, example, color }) => (
                <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                  <p className={`text-2xl font-black text-${color}-700 mb-1`}>{rate}</p>
                  <p className={`font-bold text-${color}-900 mb-2`}>{label}</p>
                  <p className="text-sm text-gray-600 mb-2">{detail}</p>
                  <p className={`text-xs font-semibold text-${color}-600`}>{example}</p>
                </div>
              ))}
            </div>
          </section>

          {/* State Tax Treatment */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">5. State Income Tax Treatment</h2>
            <p className="mb-5 leading-relaxed">
              State tax rules vary significantly. TakeHomeUSA uses the following classification for
              each of the 50 states:
            </p>
            <div className="space-y-4">
              {[
                {
                  type: "No Income Tax (9 states)",
                  states: "Alaska, Florida, Nevada, New Hampshire*, South Dakota, Tennessee, Texas, Washington, Wyoming",
                  treatment: "State tax = $0. Only federal + FICA apply.",
                  color: "green",
                  note: "* New Hampshire taxes investment income but not wages.",
                },
                {
                  type: "Flat Rate States",
                  states: "Arizona (2.5%), Colorado (4.4%), Georgia (5.49%), Idaho (5.8%), Illinois (4.95%), Indiana (3.15%), Kentucky (4.0%), Massachusetts (5.0%), Michigan (4.25%), Mississippi (4.7%), North Carolina (4.5%), Pennsylvania (3.07%), Utah (4.85%)",
                  treatment: "A single percentage applied to all (or most) taxable income above state exemptions. Our model uses each state&apos;s official rate and standard deduction/exemption where applicable.",
                  color: "blue",
                  note: undefined,
                },
                {
                  type: "Progressive Bracket States",
                  states: "California, New York, New Jersey, Oregon, Minnesota, Hawaii, and others",
                  treatment: "Multiple brackets similar to federal. We implement each state&apos;s full bracket table exactly as published by the state tax authority.",
                  color: "indigo",
                  note: undefined,
                },
              ].map(({ type, states, treatment, color, note }) => (
                <div key={type} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                  <p className={`font-bold text-${color}-900 mb-2`}>{type}</p>
                  <p className="text-sm text-gray-600 mb-2"><strong>States:</strong> {states}</p>
                  <p className="text-sm text-gray-700">{treatment}</p>
                  {note && <p className="text-xs text-gray-500 mt-2 italic">{note}</p>}
                </div>
              ))}
            </div>
          </section>

          {/* Worked Example */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">6. Worked Example: $100,000 Salary</h2>
            <p className="mb-5 leading-relaxed">
              Here is the full calculation for a $100,000 annual salary, single filer, standard
              deduction, in two states — Texas (no state tax) and California (highest state tax):
            </p>
            <div className="grid sm:grid-cols-2 gap-6">
              {[
                { label: "Texas", tax: exTx, noTax: true, color: "green" },
                { label: "California", tax: exCa, noTax: false, color: "blue" },
              ].map(({ label, tax, noTax, color }) => (
                <div key={label} className={`bg-${color}-50 border border-${color}-200 rounded-xl p-5`}>
                  <p className={`font-bold text-${color}-900 text-lg mb-4`}>{label} {noTax && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full ml-2">No state tax</span>}</p>
                  <div className="space-y-2 text-sm">
                    {[
                      ["Gross Salary", "$100,000"],
                      ["Standard Deduction", `− $${stdDeduction.toLocaleString()}`],
                      ["Taxable Income", `= $${(EXAMPLE_SALARY - stdDeduction).toLocaleString()}`],
                      ["Federal Income Tax", `− ${fmt(tax.federalTax)} (${pct(tax.effectiveFederalRate)} eff.)`],
                      ["Social Security", `− ${fmt(tax.socialSecurity)}`],
                      ["Medicare", `− ${fmt(tax.medicare)}`],
                      ["State Income Tax", noTax ? "− $0.00" : `− ${fmt(tax.stateTax)}`],
                    ].map(([k, v]) => (
                      <div key={k} className="flex justify-between">
                        <span className="text-gray-600">{k}</span>
                        <span className="font-semibold tabular-nums text-gray-900">{v}</span>
                      </div>
                    ))}
                    <div className={`flex justify-between pt-2 border-t border-${color}-200`}>
                      <span className={`font-bold text-${color}-900`}>Take-Home Pay</span>
                      <span className={`font-black text-${color}-700 tabular-nums text-lg`}>{fmt(tax.takeHome)}/yr</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-xs">Monthly</span>
                      <span className="font-bold text-gray-700 text-xs tabular-nums">{fmt(tax.takeHome / 12)}/mo</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Key Assumptions */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">7. Key Assumptions & Limitations</h2>
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <p className="font-bold text-yellow-900 mb-4">What this calculator assumes by default:</p>
              <ul className="space-y-2 text-sm text-gray-700">
                {[
                  "Single filing status (adjustable in the calculator)",
                  `Standard deduction ($${stdDeduction.toLocaleString()} for single filers in ${TAX_YEAR}) — not itemized deductions`,
                  "W-2 wage income only (not self-employment, capital gains, or passive income)",
                  "No pre-tax deductions unless entered in optional fields (401k, HSA, health insurance)",
                  "No tax credits (child tax credit, EITC, etc.)",
                  "No AMT (Alternative Minimum Tax)",
                  "No local/city taxes unless explicitly selected (NYC, Philadelphia, etc.)",
                  "Employee share of FICA only (employer-matched portion not shown)",
                ].map((item) => (
                  <li key={item} className="flex gap-2 items-start">
                    <span className="text-yellow-600 font-bold shrink-0">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-gray-500 mt-4 leading-relaxed">
              These defaults produce a useful baseline estimate for most W-2 employees. Use the
              calculator&apos;s optional fields to adjust for 401k contributions, health insurance
              premiums, and filing status. For personalized tax planning, consult a licensed CPA.
            </p>
          </section>

          {/* Update Cadence */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">8. Update Cadence</h2>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 text-sm space-y-3">
              <div className="flex gap-4">
                <span className="font-bold text-gray-700 shrink-0 w-32">Federal Brackets</span>
                <span>Updated annually when IRS publishes the Revenue Procedure (typically October/November). Current data: IRS Rev. Proc. 2025-32 for {TAX_YEAR}.</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-700 shrink-0 w-32">State Tax Rates</span>
                <span>Reviewed and updated each January 1 when state legislative changes take effect. Any mid-year changes are applied within 30 days of state publication.</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-700 shrink-0 w-32">FICA Wage Base</span>
                <span>Updated annually per SSA announcement (typically October/November).</span>
              </div>
              <div className="flex gap-4 pt-3 border-t border-gray-200">
                <span className="font-bold text-gray-700 shrink-0 w-32">Last Updated</span>
                <span>January 1, {TAX_YEAR} — all calculations reflect {TAX_YEAR} IRS + state law.</span>
              </div>
            </div>
          </section>

          {/* Cite Us */}
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">9. How to Cite TakeHomeUSA</h2>
            <p className="mb-4 leading-relaxed">
              Journalists, bloggers, and researchers are welcome to cite our data. We ask only for a
              hyperlink back to the relevant page. Suggested citation formats:
            </p>
            <div className="space-y-3">
              {[
                {
                  label: "Short mention",
                  text: "TakeHomeUSA (takehomeusa.com)",
                },
                {
                  label: "Standard inline citation",
                  text: `According to TakeHomeUSA (takehomeusa.com), a free salary after-tax calculator covering all 50 US states using ${TAX_YEAR} IRS tax brackets.`,
                },
                {
                  label: "Academic / formal reference",
                  text: `TakeHomeUSA. (${TAX_YEAR}). Salary After-Tax Calculator [Online Tool]. Retrieved from https://www.takehomeusa.com. Data based on ${TAX_YEAR} IRS Rev. Proc. 2025-32 tax brackets.`,
                },
              ].map(({ label, text }) => (
                <div key={label} className="bg-white border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">{label}</p>
                  <p className="text-sm text-gray-700 font-mono leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-500 mt-4">
              For media inquiries or data requests, visit our{" "}
              <Link href="/press" className="text-blue-600 hover:underline">Press & Media page</Link>.
            </p>
          </section>
        </div>

        {/* Footer nav */}
        <div className="mt-14 pt-8 border-t border-gray-200 flex flex-wrap gap-3">
          <Link href="/" className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm">
            Use the Calculator
          </Link>
          <Link href="/data" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
            Data Hub →
          </Link>
          <Link href="/press" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
            Press & Media →
          </Link>
          <Link href="/embed" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
            Embed Widgets →
          </Link>
        </div>
      </main>
    </>
  );
}
