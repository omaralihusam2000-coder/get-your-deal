export function HowItWorks() {
  const steps = [
    { n: "01", title: "Search", body: "Find a PC game by name. We look it up on Steam and GOG." },
    { n: "02", title: "Compare", body: "See live current prices, original prices, and which store is cheaper." },
    { n: "03", title: "Save", body: "Open the official store page for the best verified deal." },
  ];

  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <h2 className="mb-8 text-3xl font-bold">How it works</h2>
      <div className="grid gap-4 md:grid-cols-3">
        {steps.map((step) => (
          <div key={step.n} className="rounded-3xl border border-line bg-card p-6">
            <p className="text-sm font-bold text-brand">{step.n}</p>
            <h3 className="mt-3 text-2xl font-semibold">{step.title}</h3>
            <p className="mt-2 text-sm leading-6 text-muted">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
