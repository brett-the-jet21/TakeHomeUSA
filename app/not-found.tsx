import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Page Not Found | TakeHomeUSA",
  description: "This page doesn't exist. Find your salary after-tax calculation below.",
  robots: { index: false, follow: true },
};

const POPULAR_LINKS = [
  { label: "$50,000 in Texas",      href: "/salary/50000-salary-after-tax-texas" },
  { label: "$75,000 in Texas",      href: "/salary/75000-salary-after-tax-texas" },
  { label: "$100,000 in Texas",     href: "/salary/100000-salary-after-tax-texas" },
  { label: "$100,000 in California",href: "/salary/100000-salary-after-tax-california" },
  { label: "$80,000 in New York",   href: "/salary/80000-salary-after-tax-new-york" },
  { label: "$60,000 in Florida",    href: "/salary/60000-salary-after-tax-florida" },
];

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 py-20 text-center">

      {/* Status */}
      <div className="inline-flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold px-4 py-2 rounded-full mb-8">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        404 — Page not found
      </div>

      <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
        That salary page<br />doesn't exist yet
      </h1>

      <p className="text-gray-500 text-lg max-w-md mb-10">
        The URL may have an unsupported salary amount or state. Use the
        calculator below to get the exact number you need.
      </p>

      {/* Primary CTA */}
      <Link
        href="/"
        className="inline-block bg-blue-700 hover:bg-blue-800 text-white font-bold text-lg px-10 py-4 rounded-2xl transition-colors mb-10"
      >
        Open the Calculator →
      </Link>

      {/* Popular quick links */}
      <div className="w-full max-w-lg text-left">
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
          Popular Calculations
        </p>
        <div className="grid grid-cols-2 gap-2">
          {POPULAR_LINKS.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="bg-gray-50 hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-all"
            >
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* State directory link */}
      <p className="mt-8 text-sm text-gray-400">
        Looking for a specific state?{" "}
        <Link href="/states" className="text-blue-600 hover:underline font-medium">
          Browse all 50 state calculators →
        </Link>
      </p>
    </div>
  );
}
