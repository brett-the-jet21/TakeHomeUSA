/**
 * RelatedPages — reusable internal link module.
 *
 * Renders a clean "Related pages" or "Explore more" section that connects
 * the current page to other relevant pages across the site.
 * Improves crawlability, topical authority, and pages-per-session.
 *
 * Usage:
 *   <RelatedPages
 *     title="Explore More"
 *     links={[
 *       { href: "/compare/texas-vs-california", label: "Texas vs California", desc: "Side-by-side take-home comparison" },
 *       { href: "/blog/states-with-no-income-tax", label: "No-Tax States Guide", desc: "9 states with zero state income tax" },
 *     ]}
 *   />
 */

import Link from "next/link";

export interface RelatedLink {
  href: string;
  label: string;
  desc?: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "gray" | "red";
}

interface RelatedPagesProps {
  title?: string;
  links: RelatedLink[];
  columns?: 1 | 2 | 3 | 4;
  variant?: "card" | "list" | "compact";
}

const BADGE_COLORS = {
  green: "bg-green-100 text-green-700",
  blue:  "bg-blue-100 text-blue-700",
  gray:  "bg-gray-100 text-gray-600",
  red:   "bg-red-100 text-red-700",
};

export default function RelatedPages({
  title = "Related Resources",
  links,
  columns = 2,
  variant = "card",
}: RelatedPagesProps) {
  const gridClass =
    columns === 1 ? "grid-cols-1"
    : columns === 2 ? "grid-cols-1 sm:grid-cols-2"
    : columns === 3 ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
    : "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";

  if (variant === "list") {
    return (
      <section className="my-10">
        {title && <h2 className="text-xl font-bold text-gray-900 mb-4">{title}</h2>}
        <ul className="space-y-2">
          {links.map(({ href, label, desc, badge, badgeColor = "blue" }) => (
            <li key={href}>
              <Link
                href={href}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-blue-50 transition-colors group"
              >
                <span className="text-blue-500 font-bold group-hover:translate-x-0.5 transition-transform">→</span>
                <span>
                  <span className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{label}</span>
                  {badge && (
                    <span className={`ml-2 text-xs px-1.5 py-0.5 rounded-full font-semibold ${BADGE_COLORS[badgeColor]}`}>
                      {badge}
                    </span>
                  )}
                  {desc && <span className="text-gray-500 text-sm ml-2">{desc}</span>}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (variant === "compact") {
    return (
      <section className="my-8">
        {title && <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">{title}</p>}
        <div className="flex flex-wrap gap-2">
          {links.map(({ href, label, badge, badgeColor = "blue" }) => (
            <Link
              key={href}
              href={href}
              className="inline-flex items-center gap-1.5 bg-white border border-gray-200 hover:border-blue-400 hover:text-blue-700 text-gray-700 px-3 py-1.5 rounded-full text-sm font-medium transition-all"
            >
              {label}
              {badge && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-semibold ${BADGE_COLORS[badgeColor]}`}>
                  {badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </section>
    );
  }

  // Default: card variant
  return (
    <section className="my-10">
      {title && <h2 className="text-xl font-bold text-gray-900 mb-5">{title}</h2>}
      <div className={`grid ${gridClass} gap-3`}>
        {links.map(({ href, label, desc, badge, badgeColor = "blue" }) => (
          <Link
            key={href}
            href={href}
            className="bg-white border border-gray-200 rounded-xl p-4 hover:border-blue-400 hover:shadow-sm transition-all group"
          >
            <div className="flex items-start justify-between gap-2 mb-1">
              <p className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors text-sm leading-snug">
                {label}
              </p>
              {badge && (
                <span className={`shrink-0 text-xs px-2 py-0.5 rounded-full font-semibold ${BADGE_COLORS[badgeColor]}`}>
                  {badge}
                </span>
              )}
            </div>
            {desc && <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>}
            <p className="text-xs text-blue-500 font-semibold mt-2 group-hover:translate-x-0.5 transition-transform inline-block">→</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
