import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "New York Salary After Tax Calculator — Coming Soon | TakeHomeUSA",
  description:
    "New York state income tax reaches 10.9%. Our New York salary after-tax calculator is coming soon. In the meantime, see how Texas (0% state tax) compares.",
  alternates: { canonical: "https://www.takehomeusa.com/new-york" },
};

export default function NewYorkPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="container-page py-14">
          <nav className="text-blue-400 text-sm mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-white">States</Link>
            <span>/</span>
            <span className="text-white">New York</span>
          </nav>

          <div className="inline-block bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            Coming Soon
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            New York Salary<br />
            <span className="text-blue-300">After Tax Calculator</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mb-8">
            New York has one of the highest state income tax rates in the US —
            up to <strong className="text-white">10.9%</strong> plus NYC city
            tax (up to <strong className="text-white">3.876%</strong>). Our New
            York calculator is launching soon.
          </p>
        </div>
      </section>

      {/* Key facts */}
      <section className="container-page my-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">New York Tax Overview</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Top State Tax Rate", value: "10.9%", note: "For income over $25M" },
            { label: "NYC City Tax", value: "3.876%", note: "Additional if you live in NYC" },
            { label: "Combined Top Rate", value: "14.78%", note: "State + NYC combined" },
            { label: "$100K Take-Home (est.)", value: "~$68,200", note: "vs. $78,509 in Texas" },
          ].map(({ label, value, note }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
              <p className="text-xs text-gray-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Compare to Texas */}
      <section className="bg-blue-50 border-y border-blue-100 py-10">
        <div className="container-page text-center">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            While You Wait — See Texas Take-Home
          </h2>
          <p className="text-gray-500 mb-6 text-sm">
            Texas has zero state income tax. See exactly how much more you&apos;d keep.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[60_000, 80_000, 100_000, 125_000, 150_000].map((amt) => (
              <Link
                key={amt}
                href={`/salary/${amt}-salary-after-tax-texas`}
                className="bg-blue-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                ${amt.toLocaleString()} in Texas →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <div className="container-page my-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            New York Calculator Coming Soon
          </h3>
          <p className="text-gray-600 mb-4">
            We&apos;re building out all 50 states. New York is high on the list.
            In the meantime, use our Texas calculator or check back soon.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/states"
              className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              View All States
            </Link>
            <Link
              href="/"
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              Use Calculator
            </Link>
          </div>
        </div>
      </div>

      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
