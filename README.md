# Casey Marathon Programme — Web App

Live dashboard for tracking Casey's marathon training progression.

## Setup

### 1. Supabase (free database)
1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to **SQL Editor** and run the schema below
4. Go to **Settings → API** and copy:
   - Project URL → paste into `assets/app.js` as `SUPABASE_URL`
   - anon/public key → paste into `assets/app.js` as `SUPABASE_KEY`

### 2. Supabase Schema (run in SQL Editor)

```sql
-- Enable Row Level Security
create table profiles (
  id uuid references auth.users primary key,
  name text not null,
  role text not null check (role in ('coach', 'client')),
  created_at timestamptz default now()
);

create table sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id),
  date date not null,
  week_num int,
  meso int,
  session_type text,
  cardio_mode text,
  cardio_duration_min int,
  cardio_distance_km numeric,
  cardio_hr_avg int,
  cardio_hr_max int,
  cardio_power_avg int,
  cardio_notes text,
  overall_rpe int,
  overall_vas_knee int,
  coach_notes text,
  created_at timestamptz default now()
);

create table exercise_sets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references sessions(id) on delete cascade,
  exercise_name text not null,
  set_number int,
  reps int,
  weight_kg numeric,
  duration_sec int,
  rpe int,
  notes text,
  created_at timestamptz default now()
);

create table assessments (
  id uuid primary key default gen_random_uuid(),
  date date not null,
  meso int,
  glute_bridge_l_sec int,
  glute_bridge_r_sec int,
  split_squat_l_sec int,
  split_squat_r_sec int,
  calf_raise_l_reps int,
  calf_raise_r_reps int,
  ankle_df_l_cm numeric,
  vas_knee int,
  glute_feel_l text,
  notes text,
  created_at timestamptz default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table sessions enable row level security;
alter table exercise_sets enable row level security;
alter table assessments enable row level security;

-- Policies: all authenticated users can read all data (coach + client share)
create policy "read all" on profiles for select using (auth.role() = 'authenticated');
create policy "read all" on sessions for select using (auth.role() = 'authenticated');
create policy "read all" on exercise_sets for select using (auth.role() = 'authenticated');
create policy "read all" on assessments for select using (auth.role() = 'authenticated');

-- Users can insert/update their own data
create policy "insert own" on sessions for insert with check (user_id = auth.uid());
create policy "update own" on sessions for update using (user_id = auth.uid());
create policy "insert sets" on exercise_sets for insert with check (true);
create policy "insert assess" on assessments for insert with check (true);

-- Create the two user accounts via Supabase Auth dashboard:
-- 1. coach@yourname.com (role: coach)
-- 2. casey@email.com (role: client)
-- Then manually insert their profiles in the profiles table with the right UUIDs
```

### 3. GitHub Pages
1. Push this folder to a GitHub repository
2. Go to **Settings → Pages**
3. Set source to **main branch / root**
4. Your app will be live at `https://yourusername.github.io/repo-name`

### 4. Create User Accounts
In Supabase dashboard → Authentication → Users:
- Add coach email + password
- Add Casey email + password
- Copy their UUIDs and insert into `profiles` table with correct roles

