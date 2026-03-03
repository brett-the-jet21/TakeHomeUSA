export const dynamic = "force-static";

import type { Metadata } from "next";
import { TAX_YEAR } from "@/lib/tax";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: `Compare State Taxes ${TAX_YEAR} — Take-Home Pay All 50 States | TakeHomeUSA`,
  description: `Compare take-home pay across all 50 US states for any salary. See which states let you keep the most money with real ${TAX_YEAR} federal and state tax brackets. Free, instant, no signup.`,
  alternates: { canonical: "https://www.takehomeusa.com/compare" },
  openGraph: {
    title: `State Tax Comparison ${TAX_YEAR} — Which State Pays Best?`,
    description: `Enter any salary and instantly compare take-home pay across all 50 states. Texas vs California vs New York — see the real numbers.`,
    url: "https://www.takehomeusa.com/compare",
    siteName: "TakeHomeUSA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `Compare State Taxes ${TAX_YEAR} — All 50 States`,
    description: `How much more do you keep in Texas vs California? Enter your salary and compare all 50 states instantly.`,
  },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
    { "@type": "ListItem", position: 2, name: "Compare States", item: "https://www.takehomeusa.com/compare" },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CompareClient />
    </>
  );
}
