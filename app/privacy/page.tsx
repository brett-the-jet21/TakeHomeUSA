import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | TakeHomeUSA",
  description: "TakeHomeUSA privacy policy. We do not collect personal data or store salary information. Learn how we use cookies and third-party services like Google AdSense.",
  alternates: { canonical: "https://www.takehomeusa.com/privacy" },
};

export default function PrivacyPage() {
  const updated = "January 1, 2025";

  return (
    <main className="container-page py-12 max-w-3xl">
      <nav className="text-sm text-gray-500 mb-8 flex items-center gap-2">
        <Link href="/" className="hover:text-blue-700">Home</Link>
        <span>/</span>
        <span className="text-gray-800">Privacy Policy</span>
      </nav>

      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Privacy Policy</h1>
      <p className="text-gray-500 text-sm mb-10">Last updated: {updated}</p>

      <div className="prose prose-gray max-w-none space-y-8 text-gray-700 text-sm leading-relaxed">

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">1. Overview</h2>
          <p>
            TakeHomeUSA (<strong>takehomeusa.com</strong>) is a free salary
            after-tax calculator. We are committed to protecting your privacy.
            This policy explains what information we collect, how we use it, and
            your choices regarding that information.
          </p>
          <p className="mt-3">
            <strong>Short version:</strong> We do not collect, store, or sell
            personal information. Salary amounts you enter are never transmitted
            to our servers — all calculations happen in your browser.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">2. Information We Do NOT Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Salary amounts or financial information you enter</li>
            <li>Names, email addresses, or contact information</li>
            <li>Social Security numbers or tax IDs</li>
            <li>Any personally identifiable information (PII)</li>
          </ul>
          <p className="mt-3">
            Our calculator performs all computations client-side or via
            server-side rendering without logging your inputs.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">3. Automatic Information (Analytics &amp; Logs)</h2>
          <p>
            Like most websites, our hosting provider may automatically collect
            certain technical information when you visit, including:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li>Your browser type and operating system</li>
            <li>IP address (anonymized where possible)</li>
            <li>Pages visited and time spent on each page</li>
            <li>Referring website (how you found us)</li>
          </ul>
          <p className="mt-3">
            This information is used solely to improve site performance and user
            experience. It is not linked to any individual&apos;s identity.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">4. Google AdSense &amp; Cookies</h2>
          <p>
            TakeHomeUSA displays advertisements served by{" "}
            <strong>Google AdSense</strong>. Google may use cookies and similar
            tracking technologies to serve ads based on your prior visits to
            this or other websites.
          </p>
          <p className="mt-3">
            You can opt out of personalized advertising by visiting{" "}
            <a
              href="https://www.google.com/settings/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Google Ads Settings
            </a>{" "}
            or{" "}
            <a
              href="http://www.aboutads.info/choices/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              aboutads.info
            </a>
            .
          </p>
          <p className="mt-3">
            For more information on how Google uses data, see:{" "}
            <a
              href="https://policies.google.com/technologies/ads"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-700 underline"
            >
              Google&apos;s advertising policies
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">5. Third-Party Services</h2>
          <p>We may use the following third-party services:</p>
          <ul className="list-disc pl-5 mt-2 space-y-1">
            <li><strong>Google AdSense</strong> — advertising (has its own privacy policy)</li>
            <li><strong>Vercel</strong> — hosting and analytics (anonymized)</li>
          </ul>
          <p className="mt-3">
            Each third-party service has its own privacy policy. We encourage
            you to review them.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">6. Disclaimer on Tax Calculations</h2>
          <p>
            TakeHomeUSA provides estimates for informational purposes only. The
            calculations are based on current federal IRS tax brackets and publicly
            available state tax rates. We are not a licensed tax advisor, CPA, or
            financial planner. Do not use this tool as a substitute for
            professional tax advice.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">7. Children&apos;s Privacy</h2>
          <p>
            TakeHomeUSA is not directed at children under 13. We do not knowingly
            collect any information from children.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. The &quot;Last
            updated&quot; date at the top reflects the most recent revision. Continued
            use of the site after changes constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900 mb-3">9. Contact</h2>
          <p>
            If you have questions about this Privacy Policy, please{" "}
            <Link href="/about" className="text-blue-700 underline">
              contact us
            </Link>
            .
          </p>
        </section>
      </div>

      <div className="mt-12 pt-8 border-t border-gray-200">
        <Link
          href="/"
          className="text-blue-700 font-semibold hover:underline text-sm"
        >
          ← Back to Calculator
        </Link>
      </div>
    </main>
  );
}
