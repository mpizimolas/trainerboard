import Link from "next/link";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <span className="font-bold tracking-tight text-lg">TrainerBoard</span>
          <Link href="/dashboard" className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-zinc-800">
            Open Dashboard
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-16 sm:py-24">
          <div className="max-w-3xl">
            <p className="text-sm font-medium tracking-widest uppercase text-zinc-500 mb-3">For independent personal trainers</p>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight leading-[1.05]">
              Replace WhatsApp & Sheets.<br />
              <span className="text-zinc-400">Manage clients in one place.</span>
            </h1>
            <p className="mt-6 text-lg text-zinc-600 leading-7 max-w-xl">
              Create workout templates, assign with one click, and see who actually did the work. Clients get a simple magic link — no app to install.
            </p>
            <div className="mt-8 flex gap-3">
              <Link href="/dashboard" className="bg-zinc-900 text-white px-7 py-3.5 rounded-full font-medium hover:bg-zinc-800">Start free — 3 clients</Link>
              <a href="#pricing" className="px-7 py-3.5 rounded-full border font-medium hover:bg-white">See pricing</a>
            </div>
            <p className="mt-3 text-xs text-zinc-500">No credit card. Free tier covers first 3 clients. $19/mo after.</p>
          </div>

          <div className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { title: "Clients in 10s", desc: "Add name + phone, send magic link." },
              { title: "Workout library", desc: "50 exercises pre-loaded, build templates once." },
              { title: "Compliance at a glance", desc: "Today's check-ins: who trained, who missed." },
            ].map((c) => (
              <div key={c.title} className="bg-white border rounded-2xl p-5">
                <div className="font-semibold">{c.title}</div>
                <div className="text-sm text-zinc-500 mt-1">{c.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-zinc-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col sm:flex-row gap-8 items-start">
            <div className="flex-1">
              <h2 className="text-2xl font-bold">Demo mode enabled</h2>
              <p className="text-zinc-400 mt-2 text-sm leading-6">
                This MVP runs 100% in your browser (localStorage) if Supabase env vars are not set. Add <code className="bg-zinc-800 px-1.5 py-0.5 rounded">NEXT_PUBLIC_SUPABASE_URL</code> and anon key to use Postgres. See <code className="bg-zinc-800 px-1.5 py-0.5 rounded">supabase/schema.sql</code>.
              </p>
            </div>
            <Link href="/dashboard" className="bg-white text-zinc-900 px-6 py-3 rounded-full font-medium shrink-0">Go to Dashboard →</Link>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-6 pb-20">
          <h2 className="text-2xl font-bold">Pricing</h2>
          <div className="mt-6 grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", limit: "3 clients", cta: "Start free" },
              { name: "Starter", price: "$19/mo", limit: "15 clients", cta: "Most popular", featured: true },
              { name: "Pro", price: "$39/mo", limit: "50 clients", cta: "For busy trainers" },
            ].map((p) => (
              <div key={p.name} className={`rounded-2xl p-6 border ${p.featured ? "bg-zinc-900 text-white border-zinc-900" : "bg-white"}`}>
                <div className="font-semibold">{p.name}</div>
                <div className="text-3xl font-bold mt-2">{p.price}</div>
                <div className={`text-sm mt-1 ${p.featured ? "text-zinc-400" : "text-zinc-500"}`}>{p.limit}</div>
                <Link href="/dashboard" className={`mt-6 block text-center rounded-full py-2.5 text-sm font-medium ${p.featured ? "bg-white text-zinc-900" : "bg-zinc-900 text-white"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-zinc-500 flex justify-between">
          <span>© {new Date().getFullYear()} TrainerBoard • Built for plan validation</span>
          <a href="https://github.com" className="hover:text-zinc-900">Docs: supabase/schema.sql + .env.example</a>
        </div>
      </footer>
    </div>
  );
}
