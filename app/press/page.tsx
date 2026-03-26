export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";
import { LINKABLE_ASSETS, CITATION_BOILERPLATE } from "@/lib/linkable-assets";

export const metadata: Metadata = {
  title: `Press & Media — TakeHomeUSA Salary Data (${TAX_YEAR})`,
  description: `Press resources for TakeHomeUSA — the free salary after-tax calculator covering all 50 US states. Data sources, citation language, and key statistics for journalists and bloggers.`,
  alternates: { canonical: "https://www.takehomeusa.com/press" },
  openGraph: {
    title: "TakeHomeUSA Press & Media Kit",
    description: "Salary after-tax data, citation language, and key statistics for journalists, bloggers, and researchers.",
    url: "https://www.takehomeusa.com/press",
    siteName: "TakeHomeUSA",
    type: "website",
  },
};

const KEY_STATS = [
  {
    stat: "$7,420",
    context: "more take-home pay per year in Texas vs. California on a $100K salary",
    source: "TakeHomeUSA analysis, 2026 IRS data",
    url: "/compare/texas-vs-california",
  },
  {
    stat: "9 states",
    context: "have zero state income tax — keeping thousands more for residents",
    source: "State revenue department data, 2026",
    url: "/blog/states-with-no-income-tax",
  },
  {
    stat: "13.3%",
    context: "California's top marginal state income tax rate — highest in the US",
    source: "California FTB, 2026",
    url: "/california",
  },
  {
    stat: "~$7,820",
    context: "average FICA taxes on a $100K salary — same in every state",
    source: "IRS Publication 15, 2026",
    url: "/methodology",
  },
  {
    stat: "$10,420+",
    context: "annual difference between the best and worst states for a $100K salary",
    source: "TakeHomeUSA all-states analysis, 2026",
    url: "/after-tax/100000-a-year-after-tax",
  },
  {
    stat: "$104,200+",
    context: "10-year extra take-home in Texas vs. California on $100K/yr salary",
    source: "TakeHomeUSA compound analysis, 2026",
    url: "/compare/texas-vs-california",
  },
];

