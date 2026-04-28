const SUPABASE_URL = 'https://pqjbknytplwrefzqbser.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZVwztV1ApJpNChl3r0vIpQ_Ux9ko-Lh';

// ── CLIENT ────────────────────────────────────────────────────────────────────
const CLIENT = {
  name: 'Casey', age: 37, sex: 'female',
  weight: 73, targetWeight: '65-70', vo2max: 41,
  hrMax: 182, // Tanaka: 208-(0.7×37)
  zones: {
    z1: { lo: 0,   hi: 100, label: 'Recovery',   color: '#aaa'     },
    z2: { lo: 100, hi: 118, label: 'Fat Burn',    color: '#2d6a4f'  },
    z3: { lo: 118, hi: 136, label: 'Aerobic',     color: '#d4820a'  },
    z4: { lo: 136, hi: 155, label: 'Threshold',   color: '#e74c3c'  },
    z5: { lo: 155, hi: 173, label: 'Norwegian',   color: '#c0392b'  },
  },
  norwRec: 127,
};

// ── DEFAULT PROGRAMME ─────────────────────────────────────────────────────────
const DEFAULT_PROG = {
  startDate: '2026-04-28',
  mesos: [
    // ─── MESO 1 ──────────────────────────────────────────────────────────────
    {
      id: 'm1', num: 1, title: 'Foundation', weeks: [1,2,3,4], deloadWeek: 4,
      nutrition: { kcal: 1850, protein: 145, carb: 200, fat: 62, deficit: 400 },
      cardio: [
        {
          id: 'cd1', day: 'Day 1', label: 'Incline Walk', type: 'walk',
          warmup: { dur: 10, kph: 4.5, incline: 0, rpm: null, note: '10 min flat walk · easy · HR 100-110 bpm' },
          blocks: [
            { id: 'b1', label: 'Incline Walk', dur: 60, kph: 5.5, incline: 8, rpm: null, hrLo: 100, hrHi: 118, zone: 'Z2', note: '8% incline · 5.5 kph · stay Z2 (100-118 bpm) · conversational pace throughout' },
          ],
        },
        {
          id: 'cd2', day: 'Day 2', label: 'Incline Walk', type: 'walk',
          warmup: { dur: 10, kph: 4.5, incline: 0, rpm: null, note: '10 min flat walk warmup · easy' },
          blocks: [
            { id: 'b1', label: 'Incline Walk', dur: 60, kph: 5.5, incline: 8, rpm: null, hrLo: 100, hrHi: 118, zone: 'Z2', note: '8% incline · 5.5 kph · same as Day 1 · consistent Z2 fat burn stimulus' },
          ],
        },
        {
          id: 'cd3', day: 'Day 3', label: 'Assault Bike Intervals', type: 'bike',
          warmup: { dur: 10, kph: null, incline: null, rpm: 50, note: '10 min easy spin at 50 rpm · build HR gradually · HR below 120 bpm' },
          blocks: [
            { id: 'b1',  label: 'Work 1',     dur: 2,  kph: null, incline: null, rpm: 50, hrLo: 155, hrHi: 164, zone: 'Z5', note: '50 rpm · hard push · 85-90% HRmax (155-164 bpm)' },
            { id: 'b2',  label: 'Recovery 1', dur: 2,  kph: null, incline: null, rpm: 20, hrLo: 120, hrHi: 130, zone: 'Z3', note: '20 rpm · easy spin · let HR drop to ~127 bpm' },
            { id: 'b3',  label: 'Work 2',     dur: 2,  kph: null, incline: null, rpm: 50, hrLo: 155, hrHi: 164, zone: 'Z5', note: '50 rpm · maintain effort' },
            { id: 'b4',  label: 'Recovery 2', dur: 2,  kph: null, incline: null, rpm: 20, hrLo: 120, hrHi: 130, zone: 'Z3', note: '20 rpm · recovery' },
            { id: 'b5',  label: 'Work 3',     dur: 2,  kph: null, incline: null, rpm: 50, hrLo: 155, hrHi: 164, zone: 'Z5', note: '50 rpm · push' },
            { id: 'b6',  label: 'Recovery 3', dur: 2,  kph: null, incline: null, rpm: 20, hrLo: 120, hrHi: 130, zone: 'Z3', note: '20 rpm · recovery' },
            { id: 'b7',  label: 'Work 4',     dur: 2,  kph: null, incline: null, rpm: 50, hrLo: 155, hrHi: 164, zone: 'Z5', note: '50 rpm · maintain' },
            { id: 'b8',  label: 'Recovery 4', dur: 2,  kph: null, incline: null, rpm: 20, hrLo: 120, hrHi: 130, zone: 'Z3', note: '20 rpm · recovery' },
            { id: 'b9',  label: 'Work 5',     dur: 2,  kph: null, incline: null, rpm: 50, hrLo: 155, hrHi: 164, zone: 'Z5', note: '50 rpm · final interval · everything left' },
            { id: 'b10', label: 'Cooldown',   dur: 10, kph: null, incline: null, rpm: 35, hrLo: 90,  hrHi: 110, zone: 'Z1', note: 'Easy spin · HR must return below 110 bpm before stopping' },
          ],
        },
      ],
      strength: [
        {
          id: 'sa1', day: 'Session A', label: 'Lower Body + Posterior Chain',
          note: 'Coach session · x2/week · RPE 6-7 · Movement quality first · glute activation focus',
          groups: [
            { id: 'ga1', type: 'single', label: 'Warm-Up',
              exercises: [
                { id: 'e1', name: 'Treadmill Walk', sets: 1, reps: null, dur: 600, weight: null, unit: 'time', tempo: null, rpe: null, note: '10 min easy walk · get HR to 100-110 bpm' },
                { id: 'e2', name: 'Hip Circle CAR', sets: 2, reps: 8, dur: null, weight: null, unit: 'reps', tempo: 'slow', rpe: null, note: 'Each direction each hip · full controlled articular rotation' },
                { id: 'e3', name: 'Glute Bridge + Mini Band', sets: 2, reps: 15, dur: null, weight: null, unit: 'reps', tempo: '2-2-1', rpe: null, note: 'Band above knees · push knees out · squeeze glutes at top · not lower back' },
              ]
            },
            { id: 'ga2', type: 'superset', label: 'A — Superset',
              exercises: [
                { id: 'e4', name: 'Goblet Squat', sets: 3, reps: 12, dur: null, weight: 8, unit: 'reps', tempo: '3-1-1', rpe: 6, note: 'DB at chest · drive knees wide · full depth · controlled descent' },
                { id: 'e5', name: 'Standing Hip Abduction', sets: 3, reps: 15, dur: null, weight: null, unit: 'reps', tempo: '2-1-2', rpe: 6, note: 'Cable or band · hip neutral · no pelvis hike · drive outer glute · each side' },
              ]
            },
            { id: 'ga3', type: 'superset', label: 'B — Superset',
              exercises: [
                { id: 'e6', name: 'Romanian Deadlift', sets: 3, reps: 10, dur: null, weight: 12, unit: 'reps', tempo: '3-1-1', rpe: 7, note: 'DBs · hip hinge · feel hamstrings · neutral spine · bar close to legs' },
                { id: 'e7', name: 'Hip Thrust', sets: 3, reps: 12, dur: null, weight: 10, unit: 'reps', tempo: '2-2-1', rpe: 7, note: 'Upper back on bench · drive through heels · full extension · squeeze 2 sec top' },
              ]
            },
            { id: 'ga4', type: 'superset', label: 'C — Superset',
              exercises: [
                { id: 'e8', name: 'Lateral Step-Up', sets: 3, reps: 10, dur: null, weight: null, unit: 'reps', tempo: 'controlled', rpe: 6, note: 'Each leg · 15cm step · drive through heel · feel glute driving not quad pulling' },
                { id: 'e9', name: 'Calf Raise — Eccentric', sets: 3, reps: 15, dur: null, weight: null, unit: 'reps', tempo: '1-0-3', rpe: null, note: 'Rise on 2 feet · lower on 1 · 3 sec eccentric · step edge' },
              ]
            },
            { id: 'ga5', type: 'single', label: 'D — Core',
              exercises: [
                { id: 'e10', name: 'Dead Bug', sets: 3, reps: 8, dur: null, weight: null, unit: 'reps', tempo: '4 sec lower', rpe: null, note: 'Opposite arm+leg · lower back flat · breathe out on extension' },
                { id: 'e11', name: 'Pallof Press', sets: 3, reps: 10, dur: null, weight: null, unit: 'reps', tempo: '2 sec hold', rpe: null, note: 'Cable or band at chest height · anti-rotation · each side' },
              ]
            },
          ]
        },
        {
          id: 'sb1', day: 'Session B', label: 'Upper Body + Single Leg',
          note: 'Coach session · Upper body push/pull + single leg strength · RPE 6-7',
          groups: [
            { id: 'gb1', type: 'single', label: 'Warm-Up',
              exercises: [
                { id: 'e1', name: 'Band Pull-Aparts', sets: 2, reps: 15, dur: null, weight: null, unit: 'reps', tempo: 'controlled', rpe: null, note: 'Light band · shoulder blade retraction' },
                { id: 'e2', name: 'Shoulder CAR', sets: 2, reps: 5, dur: null, weight: null, unit: 'reps', tempo: 'slow', rpe: null, note: 'Each arm · full controlled shoulder circle' },
              ]
            },
            { id: 'gb2', type: 'superset', label: 'A — Superset',
              exercises: [
                { id: 'e3', name: 'Seated DB Row', sets: 3, reps: 12, dur: null, weight: 8, unit: 'reps', tempo: '2-1-2', rpe: 7, note: 'Seated on bench · drive elbows back · retract + depress shoulder blades' },
                { id: 'e4', name: 'DB Chest Press', sets: 3, reps: 12, dur: null, weight: 6, unit: 'reps', tempo: '3-1-1', rpe: 7, note: 'Flat or incline bench · elbows 45° · controlled' },
              ]
            },
            { id: 'gb3', type: 'triset', label: 'B — Tri-Set',
              exercises: [
                { id: 'e5', name: 'DB Lateral Raise', sets: 3, reps: 12, dur: null, weight: 4, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Light · no shrugging · lateral deltoid · slight forward lean' },
                { id: 'e6', name: 'DB Bicep Curl', sets: 3, reps: 12, dur: null, weight: 6, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Full ROM · supinate at top' },
                { id: 'e7', name: 'Tricep Pushdown', sets: 3, reps: 12, dur: null, weight: null, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Elbows locked at sides · full extension' },
              ]
            },
            { id: 'gb4', type: 'superset', label: 'C — Single Leg + Core',
              exercises: [
                { id: 'e8', name: 'Reverse Lunge', sets: 3, reps: 10, dur: null, weight: 6, unit: 'reps', tempo: '3-1-1', rpe: 7, note: 'Each leg · step back · drive through front heel · upright torso' },
                { id: 'e9', name: 'Single Leg Glute Bridge', sets: 3, reps: 12, dur: null, weight: null, unit: 'reps', tempo: '2-2-1', rpe: 6, note: 'Each leg · full hip extension · note L vs R symmetry' },
              ]
            },
            { id: 'gb5', type: 'single', label: 'D — Core',
              exercises: [
                { id: 'e10', name: 'Dead Bug', sets: 3, reps: 10, dur: null, weight: null, unit: 'reps', tempo: '4 sec lower', rpe: null, note: 'Lower back flat throughout' },
                { id: 'e11', name: 'Side Plank', sets: 3, reps: null, dur: 30, weight: null, unit: 'time', tempo: null, rpe: null, note: '30 sec each side · elbow under shoulder · straight line' },
              ]
            },
          ]
        },
      ],
      rehab: [
        { id: 'r1', name: 'Ankle DF Wall Drill', dur: '2×15 reps/side', freq: 'Daily', note: '5cm from wall · heel flat · knee tracks 2nd toe · hold 1 sec end range' },
        { id: 'r2', name: '90/90 Hip Rotation — IR', dur: '2×8 reps/side', freq: 'Daily', note: 'Seated · drive front shin toward floor · never force · 2 sec hold at end range' },
        { id: 'r3', name: 'Hip Flexor Stretch', dur: '60 sec/side', freq: 'Daily', note: 'Kneeling lunge · tall posture · squeeze rear glute · progress depth weekly' },
        { id: 'r4', name: 'Calf/Soleus Stretch', dur: '45 sec/side each', freq: 'Daily', note: 'Straight leg + bent knee against wall · both positions each side' },
        { id: 'r5', name: 'Foam Roll — Glutes + TFL', dur: '60 sec/side', freq: 'Daily', note: 'Glute area + outer hip · light pressure · find tender spots and breathe through' },
        { id: 'r6', name: 'Glute Med Activation', dur: '2×15 reps/side', freq: 'Daily', note: 'Side-lying · slow hip abduction · feel outer glute not front of hip · no band initially' },
        { id: 'r7', name: 'Thoracic Rotation', dur: '10 reps/side', freq: 'Daily', note: 'Seated or quadruped · rotate upper back · keep lower back still' },
        { id: 'r8', name: 'Pigeon Stretch (modified)', dur: '60 sec/side', freq: 'Daily', note: 'Figure-4 lying or modified pigeon · hip IR · breathe into restriction' },
      ],
    },
    // ─── MESO 2 ──────────────────────────────────────────────────────────────
    {
      id: 'm2', num: 2, title: 'Base Build', weeks: [5,6,7,8], deloadWeek: 8,
      nutrition: { kcal: 1950, protein: 150, carb: 215, fat: 65, deficit: 350 },
      cardio: [
        {
          id: 'cd4', day: 'Day 1', label: 'Incline Walk — Progressed', type: 'walk',
          warmup: { dur: 10, kph: 4.5, incline: 0, rpm: null, note: '10 min flat walk warmup' },
          blocks: [
            { id: 'b1', label: 'Incline Walk', dur: 65, kph: 5.8, incline: 9, rpm: null, hrLo: 100, hrHi: 118, zone: 'Z2', note: '9% incline · 5.8 kph · slight progression · Z2 stays same · 65 min' },
          ],
        },
        {
          id: 'cd5', day: 'Day 2', label: 'Incline Walk — Progressed', type: 'walk',
          warmup: { dur: 10, kph: 4.5, incline: 0, rpm: null, note: '10 min flat walk' },
          blocks: [
            { id: 'b1', label: 'Incline Walk', dur: 65, kph: 5.8, incline: 9, rpm: null, hrLo: 100, hrHi: 118, zone: 'Z2', note: '9% incline · 5.8 kph · same as Day 1' },
          ],
        },
        {
          id: 'cd6', day: 'Day 3', label: 'Norwegian 4×4 Protocol', type: 'norwegian',
          warmup: { dur: 10, kph: null, incline: null, rpm: 55, note: '10 min progressive spin · 55 rpm · build HR to 120 bpm by end of warmup' },
          blocks: [
            { id: 'b1', label: 'Work 1 — 4 min', dur: 4, kph: null, incline: null, rpm: 65, hrLo: 155, hrHi: 173, zone: 'Z5', note: '65+ rpm · 85-95% HRmax (155-173 bpm) · very hard · can just speak in words not sentences' },
            { id: 'b2', label: 'Recovery 1 — 3 min', dur: 3, kph: null, incline: null, rpm: 40, hrLo: 120, hrHi: 132, zone: 'Z3', note: '40 rpm · active recovery · HR must drop to ~127 bpm before next interval' },
            { id: 'b3', label: 'Work 2 — 4 min', dur: 4, kph: null, incline: null, rpm: 65, hrLo: 155, hrHi: 173, zone: 'Z5', note: '85-95% HRmax · hold the effort · expect it to feel harder than interval 1' },
            { id: 'b4', label: 'Recovery 2 — 3 min', dur: 3, kph: null, incline: null, rpm: 40, hrLo: 120, hrHi: 132, zone: 'Z3', note: '40 rpm · active recovery' },
            { id: 'b5', label: 'Work 3 — 4 min', dur: 4, kph: null, incline: null, rpm: 65, hrLo: 155, hrHi: 173, zone: 'Z5', note: '85-95% HRmax · mental toughness · you can do hard things' },
            { id: 'b6', label: 'Recovery 3 — 3 min', dur: 3, kph: null, incline: null, rpm: 40, hrLo: 120, hrHi: 132, zone: 'Z3', note: '40 rpm · nearly done' },
            { id: 'b7', label: 'Work 4 — 4 min', dur: 4, kph: null, incline: null, rpm: 65, hrLo: 155, hrHi: 173, zone: 'Z5', note: 'Final interval · everything left · 85-95% HRmax · empty the tank' },
            { id: 'b8', label: 'Cooldown — 5 min', dur: 5, kph: null, incline: null, rpm: 40, hrLo: 90, hrHi: 115, zone: 'Z1', note: 'Easy spin · HR must return below 115 bpm before stopping · do not sit still immediately' },
          ],
        },
      ],
      strength: [
        {
          id: 'sa2', day: 'Session A', label: 'Lower Body — Loaded',
          note: 'Coach session · Progress all loads from Meso 1 · RPE 7-8 · Single leg focus increases',
          groups: [
            { id: 'ga1', type: 'single', label: 'Warm-Up',
              exercises: [
                { id: 'e1', name: 'Treadmill Walk', sets: 1, reps: null, dur: 600, weight: null, unit: 'time', tempo: null, rpe: null, note: '10 min' },
                { id: 'e2', name: 'Hip Circle CAR', sets: 2, reps: 10, dur: null, weight: null, unit: 'reps', tempo: 'slow', rpe: null, note: 'Full rotation each hip' },
                { id: 'e3', name: 'Glute Bridge + Band', sets: 2, reps: 15, dur: null, weight: null, unit: 'reps', tempo: '2-2-1', rpe: null, note: 'Mini band above knees · push out' },
              ]
            },
            { id: 'ga2', type: 'superset', label: 'A — Superset',
              exercises: [
                { id: 'e4', name: 'Goblet Squat', sets: 4, reps: 10, dur: null, weight: 12, unit: 'reps', tempo: '3-1-1', rpe: 7, note: 'Heavier than Meso 1 · drive knees out' },
                { id: 'e5', name: 'Hip Thrust — Loaded', sets: 4, reps: 10, dur: null, weight: 20, unit: 'reps', tempo: '2-2-1', rpe: 8, note: 'Barbell or heavy DBs · full extension · squeeze 2 sec' },
              ]
            },
            { id: 'ga3', type: 'superset', label: 'B — Superset',
              exercises: [
                { id: 'e6', name: 'Romanian Deadlift', sets: 4, reps: 8, dur: null, weight: 16, unit: 'reps', tempo: '3-1-1', rpe: 8, note: 'Heavier · hip hinge · feel hamstrings loaded at bottom' },
                { id: 'e7', name: 'Bulgarian Split Squat', sets: 3, reps: 8, dur: null, weight: 8, unit: 'reps', tempo: '3-1-1', rpe: 8, note: 'Rear foot elevated · drive through front heel · L vs R comparison' },
              ]
            },
            { id: 'ga4', type: 'superset', label: 'C — Superset',
              exercises: [
                { id: 'e8', name: 'Nordic Hamstring Curl', sets: 3, reps: 6, dur: null, weight: null, unit: 'reps', tempo: '4 sec lower', rpe: null, note: 'Eccentric focus · resist the fall · hamstring protection' },
                { id: 'e9', name: 'SL Calf Raise', sets: 3, reps: 15, dur: null, weight: null, unit: 'reps', tempo: '1-0-3', rpe: null, note: 'Each leg · 3 sec eccentric · step edge' },
              ]
            },
            { id: 'ga5', type: 'single', label: 'D — Core',
              exercises: [
                { id: 'e10', name: 'Dead Bug', sets: 3, reps: 10, dur: null, weight: null, unit: 'reps', tempo: '4 sec lower', rpe: null, note: 'Progress from Meso 1' },
                { id: 'e11', name: 'Pallof Press', sets: 3, reps: 12, dur: null, weight: null, unit: 'reps', tempo: '2 sec hold', rpe: null, note: 'Increase resistance' },
              ]
            },
          ]
        },
        {
          id: 'sb2', day: 'Session B', label: 'Upper Body — Loaded',
          note: 'Coach session · Heavier loads · RPE 7-8 · Power endurance begins',
          groups: [
            { id: 'gb1', type: 'single', label: 'Warm-Up',
              exercises: [
                { id: 'e1', name: 'Band Pull-Aparts', sets: 2, reps: 20, dur: null, weight: null, unit: 'reps', tempo: 'controlled', rpe: null, note: 'Shoulder activation' },
                { id: 'e2', name: 'Shoulder CAR', sets: 2, reps: 5, dur: null, weight: null, unit: 'reps', tempo: 'slow', rpe: null, note: 'Full circles' },
              ]
            },
            { id: 'gb2', type: 'superset', label: 'A — Superset',
              exercises: [
                { id: 'e3', name: 'Bent Over Row', sets: 4, reps: 10, dur: null, weight: 12, unit: 'reps', tempo: '2-1-2', rpe: 8, note: 'Hip hinge · elbows back and wide · retract shoulder blades' },
                { id: 'e4', name: 'DB Chest Press', sets: 4, reps: 10, dur: null, weight: 10, unit: 'reps', tempo: '3-1-1', rpe: 8, note: 'Heavier load · full ROM' },
              ]
            },
            { id: 'gb3', type: 'triset', label: 'B — Tri-Set',
              exercises: [
                { id: 'e5', name: 'DB Lateral Raise', sets: 3, reps: 12, dur: null, weight: 5, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Increase load' },
                { id: 'e6', name: 'DB Bicep Curl', sets: 3, reps: 12, dur: null, weight: 8, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Heavier' },
                { id: 'e7', name: 'Tricep Pushdown', sets: 3, reps: 12, dur: null, weight: null, unit: 'reps', tempo: '2-1-2', rpe: null, note: 'Progress weight' },
              ]
            },
            { id: 'gb4', type: 'superset', label: 'C — Single Leg + Core',
              exercises: [
                { id: 'e8', name: 'Reverse Lunge — Loaded', sets: 3, reps: 10, dur: null, weight: 10, unit: 'reps', tempo: '3-1-1', rpe: 8, note: 'Each leg · heavier than Meso 1' },
                { id: 'e9', name: 'SL Glute Bridge — Loaded', sets: 3, reps: 12, dur: null, weight: 8, unit: 'reps', tempo: '2-2-1', rpe: 7, note: 'DB on hip · each leg · full extension' },
              ]
            },
            { id: 'gb5', type: 'single', label: 'D — Core',
              exercises: [
                { id: 'e10', name: 'Dead Bug', sets: 3, reps: 10, dur: null, weight: null, unit: 'reps', tempo: '4 sec lower', rpe: null, note: '' },
                { id: 'e11', name: 'Side Plank', sets: 3, reps: null, dur: 40, weight: null, unit: 'time', tempo: null, rpe: null, note: '40 sec each side · progress from Meso 1' },
              ]
            },
          ]
        },
      ],
      rehab: [
        { id: 'r1', name: 'Ankle DF Wall Drill', dur: '2×15 reps/side', freq: 'Daily', note: 'Progress wall distance · track improvement' },
        { id: 'r2', name: '90/90 Hip Rotation — IR', dur: '2×10 reps/side', freq: 'Daily', note: 'More reps · progress range' },
        { id: 'r3', name: 'Hip Flexor Stretch', dur: '60 sec/side', freq: 'Daily', note: 'Kneeling · progress depth' },
        { id: 'r4', name: 'Calf/Soleus Stretch', dur: '60 sec/side each', freq: 'Daily', note: 'Increase hold time from Meso 1' },
        { id: 'r5', name: 'Foam Roll — Glutes + TFL', dur: '60 sec/side', freq: 'Daily', note: 'Same protocol · consistency' },
        { id: 'r6', name: 'Glute Med Activation + Light Band', dur: '2×20 reps/side', freq: 'Daily', note: 'Add lightest band once activation is reliable' },
        { id: 'r7', name: 'Thoracic Rotation', dur: '10 reps/side', freq: 'Daily', note: 'Increase ROM' },
        { id: 'r8', name: 'Pigeon Stretch', dur: '90 sec/side', freq: 'Daily', note: 'Increase hold time from Meso 1' },
      ],
    },
  ],
};

// ── STATE ─────────────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;
let prog = JSON.parse(JSON.stringify(DEFAULT_PROG));
let completed = {};
let rehabDone = {};

// ── AUTH ──────────────────────────────────────────────────────────────────────
function _initSupabase() {
  window._db = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
}
async function checkAuth() {
  const { data: { session } } = await window._db.auth.getSession();
  if (session) { currentUser = session.user; await loadProfile(); return true; }
  return false;
}
async function loadProfile() {
  const { data } = await window._db.from('profiles').select('*').eq('id', currentUser.id).single();
  if (data) currentProfile = data;
}
async function login(email, password) {
  const { data, error } = await window._db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user; await loadProfile();
}
async function logout() { await window._db.auth.signOut(); window.location.href = 'index.html'; }

// ── HELPERS ───────────────────────────────────────────────────────────────────
const isCoach = () => currentProfile?.role === 'coach';
function currentWeek() {
  const diff = Math.floor((new Date() - new Date(prog.startDate)) / (7*24*60*60*1000));
  return Math.max(1, diff + 1);
}
function getMeso(week) { return prog.mesos.find(m => m.weeks.includes(week)) || prog.mesos[0]; }
function uid() { return 'x' + Math.random().toString(36).slice(2,9); }
function todayKey() { return new Date().toISOString().split('T')[0]; }
function toast(msg, type='') {
  const w = document.getElementById('toasts');
  if (!w) return;
  const t = document.createElement('div');
  t.className = 'toast ' + type; t.textContent = msg;
  w.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 300); }, 3200);
}
function zoneColor(zone) {
  return { Z1:'#aaa', Z2:'#2d6a4f', Z3:'#d4820a', Z4:'#e74c3c', Z5:'#c0392b' }[zone] || '#aaa';
}
function saveProg() { localStorage.setItem('casey_prog_v3', JSON.stringify(prog)); toast('Programme saved ✓', 'success'); }
function loadProg() { try { const s = localStorage.getItem('casey_prog_v3'); if (s) prog = JSON.parse(s); } catch(e) {} }
function saveCompletion() { localStorage.setItem('casey_comp_v3', JSON.stringify({ completed, rehabDone })); }
function loadCompletion() {
  try {
    const s = localStorage.getItem('casey_comp_v3');
    if (s) { const d = JSON.parse(s); completed = d.completed || {}; rehabDone = d.rehabDone || {}; }
  } catch(e) {}
}

window.APP = {
  CLIENT, DEFAULT_PROG,
  get prog() { return prog; },
  get completed() { return completed; },
  get rehabDone() { return rehabDone; },
  checkAuth, login, logout, loadProfile,
  isCoach, currentUser: () => currentUser, currentProfile: () => currentProfile,
  currentWeek, getMeso, uid, todayKey, toast, zoneColor,
  saveProg, loadProg, saveCompletion, loadCompletion,
  init: _initSupabase,
};
