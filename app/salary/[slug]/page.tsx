import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, getStateSalaryAmounts } from "@/lib/states";
import SalaryCalculator from "./SalaryCalculator";

// ─── Route Types ──────────────────────────────────────────────────────────────
type Params = Promise<{ slug?: string }>;

// ─── Slug Parser ──────────────────────────────────────────────────────────────
function parseSlug(slug: unknown) {
  if (typeof slug !== "string") return null;
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;
  const amount = Number(m[1]);
  const stateSlug = m[2];
  if (!Number.isFinite(amount) || amount < 1_000 || amount > 2_000_000) return null;
  const stateConfig = STATE_BY_SLUG.get(stateSlug);
  if (!stateConfig) return null;
  return { amount, stateSlug, stateConfig };
}

// ─── Static Generation: All 50 states ────────────────────────────────────────
// Texas → $1K steps (481 pages); all others → $5K steps (97 pages × 49 states)
export function generateStaticParams() {
  const params: { slug: string }[] = [];
  for (const [stateSlug] of STATE_BY_SLUG) {
    for (const amount of getStateSalaryAmounts(stateSlug)) {
      params.push({ slug: `${amount}-salary-after-tax-${stateSlug}` });
    }
  }
  return params;
}

// ─── Per-Page SEO Metadata ────────────────────────────────────────────────────
export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return {};

  const { amount, stateConfig } = parsed;
  const { name: stateName, noTax, topRateDisplay } = stateConfig;
  const tax = calculateTax(stateConfig, amount);
  const amtFmt = amount.toLocaleString("en-US");
  const takeFmt = Math.round(tax.takeHome).toLocaleString("en-US");
  const moFmt = Math.round(tax.takeHome / 12).toLocaleString("en-US");
  const effRate = (tax.effectiveTotalRate * 100).toFixed(1);
  const noTaxNote = noTax
    ? ` ${stateName} has NO state income tax!`
    : ` ${stateName} top state tax: ${topRateDisplay}.`;

  return {
    title: `$${amtFmt} Salary After Tax in ${stateName} (${TAX_YEAR})`,
    description: `$${amtFmt}/yr in ${stateName} → $${takeFmt} take-home ($${moFmt}/mo).${noTaxNote} Effective rate: ${effRate}%. Full ${TAX_YEAR} federal tax breakdown.`,
    alternates: {
      canonical: `https://www.takehomeusa.com/salary/${slug}`,
    },
    openGraph: {
      title: `$${amtFmt} Salary After Tax in ${stateName} | TakeHomeUSA`,
      description: `Take-home: $${takeFmt}/yr · $${moFmt}/mo${noTax ? ` · ${stateName} has no state income tax!` : ""}`,
      url: `https://www.takehomeusa.com/salary/${slug}`,
      siteName: "TakeHomeUSA",
      type: "website",
    },
    twitter: {
      card: "summary",
      title: `$${amtFmt} After Tax in ${stateName}: $${takeFmt}/yr`,
      description: `$${moFmt}/month take-home. See full ${TAX_YEAR} breakdown.`,
    },
  };
}

// ─── Page Component ───────────────────────────────────────────────────────────
export default async function SalaryPage({ params }: { params: Params }) {
  const { slug } = await params;
  const parsed = parseSlug(slug);
  if (!parsed) return notFound();

  const { amount, stateSlug, stateConfig } = parsed;
  const { name: stateName, noTax, topRateDisplay } = stateConfig;
  const tax = calculateTax(stateConfig, amount);
  const amtFmt = amount.toLocaleString("en-US");
  const monthly = tax.takeHome / 12;
  const biweekly = tax.takeHome / 26;
  const hourly = tax.takeHome / 2080;

  // ── JSON-LD: FAQ Page (drives featured snippets) ────────────────────────────
  const faqItems = [
    {
      q: `What is the take-home pay for a $${amtFmt} salary in ${stateName}?`,
      a: noTax
        ? `With a $${amtFmt} salary in ${stateName}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. ${stateName} has no state income tax, so your only deductions are federal income tax (${fmt(tax.federalTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`
        : `With a $${amtFmt} salary in ${stateName}, your take-home pay is ${fmt(tax.takeHome)} per year, or ${fmt(monthly)} per month after taxes. Deductions include federal income tax (${fmt(tax.federalTax)}), ${stateName} state income tax (${fmt(tax.stateTax)}), Social Security (${fmt(tax.socialSecurity)}), and Medicare (${fmt(tax.medicare)}).`,
    },
    {
      q: `Does ${stateName} have a state income tax?`,
      a: noTax
        ? `No. ${stateName} is one of nine US states with zero state income tax. On a $${amtFmt} salary you pay $0 in state tax — a significant advantage over states like California (up to 13.3%) or New York (up to 10.9%).`
        : `Yes. ${stateName} has a state income tax with a top rate of ${topRateDisplay}. On a $${amtFmt} salary, your estimated ${stateName} state tax is ${fmt(tax.stateTax)} (effective state rate: ${pct(tax.stateTax / amount)}).`,
    },
    {
      q: `What is $${amtFmt} a year per month after taxes in ${stateName}?`,
      a: `A $${amtFmt} annual salary in ${stateName} works out to ${fmt(monthly)} per month after taxes, or ${fmt(biweekly)} bi-weekly (every two weeks).`,
    },
    {
      q: `What is the effective tax rate on a $${amtFmt} salary in ${stateName}?`,
      a: `The effective total tax rate on a $${amtFmt} salary in ${stateName} is ${pct(tax.effectiveTotalRate)}. This combines federal income tax (${pct(tax.effectiveFederalRate)} effective), FICA taxes (Social Security + Medicare)${noTax ? `. ${stateName} has no state income tax.` : `, and ${stateName} state tax.`}`,
    },
    {
      q: `What is the marginal tax bracket for $${amtFmt} in ${stateName}?`,
      a: `The marginal (top) federal tax rate on a $${amtFmt} salary is ${pct(tax.marginalRate)}. Not all income is taxed at this rate — your effective federal rate is only ${pct(tax.effectiveFederalRate)} because lower portions are taxed at 10%, 12%, etc.`,
    },
    {
      q: `How much is $${amtFmt} a year per hour after taxes in ${stateName}?`,
      a: `Based on a 40-hour work week (2,080 hours/year), a $${amtFmt} salary in ${stateName} works out to ${fmt(hourly)} per hour after taxes.`,
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
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: `${stateName} Salary Calculator`, item: `https://www.takehomeusa.com/${stateSlug}` },
      { "@type": "ListItem", position: 3, name: `$${amtFmt} After Tax in ${stateName}`, item: `https://www.takehomeusa.com/salary/${slug}` },
    ],
  };

  const webPageSchema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `$${amtFmt} Salary After Tax in ${stateName} (${TAX_YEAR})`,
    description: `Exact take-home pay for a $${amtFmt} salary in ${stateName} based on ${TAX_YEAR} federal tax brackets and official state tax tables.`,
    url: `https://www.takehomeusa.com/salary/${slug}`,
    isPartOf: { "@type": "WebSite", name: "TakeHomeUSA", url: "https://www.takehomeusa.com" },
    dateModified: `${TAX_YEAR}-01-01`,
  };

  return (
    <>
      {/* ── Structured Data (server-rendered for SEO) ─────────────────────── */}
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

      {/* ── Ad: Leaderboard ───────────────────────────────────────────────── */}
      <div className="container-page pt-4 pb-2">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* ── Interactive Client Component ──────────────────────────────────── */}
      <SalaryCalculator initialAmount={amount} stateConfig={stateConfig} />
    </>
  );
}
