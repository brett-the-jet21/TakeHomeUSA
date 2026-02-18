import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  calculateTexasTax,
  fmt,
  pct,
  TAX_YEAR,
  getTexasSalaryAmounts,
} from "@/lib/tax";
import SalaryCalculator from "./SalaryCalculator";

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

const STATES: Record<string, { name: string; slug: string }> = {
  texas: { name: "Texas", slug: "texas" },
};

// ─── Slug Parser ──────────────────────────────────────────────────────────────
function parseSlug(slug: unknown): { amount: number; stateSlug: string } | null {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const amount = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(amount) || amount < 1_000 || amount > 2_000_000) return null;
  if (!STATES[stateSlug]) return null;
  return { amount, stateSlug };
}

// ─── Static Generation: $20K–$500K in $1K steps (481 pages) ─────────────────
export function generateStaticParams() {
  return getTexasSalaryAmounts().map((a) => ({
    slug: `${a}-salary-after-tax-texas`,
  }));
}

// ─── Per-Page SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { amount, stateSlug } = parsed;
  const state = STATES[stateSlug].name;
  const tax = calculateTexasTax(amount);
  const amtFmt = amount.toLocaleString("en-US");
  const takeFmt = Math.round(tax.takeHome).toLocaleString("en-US");
  const moFmt = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);

  return {
    title: `$${amtFmt} Salary After Tax in ${state} (${TAX_YEAR})`,
    description: `$${amtFmt}/yr in ${state} → $${takeFmt} take-home ($${moFmt}/mo). ${state} has NO state income tax! Effective rate: ${effRate}%. Full ${TAX_YEAR} federal tax breakdown, hourly & monthly pay.`,
    alternates: {
      canonical: `https://www.takehomeusa.com/salary/${slug}`,
    },
    openGraph: {
      title: `$${amtFmt} Salary After Tax in ${state} | TakeHomeUSA`,
      description: `Take-home: $${takeFmt}/yr · $${moFmt}/mo · ${state} has no state income tax!`,
      url: `https://www.takehomeusa.com/salary/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `$${amtFmt} After Tax in ${state}: $${takeFmt}/yr`,
      description: `$${moFmt}/month take-home. ${state} = $0 state income tax. See full ${TAX_YEAR} breakdown.`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function SalaryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { amount, stateSlug } = parsed;
  const state = STATES[stateSlug].name;
  const tax = calculateTexasTax(amount);
  const amtFmt = amount.toLocaleString("en-US");
  const monthly   = tax.takeHome / 12;
  const biweekly  = tax.takeHome / 26;
  const hourly    = tax.takeHome / 2080;

  // ── JSON-LD: FAQ Page (drives featured snippets) ──────────────────────────
  const faqItems = [
    {
      q: `What is the take-home pay for a $${amtFmt} salary in ${state}?`,
      a: `With a $${amtFmt} salary in ${state}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. ${state} has no state income tax, so your deductions are federal income tax (${fmt(tax.federalTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`,
    },
    {
      q: `Does ${state} have a state income tax?`,
      a: `No. ${state} is one of nine US states with zero state income tax. On a $${amtFmt} salary you pay $0 in state tax, which is a significant financial advantage over states like California (up to 13.3%) or New York (up to 10.9%).`,
    },
    {
      q: `What is $${amtFmt} a year per month after taxes in ${state}?`,
      a: `A $${amtFmt} annual salary in ${state} works out to ${fmt(monthly)} per month after taxes, or ${fmt(biweekly)} bi-weekly (every two weeks).`,
    },
    {
      q: `What is the effective tax rate on a $${amtFmt} salary in ${state}?`,
      a: `The effective total tax rate on a $${amtFmt} salary in ${state} is ${pct(tax.effectiveTotalRate)}. This combines federal income tax (${pct(tax.effectiveFederalRate)} effective rate) and FICA taxes (Social Security + Medicare). ${state} has no state income tax.`,
    },
    {
      q: `What is the marginal tax bracket for $${amtFmt} in ${state}?`,
      a: `The marginal (top) federal tax rate on a $${amtFmt} salary is ${pct(tax.marginalRate)}. However, not all income is taxed at this rate — your effective federal rate is only ${pct(tax.effectiveFederalRate)} because lower income portions are taxed at 10%, 12%, etc.`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${state}?`,
      a: `Based on a 40-hour work week (2,080 hours/year), a $${amtFmt} salary in ${state} works out to ${fmt(hourly)} per hour after taxes.`,
    },
  ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home",                       item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: `${state} Salary Calculator`, item: "https://www.takehomeusa.com/texas" },
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax in ${state}`, item: `https://www.takehomeusa.com/salary/${slug}` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `$${amtFmt} Salary After Tax in ${state} (${TAX_YEAR})`,
    description: `Exact take-home pay for a $${amtFmt} salary in ${state} based on ${TAX_YEAR} federal tax brackets and official state tax tables.`,
    url: `https://www.takehomeusa.com/salary/${slug}`,
    isPartOf: { "@type": "WebSite", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    dateModified: `${TAX_YEAR}-01-01`,
  };

  return (
    <>
      {/* ── Structured Data (server-rendered for SEO) ────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      {/* ── Ad: Leaderboard (server-rendered placement) ──────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Interactive Client Component ─────────────────────────────────── */}
      <SalaryCalculator
        initialAmount={amount}
        state={state}
        stateSlug={stateSlug}
      />
    </>
  );
}
