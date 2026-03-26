export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";

export const metadata: Metadata = {
  title: `Free Embeddable Salary Calculator Widget (${TAX_YEAR})`,
  description: `Add a free salary after-tax calculator to your blog, HR site, or relocation page. Clean iframe widgets covering all 50 US states — no API key, no signup, just copy and paste.`,
  alternates: { canonical: "https://www.takehomeusa.com/embed" },
  openGraph: {
    title: "Free Embeddable Salary Calculator Widget — TakeHomeUSA",
    description: "Copy-paste iframe widgets to add salary after-tax calculations to any website. Free, mobile-friendly, covers all 50 US states.",
    url: "https://www.takehomeusa.com/embed",
    siteName: "TakeHomeUSA",
    type: "website",
  },
};

const SITE = "https://www.takehomeusa.com";

interface EmbedWidget {
  id: string;
  title: string;
  description: string;
  iframeSrc: string;
  width: string;
  height: string;
  bestFor: string[];
  previewBg: string;
}

const WIDGETS: EmbedWidget[] = [
  {
    id: "salary-calculator",
    title: "Full Salary After-Tax Calculator",
    description: "The complete calculator — enter any salary, pick any state, get instant take-home pay. Covers all 50 states with 2026 IRS brackets.",
    iframeSrc: `${SITE}/`,
    width: "100%",
    height: "700",
    bestFor: ["Finance blogs", "HR sites", "Career pages", "Benefits portals"],
    previewBg: "from-blue-900 to-indigo-900",
  },
  {
    id: "texas-vs-california",
    title: "Texas vs California Take-Home Comparison",
    description: "Side-by-side comparison showing how much more you keep in Texas vs California at any salary level.",
    iframeSrc: `${SITE}/compare/texas-vs-california`,
    width: "100%",
    height: "600",
    bestFor: ["Relocation articles", "Remote work guides", "CA-to-TX move content"],
    previewBg: "from-green-800 to-blue-800",
  },
  {
    id: "100k-all-states",
    title: "$100K Salary — All 50 States Table",
    description: "Pre-computed take-home pay for a $100K salary in every US state. Sorted best to worst.",
    iframeSrc: `${SITE}/after-tax/100000-a-year-after-tax`,
    width: "100%",
    height: "700",
    bestFor: ["Salary comparison articles", "HR reference pages", "Finance publications"],
    previewBg: "from-indigo-900 to-blue-800",
  },
  {
    id: "no-tax-states",
    title: "No Income Tax States Widget",
    description: "Shows all 9 no-income-tax states with take-home figures on a $100K salary. Great for relocation content.",
    iframeSrc: `${SITE}/blog/states-with-no-income-tax`,
    width: "100%",
    height: "600",
    bestFor: ["Relocation guides", "Remote worker tax articles", "Financial independence content"],
    previewBg: "from-green-900 to-emerald-800",
  },
];

function getEmbedCode(widget: EmbedWidget): string {
  return `<iframe
  src="${widget.iframeSrc}"
  width="${widget.width}"
  height="${widget.height}"
  frameborder="0"
  scrolling="yes"
  title="${widget.title}"
  loading="lazy"
  style="border-radius: 12px; border: 1px solid #e5e7eb;"
></iframe>
<p style="font-size: 12px; color: #6b7280; margin-top: 6px;">
  Powered by <a href="${SITE}" target="_blank" rel="noopener">TakeHomeUSA</a> — free salary after-tax calculator, all 50 US states.
</p>`;
}

