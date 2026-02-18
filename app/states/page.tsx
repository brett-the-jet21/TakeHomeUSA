import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Salary After Tax Calculator — All 50 States | TakeHomeUSA",
  description:
    "Free salary after-tax calculator for all 50 US states. See your exact take-home pay, federal and state tax breakdown, and monthly paycheck. Texas is live now — more states launching soon.",
  alternates: { canonical: "https://www.takehomeusa.com/states" },
};

const ALL_STATES = [
  { name: "Alabama",       slug: "alabama",        tax: "5%",    live: false },
  { name: "Alaska",        slug: "alaska",         tax: "0%",    live: false, noTax: true },
  { name: "Arizona",       slug: "arizona",        tax: "2.5%",  live: false },
  { name: "Arkansas",      slug: "arkansas",       tax: "4.7%",  live: false },
  { name: "California",    slug: "california",     tax: "13.3%", live: false, external: "https://californiasalaryaftertax.com" },
  { name: "Colorado",      slug: "colorado",       tax: "4.4%",  live: false },
  { name: "Connecticut",   slug: "connecticut",    tax: "6.99%", live: false },
  { name: "Delaware",      slug: "delaware",       tax: "6.6%",  live: false },
  { name: "Florida",       slug: "florida",        tax: "0%",    live: false, noTax: true, comingSoon: true },
  { name: "Georgia",       slug: "georgia",        tax: "5.49%", live: false },
  { name: "Hawaii",        slug: "hawaii",         tax: "11%",   live: false },
  { name: "Idaho",         slug: "idaho",          tax: "5.8%",  live: false },
  { name: "Illinois",      slug: "illinois",       tax: "4.95%", live: false },
  { name: "Indiana",       slug: "indiana",        tax: "3.15%", live: false },
  { name: "Iowa",          slug: "iowa",           tax: "5.7%",  live: false },
  { name: "Kansas",        slug: "kansas",         tax: "5.7%",  live: false },
  { name: "Kentucky",      slug: "kentucky",       tax: "4.5%",  live: false },
  { name: "Louisiana",     slug: "louisiana",      tax: "3%",    live: false },
  { name: "Maine",         slug: "maine",          tax: "7.15%", live: false },
  { name: "Maryland",      slug: "maryland",       tax: "5.75%", live: false },
  { name: "Massachusetts", slug: "massachusetts",  tax: "5%",    live: false },
  { name: "Michigan",      slug: "michigan",       tax: "4.25%", live: false },
  { name: "Minnesota",     slug: "minnesota",      tax: "9.85%", live: false },
  { name: "Mississippi",   slug: "mississippi",    tax: "4.7%",  live: false },
  { name: "Missouri",      slug: "missouri",       tax: "4.8%",  live: false },
  { name: "Montana",       slug: "montana",        tax: "6.75%", live: false },
  { name: "Nebraska",      slug: "nebraska",       tax: "5.84%", live: false },
  { name: "Nevada",        slug: "nevada",         tax: "0%",    live: false, noTax: true },
  { name: "New Hampshire", slug: "new-hampshire",  tax: "0%",    live: false, noTax: true },
  { name: "New Jersey",    slug: "new-jersey",     tax: "10.75%",live: false },
  { name: "New Mexico",    slug: "new-mexico",     tax: "5.9%",  live: false },
  { name: "New York",      slug: "new-york",       tax: "10.9%", live: false, comingSoon: true },
  { name: "North Carolina",slug: "north-carolina", tax: "4.5%",  live: false },
  { name: "North Dakota",  slug: "north-dakota",   tax: "2.5%",  live: false },
  { name: "Ohio",          slug: "ohio",           tax: "3.75%", live: false },
  { name: "Oklahoma",      slug: "oklahoma",       tax: "4.75%", live: false },
  { name: "Oregon",        slug: "oregon",         tax: "9.9%",  live: false },
  { name: "Pennsylvania",  slug: "pennsylvania",   tax: "3.07%", live: false },
  { name: "Rhode Island",  slug: "rhode-island",   tax: "5.99%", live: false },
  { name: "South Carolina",slug: "south-carolina", tax: "6.4%",  live: false },
  { name: "South Dakota",  slug: "south-dakota",   tax: "0%",    live: false, noTax: true },
  { name: "Tennessee",     slug: "tennessee",      tax: "0%",    live: false, noTax: true },
  { name: "Texas",         slug: "texas",          tax: "0%",    live: true,  noTax: true },
  { name: "Utah",          slug: "utah",           tax: "4.65%", live: false },
  { name: "Vermont",       slug: "vermont",        tax: "8.75%", live: false },
  { name: "Virginia",      slug: "virginia",       tax: "5.75%", live: false },
  { name: "Washington",    slug: "washington",     tax: "0%",    live: false, noTax: true },
  { name: "West Virginia", slug: "west-virginia",  tax: "5.12%", live: false },
  { name: "Wisconsin",     slug: "wisconsin",      tax: "7.65%", live: false },
  { name: "Wyoming",       slug: "wyoming",        tax: "0%",    live: false, noTax: true },
] as const;

