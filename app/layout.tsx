import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: {
    default: "TakeHomeUSA — Salary After Tax Calculator, All 50 States",
    template: "%s | TakeHomeUSA",
  },
  description:
    `Free salary after-tax calculator for all 50 US states. See your exact take-home pay, federal and state tax breakdown, and monthly paycheck — powered by ${TAX_YEAR} IRS tax brackets.`,
  metadataBase: new URL("https://www.takehomeusa.com"),
  alternates: { canonical: "https://www.takehomeusa.com/" },
  keywords: [
    "salary after tax calculator",
    "take home pay calculator",
    "paycheck calculator",
    "after tax income",
    "net pay calculator",
    "salary calculator all states",
    "Texas salary after tax",
    "California salary after tax",
    "New York salary after tax",
    "Florida salary after tax",
    "no state income tax states",
    `${TAX_YEAR} tax brackets`,
  ],
  openGraph: {
    siteName: "TakeHomeUSA",
    type: "website",
    locale: "en_US",
    url: "https://www.takehomeusa.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  other: {
    "google-adsense-account": "ca-pub-8025748227928688",
  },
};

// No-tax states for the nav dropdown — hardcoded so layout stays a server component
const NO_TAX_NAV = [
  { name: "Texas",         slug: "texas" },
  { name: "Florida",       slug: "florida" },
  { name: "Nevada",        slug: "nevada" },
  { name: "Washington",    slug: "washington" },
  { name: "Wyoming",       slug: "wyoming" },
  { name: "Alaska",        slug: "alaska" },
  { name: "South Dakota",  slug: "south-dakota" },
  { name: "Tennessee",     slug: "tennessee" },
  { name: "New Hampshire", slug: "new-hampshire" },
];

const POPULAR_TAXED_NAV = [
  { name: "New York",    slug: "new-york",    rate: "10.9%" },
  { name: "California",  slug: "california",  rate: "13.3%" },
  { name: "Illinois",    slug: "illinois",    rate: "4.95%" },
  { name: "Colorado",    slug: "colorado",    rate: "4.4%"  },
  { name: "Virginia",    slug: "virginia",    rate: "5.75%" },
  { name: "Oregon",      slug: "oregon",      rate: "9.9%"  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head />
      <body className="flex flex-col min-h-screen bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "TakeHomeUSA",
              url: "https://www.takehomeusa.com",
              description: `Free salary after-tax calculator for all 50 US states. ${TAX_YEAR} IRS tax brackets.`,
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "TakeHomeUSA",
              url: "https://www.takehomeusa.com",
              description: "Free, accurate salary after-tax calculators for all 50 US states.",
            }),
          }}
        />

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-page flex items-center justify-between h-14">

            {/* Logo */}
            <Link
              href="/"
              className="flex items-center gap-1.5 font-extrabold text-gray-900 text-lg hover:text-blue-700 transition-colors"
            >
              <span className="text-blue-700 text-xl">$</span>
              <span>TakeHomeUSA</span>
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1 text-sm font-medium">

              {/* States dropdown — CSS hover only (server component safe) */}
              <div className="relative group hidden sm:block">
                <Link
                  href="/states"
                  className="flex items-center gap-1 px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  State Guides
                  <svg className="w-3.5 h-3.5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </Link>

                {/* Dropdown panel */}
                <div className="absolute top-full left-0 mt-1 w-72 bg-white rounded-2xl shadow-xl border border-gray-200 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
                  <p className="px-4 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    No State Income Tax
                  </p>
                  <div className="grid grid-cols-2 gap-0.5 px-2 mb-3">
                    {NO_TAX_NAV.map((s) => (
                      <Link
                        key={s.slug}
                        href={`/${s.slug}`}
                        className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-green-50 text-sm text-gray-700 hover:text-green-700 transition-colors"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 flex-shrink-0" />
                        {s.name}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-2 mx-2">
                    <p className="px-2 pb-2 text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Popular State Calculators
                    </p>
                    <div className="grid grid-cols-2 gap-0.5">
                      {POPULAR_TAXED_NAV.map((s) => (
                        <Link
                          key={s.slug}
                          href={`/${s.slug}`}
                          className="flex items-center justify-between px-2 py-1.5 rounded-lg hover:bg-blue-50 text-sm text-gray-700 hover:text-blue-700 transition-colors"
                        >
                          <span>{s.name}</span>
                          <span className="text-xs text-gray-400">{s.rate}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                  <div className="border-t border-gray-100 mt-2 pt-2 px-4">
                    <Link href="/states" className="text-xs text-blue-600 font-semibold hover:text-blue-800 transition-colors">
                      View all 50 states →
                    </Link>
                  </div>
                </div>
              </div>

              {/* Mobile: just the link */}
              <Link
                href="/states"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors sm:hidden"
              >
                States
              </Link>

              <Link
                href="/about"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors hidden sm:block"
              >
                About
              </Link>

              <Link
                href="/"
                className="ml-2 bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-800 transition-colors"
              >
                Calculator
              </Link>
            </nav>
          </div>
        </header>

        {/* ── Content ─────────────────────────────────────────────────────────── */}
        <div className="flex-1">{children}</div>

        {/* ── Footer ──────────────────────────────────────────────────────────── */}
        <footer className="bg-gray-950 text-gray-400 mt-16 border-t border-gray-800">
          <div className="container-page py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-1.5 text-white font-extrabold text-lg mb-3 hover:text-blue-400 transition-colors">
                <span className="text-blue-400 text-xl">$</span>
                <span>TakeHomeUSA</span>
              </Link>
              <p className="text-sm leading-relaxed mb-4">
                Free, accurate salary after-tax calculators for all 50 US states.
                Real {TAX_YEAR} IRS tax brackets. No signup required.
              </p>
              <div className="flex gap-3 text-xs">
                <Link href="/about"   className="hover:text-white transition-colors">About</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/states"  className="hover:text-white transition-colors">All States</Link>
              </div>
            </div>

            {/* No-Tax States */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                No-Tax States
              </h3>
              <ul className="space-y-2.5 text-sm">
                {NO_TAX_NAV.map((s) => (
                  <li key={s.slug}>
                    <Link href={`/${s.slug}`} className="flex items-center gap-2 hover:text-white transition-colors">
                      <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                      {s.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Popular Salaries */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                Popular in Texas
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[50_000, 75_000, 100_000, 125_000, 150_000, 200_000].map((n) => (
                  <li key={n}>
                    <Link href={`/salary/${n}-salary-after-tax-texas`} className="hover:text-white transition-colors">
                      ${n.toLocaleString()} in Texas
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Other State Calculators */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                State Calculators
              </h3>
              <ul className="space-y-2.5 text-sm">
                {POPULAR_TAXED_NAV.map((s) => (
                  <li key={s.slug}>
                    <Link
                      href={`/${s.slug}`}
                      className="hover:text-white transition-colors"
                    >
                      {s.name} — {s.rate}
                    </Link>
                  </li>
                ))}
                <li>
                  <Link href="/states" className="text-blue-400 hover:text-blue-300 font-medium transition-colors">
                    All 50 states →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800">
            <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p>© {new Date().getFullYear()} TakeHomeUSA.com · All rights reserved</p>
              <p className="text-center max-w-xl">
                For informational purposes only. Numbers based on {TAX_YEAR} IRS tax
                brackets, single filer, standard deduction. Not tax advice —
                consult a CPA for personalized guidance.
              </p>
            </div>
          </div>
        </footer>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8025748227928688"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