export default function PressPage() {
  const pressAssets = LINKABLE_ASSETS.filter((a) =>
    ["data", "methodology", "guide", "comparison"].includes(a.category)
  );

  return (
    <main className="container-page py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>/</span>
        <span className="text-gray-800">Press & Media</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-blue-900 text-white rounded-2xl p-8 mb-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          For Journalists, Bloggers & Researchers
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Press & Media Resources</h1>
        <p className="text-blue-200 text-lg max-w-2xl">
          TakeHomeUSA provides free, accurate US salary after-tax data for all 50 states.
          Use our data in your articles, cite our pages, or embed our tools.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-bold text-white mb-1">Free to cite</p>
            <p className="text-blue-200 text-xs">All data is free to reference with attribution</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-bold text-white mb-1">All 50 states</p>
            <p className="text-blue-200 text-xs">{TAX_YEAR} IRS brackets, verified state rates</p>
          </div>
          <div className="bg-white/10 rounded-xl p-4">
            <p className="font-bold text-white mb-1">Transparent methodology</p>
            <p className="text-blue-200 text-xs">Every assumption documented and published</p>
          </div>
        </div>
      </div>

      <div className="space-y-12 text-gray-700">

        {/* What is TakeHomeUSA */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What is TakeHomeUSA?</h2>
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 text-sm leading-relaxed space-y-3">
            <p>
              <strong>TakeHomeUSA</strong> (takehomeusa.com) is a free, no-signup salary
              after-tax calculator covering all 50 US states. It uses official {TAX_YEAR} IRS
              tax brackets (IRS Rev. Proc. 2025-32) and each state&apos;s published income tax
              rates to calculate exact take-home pay after federal income tax, state income tax,
              Social Security, and Medicare.
            </p>
            <p>
              The site pre-computes results for over 3,000 salary/state combinations and provides
              an interactive calculator for any salary amount. It supports multiple filing
              statuses, pre-tax deductions (401k, HSA, health insurance), and optional
              local/city tax calculations for major metros.
            </p>
            <p>
              <strong>Coverage:</strong> All 50 states · Salaries $20K–$2M · Hourly wages
              · Monthly pay · State-vs-state comparisons · No-tax state guides · Cost-of-living data.
            </p>
          </div>
        </section>

        {/* Key Stats for Journalists */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Key Statistics — Ready to Quote</h2>
          <p className="text-gray-500 mb-6">All figures use {TAX_YEAR} IRS data, single filer, standard deduction. Click any stat for the full data page.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {KEY_STATS.map(({ stat, context, source, url }) => (
              <Link
                key={stat + context}
                href={url}
                className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-md transition-all group"
              >
                <p className="text-3xl font-black text-blue-700 mb-2 group-hover:text-blue-800">{stat}</p>
                <p className="font-semibold text-gray-900 text-sm mb-2">{context}</p>
                <p className="text-xs text-gray-400">{source}</p>
                <p className="text-xs text-blue-500 mt-2">View full data →</p>
              </Link>
            ))}
          </div>
        </section>

        {/* How to Cite */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">How to Cite TakeHomeUSA</h2>
          <p className="mb-5 leading-relaxed">
            We ask only for a hyperlink back to the relevant page. No formal permission needed.
            Here are suggested formats for different contexts:
          </p>
          <div className="space-y-4">
            {[
              { label: "Short mention / hyperlink anchor text", text: CITATION_BOILERPLATE.short },
              { label: "Standard inline citation", text: CITATION_BOILERPLATE.standard },
              { label: "Academic / formal reference", text: CITATION_BOILERPLATE.academic },
              {
                label: "Attribution for embedded widgets",
                text: "Powered by TakeHomeUSA (takehomeusa.com) — free salary after-tax calculator for all 50 US states.",
              },
            ].map(({ label, text }) => (
              <div key={label} className="bg-gray-50 border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{label}</p>
                <p className="text-sm text-gray-800 leading-relaxed font-mono bg-white border border-gray-200 rounded-lg p-3">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Best Pages to Link */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Best Pages to Reference</h2>
          <p className="text-gray-500 mb-6">Our most citable, data-rich pages — organized by use case.</p>
          <div className="space-y-3">
            {pressAssets.map((asset) => (
              <div key={asset.url} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-300 transition-colors">
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <Link href={asset.url} className="font-bold text-gray-900 hover:text-blue-700 transition-colors">
                      {asset.title}
                    </Link>
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{asset.category}</span>
                  </div>
                  <Link href={asset.url} className="text-blue-600 text-sm font-semibold hover:underline shrink-0">
                    View page →
                  </Link>
                </div>
                <p className="text-sm text-gray-600 mb-2">{asset.description}</p>
                <p className="text-xs text-gray-500">
                  <strong>Best for:</strong> {asset.targetAudience.join(", ")}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Boilerplate Blurbs for Outreach */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Outreach Copy Blocks</h2>
          <p className="mb-5 leading-relaxed">
            If you&apos;re writing about salaries, relocation, remote work, or personal finance,
            these copy blocks may be useful as context for including TakeHomeUSA in your piece:
          </p>
          <div className="space-y-4">
            {[
              {
                useCase: "Salary comparison article",
                copy: `According to TakeHomeUSA, a free salary after-tax calculator, a $100,000 salary results in $79,180 take-home per year in Texas — compared to $71,760 in California. The $7,420 annual gap is due to California's state income tax, which can reach 13.3%, while Texas has no state income tax.`,
              },
              {
                useCase: "Relocation / move for money article",
                copy: `The difference in after-tax pay between states can be significant. TakeHomeUSA (takehomeusa.com) shows that a worker earning $100,000 keeps roughly $7,420 more per year in Texas than California — or over $74,000 more over 10 years, before accounting for cost-of-living differences.`,
              },
              {
                useCase: "Remote work / work from anywhere article",
                copy: `Remote workers choosing their home state can significantly impact their take-home pay. TakeHomeUSA's state comparison tool shows workers in no-income-tax states like Texas, Florida, or Nevada keep $5,000–$10,000 more per year than peers in high-tax states like California or New York at typical tech salaries.`,
              },
              {
                useCase: "Personal finance / salary negotiation article",
                copy: `Understanding your actual take-home pay — not just your gross salary — is essential when evaluating a job offer. Free tools like TakeHomeUSA (takehomeusa.com) let you instantly calculate net pay for any salary in any state using current IRS data, with no signup required.`,
              },
            ].map(({ useCase, copy }) => (
              <div key={useCase} className="bg-white border border-gray-200 rounded-xl p-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">{useCase}</p>
                <p className="text-sm text-gray-700 leading-relaxed italic">&ldquo;{copy}&rdquo;</p>
              </div>
            ))}
          </div>
        </section>

        {/* Embeddable Tools */}
        <section>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Embeddable Widgets</h2>
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
            <p className="font-bold text-indigo-900 mb-2">Drop a salary calculator into your page — free</p>
            <p className="text-sm text-gray-700 mb-4">
              Our embeddable widgets let your readers calculate take-home pay without leaving your
              site. Clean iframe code, mobile-friendly, with natural attribution to TakeHomeUSA.
            </p>
            <Link
              href="/embed"
              className="inline-block bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-indigo-800 transition-colors text-sm"
            >
              Get Embed Code →
            </Link>
          </div>
        </section>

        {/* Methodology link */}
        <section className="bg-gray-50 border border-gray-200 rounded-xl p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-3">About Our Data</h2>
          <p className="text-sm text-gray-700 leading-relaxed mb-4">
            All calculations use official {TAX_YEAR} IRS tax brackets (IRS Rev. Proc. 2025-32),
            each state&apos;s published income tax rates, and FICA rates from IRS Publication 15.
            Calculations assume single filing status and the standard deduction unless otherwise specified.
            A full technical methodology — including all bracket tables, assumptions, and limitations —
            is published at:
          </p>
          <Link href="/methodology" className="text-blue-700 font-semibold hover:underline text-sm">
            takehomeusa.com/methodology →
          </Link>
        </section>

      </div>

      <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-3">
        <Link href="/data" className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm">
          Data Hub →
        </Link>
        <Link href="/methodology" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Full Methodology →
        </Link>
        <Link href="/embed" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Get Embed Code →
        </Link>
        <Link href="/" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Use the Calculator →
        </Link>
      </div>
    </main>
  );
}
