import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "TakeHomeUSA — Salary After Tax Calculator",
    template: "%s | TakeHomeUSA",
  },
  description:
    "Free salary after-tax calculator for every US state. See your exact take-home pay, federal tax breakdown, and monthly paycheck. Starting with Texas — all 50 states coming soon.",
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
          ── Google AdSense ────────────────────────────────────────────────────
          Replace YOUR_PUBLISHER_ID with your actual ca-pub-XXXXXXXXXXXXXXXX ID.
          Uncomment the script tag below once your site is approved.
          ──────────────────────────────────────────────────────────────────── */}
        {/* <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-YOUR_PUBLISHER_ID"
          crossOrigin="anonymous"
        /> */}
      </head>
      <body className="flex flex-col min-h-screen">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-page flex items-center justify-between h-14">
            <Link
              href="/"
              className="flex items-center gap-2 font-bold text-gray-900 text-lg hover:text-blue-700 transition-colors"
            >
              <span className="text-blue-700">$</span>
              <span>TakeHomeUSA</span>
            </Link>

            <nav className="flex items-center gap-6 text-sm font-medium">
              <Link
                href="/salary/100000-salary-after-tax-texas"
                className="text-gray-600 hover:text-blue-700 transition-colors"
              >
                Texas
              </Link>
              <span className="text-gray-300">|</span>
              <span className="text-gray-400 cursor-default" title="Coming soon">
                All States ↗
              </span>
              <Link
                href="/"
                className="bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-blue-800 transition-colors"
              >
                Calculator
              </Link>
            </nav>
          </div>
        </header>

        {/* ── Page Content ─────────────────────────────────────────────────── */}
        <div className="flex-1">{children}</div>

        {/* ── Footer ───────────────────────────────────────────────────────── */}
        <footer className="bg-gray-900 text-gray-400 mt-16">
          <div className="container-page py-12 grid sm:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 text-white font-bold text-lg mb-3">
                <span className="text-blue-400">$</span>
                <span>TakeHomeUSA</span>
              </div>
              <p className="text-sm leading-relaxed">
                Free, accurate salary after-tax calculator for every US state.
                Powered by real {new Date().getFullYear() - 1} federal tax
                brackets.
              </p>
            </div>

            {/* State calculators */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                State Calculators
              </h3>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/salary/100000-salary-after-tax-texas"
                    className="hover:text-white transition-colors"
                  >
                    Texas Salary Calculator
                  </Link>
                </li>
                <li className="text-gray-600">California (coming soon)</li>
                <li className="text-gray-600">New York (coming soon)</li>
                <li className="text-gray-600">Florida (coming soon)</li>
              </ul>
            </div>

            {/* Popular */}
            <div>
              <h3 className="text-white font-semibold mb-3 text-sm uppercase tracking-wide">
                Popular Texas Calculators
              </h3>
              <ul className="space-y-2 text-sm">
                {[50000, 75000, 100000, 125000, 150000, 200000].map((n) => (
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

          <div className="border-t border-gray-800">
            <div className="container-page py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p>
                © {new Date().getFullYear()} TakeHomeUSA.com · All rights
                reserved
              </p>
              <p className="text-center">
                For informational purposes only. Consult a tax professional for
                personalized advice. Numbers based on 2024 IRS tax brackets,
                single filer, standard deduction.
              </p>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
