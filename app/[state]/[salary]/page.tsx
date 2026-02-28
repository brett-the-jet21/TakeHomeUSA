// Part 1: ISR write explosion prevention
export const dynamic = 'force-static';
export const dynamicParams = false;
export const revalidate = false;

import { notFound } from "next/navigation";

type Params = Promise<{ state: string; salary: string }>;

const STATES: Record<string, { name: string; slug: string; stateTaxRate: number; hasIncomeTax: boolean }> = {
  texas: { name: "Texas", slug: "texas", stateTaxRate: 0, hasIncomeTax: false },
};

function parseSalarySlug(slug: string): number | null {
  const m = slug.match(/^(\d+)-salary-after-tax$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function generateStaticParams() {
  const out: { state: string; salary: string }[] = [];
  for (const stateSlug of Object.keys(STATES)) {
    for (let a = 30000; a <= 300000; a += 5000) {
      out.push({ state: stateSlug, salary: `${a}-salary-after-tax` });
    }
  }
  return out;
}

// Part 2: Updated metadata for CTR
export async function generateMetadata({ params }: { params: Params }) {
  const { state: stateParam, salary: salaryParam } = await params;
  const stateData = STATES[(stateParam || "").toLowerCase()];
  const salary = parseSalarySlug(salaryParam || "");
  if (!stateData || !salary) return {};

  const amountFmt = salary.toLocaleString("en-US");
  const state = stateData.name;

  return {
    title: `$${amountFmt} Salary After Tax in ${state} (2026) — Take Home Pay Calculator`,
    description: `See your take-home pay on a $${amountFmt} salary in ${state} for 2026. Includes federal + state tax breakdown, FICA, effective tax rate, and monthly/biweekly paycheck estimates.`,
    alternates: {
      canonical: `https://www.takehomeusa.com/${stateData.slug}/${salaryParam}`,
    },
  };
}

function calcTax(salary: number, stateTaxRate: number) {
  const federal = salary * 0.22;
  const fica = salary * 0.0765;
  const stateTax = salary * stateTaxRate;
  const totalTaxes = federal + fica + stateTax;
  const takeHome = salary - totalTaxes;
  return {
    federal,
    fica,
    stateTax,
    totalTaxes,
    takeHome,
    monthlyTakeHome: takeHome / 12,
    biweeklyTakeHome: takeHome / 26,
    effectiveTaxRate: (totalTaxes / salary) * 100,
  };
}

function getRelatedSalaries(salary: number): number[] {
  const step = 5000;
  const below: number[] = [];
  const above: number[] = [];
  for (let a = 30000; a <= 300000; a += step) {
    if (a < salary) below.push(a);
    else if (a > salary) above.push(a);
  }
  return [...below.slice(-5), ...above.slice(0, 5)];
}

export default async function Page({ params }: { params: Params }) {
  const { state: stateParam, salary: salaryParam } = await params;
  const stateSlug = (stateParam || "").toLowerCase();
  const stateData = STATES[stateSlug];
  const salary = parseSalarySlug(salaryParam || "");

  if (!stateData || !salary) return notFound();

  const state = stateData.name;
  const amountFmt = salary.toLocaleString("en-US");
  const tax = calcTax(salary, stateData.stateTaxRate);
  const fmt = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`;

  // Part 5: FAQ content
  const faqs = [
    {
      q: `How much is take-home pay on a $${amountFmt} salary in ${state}?`,
      a: `On a $${amountFmt} salary in ${state}, your estimated annual take-home pay is ${fmt(tax.takeHome)}, or ${fmt(tax.monthlyTakeHome)} per month after federal taxes, FICA, and state income taxes.`,
    },
    {
      q: `What is the effective tax rate at $${amountFmt} in ${state}?`,
      a: `Your effective (combined) tax rate on a $${amountFmt} salary in ${state} is approximately ${tax.effectiveTaxRate.toFixed(1)}%, including federal income tax and FICA (Social Security + Medicare).`,
    },
    {
      q: `How much are FICA taxes on $${amountFmt}?`,
      a: `FICA taxes (Social Security at 6.2% + Medicare at 1.45%) on a $${amountFmt} salary total approximately ${fmt(tax.fica)} per year, or ${fmt(tax.fica / 12)} per month.`,
    },
    {
      q: `What is monthly take-home pay on $${amountFmt}?`,
      a: `Your estimated monthly take-home pay on a $${amountFmt} annual salary in ${state} is ${fmt(tax.monthlyTakeHome)}, and biweekly take-home is approximately ${fmt(tax.biweeklyTakeHome)}.`,
    },
    {
      q: `How does ${state} income tax affect take-home pay?`,
      a: stateData.hasIncomeTax
        ? `${state} has a state income tax of approximately ${(stateData.stateTaxRate * 100).toFixed(1)}%, which reduces take-home pay by ${fmt(tax.stateTax)} annually on a $${amountFmt} salary.`
        : `${state} has no state income tax, so your take-home pay is not reduced by state taxes. This makes ${state} one of the most tax-friendly states for employees.`,
    },
    {
      q: `Does this include deductions or filing status?`,
      a: `These estimates use the standard federal income tax rate and do not account for itemized deductions, pre-tax retirement contributions (401k, HSA), or specific filing statuses. Actual take-home pay may vary. Consult a tax professional for personalized advice.`,
    },
  ];

  // Part 5: FAQPage JSON-LD
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  // Part 6: Related salary links
  const relatedSalaries = getRelatedSalaries(salary);

  return (
    <main className="min-h-screen p-8 flex items-start justify-center">
      <div className="w-full max-w-3xl">
        {/* Part 5: FAQ JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />

        {/* Part 2/3: H1 + above-the-fold snippet */}
        <h1 className="text-4xl font-bold">
          ${amountFmt} Salary After Tax in {state}
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          Updated for 2026 &bull; Federal + {state} taxes &bull; FICA included &bull; Monthly &amp; biweekly breakdown
        </p>

        {/* Part 4: Quick summary box */}
        <div className="mt-6 grid grid-cols-2 gap-4 rounded border border-gray-200 p-6 bg-gray-50">
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Annual Take-Home</div>
            <div className="text-2xl font-bold mt-1 text-green-700">{fmt(tax.takeHome)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Monthly Take-Home</div>
            <div className="text-2xl font-bold mt-1">{fmt(tax.monthlyTakeHome)}</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Effective Tax Rate</div>
            <div className="text-2xl font-bold mt-1">{tax.effectiveTaxRate.toFixed(1)}%</div>
          </div>
          <div>
            <div className="text-xs text-gray-500 uppercase tracking-wide font-medium">Total Taxes</div>
            <div className="text-2xl font-bold mt-1 text-red-600">{fmt(tax.totalTaxes)}</div>
          </div>
        </div>

        {/* Full tax breakdown */}
        <div className="mt-8 rounded border border-gray-200 p-6">
          <h2 className="text-xl font-semibold mb-4">Full Tax Breakdown (2026)</h2>
          <div className="space-y-2 text-base">
            <div className="flex justify-between py-1">
              <span>Gross Salary</span>
              <span className="font-medium">{fmt(salary)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>Federal Income Tax (est. 22%)</span>
              <span className="text-red-600 font-medium">&minus;{fmt(tax.federal)}</span>
            </div>
            <div className="flex justify-between py-1">
              <span>FICA (Social Security + Medicare)</span>
              <span className="text-red-600 font-medium">&minus;{fmt(tax.fica)}</span>
            </div>
            {stateData.hasIncomeTax ? (
              <div className="flex justify-between py-1">
                <span>{state} State Income Tax</span>
                <span className="text-red-600 font-medium">&minus;{fmt(tax.stateTax)}</span>
              </div>
            ) : (
              <div className="flex justify-between py-1 text-gray-500">
                <span>{state} State Income Tax</span>
                <span>$0 (no state income tax)</span>
              </div>
            )}
            <hr className="my-2 border-gray-200" />
            <div className="flex justify-between py-1 text-lg font-semibold">
              <span>Annual Take-Home Pay</span>
              <span className="text-green-700">{fmt(tax.takeHome)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-gray-600">
              <span>Monthly Take-Home</span>
              <span>{fmt(tax.monthlyTakeHome)}</span>
            </div>
            <div className="flex justify-between py-1 text-sm text-gray-600">
              <span>Biweekly Take-Home</span>
              <span>{fmt(tax.biweeklyTakeHome)}</span>
            </div>
          </div>
        </div>

        {/* Part 5: FAQ section */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">
            Frequently Asked Questions — ${amountFmt} in {state}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div key={i} className="rounded border border-gray-200 p-4">
                <h3 className="font-semibold text-base">{faq.q}</h3>
                <p className="mt-2 text-sm text-gray-700 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Part 6: Related internal links */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold mb-4">Related Salaries in {state}</h2>
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2 text-sm">
            {relatedSalaries.map((a) => (
              <li key={a}>
                <a
                  className="underline text-blue-700 hover:text-blue-900"
                  href={`/${stateSlug}/${a}-salary-after-tax`}
                >
                  ${a.toLocaleString("en-US")} salary after tax in {state}
                </a>
              </li>
            ))}
            <li>
              <a
                className="underline text-blue-700 hover:text-blue-900"
                href="/"
              >
                Calculate a different salary in {state}
              </a>
            </li>
          </ul>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <a className="underline text-gray-600 hover:text-gray-900" href="/">
            &larr; Back to calculator
          </a>
        </div>
      </div>
    </main>
  );
}
