// ── SUPABASE CONFIG ─────────────────────────────────────────────────────────
// Replace these with your own Supabase project values after setup
const SUPABASE_URL = 'https://pqjbknytplwrefzqbser.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZVwztV1ApJpNChl3r0vIpQ_Ux9ko-Lh';


// ── STATE ───────────────────────────────────────────────────────────────────
let currentUser = null;
let currentProfile = null;
let allSessions = [];
let allAssessments = [];

// ── PROGRAMME DATA ──────────────────────────────────────────────────────────
const PROGRAMME = [
  { meso:1, week:1,  type:'normal', km:0, lr:'40min walk',  key:'Uphill walk 8% 30min', strength:'Neural Activation A', cardio:'Walk + Cross Trainer', nut:'-300 kcal' },
  { meso:1, week:2,  type:'normal', km:0, lr:'45min walk',  key:'Cross trainer 35min', strength:'Neural Activation A+B', cardio:'Walk + Cross Trainer', nut:'-300 kcal' },
  { meso:1, week:3,  type:'normal', km:0, lr:'50min walk',  key:'Assault bike 20min intervals', strength:'Neural Activation A+B', cardio:'Walk + Bike', nut:'-300 kcal' },
  { meso:1, week:4,  type:'deload', km:0, lr:'30min easy walk', key:'DELOAD + RETEST', strength:'Deload — mobility', cardio:'Walk only', nut:'-300 kcal' },
  { meso:2, week:5,  type:'gate',   km:30, lr:'14 km easy', key:'Easy run only — gate entry', strength:'Loaded SL Strength A', cardio:'Running', nut:'-250 kcal' },
  { meso:2, week:6,  type:'normal', km:34, lr:'16 km easy', key:'4x strides + easy', strength:'Strength A+B', cardio:'Running', nut:'-250 kcal' },
  { meso:2, week:7,  type:'normal', km:38, lr:'18 km easy', key:'25 min easy tempo', strength:'Strength A+B', cardio:'Running', nut:'-250 kcal' },
  { meso:2, week:8,  type:'deload', km:24, lr:'12 km easy', key:'DELOAD + RETEST', strength:'Deload — rehab', cardio:'Running', nut:'-250 kcal' },
  { meso:3, week:9,  type:'normal', km:46, lr:'23 km',     key:'5 km tempo @ 5:20/km', strength:'Strength C', cardio:'Running', nut:'Maintenance' },
  { meso:3, week:10, type:'normal', km:52, lr:'26 km',     key:'6x800m intervals', strength:'Strength C', cardio:'Running', nut:'Maintenance' },
  { meso:3, week:11, type:'normal', km:58, lr:'29 km',     key:'8 km @ MP 5:41/km', strength:'Strength C', cardio:'Running', nut:'Maint +50' },
  { meso:3, week:12, type:'deload', km:36, lr:'18 km',     key:'DELOAD + RETEST', strength:'Deload', cardio:'Running', nut:'Maintenance' },
  { meso:3, week:13, type:'normal', km:62, lr:'32 km',     key:'10 km tempo', strength:'Strength C light', cardio:'Running', nut:'Maint +100' },
  { meso:4, week:14, type:'gate',   km:66, lr:'34 km',     key:'2x6km @ MP', strength:'Maintenance', cardio:'Running', nut:'Maint +100' },
  { meso:4, week:15, type:'normal', km:70, lr:'36 km',     key:'14 km @ MP', strength:'Maintenance', cardio:'Running', nut:'Maint +100' },
  { meso:4, week:16, type:'normal', km:72, lr:'38 km PEAK', key:'3x5km @ MP', strength:'Maintenance', cardio:'Running', nut:'Maint +100' },
  { meso:4, week:17, type:'deload', km:46, lr:'22 km',     key:'DELOAD + FINAL RETEST', strength:'Rest', cardio:'Running', nut:'Maintenance' },
  { meso:5, week:18, type:'normal', km:42, lr:'20 km easy', key:'10 km @ MP', strength:'None', cardio:'Running', nut:'Maintenance' },
  { meso:5, week:19, type:'normal', km:26, lr:'12 km easy', key:'5 km @ MP + strides', strength:'None', cardio:'Running', nut:'Carb load begins' },
  { meso:5, week:20, type:'race',   km:0,  lr:'—',         key:'NY MARATHON — Target 3:59:59', strength:'None', cardio:'RACE', nut:'Race fuelling' },
];

