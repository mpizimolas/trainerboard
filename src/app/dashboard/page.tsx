"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { loadStore, saveStore, createClient as createClientLocal, createWorkout as createWorkoutLocal, assignWorkout as assignWorkoutLocal, toggleAssignmentComplete, updateClientBioGoals, exerciseById, getExercises } from "@/lib/store";

const isSupaEnv = typeof process !== "undefined" && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);

type SupaState = {
  user: { id: string; email?: string } | null;
  clients: Array<{ id: string; name: string; email: string | null; phone: string | null; invite_token: string; status: string; bio: string | null; goals: string | null }>;
  workouts: Array<{ id: string; title: string; notes: string | null; workout_exercises: Array<{ exercise_id: string; sets: number; reps: string; rest_seconds: number }> }>;
  assignments: Array<{ id: string; workout_id: string; client_id: string; assigned_date: string; status: string }>;
} | null;

export default function DashboardPage() {
  const [store, setStore] = useState(() => loadStore());
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState("");
  const [wTitle, setWTitle] = useState("");
  const [wNotes, setWNotes] = useState("");
  const [wExercises, setWExercises] = useState<{ exercise_id: string; sets: number; reps: string; rest: number }[]>([{ exercise_id: "1", sets: 3, reps: "8", rest: 90 }]);
  const [assignWorkoutId, setAssignWorkoutId] = useState("");
  const [assignClientId, setAssignClientId] = useState("");
  const [assignDate, setAssignDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editBio, setEditBio] = useState("");
  const [editGoals, setEditGoals] = useState("");

  const [supa, setSupa] = useState<SupaState>(null);
  const [supaLoading, setSupaLoading] = useState(isSupaEnv);
  const [supaError, setSupaError] = useState<string | null>(null);
  const supaEnabled = isSupaEnv;

  async function loadSupa() {
    if (!supaEnabled) return;
    try {
      const { createClient } = await import("@/lib/supabase/client");
      const { fetchTrainerData, ensureProfile } = await import("@/lib/db");
      const supaClient = createClient();
      const { data: { user } } = await supaClient.auth.getUser();
      if (!user) { setSupa(null); setSupaLoading(false); return; }
      await ensureProfile();
      const data = await fetchTrainerData();
      if (data) setSupa({ user: { id: data.user.id, email: data.user.email ?? undefined }, clients: data.clients as never, workouts: data.workouts as never, assignments: data.assignments as never });
    } catch (e: unknown) {
      setSupaError(e instanceof Error ? e.message : String(e));
    } finally { setSupaLoading(false); }
  }

  useEffect(() => { saveStore(store); }, [store]);
  useEffect(() => {
    if (!assignWorkoutId && store.workouts[0]) setAssignWorkoutId(store.workouts[0].id);
    if (!assignClientId && store.clients[0]) setAssignClientId(store.clients[0].id);
  }, [store.workouts, store.clients, assignWorkoutId, assignClientId]);
  useEffect(() => { if (supaEnabled) loadSupa(); }, []); // eslint-disable-line

  const useSupa = supaEnabled && supa;
  const clients = useSupa ? supa!.clients : store.clients as unknown as SupaState extends null ? never : never;
  // type coercion for local
  const clientsLocal = useSupa ? supa!.clients : (store.clients as Array<{ id:string; name:string; email:string; phone:string; invite_token:string; status:string; bio?:string; goals?:string }>);
  const clientsAny = clientsLocal as Array<{ id:string; name:string; email:string|null; phone:string|null; invite_token:string; status:string; bio:string|null; goals:string|null }>;
  const workouts = useSupa ? supa!.workouts.map(w => ({ id: w.id, title: w.title, notes: w.notes ?? "", exercises: (w.workout_exercises ?? []).map((we) => ({ exercise_id: we.exercise_id, sets: we.sets, reps: we.reps, rest: we.rest_seconds })) })) : store.workouts;
  const assignments = useSupa ? supa!.assignments.map(a => ({ id: a.id, workout_id: a.workout_id, client_id: a.client_id, assigned_date: a.assigned_date, status: a.status as "pending"|"completed" })) : store.assignments;

  const today = new Date().toISOString().slice(0, 10);
  const todaysAssignments = assignments.filter((a) => a.assigned_date === today);

  async function handleAddClient() {
    if (!name) return alert("Name required");
    if (useSupa) {
      try { const { createClientDb } = await import("@/lib/db"); await createClientDb(name, email, phone, bio, goals); await loadSupa(); setName(""); setEmail(""); setPhone(""); setBio(""); setGoals(""); } catch(e: unknown){ alert(e instanceof Error ? e.message : String(e)); }
    } else {
      setStore((s) => createClientLocal(s, { name, email, phone, bio, goals })); setName(""); setEmail(""); setPhone(""); setBio(""); setGoals("");
    }
  }
  async function handleSaveBioGoals(id: string) {
    if (useSupa) {
      const { updateClientBioGoalsDb } = await import("@/lib/db"); await updateClientBioGoalsDb(id, editBio, editGoals); await loadSupa(); setEditingId(null);
    } else {
      setStore((s) => updateClientBioGoals(s, id, editBio, editGoals)); setEditingId(null);
    }
  }
  async function handleSaveWorkout() {
    if (!wTitle) return alert("Title required");
    if (wExercises.length === 0) return alert("Add at least one exercise");
    if (useSupa) {
      try { const { createWorkoutDb } = await import("@/lib/db"); await createWorkoutDb(wTitle, wNotes, wExercises); await loadSupa(); setWTitle(""); setWNotes(""); setWExercises([{ exercise_id: "1", sets: 3, reps: "8", rest: 90 }]); } catch(e: unknown){ alert(e instanceof Error ? e.message : String(e)); }
    } else {
      setStore((s) => createWorkoutLocal(s, { title: wTitle, notes: wNotes, exercises: wExercises })); setWTitle(""); setWNotes(""); setWExercises([{ exercise_id: "1", sets: 3, reps: "8", rest: 90 }]);
    }
  }
  async function handleAssign() {
    if (!assignWorkoutId || !assignClientId) return;
    if (useSupa) { try { const { assignWorkoutDb } = await import("@/lib/db"); await assignWorkoutDb(assignWorkoutId, assignClientId, assignDate); await loadSupa(); } catch(e: unknown){ alert(e instanceof Error ? e.message : String(e)); } }
    else { setStore((s) => assignWorkoutLocal(s, assignWorkoutId, assignClientId, assignDate)); }
  }
  async function handleToggle(aId: string, status: string) {
    if (useSupa) { const { toggleAssignmentDb } = await import("@/lib/db"); await toggleAssignmentDb(aId, status); await loadSupa(); }
    else { setStore((s) => toggleAssignmentComplete(s, aId)); }
  }

  if (supaEnabled && supaLoading) return <div className="max-w-6xl mx-auto px-6 py-10 text-sm text-zinc-500">Loading Supabase…</div>;
  if (supaEnabled && !supa) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-10">
        <div className="bg-white border rounded-2xl p-8 max-w-lg mx-auto text-center">
          <h2 className="font-bold">Supabase configured — please log in</h2>
          <p className="text-sm text-zinc-500 mt-2">You set NEXT_PUBLIC_SUPABASE_URL but are not signed in. Data is now persisted in Postgres per trainer (RLS).</p>
          {supaError && <p className="mt-3 text-sm bg-red-50 border border-red-200 rounded-xl p-3 text-red-700">{supaError}</p>}
          <Link href="/login" className="mt-6 inline-block bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm">Go to Login</Link>
          <p className="text-xs text-zinc-400 mt-3">Or remove env vars to use demo localStorage mode.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 space-y-6">
      <div className={`${useSupa ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-amber-50 border-amber-200 text-amber-900"} border rounded-2xl px-4 py-3 text-xs flex flex-col sm:flex-row justify-between gap-2 shadow-sm`}>
        <span>
          {useSupa ? <><strong>Supabase mode:</strong> Signed in as {supa!.user?.email} — data in Postgres (RLS per trainer). <button onClick={async()=>{ const {createClient}=await import("@/lib/supabase/client"); await createClient().auth.signOut(); location.reload(); }} className="underline ml-2">Sign out</button></> : <><strong>Demo mode:</strong> Data in browser localStorage. Add Supabase env to persist (see .env.example + supabase/schema.sql).</>}
        </span>
        {!useSupa && <button onClick={() => { localStorage.removeItem("trainerboard_store_v1"); location.reload(); }} className="underline shrink-0">Reset demo</button>}
        {supaError && <span className="text-red-700">{supaError}</span>}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold tracking-tight flex items-center gap-2"><span className="w-2 h-2 bg-lime-500 rounded-full animate-pulse" /> Today&apos;s check-ins — {today}</h2>
            <p className="text-sm text-zinc-500">{todaysAssignments.length} assigned</p>
            <div className="mt-4 space-y-3">
              {todaysAssignments.length === 0 && <p className="text-sm text-zinc-400">No workouts for today. Assign one.</p>}
              {todaysAssignments.map((a) => {
                const w = workouts.find((x) => x.id === a.workout_id);
                const c = clientsAny.find((x) => x.id === a.client_id);
                return (
                  <div key={a.id} className="flex items-center justify-between border rounded-2xl px-4 py-3 bg-zinc-50">
                    <div>
                      <div className="font-medium text-sm">{w?.title} → {c?.name}</div>
                      <div className="text-xs text-zinc-500">{a.status} • {c?.goals ? `Goal: ${c.goals.slice(0,40)}…` : "No goal set"} • <Link href={`/c/${c?.invite_token ?? ""}`} className="underline">Client link</Link></div>
                    </div>
                    <button onClick={() => handleToggle(a.id, a.status)} className={`text-xs px-3 py-1.5 rounded-full font-bold ${a.status === "completed" ? "bg-emerald-500 text-white" : "bg-zinc-900 text-white"}`}>{a.status === "completed" ? "Completed ✓" : "Mark done"}</button>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold">Clients ({clientsAny.length}{useSupa ? "" : "/3 free"}) — Bio & Goals</h2>
            <p className="text-xs text-zinc-500 mt-1">Bio & goals help you customize plans. Shown on client link too.</p>
            <div className="mt-4 space-y-3">
              {clientsAny.map((c) => (
                <div key={c.id} className="border rounded-2xl p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">{c.name} <span className="text-xs font-normal text-zinc-500">• {c.status}</span></div>
                      <div className="text-xs text-zinc-500">{c.email} • {c.phone}</div>
                      {editingId === c.id ? (
                        <div className="mt-3 space-y-2">
                          <textarea value={editBio} onChange={(e)=> setEditBio(e.target.value)} placeholder="Bio — e.g. 28, beginner, desk job, knee injury left leg" rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" />
                          <textarea value={editGoals} onChange={(e)=> setEditGoals(e.target.value)} placeholder="Goals — e.g. Lose 5kg, squat 80kg, run 5k" rows={2} className="w-full border rounded-xl px-3 py-2 text-sm" />
                          <div className="flex gap-2">
                            <button onClick={()=> handleSaveBioGoals(c.id)} className="bg-zinc-900 text-white px-4 py-1.5 rounded-full text-xs font-bold">Save</button>
                            <button onClick={()=> setEditingId(null)} className="border px-4 py-1.5 rounded-full text-xs">Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 grid gap-2">
                          <div className="bg-lime-50 border border-lime-100 rounded-xl p-3">
                            <div className="text-[11px] font-bold tracking-widest uppercase text-lime-700">Bio</div>
                            <div className="text-sm text-zinc-700 mt-1">{c.bio || <span className="text-zinc-400">No bio — click Edit to add.</span>}</div>
                          </div>
                          <div className="bg-zinc-50 border rounded-xl p-3">
                            <div className="text-[11px] font-bold tracking-widest uppercase text-zinc-500">Goals</div>
                            <div className="text-sm text-zinc-700 mt-1">{c.goals || <span className="text-zinc-400">No goals set.</span>}</div>
                          </div>
                          <button onClick={()=> { setEditingId(c.id); setEditBio(c.bio ?? ""); setEditGoals(c.goals ?? ""); }} className="text-xs underline text-zinc-600 self-start">Edit bio & goals</button>
                        </div>
                      )}
                    </div>
                    <Link href={`/c/${c.invite_token}`} className="text-xs border px-3 py-1.5 rounded-full hover:bg-zinc-50 shrink-0 font-medium">Open client link</Link>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t pt-5">
              <h3 className="text-sm font-bold flex items-center gap-2"><span className="w-5 h-5 rounded-full bg-lime-400 flex items-center justify-center text-zinc-900 text-xs">+</span> Add client — with bio & goals</h3>
              <div className="mt-3 grid sm:grid-cols-3 gap-2">
                <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name*" className="border rounded-xl px-3 py-2.5 text-sm" />
                <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="border rounded-xl px-3 py-2.5 text-sm" />
                <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Phone" className="border rounded-xl px-3 py-2.5 text-sm" />
              </div>
              <textarea value={bio} onChange={(e)=> setBio(e.target.value)} placeholder="Bio — e.g. 30, intermediate, shoulder injury, works night shifts" rows={2} className="mt-2 w-full border rounded-xl px-3 py-2.5 text-sm" />
              <textarea value={goals} onChange={(e)=> setGoals(e.target.value)} placeholder="Goals — e.g. Hypertrophy, fix posture, train 4x/week" rows={2} className="mt-2 w-full border rounded-xl px-3 py-2.5 text-sm" />
              <button onClick={handleAddClient} className="mt-3 bg-zinc-900 text-white px-6 py-2.5 rounded-full text-sm font-bold hover:bg-black">Add client</button>
              {!useSupa && clientsAny.length >= 3 && <p className="text-xs text-amber-600 mt-2">Free limit 3 — $19 Starter for 15.</p>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white border rounded-3xl p-6 shadow-sm">
            <h2 className="font-bold">Workouts ({workouts.length})</h2>
            <div className="mt-3 space-y-2 max-h-64 overflow-auto pr-1">
              {workouts.map((w) => (
                <div key={w.id} className="border rounded-2xl p-3 bg-zinc-50">
                  <div className="font-semibold text-sm">{w.title}</div>
                  <div className="text-xs text-zinc-500">{(w as {exercises: Array<unknown>}).exercises.length} exercises • {w.notes}</div>
                  <ul className="mt-2 text-xs text-zinc-600 list-disc pl-4">
                    {(w as {exercises: Array<{exercise_id:string;sets:number;reps:string;rest:number}>}).exercises.map((ex, i) => <li key={i}>{exerciseById(ex.exercise_id)?.name} — {ex.sets}x{ex.reps} rest {ex.rest}s</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-5 border-t pt-4">
              <h3 className="text-sm font-bold">New workout template</h3>
              <input value={wTitle} onChange={(e) => setWTitle(e.target.value)} placeholder="Title e.g. Push Day - Hypertrophy" className="mt-2 w-full border rounded-xl px-3 py-2.5 text-sm" />
              <input value={wNotes} onChange={(e) => setWNotes(e.target.value)} placeholder="Notes — customize based on bio/goals" className="mt-2 w-full border rounded-xl px-3 py-2.5 text-sm" />
              {wExercises.map((ex, idx) => (
                <div key={idx} className="mt-2 flex gap-1 items-center">
                  <select value={ex.exercise_id} onChange={(e) => setWExercises((arr) => arr.map((x, i) => i === idx ? { ...x, exercise_id: e.target.value } : x))} className="flex-1 border rounded-xl px-2 py-2 text-xs bg-white">
                    {getExercises().map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                  </select>
                  <input type="number" value={ex.sets} onChange={(e) => setWExercises((arr) => arr.map((x, i) => i === idx ? { ...x, sets: Number(e.target.value) } : x))} className="w-14 border rounded-xl px-2 py-2 text-xs" />
                  <input value={ex.reps} onChange={(e) => setWExercises((arr) => arr.map((x, i) => i === idx ? { ...x, reps: e.target.value } : x))} className="w-16 border rounded-xl px-2 py-2 text-xs" />
                  <button onClick={() => setWExercises((arr) => arr.filter((_, i) => i !== idx))} className="text-xs px-2">✕</button>
                </div>
              ))}
              <div className="mt-3 flex gap-2">
                <button onClick={() => setWExercises((a) => [...a, { exercise_id: "3", sets: 3, reps: "10", rest: 60 }])} className="text-xs border px-3 py-1.5 rounded-full bg-white">+ Add exercise</button>
                <button onClick={handleSaveWorkout} className="text-xs bg-zinc-900 text-white px-4 py-1.5 rounded-full font-bold">Save template</button>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 text-white rounded-3xl p-6 shadow-lg relative overflow-hidden">
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-lime-400 rounded-full blur-2xl opacity-20" />
            <h2 className="font-bold flex items-center gap-2 relative"><span className="w-6 h-6 rounded-xl bg-lime-400 flex items-center justify-center text-zinc-900 text-xs">→</span> Assign workout</h2>
            <p className="text-xs text-zinc-400 mt-1 relative">Tip: Check client&apos;s Goals before choosing template.</p>
            <select value={assignWorkoutId} onChange={(e) => setAssignWorkoutId(e.target.value)} className="mt-3 w-full rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white">
              {workouts.map((w) => <option key={w.id} value={w.id}>{w.title}</option>)}
            </select>
            <select value={assignClientId} onChange={(e) => setAssignClientId(e.target.value)} className="mt-2 w-full rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white">
              {clientsAny.map((c) => <option key={c.id} value={c.id}>{c.name}{c.goals ? ` — ${c.goals.slice(0,20)}` : ""}</option>)}
            </select>
            <input type="date" value={assignDate} onChange={(e) => setAssignDate(e.target.value)} className="mt-2 w-full rounded-xl px-3 py-2.5 text-sm text-zinc-900 bg-white" />
            <button onClick={handleAssign} className="mt-3 w-full bg-lime-400 text-zinc-900 py-2.5 rounded-full text-sm font-bold hover:bg-lime-300">Assign →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
