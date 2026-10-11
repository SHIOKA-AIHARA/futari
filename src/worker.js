// しおか＆ゆうとの予定帳 — サーバー
// Worker: 専用リンクの合言葉で本人を確認して、データは Durable Object「Pair」1つにまとめて保存する。
import { DurableObject } from 'cloudflare:workers';

const WHO = ['shioka', 'yuto'];
const NAME = { shioka: 'しおか', yuto: 'ゆうと' };
const OTHER = { shioka: 'yuto', yuto: 'shioka' };
const SLOTS = ['asa', 'hiru', 'yoru', 'tomari'];
const SLOT_L = { asa: '朝', hiru: '昼', yoru: '夜', tomari: '泊まり' };
const WD = ['日', '月', '火', '水', '木', '金', '土'];
const REASON = { work: 'お仕事が入った', friend: '友達と予定', other: 'ほかの用事' };
const PUSH_HOSTS = ['push.apple.com', 'fcm.googleapis.com', 'push.services.mozilla.com', 'notify.windows.com'];
const DAY = 86400000;
const JST = 9 * 3600000;
const AVAIL_QUIET_MS = 10 * 60 * 1000; // 空きの入力が10分止まったら相手にまとめて通知

const enc = new TextEncoder();

const json = (obj, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });

/* ---------- 日付（日本時間のカレンダー日付 "YYYY-MM-DD"） ---------- */
const isKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);
const keyToUTC = (k) => {
  const [y, m, d] = k.split('-').map(Number);
  return Date.UTC(y, m - 1, d);
};
const utcToKey = (t) => {
  const d = new Date(t);
  return d.getUTCFullYear() + '-' + String(d.getUTCMonth() + 1).padStart(2, '0') + '-' + String(d.getUTCDate()).padStart(2, '0');
};
const todayJST = () => {
  const n = new Date(Date.now() + JST);
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
};
const mdw = (t) => {
  const d = new Date(t);
  return d.getUTCMonth() + 1 + '/' + d.getUTCDate() + '(' + WD[d.getUTCDay()] + ')';
};

/* ---------- 予定の文言 ---------- */
const bySlot = (a, b) => SLOTS.indexOf(a) - SLOTS.indexOf(b);
const slotText = (p) => p.slots.slice().sort(bySlot).map((s) => SLOT_L[s]).join('・');
const stayText = (p) => (p.nights > 0 ? (p.nights === 1 ? '泊まる' : `泊まる（${p.nights}泊）`) : '泊まらない');
const planTitle = (p) => p.title || (p.nights > 0 ? 'お泊まり' : 'デート');
const rangeText = (p) => {
  const s = keyToUTC(p.date);
  return p.nights > 0 ? mdw(s) + '〜' + mdw(s + p.nights * DAY) : mdw(s);
};
const planLine = (p) =>
  `${rangeText(p)} ${planTitle(p)}（${[slotText(p), stayText(p), p.firm ? '決定' : '仮'].filter(Boolean).join('・')}）`;
const samePlan = (a, b) =>
  a.date === b.date && a.nights === b.nights && a.title === b.title && a.slots.slice().sort().join() === b.slots.slice().sort().join();

/* ---------- 入力のチェック ---------- */
function cleanAvail(b) {
  return { asa: !!b.asa, hiru: !!b.hiru, yoru: !!b.yoru, tomari: !!b.tomari };
}
function cleanPlan(b, who) {
  if (!b || !isKey(b.date)) throw new Error('date');
  const t = keyToUTC(b.date);
  const today = todayJST();
  if (t < today - 400 * DAY || t > today + 400 * DAY) throw new Error('date range');
  return {
    date: b.date,
    slots: Array.isArray(b.slots) ? [...new Set(b.slots.filter((s) => s === 'asa' || s === 'hiru' || s === 'yoru'))] : [],
    nights: Math.max(0, Math.min(7, Number(b.nights) | 0)),
    title: typeof b.title === 'string' ? b.title.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, 40) : '',
    firm: !!b.firm,
    by: who,
    updatedAt: new Date().toISOString(),
  };
}
function cleanSub(sub) {
  if (!sub || typeof sub.endpoint !== 'string' || !sub.keys) throw new Error('subscription');
  const u = new URL(sub.endpoint);
  if (u.protocol !== 'https:' || !PUSH_HOSTS.some((h) => u.hostname === h || u.hostname.endsWith('.' + h))) throw new Error('push host');
  if (unb64u(sub.keys.p256dh).length !== 65 || unb64u(sub.keys.auth).length !== 16) throw new Error('push keys');
  return { endpoint: sub.endpoint, keys: { p256dh: sub.keys.p256dh, auth: sub.keys.auth } };
}

