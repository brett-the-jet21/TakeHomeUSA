export const dynamic = "force-static";

import type { Metadata } from "next";
import { TAX_YEAR } from "@/lib/tax";
import HomePageClient from "./HomePageClient";

export const metadata: Metadata = {
  title: `Salary After Tax Calculator ${TAX_YEAR} — All 50 States, Free`,
  description: `See your exact take-home pay for any salary in all 50 US states. $100K in Texas → $79,180/yr. $100K in Florida → $79,180/yr. $100K in New York → $68,915/yr. Powered by ${TAX_YEAR} IRS tax brackets. Instant, free, no signup.`,
  alternates: { canonical: "https://www.takehomeusa.com/" },
  openGraph: {
    title: `Salary After Tax Calculator ${TAX_YEAR} — All 50 States`,
    description: `What do you actually take home? $100K in Texas → $79,180/yr. $100K in California → $71,760/yr. Free ${TAX_YEAR} salary after tax calculator for all 50 states.`,
    url: "https://www.takehomeusa.com",
    siteName: "TakeHomeUSA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Salary After Tax Calculator — All 50 States (${TAX_YEAR})`,
    description: `$100K salary? Texas → $79,180/yr take-home. New York → $68,915/yr. Free calculator for all 50 states.`,
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "TakeHomeUSA",
  url: "https://www.takehomeusa.com",
  description: `Free salary after-tax calculator for all 50 US states. ${TAX_YEAR} IRS tax brackets.`,
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.takehomeusa.com/salary/{salary}-salary-after-tax-{state}",
    },
    "query-input": "required name=salary required name=state",
  },
};

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "TakeHomeUSA",
  url: "https://www.takehomeusa.com",
  logo: "https://www.takehomeusa.com/logo.png",
  description: "Free, accurate salary after-tax calculators for all 50 US states.",
  foundingDate: "2024",
  areaServed: "US",
};

const softwareSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: `TakeHomeUSA Salary Calculator ${TAX_YEAR}`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
  description: `Calculate your exact take-home pay after federal and state taxes for all 50 US states. Uses ${TAX_YEAR} IRS tax brackets.`,
  url: "https://www.takehomeusa.com",
  featureList: [
    "All 50 US states",
    `${TAX_YEAR} IRS tax brackets`,
    "Federal + state tax breakdown",
    "Monthly, bi-weekly, hourly pay",
    "Effective and marginal tax rates",
    "No signup required",
    "100% free",
  ],
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <HomePageClient />
    </>
  );
}
