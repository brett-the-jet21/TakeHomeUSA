import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STATES_BY_SLUG, ALL_STATES } from "@/lib/states";
import { calcTaxBreakdown, formatCurrency, formatPct } from "@/lib/tax";

type PageProps = { params: { state: string; salary: string } };

function parseSalarySlug(slug: string): number | null {
  const m = slug.match(/^(\d+)-salary-after-tax$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n < 20_000 || n > 500_000) return null;
  return n;
}

export function generateMetadata({ params }: PageProps): Metadata {
  const stateInfo = STATES_BY_SLUG[(params.state || "").toLowerCase()];
  const salary = parseSalarySlug(params.salary || "");
  if (!stateInfo || !salary) return {};

  const amountFmt = salary.toLocaleString("en-US");
  const stateSlug = stateInfo.slug;
  return {
    title: `$${amountFmt} Salary After Tax in ${stateInfo.name} (2026) | TakeHomeUSA`,
    description: `See your take-home pay for a $${amountFmt} salary in ${stateInfo.name}. Uses 2026 federal and state tax brackets, standard deduction, and FICA.`,
    alternates: {
      canonical: `https://www.takehomeusa.com/${stateSlug}/${salary}-salary-after-tax`,
    },
  };
}

export function generateStaticParams() {
  const params: { state: string; salary: string }[] = [];
  for (const stateInfo of ALL_STATES) {
    for (let amount = 30_000; amount <= 300_000; amount += 10_000) {
      params.push({ state: stateInfo.slug, salary: `${amount}-salary-after-tax` });
    }
  }
  return params;
}

