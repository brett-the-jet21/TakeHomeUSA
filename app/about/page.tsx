export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: "About TakeHomeUSA — Free US Salary Calculator",
  description:
    `Free, accurate salary after-tax calculator for all 50 US states. Understand your exact take-home pay using real ${TAX_YEAR} IRS tax data. No signup required.`,
  alternates: { canonical: "https://www.takehomeusa.com/about" },
};

export default function AboutPage() {
  return (
    <main className="container-page py-12 max-w-3xl">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>/</span>
        <span className="text-gray-800">About</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl p-8 mb-10">
        <h1 className="text-3xl font-extrabold mb-3">About TakeHomeUSA</h1>
        <p className="text-blue-200 text-lg">
          A free, no-nonsense salary after-tax calculator built for real
          American workers who just want to know what they actually take home.
        </p>
      </div>

      <div className="space-y-10 text-gray-700">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Mission</h2>
          <p className="leading-relaxed">
            Most salary calculators are cluttered, slow, or require you to sign
            up for something. TakeHomeUSA is different: type in your salary, see
            your exact take-home pay — instantly, for free, with no account
            required.
          </p>
          <p className="leading-relaxed mt-3">
            We use real <strong>{TAX_YEAR} IRS federal tax brackets</strong> and
            up-to-date state tax rates so the numbers you see are accurate
            estimates you can actually plan around.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">How We Calculate</h2>
          <p className="leading-relaxed mb-4">
            Our calculations follow the same method as the IRS:
          </p>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2 text-sm">
            <div className="flex gap-3">
              <span className="font-bold text-blue-700 w-6">1.</span>
              <span>Start with your <strong>gross annual salary</strong></span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-700 w-6">2.</span>
              <span>Subtract the <strong>standard deduction</strong> (${TAX_YEAR === 2026 ? "16,100" : "14,600"} for {TAX_YEAR} single filers)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-700 w-6">3.</span>
              <span>Apply <strong>progressive federal tax brackets</strong> (10% → 37%)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-700 w-6">4.</span>
              <span>Add <strong>FICA taxes</strong>: Social Security (6.2%) + Medicare (1.45%)</span>
            </div>
            <div className="flex gap-3">
              <span className="font-bold text-blue-700 w-6">5.</span>
              <span>Apply <strong>state income tax</strong> (Texas = $0)</span>
            </div>
            <div className="flex gap-3 pt-2 border-t border-gray-200">
              <span className="font-bold text-green-700 w-6">✓</span>
              <span className="font-bold text-green-700">Result: Your take-home pay</span>
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-3">
            All calculations use {TAX_YEAR} IRS data and are never stored. Results default to single filer
            status and standard deduction — adjustable in the calculator.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Our Coverage</h2>
          <div className="bg-green-50 border border-green-200 rounded-xl p-5">
            <p className="font-bold text-green-800 mb-3">✓ Live — All 50 States</p>
            <ul className="text-sm text-green-700 space-y-1.5">
              <li>All 50 US states — federal + state tax calculations</li>
              <li>Texas: all salaries $20K–$500K in $1K steps (481 pages)</li>
              <li>All other states: $20K–$500K in $5K steps + extended range to $2M</li>
              <li>Hourly wage pages: $10–$100/hr × all 50 states</li>
              <li>All-states salary comparison for popular salary amounts</li>
              <li>City/local taxes: NYC, Philadelphia, Detroit, Baltimore, and more</li>
              <li>Real-time calculator: any salary, any state, instantly</li>
            </ul>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">Important Disclaimer</h2>
          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-5 text-sm">
            <p className="text-gray-700 leading-relaxed">
              TakeHomeUSA provides <strong>estimates for informational purposes
              only</strong>. While we strive for accuracy using current IRS data,
              your actual tax liability depends on many factors including filing
              status, deductions, credits, pre-tax contributions (401k, HSA,
              health insurance), and local/city taxes.
            </p>
            <p className="mt-3 text-gray-700">
              <strong>Always consult a licensed CPA or tax professional</strong>{" "}
              for personalized tax planning and advice.
            </p>
          </div>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 flex gap-4">
        <Link
          href="/"
          className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm"
        >
          Use the Calculator
        </Link>
        <Link
          href="/privacy"
          className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm"
        >
          Privacy Policy
        </Link>
      </div>
    </main>
  );
}
