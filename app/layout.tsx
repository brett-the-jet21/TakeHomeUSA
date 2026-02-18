import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TakeHomeUSA — Salary After Tax Calculator",
    template: "%s | TakeHomeUSA",
  },
  description:
    "Free salary after-tax calculator for every US state. See your exact take-home pay, federal tax breakdown, and monthly paycheck. Texas live now — all 50 states coming soon.",
  metadataBase: new URL("https://www.takehomeusa.com"),
  alternates: { canonical: "https://www.takehomeusa.com/" },
  keywords: [
    "salary after tax calculator",
    "take home pay calculator",
    "Texas salary calculator",
    "paycheck calculator",
    "after tax income",
    "net pay calculator",
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
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/*
          ── Google AdSense ───────────────────────────────────────────────────
          1. Replace ca-pub-YOUR_PUBLISHER_ID with your real publisher ID.
          2. Uncomment the <script> tag below.
          3. Add your <ins class="adsbygoogle"> units where the .ad-slot divs are.
          ─────────────────────────────────────────────────────────────────── */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body className="flex flex-col min-h-screen bg-white">

        {/* ── Header ─────────────────────────────────────────────────────── */}
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
              <Link
                href="/texas"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                Texas
              </Link>
              <Link
                href="/states"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
              >
                All States
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

        {/* ── Content ────────────────────────────────────────────────────── */}
        <div className="flex-1">{children}</div>

        {/* ── Footer ─────────────────────────────────────────────────────── */}
        <footer className="bg-gray-950 text-gray-400 mt-16 border-t border-gray-800">
          <div className="container-page py-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href="/" className="flex items-center gap-1.5 text-white font-extrabold text-lg mb-3 hover:text-blue-400 transition-colors">
                <span className="text-blue-400 text-xl">$</span>
                <span>TakeHomeUSA</span>
              </Link>
              <p className="text-sm leading-relaxed mb-4">
                Free, accurate salary after-tax calculators for every US state.
                Real IRS tax brackets. No signup required.
              </p>
              <div className="flex gap-3 text-xs">
                <Link href="/about" className="hover:text-white transition-colors">About</Link>
                <span>·</span>
                <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
                <span>·</span>
                <Link href="/states" className="hover:text-white transition-colors">All States</Link>
              </div>
            </div>

            {/* State Calculators */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                State Calculators
              </h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/texas" className="flex items-center gap-2 hover:text-white transition-colors group">
                    <span className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                    Texas — Live
                  </Link>
                </li>
                <li>
                  <Link href="/florida" className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    Florida — Coming Soon
                  </Link>
                </li>
                <li>
                  <Link href="/new-york" className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    New York — Coming Soon
                  </Link>
                </li>
                <li>
                  <Link href="/california" className="flex items-center gap-2 hover:text-white transition-colors">
                    <span className="w-2 h-2 rounded-full bg-amber-400 flex-shrink-0" />
                    California
                  </Link>
                </li>
                <li>
                  <Link href="/states" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                    View all 50 states →
                  </Link>
                </li>
              </ul>
            </div>

            {/* Popular Texas */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                Popular in Texas
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[50_000, 75_000, 100_000, 125_000, 150_000, 200_000].map((n) => (
                  <li key={n}>
                    <Link
                      href={`/salary/${n}-salary-after-tax-texas`}
                      className="hover:text-white transition-colors"
                    >
                      ${n.toLocaleString()} in Texas
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* More Texas */}
            <div>
              <h3 className="text-white font-bold mb-4 text-sm uppercase tracking-wide">
                More Texas Salaries
              </h3>
              <ul className="space-y-2.5 text-sm">
                {[60_000, 80_000, 90_000, 110_000, 175_000, 250_000].map((n) => (
                  <li key={n}>
                    <Link
                      href={`/salary/${n}-salary-after-tax-texas`}
                      className="hover:text-white transition-colors"
                    >
                      ${n.toLocaleString()} in Texas
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800">
            <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p>© {new Date().getFullYear()} TakeHomeUSA.com · All rights reserved</p>
              <p className="text-center max-w-xl">
                For informational purposes only. Numbers based on 2024 IRS tax
                brackets, single filer, standard deduction. Not tax advice —
                consult a CPA for personalized guidance.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
