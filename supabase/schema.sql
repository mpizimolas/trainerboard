-- TrainerBoard schema - run in Supabase SQL Editor
-- Enable UUID
create extension if not exists "pgcrypto";

-- profiles (trainer)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  business_name text,
  role text default 'trainer',
  created_at timestamp with time zone default now()
);

-- exercises (system library)
create table if not exists exercises (
  id text primary key,
  name text not null,
  muscle_group text not null,
  video_url text,
  is_system_library boolean default true
);

-- clients
create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  email text,
  phone text,
  invite_token text unique not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- workouts
create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  trainer_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  notes text,
  created_at timestamp with time zone default now()
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id text not null references exercises(id),
  sets int not null,
  reps text not null,
  rest_seconds int default 60,
  position int default 0
);

create table if not exists assignments (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  client_id uuid not null references clients(id) on delete cascade,
  assigned_date date not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

create table if not exists logs (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  exercise_id text not null references exercises(id),
  set_number int not null,
  reps_done int,
  weight_done numeric,
  completed_at timestamp with time zone default now()
);

-- RLS
alter table profiles enable row level security;
alter table clients enable row level security;
alter table workouts enable row level security;
alter table workout_exercises enable row level security;
alter table assignments enable row level security;
alter table logs enable row level security;

-- Policies: trainers can manage their own rows (auth.uid() = trainer_id)
-- Simplified policies for MVP - refine after launch
create policy "trainers manage own clients" on clients for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);
create policy "trainers manage own workouts" on workouts for all using (auth.uid() = trainer_id) with check (auth.uid() = trainer_id);
create policy "trainers manage workout_exercises" on workout_exercises for all using (
  exists (select 1 from workouts w where w.id = workout_id and w.trainer_id = auth.uid())
);
create policy "trainers manage assignments" on assignments for all using (
  exists (select 1 from clients c where c.id = client_id and c.trainer_id = auth.uid())
);
create policy "trainers manage logs" on logs for all using (
  exists (select 1 from assignments a join clients c on c.id = a.client_id where a.id = assignment_id and c.trainer_id = auth.uid())
);
create policy "profiles self" on profiles for all using (auth.uid() = id) with check (auth.uid() = id);

-- Allow anon to read exercises
create policy "anyone can read exercises" on exercises for select using (true);

-- For client magic-link: allow anon to read via invite_token for MVP
-- For true security, use Edge Function to verify token. For MVP we allow public read by token.
create policy "anon can read client by token" on clients for select using (true);
create policy "anon can read assignments" on assignments for select using (true);
create policy "anon can read workout_exercises public" on workout_exercises for select using (true);
create policy "anon can read workouts public" on workouts for select using (true);
-- Restrictive variant (comment out above and uncomment below after you implement service_role fetch):
-- create policy "anon none" on clients for select using (false);

-- Migration: add bio/goals for client customization (run if table already exists)
alter table clients add column if not exists bio text;
alter table clients add column if not exists goals text;

-- Seed exercises (50)
insert into exercises (id, name, muscle_group) values
('1','Barbell Back Squat','Legs'),('2','Deadlift','Back'),('3','Bench Press','Chest'),('4','Overhead Press','Shoulders'),('5','Pull-Up','Back'),
('6','Barbell Row','Back'),('7','Romanian Deadlift','Legs'),('8','Incline Dumbbell Press','Chest'),('9','Dumbbell Shoulder Press','Shoulders'),('10','Lat Pulldown','Back'),
('11','Leg Press','Legs'),('12','Leg Curl','Legs'),('13','Leg Extension','Legs'),('14','Bicep Curl','Arms'),('15','Tricep Dip','Arms'),
('16','Tricep Pushdown','Arms'),('17','Lateral Raise','Shoulders'),('18','Face Pull','Shoulders'),('19','Plank','Core'),('20','Hanging Leg Raise','Core'),
('21','Russian Twist','Core'),('22','Cable Fly','Chest'),('23','Push-Up','Chest'),('24','Goblet Squat','Legs'),('25','Bulgarian Split Squat','Legs'),
('26','Hip Thrust','Glutes'),('27','Glute Bridge','Glutes'),('28','Calf Raise','Legs'),('29','Seated Row','Back'),('30','Chest Supported Row','Back'),
('31','Arnold Press','Shoulders'),('32','Hammer Curl','Arms'),('33','Skull Crusher','Arms'),('34','Lunge','Legs'),('35','Step-Up','Legs'),
('36','Kettlebell Swing','Full Body'),('37','Burpee','Full Body'),('38','Mountain Climber','Core'),('39','Dead Bug','Core'),('40','Ab Wheel','Core'),
('41','Chest Press Machine','Chest'),('42','Shoulder Press Machine','Shoulders'),('43','Preacher Curl','Arms'),('44','Cable Row','Back'),('45','Inverted Row','Back'),
('46','Pistol Squat','Legs'),('47','Nordic Curl','Legs'),('48','Farmer Carry','Full Body'),('49','Box Jump','Legs'),('50','Battle Ropes','Full Body')
on conflict (id) do nothing;
