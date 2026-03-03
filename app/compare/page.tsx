export const dynamic = "force-static";

import type { Metadata } from "next";
import { TAX_YEAR } from "@/lib/tax";
import CompareClient from "./CompareClient";

export const metadata: Metadata = {
  title: `State Income Tax Comparison Tool ${TAX_YEAR} — Compare Take-Home Pay | TakeHomeUSA`,
  description: `Compare take-home pay across US states side by side. See exactly how much more you keep in Texas vs California, New York vs Florida, and any other combination. ${TAX_YEAR} federal + state tax brackets.`,
  alternates: { canonical: "https://www.takehomeusa.com/compare" },
  openGraph: {
    title: `State Income Tax Comparison — ${TAX_YEAR} | TakeHomeUSA`,
    description: `How much more do you keep in Texas vs California? Compare take-home pay for any salary across all 50 states.`,
    url: "https://www.takehomeusa.com/compare",
    siteName: "TakeHomeUSA",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Which US state has the lowest income tax?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Nine states have no state income tax at all: Alaska, Florida, Nevada, New Hampshire, South Dakota, Tennessee, Texas, Washington, and Wyoming. Of states with income tax, North Dakota and Arizona have among the lowest rates.",
      },
    },
    {
      "@type": "Question",
      name: "How much more do you keep living in Texas vs California?",
      acceptedAnswer: {
        "@type": "Answer",
        text: `On a $100,000 salary, Texas residents keep approximately $7,420 more per year than California residents due to the difference in state income tax (Texas: $0 vs California: up to 9.3% effective rate). This gap widens at higher salaries.`,
      },
    },
    {
      "@type": "Question",
      name: "Is it worth moving to a no-tax state for salary savings?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "The tax savings from moving to a no-tax state can be significant — $5,000–$15,000 per year for high earners. However, cost of living, housing prices, and quality of life factors should also be weighed. Use this comparison tool to see the exact tax difference for your salary.",
      },
    },
  ],
};

export default function ComparePage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <CompareClient />
    </>
  );
}
