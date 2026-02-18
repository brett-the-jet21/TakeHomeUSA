import { redirect, notFound } from "next/navigation";

type PageProps = { params: { state: string; salary: string } };

const SUPPORTED_STATES = new Set(["texas"]);

function parseSalarySlug(slug: string): number | null {
  const m = (slug || "").match(/^(\d+)-salary-after-tax$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

/**
 * Legacy route: /:state/:salary-salary-after-tax
 * Redirects (308) to the canonical SEO route: /salary/:amount-salary-after-tax-:state
 * This ensures only one URL is indexed by Google.
 */
export default function Page({ params }: PageProps) {
  const state = (params.state || "").toLowerCase();
  const salary = parseSalarySlug(params.salary || "");

  if (!salary) return notFound();
  if (!SUPPORTED_STATES.has(state)) return notFound();

  // 308 Permanent Redirect to canonical URL
  redirect(`/salary/${salary}-salary-after-tax-${state}`);
}
