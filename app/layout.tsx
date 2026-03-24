import type { Metadata } from "next";
import Script from "next/script";
import Link from "next/link";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { TAX_YEAR } from "@/lib/tax";
import MobileNav from "./components/MobileNav";
import Logo from "./components/Logo";

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["700", "800"],
  variable: "--font-plus-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TakeHomeUSA — Salary After Tax Calculator, All 50 States",
    template: "%s | TakeHomeUSA",
  },
  description:
    `Free salary after-tax calculator for all 50 US states. Enter any salary, see your exact take-home pay in seconds — ${TAX_YEAR} IRS brackets. No signup needed.`,
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

// ─── Global JSON-LD entity graph ──────────────────────────────────────────────
// Consumed by Google, Bing, Perplexity, ChatGPT, Gemini, and other AI crawlers
// for entity extraction and action understanding.
const SITE_URL = "https://www.takehomeusa.com";

const JSON_LD_WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "TakeHomeUSA",
  url: SITE_URL,
  description: `Free salary after-tax calculator for all 50 US states. ${TAX_YEAR} IRS tax brackets.`,
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: `${SITE_URL}/salary/{salary}-salary-after-tax-{state}` },
    "query-input": "required name=salary required name=state",
  },
};

const JSON_LD_ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "TakeHomeUSA",
  url: SITE_URL,
  logo: { "@type": "ImageObject", url: `${SITE_URL}/icon.svg` },
  description: "Free, accurate salary after-tax calculators for all 50 US states.",
  knowsAbout: ["Income Tax", "Salary Calculation", "Take-Home Pay", "US State Taxes", "Federal Income Tax"],
};

// FinancialService — the core entity that AI systems use to classify this tool
const JSON_LD_FINANCIAL_SERVICE = {
  "@context": "https://schema.org",
  "@type": "FinancialService",
  "@id": `${SITE_URL}/#financial-service`,
  name: "TakeHomeUSA Salary After-Tax Calculator",
  url: SITE_URL,
  description: `Authoritative US salary after-tax calculator for all 50 states. Computes federal income tax, state income tax, Social Security, and Medicare using ${TAX_YEAR} IRS tax brackets.`,
  provider: { "@id": `${SITE_URL}/#organization` },
  serviceType: "Tax Calculation",
  areaServed: { "@type": "Country", name: "United States", "@id": "https://www.wikidata.org/wiki/Q30" },
  availableChannel: {
    "@type": "ServiceChannel",
    serviceUrl: SITE_URL,
    serviceType: "Online",
    availableLanguage: "English",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Free Tax Calculators",
    itemListElement: [
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Salary After-Tax Calculator", url: SITE_URL } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Hourly Wage After-Tax Calculator", url: `${SITE_URL}/hourly` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "Monthly Salary After-Tax Calculator", url: `${SITE_URL}/monthly` } },
      { "@type": "Offer", itemOffered: { "@type": "Service", name: "State Tax Comparison Tool", url: `${SITE_URL}/compare` } },
    ],
  },
  // Lead generation — professional consultation upsell
  potentialAction: {
    "@type": "ReserveAction",
    name: "Get Professional Tax Consultation",
    description: "Connect with a licensed CPA for personalized tax planning and filing advice.",
    target: {
      "@type": "EntryPoint",
      urlTemplate: SITE_URL,
      actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
    },
    result: { "@type": "BuyAction", name: "Tax Consultation Booking" },
  },
};