const GATE_CRITERIA = {
  1: [
    { test:'Glute Bridge Hold L', baseline:36, target:45, unit:'sec', field:'glute_bridge_l_sec' },
    { test:'Glute Bridge Hold R', baseline:38, target:45, unit:'sec', field:'glute_bridge_r_sec' },
    { test:'Split Squat Hold L',  baseline:18, target:25, unit:'sec', field:'split_squat_l_sec' },
    { test:'Split Squat Hold R',  baseline:8,  target:20, unit:'sec', field:'split_squat_r_sec' },
    { test:'SL Calf Raise L',     baseline:10, target:15, unit:'reps', field:'calf_raise_l_reps' },
    { test:'Lateral Knee VAS',    baseline:null, target:1, unit:'/10', field:'vas_knee', lowerIsBetter:true },
  ],
  2: [
    { test:'Glute Bridge Hold L', baseline:45, target:55, unit:'sec', field:'glute_bridge_l_sec' },
    { test:'Split Squat Hold R',  baseline:20, target:30, unit:'sec', field:'split_squat_r_sec' },
    { test:'SL Calf Raise L',     baseline:15, target:20, unit:'reps', field:'calf_raise_l_reps' },
    { test:'Lateral Knee VAS during run', baseline:null, target:2, unit:'/10', field:'vas_knee', lowerIsBetter:true },
  ],
  3: [
    { test:'SL Calf Raise L',     baseline:20, target:22, unit:'reps', field:'calf_raise_l_reps' },
    { test:'Split Squat Hold R',  baseline:30, target:40, unit:'sec', field:'split_squat_r_sec' },
    { test:'Lateral Knee VAS 30km+', baseline:null, target:2, unit:'/10', field:'vas_knee', lowerIsBetter:true },
  ],
};

const EXERCISES = {
  'Neural Activation A': [
    'Ankle DF Wall Drill L', '90/90 Hip Rotation IR', 'Supine Glute Med Activation',
    'Side-lying Hip Abduction L (no load)', 'Glute Bridge Bilateral (band)',
    'Romanian Deadlift Bilateral BW', 'Glute Bridge Isometric Hold',
    'Split Squat Hold L', 'Split Squat Hold R', 'Lateral Step-Up BW',
    'Dead Bug', 'Bird Dog', 'SL Calf Raise Eccentric L', 'SL Calf Raise R'
  ],
  'Neural Activation B': [
    'Ankle DF Wall Drill L', 'Hip IR Pigeon Stretch', 'Hip CAR',
    'Clamshell (no band)', 'Reverse Lunge BW', 'SL Glute Bridge L', 'SL Glute Bridge R',
    'Standing Hip Abduction L', 'Lateral Step-Down 15cm', 'SL Calf Raise L',
    'Dead Bug', 'Pallof Press', '90/90 + Soleus Stretch'
  ],
  'Loaded SL Strength A': [
    'Ankle DF Wall Drill L', '90/90 Hip Rotation IR', 'Glute Bridge Band',
    'RDL (loaded)', 'Hip Thrust (loaded)', 'Clamshell (light band)', 'Split Squat (loaded)',
    'Lateral Step-Up (loaded)', 'Nordic Hamstring Curl', 'Dead Bug',
    'Right Side Plank', 'Bird Dog', 'SL Calf Raise L', 'Pallof Press'
  ],
  'Loaded SL Strength B': [
    'Ankle DF Wall Drill L', 'Hip IR Pigeon Stretch', 'Hip CAR',
    'Reverse Lunge (loaded)', 'SL Glute Bridge (loaded)', 'Standing Hip Abduction (loaded)',
    'Calf Raise Eccentric', 'Nordic Hamstring Curl', 'Bent Over Row', 'Push-Up',
    'Dead Bug', 'Bird Dog', '90/90 + Soleus Stretch'
  ],
  'Strength C': [
    'SL RDL (loaded)', 'Bulgarian Split Squat', 'Hip Thrust (heavy)',
    'Nordic Hamstring Curl', 'Lateral Step-Down (heavy)', 'SL Calf Raise L',
    'SL Hop L', 'Bounding', 'Dead Bug', 'Pallof Press'
  ],
  'Maintenance': [
    'SL Glute Bridge / Hip Thrust', 'SL RDL', 'SL Calf Raise L',
    'Standing Hip Abduction', 'Dead Bug', 'Bird Dog'
  ],
};

const CARDIO_TYPES = [
  'Easy Run', 'Tempo Run', 'Intervals', 'Long Run', 'MP Run',
  'Uphill Walk', 'Cross Trainer', 'Assault Bike', 'Recovery Walk', 'Rest'
];

// ── AUTH ─────────────────────────────────────────────────────────────────────
async function checkAuth() {
  const { data: { session } } = await db.auth.getSession();
  if (session) {
    currentUser = session.user;
    await loadProfile();
    return true;
  }
  return false;
}

async function loadProfile() {
  const { data } = await db.from('profiles').select('*').eq('id', currentUser.id).single();
  if (data) currentProfile = data;
}

async function login(email, password) {
  const { data, error } = await db.auth.signInWithPassword({ email, password });
  if (error) throw error;
  currentUser = data.user;
  await loadProfile();
}

async function logout() {
  await db.auth.signOut();
  currentUser = null;
  currentProfile = null;
  window.location.href = 'index.html';
}

