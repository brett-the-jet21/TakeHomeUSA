export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: `Paycheck & Tax Glossary — Key Terms Explained (${TAX_YEAR})`,
  description: `Plain-English definitions of take-home pay, effective tax rate, gross salary, FICA, standard deduction, marginal rate, and more. Reference guide for salary and tax terminology.`,
  alternates: { canonical: "https://www.takehomeusa.com/glossary" },
  openGraph: {
    title: "Paycheck & Tax Glossary — TakeHomeUSA",
    description: "Clear definitions of paycheck and tax terms: gross pay, net pay, FICA, effective rate, marginal rate, standard deduction, and more.",
    url: "https://www.takehomeusa.com/glossary",
    siteName: "TakeHomeUSA",
    type: "article",
  },
};

interface Term {
  term: string;
  shortDef: string;
  fullDef: string;
  example?: string;
  related?: string[];
  anchor: string;
}

const TERMS: Term[] = [
  {
    term: "Take-Home Pay",
    anchor: "take-home-pay",
    shortDef: "The money you actually receive in your bank account after all taxes are withheld.",
    fullDef: `Take-home pay (also called net pay) is your gross salary minus all taxes withheld: federal income tax, state income tax (if applicable), Social Security, and Medicare. It is what you actually have to spend, save, or invest. Take-home pay is always less than gross pay for any taxable wage income.`,
    example: "On a $100,000 salary in Texas (no state tax), take-home pay is approximately $79,180/year or $6,598/month after all federal and FICA taxes.",
    related: ["gross-pay", "net-pay", "fica"],
  },
  {
    term: "Gross Pay",
    anchor: "gross-pay",
    shortDef: "Your total salary or wages before any taxes or deductions.",
    fullDef: `Gross pay is the total amount your employer agrees to pay you — for example, $75,000/year or $25/hour. It is the starting point for all tax calculations. Gross pay is higher than take-home pay because taxes have not yet been subtracted. When salary is advertised in a job posting, it is always the gross amount.`,
    example: "A job offer of $80,000 means $80,000 gross — your actual take-home will be lower after taxes.",
    related: ["take-home-pay", "net-pay"],
  },
  {
    term: "Net Pay",
    anchor: "net-pay",
    shortDef: "Synonymous with take-home pay — your pay after all deductions.",
    fullDef: `Net pay and take-home pay mean the same thing: the amount deposited in your account after all taxes and withholdings are subtracted. Net pay = Gross pay − Federal income tax − State income tax − Social Security − Medicare − any other voluntary deductions (health insurance premiums, 401k contributions, etc.).`,
    related: ["take-home-pay", "gross-pay"],
  },
  {
    term: "Effective Tax Rate",
    anchor: "effective-tax-rate",
    shortDef: "The actual average percentage of your income you pay in taxes.",
    fullDef: `Your effective tax rate is the percentage of your total gross income paid in taxes — calculated by dividing total tax paid by total gross income. Because the US uses a progressive bracket system, your effective rate is always lower than your marginal (top bracket) rate. The effective rate is the most accurate measure of your overall tax burden.`,
    example: "On a $100K salary in Texas: federal tax of $14,327 + FICA of $7,650 = $21,977 total / $100,000 = 22.0% effective rate.",
    related: ["marginal-tax-rate", "federal-income-tax"],
  },
  {
    term: "Marginal Tax Rate",
    anchor: "marginal-tax-rate",
    shortDef: "The tax rate applied to the next dollar you earn — your top bracket rate.",
    fullDef: `The marginal tax rate is the rate applied to your highest dollar of income. In a progressive system, only the income above a threshold is taxed at the higher rate — not all income. For example, if your marginal rate is 22%, that rate only applies to income above the 12% bracket ceiling. Your first dollars of income are still taxed at 10% and 12%.`,
    example: "A single filer earning $100,000 has a 22% federal marginal rate — but their effective rate is approximately 15.4% because lower brackets apply to earlier income.",
    related: ["effective-tax-rate", "federal-income-tax", "tax-bracket"],
  },
  {
    term: "Tax Bracket",
    anchor: "tax-bracket",
    shortDef: "An income range taxed at a specific rate under the progressive federal system.",
    fullDef: `Federal income tax is calculated using progressive brackets. For ${TAX_YEAR} single filers, the brackets are: 10% ($0–$11,925), 12% ($11,926–$48,475), 22% ($48,476–$103,350), 24% ($103,351–$197,300), 32% ($197,301–$250,525), 35% ($250,526–$626,350), 37% (over $626,350). Only the income within each bracket is taxed at that rate.`,
    example: "A $60,000 salary: first $11,925 is taxed at 10%, next $36,549 at 12%, remaining $11,525 at 22%.",
    related: ["marginal-tax-rate", "federal-income-tax", "progressive-tax"],
  },
  {
    term: "Federal Income Tax",
    anchor: "federal-income-tax",
    shortDef: "Tax paid to the US federal government on earned income, calculated using progressive brackets.",
    fullDef: `Federal income tax is the largest tax most workers pay. It is calculated by applying progressive bracket rates to taxable income (gross salary minus the standard deduction or itemized deductions). For ${TAX_YEAR}, the standard deduction for single filers is $16,100. Federal tax is the same regardless of which state you live in.`,
    example: "On a $100K salary, standard deduction of $16,100 leaves $83,900 taxable. Federal tax ≈ $14,327.",
    related: ["tax-bracket", "standard-deduction", "fica"],
  },
  {
    term: "State Income Tax",
    anchor: "state-income-tax",
    shortDef: "Tax paid to your state government on earned income — varies dramatically by state.",
    fullDef: `State income tax is levied by most (but not all) US states on residents' earned income. Nine states have no state income tax: Alaska, Florida, Nevada, New Hampshire (wages only), South Dakota, Tennessee, Texas, Washington, and Wyoming. Other states range from flat rates (e.g., Pennsylvania 3.07%) to progressive schedules reaching 13.3% in California.`,
    example: "On a $100K salary: Texas = $0 state tax; California = approximately $7,420 state tax; New York = approximately $6,821 state tax.",
    related: ["no-income-tax-states", "take-home-pay"],
  },
  {
    term: "FICA",
    anchor: "fica",
    shortDef: "Federal Insurance Contributions Act — includes Social Security and Medicare taxes.",
    fullDef: `FICA is the combined payroll tax covering Social Security (6.2% on wages up to $184,500 in ${TAX_YEAR}) and Medicare (1.45% on all wages, plus 0.9% on wages over $200,000). FICA taxes are the same regardless of state or filing status. Employers match the employee share, but employees only see their own portion withheld.`,
    example: "On a $100K salary: Social Security = $6,200 · Medicare = $1,450 · Total FICA = $7,650.",
    related: ["social-security-tax", "medicare-tax"],
  },
  {
    term: "Social Security Tax",
    anchor: "social-security-tax",
    shortDef: "6.2% payroll tax on wages up to the annual wage base ($184,500 in 2026).",
    fullDef: `Social Security tax is part of FICA. The employee pays 6.2% on earned wages up to the annual wage base ($184,500 for ${TAX_YEAR}). No Social Security tax is owed on wages above this ceiling. The funds go to the Social Security trust funds for retirement and disability benefits.`,
    related: ["fica", "medicare-tax"],
  },
  {
    term: "Medicare Tax",
    anchor: "medicare-tax",
    shortDef: "1.45% payroll tax on all wages, with an additional 0.9% on wages over $200K.",
    fullDef: `Medicare tax is part of FICA. Unlike Social Security, there is no wage base cap — 1.45% applies to all earned wages. High earners (over $200,000 single) also pay an Additional Medicare Tax of 0.9%, for a combined 2.35% above that threshold. Medicare funds healthcare for those 65 and older.`,
    related: ["fica", "social-security-tax"],
  },
  {
    term: "Standard Deduction",
    anchor: "standard-deduction",
    shortDef: "A flat amount subtracted from gross income before federal tax is calculated.",
    fullDef: `The standard deduction reduces taxable income without requiring itemization of expenses. For ${TAX_YEAR}: single filers $16,100 · Married filing jointly $32,200 · Head of household $24,200. Most taxpayers use the standard deduction because it is simpler and often larger than their itemized deductions. TakeHomeUSA defaults to the standard deduction.`,
    example: "On a $75,000 salary: $75,000 − $16,100 = $58,900 taxable income, which then gets progressive federal brackets applied.",
    related: ["federal-income-tax", "taxable-income"],
  },
  {
    term: "Taxable Income",
    anchor: "taxable-income",
    shortDef: "Gross salary minus standard (or itemized) deductions — the base for federal tax calculation.",
    fullDef: `Taxable income is the amount your federal income tax brackets are applied to. It is calculated as: Gross Income − Standard Deduction (or itemized deductions) − Pre-tax deductions (401k, HSA, health insurance). A lower taxable income means less federal income tax — which is why pre-tax retirement contributions can reduce your tax bill.`,
    related: ["standard-deduction", "federal-income-tax", "pre-tax-deductions"],
  },
  {
    term: "Pre-Tax Deductions",
    anchor: "pre-tax-deductions",
    shortDef: "Contributions that reduce taxable income before taxes are calculated (401k, HSA, health insurance).",
    fullDef: `Pre-tax deductions are amounts deducted from your paycheck before tax is calculated. Common examples: Traditional 401(k) contributions, HSA contributions, employer-sponsored health insurance premiums (Section 125). These reduce your taxable income, lowering both federal income tax and sometimes FICA. Roth 401k contributions are post-tax and do not reduce taxable income.`,
    example: "Contributing $10,000 to a 401k on a $100K salary: taxable income drops to $90,000, reducing federal tax by approximately $2,200.",
    related: ["taxable-income", "401k"],
  },
  {
    term: "401(k)",
    anchor: "401k",
    shortDef: "An employer-sponsored retirement plan allowing pre-tax or post-tax (Roth) contributions.",
    fullDef: `A 401(k) is a workplace retirement savings plan. Traditional 401(k) contributions are pre-tax, reducing your current taxable income. Roth 401(k) contributions are after-tax, providing tax-free withdrawals in retirement. The ${TAX_YEAR} contribution limit is $23,500 (plus $7,500 catch-up for those 50+). Contributions lower your take-home pay but reduce your current tax bill (traditional) or future tax bill (Roth).`,
    related: ["pre-tax-deductions", "taxable-income"],
  },
  {
    term: "Biweekly Pay",
    anchor: "biweekly-pay",
    shortDef: "Paid every two weeks — 26 paychecks per year.",
    fullDef: `Biweekly pay means you receive a paycheck every two weeks, resulting in 26 paychecks per year. Annual salary ÷ 26 = gross biweekly check. Biweekly is the most common pay frequency in the US. Two months per year will have three paychecks instead of two — a useful budgeting consideration.`,
    example: "$75,000/year biweekly gross = $2,884.62 per check. After taxes (Texas), approximately $2,300/check.",
    related: ["take-home-pay", "gross-pay"],
  },
  {
    term: "No Income Tax States",
    anchor: "no-income-tax-states",
    shortDef: "The 9 US states that levy no state income tax on wages.",
    fullDef: `Nine states have no state income tax on wages: Alaska, Florida, Nevada, New Hampshire (wages only — investment income is taxed), South Dakota, Tennessee, Texas, Washington, and Wyoming. Residents of these states pay only federal income tax and FICA — keeping thousands more per year compared to high-tax states. On a $100K salary, this means approximately $6,000–$13,000 more per year than California.`,
    related: ["state-income-tax", "take-home-pay"],
  },
  {
    term: "Progressive Tax",
    anchor: "progressive-tax",
    shortDef: "A tax system where higher incomes pay higher percentage rates — but only on the income above each threshold.",
    fullDef: `A progressive tax system uses increasing rates for increasing income bands. The US federal income tax is progressive: you pay 10% on the first bracket, 12% on the next, 22% above that, and so on — but each rate applies only to the income within its bracket, not to your total income. This means your overall effective rate is always lower than your top marginal bracket.`,
    related: ["tax-bracket", "marginal-tax-rate", "effective-tax-rate"],
  },
  {
    term: "Flat Tax",
    anchor: "flat-tax",
    shortDef: "A state income tax system using a single rate on all taxable income.",
    fullDef: `Several US states use a flat rate — a single percentage applied to all (or most) taxable income regardless of earnings. Examples: Illinois 4.95%, Pennsylvania 3.07%, Colorado 4.40%, Massachusetts 5.00%. Flat tax states are simpler to calculate than progressive bracket states. The effective state rate equals the flat rate (before deductions/exemptions).`,
    related: ["state-income-tax", "progressive-tax"],
  },
  {
    term: "Filing Status",
    anchor: "filing-status",
    shortDef: "Your IRS-defined category that determines your tax brackets and standard deduction.",
    fullDef: `Filing status determines which tax brackets and standard deduction apply to you. The five federal statuses are: Single, Married Filing Jointly (MFJ), Married Filing Separately (MFS), Head of Household (HOH), and Qualifying Surviving Spouse (QSS). MFJ has wider brackets and a larger standard deduction than single — often resulting in lower taxes for couples. TakeHomeUSA defaults to single filer.`,
    related: ["tax-bracket", "standard-deduction"],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "DefinedTermSet",
  name: `Paycheck & Tax Glossary — ${TAX_YEAR}`,
  url: "https://www.takehomeusa.com/glossary",
  description: "Plain-English definitions of paycheck and salary tax terminology.",
  hasDefinedTerm: TERMS.map(({ term, fullDef, anchor }) => ({
    "@type": "DefinedTerm",
    name: term,
    description: fullDef,
    url: `https://www.takehomeusa.com/glossary#${anchor}`,
    inDefinedTermSet: "https://www.takehomeusa.com/glossary",
  })),
};

export default function GlossaryPage() {
  const letters = [...new Set(TERMS.map((t) => t.term[0].toUpperCase()))].sort();

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      <main className="container-page py-12 max-w-4xl">
        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
          <Link href="/" className="hover:text-blue-700">Home</Link>
          <span>/</span>
          <span className="text-gray-800">Glossary</span>
        </nav>

        {/* Hero */}
        <div className="bg-gradient-to-br from-blue-900 to-blue-800 text-white rounded-2xl p-8 mb-10">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
            Paycheck & Tax Glossary
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl">
            Plain-English definitions of take-home pay, tax rates, deductions, and paycheck
            terminology — everything you need to understand your salary.
          </p>
          <p className="text-blue-300 text-sm mt-4">
            {TERMS.length} terms · Updated for {TAX_YEAR}
          </p>
        </div>

        {/* Quick nav */}
        <div className="flex flex-wrap gap-2 mb-10">
          {letters.map((letter) => (
            <a
              key={letter}
              href={`#letter-${letter}`}
              className="bg-gray-100 hover:bg-blue-100 hover:text-blue-700 text-gray-600 font-bold px-3 py-1.5 rounded-lg text-sm transition-colors"
            >
              {letter}
            </a>
          ))}
        </div>

        {/* Terms grouped by letter */}
        <div className="space-y-12">
          {letters.map((letter) => {
            const letterTerms = TERMS.filter((t) => t.term[0].toUpperCase() === letter);
            return (
              <div key={letter} id={`letter-${letter}`}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-3xl font-black text-blue-700">{letter}</span>
                  <div className="flex-1 h-px bg-gray-200" />
                </div>
                <div className="space-y-6">
                  {letterTerms.map((term) => (
                    <div
                      key={term.anchor}
                      id={term.anchor}
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:border-blue-200 transition-colors"
                    >
                      <h2 className="text-xl font-bold text-gray-900 mb-2">
                        {term.term}
                      </h2>
                      <p className="text-blue-700 font-semibold text-sm mb-3">{term.shortDef}</p>
                      <p className="text-gray-700 leading-relaxed text-sm mb-3">{term.fullDef}</p>
                      {term.example && (
                        <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 mb-3">
                          <p className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-1">Example</p>
                          <p className="text-sm text-blue-800">{term.example}</p>
                        </div>
                      )}
                      {term.related && term.related.length > 0 && (
                        <p className="text-xs text-gray-400">
                          Related:{" "}
                          {term.related.map((r, i) => {
                            const relatedTerm = TERMS.find((t) => t.anchor === r);
                            return (
                              <span key={r}>
                                {i > 0 && ", "}
                                <a href={`#${r}`} className="text-blue-500 hover:underline">
                                  {relatedTerm?.term ?? r}
                                </a>
                              </span>
                            );
                          })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA */}
        <div className="mt-14 bg-blue-900 text-white rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-3">Now put the numbers to work</h2>
          <p className="text-blue-300 mb-6">Enter your salary and see your exact take-home pay — using all the terms above.</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/" className="bg-white text-blue-900 px-6 py-2.5 rounded-xl font-bold hover:bg-blue-50 transition-colors text-sm">
              Open Calculator →
            </Link>
            <Link href="/methodology" className="border border-white/30 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-white/10 transition-colors text-sm">
              How We Calculate →
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
