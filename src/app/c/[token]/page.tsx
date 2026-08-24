"use client";
import { use, useEffect, useState } from "react";
import Link from "next/link";
import { loadStore, saveStore, toggleAssignmentComplete, updateClientBioGoals, exerciseById } from "@/lib/store";

type SupaClientData = {
  client: { id: string; name: string; invite_token: string; bio: string | null; goals: string | null };
  assignments: Array<{ id: string; workout_id: string; client_id: string; assigned_date: string; status: string; workouts: { title: string; notes: string | null; workout_exercises: Array<{ exercise_id: string; sets: number; reps: string; rest_seconds: number }> } }>;
} | null;

export default function ClientPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [store, setStore] = useState(() => loadStore());
  const [logInputs, setLogInputs] = useState<Record<string, { reps: string; weight: string }>>({});
  const [supaData, setSupaData] = useState<SupaClientData>(null);
  const [supaLoading, setSupaLoading] = useState(false);
  const [supaError, setSupaError] = useState<string | null>(null);
  const [editBioSupa, setEditBioSupa] = useState("");
  const [editGoalsSupa, setEditGoalsSupa] = useState("");
  const [editingSupa, setEditingSupa] = useState(false);
  const [editBioLocal, setEditBioLocal] = useState("");
  const [editGoalsLocal, setEditGoalsLocal] = useState("");
  const [editingLocal, setEditingLocal] = useState(false);

  const isSupaEnv = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

  useEffect(() => { saveStore(store); }, [store]);
  useEffect(() => {
    if (supaData) { setEditBioSupa(supaData.client.bio ?? ""); setEditGoalsSupa(supaData.client.goals ?? ""); }
  }, [supaData]);

  useEffect(() => {
    if (!isSupaEnv) return;
    const localClient = store.clients.find((c) => c.invite_token === token);
    if (localClient) return;
    setSupaLoading(true);
    (async () => {
      try {
        const { createClient } = await import("@/lib/supabase/client");
        const supa = createClient();
        const { data: client, error: e1 } = await supa.from("clients").select("id,name,invite_token,bio,goals").eq("invite_token", token).single();
        if (e1) throw new Error(e1.message + " — Hint: add permissive SELECT policy for anon on clients/assignments or use demo localStorage mode. See supabase/schema.sql.");
        const { data: assignments, error: e2 } = await supa.from("assignments").select("id,workout_id,client_id,assigned_date,status, workouts(title,notes, workout_exercises(exercise_id,sets,reps,rest_seconds))").eq("client_id", client.id).order("assigned_date", { ascending: false });
        if (e2) throw e2;
        setSupaData({ client, assignments: (assignments as never) ?? [] });
      } catch (e: unknown) {
        setSupaError(e instanceof Error ? e.message : String(e));
      } finally { setSupaLoading(false); }
    })();
  }, [token, isSupaEnv, store.clients]);

  if (supaData) {
    const client = supaData.client;
    return (
      <div className="min-h-screen bg-zinc-50 flex flex-col">
        <header className="bg-white border-b sticky top-0"><div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between"><span className="font-bold">TrainerBoard</span><span className="text-xs bg-emerald-600 text-white px-3 py-1 rounded-full">Supabase • {client.name}</span></div></header>
        <main className="flex-1 max-w-lg mx-auto w-full px-6 py-6 space-y-4">
          <div className="bg-white border rounded-3xl p-5 shadow-sm"><h1 className="font-bold">Hi {client.name.split(" ")[0]} 👋</h1><p className="text-sm text-zinc-500">Trainer assigned workouts (live from Postgres).</p>
            <div className="mt-4 grid gap-2">
              <div className="bg-lime-50 border border-lime-100 rounded-2xl p-3"><div className="text-[11px] font-bold uppercase text-lime-700">Your Bio</div><div className="text-sm mt-1">{client.bio || <span className="text-zinc-400">No bio yet — update below.</span>}</div></div>
              <div className="bg-zinc-50 border rounded-2xl p-3"><div className="text-[11px] font-bold uppercase text-zinc-500">Your Goals</div><div className="text-sm mt-1">{client.goals || <span className="text-zinc-400">No goals yet.</span>}</div></div>
              {!editingSupa ? <button onClick={()=> setEditingSupa(true)} className="text-xs underline">Edit bio & goals</button> : (
                <div className="space-y-2">
                  <textarea value={editBioSupa} onChange={e=> setEditBioSupa(e.target.value)} rows={2} placeholder="Bio" className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <textarea value={editGoalsSupa} onChange={e=> setEditGoalsSupa(e.target.value)} rows={2} placeholder="Goals" className="w-full border rounded-xl px-3 py-2 text-sm" />
                  <div className="flex gap-2"><button onClick={async()=> { const { createClient } = await import("@/lib/supabase/client"); const supa = createClient(); await supa.from("clients").update({ bio: editBioSupa, goals: editGoalsSupa }).eq("id", client.id); location.reload(); }} className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold">Save</button><button onClick={()=> setEditingSupa(false)} className="border px-4 py-1.5 rounded-full text-xs">Cancel</button></div>
                </div>
              )}
            </div>
          </div>
          {supaData.assignments.length === 0 && <div className="bg-amber-50 border rounded-2xl p-5 text-sm">No workouts assigned yet.</div>}
          {supaData.assignments.map((a) => (
            <div key={a.id} className="bg-white border rounded-2xl p-5">
              <div className="font-semibold">{a.workouts.title}</div><div className="text-xs text-zinc-500">{a.assigned_date} • {a.status} • {a.workouts.notes}</div>
              <div className="mt-4 space-y-3">
                {(a.workouts.workout_exercises ?? []).map((ex, idx) => {
                  const meta = exerciseById(ex.exercise_id);
                  return <div key={idx} className="border rounded-xl p-3"><div className="font-medium text-sm">{idx + 1}. {meta?.name}</div><div className="text-xs text-zinc-500">{ex.sets}×{ex.reps} rest {ex.rest_seconds}s</div></div>;
                })}
              </div>
              <button onClick={async()=>{ const { toggleAssignmentDb } = await import("@/lib/db"); await toggleAssignmentDb(a.id, a.status); location.reload(); }} className={`mt-3 text-xs px-3 py-1.5 rounded-full font-medium ${a.status==="completed" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>{a.status==="completed" ? "Completed ✓" : "Mark complete"}</button>
            </div>
          ))}
          <Link href="/dashboard" className="block text-center text-xs underline text-zinc-500">Trainer dashboard →</Link>
        </main>
      </div>
    );
  }

  if (isSupaEnv && supaLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-zinc-50 text-sm text-zinc-500">Loading from Supabase…</div>;
  }

  const client = store.clients.find((c) => c.invite_token === token);
  if (!client) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-zinc-50">
        <div className="bg-white border rounded-2xl p-8 max-w-md text-center">
          <h1 className="font-bold">Invalid link</h1>
          <p className="text-sm text-zinc-500 mt-2">Token {token} not found in demo store.{isSupaEnv ? " Tried Supabase anon fetch — check RLS policies." : ""}</p>
          {supaError && <p className="mt-3 text-xs bg-red-50 border border-red-200 rounded-xl p-3 text-red-700 text-left">{supaError}</p>}
          <Link href="/" className="mt-4 inline-block bg-zinc-900 text-white px-5 py-2 rounded-full text-sm">Go home</Link>
          <p className="text-xs text-zinc-400 mt-3">In Supabase mode, ensure you added permissive anon SELECT on clients/assignments/workouts for client links (see supabase/schema.sql comment).</p>
        </div>
      </div>
    );
  }

  const assignments = store.assignments.filter((a) => a.client_id === client.id).sort((a,b)=> b.assigned_date.localeCompare(a.assigned_date));

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="bg-white border-b sticky top-0"><div className="max-w-lg mx-auto px-6 h-14 flex items-center justify-between"><span className="font-bold">TrainerBoard</span><span className="text-xs bg-zinc-900 text-white px-3 py-1 rounded-full">{client.name}</span></div></header>
      <main className="flex-1 max-w-lg mx-auto w-full px-6 py-6 space-y-4">
        <div className="bg-white border rounded-3xl p-5 shadow-sm">
          <h1 className="font-bold text-lg">Hi {client.name.split(" ")[0]} 👋</h1>
          <p className="text-sm text-zinc-500">Your trainer assigned workouts below. Check off sets and your trainer sees it instantly.</p>
          <div className="mt-4 grid gap-2">
            <div className="bg-lime-50 border border-lime-100 rounded-2xl p-3"><div className="text-[11px] font-bold uppercase text-lime-700">Your Bio</div><div className="text-sm mt-1">{(client as unknown as {bio?:string}).bio || <span className="text-zinc-400">No bio yet.</span>}</div></div>
            <div className="bg-zinc-50 border rounded-2xl p-3"><div className="text-[11px] font-bold uppercase text-zinc-500">Your Goals</div><div className="text-sm mt-1">{(client as unknown as {goals?:string}).goals || <span className="text-zinc-400">No goals yet.</span>}</div></div>
            {!editingLocal ? <button onClick={()=> { setEditingLocal(true); setEditBioLocal((client as unknown as {bio?:string}).bio ?? ""); setEditGoalsLocal((client as unknown as {goals?:string}).goals ?? ""); }} className="text-xs underline">Edit bio & goals</button> : (
              <div className="space-y-2">
                <textarea value={editBioLocal} onChange={e=> setEditBioLocal(e.target.value)} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" />
                <textarea value={editGoalsLocal} onChange={e=> setEditGoalsLocal(e.target.value)} rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" />
                <div className="flex gap-2"><button onClick={()=> { setStore(s=> updateClientBioGoals(s, client.id, editBioLocal, editGoalsLocal)); setEditingLocal(false); }} className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold">Save</button><button onClick={()=> setEditingLocal(false)} className="border px-4 py-1.5 rounded-full text-xs">Cancel</button></div>
              </div>
            )}
          </div>
          <p className="text-xs text-zinc-400 mt-3">PWA: Add to Home Screen for app-like experience.</p>
        </div>
        {assignments.length === 0 && <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-sm text-amber-900">No workouts assigned yet. Your trainer will assign one from the dashboard.</div>}
        {assignments.map((a) => {
          const w = store.workouts.find((x) => x.id === a.workout_id)!;
          if (!w) return null;
          return (
            <div key={a.id} className="bg-white border rounded-2xl p-5">
              <div className="flex justify-between items-start"><div><div className="font-semibold">{w.title}</div><div className="text-xs text-zinc-500">{a.assigned_date} • {a.status} • {w.notes}</div></div><button onClick={() => setStore((s)=> toggleAssignmentComplete(s, a.id))} className={`text-xs px-3 py-1.5 rounded-full font-bold ${a.status==="completed" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>{a.status==="completed" ? "Completed ✓" : "Mark complete"}</button></div>
              <div className="mt-4 space-y-4">
                {w.exercises.map((ex, idx) => {
                  const meta = exerciseById(ex.exercise_id);
                  const key = `${a.id}_${ex.exercise_id}_${idx}`;
                  return (
                    <div key={idx} className="border rounded-xl p-3"><div className="font-medium text-sm">{idx+1}. {meta?.name} <span className="text-zinc-400 font-normal">• {meta?.muscle_group}</span></div><div className="text-xs text-zinc-500">{ex.sets} sets × {ex.reps} reps • rest {ex.rest}s</div>
                      <div className="mt-3 grid grid-cols-3 gap-2"><input placeholder="Reps" value={logInputs[key]?.reps ?? ""} onChange={(e)=> setLogInputs((m)=> ({...m, [key]: {...(m[key] ?? {reps:"",weight:""}), reps: e.target.value}}))} className="border rounded-xl px-3 py-2 text-sm" /><input placeholder="Weight kg" value={logInputs[key]?.weight ?? ""} onChange={(e)=> setLogInputs((m)=> ({...m, [key]: {...(m[key] ?? {reps:"",weight:""}), weight: e.target.value}}))} className="border rounded-xl px-3 py-2 text-sm" /><button onClick={()=> alert(`Logged ${meta?.name}: ${logInputs[key]?.reps ?? "?"} reps @ ${logInputs[key]?.weight ?? "?"}kg (stored locally)`)} className="bg-zinc-900 text-white rounded-xl text-xs font-medium">Log set</button></div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div className="text-center pt-4"><Link href="/dashboard" className="text-xs text-zinc-500 underline">Trainer view → Dashboard</Link></div>
      </main>
    </div>
  );
}