// ── DATA ─────────────────────────────────────────────────────────────────────
async function loadAllData() {
  const [sessRes, assessRes] = await Promise.all([
    db.from('sessions').select('*, exercise_sets(*)').order('date', { ascending: false }),
    db.from('assessments').select('*').order('date', { ascending: true })
  ]);
  allSessions = sessRes.data || [];
  allAssessments = assessRes.data || [];
}

async function saveSession(sessionData, exercises) {
  const { data: sess, error: sessErr } = await db.from('sessions').insert([{
    user_id: currentUser.id,
    ...sessionData
  }]).select().single();
  if (sessErr) throw sessErr;

  if (exercises && exercises.length > 0) {
    const sets = exercises.flatMap(ex =>
      ex.sets.map((s, i) => ({
        session_id: sess.id,
        exercise_name: ex.name,
        set_number: i + 1,
        reps: s.reps || null,
        weight_kg: s.weight || null,
        duration_sec: s.duration || null,
        rpe: s.rpe || null,
        notes: s.notes || null,
      }))
    );
    if (sets.length > 0) {
      const { error: setsErr } = await db.from('exercise_sets').insert(sets);
      if (setsErr) throw setsErr;
    }
  }
  return sess;
}

async function saveAssessment(data) {
  const { error } = await db.from('assessments').insert([data]);
  if (error) throw error;
}

// ── HELPERS ──────────────────────────────────────────────────────────────────
function currentWeek() {
  const started = new Date('2025-09-01'); // Update this to actual start date
  const now = new Date();
  const diff = Math.floor((now - started) / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(20, diff + 1));
}

function weekToMeso(week) {
  if (week <= 4) return 1;
  if (week <= 8) return 2;
  if (week <= 13) return 3;
  if (week <= 17) return 4;
  return 5;
}

function vasClass(v) {
  if (v <= 2) return 'vas-' + v;
  if (v <= 5) return 'vas-' + v;
  return 'vas-' + v;
}

function fmt(val, unit='') {
  if (val === null || val === undefined || val === '') return '—';
  return val + unit;
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' });
}

function toast(msg, type='') {
  const wrap = document.getElementById('toast-wrap');
  const t = document.createElement('div');
  t.className = 'toast ' + type;
  t.textContent = msg;
  wrap.appendChild(t);
  setTimeout(() => t.classList.add('show'), 10);
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300);
  }, 3000);
}

function showLoading(el) {
  el.innerHTML = '<div class="loading"><div class="spinner"></div>Loading...</div>';
}

// ── CHARTS (Chart.js) ─────────────────────────────────────────────────────────
const CHART_COLORS = {
  red: '#c0392b', amber: '#d4820a', green: '#2d6a4f',
  blue: '#1a4a72', purple: '#6c3483', teal: '#1a7a6a'
};

function makeLineChart(canvasId, labels, datasets, opts={}) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'line',
    data: { labels, datasets: datasets.map(d => ({
      tension: 0.35, pointRadius: 4, pointHoverRadius: 6,
      borderWidth: 2, fill: d.fill || false,
      ...d
    }))},
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { font: { family:'DM Mono', size:10 }, color:'#7a7268' } }, tooltip: { titleFont:{family:'DM Mono'}, bodyFont:{family:'DM Sans'} } },
      scales: {
        x: { grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{family:'DM Mono',size:9},color:'#7a7268'} },
        y: { grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{family:'DM Mono',size:9},color:'#7a7268'}, ...opts.yAxis }
      }
    }
  });
}

function makeBarChart(canvasId, labels, datasets) {
  const ctx = document.getElementById(canvasId);
  if (!ctx) return;
  if (ctx._chart) ctx._chart.destroy();
  ctx._chart = new Chart(ctx, {
    type: 'bar',
    data: { labels, datasets },
    options: {
      responsive: true, maintainAspectRatio: false,
      plugins: { legend: { labels: { font:{family:'DM Mono',size:10}, color:'#7a7268' } } },
      scales: {
        x: { grid:{display:false}, ticks:{font:{family:'DM Mono',size:9},color:'#7a7268'} },
        y: { grid:{color:'rgba(0,0,0,.04)'}, ticks:{font:{family:'DM Mono',size:9},color:'#7a7268'} }
      }
    }
  });
}

// ── EXPORT ───────────────────────────────────────────────────────────────────
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);
window.APP = {
  db, PROGRAMME, GATE_CRITERIA, EXERCISES, CARDIO_TYPES,
  checkAuth, login, logout, loadProfile, loadAllData,
  saveSession, saveAssessment, currentUser: () => currentUser,
  currentProfile: () => currentProfile,
  allSessions: () => allSessions, allAssessments: () => allAssessments,
  currentWeek, weekToMeso, vasClass, fmt, formatDate, toast, showLoading,
  makeLineChart, makeBarChart, CHART_COLORS
};
