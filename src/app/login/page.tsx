"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const isConfigured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      if (!isConfigured) {
        // Demo mode - just go to dashboard
        router.push("/dashboard");
        return;
      }
      const { createClient } = await import("@/lib/supabase/client");
      const supa = createClient();
      if (mode === "signup") {
        const { error } = await supa.auth.signUp({ email, password });
        if (error) throw error;
        setMsg("Check your email to confirm, then log in. If email confirm is disabled in Supabase, you can log in immediately.");
        setMode("login");
      } else {
        const { error } = await supa.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      const m = err instanceof Error ? err.message : String(err);
      setMsg(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-zinc-50">
      <header className="border-b bg-white">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="font-bold">TrainerBoard</Link>
          <Link href="/dashboard" className="text-sm border px-4 py-1.5 rounded-full">Skip to demo dashboard →</Link>
        </div>
      </header>
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white border rounded-2xl p-8">
          <h1 className="text-xl font-bold">{mode === "signup" ? "Create trainer account" : "Welcome back"}</h1>
          <p className="text-sm text-zinc-500 mt-1">
            {isConfigured ? "Supabase Auth — data will persist in Postgres." : "Demo mode — no Supabase env set. Any email/password will enter dashboard (localStorage)."}
          </p>
          {!isConfigured && (
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900">
              To enable persistence: create Supabase project, run <code>supabase/schema.sql</code>, then set <code>NEXT_PUBLIC_SUPABASE_URL</code> + <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in <code>.env.local</code> and restart.
            </div>
          )}
          <form onSubmit={handleSubmit} className="mt-6 space-y-3">
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" required className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password (min 6)" type="password" required className="w-full border rounded-xl px-3 py-2.5 text-sm" />
            <button disabled={loading} className="w-full bg-zinc-900 text-white py-3 rounded-full font-medium text-sm disabled:opacity-50">
              {loading ? "Please wait…" : mode === "signup" ? "Sign up" : "Log in"}
            </button>
          </form>
          {msg && <p className="mt-4 text-sm bg-zinc-50 border rounded-xl p-3 text-zinc-700">{msg}</p>}
          <div className="mt-4 text-center text-sm">
            <button onClick={() => setMode((m) => (m === "signup" ? "login" : "signup"))} className="underline text-zinc-600">
              {mode === "signup" ? "Already have an account? Log in" : "Need an account? Sign up"}
            </button>
          </div>
          <div className="mt-6 text-xs text-zinc-400 text-center">
            Supabase Auth handles RLS — trainers only see their own clients.
          </div>
        </div>
      </main>
    </div>
  );
}