/* ---------- 合言葉 ---------- */
async function sha256hex(s) {
  const d = await crypto.subtle.digest('SHA-256', enc.encode(s));
  return [...new Uint8Array(d)].map((b) => b.toString(16).padStart(2, '0')).join('');
}
async function whoFor(key, env) {
  if (typeof key !== 'string' || key.length < 16 || key.length > 128) return null;
  const h = await sha256hex(key);
  if (h === env.KEY_HASH_SHIOKA) return 'shioka';
  if (h === env.KEY_HASH_YUTO) return 'yuto';
  return null;
}

/* ---------- Web Push（RFC 8291 aes128gcm + VAPID） ---------- */
function b64u(buf) {
  const b = new Uint8Array(buf);
  let s = '';
  for (let i = 0; i < b.length; i++) s += String.fromCharCode(b[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function unb64u(s) {
  s = String(s).replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s);
  const u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
function concat(...arrs) {
  const out = new Uint8Array(arrs.reduce((n, a) => n + a.length, 0));
  let o = 0;
  for (const a of arrs) {
    out.set(a, o);
    o += a.length;
  }
  return out;
}
async function hkdf(salt, ikm, info, len) {
  const key = await crypto.subtle.importKey('raw', ikm, 'HKDF', false, ['deriveBits']);
  return new Uint8Array(await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, key, len * 8));
}
export async function encryptPayload(sub, payload) {
  const uaPublic = unb64u(sub.keys.p256dh);
  const authSecret = unb64u(sub.keys.auth);
  const as = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
  const asPublic = new Uint8Array(await crypto.subtle.exportKey('raw', as.publicKey));
  const uaKey = await crypto.subtle.importKey('raw', uaPublic, { name: 'ECDH', namedCurve: 'P-256' }, false, []);
  const ecdh = new Uint8Array(await crypto.subtle.deriveBits({ name: 'ECDH', public: uaKey }, as.privateKey, 256));
  const ikm = await hkdf(authSecret, ecdh, concat(enc.encode('WebPush: info\u0000'), uaPublic, asPublic), 32);
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const cek = await hkdf(salt, ikm, enc.encode('Content-Encoding: aes128gcm\u0000'), 16);
  const nonce = await hkdf(salt, ikm, enc.encode('Content-Encoding: nonce\u0000'), 12);
  const aes = await crypto.subtle.importKey('raw', cek, 'AES-GCM', false, ['encrypt']);
  const ct = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aes, concat(enc.encode(payload), new Uint8Array([2]))));
  const header = new Uint8Array(16 + 4 + 1 + 65);
  header.set(salt, 0);
  new DataView(header.buffer).setUint32(16, 4096);
  header[20] = 65;
  header.set(asPublic, 21);
  return concat(header, ct);
}
async function vapidAuth(endpoint, vapid, subject) {
  const head = b64u(enc.encode(JSON.stringify({ typ: 'JWT', alg: 'ES256' })));
  const claims = b64u(
    enc.encode(JSON.stringify({ aud: new URL(endpoint).origin, exp: Math.floor(Date.now() / 1000) + 12 * 3600, sub: subject })),
  );
  const key = await crypto.subtle.importKey('jwk', vapid.privateJwk, { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, key, enc.encode(head + '.' + claims));
  return `vapid t=${head}.${claims}.${b64u(sig)}, k=${vapid.publicKey}`;
}
async function sendPush(sub, data, vapid, subject) {
  const body = await encryptPayload(sub, JSON.stringify(data));
  return fetch(sub.endpoint, {
    method: 'POST',
    headers: {
      'Content-Encoding': 'aes128gcm',
      'Content-Type': 'application/octet-stream',
      TTL: '86400',
      Urgency: 'normal',
      Authorization: await vapidAuth(sub.endpoint, vapid, subject),
    },
    body,
  });
}

/* ---------- アプリのマニフェスト（ホーム画面に追加したときの起動リンクに合言葉を入れる） ---------- */
async function manifest(url, env) {
  const k = url.searchParams.get('k');
  const who = await whoFor(k, env);
  return new Response(
    JSON.stringify({
      name: 'しおか＆ゆうとの予定帳',
      short_name: 'ふたり予定帳',
      id: '/',
      start_url: who ? '/?k=' + encodeURIComponent(k) : '/',
      scope: '/',
      display: 'standalone',
      lang: 'ja',
      background_color: '#FFF7F9',
      theme_color: '#FFF7F9',
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json; charset=utf-8', 'cache-control': 'no-store' } },
  );
}

const pairOf = (env) => env.PAIR.get(env.PAIR.idFromName('shioka-yuto'));

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/manifest.webmanifest') return manifest(url, env);
    if (url.pathname.startsWith('/api/')) {
      const who = await whoFor(request.headers.get('x-key') || url.searchParams.get('k'), env);
      if (!who) return json({ error: 'unauthorized' }, 401);
      const headers = new Headers(request.headers);
      headers.set('x-who', who);
      headers.delete('x-key');
      return pairOf(env).fetch(new Request(request, { headers }));
    }
    return env.ASSETS.fetch(request);
  },
  async scheduled(event, env, ctx) {
    ctx.waitUntil(pairOf(env).daily());
  },
};

/* ---------- ふたりのデータ ---------- */
// 保存の形: a:<日付>_<ひと> = 空き / p:<id> = 予定 / sub:<ひと>:<id> = 通知先 / vapid / origin / pendAvail:<ひと> / sent:<種類>
export class Pair extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    if (typeof WebSocketRequestResponsePair !== 'undefined') {
      ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair('ping', 'pong'));
    }
    ctx.blockConcurrencyWhile(async () => {
      this.vapidKeys = await this.ensureVapid();
    });
  }

  get s() {
    return this.ctx.storage;
  }

  async fetch(request) {
    const url = new URL(request.url);
    const who = request.headers.get('x-who');
    if (!WHO.includes(who)) return json({ error: 'unauthorized' }, 401);
    if ((await this.s.get('origin')) !== url.origin) await this.s.put('origin', url.origin);
    const path = url.pathname;
    const method = request.method;
    try {
      if (path === '/api/ws') {
        if (request.headers.get('Upgrade') !== 'websocket') return json({ error: 'expected websocket' }, 426);
        const pair = new WebSocketPair();
        this.ctx.acceptWebSocket(pair[1], [who]);
        return new Response(null, { status: 101, webSocket: pair[0] });
      }
      if (path === '/api/state' && method === 'GET') return json(await this.snapshot(who));
      if (path === '/api/avail' && method === 'PUT') return json(await this.putAvail(who, await request.json()));
      const pm = path.match(/^\/api\/plan\/([A-Za-z0-9_-]{4,40})$/);
      if (pm && method === 'PUT') return json(await this.putPlan(who, pm[1], await request.json(), url.searchParams.get('restore') === '1'));
      if (pm && method === 'DELETE') return json(await this.deletePlan(who, pm[1], url.searchParams.get('reason')));
      if (path === '/api/push' && method === 'PUT') return json(await this.addSub(who, await request.json()));
      if (path === '/api/push' && method === 'DELETE') return json(await this.removeSub(who, await request.json()));
      if (path === '/api/push/test' && method === 'POST') {
        return json(await this.notify(who, { title: '通知テスト', body: 'これでふたりの予定のお知らせが届くよ ♡', tag: 'test' }));
      }
    } catch (e) {
      return json({ error: 'bad_request', detail: String((e && e.message) || e) }, 400);
    }
    return json({ error: 'not_found' }, 404);
  }

  async ensureVapid() {
    let v = await this.s.get('vapid');
    if (!v) {
      const kp = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']);
      v = { publicKey: b64u(await crypto.subtle.exportKey('raw', kp.publicKey)), privateJwk: await crypto.subtle.exportKey('jwk', kp.privateKey) };
      await this.s.put('vapid', v);
    }
    return v;
  }

  async availMap() {
    const out = {};
    for (const [k, v] of await this.s.list({ prefix: 'a:' })) out[k.slice(2)] = v;
    return out;
  }
  async allPlans() {
    return [...(await this.s.list({ prefix: 'p:' })).values()];
  }

  async snapshot(who) {
    const plans = {};
    for (const [k, v] of await this.s.list({ prefix: 'p:' })) plans[k.slice(2)] = v;
    const subs = await this.s.list({ prefix: 'sub:' + who + ':' });
    return { me: who, avail: await this.availMap(), plans, vapidKey: this.vapidKeys.publicKey, pushCount: subs.size };
  }

  broadcast(m) {
    const s = JSON.stringify(m);
    for (const ws of this.ctx.getWebSockets()) {
      try {
        ws.send(s);
      } catch (e) {}
    }
  }
  async webSocketMessage(ws, msg) {
    if (msg === 'ping') ws.send('pong');
  }
  async webSocketClose(ws, code) {
    try {
      ws.close(code >= 1000 && code < 1004 ? code : 1000, 'bye');
    } catch (e) {}
  }
  async webSocketError(ws) {
    try {
      ws.close(1011, 'error');
    } catch (e) {}
  }

  /* 空き */
  async putAvail(who, body) {
    if (!body || !isKey(body.date)) throw new Error('date');
    const t = keyToUTC(body.date);
    const today = todayJST();
    if (t < today - 2 * DAY || t > today + 400 * DAY) throw new Error('date range');
    const key = body.date + '_' + who;
    const prev = (await this.s.get('a:' + key)) || {};
    const v = cleanAvail(body);
    await this.s.put('a:' + key, v);
    this.broadcast({ t: 'avail', key, v, by: who });
    const added = SLOTS.filter((s) => v[s] && !prev[s]);
    const removed = SLOTS.filter((s) => !v[s] && prev[s]);
    let conflict = false;
    if (removed.length) {
      for (const p of await this.allPlans()) {
        const s = keyToUTC(p.date);
        if (p.date === body.date && p.slots.some((x) => removed.includes(x))) conflict = true;
        if (removed.includes('tomari') && p.nights > 0 && t >= s && t < s + p.nights * DAY) conflict = true;
      }
    }
    if (added.length || conflict) await this.queueAvail(who, body.date, conflict);
    return { ok: true };
  }
  async queueAvail(who, date, conflict) {
    const k = 'pendAvail:' + who;
    const pa = (await this.s.get(k)) || { dates: [], conflicts: [] };
    if (!pa.dates.includes(date)) pa.dates.push(date);
    if (conflict && !pa.conflicts.includes(date)) pa.conflicts.push(date);
    pa.due = Date.now() + AVAIL_QUIET_MS;
    await this.s.put(k, pa);
    await this.rearm();
  }
  async rearm() {
    let next = null;
    for (const w of WHO) {
      const pa = await this.s.get('pendAvail:' + w);
      if (pa && (next === null || pa.due < next)) next = pa.due;
    }
    if (next === null) await this.s.deleteAlarm();
    else await this.s.setAlarm(next);
  }
  async alarm() {
    const now = Date.now();
    for (const w of WHO) {
      const pa = await this.s.get('pendAvail:' + w);
      if (pa && pa.due <= now + 1000) {
        await this.s.delete('pendAvail:' + w);
        await this.safeNotify(OTHER[w], await this.availMessage(w, pa));
      }
    }
    await this.rearm();
  }
  async availMessage(w, pa) {
    if (pa.conflicts.length) {
      const d = pa.conflicts.slice().sort()[0];
      const p = (await this.allPlans()).find((x) => x.date === d);
      return {
        title: `${NAME[w]}の都合が変わったかも`,
        body: `${mdw(keyToUTC(d))}${p ? 'の「' + planTitle(p) + '」' : ''}をチェックしてね`,
        tag: 'avail-' + w,
      };
    }
    const avail = await this.availMap();
    const today = todayJST();
    const dates = pa.dates.filter((d) => keyToUTC(d) >= today).sort();
    const matches = [];
    for (const d of dates) {
      const a = avail[d + '_shioka'] || {};
      const b = avail[d + '_yuto'] || {};
      const m = SLOTS.filter((s) => a[s] && b[s]);
      if (m.length) matches.push(`${mdw(keyToUTC(d))} ${m.map((s) => SLOT_L[s]).join('・')}`);
    }
    const body = matches.length
      ? `♡ ふたりとも空き：${matches.slice(0, 2).join('、')}${matches.length > 2 ? ' ほか' : ''}`
      : `${dates.slice(0, 3).map((d) => mdw(keyToUTC(d))).join('、')}${dates.length > 3 ? ' ほか' : ''}`;
    return { title: `${NAME[w]}が空きを入れたよ`, body, tag: 'avail-' + w };
  }

  /* 予定（シール） */
  async putPlan(who, id, body, restore) {
    const prev = await this.s.get('p:' + id);
    const p = cleanPlan(body, who);
    await this.s.put('p:' + id, p);
    this.broadcast({ t: 'plan', id, v: p, by: who });
    let title;
    if (restore) title = `${NAME[who]}がシールをもどしたよ`;
    else if (!prev) title = `${NAME[who]}がシールを貼ったよ ♡`;
    else if (prev.firm !== p.firm && samePlan(prev, p)) title = p.firm ? `${NAME[who]}が「決定」にしたよ` : `${NAME[who]}が「仮」にもどしたよ`;
    else title = `${NAME[who]}が予定をなおしたよ`;
    await this.safeNotify(OTHER[who], { title, body: planLine(p), tag: 'plan-' + id });
    return { ok: true, plan: p };
  }
  async deletePlan(who, id, reason) {
    const prev = await this.s.get('p:' + id);
    if (!prev) return { ok: true };
    await this.s.delete('p:' + id);
    this.broadcast({ t: 'plan', id, v: null, by: who });
    await this.safeNotify(OTHER[who], {
      title: `${NAME[who]}がシールをはがしたよ`,
      body: `${rangeText(prev)} ${planTitle(prev)}・${REASON[reason] || REASON.other}。また決めよう ♡`,
      tag: 'plan-' + id,
    });
    return { ok: true };
  }

  /* 通知 */
  async addSub(who, raw) {
    const sub = cleanSub(raw);
    const id = (await sha256hex(sub.endpoint)).slice(0, 24);
    for (const w of WHO) if (w !== who) await this.s.delete(`sub:${w}:${id}`);
    await this.s.put(`sub:${who}:${id}`, { ...sub, at: Date.now() });
    return { ok: true, pushCount: (await this.s.list({ prefix: 'sub:' + who + ':' })).size };
  }
  async removeSub(who, raw) {
    if (raw && typeof raw.endpoint === 'string') await this.s.delete(`sub:${who}:${(await sha256hex(raw.endpoint)).slice(0, 24)}`);
    return { ok: true, pushCount: (await this.s.list({ prefix: 'sub:' + who + ':' })).size };
  }
  async notify(who, msg) {
    const subs = await this.s.list({ prefix: 'sub:' + who + ':' });
    if (!subs.size) return { sent: 0, devices: 0 };
    const subject = (await this.s.get('origin')) || 'mailto:futari@example.com';
    let sent = 0;
    for (const [k, sub] of subs) {
      try {
        const res = await sendPush(sub, { ...msg, url: '/' }, this.vapidKeys, subject);
        if (res.status === 404 || res.status === 410) await this.s.delete(k);
        else if (res.ok) sent++;
        else console.log('push failed', res.status, await res.text());
      } catch (e) {
        console.log('push error', String(e));
      }
    }
    return { sent, devices: subs.size };
  }
  async safeNotify(who, msg) {
    try {
      return await this.notify(who, msg);
    } catch (e) {
      console.log('notify error', String(e));
      return { sent: 0 };
    }
  }

  /* 毎日 20:00 */
  async daily() {
    const today = todayJST();
    const d = new Date(today);
    const dl = Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + (d.getUTCDate() <= 5 ? 0 : 1), 5);
    const days = Math.round((dl - today) / DAY);
    const tm = ((new Date(dl).getUTCMonth() + 1) % 12) + 1;
    const dlKey = utcToKey(dl);
    if (days === 5 && (await this.once('dl5:' + dlKey))) {
      await this.safeNotify('shioka', {
        title: 'シフト提出まであと5日',
        body: `${mdw(dl)}が${tm}月分の〆切。旅行やお泊まりの日を決めておこう ♡`,
        tag: 'shift',
      });
      await this.safeNotify('yuto', {
        title: 'しおかのシフト〆切まであと5日',
        body: `${mdw(dl)}が${tm}月分の〆切だよ。${tm}月の予定をいっしょに決めよう ♡`,
        tag: 'shift',
      });
    }
    if (days === 1 && (await this.once('dl1:' + dlKey))) {
      await this.safeNotify('shioka', {
        title: 'あしたはシフト提出の〆切',
        body: `${tm}月に空けておきたい日は、予定帳のメモをコピーしてね`,
        tag: 'shift',
      });
    }
    if (d.getUTCDay() === 0 && (await this.once('wk:' + utcToKey(today)))) {
      const mon = today + DAY;
      const covered = (await this.allPlans()).some((p) => {
        const s = keyToUTC(p.date);
        return s + p.nights * DAY >= mon && s <= mon + 6 * DAY;
      });
      if (!covered) {
        const avail = await this.availMap();
        const cands = [];
        for (let i = 0; i < 7; i++) {
          const t = mon + i * DAY;
          const a = avail[utcToKey(t) + '_shioka'] || {};
          const b = avail[utcToKey(t) + '_yuto'] || {};
          const m = SLOTS.filter((s) => a[s] && b[s]);
          if (m.length) cands.push(`${mdw(t)} ${m.map((s) => SLOT_L[s]).join('・')}`);
        }
        const msg = {
          title: '来週の会う日がまだ決まってないよ',
          body: cands.length ? `♡ ふたりとも空き：${cands.slice(0, 2).join('、')}${cands.length > 2 ? ' ほか' : ''}` : 'まずは空いてるコマを入れてみよう',
          tag: 'week',
        };
        for (const w of WHO) await this.safeNotify(w, msg);
      }
    }
    await this.prune(today);
    return { days };
  }
  async once(key) {
    if (await this.s.get('sent:' + key)) return false;
    await this.s.put('sent:' + key, Date.now());
    return true;
  }
  async prune(today) {
    const cut = today - 60 * DAY;
    const del = [];
    for (const [k] of await this.s.list({ prefix: 'a:' })) {
      const d = k.slice(2, 12);
      if (isKey(d) && keyToUTC(d) < cut) del.push(k);
    }
    for (const [k, p] of await this.s.list({ prefix: 'p:' })) {
      if (isKey(p.date) && keyToUTC(p.date) + p.nights * DAY < cut) del.push(k);
    }
    for (const [k, t] of await this.s.list({ prefix: 'sent:' })) if (t < Date.now() - 90 * DAY) del.push(k);
    for (let i = 0; i < del.length; i += 128) await this.s.delete(del.slice(i, i + 128));
  }
}
