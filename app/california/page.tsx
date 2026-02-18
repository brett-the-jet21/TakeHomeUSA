import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "California Salary After Tax Calculator | TakeHomeUSA",
  description:
    "California has the highest state income tax in the US — up to 13.3%. See your take-home pay in California and compare it to Texas (0% state tax). Calculator launching soon.",
  alternates: { canonical: "https://www.takehomeusa.com/california" },
};

const CA_FACTS = [
  { label: "Top State Tax Rate", value: "13.3%", note: "Highest in the US" },
  { label: "SDI (State Disability)", value: "0.9%", note: "On all wages" },
  { label: "$100K Take-Home (est.)", value: "~$68,000", note: "vs. $78,509 in Texas" },
  { label: "Tax Savings in Texas", value: "+$10,500/yr", note: "On a $100K salary" },
];

export default function CaliforniaPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-slate-800 to-slate-700 text-white">
        <div className="container-page py-14">
          <nav className="text-slate-400 text-sm mb-6 flex items-center gap-2">
            <Link href="/" className="hover:text-white">Home</Link>
            <span>/</span>
            <Link href="/states" className="hover:text-white">States</Link>
            <span>/</span>
            <span className="text-white">California</span>
          </nav>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            California Salary<br />
            <span className="text-slate-300">After Tax Calculator</span>
          </h1>
          <p className="text-slate-300 text-lg max-w-2xl mb-6">
            California has the highest state income tax in the country — up to
            13.3% for top earners. Our dedicated California calculator is
            available at{" "}
            <a
              href="https://californiasalaryaftertax.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline hover:no-underline font-semibold"
            >
              californiasalaryaftertax.com
            </a>
            .
          </p>
          <a
            href="https://californiasalaryaftertax.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-white text-slate-900 font-bold px-6 py-3 rounded-xl hover:bg-slate-100 transition-colors text-lg"
          >
            Go to California Calculator →
          </a>
        </div>
      </section>

      {/* Key facts */}
      <section className="container-page my-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">California Tax Facts</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CA_FACTS.map(({ label, value, note }) => (
            <div key={label} className="bg-white border border-gray-200 rounded-xl p-5">
              <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
              <p className="text-2xl font-black text-gray-900 mb-1">{value}</p>
              <p className="text-xs text-gray-500">{note}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Texas vs California comparison */}
      <section className="bg-blue-50 border-y border-blue-100 py-12">
        <div className="container-page">
          <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">
            California vs. Texas — How Much More Do You Keep?
          </h2>
          <p className="text-gray-500 text-center text-sm mb-8">
            Texas has zero state income tax. The difference is substantial.
          </p>
          <div className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm max-w-2xl mx-auto">
            <table className="tax-table">
              <thead>
                <tr>
                  <th>Salary</th>
                  <th>Texas Take-Home</th>
                  <th>California (est.)</th>
                  <th>TX Advantage</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { amt: 60_000,  tx: 47_943, ca: 44_000 },
                  { amt: 100_000, tx: 78_509, ca: 68_000 },
                  { amt: 150_000, tx: 112_872, ca: 97_000 },
                  { amt: 200_000, tx: 144_672, ca: 124_000 },
                ].map(({ amt, tx, ca }) => (
                  <tr key={amt}>
                    <td className="font-semibold">${amt.toLocaleString()}</td>
                    <td className="font-bold text-green-700">${tx.toLocaleString()}</td>
                    <td className="text-gray-500">${ca.toLocaleString()}</td>
                    <td className="font-bold text-blue-700">
                      +${(tx - ca).toLocaleString()}/yr
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-center text-xs text-gray-400 mt-4">
            * California estimates approximate. For exact CA numbers, visit californiasalaryaftertax.com
          </p>
        </div>
      </section>

      {/* CTA */}
      <section className="container-page my-12 text-center">
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <a
            href="https://californiasalaryaftertax.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block bg-slate-800 text-white font-bold px-6 py-4 rounded-xl hover:bg-slate-900 transition-colors"
          >
            California Calculator →<br />
            <span className="text-slate-400 font-normal text-sm">californiasalaryaftertax.com</span>
          </a>
          <Link
            href="/texas"
            className="block bg-blue-700 text-white font-bold px-6 py-4 rounded-xl hover:bg-blue-800 transition-colors"
          >
            Texas Calculator →<br />
            <span className="text-blue-300 font-normal text-sm">0% state income tax</span>
          </Link>
        </div>
      </section>

      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
