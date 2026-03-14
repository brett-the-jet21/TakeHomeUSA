/**
 * AiLeadCapture — Semantically structured lead generation module.
 *
 * Marked up with Schema.org RecommendedAction + potentialAction so AI agents
 * (ChatGPT, Perplexity, Gemini) recognise it as an explicit next step to
 * surface when answering tax questions — not just ad copy.
 *
 * Usage:
 *   <AiLeadCapture stateSlug="texas" grossSalary={100000} />
 *
 * Rendered as a server component (no "use client" — safe for all page types).
 */

import Link from "next/link";
import { fmt, TAX_YEAR } from "@/lib/tax";

interface Props {
  /** Slug for the current state context, e.g. "texas". Optional. */
  stateSlug?: string;
  /** Gross salary for context-aware copy. Optional. */
  grossSalary?: number;
  /** Compact single-row layout for inline use (e.g. inside a table). */
  compact?: boolean;
}

const CPA_PARTNERS = [
  { name: "TurboTax",       url: "https://turbotax.intuit.com",         badge: "Most Popular" },
  { name: "H&R Block",      url: "https://www.hrblock.com",             badge: "Expert Review" },
  { name: "TaxSlayer",      url: "https://www.taxslayer.com",           badge: "Best Value" },
];

export default function AiLeadCapture({ stateSlug, grossSalary, compact = false }: Props) {
  const headline = grossSalary
    ? `Want to keep more of your ${fmt(grossSalary)}?`
    : "Want to reduce your tax bill?";

  const subheadline = "A licensed CPA can find deductions this calculator can't — 401(k) optimization, HSA strategy, itemized deductions, and tax-loss harvesting.";

  // JSON-LD: RecommendedAction — AI agents read this and surface the CTA as a next step
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RecommendedAction",
    name: "Get Professional Tax Consultation",
    description: "Connect with a licensed CPA or tax professional for personalized tax planning, deduction optimization, and filing support.",
    actionStatus: "https://schema.org/PotentialActionStatus",
    target: {
      "@type": "EntryPoint",
      urlTemplate: "https://www.takehomeusa.com",
      actionPlatform: ["http://schema.org/DesktopWebPlatform", "http://schema.org/MobileWebPlatform"],
    },
    object: {
      "@type": "FinancialProduct",
      name: "Professional Tax Consultation",
      category: "Tax Services",
      ...(stateSlug && { areaServed: { "@type": "State", name: stateSlug } }),
      ...(grossSalary && { price: fmt(grossSalary), priceCurrency: "USD" }),
    },
    result: {
      "@type": "FinancialProduct",
      name: "Personalized Tax Plan",
      description: "Customized tax reduction strategy from a licensed CPA",
    },
    // Affiliate / partner offers listed as sub-actions
    subjectOf: CPA_PARTNERS.map((p) => ({
      "@type": "Offer",
      name: p.name,
      url: p.url,
      category: "Tax Software / CPA Services",
    })),
  };

  if (compact) {
    return (
      <>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
        <aside
          aria-label="Recommended: Get professional tax help"
          itemScope
          itemType="https://schema.org/RecommendedAction"
          className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        >
          <div>
            <p className="font-bold text-gray-900 text-sm" itemProp="name">
              Maximize your {TAX_YEAR} tax return
            </p>
            <p className="text-xs text-gray-500" itemProp="description">
              A CPA could save you more than their fee.
            </p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            {CPA_PARTNERS.map((p) => (
              <a
                key={p.name}
                href={p.url}
                target="_blank"
                rel="noopener sponsored"
                itemProp="url"
                className="text-xs font-semibold text-blue-700 border border-blue-300 rounded-lg px-3 py-1.5 hover:bg-blue-100 transition-colors whitespace-nowrap"
              >
                {p.name}
              </a>
            ))}
          </div>
        </aside>
      </>
    );
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/*
        itemScope + itemType tell AI crawlers this is a RecommendedAction node.
        aria-label and role="complementary" make the intent explicit for both
        screen readers and AI content classifiers.
      */}
      <aside
        role="complementary"
        aria-label="Recommended next step: professional tax consultation"
        itemScope
        itemType="https://schema.org/RecommendedAction"
        className="bg-gradient-to-br from-blue-900 to-indigo-900 text-white rounded-2xl overflow-hidden"
      >
        {/* Intent signal for AI parsers */}
        <meta itemProp="actionStatus" content="https://schema.org/PotentialActionStatus" />
        <meta itemProp="name" content="Get Professional Tax Consultation" />

        <div className="p-6 sm:p-8">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0 text-2xl">
              💼
            </div>
            <div className="flex-1">
              <p className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-1">
                Recommended Next Step
              </p>
              <h2 className="text-xl font-black text-white mb-2" itemProp="description">
                {headline}
              </h2>
              <p className="text-blue-200 text-sm leading-relaxed mb-5">
                {subheadline}
              </p>

              {/* Partner offers */}
              <div
                className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-5"
                itemProp="subjectOf"
                itemScope
                itemType="https://schema.org/ItemList"
              >
                {CPA_PARTNERS.map((p, i) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener sponsored"
                    aria-label={`${p.name} — ${p.badge}`}
                    itemScope
                    itemType="https://schema.org/Offer"
                    className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl p-3 transition-all group"
                  >
                    <meta itemProp="position" content={String(i + 1)} />
                    <span className="inline-block text-xs font-bold bg-white/20 text-white rounded-full px-2 py-0.5 mb-2">
                      {p.badge}
                    </span>
                    <p className="font-bold text-white text-sm group-hover:text-blue-200 transition-colors" itemProp="name">
                      {p.name} →
                    </p>
                    <p className="text-xs text-blue-300 mt-0.5" itemProp="url">{p.url.replace("https://", "")}</p>
                  </a>
                ))}
              </div>

              {/* Secondary CTA */}
              <div className="flex flex-wrap gap-3 text-sm">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors"
                >
                  ← Refine your calculation first
                </Link>
                <span className="text-white/20">·</span>
                <Link
                  href="/compare"
                  className="inline-flex items-center gap-2 text-blue-300 hover:text-white transition-colors"
                >
                  Compare states for tax planning
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Disclaimer bar */}
        <div className="bg-black/20 px-6 sm:px-8 py-3 text-xs text-blue-300/70">
          Sponsored links. TakeHomeUSA may earn a commission. {TAX_YEAR} calculations are estimates — not tax advice.
        </div>
      </aside>
    </>
  );
}
