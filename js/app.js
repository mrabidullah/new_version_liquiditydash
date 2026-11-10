/* Shared shell for every portal page: one sidebar, one top bar, four roles.
   Pages call App.mount({...}). Sample state is kept in localStorage (per browser) so flows can be clicked through. */
(function () {
  var D = window.DBT_DATA;
  var mem = {};

  /* ---------- storage ---------- */
  var store = {
    get: function (k, seed) {
      try { var v = localStorage.getItem('dbt-' + k); if (v !== null) return JSON.parse(v); } catch (e) { if (k in mem) return mem[k]; }
      return seed === undefined ? undefined : JSON.parse(JSON.stringify(seed));
    },
    set: function (k, v) { try { localStorage.setItem('dbt-' + k, JSON.stringify(v)); } catch (e) { mem[k] = v; } },
    reset: function () { try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf('dbt-') === 0 && k !== 'dbt-theme-v2') localStorage.removeItem(k); }); } catch (e) {} mem = {}; }
  };

  /* ---------- roles and menus ---------- */
  var ROLES = {
    client: { pid: 'p3', label: 'Client', name: 'Aisha Khan', email: 'aisha.khan@gmail.com', companies: ['c1'], owner: true, tenant: 'aisha.khan@gmail.com', home: 'dashboard.html', homeName: 'Overview', area: 'Client workspace', member: { name: 'Mia Fischer', email: 'mia.fischer@company1.example', companies: ['c1'] } },
    multi: { pid: 'p8', label: 'Multi-company client', name: 'Diego Alvarez', email: 'diego@acme.co', companies: ['c1', 'c2', 'elite'], owner: true, tenant: 'diego@acme.co', home: 'companies.html', homeName: 'Companies', area: 'Client workspace', member: { name: 'Priya Shah', email: 'priya.shah@acme.co', companies: ['c2', 'elite'] } },
    guest: { pid: 'p6', label: 'Guest', name: 'Jordan Lee', email: 'jordan@example.com', companies: ['c1'], owner: false, tenant: 'aisha.khan@gmail.com', home: 'dashboard.html', homeName: 'Overview', area: 'Guest access' },
    admin: { pid: 'p1', label: 'Admin', name: 'Khan Abid', email: 'khan@gmail.com', companies: [], owner: true, home: 'admin.html', homeName: 'Admin overview', area: 'Admin' }
  };
  var CLIENT_NAV = [['dashboard.html', 'Overview'], ['market.html', 'Market activity'], ['trades.html', 'Trade history'], ['comparison.html', 'Peer comparison'], ['reports.html', 'Reports'], ['accounting.html', 'Statements'], ['subscription.html', 'Subscription'], ['company.html', 'Company profile'], ['team.html', 'Team'], ['tickets.html', 'Support']];
  var NAV = {
    client: CLIENT_NAV,
    multi: [['companies.html', 'Companies']].concat(CLIENT_NAV),
    guest: [['dashboard.html', 'Overview'], ['market.html', 'Market activity'], ['trades.html', 'Trade history'], ['comparison.html', 'Peer comparison'], ['reports.html', 'Reports'], ['company.html', 'Company profile']],
    admin: [['admin.html', 'Admin overview'], ['companies.html', 'Companies'], ['signup-links.html', 'Client sign-up links'], ['access-requests.html', 'Access requests'], ['profile-reviews.html', 'Profile reviews'], ['users.html', 'Users'], ['admin-subscriptions.html', 'Subscriptions'], ['data-health.html', 'Data health'], ['access-log.html', 'Access log'], ['tickets.html', 'Support tickets'], ['wireframes.html', 'Screen map']]
  };

  function defaultSession(role) {
    var r = ROLES[role];
    return { role: role, name: r.name, email: r.email, companies: r.companies.slice(), owner: r.owner, tenant: r.tenant };
  }
  function session() {
    var s = store.get('session');
    if (!s || !ROLES[s.role]) { s = defaultSession('client'); store.set('session', s); }
    return s;
  }
  function login(role) {
    var pid = ROLES[role].pid, p = pid && store.get('people', D.PEOPLE).filter(function (x) { return x.id === pid; })[0];
    if (p) { store.set('session', { role: role, name: p.name, email: p.email, companies: (p.companies || []).slice(), owner: !!p.owner, tenant: p.tenant }); }
    else store.set('session', defaultSession(role));
    store.set('company', null); return ROLES[role].home;
  }
  function setSession(s) { store.set('session', s); store.set('company', null); }

  /* ---------- helpers ---------- */
  function esc(v) { return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function num(n) { return Number(n).toLocaleString('en-GB'); }
  function badge(cls, text) { return '<span class="bd ' + cls + '">' + esc(text) + '</span>'; }
  function chips(ids) {
    if (!ids || !ids.length) return '<span class="text-cap">&mdash;</span>';
    return '<span class="chip-list">' + ids.map(function (i) { var n = (D.COMPANIES[i] || { name: i }).name; return '<span class="chip" title="' + esc(n) + '">' + esc(n) + '</span>'; }).join('') + '</span>';
  }
  function logo(size) { size = size || 28; return '<svg width="' + size + '" height="' + size + '" viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path d="M16 3 30 29H2z" fill="#F2B705"/><path d="M16 12 21.5 23h-11z" fill="#0A1220"/></svg><span class="text-sm font-semibold tracking-widest">DELTABLOCK</span>'; }
  function today() { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date()); }
  function addDays(n) { var d = new Date(); d.setDate(d.getDate() + n); return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(d); }
  function token(prefix) { return (prefix || 't') + '-' + Math.random().toString(36).slice(2, 8); }
  function absUrl(rel) { try { return new URL(rel, location.href).href; } catch (e) { return rel; } }
  function qs(name) { return new URLSearchParams(location.search).get(name); }
  function typeLabel(p) { return p.type === 'admin' ? 'Admin' : p.type === 'guest' ? 'Guest' : p.type === 'colleague' ? 'Client · colleague' : (p.owner ? 'Client · account owner' : 'Client'); }
  function daysUntil(iso) { return Math.round((Date.parse(iso) - Date.parse(D.TODAY)) / 86400000); }
  function pending() { return store.get('requests', D.REQUESTS).filter(function (r) { return r.status === 'pending'; }).length; }
  function profilePending() { return (store.get('profile-reviews', []) || []).filter(function (r) { return r.status === 'pending'; }).length; }

  /* Deterministic sample series per company so every page agrees: price, volume, spread. */
  function rng(seed) { var x = seed >>> 0; return function () { x = (x * 1664525 + 1013904223) >>> 0; return x / 4294967296; }; }
  function seedOf(id) { var h = 7; for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0; return h; }
  function series(id, n, salt) {
    var c = D.COMPANIES[id], r = rng(seedOf(id) + (salt || 0)), p = c.price * 0.93, out = [];
    for (var i = 0; i < n; i++) { p += (r() - 0.46) * c.price * 0.03; p = Math.max(c.price * 0.75, Math.min(c.price * 1.18, p)); out.push({ p: p, v: c.vol30 / 30 * (0.35 + r() * 1.3), s: c.spread30 * (0.8 + r() * 0.45) }); }
    var k = c.price / out[n - 1].p; out.forEach(function (x) { x.p *= k; });
    return out;
  }
  function fmtDate(iso) { return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(iso + 'T00:00:00Z')); }
  function addIso(iso, n) { var d = new Date(iso + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + n); return d.toISOString().slice(0, 10); }

  /* Peer position of a company against an anonymised peer group (30-day figures). */
  var MEASURES = [['Average daily volume', 'shares', 'vol'], ['Average spread', 'bps', 'spr'], ['Time at minimum spread', '%', 'tim'], ['Market turnover', '%', 'turn']];
  function fmtM(i, v) { return i === 0 ? num(v) : i === 1 ? Number(v).toFixed(1) : i === 2 ? Number(v).toFixed(1) + '%' : Number(v).toFixed(2) + '%'; }
  function position(id, g) {
    var k = D.KPI[id]['30d'];
    return MEASURES.map(function (m, i) {
      var v = k[m[2]], med = g.median[i], d = (v - med) / med, st;
      if (Math.abs(d) < 0.1) st = ['inf', 'Near median'];
      else { var up = d > 0; st = [(i === 1 ? !up : up) ? 'ok' : 'warn', up ? 'Above median' : 'Below median']; }
      return { label: m[0], unit: m[1], value: fmtM(i, v), median: fmtM(i, med), range: g.range[i], state: st };
    });
  }
  function spark(vals) {
    var w = 70, h = 24, mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals), rg = (mx - mn) || 1;
    return '<svg viewBox="0 0 70 24" class="h-6 w-16" aria-hidden="true"><path d="' + vals.map(function (v, i) { return (i ? 'L' : 'M') + (i * w / (vals.length - 1)).toFixed(1) + ',' + (h - 2 - (v - mn) / rg * (h - 4)).toFixed(1); }).join('') + '" fill="none" stroke-width="1.6" class="c-spark"/></svg>';
  }

  function copy(text) {
    var done = function () { toast('Link copied'); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, function () { window.prompt('Copy this link', text); });
    else window.prompt('Copy this link', text);
  }

  var toastTimer;
  function toast(msg, kind) {
    var t = document.getElementById('toast'); if (!t) return;
    t.innerHTML = '<span class="bd ' + (kind === 'err' ? 'bad' : 'ok') + '">' + (kind === 'err' ? 'Check' : 'Done') + '</span>' + esc(msg);
    t.classList.add('show'); clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, kind === 'err' ? 6000 : 3600);
  }
  function openModal(id) { var m = document.getElementById(id); if (m) { m.classList.add('open'); var f = m.querySelector('input,select,textarea'); if (f) setTimeout(function () { f.focus(); }, 30); } }
  function closeModals() { document.querySelectorAll('.modal.open').forEach(function (m) { m.classList.remove('open'); }); }
  document.addEventListener('click', function (e) {
    var o = e.target.closest && e.target.closest('[data-open]');
    if (o) { e.preventDefault(); openModal(o.getAttribute('data-open')); return; }
    var c = e.target.closest && e.target.closest('[data-close]');
    if (c) { e.preventDefault(); closeModals(); return; }
    if (e.target.classList && e.target.classList.contains('modal')) closeModals();
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModals(); });

  /* ---------- schema normalisation (additive; never resets or overwrites saved prototype data) ---------- */
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  function lc(v) { return String(v == null ? '' : v).trim().toLowerCase(); }
  function uniq(a) { return (a || []).filter(function (x, i, arr) { return arr.indexOf(x) === i; }); }
  function isoLocal(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); }
  function isoOf(label) { var t = Date.parse(label); return isNaN(t) ? null : isoLocal(new Date(t)); }
  function todayIso() { return isoLocal(new Date()); }
  function rand(n) { return Math.random().toString(36).slice(2, 2 + (n || 6)); }

  function normPerson(p) {
    p.companies = Array.isArray(p.companies) ? p.companies : [];
    if (p.type === 'admin' || p.type === 'guest') p.manages = [];
    else {
      if (!Array.isArray(p.manages)) {
        p.manages = (p.type === 'client' && p.owner) ? p.companies.slice() : [];
        if (p.id === 'p9' && lc(p.email) === 'priya.shah@acme.co' && p.companies.indexOf('c2') >= 0) p.manages = ['c2'];
      }
      p.manages = p.manages.filter(function (c) { return p.companies.indexOf(c) >= 0; });
    }
    return p;
  }
  function normLink(l) {
    l.companies = Array.isArray(l.companies) ? l.companies : [];
    if (!l.expiresIso) l.expiresIso = isoOf(l.expires);
    if (!l.createdIso) l.createdIso = isoOf(l.created);
    if (l.status === 'used') { if (l.email && !l.usedBy) l.usedBy = l.email; if (l.name && !l.usedByName) l.usedByName = l.name; }
    delete l.name; delete l.email; /* links are company-based: no reserved person */
    return l;
  }

  /* Companies created by an admin and approved profile edits are layered over the sample companies. */
  (function mergeCompanies() {
    (store.get('companies-extra', []) || []).forEach(function (c) { if (c && c.id && !D.COMPANIES[c.id]) { D.COMPANIES[c.id] = c; D.ORDER.push(c.id); } });
    var ov = store.get('profile-approved', {}) || {};
    Object.keys(ov).forEach(function (id) { if (D.COMPANIES[id]) Object.keys(ov[id]).forEach(function (k) { D.COMPANIES[id][k] = ov[id][k]; }); });
  })();

  /* One-time migration of data saved by earlier versions. Only touches keys that already exist. */
  (function migrate() {
    var SCHEMA = 3;
    if (store.get('schema', 0) >= SCHEMA) return;
    var raw = function (k) { try { var v = localStorage.getItem('dbt-' + k); return v === null ? undefined : JSON.parse(v); } catch (e) { return undefined; } };
    try {
      var pl = raw('people'); if (pl) store.set('people', pl.map(normPerson));
      var ll = raw('links'); if (ll) store.set('links', ll.map(normLink));
      /* Old single "profile-<id>" pending edit becomes a proper review record. */
      var reviews = raw('profile-reviews') || [], changed = false;
      D.ORDER.forEach(function (id) {
        var old = raw('profile-' + id);
        if (old && old.vals) {
          var ch = {}, co = D.COMPANIES[id];
          Object.keys(old.vals).forEach(function (k) { if (String(old.vals[k]) !== String(co[k] == null ? '' : co[k])) ch[k] = { from: co[k] == null ? '' : co[k], to: old.vals[k] }; });
          if (Object.keys(ch).length) reviews.push({ id: 'PR' + (100 + reviews.length + 1), company: id, status: 'pending', submittedLabel: old.at || today(), submittedAt: new Date().toISOString(), by: { name: 'Client user', email: '' }, changes: ch });
          changed = true;
        }
        if (old !== undefined) { try { localStorage.removeItem('dbt-profile-' + id); } catch (e) {} }
      });
      if (changed) store.set('profile-reviews', reviews);
    } catch (e) { return; }
    store.set('schema', SCHEMA);
  })();

  /* ---------- identity and permissions (single source of truth: the people list) ---------- */
  function people() { return store.get('people', D.PEOPLE).map(normPerson); }
  function savePeople(p) { store.set('people', p); }
  function links() { return store.get('links', D.LINKS).map(normLink); }
  function personByEmail(email, list) { var e = lc(email); return (list || people()).filter(function (p) { return lc(p.email) === e; })[0]; }
  function roleOf(p) { return p.type === 'admin' ? 'admin' : p.type === 'guest' ? 'guest' : (p.companies.length > 1 ? 'multi' : 'client'); }

  /* Who is signed in right now. Company access and manager rights are always read from the people list, never from the cached session. */
  function resolve(s) {
    var p = personByEmail(s.email), r = { role: s.role, name: s.name, email: s.email, companies: (s.companies || []).slice(), manages: [], owner: s.owner !== false, person: p || null };
    if (p) {
      r.name = p.name; r.role = roleOf(p); r.owner = !!p.owner;
      r.companies = p.type === 'admin' ? [] : p.companies.slice(); r.manages = p.type === 'admin' ? [] : p.manages.slice();
    } else if (s.role === 'guest') r.manages = [];
    r.companies = r.companies.filter(function (id) { return !!D.COMPANIES[id]; });
    if (r.role === 'admin') { r.allowed = D.ORDER.slice(); r.manages = D.ORDER.slice(); }
    else { r.allowed = r.companies.slice(); r.manages = r.manages.filter(function (id) { return r.allowed.indexOf(id) >= 0; }); if (r.role === 'guest') r.manages = []; }
    if (!ROLES[r.role]) r.role = 'client';
    return r;
  }
  function me() { return resolve(session()); }
  var can = {
    me: me,
    admin: function () { return me().role === 'admin'; },
    view: function (id) { return !!D.COMPANIES[id] && me().allowed.indexOf(id) >= 0; },
    manage: function (id) { var m = me(); return !!D.COMPANIES[id] && m.role !== 'guest' && m.manages.indexOf(id) >= 0; },
    editProfile: function (id) { var m = me(); return !!D.COMPANIES[id] && m.role !== 'admin' && m.role !== 'guest' && m.manages.indexOf(id) >= 0; },
    page: function (roles) { return !roles || roles.indexOf(me().role) >= 0; }
  };
  function fail(msg) { return { ok: false, error: msg }; }
  function good(extra) { var r = { ok: true }; for (var k in extra) r[k] = extra[k]; return r; }
  function newId(prefix, list) { var n = 0; list.forEach(function (x) { var m = String(x.id).match(/(\d+)$/); if (m) n = Math.max(n, +m[1]); }); return prefix + (n + 1); }

  function setSessionFor(p) {
    var role = roleOf(p);
    setSession({ role: role, name: p.name, email: p.email, companies: p.companies.slice(), owner: !!p.owner, tenant: p.tenant });
    return ROLES[role].home;
  }
  /* Prototype sign-in by email (no password is checked or stored). Only active accounts can sign in. */
  function loginEmail(email) {
    var p = personByEmail(email);
    if (!p) return fail('No account uses that email address. Ask your administrator, or request access.');
    if (p.status !== 'active') return fail('That account has not been set up yet. Open the invitation link you were given.');
    return good({ home: setSessionFor(p) });
  }
  function switchCompany(id) {
    if (!can.view(id)) return false;
    store.set('company', id); return true;
  }

  /* ---------- company-based sign-up links ---------- */
  function linkState(l) {
    if (l.status === 'used') return 'used';
    if (l.status === 'expired') return 'expired';
    if (l.expiresIso && l.expiresIso < todayIso()) return 'expired';
    return 'unused';
  }
  function matchCompany(text) {
    var t = lc(text).replace(/\s+/g, ' ');
    if (!t) return null;
    var hit = D.ORDER.filter(function (id) { var c = D.COMPANIES[id]; return [c.name, c.legal, c.code].some(function (v) { return lc(v).replace(/\s+/g, ' ') === t; }); })[0];
    return hit || null;
  }
  function createLink(companies, days) {
    if (!can.admin()) return fail('Only administrators can create sign-up links.');
    var cos = uniq(companies || []).filter(function (id) { return !!D.COMPANIES[id]; });
    if (!cos.length) return fail('Choose at least one company.');
    days = +days; if (!(days >= 1 && days <= 90)) return fail('Choose how long the link stays valid.');
    var ls = links(), tk; do { tk = 'lnk-' + rand(6); } while (ls.some(function (l) { return l.token === tk; }));
    var d = new Date(); d.setDate(d.getDate() + days);
    var l = { id: newId('L', ls), token: tk, companies: cos, created: today(), createdIso: todayIso(), expires: addDays(days), expiresIso: isoLocal(d), status: 'unused', createdBy: me().email };
    ls.unshift(l); store.set('links', ls); return good({ link: l });
  }
  function revokeLink(id) {
    if (!can.admin()) return fail('Only administrators can revoke links.');
    var ls = links(), l = ls.filter(function (x) { return x.id === id; })[0];
    if (!l) return fail('Link not found.');
    if (linkState(l) !== 'unused') return fail('Only unused links can be revoked.');
    l.status = 'expired'; l.revokedOn = today(); store.set('links', ls); return good({});
  }
  var DUP_MSG = 'An account with this email address already exists. Please log in to continue. If you need access to another company, contact your administrator.';
  function validatePassword(pw, pw2) {
    if (!pw || pw.length < 12) return 'Use at least 12 characters for the password.';
    if (pw !== pw2) return 'The two passwords do not match.';
    return '';
  }
  function registerFromLink(tokenValue, d) {
    var ls = links(), l = ls.filter(function (x) { return x.token === tokenValue; })[0];
    if (!tokenValue || !l) return { ok: false, code: 'invalid', error: 'This sign-up link is not valid.' };
    var st = linkState(l);
    if (st === 'used') return { ok: false, code: 'used', error: 'This link was already used.' };
    if (st === 'expired') return { ok: false, code: 'expired', error: 'This link has expired.' };
    var name = String(d.name || '').trim().replace(/\s+/g, ' '), email = String(d.email || '').trim();
    if (name.length < 2) return { ok: false, code: 'field', field: 'name', error: 'Enter your name.' };
    if (!EMAIL_RE.test(email)) return { ok: false, code: 'field', field: 'email', error: 'Enter a valid email address.' };
    var pe = validatePassword(d.password, d.confirm);
    if (pe) return { ok: false, code: 'field', field: 'password', error: pe };
    var pl = people();
    if (personByEmail(email, pl)) return { ok: false, code: 'duplicate', error: DUP_MSG };
    var cos = l.companies.filter(function (id) { return !!D.COMPANIES[id]; });
    if (!cos.length) return { ok: false, code: 'invalid', error: 'The companies for this link no longer exist. Ask your administrator for a new link.' };
    var p = { id: 'p' + Date.now().toString(36) + rand(3), name: name, email: email, type: 'client', owner: true, companies: cos.slice(), manages: cos.slice(), tenant: email, status: 'active', via: 'Sign-up link', linkId: l.id };
    pl.push(p); savePeople(pl);
    l.status = 'used'; l.usedOn = today(); l.usedBy = email; l.usedByName = name; store.set('links', ls);
    return good({ person: p, home: setSessionFor(p) });
  }
  /* Team and admin invitations (a person record already exists, status "pending"). */
  function inviteByToken(t) { return people().filter(function (p) { return p.token === t && p.status === 'pending' && (p.type === 'colleague' || p.type === 'admin' || p.type === 'guest'); })[0]; }
  function acceptInvite(t, d) {
    var pl = people(), p = pl.filter(function (x) { return x.token === t && x.status === 'pending'; })[0];
    if (!p) return { ok: false, code: 'invalid', error: 'This invitation is not valid or was already used.' };
    var name = String(d.name || '').trim().replace(/\s+/g, ' ');
    if (name.length < 2) return { ok: false, code: 'field', error: 'Enter your name.' };
    var pe = validatePassword(d.password, d.confirm);
    if (pe) return { ok: false, code: 'field', error: pe };
    p.name = name; p.status = 'active'; delete p.token; savePeople(pl);
    return good({ person: p, home: setSessionFor(p) });
  }

  /* ---------- Team (company-based) ---------- */
  function teamOf(companyId) {
    return people().filter(function (p) {
      return p.type !== 'admin' && p.companies.indexOf(companyId) >= 0 && (p.status === 'active' || (p.status === 'pending' && p.via === 'Team invite'));
    }).sort(function (a, b) { return (b.manages.indexOf(companyId) >= 0) - (a.manages.indexOf(companyId) >= 0) || a.name.localeCompare(b.name); });
  }
  function managersOf(companyId) { return people().filter(function (p) { return p.type !== 'admin' && p.status === 'active' && p.manages.indexOf(companyId) >= 0; }); }
  function scopeOf(m) { return m.role === 'admin' ? D.ORDER.slice() : m.manages.slice(); }
  function inviteMember(d) {
    var m = me();
    if (m.role === 'guest') return fail('Guests have read-only access.');
    var email = String(d.email || '').trim();
    if (!EMAIL_RE.test(email)) return fail('Enter a valid email address.');
    var cos = uniq(d.companies || []);
    if (!cos.length) return fail('Choose at least one company.');
    for (var i = 0; i < cos.length; i++) if (!can.manage(cos[i])) return fail('You can only invite people to companies whose Team you manage.');
    var pl = people();
    if (personByEmail(email, pl)) return fail('That email already has an account or an invitation. An administrator can add company access from Users → Edit access.');
    var type = d.type === 'guest' ? 'guest' : 'colleague', name = String(d.name || '').trim() || email.split('@')[0];
    var p = { id: 'p' + Date.now().toString(36) + rand(3), name: name, email: email, type: type, companies: cos, manages: [], tenant: (m.person && m.person.tenant) || m.email, status: 'pending', via: 'Team invite', invitedBy: m.name, invitedByEmail: m.email, token: type + '-' + rand(8) };
    pl.push(p); savePeople(pl); return good({ person: p });
  }
  function memberGuard(p, m) {
    if (!p || p.type === 'admin') return 'That person cannot be changed here.';
    if (lc(p.email) === lc(m.email)) return 'You cannot change your own access.';
    var scope = scopeOf(m);
    if (!p.companies.some(function (c) { return scope.indexOf(c) >= 0; })) return 'That person is not on a company you manage.';
    if (m.role !== 'admin' && p.manages.some(function (c) { return scope.indexOf(c) >= 0; })) return 'Only an administrator can change a company manager’s access.';
    return '';
  }
  function updateMemberAccess(personId, selected) {
    var m = me(), pl = people(), p = pl.filter(function (x) { return x.id === personId; })[0], g = memberGuard(p, m);
    if (g) return fail(g);
    selected = uniq(selected || []);
    for (var i = 0; i < selected.length; i++) if (!can.manage(selected[i])) return fail('You can only change access for companies you manage.');
    var scope = scopeOf(m), keep = p.companies.filter(function (c) { return scope.indexOf(c) < 0; }), next = keep.concat(selected);
    if (!next.length) return fail('Keep at least one company, or use Remove to take away all access.');
    p.companies = next; p.manages = p.manages.filter(function (c) { return next.indexOf(c) >= 0; });
    savePeople(pl); return good({});
  }
  function removeMember(personId, companyId) {
    var m = me(), pl = people(), p = pl.filter(function (x) { return x.id === personId; })[0], g = memberGuard(p, m);
    if (g) return fail(g);
    if (companyId && !can.manage(companyId)) return fail('You can only remove people from companies you manage.');
    var scope = companyId ? [companyId] : scopeOf(m);
    p.companies = p.companies.filter(function (c) { return scope.indexOf(c) < 0; });
    p.manages = p.manages.filter(function (c) { return p.companies.indexOf(c) >= 0; });
    if (!p.companies.length) pl = pl.filter(function (x) { return x.id !== personId; });
    savePeople(pl); return good({ deleted: !p.companies.length });
  }
  /* Administrators only: set company access and per-company manager rights for any non-admin. */
  function setAccessAdmin(personId, companies, manages) {
    if (!can.admin()) return fail('Only administrators can change company access here.');
    var pl = people(), p = pl.filter(function (x) { return x.id === personId; })[0];
    if (!p || p.type === 'admin') return fail('That person cannot be changed here.');
    var cos = uniq(companies || []).filter(function (id) { return !!D.COMPANIES[id]; });
    if (!cos.length) return fail('Choose at least one company.');
    p.companies = cos; p.manages = p.type === 'guest' ? [] : uniq(manages || []).filter(function (c) { return cos.indexOf(c) >= 0; });
    savePeople(pl); return good({});
  }
  function removePerson(personId) {
    if (!can.admin()) return fail('Only administrators can remove users.');
    var pl = people(), p = pl.filter(function (x) { return x.id === personId; })[0];
    if (!p) return fail('User not found.');
    if (lc(p.email) === lc(me().email)) return fail('You cannot remove your own account.');
    if (p.type === 'admin' && p.status !== 'pending') return fail('Active administrators cannot be removed here.');
    savePeople(pl.filter(function (x) { return x.id !== personId; })); return good({});
  }
  function addAdmin(d) {
    if (!can.admin()) return fail('Only administrators can add administrators.');
    var first = String(d.first || '').trim().replace(/\s+/g, ' '), last = String(d.last || '').trim().replace(/\s+/g, ' '), email = String(d.email || '').trim();
    if (!first) return { ok: false, field: 'first', error: 'Enter a first name.' };
    if (!last) return { ok: false, field: 'last', error: 'Enter a last name.' };
    if (!EMAIL_RE.test(email)) return { ok: false, field: 'email', error: 'Enter a valid email address.' };
    var pl = people();
    if (personByEmail(email, pl)) return { ok: false, field: 'email', error: 'A user with this email address already exists. Existing clients are not converted to administrators.' };
    var m = me(), p = { id: 'p' + Date.now().toString(36) + rand(3), name: first + ' ' + last, first: first, last: last, email: email, type: 'admin', companies: [], manages: [], status: 'pending', via: 'Added by ' + m.name, invitedBy: m.name, token: 'admin-' + rand(8) };
    pl.push(p); savePeople(pl); return good({ person: p });
  }

  /* ---------- companies ---------- */
  function normName(v) { return lc(v).replace(/[^a-z0-9]+/g, ' ').trim(); }
  function createCompany(d) {
    if (!can.admin()) return fail('Only administrators can add companies.');
    var e = {}, name = String(d.name || '').trim().replace(/\s+/g, ' '), legal = String(d.legal || '').trim().replace(/\s+/g, ' '), exch = String(d.exch || '').trim(), code = String(d.code || '').trim().toUpperCase();
    if (name.length < 2 || name.length > 60) e.name = 'Enter a display name (2 to 60 characters).';
    if (legal.length < 2 || legal.length > 90) e.legal = 'Enter the legal name (2 to 90 characters).';
    if (!exch) e.exch = 'Choose or enter the stock exchange.';
    if (!/^[A-Z0-9][A-Z0-9.\-]{0,9}$/.test(code)) e.code = 'Use 1 to 10 letters, numbers, dots or dashes.';
    var email = String(d.email || '').trim();
    if (email && !EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
    var phone = String(d.phone || '').trim();
    if (phone && !/^[+()\d\s.\-]{5,25}$/.test(phone)) e.phone = 'Use digits, spaces, + ( ) - only.';
    function opt(key, label, intOnly) {
      var v = String(d[key] == null ? '' : d[key]).trim();
      if (v === '') return null;
      var n = Number(v.replace(/,/g, ''));
      if (!isFinite(n) || n < 0 || (key === 'price' && n === 0) || (intOnly && Math.floor(n) !== n)) { e[key] = label; return null; }
      return n;
    }
    var price = opt('price', 'Enter a price above zero, for example 1.250.'), vol = opt('vol30', 'Enter a whole number of shares.', true), spr = opt('spread30', 'Enter the spread in basis points, for example 14.2.');
    var pct = function (k) { var v = String(d[k] || '').trim(); if (v && !/^\d{1,3}(\.\d+)?%?$/.test(v)) e[k] = 'Enter a percentage such as 12%.'; return v; };
    var insiders = pct('insiders'), institutions = pct('institutions');
    var cnt = function (k) { var v = String(d[k] || '').trim(); if (v && !/^[\d][\d,. ]*$/.test(v)) e[k] = 'Use digits and separators only.'; return v; };
    var shares = cnt('shares'), flt = cnt('float');
    if (!e.name || !e.legal || !e.exch || !e.code) {
      var nn = normName(name), nl = normName(legal);
      D.ORDER.forEach(function (id) {
        var c = D.COMPANIES[id];
        if (!e.name && (normName(c.name) === nn || normName(c.legal) === nn)) e.name = 'A company called “' + c.name + '” already exists.';
        if (!e.legal && (normName(c.legal) === nl || normName(c.name) === nl)) e.legal = '“' + c.legal + '” is already on the Companies page.';
        if (!e.code && lc(c.exch) === lc(exch) && lc(c.code) === lc(code)) e.code = 'Code ' + c.code + ' on ' + c.exch + ' already belongs to ' + c.name + '.';
      });
    }
    if (Object.keys(e).length) return { ok: false, errors: e, error: 'Please fix the highlighted fields.' };
    var base = code.toLowerCase().replace(/[^a-z0-9]/g, '') || 'co', id = base, n = 1;
    while (D.COMPANIES[id]) { n++; id = base + n; }
    var feeds = { none: ['dr', 'Not connected'], ok: ['ok', 'Up to date'], warn: ['warn', 'Delayed'] };
    var c = { id: id, name: name, legal: legal, exch: exch, code: code, custom: true, createdAt: today(), createdBy: me().email,
      price: price, vol30: vol, spread30: spr, trades30: null, value30: null, feed: feeds[d.feed] || feeds.none, last: null, timTarget: null, sprTarget: null, fee: null,
      shares: shares, float: flt, insiders: insiders, institutions: institutions, email: email, phone: phone, address: String(d.address || '').trim() };
    var extra = store.get('companies-extra', []) || [];
    extra.push(c); store.set('companies-extra', extra);
    D.COMPANIES[id] = c; D.ORDER.push(id);
    return good({ company: c });
  }

  /* ---------- company profile review ---------- */
  var PROFILE_FIELDS = [['legal', 'Legal name', 'text'], ['exch', 'Listed exchange', 'text'], ['shares', 'Shares outstanding', 'text'], ['float', 'Float', 'text'], ['insiders', 'Held by insiders', 'text'], ['institutions', 'Held by institutions', 'text'], ['email', 'Email', 'email'], ['phone', 'Phone', 'tel'], ['address', 'Address', 'text']];
  function profileReviews() { return store.get('profile-reviews', []) || []; }
  function pendingReview(companyId) { return profileReviews().filter(function (r) { return r.company === companyId && r.status === 'pending'; })[0]; }
  function submitProfile(companyId, vals) {
    if (!can.editProfile(companyId)) return fail('Only a manager of this company can submit profile changes.');
    var co = D.COMPANIES[companyId], e = {}, clean = {};
    PROFILE_FIELDS.forEach(function (f) { clean[f[0]] = String((vals || {})[f[0]] == null ? '' : vals[f[0]]).trim().replace(/\s+/g, ' ').slice(0, f[0] === 'address' ? 200 : 120); });
    if (!clean.legal) e.legal = 'Legal name is required.';
    if (!clean.exch) e.exch = 'Listed exchange is required.';
    if (clean.email && !EMAIL_RE.test(clean.email)) e.email = 'Enter a valid email address.';
    if (clean.phone && !/^[+()\d\s.\-]{5,25}$/.test(clean.phone)) e.phone = 'Use digits, spaces, + ( ) - only.';
    if (clean.insiders && !/^\d{1,3}(\.\d+)?%?$/.test(clean.insiders)) e.insiders = 'Enter a percentage such as 12%.';
    if (clean.institutions && !/^\d{1,3}(\.\d+)?%?$/.test(clean.institutions)) e.institutions = 'Enter a percentage such as 48%.';
    if (clean.shares && !/^[\d][\d,. ]*$/.test(clean.shares)) e.shares = 'Use digits and separators only.';
    if (clean.float && !/^[\d][\d,. ]*$/.test(clean.float)) e.float = 'Use digits and separators only.';
    if (Object.keys(e).length) return { ok: false, errors: e, error: 'Please fix the highlighted fields.' };
    var ch = {};
    PROFILE_FIELDS.forEach(function (f) { var cur = co[f[0]] == null ? '' : String(co[f[0]]); if (clean[f[0]] !== cur) ch[f[0]] = { from: cur, to: clean[f[0]] }; });
    if (!Object.keys(ch).length) return fail('Nothing has changed compared with the approved profile.');
    var all = profileReviews(), m = me(), rec = pendingReview(companyId);
    if (rec) { all = all.map(function (r) { return r.id === rec.id ? rec : r; }); rec.changes = ch; rec.submittedLabel = today(); rec.submittedAt = new Date().toISOString(); rec.by = { name: m.name, email: m.email }; }
    else { rec = { id: newId('PR', all.length ? all : [{ id: 'PR100' }]), company: companyId, status: 'pending', submittedLabel: today(), submittedAt: new Date().toISOString(), by: { name: m.name, email: m.email }, changes: ch }; all.unshift(rec); }
    store.set('profile-reviews', all); return good({ review: rec });
  }
  function withdrawProfile(companyId) {
    if (!can.editProfile(companyId)) return fail('Only a manager of this company can withdraw profile changes.');
    var all = profileReviews(), rec = all.filter(function (r) { return r.company === companyId && r.status === 'pending'; })[0];
    if (!rec) return fail('There is nothing pending.');
    rec.status = 'withdrawn'; rec.reviewedLabel = today(); store.set('profile-reviews', all); return good({});
  }
  function reviewProfile(id, decision, note) {
    var m = me();
    if (m.role !== 'admin') return fail('Only administrators can review profile changes.');
    var all = profileReviews(), r = all.filter(function (x) { return x.id === id; })[0];
    if (!r) return fail('Request not found.');
    if (r.status !== 'pending') return fail('This request has already been ' + r.status + '.');
    if (r.by && r.by.email && lc(r.by.email) === lc(m.email)) return fail('You cannot review your own request.');
    if (decision !== 'approve' && decision !== 'reject') return fail('Unknown decision.');
    if (decision === 'approve') {
      var ov = store.get('profile-approved', {}) || {}; ov[r.company] = ov[r.company] || {};
      Object.keys(r.changes).forEach(function (k) { ov[r.company][k] = r.changes[k].to; if (D.COMPANIES[r.company]) D.COMPANIES[r.company][k] = r.changes[k].to; });
      store.set('profile-approved', ov);
    }
    r.status = decision === 'approve' ? 'approved' : 'rejected'; r.reviewedBy = { name: m.name, email: m.email }; r.reviewedLabel = today(); r.reviewedAt = new Date().toISOString(); r.note = String(note || '').trim().slice(0, 300);
    store.set('profile-reviews', all); return good({ review: r });
  }


  /* ---------- tickets: statuses ---------- */
  var TICKET_STATUS = { ours: ['warn', 'Needs our reply'], client: ['inf', 'Waiting on client'], done: ['ok', 'Resolved'] };
  var TICKET_MIGRATE = { await: 'client', prog: 'ours' }; /* saved tickets from earlier versions */
  var WEBSITE_PAGES = ['overview', 'market activity', 'trade history', 'peer comparison', 'reports', 'statements', 'subscription', 'company profile', 'team', 'support'];

  /* ---------- My account (a person can only change their own details; role and company access are never touched) ---------- */
  var DEFAULT_PW = 'prototype-password'; /* simulation: sign-in never checks passwords; this is the starting "current password" shown in the prototype */
  function simHash(v) { var h = 5381; v = String(v); for (var i = 0; i < v.length; i++) h = ((h << 5) + h + v.charCodeAt(i)) >>> 0; return 'sim-' + h.toString(36); }
  function splitName(p) { if (p.first || p.last) return [p.first || '', p.last || '']; var t = String(p.name || '').trim().split(/\s+/); return [t[0] || '', t.slice(1).join(' ')]; }
  function updateAccount(d) {
    var m = me();
    if (!m.person) return fail('Your account record was not found. Sign in again.');
    var first = String(d.first || '').trim().replace(/\s+/g, ' '), last = String(d.last || '').trim().replace(/\s+/g, ' '), email = String(d.email || '').trim(), e = {};
    if (!first) e.first = 'Enter your first name.'; else if (first.length > 60) e.first = 'Use at most 60 characters.';
    if (!last) e.last = 'Enter your last name.'; else if (last.length > 60) e.last = 'Use at most 60 characters.';
    if (!EMAIL_RE.test(email)) e.email = 'Enter a valid email address.';
    var pl = people(), p = pl.filter(function (x) { return x.id === m.person.id; })[0];
    if (!e.email && lc(email) !== lc(p.email) && personByEmail(email, pl)) e.email = 'Another account already uses this email address.';
    if (Object.keys(e).length) return { ok: false, errors: e, error: 'Please fix the highlighted fields.' };
    var old = p.email;
    p.first = first; p.last = last; p.name = first + ' ' + last; p.email = email;
    if (lc(old) !== lc(email)) {
      pl.forEach(function (x) { if (x.id !== p.id) { if (lc(x.tenant) === lc(old)) x.tenant = email; if (lc(x.invitedByEmail) === lc(old)) x.invitedByEmail = email; } });
      if (lc(p.tenant) === lc(old)) p.tenant = email;
      var ls = links(), lch = false; ls.forEach(function (l) { if (lc(l.usedBy) === lc(old)) { l.usedBy = email; lch = true; } }); if (lch) store.set('links', ls);
      var rv = profileReviews(), rch = false; rv.forEach(function (r) { if (r.by && lc(r.by.email) === lc(old)) { r.by.email = email; r.by.name = p.name; rch = true; } }); if (rch) store.set('profile-reviews', rv);
    }
    savePeople(pl);
    var s = session(); s.name = p.name; s.email = p.email; s.tenant = p.tenant; store.set('session', s);
    return good({ person: p });
  }
  function changePassword(current, next, confirm) {
    var m = me(); if (!m.person) return fail('Your account record was not found. Sign in again.');
    var pl = people(), p = pl.filter(function (x) { return x.id === m.person.id; })[0], e = {};
    if (!current) e.current = 'Enter your current password.';
    else if (simHash(current) !== (p.pwSim || simHash(DEFAULT_PW))) e.current = 'The current password is not correct.';
    var pe = validatePassword(next, confirm);
    if (pe) e[pe.indexOf('match') >= 0 ? 'confirm' : 'next'] = pe;
    else if (!e.current && next === current) e.next = 'Choose a password that is different from the current one.';
    if (Object.keys(e).length) return { ok: false, errors: e, error: 'Your password was not changed. Please check the highlighted fields.' };
    p.pwSim = simHash(next); savePeople(pl); return good({});
  }

  /* ---------- shell ---------- */
  function shell(ctx, opts) {
    var r = ctx.roleInfo, s = ctx.s;
    var nav = NAV[s.role];
    var activeHref = opts.navFor || (opts.page + '.html');
    var scopedCo = opts.scoped && ctx.co;
    if (s.role === 'admin' && scopedCo) activeHref = 'companies.html';
    var items = nav.map(function (n) {
      var on = n[0] === activeHref;
      var cnt = n[0] === 'access-requests.html' ? pending() : n[0] === 'profile-reviews.html' ? profilePending() : 0;
      var count = cnt ? '<span class="navcount" data-count="' + n[0] + '">' + cnt + '</span>' : '';
      return '<a href="' + n[0] + '" class="' + (on ? 'on' : '') + '"' + (on ? ' aria-current="page"' : '') + '>' + esc(n[1]) + count + '</a>';
    }).join('');
    var help = (s.role === 'client' || s.role === 'multi') ? '<div class="m-3 rounded-xl bg-white/5 p-4 text-xs text-[#AEB8CE]">Need help? <a href="tickets.html?new=1" class="!m-0 !inline !p-0 text-white underline">Open a support ticket</a>.</div>' : '';

    var crumb = '<span>' + esc(r.area) + '</span>';
    if (s.role === 'admin' && scopedCo) crumb += '<span>/</span><a class="hover:underline" href="companies.html">Companies</a><span>/</span><span class="crumb-co">' + esc(ctx.co.name) + '</span>';
    crumb += '<span>/</span><span class="font-medium text-ink">' + esc(opts.crumb || opts.title) + '</span>';

    var switcher = '';
    if (scopedCo) {
      if (ctx.allowed.length > 1) {
        switcher = '<label class="hidden items-center gap-2 text-xs text-mut sm:flex">Company <select id="company-switch" class="inp !w-40 !py-1.5" aria-label="Company">' +
          ctx.allowed.map(function (id) { return '<option value="' + id + '"' + (id === ctx.co.id ? ' selected' : '') + '>' + esc(D.COMPANIES[id].name) + '</option>'; }).join('') + '</select></label>';
      } else {
        switcher = '<span class="chip hidden sm:inline-flex">' + esc(ctx.co.name) + '</span>';
      }
    }
    var themeBtn = '<button type="button" data-theme-toggle class="btn !p-2" aria-label="Toggle dark mode" title="Toggle dark mode"><span class="t-moon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3 7 7 0 0 0 21 12.8z"/></svg></span><span class="t-sun"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg></span></button>';

    return '<input id="responsive-nav" class="sr-only" type="checkbox"><label class="nav-backdrop" for="responsive-nav" aria-label="Close navigation"></label>' +
      '<div class="flex min-h-screen"><aside class="side responsive-side flex w-52 shrink-0 flex-col" aria-label="Main">' +
      '<a class="flex h-16 items-center gap-3 border-b border-white/10 px-5 text-white" href="' + r.home + '" aria-label="DeltaBlock home">' + logo(28) + '</a>' +
      '<nav class="flex-1 py-4">' + items + '</nav>' + help + '</aside>' +
      '<div class="min-w-0 flex-1"><header class="flex h-14 items-center border-b bg-surf px-6"><label class="btn mobile-menu" for="responsive-nav" aria-label="Open navigation"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg></label>' +
      '<div class="hidden items-center gap-2 text-sm text-cap sm:flex">' + crumb + '</div>' +
      '<div class="ml-auto flex items-center gap-3">' + switcher + themeBtn +
      '<a href="login.html" class="text-sm text-mut hover:underline">Sign out</a>' +
      '<a href="account.html" class="flex items-center gap-2 border-l pl-3 hover:opacity-80" title="My account" aria-label="My account. Signed in as ' + esc(s.name) + ', ' + esc(r.label) + '"><span class="grid h-8 w-8 shrink-0 place-items-center" style="color:#F2B705" aria-hidden="true"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.25"/><path d="M5.5 20c.35-3.45 2.75-5.5 6.5-5.5s6.15 2.05 6.5 5.5"/></svg></span><div class="hidden leading-tight sm:block"><div class="text-sm font-semibold text-ink">' + esc(s.name) + '</div><div class="text-xs text-cap">' + esc(r.label) + (s.role !== 'admin' && s.role !== 'guest' && !ctx.manages.length ? ' · team member' : s.role !== 'admin' && s.role !== 'guest' ? ' · manager' : '') + '</div></div></a></div></header>' +
      '<main id="main" class="mx-auto max-w-[1280px] p-6 md:p-8"></main></div></div><div id="overlays"></div><div id="toast" class="toast" role="status" aria-live="polite"></div>';
  }

  function denied(ctx) {
    var r = ctx.roleInfo;
    return '<div class="card mx-auto mt-10 max-w-lg p-8 text-center"><h1 class="text-xl font-semibold">This page is not part of your access</h1><p class="mt-2 text-sm text-mut">' + esc(r.label) + ' accounts do not include this page' + (ctx.role === 'guest' ? ' (guests have read-only access to Overview, Market activity, Trade history, Peer comparison, Reports and Company profile only)' : '') + '. Your menu shows everything you can open.</p><a class="btn btn-p mt-6" href="' + r.home + '">Go to ' + esc(r.homeName) + '</a></div>';
  }

  function noData(ctx) {
    var co = ctx.co, vals = [];
    if (co.price != null) vals.push(['Reference price', '&euro;' + Number(co.price).toFixed(3)]);
    if (co.vol30 != null) vals.push(['Volume, last 30 days', num(co.vol30) + ' shares']);
    if (co.spread30 != null) vals.push(['Average spread, last 30 days', Number(co.spread30).toFixed(1) + ' bps']);
    var extra = vals.length ? '<dl class="mx-auto mt-5 grid max-w-sm gap-2 text-left text-sm">' + vals.map(function (v) { return '<div class="flex justify-between gap-4 border-t pt-2"><dt class="text-cap">' + v[0] + '</dt><dd class="mono">' + v[1] + '</dd></div>'; }).join('') + '</dl><p class="mt-2 text-xs text-cap">Values entered by an administrator when the company was added.</p>' : '';
    var act = ctx.role === 'admin' ? '<a class="btn btn-p" href="data-health.html">Open Data health</a> <a class="btn" href="companies.html">Back to Companies</a>' : '<a class="btn btn-p" href="tickets.html?new=1&subject=' + encodeURIComponent('Market data for ' + co.name) + '">Ask support</a>';
    return '<div class="card mx-auto mt-10 max-w-xl p-8 text-center"><span class="bd dr">Not available yet</span><h1 class="mt-3 text-xl font-semibold">No market data for ' + esc(co.name) + ' yet</h1><p class="mt-2 text-sm text-mut">No trade or reference-price feed has been connected for this company, so no figures are shown rather than made-up ones.</p>' + extra + '<div class="mt-6 flex flex-wrap justify-center gap-2">' + act + '</div></div>';
  }
  function noCompany(ctx) {
    return '<div class="card mx-auto mt-10 max-w-lg p-8 text-center"><h1 class="text-xl font-semibold">No company access yet</h1><p class="mt-2 text-sm text-mut">Your account is not linked to a company. Contact your administrator.</p><a class="btn btn-p mt-6" href="login.html">Back to sign in</a></div>';
  }

  function buildCtx() {
    var s = session(), r = resolve(s), cur = store.get('company');
    if (!cur || r.allowed.indexOf(cur) < 0) cur = r.allowed[0];
    var ctx = { s: { role: r.role, name: r.name, email: r.email, companies: r.companies, owner: r.owner, tenant: s.tenant }, role: r.role, roleInfo: ROLES[r.role], allowed: r.allowed, manages: r.manages,
      co: cur ? D.COMPANIES[cur] : null, admin: r.role === 'admin' };
    ctx.canManage = function (id) { return can.manage(id || (ctx.co && ctx.co.id)); };
    ctx.owner = r.manages.length > 0;
    return ctx;
  }

  function mount(opts) {
    var root = document.getElementById('root');
    var ctx = buildCtx();
    document.title = (opts.title || '') + ' | Deltablock';
    var ok = !opts.roles || opts.roles.indexOf(ctx.role) >= 0;
    root.innerHTML = shell(ctx, opts);
    var main = document.getElementById('main'), overlays = document.getElementById('overlays');

    function paint() {
      ctx = buildCtx();
      ctx.refresh = paint;
      ok = !opts.roles || opts.roles.indexOf(ctx.role) >= 0;
      if (!ok) { main.innerHTML = denied(ctx); overlays.innerHTML = ''; return; }
      if (opts.scoped && !ctx.co) { main.innerHTML = noCompany(ctx); overlays.innerHTML = ''; return; }
      if (opts.needsData && ctx.co && !D.KPI[ctx.co.id]) { main.innerHTML = noData(ctx); overlays.innerHTML = ''; return; }
      main.innerHTML = opts.render(ctx);
      overlays.innerHTML = typeof opts.extra === 'function' ? opts.extra(ctx) : (opts.extra || '');
      if (opts.after) opts.after(ctx, main, overlays);
    }
    paint();
    var sw = document.getElementById('company-switch');
    if (sw) sw.addEventListener('change', function () {
      if (!switchCompany(sw.value)) { toast('You do not have access to that company.', 'err'); sw.value = ctx.co ? ctx.co.id : ''; return; }
      document.querySelectorAll('.crumb-co').forEach(function (n) { n.textContent = D.COMPANIES[sw.value].name; });
      paint();
      toast('Showing ' + D.COMPANIES[sw.value].name);
    });
    return ctx;
  }

  window.App = { D: D, store: store, ROLES: ROLES, NAV: NAV, session: session, login: login, setSession: setSession, defaultSession: defaultSession,
    esc: esc, num: num, badge: badge, chips: chips, logo: logo, today: today, addDays: addDays, token: token, absUrl: absUrl, qs: qs, typeLabel: typeLabel,
    daysUntil: daysUntil, pending: pending, rng: rng, MEASURES: MEASURES, position: position, spark: spark, fmtM: fmtM, seedOf: seedOf, series: series, fmtDate: fmtDate, addIso: addIso, copy: copy, toast: toast, openModal: openModal, closeModals: closeModals, mount: mount,
    people: people, savePeople: savePeople, links: links, saveLinks: function (l) { store.set('links', l); },
    can: can, me: me, resolve: resolve, personByEmail: personByEmail, loginEmail: loginEmail, switchCompany: switchCompany, EMAIL_RE: EMAIL_RE, lc: lc,
    linkState: linkState, matchCompany: matchCompany, createLink: createLink, revokeLink: revokeLink, registerFromLink: registerFromLink, inviteByToken: inviteByToken, acceptInvite: acceptInvite, DUP_MSG: DUP_MSG,
    teamOf: teamOf, managersOf: managersOf, inviteMember: inviteMember, updateMemberAccess: updateMemberAccess, removeMember: removeMember, setAccessAdmin: setAccessAdmin, removePerson: removePerson, addAdmin: addAdmin,
    createCompany: createCompany, splitName: splitName, isoOf: isoOf, fmtIso: fmtDate, PROFILE_FIELDS: PROFILE_FIELDS, profileReviews: profileReviews, pendingReview: pendingReview, submitProfile: submitProfile, withdrawProfile: withdrawProfile, reviewProfile: reviewProfile, profilePending: profilePending,
    requests: function () { return store.get('requests', D.REQUESTS); }, saveRequests: function (r) { store.set('requests', r); },
    subs: function () {
      var x = store.get('subs', D.SUB);
      D.ORDER.forEach(function (id) {
        if (!x[id]) { x[id] = { plan: 'Not assigned', term: '—', start: '—', end: '—', renewal: '—', renewIso: null, status: ['dr', 'Not assigned'], services: [], none: true }; return; }
        var s = x[id], d = D.SUB[id];
        delete s.doc; /* the contract document is never shown */
        if (s.none) return;
        s.services = Array.isArray(s.services) ? s.services : [];
        if (s.services.some(function (v) { return WEBSITE_PAGES.indexOf(lc(v[0])) >= 0; })) s.services = d ? d.services.map(function (v) { return v.slice(); }) : s.services.filter(function (v) { return WEBSITE_PAGES.indexOf(lc(v[0])) < 0; });
        if (!s.startIso) s.startIso = (d && d.start === s.start && d.startIso) || isoOf(s.start) || (s.renewIso ? addIso(s.renewIso, -365) : null);
        if (!s.autoRenew) s.autoRenew = (d && d.autoRenew) || 'Renews annually';
      });
      return x;
    }, saveSubs: function (x) { store.set('subs', x); },
    tickets: function () { return store.get('tickets', D.TICKETS).map(function (t) { t.status = TICKET_MIGRATE[t.status] || t.status; return t; }); }, TICKET_STATUS: TICKET_STATUS, updateAccount: updateAccount, changePassword: changePassword, PROTOTYPE_PASSWORD: DEFAULT_PW, saveTickets: function (t) { store.set('tickets', t); } };
})();
