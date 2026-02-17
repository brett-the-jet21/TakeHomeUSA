type PageProps = { params: { state: string; salary: string } };

function parseSalarySlug(slug: string): number | null {
  const m = slug.match(/^(\d+)-salary-after-tax$/);
  if (!m) return null;
  const n = Number(m[1]);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export default function Page({ params }: PageProps) {
  const state = (params.state || "").toLowerCase();
  const salary = parseSalarySlug(params.salary || "");

  // hard 404-style UI (avoids throwing, avoids 500s)
  if (!salary) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">Page not found</h1>
      </main>
    );
  }

  if (state !== "texas") {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">State not supported yet.</h1>
        <p className="mt-3 text-lg">Currently live: Texas</p>
        <p className="mt-2 text-sm opacity-70">Try: /texas/100000-salary-after-tax</p>
      </main>
    );
  }

  // placeholder math
  const federal = salary * 0.22;
  const fica = salary * 0.0765;
  const takeHome = salary - federal - fica;

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        ${salary.toLocaleString()} Salary After Tax in Texas
      </h1>

      <div className="space-y-2 text-lg">
        <p>Federal Tax: ${Math.round(federal).toLocaleString()}</p>
        <p>FICA: ${Math.round(fica).toLocaleString()}</p>
        <hr className="my-4" />
        <p className="text-2xl font-semibold">
          Take Home Pay: ${Math.round(takeHome).toLocaleString()}
        </p>
      </div>
    </main>
  );
}
