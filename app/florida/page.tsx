import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Florida Salary After Tax Calculator — Coming Soon | TakeHomeUSA",
  description:
    "Florida has NO state income tax — one of only 9 states. Our Florida salary after-tax calculator is coming soon. Compare with Texas (also 0% state tax) now.",
  alternates: { canonical: "https://www.takehomeusa.com/florida" },
};

export default function FloridaPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-orange-600 to-orange-500 text-white">
        <div className="container-page py-14">
          <nav className="text-orange-200 text-sm mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-white">States</Link>
            <span>/</span>
            <span className="text-white">Florida</span>
          </nav>

          <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            Coming Soon — No State Tax!
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Florida Salary<br />
            <span className="text-orange-200">After Tax Calculator</span>
          </h1>
          <p className="text-orange-100 text-lg max-w-2xl mb-6">
            Great news: <strong className="text-white">Florida has zero state
            income tax</strong>, just like Texas. Your take-home pay in Florida
            is the same as Texas for federal+FICA purposes. Our dedicated Florida
            calculator is launching soon.
          </p>
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-xl px-5 py-3 text-white font-semibold">
            <span className="text-2xl">🌴</span>
            <span>Florida: 0% State Income Tax</span>
          </div>
        </div>
      </section>

      {/* Good news */}
      <section className="container-page my-12">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-3">
            Florida &amp; Texas: Same Take-Home Pay!
          </h2>
          <p className="text-gray-600 mb-4">
            Both Florida and Texas have zero state income tax. This means your
            federal taxes and FICA are identical in both states. While we build
            the Florida calculator, you can use our Texas calculator to see your
            exact take-home — the numbers will be the same!
          </p>
          <div className="flex flex-wrap gap-3">
            {[50_000, 75_000, 100_000, 125_000, 150_000].map((amt) => (
              <Link
                key={amt}
                href={`/salary/${amt}-salary-after-tax-texas`}
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-green-700 transition-colors"
              >
                ${amt.toLocaleString()} take-home →
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-page mb-12 text-center">
        <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-3">
            Florida Calculator Coming Soon
          </h3>
          <p className="text-gray-600 mb-6">
            We&apos;re expanding to all 50 states. Florida is next up after Texas.
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/texas"
              className="bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors"
            >
              Use Texas Calculator (same results)
            </Link>
            <Link
              href="/states"
              className="border border-gray-300 text-gray-700 px-6 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
            >
              View All States
            </Link>
          </div>
        </div>
      </section>

      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