export default function Page({ params }: PageProps) {
  const stateSlug = (params.state || "").toLowerCase();
  const stateInfo = STATES_BY_SLUG[stateSlug];
  const salary = parseSalarySlug(params.salary || "");

  if (!salary || !stateInfo) return notFound();

  const tax = calcTaxBreakdown(salary, stateInfo.taxRate);

  const amountFmt = salary.toLocaleString("en-US");
  const periods = [
    { label: "Annual", value: tax.takeHomePay },
    { label: "Monthly", value: tax.takeHomePay / 12 },
    { label: "Bi-weekly", value: tax.takeHomePay / 26 },
    { label: "Weekly", value: tax.takeHomePay / 52 },
    { label: "Hourly", value: tax.takeHomePay / 2080 },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Site header */}
      <header className="border-b px-6 py-3 flex items-center justify-between">
        <Link href="/" className="font-bold text-lg">TakeHomeUSA</Link>
        <nav aria-label="Main navigation" className="flex gap-4 text-sm">
          <Link href="/states" className="underline">State Guides</Link>
          <Link href="/about" className="underline">About</Link>
        </nav>
      </header>

      <main className="flex-1 p-6 flex justify-center">
        <div className="w-full max-w-3xl">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="text-sm opacity-70 mb-4">
            <Link href="/" className="underline">Home</Link>
            <span className="mx-2">/</span>
            <Link href="/states" className="underline">States</Link>
            <span className="mx-2">/</span>
            <Link href={`/${stateInfo.slug}/100000-salary-after-tax`} className="underline">{stateInfo.name}</Link>
            <span className="mx-2">/</span>
            <span>${amountFmt}</span>
          </nav>

          <h1 className="text-4xl font-bold mb-2">
            ${amountFmt} Salary After Tax in {stateInfo.name}
          </h1>
          <p className="text-sm opacity-60 mb-8">
            2026 tax brackets · Single filer · Standard deduction · {stateInfo.taxNote}
          </p>

          {/* Take-home pay periods */}
          <section aria-label="Take-home pay by pay period" className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Take-Home Pay</h2>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {periods.map((p) => (
                <div key={p.label} className="rounded border p-3 text-center">
                  <div className="text-xs opacity-60 mb-1">{p.label}</div>
                  <div className="font-semibold text-sm">{formatCurrency(p.value)}</div>
                </div>
              ))}
            </div>
          </section>

          {/* Tax breakdown */}
          <section aria-label="Tax breakdown" className="mb-8">
            <h2 className="text-xl font-semibold mb-3">Tax Breakdown</h2>
            <table className="w-full text-sm border-collapse" aria-label={`Tax breakdown for $${amountFmt} salary in ${stateInfo.name}`}>
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 pr-4">Category</th>
                  <th className="text-right py-2 pr-4">Annual Amount</th>
                  <th className="text-right py-2">Effective Rate</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b">
                  <td className="py-2 pr-4">Gross Salary</td>
                  <td className="text-right pr-4">{formatCurrency(tax.grossSalary)}</td>
                  <td className="text-right">—</td>
                </tr>
                <tr className="border-b opacity-70">
                  <td className="py-2 pr-4 pl-4">− Standard Deduction</td>
                  <td className="text-right pr-4">−{formatCurrency(tax.standardDeduction)}</td>
                  <td className="text-right">—</td>
                </tr>
                <tr className="border-b font-medium">
                  <td className="py-2 pr-4">Federal Taxable Income</td>
                  <td className="text-right pr-4">{formatCurrency(tax.federalTaxableIncome)}</td>
                  <td className="text-right">—</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Federal Income Tax</td>
                  <td className="text-right pr-4">−{formatCurrency(tax.federalTax)}</td>
                  <td className="text-right">{formatPct(tax.effectiveFederalRate)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Social Security (6.2%)</td>
                  <td className="text-right pr-4">−{formatCurrency(tax.socialSecurityTax)}</td>
                  <td className="text-right">{formatPct(tax.socialSecurityTax / tax.grossSalary)}</td>
                </tr>
                <tr className="border-b">
                  <td className="py-2 pr-4">Medicare (1.45%)</td>
                  <td className="text-right pr-4">−{formatCurrency(tax.medicareTax)}</td>
                  <td className="text-right">{formatPct(tax.medicareTax / tax.grossSalary)}</td>
                </tr>
                {tax.additionalMedicareTax > 0 && (
                  <tr className="border-b">
                    <td className="py-2 pr-4">Additional Medicare (0.9%)</td>
                    <td className="text-right pr-4">−{formatCurrency(tax.additionalMedicareTax)}</td>
                    <td className="text-right">{formatPct(tax.additionalMedicareTax / tax.grossSalary)}</td>
                  </tr>
                )}
                {tax.stateTax > 0 && (
                  <tr className="border-b">
                    <td className="py-2 pr-4">
                      {stateInfo.name} State Income Tax
                    </td>
                    <td className="text-right pr-4">−{formatCurrency(tax.stateTax)}</td>
                    <td className="text-right">{formatPct(tax.stateTax / tax.grossSalary)}</td>
                  </tr>
                )}
                {tax.stateTax === 0 && (
                  <tr className="border-b opacity-60">
                    <td className="py-2 pr-4">{stateInfo.name} State Income Tax</td>
                    <td className="text-right pr-4">$0</td>
                    <td className="text-right">0.0%</td>
                  </tr>
                )}
                <tr className="font-semibold text-base">
                  <td className="py-3 pr-4">Take-Home Pay</td>
                  <td className="text-right pr-4">{formatCurrency(tax.takeHomePay)}</td>
                  <td className="text-right">{formatPct(1 - tax.effectiveTotalRate)}</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-2 text-xs opacity-50">
              Effective total tax rate: {formatPct(tax.effectiveTotalRate)} of gross salary
            </p>
          </section>

          {/* Assumptions */}
          <section className="rounded border p-4 text-sm opacity-70 mb-8">
            <h2 className="font-semibold mb-1">Assumptions</h2>
            <ul className="list-disc list-inside space-y-0.5">
              <li>Tax year: 2026</li>
              <li>Filing status: Single</li>
              <li>Deduction: Standard ($16,100)</li>
              <li>No pre-tax contributions or tax credits applied</li>
              <li>State tax: {stateInfo.taxNote}</li>
            </ul>
          </section>

          {/* Navigation */}
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/" className="underline">← Back to Calculator</Link>
            <Link href="/states" className="underline">All State Guides</Link>
            <Link href="/about" className="underline">How We Calculate</Link>
          </div>
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-xs opacity-60 flex gap-4">
        <Link href="/about">About</Link>
        <Link href="/states">State Guides</Link>
        <Link href="/privacy">Privacy Policy</Link>
      </footer>
    </div>
  );
}
