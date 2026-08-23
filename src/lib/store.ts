"use client";

import { SEED_EXERCISES, Exercise } from "./exercises";

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  invite_token: string;
  status: "active" | "pending";
  created_at: string;
};

export type Workout = {
  id: string;
  title: string;
  notes: string;
  exercises: { exercise_id: string; sets: number; reps: string; rest: number }[];
  created_at: string;
};

export type Assignment = {
  id: string;
  workout_id: string;
  client_id: string;
  assigned_date: string;
  status: "pending" | "completed";
};

export type Log = {
  id: string;
  assignment_id: string;
  exercise_id: string;
  set_number: number;
  reps_done: number;
  weight_done: number;
};

const STORAGE_KEY = "trainerboard_store_v1";

function uid() {
  return Math.random().toString(36).slice(2, 9);
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

type Store = {
  clients: Client[];
  workouts: Workout[];
  assignments: Assignment[];
  logs: Log[];
};

function defaultStore(): Store {
  return {
    clients: [
      { id: "c1", name: "Alex Morgan", email: "alex@example.com", phone: "555-0101", invite_token: "tok_alex123", status: "active", created_at: new Date().toISOString() },
      { id: "c2", name: "Jamie Lee", email: "jamie@example.com", phone: "555-0102", invite_token: "tok_jamie456", status: "pending", created_at: new Date().toISOString() },
    ],
    workouts: [
      {
        id: "w1",
        title: "Full Body A - Beginner",
        notes: "Focus on form. Rest 90s between compounds.",
        exercises: [
          { exercise_id: "1", sets: 3, reps: "8", rest: 90 },
          { exercise_id: "3", sets: 3, reps: "8", rest: 90 },
          { exercise_id: "6", sets: 3, reps: "10", rest: 60 },
        ],
        created_at: new Date().toISOString(),
      },
    ],
    assignments: [{ id: "a1", workout_id: "w1", client_id: "c1", assigned_date: todayISO(), status: "pending" }],
    logs: [],
  };
}

export function loadStore(): Store {
  if (typeof window === "undefined") return defaultStore();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const d = defaultStore();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(d));
      return d;
    }
    return JSON.parse(raw) as Store;
  } catch {
    return defaultStore();
  }
}

export function saveStore(s: Store) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

export function getExercises(): Exercise[] {
  return SEED_EXERCISES;
}

export function exerciseById(id: string) {
  return SEED_EXERCISES.find((e) => e.id === id);
}

// Helpers used by UI
export function createClient(s: Store, data: { name: string; email: string; phone: string }): Store {
  const c: Client = {
    id: uid(),
    name: data.name,
    email: data.email,
    phone: data.phone,
    invite_token: "tok_" + uid() + uid(),
    status: "pending",
    created_at: new Date().toISOString(),
  };
  return { ...s, clients: [c, ...s.clients] };
}

export function createWorkout(
  s: Store,
  w: { title: string; notes: string; exercises: Workout["exercises"] }
): Store {
  const workout: Workout = { id: uid(), title: w.title, notes: w.notes, exercises: w.exercises, created_at: new Date().toISOString() };
  return { ...s, workouts: [workout, ...s.workouts] };
}

export function assignWorkout(s: Store, workout_id: string, client_id: string, date: string): Store {
  const a: Assignment = { id: uid(), workout_id, client_id, assigned_date: date, status: "pending" };
  return { ...s, assignments: [a, ...s.assignments] };
}

export function toggleAssignmentComplete(s: Store, assignment_id: string): Store {
  return {
    ...s,
    assignments: s.assignments.map((a) => (a.id === assignment_id ? { ...a, status: a.status === "completed" ? "pending" as const : "completed" as const } : a)),
  };
}

export function addLog(s: Store, log: Omit<Log, "id">): Store {
  return { ...s, logs: [...s.logs, { ...log, id: uid() }] };
}
