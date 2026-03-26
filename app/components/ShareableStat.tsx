/**
 * ShareableStat — a reusable callout component for key salary stats.
 *
 * Renders a visually strong "quotable" block with a large stat, context label,
 * optional source note, and optional share-link. Easy to copy-paste in articles.
 *
 * Usage:
 *   <ShareableStat
 *     stat="$7,420/yr"
 *     label="more take-home in Texas vs California on $100K"
 *     source="TakeHomeUSA, 2026 IRS data"
 *     href="/compare/texas-vs-california"
 *   />
 */

import Link from "next/link";

interface ShareableStatProps {
  stat: string;
  label: string;
  source?: string;
  href?: string;
  color?: "blue" | "green" | "indigo" | "red" | "gray";
  size?: "sm" | "md" | "lg";
}

const COLOR_MAP = {
  blue:   { bg: "bg-blue-50",   border: "border-blue-200",   stat: "text-blue-700",   label: "text-blue-900",   source: "text-blue-500"  },
  green:  { bg: "bg-green-50",  border: "border-green-200",  stat: "text-green-700",  label: "text-green-900",  source: "text-green-500" },
  indigo: { bg: "bg-indigo-50", border: "border-indigo-200", stat: "text-indigo-700", label: "text-indigo-900", source: "text-indigo-500" },
  red:    { bg: "bg-red-50",    border: "border-red-200",    stat: "text-red-700",    label: "text-red-900",    source: "text-red-400"   },
  gray:   { bg: "bg-gray-50",   border: "border-gray-200",   stat: "text-gray-700",   label: "text-gray-900",   source: "text-gray-400"  },
};

const SIZE_MAP = {
  sm: { stat: "text-2xl", label: "text-sm", padding: "p-4" },
  md: { stat: "text-3xl", label: "text-sm", padding: "p-5" },
  lg: { stat: "text-4xl", label: "text-base", padding: "p-6" },
};

export default function ShareableStat({
  stat,
  label,
  source,
  href,
  color = "blue",
  size = "md",
}: ShareableStatProps) {
  const c = COLOR_MAP[color];
  const s = SIZE_MAP[size];

  const inner = (
    <div className={`${c.bg} border ${c.border} rounded-xl ${s.padding} ${href ? "hover:shadow-md transition-shadow" : ""}`}>
      <p className={`${s.stat} font-black ${c.stat} mb-1 tabular-nums`}>{stat}</p>
      <p className={`font-semibold ${c.label} ${s.label} leading-snug`}>{label}</p>
      {source && (
        <p className={`text-xs ${c.source} mt-2`}>{source}</p>
      )}
      {href && (
        <p className={`text-xs ${c.source} mt-1 font-semibold`}>View full data →</p>
      )}
    </div>
  );

  if (href) {
    return <Link href={href}>{inner}</Link>;
  }
  return inner;
}
