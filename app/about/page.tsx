import type { Metadata } from "next";
import Link from "next/link";
import { STANDARD_DEDUCTION_2026 } from "@/lib/tax";
import { ALL_STATES } from "@/lib/states";

export const metadata: Metadata = {
  title: "About TakeHomeUSA — How We Calculate Your Take-Home Pay",
  description:
    "Learn how TakeHomeUSA calculates after-tax income using 2026 federal and state tax brackets, including FICA and the standard deduction.",
  alternates: {
    canonical: "https://www.takehomeusa.com/about",
  },
};

export default function AboutPage() {
  const noTaxStates = ALL_STATES.filter((s) => s.taxType === "none");
  const flatTaxStates = ALL_STATES.filter((s) => s.taxType === "flat");

  return (
    <main className="min-h-screen p-8 flex justify-center">
      <article className="w-full max-w-2xl space-y-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="text-sm opacity-70">
          <Link href="/" className="underline">Home</Link>
          <span className="mx-2">/</span>
          <span>About</span>
        </nav>

        <h1 className="text-4xl font-bold">About TakeHomeUSA</h1>

        <p className="text-lg opacity-80">
          TakeHomeUSA is a free salary after-tax calculator covering all 50 U.S. states.
          Enter any salary and instantly see your annual, monthly, bi-weekly, weekly and hourly
          take-home pay along with a clear breakdown of federal, FICA and state taxes.
          All calculations use <strong>2026 federal and state tax brackets</strong>.
        </p>

        {/* Coverage */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Coverage</h2>
          <p className="opacity-80">
            TakeHomeUSA provides interactive calculators and pre-built salary pages for{" "}
            <strong>all 50 states</strong>, giving workers across the country an easy way to
            understand their real take-home pay. Each state page includes a detailed tax breakdown
            tailored to that state&rsquo;s income tax rules.
          </p>
          <ul className="mt-3 list-disc list-inside opacity-80 space-y-1">
            <li>
              <strong>{noTaxStates.length} states with no state income tax</strong> (e.g., Texas,
              Florida, Nevada, Wyoming, Washington, Alaska)
            </li>
            <li>
              <strong>{flatTaxStates.length} states with a flat income tax rate</strong> (e.g.,
              Illinois 4.95%, Colorado 4.4%, Pennsylvania 3.07%)
            </li>
            <li>
              <strong>
                {ALL_STATES.length - noTaxStates.length - flatTaxStates.length} states with
                progressive income tax brackets
              </strong>{" "}
              (e.g., California, New York, Oregon)
            </li>
          </ul>
        </section>

        {/* How We Calculate */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">How We Calculate</h2>

          <p className="opacity-80 mb-4">
            All calculations assume a <strong>single filer</strong> taking the{" "}
            <strong>
              2026 standard deduction of ${STANDARD_DEDUCTION_2026.toLocaleString("en-US")}
            </strong>
            . We do not currently model married filing jointly, itemized deductions, pre-tax
            retirement contributions, or local/city taxes.
          </p>

          <h3 className="text-lg font-semibold mb-2">1. Federal Income Tax (2026 Brackets)</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border-collapse" aria-label="2026 federal tax brackets for single filers">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Rate</th>
                  <th className="text-left py-2 pr-4">Taxable Income</th>
                </tr>
              </thead>
              <tbody className="opacity-80">
                <tr className="border-b"><td className="py-1 pr-4">10%</td><td>$0 – $11,925</td></tr>
                <tr className="border-b"><td className="py-1 pr-4">12%</td><td>$11,925 – $48,475</td></tr>
                <tr className="border-b"><td className="py-1 pr-4">22%</td><td>$48,475 – $103,350</td></tr>
                <tr className="border-b"><td className="py-1 pr-4">24%</td><td>$103,350 – $197,300</td></tr>
                <tr className="border-b"><td className="py-1 pr-4">32%</td><td>$197,300 – $250,525</td></tr>
                <tr className="border-b"><td className="py-1 pr-4">35%</td><td>$250,525 – $626,350</td></tr>
                <tr><td className="py-1 pr-4">37%</td><td>Over $626,350</td></tr>
              </tbody>
            </table>
          </div>
          <p className="mt-2 text-sm opacity-60">
            Taxable income = Gross salary − ${STANDARD_DEDUCTION_2026.toLocaleString("en-US")}{" "}
            standard deduction
          </p>

          <h3 className="text-lg font-semibold mb-2 mt-6">2. FICA Taxes</h3>
          <ul className="list-disc list-inside opacity-80 space-y-1 text-sm">
            <li>Social Security: 6.2% on the first $176,100 of wages (2026 wage base)</li>
            <li>Medicare: 1.45% on all wages</li>
            <li>Additional Medicare: 0.9% on wages above $200,000</li>
          </ul>

          <h3 className="text-lg font-semibold mb-2 mt-6">3. State Income Tax</h3>
          <p className="opacity-80 text-sm">
            State tax is estimated using each state&rsquo;s 2026 rate schedule. For states with
            progressive brackets, we apply the brackets to federal taxable income as a
            simplification. For flat-rate states, the published flat rate is applied. States with
            no income tax on wages have zero state tax.
          </p>
        </section>

        {/* Assumptions */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Assumptions &amp; Limitations</h2>
          <ul className="list-disc list-inside opacity-80 space-y-2 text-sm">
            <li>Filing status: Single</li>
            <li>Deduction: Standard deduction only (${STANDARD_DEDUCTION_2026.toLocaleString("en-US")} for 2026)</li>
            <li>No pre-tax deductions (401(k), HSA, FSA, etc.)</li>
            <li>No local or city taxes (e.g., New York City tax)</li>
            <li>No tax credits applied</li>
            <li>Tax year: 2026</li>
            <li>State progressive rates are approximated; consult a tax professional for precise figures</li>
          </ul>
        </section>

        {/* Data sources */}
        <section>
          <h2 className="text-2xl font-semibold mb-3">Data Sources</h2>
          <p className="opacity-80 text-sm">
            Federal tax brackets and the standard deduction are based on IRS guidance for tax year
            2026. State income tax rates are sourced from each state&rsquo;s department of revenue
            and major tax-policy research organizations. All figures are updated annually.
          </p>
        </section>

        <div className="pt-4 border-t flex gap-6 text-sm">
          <Link href="/" className="underline">Try the Calculator</Link>
          <Link href="/states" className="underline">All State Guides</Link>
          <Link href="/privacy" className="underline">Privacy Policy</Link>
        </div>
      </article>
    </main>
  );
}
