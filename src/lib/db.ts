// Supabase CRUD wrappers - used when env vars are set. Falls back to localStorage otherwise.
import { createClient } from "./supabase/client";

export type DbClient = { id: string; trainer_id: string; name: string; email: string | null; phone: string | null; invite_token: string; status: string; created_at: string };
export type DbWorkout = { id: string; trainer_id: string; title: string; notes: string | null; created_at: string };
export type DbWorkoutExercise = { id: string; workout_id: string; exercise_id: string; sets: number; reps: string; rest_seconds: number; position: number };
export type DbAssignment = { id: string; workout_id: string; client_id: string; assigned_date: string; status: string };

function uidToken() { return "tok_" + Math.random().toString(36).slice(2, 9) + Math.random().toString(36).slice(2, 9); }

export async function ensureProfile() {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("Not logged in");
  const { data } = await supa.from("profiles").select("id").eq("id", user.id).single();
  if (!data) {
    await supa.from("profiles").insert({ id: user.id, business_name: user.email?.split("@")[0] ?? "My Studio" });
  }
  return user;
}

export async function fetchTrainerData() {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) return null;
  const [{ data: clients }, { data: workouts }, { data: assignments }] = await Promise.all([
    supa.from("clients").select("*").eq("trainer_id", user.id).order("created_at", { ascending: false }),
    supa.from("workouts").select("*, workout_exercises(*)").eq("trainer_id", user.id).order("created_at", { ascending: false }),
    supa.from("assignments").select("*").order("created_at", { ascending: false }),
  ]);
  // Filter assignments to only this trainer's clients
  const clientIds = new Set((clients ?? []).map(c => c.id));
  const filteredAssignments = (assignments ?? []).filter(a => clientIds.has(a.client_id));
  return { user, clients: clients ?? [], workouts: workouts ?? [], assignments: filteredAssignments };
}

export async function createClientDb(name: string, email: string, phone: string) {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data, error } = await supa.from("clients").insert({ trainer_id: user.id, name, email: email || null, phone: phone || null, invite_token: uidToken(), status: "pending" }).select().single();
  if (error) throw error;
  return data as DbClient;
}

export async function createWorkoutDb(title: string, notes: string, exercises: { exercise_id: string; sets: number; reps: string; rest: number }[]) {
  const supa = createClient();
  const { data: { user } } = await supa.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  const { data: workout, error } = await supa.from("workouts").insert({ trainer_id: user.id, title, notes: notes || null }).select().single();
  if (error) throw error;
  if (exercises.length) {
    const rows = exercises.map((ex, i) => ({ workout_id: workout.id, exercise_id: ex.exercise_id, sets: ex.sets, reps: ex.reps, rest_seconds: ex.rest, position: i }));
    const { error: e2 } = await supa.from("workout_exercises").insert(rows);
    if (e2) throw e2;
  }
  return workout as DbWorkout;
}

export async function assignWorkoutDb(workout_id: string, client_id: string, assigned_date: string) {
  const supa = createClient();
  const { data, error } = await supa.from("assignments").insert({ workout_id, client_id, assigned_date, status: "pending" }).select().single();
  if (error) throw error;
  return data as DbAssignment;
}

export async function toggleAssignmentDb(id: string, currentStatus: string) {
  const supa = createClient();
  const next = currentStatus === "completed" ? "pending" : "completed";
  const { error } = await supa.from("assignments").update({ status: next }).eq("id", id);
  if (error) throw error;
  return next;
}
