export const dynamic = "force-static";

import type { Metadata } from "next";
import Link from "next/link";
import { TAX_YEAR } from "@/lib/tax";
import { BLOG_POSTS } from "@/lib/blog-posts";

export const metadata: Metadata = {
  title: "Tax & Salary Guides — Free Resources",
  description: `Free US salary and tax guides: state-by-state take-home pay, federal tax brackets, and salary comparisons — all powered by real ${TAX_YEAR} IRS data.`,
  alternates: { canonical: "https://www.takehomeusa.com/blog" },
  openGraph: {
    title: "Tax & Salary Guides | TakeHomeUSA",
    description: `Free guides on US income taxes and take-home pay — real ${TAX_YEAR} IRS data.`,
    url: "https://www.takehomeusa.com/blog",
    siteName: "TakeHomeUSA",
    type: "website",
  },
};

const CATEGORY_BADGE: Record<string, string> = {
  "State Guides":  "bg-blue-100 text-blue-700",
  "Tax Guides":    "bg-purple-100 text-purple-700",
  "Salary Guides": "bg-green-100 text-green-700",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogIndexPage() {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.takehomeusa.com/" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://www.takehomeusa.com/blog" },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="container-page py-14 text-center">
          <div className="inline-block bg-blue-700 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            {TAX_YEAR} Tax Guides
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            US Salary &amp; Tax Guides
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto">
            Plain-English guides on federal and state income taxes, take-home pay
            comparisons, and salary breakdowns — all using real {TAX_YEAR} IRS data.
          </p>
        </div>
      </section>

      {/* ── Post grid ─────────────────────────────────────────────────────────── */}
      <section className="container-page my-14">
        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {BLOG_POSTS.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="group bg-white border border-gray-200 rounded-2xl p-6 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col"
            >
              <div className="flex items-center justify-between mb-3">
                <span
                  className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                    CATEGORY_BADGE[post.category] ?? "bg-gray-100 text-gray-600"
                  }`}
                >
                  {post.category}
                </span>
                <span className="text-xs text-gray-400">{post.readTime} min read</span>
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors leading-snug">
                {post.title}
              </h2>
              <p className="text-gray-500 text-sm leading-relaxed flex-1">{post.excerpt}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="text-xs text-gray-400">{formatDate(post.date)}</span>
                <span className="text-blue-600 text-sm font-semibold group-hover:text-blue-800">
                  Read guide →
                </span>
              </div>
            </Link>
          ))}
        </div>

        {/* ── Calculator CTA ────────────────────────────────────────────────── */}
        <div className="mt-12 text-center bg-gradient-to-r from-blue-900 to-indigo-900 text-white rounded-2xl p-8 max-w-2xl mx-auto">
          <h2 className="text-2xl font-bold mb-2">See your own numbers</h2>
          <p className="text-blue-300 mb-5 text-sm">
            Free calculator — any salary, any state, instant results.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href="/"
              className="bg-white text-blue-900 font-bold px-7 py-2.5 rounded-xl hover:bg-blue-50 transition-colors"
            >
              Open Calculator →
            </Link>
            <Link
              href="/states"
              className="border border-white/30 text-white px-7 py-2.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              All 50 States
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
