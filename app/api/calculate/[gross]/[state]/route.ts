/**
 * TakeHomeUSA — Static Calculate API
 *
 * GET /api/calculate/{gross}/{state}
 * Example: /api/calculate/100000/texas
 *          /api/calculate/75000/california
 *
 * Pre-built as static JSON files at build time (Next.js output: export).
 * 30 salary amounts × 50 states = 1,500 endpoints, zero server cost.
 *
 * Consumed by AI agents (ChatGPT, Perplexity, Gemini, Claude) to answer
 * take-home pay questions. Full OpenAPI spec: /.well-known/openapi.json
 */

import { NextResponse } from "next/server";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS } from "@/lib/states";

export const dynamic = "force-static";
export const dynamicParams = false;

// ── Pre-built salary amounts ──────────────────────────────────────────────────
// Covers the full range of queries AI agents and users ask about.
const GROSS_AMOUNTS = [
  20_000, 25_000, 30_000, 35_000, 40_000, 45_000,
  50_000, 55_000, 60_000, 65_000, 70_000, 75_000,
  80_000, 85_000, 90_000, 95_000, 100_000,
  110_000, 120_000, 125_000, 130_000, 150_000,
  175_000, 200_000, 250_000, 300_000, 400_000, 500_000,
  750_000, 1_000_000,
];

export function generateStaticParams() {
  const params: { gross: string; state: string }[] = [];
  for (const gross of GROSS_AMOUNTS) {
    for (const cfg of ALL_STATE_CONFIGS) {
      params.push({ gross: String(gross), state: cfg.slug });
    }
  }
  return params;
}

type RouteParams = Promise<{ gross: string; state: string }>;

export async function GET(_req: Request, { params }: { params: RouteParams }) {
  const { gross: grossStr, state: stateSlug } = await params;

  const gross = Number(grossStr);
  const stateConfig = STATE_BY_SLUG.get(stateSlug);

  // Both are validated by generateStaticParams, but guard anyway
  if (!stateConfig || isNaN(gross)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const r = calculateTax(stateConfig, gross, { filingStatus: "single" });
  const takeHomeHourly = parseFloat((r.takeHome / 2080).toFixed(2));

  const body = {
    taxYear: TAX_YEAR,
    inputs: {
      grossAnnual:       gross,
      state:             stateConfig.name,
      stateSlug:         stateConfig.slug,
      stateAbbr:         stateConfig.abbr,
      filingStatus:      "single",
      filingStatusLabel: "Single",
    },
    results: {
      takeHomeAnnual:    Math.round(r.takeHome),
      takeHomeMonthly:   Math.round(r.takeHome / 12),
      takeHomeBiweekly:  Math.round(r.takeHome / 26),
      takeHomeWeekly:    Math.round(r.takeHome / 52),
      takeHomeHourly,
      federalIncomeTax:  Math.round(r.federalTax),
      stateTax:          Math.round(r.stateTax),
      socialSecurity:    Math.round(r.socialSecurity),
      medicare:          Math.round(r.medicare),
      ficaTotal:         Math.round(r.ficaTotal),
      totalTax:          Math.round(r.totalTax),
      effectiveTotalRate:    pct(r.effectiveTotalRate),
      effectiveFederalRate:  pct(r.effectiveFederalRate),
      marginalFederalRate:   pct(r.marginalRate),
    },
    formatted: {
      takeHomeAnnual:   fmt(r.takeHome),
      takeHomeMonthly:  fmt(r.takeHome / 12),
      takeHomeBiweekly: fmt(r.takeHome / 26),
      federalIncomeTax: fmt(r.federalTax),
      stateTax:         fmt(r.stateTax),
      totalTax:         fmt(r.totalTax),
    },
    aiSummary:
      `On a ${fmt(gross)} annual salary in ${stateConfig.name} (single filer, ${TAX_YEAR}), ` +
      `take-home pay is ${fmt(r.takeHome)}/year (${fmt(r.takeHome / 12)}/month, ` +
      `${fmt(r.takeHome / 26)}/biweekly, $${takeHomeHourly}/hour). ` +
      `Total taxes: ${fmt(r.totalTax)} (${pct(r.effectiveTotalRate)} effective rate). ` +
      (stateConfig.noTax
        ? `${stateConfig.name} has no state income tax.`
        : `${stateConfig.name} state tax: ${fmt(r.stateTax)} (top rate ${stateConfig.topRateDisplay}).`),
    meta: {
      note:          "Single filer, standard deduction, no 401k or other adjustments.",
      disclaimer:    `Estimates only. ${TAX_YEAR} IRS brackets. Not tax advice — consult a CPA.`,
      detailPage:    `https://www.takehomeusa.com/salary/${gross}-salary-after-tax-${stateConfig.slug}`,
      otherAmounts:  `https://www.takehomeusa.com/api/calculate/{gross}/${stateConfig.slug}`,
      allStates:     `https://www.takehomeusa.com/api/calculate/${gross}/{state-slug}`,
      apiDocs:       "https://www.takehomeusa.com/.well-known/openapi.json",
      calculatorUI:  "https://www.takehomeusa.com",
    },
  };

  return NextResponse.json(body, {
    status: 200,
    headers: {
      "Content-Type":                 "application/json",
      "Access-Control-Allow-Origin":  "*",
      "Access-Control-Allow-Methods": "GET",
      "Cache-Control":                "public, max-age=2592000, immutable",
    },
  });
}