export default function EmbedPage() {
  return (
    <main className="container-page py-12 max-w-4xl">
      {/* Breadcrumb */}
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>/</span>
        <span className="text-gray-800">Embed Widgets</span>
      </nav>

      {/* Hero */}
      <div className="bg-gradient-to-br from-indigo-900 to-blue-900 text-white rounded-2xl p-8 mb-10">
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white/80 text-xs font-semibold px-3 py-1 rounded-full mb-4">
          Free · No API key · No signup
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">
          Embeddable Salary Calculator Widgets
        </h1>
        <p className="text-blue-200 text-lg max-w-2xl">
          Add a free, fully-functional salary after-tax calculator to your blog, HR site,
          or relocation page. Copy one line of iframe code — that&apos;s it.
        </p>
        <div className="mt-6 grid sm:grid-cols-3 gap-4 text-sm">
          {[
            { label: "No API key needed", desc: "Works via standard iframe" },
            { label: "Mobile responsive", desc: "Adapts to any container width" },
            { label: "Always current", desc: `Auto-updated to ${TAX_YEAR} IRS data` },
          ].map(({ label, desc }) => (
            <div key={label} className="bg-white/10 rounded-xl p-4">
              <p className="font-bold text-white mb-1">{label}</p>
              <p className="text-blue-200 text-xs">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Who should use these */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Who These Widgets Are For</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              title: "Finance Bloggers",
              desc: "Add a real salary calculator to your salary negotiation or budgeting posts without building your own.",
              icon: "📊",
            },
            {
              title: "HR & Benefits Sites",
              desc: "Let employees instantly see their net pay for any salary scenario across all US states.",
              icon: "🏢",
            },
            {
              title: "Relocation Sites",
              desc: "Show real take-home pay differences between states — powerful proof for move-for-money content.",
              icon: "🏠",
            },
            {
              title: "Career & Job Sites",
              desc: "Help job seekers understand what a salary offer actually means after taxes.",
              icon: "💼",
            },
            {
              title: "Personal Finance Creators",
              desc: "YouTube creators, podcasters, and newsletter writers — embed in your resource pages.",
              icon: "🎙️",
            },
            {
              title: "Cost-of-Living Pages",
              desc: "Pair take-home data with cost-of-living comparisons for richer, more useful content.",
              icon: "🏙️",
            },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="bg-white border border-gray-200 rounded-xl p-5 hover:border-indigo-300 transition-colors">
              <p className="text-2xl mb-2">{icon}</p>
              <p className="font-bold text-gray-900 mb-2">{title}</p>
              <p className="text-sm text-gray-600">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Widget Gallery */}
      <section className="space-y-12">
        <h2 className="text-2xl font-bold text-gray-900">Available Widgets</h2>

        {WIDGETS.map((widget) => {
          const code = getEmbedCode(widget);
          return (
            <div key={widget.id} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
              {/* Widget header */}
              <div className={`bg-gradient-to-r ${widget.previewBg} text-white p-6`}>
                <h3 className="text-xl font-bold mb-2">{widget.title}</h3>
                <p className="text-white/70 text-sm mb-4">{widget.description}</p>
                <div className="flex flex-wrap gap-2">
                  {widget.bestFor.map((audience) => (
                    <span key={audience} className="bg-white/15 text-white/90 text-xs px-2.5 py-1 rounded-full">
                      {audience}
                    </span>
                  ))}
                </div>
              </div>

              {/* Embed code */}
              <div className="bg-gray-950 p-5">
                <p className="text-gray-400 text-xs font-bold uppercase tracking-wide mb-3">Embed Code</p>
                <pre className="text-green-400 text-xs overflow-x-auto leading-relaxed whitespace-pre-wrap font-mono">
                  {code}
                </pre>
              </div>

              {/* Copy instructions + link */}
              <div className="bg-white p-5 flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-gray-900 text-sm mb-1">How to use</p>
                  <p className="text-gray-500 text-xs">Copy the code above and paste it into your HTML, WordPress block, or CMS editor.</p>
                </div>
                <div className="flex gap-3">
                  <Link
                    href={widget.iframeSrc.replace(SITE, "") || "/"}
                    className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-colors"
                  >
                    Preview →
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Usage Terms */}
      <section className="mt-14 bg-gray-50 border border-gray-200 rounded-2xl p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-3">Usage Terms</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          {[
            "All widgets are free to use — no license or permission required for editorial, educational, or non-commercial use.",
            "The attribution line (\"Powered by TakeHomeUSA\") must remain visible and clickable.",
            "Do not modify the iframe src URL to remove attribution or redirect to a competing site.",
            "Do not hotlink into internal API routes — use the page URLs shown above.",
            "Commercial use (e.g., embedding in a paid product or app) — contact us first.",
            "All data is provided AS IS. Do not represent calculator outputs as certified tax advice.",
          ].map((term) => (
            <li key={term} className="flex gap-2 items-start">
              <span className="text-blue-600 font-bold shrink-0">·</span>
              {term}
            </li>
          ))}
        </ul>
      </section>

      {/* Related */}
      <div className="mt-10 pt-8 border-t border-gray-200 flex flex-wrap gap-3">
        <Link href="/press" className="bg-blue-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-blue-800 transition-colors text-sm">
          Press & Media →
        </Link>
        <Link href="/methodology" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Our Methodology →
        </Link>
        <Link href="/data" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Data Hub →
        </Link>
        <Link href="/" className="border border-gray-300 text-gray-700 px-5 py-2.5 rounded-xl font-semibold hover:bg-gray-50 transition-colors text-sm">
          Use the Calculator →
        </Link>
      </div>
    </main>
  );
}
