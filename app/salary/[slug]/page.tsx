import { notFound } from "next/navigation";

type Params = { slug?: string };

const STATES: Record<string, { name: string; slug: string }> = {
  texas: { name: "Texas", slug: "texas" },
  // Add more states later
};

function parseSlug(slug: unknown): { amount: number; stateSlug: string } | null {
  // Guard: during prerender, params/slug can be undefined in some edge cases
  if (typeof slug !== "string") return null;

  // Expected: "{amount}-salary-after-tax-{state}"
  const m = slug.match(/^(\d+)-salary-after-tax-([a-z-]+)$/);
  if (!m) return null;

  const amount = Number(m[1]);
  const stateSlug = m[2];

  if (!Number.isFinite(amount) || amount < 1000 || amount > 2000000) return null;
  if (!STATES[stateSlug]) return null;

  return { amount, stateSlug };
}

export function generateStaticParams() {
  // Starter set: Texas pages (keeps build fast)
  const out: { slug: string }[] = [];
  for (let a = 30000; a <= 300000; a += 5000) {
    out.push({ slug: `${a}-salary-after-tax-texas` });
  }
  return out;
}

export function generateMetadata({ params }: { params: Params }) {
  const parsed = parseSlug(params?.slug);
  if (!parsed) return {};

  const state = STATES[parsed.stateSlug].name;
  const amountFmt = parsed.amount.toLocaleString("en-US");

  return {
    title: `$${amountFmt} Salary After Tax in ${state} | TakeHomeUSA`,
    description: `Estimate take-home pay for a $${amountFmt} salary in ${state}. See after-tax income and effective tax rate.`,
    alternates: { canonical: `https://www.takehomeusa.com/salary/${params.slug}` },
  };
}

export default function SalaryPage({ params }: { params: Params }) {
  const parsed = parseSlug(params?.slug);
  if (!parsed) return notFound();

  const state = STATES[parsed.stateSlug].name;
  const amountFmt = parsed.amount.toLocaleString("en-US");

  return (
    <main className="min-h-screen p-8 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        <h1 className="text-4xl font-bold">
          ${amountFmt} Salary After Tax in {state}
        </h1>
        <p className="mt-3 text-lg opacity-80">
          Live route ✅ Next: plug in the real tax calculation + show a full breakdown.
        </p>

        <div className="mt-8 rounded border p-6">
          <div className="text-sm opacity-70">Inputs</div>
          <div className="mt-2 font-medium">Salary: ${amountFmt}</div>
          <div className="font-medium">State: {state}</div>
        </div>

        <div className="mt-8">
          <a className="underline" href="/">← Back to calculator</a>
        </div>
      </div>
    </main>
  );
}
