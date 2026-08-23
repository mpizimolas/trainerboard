import Link from "next/link";
import { Dumbbell, Users, CheckCircle2, ArrowRight, Sparkles, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 flex flex-col">
      <header className="border-b bg-white/80 sticky top-0 z-10 backdrop-blur">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
              <Dumbbell className="w-4 h-4 text-lime-400" />
            </div>
            <span className="font-bold tracking-tight text-lg">TrainerBoard</span>
            <span className="hidden sm:inline ml-2 text-xs bg-lime-400 text-zinc-900 px-2 py-1 rounded-full font-bold">Option A</span>
          </div>
          <Link href="/dashboard" className="bg-zinc-900 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-black flex items-center gap-1.5">
            Open Dashboard <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="hero-gradient border-b">
          <div className="max-w-6xl mx-auto px-6 py-12 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-white border rounded-full px-3 py-1 text-xs font-medium shadow-sm">
                <span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" />
                For independent personal trainers
                <span className="bg-zinc-900 text-white px-2 py-0.5 rounded-full text-[10px]">New</span>
              </div>
              <h1 className="mt-5 text-4xl sm:text-5xl font-extrabold tracking-tighter leading-[0.95]">
                Replace WhatsApp & Sheets.
                <span className="block text-zinc-400">Manage clients in one place.</span>
              </h1>
              <p className="mt-5 text-lg text-zinc-600 leading-7 max-w-xl">
                Create workout templates, assign with one click, and see who actually did the work. Clients get a simple magic link — <span className="font-semibold text-zinc-900">no app to install.</span>
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/dashboard" className="bg-zinc-900 text-white px-7 py-3.5 rounded-full font-bold hover:bg-black flex items-center gap-2 shadow-lg shadow-lime-100">
                  <Zap className="w-4 h-4 text-lime-400" /> Start free — 3 clients
                </Link>
                <a href="#pricing" className="px-7 py-3.5 rounded-full border bg-white font-medium hover:bg-zinc-50 flex items-center gap-1">
                  See pricing <ArrowRight className="w-4 h-4" />
                </a>
              </div>
              <p className="mt-3 text-xs text-zinc-500 flex items-center gap-1.5"><Sparkles className="w-3 h-3 text-lime-600" /> No credit card. Free tier covers first 3 clients. $19/mo after.</p>
              <div className="mt-8 flex items-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> 50 exercises pre-loaded</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> PWA — Add to Home Screen</span>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-br from-lime-200 to-emerald-200 rounded-[2rem] blur-2xl opacity-40" />
              <div className="relative bg-white border rounded-[2rem] shadow-2xl p-3 sm:p-4">
                <div className="bg-zinc-900 rounded-2xl p-4 text-white flex items-center justify-between">
                  <span className="text-sm font-bold flex items-center gap-2"><Dumbbell className="w-4 h-4 text-lime-400" /> Today&apos;s check-ins</span>
                  <span className="text-xs bg-lime-400 text-zinc-900 px-2.5 py-1 rounded-full font-bold">3 assigned</span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { name: "Alex Morgan", workout: "Full Body A", status: "Completed ✓", color: "emerald" },
                    { name: "Jamie Lee", workout: "Push Day", status: "Pending", color: "zinc" },
                    { name: "Sam Rivera", workout: "Legs • Heavy", status: "Completed ✓", color: "emerald" },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between border rounded-2xl px-4 py-3 bg-zinc-50">
                      <div>
                        <div className="font-semibold text-sm">{r.workout} → {r.name}</div>
                        <div className="text-xs text-zinc-500">{r.status} • magic link</div>
                      </div>
                      <span className={`text-xs px-3 py-1.5 rounded-full font-bold ${r.color === "emerald" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>{r.status === "Completed ✓" ? "Done" : "Mark done"}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {[
                    { k: "Clients", v: "12/15" },
                    { k: "Check-ins", v: "42" },
                    { k: "Streak", v: "7d" },
                  ].map((s) => (
                    <div key={s.k} className="bg-lime-50 border border-lime-100 rounded-2xl p-3 text-center">
                      <div className="text-xs text-zinc-500">{s.k}</div>
                      <div className="font-bold text-sm">{s.v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="absolute -bottom-6 -left-4 bg-white border rounded-2xl shadow-xl px-4 py-3 flex items-center gap-3">
                <img src="https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop" alt="" className="w-10 h-10 rounded-xl object-cover" />
                <div>
                  <div className="text-xs font-bold">Trusted by coaches</div>
                  <div className="text-xs text-zinc-500">“Saves 3 hrs/week”</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { icon: Users, title: "Clients in 10s", desc: "Add name + phone, send magic link. No onboarding friction.", bg: "bg-lime-50 border-lime-100" },
              { icon: Dumbbell, title: "Workout library", desc: "50 exercises pre-loaded, build templates once, reuse forever.", bg: "bg-white" },
              { icon: CheckCircle2, title: "Compliance at a glance", desc: "Today's check-ins: who trained, who missed — in one view.", bg: "bg-white" },
            ].map((c) => (
              <div key={c.title} className={`rounded-3xl p-6 border shadow-sm hover:shadow-md hover:scale-[1.02] transition ${c.bg}`}>
                <div className="w-10 h-10 rounded-2xl bg-zinc-900 flex items-center justify-center">
                  <c.icon className="w-5 h-5 text-lime-400" />
                </div>
                <div className="font-bold mt-4">{c.title}</div>
                <div className="text-sm text-zinc-500 mt-1 leading-6">{c.desc}</div>
              </div>
            ))}
          </div>

          <div className="mt-10 bg-zinc-900 text-white rounded-[2rem] p-8 sm:p-10 flex flex-col lg:flex-row gap-8 items-start relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-lime-400 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2" />
            <div className="flex-1 relative">
              <h2 className="text-2xl font-extrabold flex items-center gap-2"><Zap className="w-6 h-6 text-lime-400" /> Demo mode enabled</h2>
              <p className="text-zinc-400 mt-3 text-sm leading-6">
                This MVP runs in your browser (localStorage) if Supabase env vars are not set. Add <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-100">NEXT_PUBLIC_SUPABASE_URL</code> and anon key to use Postgres. See <code className="bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-100">supabase/schema.sql</code>.
              </p>
              <div className="mt-4 flex gap-2 text-xs">
                <span className="bg-white/10 px-3 py-1 rounded-full">3 clients free</span>
                <span className="bg-lime-400 text-zinc-900 px-3 py-1 rounded-full font-bold">$19/mo Starter</span>
              </div>
            </div>
            <Link href="/dashboard" className="relative bg-lime-400 text-zinc-900 px-7 py-3 rounded-full font-bold shrink-0 hover:bg-lime-300 flex items-center gap-2">
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-6 pb-20">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-extrabold tracking-tight">Simple pricing</h2>
            <p className="text-zinc-500 mt-2">Start free, upgrade when you grow. No contracts.</p>
          </div>
          <div className="mt-8 grid sm:grid-cols-3 gap-4">
            {[
              { name: "Free", price: "$0", limit: "3 clients", cta: "Start free", featured: false },
              { name: "Starter", price: "$19/mo", limit: "15 clients", cta: "Most popular", featured: true },
              { name: "Pro", price: "$39/mo", limit: "50 clients", cta: "For busy trainers", featured: false },
            ].map((p) => (
              <div key={p.name} className={`rounded-3xl p-7 border ${p.featured ? "bg-zinc-900 text-white ring-2 ring-lime-400 shadow-xl scale-[1.02]" : "bg-white"}`}>
                {p.featured && <span className="bg-lime-400 text-zinc-900 text-xs font-bold px-3 py-1 rounded-full">Most popular</span>}
                <div className="font-bold mt-3">{p.name}</div>
                <div className="text-3xl font-extrabold mt-2">{p.price}</div>
                <div className={`text-sm mt-1 ${p.featured ? "text-zinc-400" : "text-zinc-500"}`}>{p.limit}</div>
                <Link href="/dashboard" className={`mt-6 block text-center rounded-full py-3 text-sm font-bold ${p.featured ? "bg-lime-400 text-zinc-900 hover:bg-lime-300" : "bg-zinc-900 text-white hover:bg-black"}`}>{p.cta}</Link>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t bg-white">
        <div className="max-w-6xl mx-auto px-6 py-6 text-xs text-zinc-500 flex flex-col sm:flex-row justify-between gap-2">
          <span className="flex items-center gap-1.5"><Dumbbell className="w-3 h-3 text-lime-600" /> © {new Date().getFullYear()} TrainerBoard • Energetic Fitness Theme</span>
          <a href="https://github.com/mpizimolas/trainerboard" className="hover:text-zinc-900 flex items-center gap-1">Docs: supabase/schema.sql + .env.example <ArrowRight className="w-3 h-3" /></a>
        </div>
      </footer>
    </div>
  );
}