export default function StatesPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-900 to-blue-800 text-white">
        <div className="container-page py-14 text-center">
          <div className="inline-block bg-blue-700 text-blue-200 text-xs font-semibold px-3 py-1 rounded-full mb-5 uppercase tracking-wider">
            50 States · Launching 2025
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4">
            Salary After Tax Calculator<br />
            <span className="text-blue-300">All 50 States</span>
          </h1>
          <p className="text-blue-200 text-lg max-w-2xl mx-auto mb-8">
            TakeHomeUSA is building the most complete salary calculator in the US.
            Texas is live now. Click your state to see take-home pay, tax
            breakdown, and more.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <div className="bg-green-500 text-white px-4 py-1.5 rounded-full font-semibold">
              ✓ 1 state live
            </div>
            <div className="bg-blue-700 text-blue-200 px-4 py-1.5 rounded-full">
              49 more coming soon
            </div>
          </div>
        </div>
      </section>

      {/* Ad */}
      <div className="container-page my-6">
        <div className="ad-slot ad-leaderboard" />
      </div>

      {/* No-tax states callout */}
      <section className="container-page mb-10">
        <div className="bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">
            🌟 States With No Income Tax (9 Total)
          </h2>
          <p className="text-gray-600 text-sm mb-4">
            These states collect zero state income tax — keeping your paycheck
            significantly higher than high-tax states like California or New York.
          </p>
          <div className="flex flex-wrap gap-3">
            {ALL_STATES.filter((s) => s.noTax).map((s) => (
              <div key={s.slug}>
                {s.live ? (
                  <Link
                    href={`/${s.slug}`}
                    className="inline-flex items-center gap-1.5 bg-green-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-green-700 transition-colors"
                  >
                    {s.name}
                    <span className="text-green-200 text-xs">— Live ✓</span>
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-white border border-green-300 text-green-800 px-4 py-1.5 rounded-full text-sm font-medium">
                    {s.name}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* All states grid */}
      <section className="container-page mb-14">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">All 50 States</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {ALL_STATES.map((state) => {
            const href =
              state.live
                ? `/${state.slug}`
                : "external" in state && state.external
                ? state.external
                : null;

            const card = (
              <div
                className={`rounded-xl border p-4 transition-all ${
                  state.live
                    ? "border-blue-300 bg-blue-50 hover:shadow-md hover:border-blue-400 cursor-pointer"
                    : "border-gray-200 bg-white opacity-70"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <span className="font-semibold text-gray-900 text-sm">{state.name}</span>
                  {state.live && (
                    <span className="bg-green-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                      Live
                    </span>
                  )}
                  {"comingSoon" in state && state.comingSoon && (
                    <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full font-medium">
                      Soon
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-2 py-0.5 rounded ${
                      state.tax === "0%"
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {state.tax} state tax
                  </span>
                </div>
                {state.live && (
                  <p className="text-xs text-blue-600 font-medium mt-2">
                    View calculator →
                  </p>
                )}
              </div>
            );

            if (href) {
              const isExternal = href.startsWith("http");
              return isExternal ? (
                <a key={state.slug} href={href} target="_blank" rel="noopener noreferrer">
                  {card}
                </a>
              ) : (
                <Link key={state.slug} href={href}>
                  {card}
                </Link>
              );
            }

            return <div key={state.slug}>{card}</div>;
          })}
        </div>
      </section>

      {/* Ad */}
      <div className="container-page mb-6">
        <div className="ad-slot ad-bottom" />
      </div>
    </>
  );
}