// WebApplication + CalculateAction — tells AI agents this is an interactive tool with defined inputs/outputs
const JSON_LD_WEB_APP = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "@id": `${SITE_URL}/#webapp`,
  name: "TakeHomeUSA",
  url: SITE_URL,
  applicationCategory: "FinanceApplication",
  operatingSystem: "All",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  featureList: [
    "Federal income tax calculation (2026 IRS brackets)",
    "State income tax calculation (all 50 states)",
    "FICA / Social Security / Medicare calculation",
    "Annual, monthly, biweekly, weekly, and hourly take-home",
    "401k, HSA, and health insurance pre-tax deduction support",
    "Filing status: single, married, head of household",
    "State-vs-state income tax comparison",
  ],
  potentialAction: {
    "@type": "CalculateAction",
    "@id": `${SITE_URL}/#calculate-action`,
    name: "Calculate US Take-Home Pay",
    description: `Compute after-tax take-home pay for any US salary across all 50 states using ${TAX_YEAR} IRS tax brackets.`,
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/api/calculate/{gross}/{state}`,
      httpMethod: "GET",
      contentType: "application/json",
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
        "http://schema.org/IOSPlatform",
        "http://schema.org/AndroidPlatform",
      ],
    },
    object: [
      {
        "@type": "PropertyValueSpecification",
        valueName: "gross",
        name: "Annual Gross Salary",
        description: "Annual salary in USD before taxes",
        valueRequired: true,
        minValue: 0,
        maxValue: 10000000,
      },
      {
        "@type": "PropertyValueSpecification",
        valueName: "state",
        name: "US State",
        description: "State slug (e.g. texas, california, new-york)",
        valueRequired: true,
      },
      {
        "@type": "PropertyValueSpecification",
        valueName: "filingStatus",
        name: "Filing Status",
        description: "Federal filing status: single, married, mfs, hoh, qss",
        valueRequired: false,
        defaultValue: "single",
      },
    ],
    result: [
      { "@type": "PropertyValueSpecification", valueName: "takeHomePay",    name: "Annual Take-Home Pay" },
      { "@type": "PropertyValueSpecification", valueName: "federalTax",     name: "Federal Income Tax" },
      { "@type": "PropertyValueSpecification", valueName: "stateTax",       name: "State Income Tax" },
      { "@type": "PropertyValueSpecification", valueName: "socialSecurity", name: "Social Security Tax" },
      { "@type": "PropertyValueSpecification", valueName: "medicare",       name: "Medicare Tax" },
      { "@type": "PropertyValueSpecification", valueName: "effectiveRate",  name: "Effective Tax Rate" },
    ],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <head>
        {/* AI agent discovery */}
        <link rel="ai-plugin"  href={`${SITE_URL}/.well-known/ai-plugin.json`} />
        <link rel="openapi"    href={`${SITE_URL}/.well-known/openapi.json`}   />
        {/* Allow AI crawlers to use full snippet length */}
        <meta name="robots" content="max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
      </head>
      <body className="flex flex-col min-h-screen bg-white">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEBSITE) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_ORGANIZATION) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_FINANCIAL_SERVICE) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD_WEB_APP) }} />

        {/* ── Header ──────────────────────────────────────────────────────────── */}
        <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
          <div className="container-page flex items-center justify-between h-14">

            {/* Logo */}
            <Link href="/" aria-label="TakeHomeUSA — Home">
              <Logo variant="light" size="md" />
            </Link>

            {/* Nav */}
            <nav className="flex items-center gap-1 text-sm font-medium">

              {/* States dropdown — CSS hover only (server component safe) */}
              <div className="relative group hidden md:block">
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

              <Link
                href="/compare"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors hidden md:block"
              >
                Compare
              </Link>

              <Link
                href="/blog"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors hidden md:block"
              >
                Blog
              </Link>

              <Link
                href="/about"
                className="px-3 py-1.5 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors hidden md:block"
              >
                About
              </Link>

              <Link
                href="/"
                className="ml-2 bg-blue-700 text-white px-4 py-1.5 rounded-full text-sm font-bold hover:bg-blue-800 transition-colors hidden md:inline-block"
              >
                Calculator
              </Link>

              {/* Mobile hamburger — renders its own sm:hidden dropdown */}
              <MobileNav />
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
              <Link href="/" className="inline-block mb-3" aria-label="TakeHomeUSA — Home">
                <Logo variant="dark" size="md" />
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
