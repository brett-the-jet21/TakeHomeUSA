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

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Why is my take-home pay different from what this calculator shows?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Several factors can create differences: employer-specific deductions (health insurance premiums, FSA contributions, retirement beyond 401k), state-specific credits, local/city income taxes not included here, pre-tax commuter benefits, or different filing circumstances. This calculator uses standard deduction and standard FICA rates as the baseline. Use our optional fields for 401k, health insurance, and HSA to get a closer estimate.",
      },
    },
    {
      "@type": "Question",
      name: "Does this calculator include Social Security and Medicare taxes?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The calculator includes all FICA taxes: Social Security (6.2% on wages up to $184,500 for 2026) and Medicare (1.45% on all wages, plus an additional 0.9% on wages over $200,000). These are shown separately in the full breakdown.",
      },
    },
    {
      "@type": "Question",
      name: "What's the difference between effective and marginal tax rate?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Your marginal tax rate is the rate applied to your last dollar of income — for example, 22% if your income falls in that bracket. Your effective tax rate is the average rate across all your income. Because the US uses progressive brackets, the effective rate is always lower than the marginal rate. For example, on a $100,000 salary, your marginal federal rate might be 22%, but your effective federal rate is closer to 14% because the first $16,100 is deducted and the lower brackets apply to the rest.",
      },
    },
    {
      "@type": "Question",
      name: "How do I calculate my hourly rate from my annual salary?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Divide your annual salary by 2,080 (52 weeks × 40 hours/week) to get your gross hourly rate. To get your after-tax hourly rate, divide your annual take-home pay by 2,080. For example, a $100,000 salary with $79,180 take-home = $38.07/hr after tax. If you work a different number of hours, use our hourly mode toggle to enter your exact rate and hours per week.",
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <HomePageClient />
    </>
  );
}
