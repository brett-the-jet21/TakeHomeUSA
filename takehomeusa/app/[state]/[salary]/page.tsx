import { notFound } from "next/navigation";

type PageProps = {
  params: {
    state: string;
    salary: string;
  };
};

function formatSalary(raw: string) {
  const match = raw.match(/^(\d+)-salary-after-tax$/);
  if (!match) return null;
  return parseInt(match[1], 10);
}

function calculateTexasTakeHome(salary: number) {
  const federal = salary * 0.22;
  const fica = salary * 0.0765;
  const state = 0; // Texas has no state income tax
  return {
    federal,
    fica,
    state,
    takeHome: salary - federal - fica - state,
  };
}

export default function SalaryPage({ params }: PageProps) {
  const salary = formatSalary(params.salary);
  const state = params.state.toLowerCase();

  if (!salary) return notFound();

  if (state !== "texas") {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">
          State not supported yet.
        </h1>
        <p className="mt-4">Currently live: Texas</p>
      </main>
    );
  }

  const result = calculateTexasTakeHome(salary);

  return (
    <main className="min-h-screen p-10">
      <h1 className="text-4xl font-bold mb-6">
        ${salary.toLocaleString()} Salary After Tax in Texas
      </h1>

      <div className="space-y-2 text-lg">
        <p>Federal Tax: ${result.federal.toLocaleString()}</p>
        <p>FICA: ${result.fica.toLocaleString()}</p>
        <p>State Tax: ${result.state.toLocaleString()}</p>
        <hr className="my-4" />
        <p className="text-2xl font-semibold">
          Take Home Pay: ${result.takeHome.toLocaleString()}
        </p>
      </div>
    </main>
  );
}
