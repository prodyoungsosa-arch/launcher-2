/* =====================================================================
   LAUNCHER UI · app.js
   Solo interfaz. Toda la lógica (DB, juego, pagos) la conectas tú con:

       Launcher.on('login', async ({username, password, remember}) => { ... });
       Launcher.setUser({...});   // pinta el perfil con datos de tu DB

   Mira el README.md para el listado completo de handlers y modelos.
   ===================================================================== */
(() => {
'use strict';

/* ------------------------------------------------------------------ utils */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = v => String(v ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
const num = v => Number(v) || 0;
const fmt = n => num(n).toLocaleString('en-US');
const sleep = ms => new Promise(r => setTimeout(r, ms));
const store = {
  get(k, d) { try { const v = localStorage.getItem('lnch.' + k); return v === null ? d : JSON.parse(v); } catch (_) { return d; } },
  set(k, v) { try { localStorage.setItem('lnch.' + k, JSON.stringify(v)); } catch (_) {} }
};
const safeUrl = u => /^(https?:|data:image\/|\.{0,2}\/|[\w-]+\/)/i.test(String(u || '')) ? String(u) : '';

/* ------------------------------------------------------------------ iconos */
const ICONS = {
  minus: '<path d="M5 12h14"/>',
  square: '<rect x="5" y="5" width="14" height="14" rx="2"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
  users: '<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0"/><path d="M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6.5 6.5 0 0 1 3.5 6"/>',
  crown: '<path d="M3 8l4.5 4L12 5l4.5 7L21 8l-2 11H5z"/>',
  calendar: '<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  shield: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>',
  lock: '<rect x="4" y="11" width="16" height="10" rx="2.5"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 8 9 6 9-6"/>',
  eye: '<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>',
  eyeoff: '<path d="M3 3l18 18M10.6 6.1A9.8 9.8 0 0 1 12 6c6.5 0 10 6 10 6a17 17 0 0 1-3.2 3.9M6.6 7.6A16.6 16.6 0 0 0 2 12s3.5 7 10 7a9.7 9.7 0 0 0 4.3-1"/>',
  check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
  gamepad: '<rect x="2" y="7" width="20" height="11" rx="5"/><path d="M7 10.5v4M5 12.5h4M15.5 11.5h.01M18 13.5h.01"/>',
  gift: '<rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8c-1.5-4-6-4-5 0 .5 1.5 3 1 5 0zM12 8c1.5-4 6-4 5 0-.5 1.5-3 1-5 0z"/>',
  globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  headset: '<path d="M4 14v-2a8 8 0 0 1 16 0v2"/><rect x="3" y="14" width="4" height="6" rx="1.5"/><rect x="17" y="14" width="4" height="6" rx="1.5"/><path d="M19 20c0 1.5-2 2-5 2"/>',
  logout: '<path d="M9 4H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3M16 8l4 4-4 4M20 12H9"/>',
  home: '<path d="M3 11 12 4l9 7M5 10v10h14V10"/><path d="M10 20v-6h4v6"/>',
  star: '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
  play: '<path d="M7 4.5v15l12-7.5z" fill="currentColor"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
  bell: '<path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 21h4"/>',
  coin: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4.5"/>',
  wallet: '<path d="M4 7a2 2 0 0 1 2-2h12v4"/><rect x="3" y="7" width="18" height="13" rx="3"/><circle cx="16.5" cy="13.5" r="1.2"/>',
  bank: '<path d="M3 9 12 4l9 5M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 20h18"/>',
  briefcase: '<rect x="3" y="7" width="18" height="13" rx="3"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  server: '<rect x="3" y="4" width="18" height="6.5" rx="2"/><rect x="3" y="13.5" width="18" height="6.5" rx="2"/><path d="M7 7.2h.01M7 16.8h.01"/>',
  settings: '<path d="M4 7h10M18 7h2M4 17h2M10 17h10"/><circle cx="16" cy="7" r="2"/><circle cx="8" cy="17" r="2"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 .9-1 1.7M12 17h.01"/>',
  news: '<rect x="4" y="4" width="16" height="16" rx="3"/><path d="M8 9h8M8 13h8M8 16h5"/>',
  store: '<path d="M4 9l1.5-5h13L20 9"/><path d="M4 9a2.67 2.67 0 0 0 5.33 0 2.67 2.67 0 0 0 5.34 0A2.67 2.67 0 0 0 20 9"/><path d="M5 12v8h14v-8"/>',
  copy: '<rect x="8" y="8" width="12" height="12" rx="2.5"/><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2"/>',
  folder: '<path d="M3 7a2 2 0 0 1 2-2h4l2 2.5h8a2 2 0 0 1 2 2V18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>',
  refresh: '<path d="M20 11a8 8 0 0 0-14-4.5L4 9M4 4v5h5M4 13a8 8 0 0 0 14 4.5L20 15M20 20v-5h-5"/>',
  zap: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>',
  flame: '<path d="M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3 2-4 .3 1.5 1 2 2 2 0-3-1-5 1-8z"/>',
  info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
  chevd: '<path d="m6 9 6 6 6-6"/>',
  chevr: '<path d="m9 6 6 6-6 6"/>',
  heart: '<path d="M12 20s-8-4.8-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 9c0 6.2-8 11-8 11z"/>',
  external: '<path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5"/>',
  download: '<path d="M12 4v11M7 11l5 5 5-5M5 20h14"/>',
  terminal: '<rect x="3" y="4" width="18" height="16" rx="3"/><path d="m7 9 3 3-3 3M13 15h4"/>',
  alert: '<path d="M12 3 2 20h20z"/><path d="M12 10v4M12 17h.01"/>',
  sparkles: '<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 16l.8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8z"/>',
  trophy: '<path d="M8 4h8v6a4 4 0 0 1-8 0zM8 6H4v1a4 4 0 0 0 4 4M16 6h4v1a4 4 0 0 1-4 4M12 14v4M8 21h8M10 18h4"/>',
  car: '<path d="M5 16V11l2-5h10l2 5v5M3 16h18v3H3zM7 13h.01M17 13h.01"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  activity: '<path d="M3 12h4l3-8 4 16 3-8h4"/>',
  skull: '<circle cx="12" cy="10" r="7"/><path d="M9 21v-4M15 21v-4M9.5 10h.01M14.5 10h.01"/>',
  target: '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  key: '<circle cx="8" cy="15" r="4"/><path d="m11 12 9-9M16 7l3 3"/>',
  wifi: '<path d="M2 9a15 15 0 0 1 20 0M5.5 12.5a10 10 0 0 1 13 0M9 16a5 5 0 0 1 6 0M12 19.5h.01"/>',
  map: '<path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2z"/><path d="M9 4v14M15 6v14"/>',
  bolt: '<path d="M13 3 5 13.5h6L10 21l8-10.5h-6z"/>'
};
const ic = (n, size = 18) => `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${ICONS[n] || ICONS.info}</svg>`;
function hydrate(root = document) {
  $$('i[data-i]', root).forEach(el => {
    if (el.dataset.done) return;
    el.innerHTML = ic(el.dataset.i, +el.dataset.size || 18);
    el.dataset.done = '1';
  });
}

/* ------------------------------------------------------------------ estado */
const DEFAULT_SETTINGS = {
  language: 'es', closeOnPlay: false, autoConnect: false, startWithWindows: false,
  gamePath: '', nick: '', windowed: false, fpsLimit: '60',
  perfMode: false, reduceMotion: false, particles: true, discordRPC: true
};
const S = {
  config: {
    brand: 'TU SERVIDOR', version: '1.0.0', logo: '',
    skinUrl: 'https://assets.open.mp/assets/images/skins/{id}.png',
    discordUrl: '', websiteUrl: '', termsUrl: '', heroImage: '',
    moneySymbol: '$', coinsName: 'Coins'
  },
  user: null,
  view: 'perfil',
  online: { count: 0, max: 0 },
  servers: [], events: [], news: [], changelog: [], faq: [],
  rewards: { streak: 0, canClaim: false, days: [] },
  missions: [], shop: [], notifications: [], logs: [],
  settings: Object.assign({}, DEFAULT_SETTINGS, store.get('settings', {})),
  favorites: new Set(store.get('favs', [])),
  filters: { events: 'all', servers: 'all', shop: 'vip', news: 'noticias' },
  search: { servers: '', faq: '' },
  inApp: false,
  launching: false
};

const VIEWS = {
  perfil:      { icon: 'user',     label: 'Perfil',      title: 'Mi perfil',        sub: 'Tu personaje, tus estadísticas y tu membresía.', badge: 'NUEVO' },
  inicio:      { icon: 'home',     label: 'Inicio',      title: 'Inicio',           sub: 'Todo lo importante de un vistazo.' },
  servidores:  { icon: 'server',   label: 'Servidores',  title: 'Servidores',       sub: 'Elige dónde jugar y guarda tus favoritos.' },
  eventos:     { icon: 'calendar', label: 'Eventos',     title: 'Eventos',          sub: 'Participa y gana recompensas exclusivas.' },
  recompensas: { icon: 'gift',     label: 'Recompensas', title: 'Recompensas',      sub: 'Reclama tus premios diarios y completa misiones.' },
  tienda:      { icon: 'store',    label: 'Tienda',      title: 'Tienda',           sub: 'VIP, monedas y objetos para tu cuenta.' },
  novedades:   { icon: 'news',     label: 'Novedades',   title: 'Novedades',        sub: 'Noticias y registro de cambios.' },
  faq:         { icon: 'help',     label: 'FAQ',         title: 'Preguntas frecuentes', sub: 'Resuelve tus dudas al instante.' },
  ajustes:     { icon: 'settings', label: 'Ajustes',     title: 'Ajustes',          sub: 'Configura el juego, el launcher y el diagnóstico.' }
};
const NAV_GROUPS = [
  { label: 'Cuenta', items: ['perfil', 'inicio'] },
  { label: 'Juego', items: ['servidores', 'eventos', 'recompensas', 'tienda'] },
  { label: 'Comunidad', items: ['novedades', 'faq', 'ajustes'] }
];

/* ------------------------------------------------------------------ handlers */
const handlers = {};
async function call(name, payload) {
  try { window.dispatchEvent(new CustomEvent('launcher:' + name, { detail: payload })); } catch (_) {}
  const h = handlers[name];
  if (!h) return { ok: false, notImplemented: true, message: `Handler "${name}" no registrado (Launcher.on('${name}', fn))` };
  try {
    const r = await h(payload);
    return r === undefined || r === null ? { ok: true } : (typeof r === 'object' ? r : { ok: !!r });
  } catch (e) {
    return { ok: false, message: (e && e.message) || String(e) };
  }
}

/* ------------------------------------------------------------------ formato */
const money = n => (S.config.moneySymbol || '$') + fmt(n);
const fmtDate = iso => { const d = new Date(iso); return isNaN(d) ? String(iso || '—') : d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' }); };
const fmtDateTime = iso => { const d = new Date(iso); return isNaN(d) ? String(iso || '—') : d.toLocaleString('es-ES', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }); };
const fmtClock = ms => { const d = new Date(ms); const p = n => String(n).padStart(2, '0'); return `${p(d.getDate())}/${p(d.getMonth() + 1)}/${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`; };
function ago(v) {
  const t = Date.parse(v); if (isNaN(t)) return v ? String(v) : '';
  const s = Math.round((t - Date.now()) / 1000), a = Math.abs(s);
  const rtf = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
  if (a < 60) return rtf.format(s, 'second');
  if (a < 3600) return rtf.format(Math.round(s / 60), 'minute');
  if (a < 86400) return rtf.format(Math.round(s / 3600), 'hour');
  return rtf.format(Math.round(s / 86400), 'day');
}
const pill = (t, c = '') => `<span class="pill ${c}">${esc(t)}</span>`;

/* ------------------------------------------------------------------ toasts / modales */
function toast(msg, type = 'info', ms = 3600) {
  const el = document.createElement('div');
  el.className = 'toast ' + type;
  el.innerHTML = `<span class="t-ic">${ic(type === 'success' ? 'check' : type === 'error' ? 'alert' : 'info', 16)}</span><span>${esc(msg)}</span>`;
  $('#toasts').appendChild(el);
  requestAnimationFrame(() => el.classList.add('in'));
  setTimeout(() => { el.classList.remove('in'); setTimeout(() => el.remove(), 400); }, ms);
}
function modal({ title = '', body = '', actions = [], wide = false, onMount } = {}) {
  const root = $('#modalRoot');
  const back = document.createElement('div');
  back.className = 'modal-back';
  back.innerHTML = `<div class="modal ${wide ? 'wide' : ''}" role="dialog"><h3>${esc(title)}</h3><div class="m-body">${body}</div><div class="m-actions"></div></div>`;
  const box = $('.modal', back), act = $('.m-actions', back);
  const api = { el: box, close() { back.remove(); document.removeEventListener('keydown', onKey); } };
  const onKey = e => { if (e.key === 'Escape') api.close(); };
  actions.forEach(a => {
    const b = document.createElement('button');
    b.className = 'btn ' + (a.cls || 'btn-ghost');
    b.innerHTML = `<span class="btn-label">${esc(a.label)}</span><span class="spinner"></span>`;
    b.addEventListener('click', async () => {
      if (a.onClick) {
        b.classList.add('loading'); b.disabled = true;
        let keep = false;
        try { keep = (await a.onClick(api)) === false; } finally { b.classList.remove('loading'); b.disabled = false; }
        if (keep) return;
      }
      api.close();
    });
    act.appendChild(b);
  });
  back.addEventListener('mousedown', e => { if (e.target === back) api.close(); });
  document.addEventListener('keydown', onKey);
  root.appendChild(back);
  hydrate(back);
  if (onMount) onMount(api);
  return api;
}
const confirmDlg = (title, body, ok = 'Confirmar') => new Promise(res => modal({
  title, body,
  actions: [{ label: 'Cancelar', onClick: () => res(false) }, { label: ok, cls: 'btn-primary', onClick: () => res(true) }]
}));

/* ------------------------------------------------------------------ config / datos */
function applyConfig() {
  const c = S.config;
  $$('[data-brand]').forEach(e => e.textContent = c.brand);
  $$('[data-version]').forEach(e => e.textContent = 'v' + String(c.version).replace(/^v/i, ''));
  document.title = c.brand + ' · Launcher';
  if (c.logo && safeUrl(c.logo)) $$('.logo-mark').forEach(e => e.innerHTML = `<img src="${esc(c.logo)}" alt="">`);
}
function normUser(u) {
  u = Object.assign({}, u || {});
  u.username = u.username || u.name || 'Jugador';
  u.displayName = u.displayName || u.username;
  u.money = num(u.money); u.bank = num(u.bank); u.coins = num(u.coins);
  u.level = num(u.level) || 1; u.xp = num(u.xp); u.xpNext = num(u.xpNext);
  u.vip = Object.assign({ active: false }, u.vip || {});
  u.skin = u.skin || {};
  u.stats = Array.isArray(u.stats) ? u.stats : [];
  return u;
}
const mainServer = () => S.servers.find(s => s.main) || S.servers[0] || null;
const unread = () => S.notifications.filter(n => !n.read).length;

/* ------------------------------------------------------------------ skin */
const skinSrc = u => {
  const sk = u.skin || {};
  if (sk.image) return safeUrl(sk.image);
  if (sk.id !== undefined && sk.id !== null && S.config.skinUrl) return S.config.skinUrl.replace('{id}', encodeURIComponent(sk.id));
  return '';
};
const SKIN_FALLBACK = `<div class="skin-img fallback"><svg viewBox="0 0 100 160" width="130" fill="currentColor"><circle cx="50" cy="26" r="20"/><path d="M12 150c0-40 10-62 38-62s38 22 38 62z"/></svg></div>`;
const skinImg = u => { const s = skinSrc(u); return s ? `<img class="skin-img" src="${esc(s)}" alt="Skin" data-fallback="skin" draggable="false">` : SKIN_FALLBACK; };

/* ------------------------------------------------------------------ vistas */
function statCard(label, value, icon, tone = '', sub = '') {
  return `<div class="stat ${tone}"><div><div class="stat-l">${esc(label)}</div><div class="stat-v">${value}</div>${sub ? `<div class="stat-s">${esc(sub)}</div>` : ''}</div><span class="stat-ic">${ic(icon, 19)}</span></div>`;
}

function cdBoxes(end) {
  return `<div class="cd" data-cd="${end}"><div class="cd-box"><b data-p="d">0</b><small>Días</small></div><div class="cd-box"><b data-p="h">00</b><small>Horas</small></div><div class="cd-box"><b data-p="m">00</b><small>Min</small></div><div class="cd-box"><b data-p="s">00</b><small>Seg</small></div></div>`;
}

function vipCard(u) {
  const v = u.vip;
  if (v.active && v.expiresAt && !isNaN(Date.parse(v.expiresAt))) {
    const end = Date.parse(v.expiresAt);
    const start = v.startedAt && !isNaN(Date.parse(v.startedAt)) ? Date.parse(v.startedAt) : end - 30 * 864e5;
    return `<div class="vip-card" data-vip-card>
      <div class="vip-head"><span class="vip-crown">${ic('crown', 22)}</span><div><h4>${esc(v.name || 'Membresía VIP')}</h4><small>Vence el ${esc(fmtDate(v.expiresAt))}</small></div></div>
      ${cdBoxes(end)}
      <div class="bar gold thin"><span data-prog-start="${start}" data-prog-end="${end}" style="width:0"></span></div>
      <div class="vip-foot"><span>Tiempo restante</span><span data-cd-left="${end}" data-start="${start}"></span></div>
      ${Array.isArray(v.perks) && v.perks.length ? `<ul class="perks">${v.perks.map(p => `<li>${ic('check', 15)}${esc(p)}</li>`).join('')}</ul>` : ''}
      <button class="btn btn-gold w100" data-act="nav" data-view="tienda" data-filter-set="shop:vip">${ic('crown', 16)} Renovar o mejorar VIP</button>
    </div>`;
  }
  if (v.active) {
    return `<div class="vip-card"><div class="vip-head"><span class="vip-crown">${ic('crown', 22)}</span><div><h4>${esc(v.name || 'Membresía VIP')}</h4><small>Permanente · sin vencimiento</small></div></div>
      ${Array.isArray(v.perks) && v.perks.length ? `<ul class="perks">${v.perks.map(p => `<li>${ic('check', 15)}${esc(p)}</li>`).join('')}</ul>` : ''}</div>`;
  }
  return `<div class="vip-card none"><div class="vip-head"><span class="vip-crown">${ic('crown', 22)}</span><div><h4>Sin membresía VIP</h4><small>Desbloquea ventajas exclusivas</small></div></div>
    <ul class="perks"><li>${ic('check', 15)}Salario y recompensas aumentadas</li><li>${ic('check', 15)}Acceso a zonas y vehículos exclusivos</li><li>${ic('check', 15)}Prioridad en cola y soporte</li></ul>
    <button class="btn btn-gold w100" data-act="nav" data-view="tienda" data-filter-set="shop:vip">${ic('crown', 16)} Obtener VIP</button></div>`;
}

function serverCard(sv) {
  if (!sv) return `<div class="srv-card"><div class="eyebrow">Tu servidor</div><p class="muted" style="margin-top:8px">Sin servidor configurado.</p></div>`;
  const cover = sv.cover && safeUrl(sv.cover) ? `style="--cover:url('${esc(sv.cover)}')"` : '';
  return `<div class="srv-card" ${cover}>
    <div class="eyebrow">Tu servidor</div>
    <h4>${esc(sv.name)} ${sv.opm ? pill('OPM', 'blue') : ''}</h4>
    <div class="muted" style="font-size:12px">${esc(sv.ip)}:${esc(sv.port || 7777)}</div>
    <div class="count"><span data-online-main>${fmt(sv.players)}</span><small>/${fmt(sv.max)} jugadores</small></div>
    <button class="btn btn-play btn-lg w100" data-act="play" data-id="${esc(sv.id)}">${ic('play', 16)} JUGAR</button>
  </div>`;
}

function notifRow(n) {
  return `<div class="notif-row"><span class="np-ic">${ic(n.icon || 'bell', 16)}</span><div style="flex:1"><div>${esc(n.text)}</div><small>${esc(ago(n.time))}</small></div>${n.read ? '' : '<span class="pill red">Nueva</span>'}</div>`;
}

function viewPerfil() {
  const u = S.user, xpPct = u.xpNext ? clamp(u.xp / u.xpNext * 100, 0, 100) : 0;
  const baseMs = Date.parse(u.serverTime), clock = isNaN(baseMs) ? null : baseMs;
  const stats = u.stats.length ? u.stats : [];
  return `
  <div class="profile-hero card glass">
    <div class="skin-stage"><span class="skin-glow"></span>${skinImg(u)}<span class="skin-plat"></span><span class="skin-tag">Skin #${esc(u.skin.id ?? '—')}</span></div>
    <div class="ph-main">
      <div class="ph-top-actions"><button class="btn btn-soft" data-act="support">${ic('headset', 16)} Soporte</button><button class="btn btn-ghost" data-act="logout">${ic('logout', 16)} Salir</button></div>
      <span class="eyebrow">Personaje</span>
      <div class="ph-name"><h2>${esc(u.displayName)}</h2>${u.id !== undefined ? `<span class="tagid">#${esc(u.id)}</span>` : ''}${u.vip.active ? `<span class="pill gold">${ic('crown', 12)} ${esc(u.vip.name || 'VIP')}</span>` : ''}${u.role ? `<span class="pill red">${esc(u.role)}</span>` : ''}</div>
      <div class="ph-org"><span>Organización</span><b>${esc(u.organization || 'Sin organización')}</b></div>
      <div class="ph-level">
        <div class="hex"><svg viewBox="0 0 78 88"><polygon points="39,3 73,22 73,66 39,85 5,66 5,22" fill="rgba(var(--accent-rgb),.14)" stroke="var(--accent-hi)" stroke-width="3" stroke-linejoin="round"/></svg><div><small>NIVEL</small><b>${esc(u.level)}</b></div></div>
        <div class="xp"><div class="xp-top"><span>Experiencia</span><span><b>${fmt(u.xp)}</b>${u.xpNext ? ' / ' + fmt(u.xpNext) + ' XP' : ' XP'}</span></div><div class="bar"><span style="width:${xpPct}%"></span></div></div>
      </div>
      <div class="ph-meta">
        ${u.registeredAt ? `<span>Registro: <b>${esc(fmtDate(u.registeredAt))}</b></span>` : ''}
        ${u.lastLogin ? `<span>Último acceso: <b>${esc(ago(u.lastLogin))}</b></span>` : ''}
        ${u.ip ? `<span>IP: <b>${esc(u.ip)}</b></span>` : ''}
      </div>
    </div>
  </div>

  <div class="grid-profile">
    <div>
      <h3 class="sec-title">${ic('activity', 18)} Estadísticas</h3>
      <div class="stats-grid">
        ${statCard('Billetera', money(u.money), 'wallet', 't-green')}
        ${statCard('Suscripción', esc(u.vip.active ? (u.vip.name || 'VIP') : (u.subscription || 'Usuario')), 'crown', u.vip.active ? 't-gold' : '')}
        ${statCard('Banco', money(u.bank), 'bank', 't-gold')}
        ${statCard('Trabajo', esc(u.job || 'Desempleado'), 'briefcase', 't-blue')}
        ${statCard(S.config.coinsName, fmt(u.coins), 'coin', 't-gold')}
        ${statCard('Tiempo del servidor', clock ? `<span data-clock="${clock}" data-at="${Date.now()}">${fmtClock(clock)}</span>` : '—', 'clock', 't-red')}
      </div>
      ${stats.length ? `<h3 class="sec-title">${ic('target', 18)} Rendimiento</h3><div class="mini-grid">${stats.map(s => `<div class="mini"><small>${ic(s.icon || 'star', 14)}${esc(s.label)}</small><b>${esc(typeof s.value === 'number' ? fmt(s.value) : s.value)}</b></div>`).join('')}</div>` : ''}
    </div>
    <div>
      <h3 class="sec-title">${ic('crown', 18)} Membresía</h3>
      ${vipCard(u)}
      ${serverCard(mainServer())}
    </div>
  </div>

  <h3 class="sec-title">${ic('bell', 18)} Notificaciones<span class="grow"></span>${S.notifications.length ? `<a class="link" data-act="notif-readall">Marcar todo como leído</a>` : ''}</h3>
  <div class="notif-list" id="profNotifs">${S.notifications.length ? S.notifications.slice(0, 4).map(notifRow).join('') : `<div class="empty">${ic('bell', 28)}Sin notificaciones por ahora</div>`}</div>`;
}

function newsCard(n) {
  const img = n.image && safeUrl(n.image) ? `style="--img:url('${esc(n.image)}')"` : '';
  return `<div class="news-card" data-act="news-open" data-id="${esc(n.id)}"><div class="nc-img" ${img}>${n.tag ? pill(n.tag, 'red') : ''}</div><div class="nc-body"><small>${esc(fmtDate(n.date))}</small><h4>${esc(n.title)}</h4><p>${esc(n.summary || '')}</p></div></div>`;
}

function evStatus(e) {
  if (e.status) return e.status;
  const now = Date.now(), s = Date.parse(e.start), en = e.end ? Date.parse(e.end) : s + 72e5;
  if (isNaN(s)) return 'upcoming';
  return now < s ? 'upcoming' : now <= en ? 'live' : 'ended';
}
const EV_LABEL = { live: ['En curso', 'green'], upcoming: ['Próximamente', 'blue'], ended: ['Finalizado', ''] };

function eventCard(e) {
  const st = evStatus(e), [lab, tone] = EV_LABEL[st] || EV_LABEL.upcoming;
  const target = st === 'upcoming' ? Date.parse(e.start) : (e.end ? Date.parse(e.end) : 0);
  const style = e.image && safeUrl(e.image) ? `--img:url('${esc(e.image)}')` : (e.color ? `--img:linear-gradient(135deg,${esc(e.color)},#14151a)` : '');
  const btn = st === 'ended' ? `<button class="btn btn-ghost" disabled>Finalizado</button>`
    : st === 'live' ? `<button class="btn btn-primary" data-act="event" data-id="${esc(e.id)}" data-do="play">${ic('play', 14)} Unirme ahora</button>`
    : e.joined ? `<button class="btn btn-soft" data-act="event" data-id="${esc(e.id)}" data-do="leave">${ic('check', 15)} Inscrito · cancelar</button>`
    : `<button class="btn btn-primary" data-act="event" data-id="${esc(e.id)}" data-do="join">${ic('plus', 15)} Inscribirme</button>`;
  return `<div class="ev-card"><div class="ev-banner" style="${style}"><span class="pill ${tone} ${st === 'live' ? 'ev-live' : ''}">${st === 'live' ? '● ' : ''}${lab}</span>${e.type ? pill(e.type) : ''}</div>
    <div class="ev-body"><h4>${esc(e.title)}</h4><p>${esc(e.description || '')}</p>
    <div class="ev-meta"><span>${ic('calendar', 14)}${esc(fmtDateTime(e.start))}</span>${e.location ? `<span>${ic('map', 14)}${esc(e.location)}</span>` : ''}${e.participants !== undefined ? `<span>${ic('users', 14)}${fmt(e.participants)}${e.max ? '/' + fmt(e.max) : ''}</span>` : ''}</div>
    ${Array.isArray(e.rewards) && e.rewards.length ? `<div class="ev-rw">${e.rewards.map(r => pill(r, 'gold')).join('')}</div>` : ''}
    ${st !== 'ended' && target ? `<div class="ev-cd"><span>${st === 'upcoming' ? 'Empieza en' : 'Termina en'}</span><b data-cd-text="${target}">—</b></div>` : ''}
    <div class="ev-foot">${btn}</div></div></div>`;
}

function viewInicio() {
  const sv = mainServer(), u = S.user;
  const nextEv = S.events.map(e => [e, evStatus(e)]).filter(x => x[1] !== 'ended').sort((a, b) => Date.parse(a[0].start) - Date.parse(b[0].start))[0];
  const hero = S.config.heroImage && safeUrl(S.config.heroImage) ? `style="--hero:url('${esc(S.config.heroImage)}')"` : '';
  const rw = S.rewards;
  return `
  <div class="home-hero" ${hero}>
    <span class="chip" style="width:fit-content;position:relative;z-index:2"><span class="dot pulse"></span> Servidor principal</span>
    <h2>${esc(sv ? sv.name : S.config.brand)}</h2>
    <p>${esc(sv && sv.description ? sv.description : 'Entra, juega y vive la experiencia completa con tu perfil sincronizado.')}</p>
    <div class="hh-meta">
      <div><b data-online-main>${sv ? fmt(sv.players) : '—'}<span style="display:inline;color:var(--muted);font-size:14px">/${sv ? fmt(sv.max) : '—'}</span></b><span>Jugadores</span></div>
      <div><b>${sv && sv.ping !== undefined ? esc(sv.ping) + ' ms' : '—'}</b><span>Ping</span></div>
      <div><b>${sv ? esc(sv.ip) + ':' + esc(sv.port || 7777) : '—'}</b><span>Dirección</span></div>
    </div>
    <div class="hh-actions"><button class="btn btn-play btn-lg" data-act="play-main">${ic('play', 16)} JUGAR AHORA</button>${sv ? `<button class="btn btn-ghost btn-lg" data-act="copy" data-copy="${esc(sv.ip)}:${esc(sv.port || 7777)}">${ic('copy', 16)} Copiar IP</button>` : ''}</div>
  </div>

  <div class="grid g3" style="margin-top:14px">
    <div class="card quick"><div class="q-head">${ic('gift', 15)} Recompensa diaria</div>
      <h4>${rw.canClaim ? '¡Tienes un premio!' : 'Ya reclamada'}</h4><p class="muted" style="font-size:12.5px;margin-bottom:12px">Racha actual: <b style="color:var(--text)">${esc(rw.streak || 0)} días</b></p>
      <button class="btn ${rw.canClaim ? 'btn-primary' : 'btn-ghost'} w100" data-act="nav" data-view="recompensas">${rw.canClaim ? 'Reclamar ahora' : 'Ver recompensas'}</button></div>
    <div class="card quick"><div class="q-head">${ic('calendar', 15)} Próximo evento</div>
      ${nextEv ? `<h4>${esc(nextEv[0].title)}</h4><p class="muted" style="font-size:12.5px;margin-bottom:12px">${nextEv[1] === 'live' ? 'En curso ahora' : 'Empieza en <b style="color:var(--text)" data-cd-text="' + Date.parse(nextEv[0].start) + '">—</b>'}</p><button class="btn btn-ghost w100" data-act="nav" data-view="eventos">Ver eventos</button>`
        : `<h4>Sin eventos</h4><p class="muted" style="font-size:12.5px;margin-bottom:12px">No hay eventos programados.</p><button class="btn btn-ghost w100" data-act="nav" data-view="eventos">Ver eventos</button>`}</div>
    <div class="card quick"><div class="q-head">${ic('wallet', 15)} Tu cuenta</div>
      <h4>${money(u.money + u.bank)}</h4><p class="muted" style="font-size:12.5px;margin-bottom:12px">Patrimonio total · ${fmt(u.coins)} ${esc(S.config.coinsName)}</p>
      <button class="btn btn-ghost w100" data-act="nav" data-view="perfil">Ver perfil</button></div>
  </div>

  <h3 class="sec-title">${ic('news', 18)} Últimas novedades<span class="grow"></span><a class="link" data-act="nav" data-view="novedades">Ver todo →</a></h3>
  <div class="grid g3">${S.news.slice(0, 3).map(newsCard).join('') || `<div class="empty" style="grid-column:1/-1">Aún no hay noticias</div>`}</div>`;
}

function srvRow(s) {
  const pct = s.max ? clamp(s.players / s.max * 100, 0, 100) : 0;
  const pc = s.ping === undefined ? '' : s.ping < 70 ? 'good' : s.ping < 150 ? 'mid' : 'bad';
  const fav = S.favorites.has(String(s.id));
  return `<div class="srv-row">
    <button class="fav ${fav ? 'on' : ''}" data-act="fav" data-id="${esc(s.id)}" title="Favorito">${ic('star', 20)}</button>
    <div class="sr-name"><b>${esc(s.name)} ${s.opm ? pill('OPM', 'blue') : ''}${s.official ? pill('Oficial', 'red') : ''}</b><small data-act="copy" data-copy="${esc(s.ip)}:${esc(s.port || 7777)}" title="Copiar IP">${esc(s.ip)}:${esc(s.port || 7777)}</small></div>
    <div class="sr-players"><b>${fmt(s.players)}</b> / ${fmt(s.max)}<div class="bar thin green"><span style="width:${pct}%"></span></div></div>
    <span class="ping ${pc}">${ic('wifi', 15)}${s.ping !== undefined ? esc(s.ping) + ' ms' : '—'}</span>
    <div class="sr-tags">${(s.tags || []).slice(0, 2).map(t => pill(t)).join('')}</div>
    <button class="btn btn-primary btn-sm" data-act="play" data-id="${esc(s.id)}">${ic('play', 13)} Jugar</button></div>`;
}
function serverListHtml() {
  const q = S.search.servers.trim().toLowerCase(), f = S.filters.servers;
  const list = S.servers.filter(s => (f === 'all' || (f === 'fav' && S.favorites.has(String(s.id))) || (f === 'official' && s.official)) &&
    (!q || [s.name, s.ip, ...(s.tags || [])].join(' ').toLowerCase().includes(q)));
  return list.length ? list.map(srvRow).join('') : `<div class="empty">${ic('server', 30)}No se encontraron servidores</div>`;
}
function viewServidores() {
  const tab = (id, label) => `<button class="tab ${S.filters.servers === id ? 'active' : ''}" data-act="filter" data-group="servers" data-val="${id}">${label}</button>`;
  return `<div class="toolbar"><label class="search">${ic('search', 17)}<input id="srvSearch" data-search="servers" placeholder="Buscar por nombre, IP o etiqueta…" value="${esc(S.search.servers)}"></label>
    <div class="tabs">${tab('all', 'Todos')}${tab('fav', '★ Favoritos')}${tab('official', 'Oficiales')}</div>
    <button class="icon-btn" data-act="refresh" title="Actualizar">${ic('refresh', 17)}</button></div>
    <div class="srv-list" id="srvList">${serverListHtml()}</div>`;
}

function viewEventos() {
  const f = S.filters.events;
  const tab = (id, label) => `<button class="tab ${f === id ? 'active' : ''}" data-act="filter" data-group="events" data-val="${id}">${label}</button>`;
  const list = S.events.filter(e => f === 'all' || evStatus(e) === f);
  return `<div class="tabs">${tab('all', 'Todos')}${tab('live', 'En curso')}${tab('upcoming', 'Próximos')}${tab('ended', 'Finalizados')}</div>
    <div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(320px,1fr))">${list.map(eventCard).join('') || `<div class="empty" style="grid-column:1/-1">${ic('calendar', 30)}No hay eventos en esta categoría</div>`}</div>`;
}

function viewRecompensas() {
  const rw = S.rewards, days = rw.days || [];
  return `<div class="streak"><span class="big">${ic('flame', 30)}</span><div><h3>Racha de ${esc(rw.streak || 0)} día${rw.streak === 1 ? '' : 's'}</h3><p>Entra cada día para no perder tu racha y mejorar tus premios.</p></div>
      <button class="btn ${rw.canClaim ? 'btn-primary' : 'btn-ghost'} btn-lg" data-act="claim-reward" ${rw.canClaim ? '' : 'disabled'}>${ic('gift', 17)} ${rw.canClaim ? 'Reclamar premio de hoy' : 'Vuelve mañana'}</button></div>
    <div class="rw-grid">${days.map((d, i) => `<div class="rw-day ${esc(d.state || 'locked')} ${i === days.length - 1 ? 'big' : ''}"><small>Día ${esc(d.day ?? i + 1)}</small><span class="rw-ic">${ic(d.state === 'claimed' ? 'check' : (d.icon || 'gift'), 22)}</span><b>${esc(d.label)}</b></div>`).join('') || `<div class="empty" style="grid-column:1/-1">Sin recompensas configuradas</div>`}</div>
    <h3 class="sec-title">${ic('target', 18)} Misiones diarias</h3>
    <div class="grid g2">${S.missions.map(m => { const pct = m.goal ? clamp(m.progress / m.goal * 100, 0, 100) : 0, done = m.progress >= m.goal;
      return `<div class="ms"><span class="stat-ic" style="background:rgba(var(--accent-rgb),.18);color:#ff8f8d">${ic(m.icon || 'zap', 19)}</span><div class="ms-body"><div class="ms-top"><b style="color:var(--text)">${esc(m.title)}</b><span>${fmt(m.progress)}/${fmt(m.goal)}</span></div><div class="bar thin ${done ? 'green' : ''}"><span style="width:${pct}%"></span></div></div>
        ${m.claimed ? pill('Reclamada', 'green') : `<button class="btn btn-sm ${done ? 'btn-primary' : 'btn-ghost'}" data-act="claim-mission" data-id="${esc(m.id)}" ${done ? '' : 'disabled'}>${esc(m.reward || 'Reclamar')}</button>`}</div>`; }).join('') || `<div class="empty" style="grid-column:1/-1">No hay misiones activas</div>`}</div>`;
}

function prodCard(p) {
  const cur = p.currency || 'coins';
  const priceTxt = cur === 'coins' ? `${fmt(p.price)} <small>${esc(S.config.coinsName)}</small>` : cur === 'money' ? money(p.price) : (cur === 'usd' ? 'US$' + esc(p.price) : esc(p.price) + ' ' + esc(cur));
  return `<div class="prod ${p.featured ? 'featured' : ''}">${p.badge ? `<span class="prod-badge">${pill(p.badge, p.featured ? 'gold' : 'red')}</span>` : ''}
    <span class="prod-ic">${ic(p.icon || (p.category === 'vip' ? 'crown' : p.category === 'coins' ? 'coin' : 'gift'), 26)}</span>
    <div><h4>${esc(p.name)}</h4><p>${esc(p.description || '')}</p></div>
    ${Array.isArray(p.perks) && p.perks.length ? `<ul class="perks">${p.perks.map(x => `<li>${ic('check', 14)}${esc(x)}</li>`).join('')}</ul>` : '<div style="flex:1"></div>'}
    <div class="price"><b>${priceTxt}</b>${p.oldPrice ? `<s>${fmt(p.oldPrice)}</s>` : ''}${p.duration ? `<small>/ ${esc(p.duration)}</small>` : ''}</div>
    <button class="btn ${p.featured ? 'btn-gold' : 'btn-primary'} w100" data-act="buy" data-id="${esc(p.id)}">${ic(cur === 'usd' ? 'external' : 'store', 16)} ${cur === 'usd' ? 'Comprar' : 'Canjear'}</button></div>`;
}
function viewTienda() {
  const f = S.filters.shop;
  const tab = (id, label, icon) => `<button class="tab ${f === id ? 'active' : ''}" data-act="filter" data-group="shop" data-val="${id}">${ic(icon, 15)}${label}</button>`;
  const list = S.shop.filter(p => (p.category || 'items') === f);
  return `<div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px"><div class="tabs">${tab('vip', 'VIP', 'crown')}${tab('coins', S.config.coinsName, 'coin')}${tab('items', 'Objetos', 'gift')}</div>
    <div class="wallet coins" style="margin-bottom:16px">${ic('coin', 16)} Saldo: <b>${fmt(S.user.coins)}</b> ${esc(S.config.coinsName)}</div></div>
    <div class="grid g-auto" style="grid-template-columns:repeat(auto-fill,minmax(250px,1fr))">${list.map(prodCard).join('') || `<div class="empty" style="grid-column:1/-1">${ic('store', 30)}No hay productos en esta categoría</div>`}</div>`;
}

function viewNovedades() {
  const f = S.filters.news;
  const tab = (id, label) => `<button class="tab ${f === id ? 'active' : ''}" data-act="filter" data-group="news" data-val="${id}">${label}</button>`;
  let body;
  if (f === 'noticias') body = `<div class="grid g3">${S.news.map(newsCard).join('') || `<div class="empty" style="grid-column:1/-1">Aún no hay noticias</div>`}</div>`;
  else {
    const secs = { added: ['Añadido', 'green', 'plus'], improved: ['Mejorado', 'blue', 'zap'], fixed: ['Corregido', 'gold', 'check'], removed: ['Eliminado', 'red', 'x'] };
    body = `<div class="tl">${S.changelog.map(c => `<div class="tl-item ${c.current ? 'current' : ''}"><div class="tl-head"><h4>v${esc(String(c.version).replace(/^v/i, ''))}</h4>${c.current ? pill('Actual', 'red') : ''}${c.tag ? pill(c.tag) : ''}<small>${esc(fmtDate(c.date))}</small></div>
      ${Object.keys(secs).filter(k => c.sections && c.sections[k] && c.sections[k].length).map(k => `<div class="tl-sec"><h5 style="color:var(--${secs[k][1] === 'red' ? 'accent-hi' : secs[k][1]})">${ic(secs[k][2], 14)}${secs[k][0]}</h5><ul>${c.sections[k].map(i => `<li>${esc(i)}</li>`).join('')}</ul></div>`).join('')}</div>`).join('') || `<div class="empty">Sin historial de versiones</div>`}</div>`;
  }
  return `<div class="tabs">${tab('noticias', 'Noticias')}${tab('cambios', 'Registro de cambios')}</div>${body}`;
}

function faqHtml() {
  const q = S.search.faq.trim().toLowerCase();
  const list = S.faq.filter(f => !q || (f.q + ' ' + f.a).toLowerCase().includes(q));
  return list.length ? list.map((f, i) => `<div class="faq-item"><button class="faq-q" data-act="faq">${ic('help', 18)}<span>${esc(f.q)}</span><span class="chev">${ic('chevd', 18)}</span></button><div class="faq-a"><div>${esc(f.a)}</div></div></div>`).join('') : `<div class="empty">${ic('search', 30)}Sin resultados para tu búsqueda</div>`;
}
function viewFaq() {
  return `<div class="toolbar"><label class="search">${ic('search', 17)}<input data-search="faq" placeholder="Busca una pregunta…" value="${esc(S.search.faq)}"></label></div>
    <div class="faq" id="faqList">${faqHtml()}</div>
    <div class="faq-cta">${ic('headset', 30)}<div><b>¿No encuentras lo que buscas?</b><div class="muted" style="font-size:12.5px">Nuestro equipo te ayuda en minutos.</div></div><button class="btn btn-primary" data-act="support">Contactar soporte</button></div>`;
}

function setRow(title, sub, ctl) { return `<div class="set-row"><div><b>${esc(title)}</b><small>${esc(sub)}</small></div><div class="set-ctl">${ctl}</div></div>`; }
const sw = key => `<label class="switch"><input type="checkbox" data-set="${key}" ${S.settings[key] ? 'checked' : ''}><span></span></label>`;
function logsHtml() {
  return S.logs.length ? S.logs.map(l => `<div class="l-${esc(l.level || 'info')}"><time>${esc(l.time || '')}</time>${esc(l.text)}</div>`).join('') : '<div class="dim">Sin registros.</div>';
}
function viewAjustes() {
  const st = S.settings;
  return `
  <div class="card glass set-sec"><h4>${ic('gamepad', 18)} Juego</h4>
    ${setRow('Ruta de GTA San Andreas', 'Carpeta donde está instalado gta_sa.exe', `<input class="input" data-set="gamePath" value="${esc(st.gamePath)}" placeholder="C:\\Games\\GTA San Andreas"><button class="btn btn-ghost btn-sm" data-act="pick-path">${ic('folder', 15)}</button>`)}
    ${setRow('Nick por defecto', 'Se usará al conectarte (si está vacío, el de tu cuenta)', `<input class="input" data-set="nick" value="${esc(st.nick)}" placeholder="${esc(S.user ? S.user.username : 'Nombre_Apellido')}">`)}
    ${setRow('Límite de FPS', 'Valor de frame limiter', `<select class="select" data-set="fpsLimit">${['30', '60', '90', '120', '144', '0'].map(v => `<option value="${v}" ${String(st.fpsLimit) === v ? 'selected' : ''}>${v === '0' ? 'Sin límite' : v + ' FPS'}</option>`).join('')}</select>`)}
    ${setRow('Modo ventana', 'Ejecuta el juego en ventana', sw('windowed'))}
    ${setRow('Conectar automáticamente', 'Entra directo al servidor al abrir el juego', sw('autoConnect'))}
  </div>
  <div class="card glass set-sec"><h4>${ic('settings', 18)} Launcher</h4>
    ${setRow('Cerrar el launcher al jugar', 'Libera recursos mientras juegas', sw('closeOnPlay'))}
    ${setRow('Iniciar con Windows', 'Abre el launcher al encender el PC', sw('startWithWindows'))}
    ${setRow('Discord Rich Presence', 'Muestra en Discord que estás jugando', sw('discordRPC'))}
    ${setRow('Modo rendimiento', 'Desactiva desenfoques y partículas para PCs modestos', sw('perfMode'))}
    ${setRow('Partículas de fondo', 'Efecto de brasas animado', sw('particles'))}
    ${setRow('Reducir animaciones', 'Menos movimiento en la interfaz', sw('reduceMotion'))}
    ${setRow('Idioma', 'Idioma de la interfaz', `<select class="select" data-set="language"><option value="es" ${st.language === 'es' ? 'selected' : ''}>Español</option><option value="en" ${st.language === 'en' ? 'selected' : ''}>English</option><option value="pt" ${st.language === 'pt' ? 'selected' : ''}>Português</option></select>`)}
  </div>
  <div class="card glass set-sec"><h4>${ic('terminal', 18)} Soporte y diagnóstico</h4>
    <div class="diag" style="margin-top:10px">
      <button class="btn btn-ghost" data-act="diag" data-do="verifyFiles">${ic('shield', 16)} Verificar archivos</button>
      <button class="btn btn-ghost" data-act="diag" data-do="crashDetector">${ic('alert', 16)} Detector de crasheos</button>
      <button class="btn btn-ghost" data-act="diag" data-do="openFolder">${ic('folder', 16)} Abrir carpeta del juego</button>
      <button class="btn btn-soft" data-act="support">${ic('headset', 16)} Contactar soporte</button></div>
    <div class="logbox" id="logbox">${logsHtml()}</div>
    <div class="diag"><button class="btn btn-ghost btn-sm" data-act="copy-logs">${ic('copy', 14)} Copiar registros</button><button class="btn btn-ghost btn-sm" data-act="clear-logs">${ic('x', 14)} Limpiar</button></div>
  </div>
  <div class="save-bar"><button class="btn btn-ghost" data-act="reset-settings">Restablecer</button><button class="btn btn-primary" data-act="save-settings">${ic('check', 16)} Guardar cambios</button></div>`;
}

const RENDER = { perfil: viewPerfil, inicio: viewInicio, servidores: viewServidores, eventos: viewEventos, recompensas: viewRecompensas, tienda: viewTienda, novedades: viewNovedades, faq: viewFaq, ajustes: viewAjustes };

/* ------------------------------------------------------------------ shell */
function renderNav() {
  $('#nav').innerHTML = NAV_GROUPS.map(g => `<div class="nav-label">${g.label}</div>` + g.items.map(id => {
    const v = VIEWS[id];
    const badge = v.badge ? `<span class="nav-badge">${v.badge}</span>` : (id === 'recompensas' && S.rewards.canClaim ? '<span class="nav-badge num">!</span>' : '');
    return `<button class="nav-item ${S.view === id ? 'active' : ''}" data-act="nav" data-view="${id}"><i data-i="${v.icon}"></i><span>${v.label}</span>${badge}</button>`;
  }).join('')).join('');
  hydrate($('#nav'));
}
function renderUserMini() {
  const u = S.user; if (!u) return;
  const s = skinSrc(u);
  $('#userMini').innerHTML = `<span class="um-av">${s ? `<img src="${esc(s)}" alt="" data-fallback="mini">` : ic('user', 20)}</span><span class="um-info"><b>${esc(u.displayName)}</b><small>${u.vip.active ? esc(u.vip.name || 'VIP') : 'Nivel ' + esc(u.level)}</small></span>`;
}
function renderTopbar() {
  const u = S.user, m = VIEWS[S.view]; if (!u) return;
  let bar = $('#topbar');
  if (!bar) { bar = document.createElement('div'); bar.id = 'topbar'; bar.className = 'topbar'; $('#content').insertBefore(bar, $('#view')); }
  const un = unread();
  bar.innerHTML = `<div><h1>${esc(m.title)}</h1><p>${esc(m.sub)}</p></div>
    <div class="tb-right"><div class="wallet" title="Billetera">${ic('wallet', 16)}<b>${money(u.money)}</b></div><div class="wallet coins" title="${esc(S.config.coinsName)}">${ic('coin', 16)}<b>${fmt(u.coins)}</b></div>
    <div class="notif-wrap"><button class="icon-btn" data-act="notif-toggle" title="Notificaciones">${ic('bell', 18)}${un ? `<i class="badge">${un}</i>` : ''}</button><div class="notif-pop" id="notifPop"></div></div>
    <button class="btn btn-play" data-act="play-main">${ic('play', 14)} Jugar</button></div>`;
  renderNotifPop();
}
function renderNotifPop() {
  const pop = $('#notifPop'); if (!pop) return;
  pop.innerHTML = `<div class="np-head"><span>Notificaciones</span>${S.notifications.length ? '<a class="link" style="font-size:12px" data-act="notif-readall">Marcar leídas</a>' : ''}</div>` +
    (S.notifications.length ? S.notifications.map(n => `<div class="np-item ${n.read ? '' : 'unread'}"><span class="np-ic">${ic(n.icon || 'bell', 15)}</span><div>${esc(n.text)}<small>${esc(ago(n.time))}</small></div></div>`).join('') : '<div class="np-empty">Todo al día ✨</div>');
}
function renderSidebar() {
  $('#onlineCount').textContent = fmt(S.online.count);
  $('#onlineBar').style.width = (S.online.max ? clamp(S.online.count / S.online.max * 100, 0, 100) : 0) + '%';
  $('#tbOnline').textContent = `${fmt(S.online.count)} jugadores en línea`;
  $('#heroOnline').textContent = fmt(S.online.count);
  $('#heroServers').textContent = S.servers.length ? fmt(S.servers.length) : '—';
  $$('[data-online-main]').forEach(e => { const sv = mainServer(); if (sv && e.firstChild) e.firstChild.nodeValue = fmt(sv.players); });
}
function showView(id, opts = {}) {
  if (!RENDER[id]) id = 'perfil';
  if (!S.user) return;
  S.view = id;
  $$('.nav-item').forEach(n => n.classList.toggle('active', n.dataset.view === id));
  renderTopbar();
  const v = $('#view');
  const keep = opts.keepScroll ? v.scrollTop : 0;
  v.innerHTML = RENDER[id]();
  hydrate(v);
  v.scrollTop = keep;
  if (!opts.keepScroll) { v.classList.remove('in'); void v.offsetWidth; v.classList.add('in'); }
  tick();
  if (id === 'ajustes') { const lb = $('#logbox'); if (lb) lb.scrollTop = lb.scrollHeight; }
  call('viewChanged', { view: id });
}
function refreshAll() {
  if (!S.inApp || !S.user) return;
  renderNav(); renderUserMini(); renderSidebar(); showView(S.view, { keepScroll: true });
}

/* ------------------------------------------------------------------ tick (cuentas atrás) */
function tick() {
  const now = Date.now();
  $$('[data-cd]').forEach(el => {
    const left = Math.max(0, +el.dataset.cd - now), s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60, p = n => String(n).padStart(2, '0');
    const set = (k, v) => { const e = el.querySelector(`[data-p="${k}"]`); if (e && e.textContent !== v) e.textContent = v; };
    set('d', String(d)); set('h', p(h)); set('m', p(m)); set('s', p(sec));
    const card = el.closest('[data-vip-card]'); if (card) card.classList.toggle('expired', left === 0);
  });
  $$('[data-cd-text]').forEach(el => {
    const left = Math.max(0, +el.dataset.cdText - now), s = Math.floor(left / 1000);
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), sec = s % 60;
    el.textContent = d > 0 ? `${d}d ${h}h ${m}m` : h > 0 ? `${h}h ${m}m ${sec}s` : `${m}m ${sec}s`;
  });
  $$('[data-prog-start]').forEach(el => {
    const a = +el.dataset.progStart, b = +el.dataset.progEnd;
    el.style.width = clamp((b - now) / (b - a) * 100, 0, 100) + '%';
  });
  $$('[data-cd-left]').forEach(el => {
    const left = Math.max(0, +el.dataset.cdLeft - now), pct = Math.round(left / Math.max(1, +el.dataset.cdLeft - +el.dataset.start) * 100);
    el.textContent = pct + '% restante';
  });
  $$('[data-clock]').forEach(el => { el.textContent = fmtClock(+el.dataset.clock + (now - +el.dataset.at)); });
}
setInterval(tick, 1000);

/* ------------------------------------------------------------------ auth */
function authTab(tab) {
  ['login', 'register', 'forgot'].forEach(t => $(`[data-form="${t}"]`).classList.toggle('active', t === tab));
  $('#authTabs').dataset.tab = tab;
  $$('#authTabs .seg-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  $$('.form-error').forEach(e => e.classList.remove('show'));
}
function formError(form, msg, field) {
  const e = $('.form-error', form); e.textContent = msg; e.classList.add('show');
  if (field) { const f = field.closest('.field'); if (f) { f.classList.remove('err'); void f.offsetWidth; f.classList.add('err'); } field.focus(); }
}
function pwScore(p) {
  let s = 0; if (p.length >= 6) s++; if (p.length >= 10) s++; if (/[a-z]/.test(p) && /[A-Z]/.test(p)) s++; if (/\d/.test(p) && /[^\w]/.test(p)) s++;
  return p ? Math.max(1, s) : 0;
}
async function submitForm(form) {
  const type = form.dataset.form, fd = Object.fromEntries(new FormData(form).entries());
  const q = n => form.querySelector(`[name="${n}"]`);
  $$('.field', form).forEach(f => f.classList.remove('err')); $('.form-error', form).classList.remove('show');
  const emailOk = v => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v);
  let payload;
  if (type === 'login') {
    if (!fd.username.trim()) return formError(form, 'Ingresa tu nombre de usuario.', q('username'));
    if (!fd.password) return formError(form, 'Ingresa tu contraseña.', q('password'));
    payload = { username: fd.username.trim(), password: fd.password, remember: !!q('remember').checked };
  } else if (type === 'register') {
    if (!/^[A-Za-z0-9_\[\]().$@=]{3,24}$/.test(fd.username.trim())) return formError(form, 'El usuario debe tener 3-24 caracteres válidos (letras, números y _ [ ] ( ) . $ @ =).', q('username'));
    if (!emailOk(fd.email.trim())) return formError(form, 'Ingresa un correo electrónico válido.', q('email'));
    if (fd.password.length < 6) return formError(form, 'La contraseña debe tener al menos 6 caracteres.', q('password'));
    if (fd.password !== fd.confirm) return formError(form, 'Las contraseñas no coinciden.', q('confirm'));
    if (!q('terms').checked) return formError(form, 'Debes aceptar los términos y condiciones.');
    payload = { username: fd.username.trim(), email: fd.email.trim(), password: fd.password, referral: (fd.referral || '').trim() };
  } else {
    if (!emailOk(fd.email.trim())) return formError(form, 'Ingresa un correo electrónico válido.', q('email'));
    payload = { email: fd.email.trim() };
  }
  const btn = $('button[type=submit]', form);
  form.classList.add('loading'); btn.classList.add('loading'); btn.disabled = true;
  const res = await call(type, payload);
  form.classList.remove('loading'); btn.classList.remove('loading'); btn.disabled = false;
  if (!res.ok) return formError(form, res.message || 'No se pudo completar la solicitud.');
  if (type === 'login') {
    if (payload.remember) store.set('remember', { username: payload.username }); else store.set('remember', null);
    if (res.user) setUser(res.user);
    if (!S.user) return formError(form, 'Inicio de sesión correcto, pero tu handler no devolvió {user}.');
    enterApp();
  } else if (type === 'register') {
    if (res.user) { setUser(res.user); toast('¡Cuenta creada! Bienvenido.', 'success'); enterApp(); }
    else { toast(res.message || 'Cuenta creada. Ya puedes iniciar sesión.', 'success'); authTab('login'); $('#formLogin [name=username]').value = payload.username; $('#formLogin [name=password]').focus(); }
  } else { toast(res.message || 'Te enviamos un enlace de recuperación.', 'success'); authTab('login'); }
}

function enterApp() {
  S.inApp = true;
  $('#auth').classList.add('hidden'); $('#app').classList.remove('hidden');
  renderNav(); renderUserMini(); renderSidebar();
  showView(S.view || 'perfil');
  call('enteredApp', { user: S.user });
}
async function logout() {
  await call('logout', { user: S.user });
  S.inApp = false; S.user = null;
  $('#app').classList.add('hidden'); $('#auth').classList.remove('hidden');
  const tb = $('#topbar'); if (tb) tb.remove();
  authTab('login');
  const pw = $('#formLogin [name=password]'); if (pw) pw.value = '';
}

/* ------------------------------------------------------------------ lanzar juego */
const STEPS = ['Verificando archivos', 'Preparando el cliente', 'Conectando al servidor', 'Iniciando el juego'];
const launch = {
  open(sv) {
    const el = $('#launch');
    el.innerHTML = `<div class="launch-box"><div class="ring indet" id="lRing"><svg viewBox="0 0 150 150"><circle class="tr" cx="75" cy="75" r="65"/><circle class="fg" cx="75" cy="75" r="65"/></svg><b id="lPct"></b></div>
      <h3>${esc(sv.name)}</h3><div class="l-text" id="lText">Preparando…</div>
      <div class="l-steps">${STEPS.map((s, i) => `<div class="l-step" data-step="${i}"><i data-i="${i === 0 ? 'refresh' : 'check'}" data-size="16"></i>${s}</div>`).join('')}</div>
      <button class="btn btn-ghost" data-act="cancel-launch">Cancelar</button></div>`;
    el.classList.remove('hidden'); hydrate(el);
    this.update({ step: 0, text: 'Preparando…' });
  },
  update({ percent, text, step } = {}) {
    const el = $('#launch'); if (el.classList.contains('hidden')) return;
    if (typeof text === 'string') $('#lText').textContent = text;
    if (typeof percent === 'number') {
      const r = $('#lRing'); r.classList.remove('indet');
      $('.fg', r).style.strokeDashoffset = 408 - 408 * clamp(percent, 0, 100) / 100;
      $('#lPct').textContent = Math.round(clamp(percent, 0, 100)) + '%';
    }
    if (typeof step === 'number') $$('.l-step', el).forEach((s, i) => { s.classList.toggle('done', i < step); s.classList.toggle('cur', i === step); });
  },
  done(text = '¡Listo! Buena partida') {
    this.update({ percent: 100, text, step: STEPS.length });
    $$('.l-step').forEach(s => s.classList.add('done'));
    setTimeout(() => this.close(), 1500);
  },
  fail(msg) { this.close(); toast(msg || 'No se pudo iniciar el juego.', 'error', 5000); },
  close() { const el = $('#launch'); el.classList.add('hidden'); el.innerHTML = ''; S.launching = false; }
};
async function playServer(id) {
  if (S.launching) return;
  const sv = (id !== undefined && S.servers.find(s => String(s.id) === String(id))) || mainServer();
  if (!sv) return toast('No hay ningún servidor configurado.', 'error');
  S.launching = true; launch.open(sv);
  const res = await call('play', { server: sv, nick: S.settings.nick || (S.user && S.user.username), settings: Object.assign({}, S.settings), user: S.user });
  if (!S.launching) return;
  if (!res.ok) return launch.fail(res.message);
  launch.done(res.message);
}

/* ------------------------------------------------------------------ soporte */
function openSupport() {
  modal({
    title: 'Contactar soporte', body: `<p>Cuéntanos qué pasó y te respondemos lo antes posible.</p>
      <label>Categoría</label><select class="select" id="tkCat"><option>Problema técnico</option><option>Mi cuenta</option><option>Pagos y tienda</option><option>Reportar jugador</option><option>Otro</option></select>
      <label>Mensaje</label><textarea class="textarea" id="tkMsg" placeholder="Describe el problema con el mayor detalle posible…"></textarea>
      <label class="check" style="margin-top:12px"><input type="checkbox" id="tkLogs" checked><span class="box"><i data-i="check" data-size="12"></i></span> Adjuntar registros del launcher</label>`,
    actions: [{ label: 'Cancelar' }, {
      label: 'Enviar', cls: 'btn-primary', onClick: async () => {
        const msg = $('#tkMsg').value.trim();
        if (msg.length < 10) { toast('Escribe al menos 10 caracteres.', 'error'); return false; }
        const r = await call('submitTicket', { category: $('#tkCat').value, message: msg, logs: $('#tkLogs').checked ? S.logs.slice() : [] });
        if (r.notImplemented && S.config.discordUrl) { openExternal('discord'); return; }
        if (!r.ok) { toast(r.message || 'No se pudo enviar.', 'error'); return false; }
        toast(r.message || 'Ticket enviado. ¡Gracias!', 'success');
      }
    }]
  });
}
function openExternal(key) {
  const url = key === 'discord' ? S.config.discordUrl : key === 'terms' ? S.config.termsUrl : key === 'web' ? S.config.websiteUrl : key;
  if (!url) return toast('Enlace no configurado.', 'info');
  call('openExternal', { url }).then(r => { if (r.notImplemented) window.open(url, '_blank', 'noopener'); });
}
async function copyText(t, msg = 'Copiado al portapapeles') {
  try { await navigator.clipboard.writeText(t); }
  catch (_) { const ta = document.createElement('textarea'); ta.value = t; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch (e) {} ta.remove(); }
  toast(msg, 'success', 2200);
}

/* ------------------------------------------------------------------ ajustes */
function applySettings() {
  const st = S.settings;
  document.body.classList.toggle('perf', !!st.perfMode);
  document.body.classList.toggle('reduce-motion', !!st.reduceMotion);
  fx.enabled = !!st.particles && !st.perfMode && !st.reduceMotion;
}

/* ------------------------------------------------------------------ acciones (delegación) */
document.addEventListener('click', async e => {
  const t = e.target.closest('[data-act]');
  if (!t) { const pop = $('#notifPop'); if (pop && pop.classList.contains('open') && !e.target.closest('.notif-wrap')) pop.classList.remove('open'); return; }
  const a = t.dataset.act, d = t.dataset;
  if (a !== 'notif-toggle' && !e.target.closest('.notif-pop')) { const pop = $('#notifPop'); if (pop) pop.classList.remove('open'); }
  switch (a) {
    case 'win': call('window', { action: d.win }); break;
    case 'auth-tab': e.preventDefault(); authTab(d.tab); break;
    case 'toggle-pass': { const inp = t.parentElement.querySelector('input'); const show = inp.type === 'password'; inp.type = show ? 'text' : 'password'; t.innerHTML = ic(show ? 'eyeoff' : 'eye', 18); break; }
    case 'oauth': { const r = await call('oauth', { provider: d.provider }); if (r.ok && r.user) { setUser(r.user); enterApp(); } else toast(r.message || 'Inicio con ' + d.provider + ' no disponible.', 'info'); break; }
    case 'open-ext': e.preventDefault(); openExternal(d.url); break;
    case 'support': e.preventDefault(); openSupport(); break;
    case 'nav': if (d.filterSet) { const [g, v] = d.filterSet.split(':'); S.filters[g] = v; } showView(d.view); break;
    case 'logout': if (await confirmDlg('Cerrar sesión', '¿Seguro que quieres salir de tu cuenta?', 'Salir')) logout(); break;
    case 'play': playServer(d.id); break;
    case 'play-main': playServer(); break;
    case 'cancel-launch': S.launching = false; call('cancelLaunch', {}); launch.close(); toast('Lanzamiento cancelado', 'info'); break;
    case 'fav': {
      const id = String(d.id); S.favorites.has(id) ? S.favorites.delete(id) : S.favorites.add(id);
      store.set('favs', [...S.favorites]); call('favorite', { id, favorite: S.favorites.has(id) });
      $('#srvList').innerHTML = serverListHtml(); hydrate($('#srvList')); break;
    }
    case 'copy': copyText(d.copy); break;
    case 'filter': S.filters[d.group] = d.val; showView(S.view, { keepScroll: true }); break;
    case 'refresh': { t.classList.add('loading'); const r = await call('refresh', { view: S.view }); t.classList.remove('loading'); toast(r.notImplemented ? 'Lista actualizada' : (r.message || 'Datos actualizados'), 'success', 2200); break; }
    case 'notif-toggle': $('#notifPop').classList.toggle('open'); break;
    case 'notif-readall': { const r = await call('markNotificationsRead', {}); if (r.ok || r.notImplemented) { S.notifications.forEach(n => n.read = true); renderTopbar(); if (S.view === 'perfil') showView('perfil', { keepScroll: true }); } break; }
    case 'faq': { const it = t.closest('.faq-item'), body = $('.faq-a', it), open = !it.classList.contains('open'); $$('.faq-item.open').forEach(o => { o.classList.remove('open'); $('.faq-a', o).style.maxHeight = 0; }); if (open) { it.classList.add('open'); body.style.maxHeight = body.scrollHeight + 'px'; } break; }
    case 'news-open': { const n = S.news.find(x => String(x.id) === String(d.id)); if (!n) break; modal({ title: n.title, wide: true, body: `<p class="muted" style="margin-bottom:10px">${esc(fmtDate(n.date))}${n.tag ? ' · ' + esc(n.tag) : ''}</p><div style="color:var(--text);line-height:1.7;white-space:pre-line">${esc(n.body || n.summary || '')}</div>`, actions: [{ label: 'Cerrar', cls: 'btn-primary' }] }); break; }
    case 'claim-reward': {
      t.classList.add('loading'); const r = await call('claimReward', {}); t.classList.remove('loading');
      if (!r.ok) return toast(r.message || 'No se pudo reclamar.', 'error');
      if (r.user) setUser(r.user); if (r.rewards) setRewards(r.rewards); else { S.rewards.canClaim = false; }
      toast(r.message || '¡Premio reclamado!', 'success'); refreshAll(); break;
    }
    case 'claim-mission': {
      const r = await call('claimMission', { id: d.id }); if (!r.ok) return toast(r.message || 'No se pudo reclamar.', 'error');
      const m = S.missions.find(x => String(x.id) === String(d.id)); if (m) m.claimed = true; if (r.user) setUser(r.user);
      toast(r.message || 'Misión reclamada', 'success'); showView(S.view, { keepScroll: true }); break;
    }
    case 'buy': {
      const p = S.shop.find(x => String(x.id) === String(d.id)); if (!p) break;
      const cur = p.currency || 'coins';
      if (cur === 'usd' || p.url) { const r = await call('buyItem', { id: p.id, product: p }); if (r.notImplemented && p.url) openExternal(p.url); else if (!r.ok) toast(r.message || 'No se pudo iniciar la compra.', 'error'); break; }
      const bal = cur === 'money' ? S.user.money : S.user.coins;
      if (bal < p.price) return toast('Saldo insuficiente.', 'error');
      const priceTxt = cur === 'money' ? money(p.price) : fmt(p.price) + ' ' + S.config.coinsName;
      const ok = await confirmDlg('Confirmar compra', `<div class="modal-sum"><span>${esc(p.name)}</span><b>${priceTxt}</b></div><div class="modal-sum"><span>Saldo después</span><b>${cur === 'money' ? money(bal - p.price) : fmt(bal - p.price) + ' ' + esc(S.config.coinsName)}</b></div>`, 'Comprar');
      if (!ok) break;
      const r = await call('buyItem', { id: p.id, product: p });
      if (!r.ok) return toast(r.message || 'No se pudo completar la compra.', 'error');
      if (r.user) setUser(r.user); toast(r.message || '¡Compra realizada!', 'success'); refreshAll(); break;
    }
    case 'event': {
      const ev = S.events.find(x => String(x.id) === String(d.id)); if (!ev) break;
      if (d.do === 'play') { playServer(ev.serverId); break; }
      const r = await call('eventAction', { id: ev.id, action: d.do });
      if (!r.ok && !r.notImplemented) return toast(r.message || 'No se pudo completar la acción.', 'error');
      ev.joined = d.do === 'join'; if (typeof ev.participants === 'number') ev.participants += d.do === 'join' ? 1 : -1;
      toast(d.do === 'join' ? 'Te inscribiste al evento' : 'Inscripción cancelada', 'success'); showView('eventos', { keepScroll: true }); break;
    }
    case 'pick-path': { const r = await call('pickGamePath', {}); if (r.ok && r.path) { S.settings.gamePath = r.path; const i = $('[data-set="gamePath"]'); if (i) i.value = r.path; } else if (r.notImplemented) toast('Registra Launcher.on("pickGamePath") para abrir el selector de carpeta.', 'info', 4500); break; }
    case 'diag': { t.classList.add('loading'); t.disabled = true; Launcher.log('info', 'Ejecutando: ' + d.do); const r = await call(d.do, {}); t.classList.remove('loading'); t.disabled = false; Launcher.log(r.ok ? 'ok' : 'warn', r.message || (r.notImplemented ? 'Función no conectada: ' + d.do : 'Finalizado')); toast(r.message || (r.ok ? 'Listo' : 'No disponible'), r.ok ? 'success' : 'info'); break; }
    case 'copy-logs': copyText(S.logs.map(l => `[${l.time}] ${l.level?.toUpperCase()} ${l.text}`).join('\n'), 'Registros copiados'); break;
    case 'clear-logs': S.logs.length = 0; { const lb = $('#logbox'); if (lb) lb.innerHTML = logsHtml(); } break;
    case 'save-settings': { store.set('settings', S.settings); const r = await call('saveSettings', Object.assign({}, S.settings)); toast(r.ok || r.notImplemented ? 'Ajustes guardados' : (r.message || 'No se pudieron guardar'), r.ok || r.notImplemented ? 'success' : 'error'); break; }
    case 'reset-settings': S.settings = Object.assign({}, DEFAULT_SETTINGS); applySettings(); showView('ajustes', { keepScroll: true }); toast('Ajustes restablecidos (recuerda guardar)', 'info'); break;
  }
});

document.addEventListener('submit', e => { const f = e.target.closest('[data-form]'); if (f) { e.preventDefault(); submitForm(f); } });
document.addEventListener('input', e => {
  const t = e.target;
  if (t.matches('[data-search]')) {
    const k = t.dataset.search; S.search[k] = t.value;
    if (k === 'servers') { $('#srvList').innerHTML = serverListHtml(); hydrate($('#srvList')); }
    if (k === 'faq') { $('#faqList').innerHTML = faqHtml(); hydrate($('#faqList')); }
  }
  if (t.matches('#formRegister [name=password]')) { const sc = pwScore(t.value), el = $('#pwStrength'); el.dataset.s = sc; $('em', el).textContent = ['Seguridad de la contraseña', 'Débil', 'Aceptable', 'Buena', 'Excelente'][sc]; }
  if (t.matches('.field input')) t.closest('.field').classList.remove('err');
  if (t.matches('input.input[data-set]')) S.settings[t.dataset.set] = t.value;
});
document.addEventListener('change', e => {
  const t = e.target;
  if (!t.matches('[data-set]')) return;
  const k = t.dataset.set;
  S.settings[k] = t.type === 'checkbox' ? t.checked : t.value;
  applySettings();
  if (k === 'language') call('language', { language: t.value });
});
document.addEventListener('error', e => {
  const t = e.target;
  if (t.tagName === 'IMG' && t.dataset.fallback === 'skin') t.outerHTML = SKIN_FALLBACK;
  if (t.tagName === 'IMG' && t.dataset.fallback === 'mini') t.outerHTML = ic('user', 20);
}, true);
document.addEventListener('contextmenu', e => { if (!e.target.closest('input,textarea,.logbox')) e.preventDefault(); });
document.addEventListener('dragstart', e => e.preventDefault());
$('#langSelect').addEventListener('change', e => { S.settings.language = e.target.value; store.set('settings', S.settings); call('language', { language: e.target.value }); });

/* ------------------------------------------------------------------ partículas */
const fx = {
  enabled: true, cv: $('#fx'), ps: [],
  init() {
    const cv = this.cv, ctx = cv.getContext && cv.getContext('2d'); this.ctx = ctx;
    if (!ctx) return;
    const rs = () => { cv.width = innerWidth; cv.height = innerHeight; }; rs(); addEventListener('resize', rs);
    for (let i = 0; i < 46; i++) this.ps.push(this.mk(true));
    const loop = () => {
      requestAnimationFrame(loop);
      ctx.clearRect(0, 0, cv.width, cv.height);
      if (!this.enabled || document.hidden) return;
      for (const p of this.ps) {
        p.y -= p.v; p.x += Math.sin((p.y + p.o) / 60) * .25; p.l -= .0016;
        if (p.y < -10 || p.l <= 0) Object.assign(p, this.mk(false));
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = `rgba(${p.g ? '255,120,100' : '207,69,67'},${clamp(p.l, 0, 1) * p.a})`;
        ctx.shadowColor = 'rgba(207,69,67,.9)'; ctx.shadowBlur = 10; ctx.fill();
      }
    };
    loop();
  },
  mk(rand) { return { x: Math.random() * innerWidth, y: rand ? Math.random() * innerHeight : innerHeight + 10, r: Math.random() * 1.8 + .5, v: Math.random() * .5 + .15, a: Math.random() * .6 + .2, l: Math.random() * .8 + .2, o: Math.random() * 100, g: Math.random() > .7 }; }
};

/* ------------------------------------------------------------------ API pública */
function setUser(u) { S.user = normUser(u); if (S.inApp) refreshAll(); return Launcher; }
function setRewards(r) { S.rewards = Object.assign({ streak: 0, canClaim: false, days: [] }, r || {}); if (S.inApp) { renderNav(); if (['recompensas', 'inicio'].includes(S.view)) showView(S.view, { keepScroll: true }); } return Launcher; }
const setList = (key, view) => arr => { S[key] = Array.isArray(arr) ? arr : []; if (S.inApp) { renderSidebar(); if (!view || view.includes(S.view)) showView(S.view, { keepScroll: true }); } return Launcher; };

const Launcher = {
  version: '1.0.0',
  state: S,
  on(name, fn) { handlers[name] = fn; return Launcher; },
  off(name) { delete handlers[name]; return Launcher; },
  configure(cfg) { Object.assign(S.config, cfg || {}); applyConfig(); return Launcher; },
  setUser,
  patchUser(p) { return setUser(Object.assign({}, S.user || {}, p)); },
  enter(user) { if (user) setUser(user); if (!S.user) throw new Error('Launcher.enter necesita un usuario'); enterApp(); return Launcher; },
  logout,
  setOnline(count, max) { S.online = { count: num(count), max: num(max) || S.online.max }; renderSidebar(); return Launcher; },
  setServers: setList('servers', ['inicio', 'servidores', 'perfil']),
  setEvents: setList('events', ['inicio', 'eventos']),
  setNews: setList('news', ['inicio', 'novedades']),
  setChangelog: setList('changelog', ['novedades']),
  setFaq: setList('faq', ['faq']),
  setMissions: setList('missions', ['recompensas']),
  setShop: setList('shop', ['tienda']),
  setRewards,
  setNotifications(arr) { S.notifications = Array.isArray(arr) ? arr : []; if (S.inApp) { renderTopbar(); if (S.view === 'perfil') showView('perfil', { keepScroll: true }); } return Launcher; },
  setSettings(obj) { Object.assign(S.settings, obj || {}); applySettings(); if (S.view === 'ajustes' && S.inApp) showView('ajustes', { keepScroll: true }); return Launcher; },
  updateServer(id, patch) { const s = S.servers.find(x => String(x.id) === String(id)); if (s) { Object.assign(s, patch); if (S.inApp) { renderSidebar(); if (['servidores'].includes(S.view)) { const l = $('#srvList'); if (l) { l.innerHTML = serverListHtml(); hydrate(l); } } } } return Launcher; },
  log(level, text) { const p = n => String(n).padStart(2, '0'), d = new Date(); S.logs.push({ level, text: String(text), time: `${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}` }); if (S.logs.length > 500) S.logs.shift(); const lb = $('#logbox'); if (lb) { lb.innerHTML = logsHtml(); lb.scrollTop = lb.scrollHeight; } return Launcher; },
  showView, toast, modal, launch,
  prefill(username) { const i = $('#formLogin [name=username]'); if (i) i.value = username || ''; return Launcher; }
};
window.Launcher = Launcher;

/* ------------------------------------------------------------------ init */
hydrate();
applyConfig();
applySettings();
fx.init();
{
  const r = store.get('remember', null);
  if (r && r.username) Launcher.prefill(r.username);
  const ps = $('#langSelect'); if (ps) ps.value = S.settings.language || 'es';
}
})();
