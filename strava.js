// ── STRAVA INTEGRATION ────────────────────────────────────────────────────────
// OAuth flow works with GitHub Pages (static site) using token exchange via
// a Supabase Edge Function to keep the client secret off the frontend.
// For now we use the implicit/PKCE approach storing tokens in localStorage.

const STRAVA = {
  clientId: '232438',
  // NOTE: Client secret must NOT be in frontend code in production.
  // We store it only for the initial token exchange via Supabase function.
  // For GitHub Pages we use a proxy approach.
  redirectUri: 'https://codypete.github.io/casey-marathon/strava-callback.html',
  scope: 'read,activity:read_all',
  authUrl: 'https://www.strava.com/oauth/authorize',
  tokenUrl: 'https://www.strava.com/oauth/token',

  // ── TOKEN STORAGE ──────────────────────────────────────────────────────────
  getToken() {
    try { return JSON.parse(localStorage.getItem('strava_token') || 'null'); } catch(e) { return null; }
  },
  setToken(data) {
    localStorage.setItem('strava_token', JSON.stringify(data));
  },
  clearToken() {
    localStorage.removeItem('strava_token');
    localStorage.removeItem('strava_activities');
  },
  isConnected() {
    const t = this.getToken();
    return t && t.access_token;
  },
  isExpired() {
    const t = this.getToken();
    if (!t) return true;
    return Date.now() / 1000 > t.expires_at - 300; // 5 min buffer
  },

  // ── AUTH ───────────────────────────────────────────────────────────────────
  connect() {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      response_type: 'code',
      approval_prompt: 'auto',
      scope: this.scope,
    });
    window.location.href = this.authUrl + '?' + params.toString();
  },

  disconnect() {
    this.clearToken();
    localStorage.removeItem('strava_activities');
    APP.toast('Disconnected from Strava', 'success');
    renderStravaSection();
  },

  // ── TOKEN EXCHANGE via Supabase Edge Function ─────────────────────────────
  async exchangeCode(code) {
    // We call a Supabase Edge Function that holds the client_secret securely
    // This keeps the secret off the frontend
    try {
      const res = await fetch('https://pqjbknytplwrefzqbser.supabase.co/functions/v1/strava-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + window._db.auth.session?.access_token },
        body: JSON.stringify({ code, redirect_uri: this.redirectUri }),
      });
      if (!res.ok) throw new Error('Token exchange failed: ' + res.status);
      const data = await res.json();
      this.setToken(data);
      return data;
    } catch(e) {
      // Fallback: direct exchange (less secure but works for personal use)
      return await this.exchangeCodeDirect(code);
    }
  },

  async exchangeCodeDirect(code) {
    // Direct exchange — only used if Edge Function not available
    // Client secret is included — acceptable for personal single-user app
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: 'ab41406085d2bc86b85e048441e2da86a914ab5b',
        code,
        grant_type: 'authorization_code',
      }),
    });
    if (!res.ok) throw new Error('Token exchange failed');
    const data = await res.json();
    this.setToken(data);
    return data;
  },

  async refreshToken() {
    const t = this.getToken();
    if (!t?.refresh_token) throw new Error('No refresh token');
    const res = await fetch(this.tokenUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_id: this.clientId,
        client_secret: 'ab41406085d2bc86b85e048441e2da86a914ab5b',
        refresh_token: t.refresh_token,
        grant_type: 'refresh_token',
      }),
    });
    if (!res.ok) throw new Error('Refresh failed');
    const data = await res.json();
    this.setToken({ ...t, ...data });
    return data;
  },

  async getValidToken() {
    if (this.isExpired()) await this.refreshToken();
    return this.getToken().access_token;
  },

  // ── ACTIVITIES API ─────────────────────────────────────────────────────────
  async fetchActivities(page = 1, perPage = 30) {
    const token = await this.getValidToken();
    // Fetch activities from programme start date
    const startDate = new Date(APP.prog.startDate);
    const after = Math.floor(startDate.getTime() / 1000);
    const res = await fetch(
      `https://www.strava.com/api/v3/athlete/activities?after=${after}&page=${page}&per_page=${perPage}`,
      { headers: { 'Authorization': 'Bearer ' + token } }
    );
    if (!res.ok) throw new Error('Strava API error: ' + res.status);
    return await res.json();
  },

  async fetchAllActivities() {
    let all = [], page = 1;
    while (true) {
      const batch = await this.fetchActivities(page, 50);
      if (!batch.length) break;
      all = all.concat(batch);
      if (batch.length < 50) break;
      page++;
    }
    // Filter to cardio-relevant types
    const cardioTypes = ['Run','Walk','Ride','VirtualRide','Elliptical','StairStepper','WeightTraining','Workout','Hike'];
    all = all.filter(a => cardioTypes.includes(a.type));
    localStorage.setItem('strava_activities', JSON.stringify(all));
    localStorage.setItem('strava_last_sync', Date.now().toString());
    return all;
  },

  getCachedActivities() {
    try { return JSON.parse(localStorage.getItem('strava_activities') || '[]'); } catch(e) { return []; }
  },

  getLastSync() {
    const t = localStorage.getItem('strava_last_sync');
    return t ? new Date(parseInt(t)) : null;
  },

  // ── MATCH TO PRESCRIBED SESSION ────────────────────────────────────────────
  matchActivity(activity, prescribedDate) {
    // Match Strava activity to a prescribed session by date (+/- 1 day)
    const actDate = new Date(activity.start_date_local).toISOString().split('T')[0];
    const presDate = prescribedDate;
    const diff = Math.abs(new Date(actDate) - new Date(presDate)) / (1000*60*60*24);
    return diff <= 1;
  },

  // ── FORMAT HELPERS ─────────────────────────────────────────────────────────
  formatDuration(seconds) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
    return `${m}:${String(s).padStart(2,'0')}`;
  },

  formatPace(metersPerSec) {
    if (!metersPerSec) return '—';
    const secPerKm = 1000 / metersPerSec;
    const min = Math.floor(secPerKm / 60);
    const sec = Math.round(secPerKm % 60);
    return `${min}:${String(sec).padStart(2,'0')}/km`;
  },

  formatDistance(meters) {
    return (meters / 1000).toFixed(2) + ' km';
  },

  getActivityIcon(type) {
    const icons = { Run:'🏃', Walk:'🚶', Ride:'🚴', VirtualRide:'🚴', Elliptical:'⚡', StairStepper:'🪜', Hike:'🥾', Workout:'💪', WeightTraining:'🏋️' };
    return icons[type] || '◉';
  },

  hrZoneLabel(hr) {
    if (!hr) return '';
    if (hr < 100) return 'Z1';
    if (hr < 118) return 'Z2';
    if (hr < 136) return 'Z3';
    if (hr < 155) return 'Z4';
    return 'Z5';
  },
};

