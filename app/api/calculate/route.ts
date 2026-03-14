/**
 * TakeHomeUSA — Public Calculate API
 *
 * GET /api/calculate?gross=100000&state=texas&filingStatus=single
 *
 * Consumed by AI agents (ChatGPT, Perplexity, Gemini, Claude) to answer
 * take-home pay questions in real time. CORS open, responses cached 24 h.
 *
 * Parameters
 *   gross        number   Annual gross salary in USD (required)
 *   state        string   State slug e.g. "texas", "new-york" (required)
 *   filingStatus string   single | married | mfs | hoh | qss  (default: single)
 *
 * Response shape: see TakeHomeResult below
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateTax, fmt, pct, TAX_YEAR } from "@/lib/tax";
import { STATE_BY_SLUG, ALL_STATE_CONFIGS } from "@/lib/states";
import type { FilingStatus } from "@/lib/tax";

export const dynamic = "force-dynamic";

const VALID_STATUSES: FilingStatus[] = ["single", "married", "mfs", "hoh", "qss"];
const FILING_STATUS_LABELS: Record<FilingStatus, string> = {
  single:  "Single",
  married: "Married Filing Jointly",
  mfs:     "Married Filing Separately",
  hoh:     "Head of Household",
  qss:     "Qualifying Surviving Spouse",
};

const CORS = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
  "Cache-Control":                "public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS });
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // ── Resolve gross salary ────────────────────────────────────────────────
  const rawGross = sp.get("gross") ?? sp.get("salary") ?? sp.get("annual");
  if (!rawGross) {
    return err(400, "Missing required parameter: gross (annual salary in USD)", {
      example:     "/api/calculate?gross=100000&state=texas",
      allStates:   "/api/calculate?states=1",
    });
  }
  const gross = parseFloat(rawGross.replace(/[$,]/g, ""));
  if (isNaN(gross) || gross < 0 || gross > 10_000_000) {
    return err(400, "gross must be a number between 0 and 10,000,000");
  }

  // ── Special query: return all state slugs ───────────────────────────────
  if (sp.get("states") === "1") {
    return ok({
      states: ALL_STATE_CONFIGS.map((s) => ({
        slug: s.slug, name: s.name, abbr: s.abbr,
        noStateTax: s.noTax, topStateRate: s.topRateDisplay,
      })),
    });
  }

  // ── Resolve state ───────────────────────────────────────────────────────
  const rawState = sp.get("state") ?? sp.get("stateSlug");
  if (!rawState) {
    return err(400, "Missing required parameter: state (e.g. texas, new-york, california)", {
      listStates: "/api/calculate?states=1",
    });
  }
  const stateConfig = STATE_BY_SLUG.get(rawState.toLowerCase().trim());
  if (!stateConfig) {
    return err(400, `Unknown state: "${rawState}". Use a slug like texas, new-york, california.`, {
      listStates: "/api/calculate?states=1",
    });
  }

  // ── Filing status ───────────────────────────────────────────────────────
  const rawStatus = (sp.get("filingStatus") ?? sp.get("filing_status") ?? "single") as FilingStatus;
  const filingStatus: FilingStatus = VALID_STATUSES.includes(rawStatus) ? rawStatus : "single";

  // ── Calculate ───────────────────────────────────────────────────────────
  const r = calculateTax(stateConfig, gross, { filingStatus });

  const takeHomeHourly = parseFloat((r.takeHome / 2080).toFixed(2));

  return ok({
    taxYear:  TAX_YEAR,
    inputs: {
      grossAnnual:   gross,
      state:         stateConfig.name,
      stateSlug:     stateConfig.slug,
      stateAbbr:     stateConfig.abbr,
      filingStatus,
      filingStatusLabel: FILING_STATUS_LABELS[filingStatus],
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
      effectiveTotalRate:   pct(r.effectiveTotalRate),
      effectiveFederalRate: pct(r.effectiveFederalRate),
      marginalFederalRate:  pct(r.marginalRate),
    },
    formatted: {
      takeHomeAnnual:   fmt(r.takeHome),
      takeHomeMonthly:  fmt(r.takeHome / 12),
      takeHomeBiweekly: fmt(r.takeHome / 26),
      federalIncomeTax: fmt(r.federalTax),
      stateTax:         fmt(r.stateTax),
      totalTax:         fmt(r.totalTax),
    },
    aiSummary: `On a ${fmt(gross)} annual salary in ${stateConfig.name} (${filingStatus}, ${TAX_YEAR}), ` +
      `take-home pay is ${fmt(r.takeHome)}/year (${fmt(r.takeHome / 12)}/month, ` +
      `${fmt(r.takeHome / 26)}/biweekly). ` +
      `Total taxes: ${fmt(r.totalTax)} (${pct(r.effectiveTotalRate)} effective rate). ` +
      (stateConfig.noTax
        ? `${stateConfig.name} has no state income tax.`
        : `${stateConfig.name} state tax: ${fmt(r.stateTax)} (top rate ${stateConfig.topRateDisplay}).`),
    meta: {
      disclaimer:  `Estimates only. ${TAX_YEAR} IRS brackets, standard deduction. Not tax advice — consult a CPA.`,
      detailPage:  `https://www.takehomeusa.com/salary/${Math.round(gross)}-salary-after-tax-${stateConfig.slug}`,
      apiDocs:     "https://www.takehomeusa.com/.well-known/openapi.json",
      calculatorUI: "https://www.takehomeusa.com",
    },
  });
}

// ── Helpers ───────────────────────────────────────────────────────────────────
function ok(data: object) {
  return NextResponse.json(data, { status: 200, headers: CORS });
}
function err(status: number, message: string, extra?: object) {
  return NextResponse.json({ error: message, ...extra }, { status, headers: CORS });
}