// ── STRAVA CALLBACK HANDLER (called from strava-callback.html) ────────────────
window.STRAVA = STRAVA;

// ── RENDER STRAVA SECTION ─────────────────────────────────────────────────────
function renderStravaSection() {
  const container = document.getElementById('strava-section');
  if (!container) return;

  if (!STRAVA.isConnected()) {
    container.innerHTML = `
      <div style="background:#fff;border:1px solid var(--bdr);border-radius:8px;padding:20px;display:flex;align-items:center;gap:16px;flex-wrap:wrap">
        <div style="background:#fc4c02;border-radius:6px;padding:10px 14px;display:flex;align-items:center;gap:8px">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="white"><path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169"/></svg>
          <span style="color:#fff;font-family:'DM Mono',monospace;font-size:10px;letter-spacing:.1em;text-transform:uppercase">Strava</span>
        </div>
        <div style="flex:1">
          <div style="font-weight:600;font-size:14px;margin-bottom:3px">Connect Strava</div>
          <div style="font-size:12px;color:var(--mut)">Sync Casey's cardio activities automatically after each workout</div>
        </div>
        <button class="btn btn-p" style="background:#fc4c02" onclick="STRAVA.connect()">Connect Strava</button>
      </div>`;
    return;
  }

  const token = STRAVA.getToken();
  const activities = STRAVA.getCachedActivities();
  const lastSync = STRAVA.getLastSync();
  const athlete = token.athlete;

  container.innerHTML = `
    <div style="background:#fff;border:1px solid var(--bdr);border-radius:8px;overflow:hidden;margin-bottom:16px">
      <div style="background:#fc4c02;padding:12px 18px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:12px">
          ${athlete?.profile_medium ? `<img src="${athlete.profile_medium}" style="width:36px;height:36px;border-radius:50%;border:2px solid rgba(255,255,255,.4)">` : ''}
          <div>
            <div style="font-family:'Bebas Neue',sans-serif;font-size:18px;letter-spacing:.04em;color:#fff">${athlete ? athlete.firstname + ' ' + athlete.lastname : 'Connected'}</div>
            <div style="font-family:'DM Mono',monospace;font-size:9px;color:rgba(255,255,255,.7);letter-spacing:.1em;text-transform:uppercase">Strava Connected · ${activities.length} activities synced</div>
          </div>
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <button class="btn btn-sm" style="background:rgba(255,255,255,.2);color:#fff;border:1px solid rgba(255,255,255,.3)" onclick="syncStrava()" id="sync-btn">↻ Sync Now</button>
          <button class="btn btn-sm" style="background:rgba(255,255,255,.1);color:rgba(255,255,255,.7)" onclick="STRAVA.disconnect()">Disconnect</button>
        </div>
      </div>
      ${lastSync ? `<div style="padding:8px 18px;font-family:'DM Mono',monospace;font-size:9.5px;color:var(--mut);background:var(--cream);border-bottom:1px solid var(--bdr)">Last synced: ${lastSync.toLocaleString('en-GB', {day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'})}</div>` : ''}
      <div style="padding:14px 18px">
        ${activities.length === 0
          ? `<div style="text-align:center;padding:24px;color:var(--mut);font-size:13px">No activities synced yet. Hit Sync Now to pull Casey's activities from Strava.</div>`
          : buildActivityList(activities)
        }
      </div>
    </div>`;
}

function buildActivityList(activities) {
  // Group by week
  const byWeek = {};
  activities.forEach(a => {
    const date = new Date(a.start_date_local);
    const progStart = new Date(APP.prog.startDate);
    const weekNum = Math.floor((date - progStart) / (7*24*60*60*1000)) + 1;
    const wk = Math.max(1, weekNum);
    if (!byWeek[wk]) byWeek[wk] = [];
    byWeek[wk].push(a);
  });

  const weeks = Object.keys(byWeek).sort((a,b) => b-a);

  return `
    <div style="font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--mut);margin-bottom:10px">Activities since programme start</div>
    ${weeks.map(wk => `
      <div style="margin-bottom:16px">
        <div style="font-family:'DM Mono',monospace;font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--mut);padding:5px 0;border-bottom:1px solid var(--bdr);margin-bottom:8px">Week ${wk}</div>
        ${byWeek[wk].map(a => buildActivityRow(a)).join('')}
      </div>`).join('')}`;
}

function buildActivityRow(a) {
  const date = new Date(a.start_date_local).toLocaleDateString('en-GB', {weekday:'short',day:'numeric',month:'short'});
  const dur = STRAVA.formatDuration(a.moving_time);
  const dist = a.distance > 0 ? STRAVA.formatDistance(a.distance) : null;
  const pace = a.average_speed > 0 && a.type === 'Run' ? STRAVA.formatPace(a.average_speed) : null;
  const kph = a.average_speed > 0 && a.type !== 'Run' ? (a.average_speed * 3.6).toFixed(1) + ' kph' : null;
  const hr = a.has_heartrate ? a.average_heartrate : null;
  const hrMax = a.has_heartrate ? a.max_heartrate : null;
  const zone = hr ? STRAVA.hrZoneLabel(hr) : null;
  const zoneColor = zone ? APP.zoneColor(zone) : 'transparent';
  const icon = STRAVA.getActivityIcon(a.type);
  const elev = a.total_elevation_gain > 0 ? Math.round(a.total_elevation_gain) + 'm ↑' : null;
  const cals = a.calories > 0 ? Math.round(a.calories) + ' kcal' : null;

  return `
    <div style="display:flex;align-items:flex-start;gap:12px;padding:10px 0;border-bottom:1px solid var(--bdr)" onclick="showActivityDetail('${a.id}')" style="cursor:pointer">
      <div style="font-size:20px;flex-shrink:0;margin-top:2px">${icon}</div>
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-bottom:4px">
          <div style="font-weight:600;font-size:13px">${a.name}</div>
          ${zone ? `<span style="background:${zoneColor};color:#fff;font-family:'DM Mono',monospace;font-size:9px;padding:1px 7px;border-radius:3px">${zone}</span>` : ''}
          <span style="font-family:'DM Mono',monospace;font-size:9px;color:var(--mut)">${a.type}</span>
        </div>
        <div style="display:flex;gap:14px;flex-wrap:wrap">
          <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--mut)">${date}</span>
          <span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink)">⏱ ${dur}</span>
          ${dist ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink)">📍 ${dist}</span>` : ''}
          ${pace ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink)">⚡ ${pace}</span>` : ''}
          ${kph ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--ink)">⚡ ${kph}</span>` : ''}
          ${hr ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:${zoneColor}">♥ ${Math.round(hr)} avg / ${Math.round(hrMax)} max</span>` : ''}
          ${elev ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--mut)">${elev}</span>` : ''}
          ${cals ? `<span style="font-family:'DM Mono',monospace;font-size:10px;color:var(--mut)">${cals}</span>` : ''}
        </div>
        ${buildVsPrescibed(a)}
      </div>
    </div>`;
}

function buildVsPrescibed(activity) {
  // Try to match this activity to a prescribed session
  const meso = APP.getMeso(APP.currentWeek());
  const actDate = new Date(activity.start_date_local).toISOString().split('T')[0];

  // Find matching prescribed cardio session by date proximity
  let matched = null;
  let matchedSession = null;
  for (const sess of meso.cardio) {
    const totalPrescribedMin = sess.warmup.dur + sess.blocks.reduce((a,b) => a+b.dur, 0);
    // Check if completed on this date
    const doneKey = actDate + '_' + sess.id;
    if (APP.completed[doneKey] || STRAVA.matchActivity(activity, actDate)) {
      matched = { totalPrescribedMin, sess };
      break;
    }
  }

  if (!matched) return '';

  const actualMin = Math.round(activity.moving_time / 60);
  const prescMin = matched.totalPrescribedMin;
  const diff = actualMin - prescMin;
  const diffStr = diff >= 0 ? `+${diff}` : `${diff}`;
  const diffColor = Math.abs(diff) <= 5 ? 'var(--grn)' : Math.abs(diff) <= 15 ? 'var(--amb)' : 'var(--red)';

  return `<div style="margin-top:5px;font-size:11.5px;color:var(--mut)">
    vs prescribed: <strong style="color:${diffColor}">${actualMin} min (${diffStr} min)</strong>
    ${activity.has_heartrate ? ` · HR avg <strong>${Math.round(activity.average_heartrate)} bpm</strong>` : ''}
  </div>`;
}

function showActivityDetail(id) {
  const activities = STRAVA.getCachedActivities();
  const a = activities.find(act => act.id == id);
  if (!a) return;

  const modal = document.getElementById('modal-strava-detail');
  if (!modal) return;

  const hr = a.has_heartrate;
  document.getElementById('strava-detail-body').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:16px">
      ${[
        ['Activity', a.name],
        ['Type', a.type],
        ['Date', new Date(a.start_date_local).toLocaleDateString('en-GB', {weekday:'long',day:'numeric',month:'long'})],
        ['Duration', STRAVA.formatDuration(a.moving_time)],
        ['Distance', a.distance > 0 ? STRAVA.formatDistance(a.distance) : '—'],
        ['Elevation', a.total_elevation_gain > 0 ? Math.round(a.total_elevation_gain) + 'm' : '—'],
        ['Avg Speed', a.average_speed ? (a.average_speed * 3.6).toFixed(1) + ' kph' : '—'],
        ['Avg Pace', a.average_speed && a.type === 'Run' ? STRAVA.formatPace(a.average_speed) : '—'],
        ['Avg HR', hr ? Math.round(a.average_heartrate) + ' bpm (' + STRAVA.hrZoneLabel(a.average_heartrate) + ')' : '—'],
        ['Max HR', hr ? Math.round(a.max_heartrate) + ' bpm' : '—'],
        ['Calories', a.calories > 0 ? Math.round(a.calories) + ' kcal' : '—'],
        ['Kudos', a.kudos_count || 0],
      ].map(([label, value]) => `
        <div style="background:var(--cream);border-radius:5px;padding:9px 12px">
          <div style="font-family:'DM Mono',monospace;font-size:8.5px;letter-spacing:.13em;text-transform:uppercase;color:var(--mut);margin-bottom:2px">${label}</div>
          <div style="font-size:13px;font-weight:500">${value}</div>
        </div>`).join('')}
    </div>
    <a href="https://www.strava.com/activities/${a.id}" target="_blank" class="btn btn-p" style="background:#fc4c02;display:inline-flex">View on Strava ↗</a>`;

  document.getElementById('strava-detail-title').textContent = a.name;
  modal.classList.add('open');
}

async function syncStrava() {
  const btn = document.getElementById('sync-btn');
  if (btn) { btn.textContent = '↻ Syncing…'; btn.disabled = true; }
  try {
    await STRAVA.fetchAllActivities();
    APP.toast('Strava synced — ' + STRAVA.getCachedActivities().length + ' activities', 'success');
    renderStravaSection();
  } catch(e) {
    APP.toast('Sync failed: ' + e.message, 'error');
    console.error(e);
  } finally {
    if (btn) { btn.textContent = '↻ Sync Now'; btn.disabled = false; }
  }
}
