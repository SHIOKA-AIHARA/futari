// しおか＆ゆうとの予定帳 — アプリ画面
(() => {
'use strict';
const $ = (s) => document.querySelector(s);

const SLOTS = [{k:'asa', l:'朝'}, {k:'hiru', l:'昼'}, {k:'yoru', l:'夜'}, {k:'tomari', l:'泊まり'}];
const SLOT_L = {asa:'朝', hiru:'昼', yoru:'夜', tomari:'泊まり'};
const ORDER = {asa:0, hiru:1, yoru:2, tomari:3};
const WHO = ['shioka', 'yuto'];
const NAME = {shioka:'しおか', yuto:'ゆうと'};
const WD = ['日','月','火','水','木','金','土'];
const HOLI = {
  '2026-10-12':'スポーツの日', '2026-11-03':'文化の日', '2026-11-23':'勤労感謝の日',
  '2027-01-01':'元日', '2027-01-11':'成人の日', '2027-02-11':'建国記念の日', '2027-02-23':'天皇誕生日',
  '2027-03-21':'春分の日', '2027-03-22':'振替休日', '2027-04-29':'昭和の日', '2027-05-03':'憲法記念日',
  '2027-05-04':'みどりの日', '2027-05-05':'こどもの日'
};
const HEART_PATH = 'M8 14.2S.6 9.4.6 4.6C.6 2.3 2.4.6 4.5.6 6 .6 7.3 1.5 8 2.8 8.7 1.5 10 .6 11.5.6c2.1 0 3.9 1.7 3.9 4 0 4.8-7.4 9.6-7.4 9.6Z';
const HEART = '<svg viewBox="0 0 16 15" aria-hidden="true" focusable="false"><path d="' + HEART_PATH + '" fill="currentColor"/></svg>';
const HEART_O = '<svg viewBox="0 0 16 15" aria-hidden="true" focusable="false"><path d="' + HEART_PATH + '" fill="none" stroke="currentColor" stroke-width="1.6"/></svg>';
const AVA = {
  shioka: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
    '<rect class="bg-s" width="64" height="64"/>' +
    '<path class="hs" d="M15 30C14 16 22 9 32 9s18 7 17 21l2 34H13Z"/>' +
    '<path class="t" d="M13 64c0-10 8-15 19-15s19 5 19 15Z"/>' +
    '<path class="kd" d="M28 43h8v7.5c-2.2 2-5.8 2-8 0Z"/>' +
    '<ellipse class="k" cx="32" cy="33" rx="13.5" ry="14.5"/>' +
    '<path class="hs" d="M18.5 27c-3 9-2 20-6 30l7.5-3c1-9 1-18 2-26Z"/>' +
    '<path class="hs" d="M45.5 27c3 9 2 20 6 30l-7.5-3c-1-9-1-18-2-26Z"/>' +
    '<path class="hs" d="M18 27C17 15 24 9.5 32 9.5S47 15 46 27c-1.4-4.4-3.6-7.4-6.6-9.2-2.4-1.4-5-1.9-7.4-1.9s-5 .5-7.4 1.9c-3 1.8-5.2 4.8-6.6 9.2Z"/>' +
    '<path class="hs" d="M24.6 16.6c-1.8 3.6-2.8 7.2-3 11.2 1.4-3 2.8-6.4 4.8-9.6Z"/>' +
    '<path class="hs" d="M28.2 15.8c-.9 4-1.1 7.8-.7 11.4.9-3.6 1.8-7 3.2-10.3Z"/>' +
    '<path class="hs" d="M31.6 15.8c.1 3.9.8 7.4 2.1 10.6-.1-3.7 0-7.1.8-10.3Z"/>' +
    '<path class="hs" d="M35.6 16.4c1.2 3.5 1.9 7 1.9 10.6.8-3.5.7-7-.1-10.2Z"/>' +
    '<path class="hs" d="M39.4 17.4c1.9 3.2 2.9 6.8 3.3 10.4.6-3.7.2-7.1-1.2-10.2Z"/>' +
    '<path class="sh" d="M24 13.6c2.8-1.8 6.4-2.4 9.5-1.9"/>' +
    '<path class="ln" stroke-width="1.9" d="M23.6 34.4q2.4-3.1 4.8 0M35.6 34.4q2.4-3.1 4.8 0"/>' +
    '<path class="ln" stroke-width="1.2" d="M23.7 34.2l-1.1.7M40.3 34.2l1.1.7"/>' +
    '<ellipse class="b" cx="21.6" cy="38.4" rx="3.1" ry="1.9"/><ellipse class="b" cx="42.4" cy="38.4" rx="3.1" ry="1.9"/>' +
    '<path class="m" d="M27.2 39.2q4.8 6.8 9.6 0Z"/><path class="w" d="M27.9 39.5q4.1 1.4 8.2 0l-.5 1.3q-3.6 1.2-7.2 0Z"/>' +
    '</svg>',
  yuto: '<svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">' +
    '<rect class="bg-y" width="64" height="64"/>' +
    '<path class="h" d="M16 30C14 16 22 8 32 8s18 8 16 22l.4 8.6c-1.4 1.6-3 2.4-5 2.4H20.6c-2 0-3.6-.8-5-2.4Z"/>' +
    '<path class="t" d="M9 64c0-11 10-16 23-16s23 5 23 16Z"/>' +
    '<path class="kd" d="M27.5 45h9v6c-2.5 2.4-6.5 2.4-9 0Z"/>' +
    '<path class="cl" d="M26.8 49.6q5.2 3.4 10.4 0"/>' +
    '<ellipse class="k" cx="32" cy="33.2" rx="13" ry="15.6"/>' +
    '<ellipse class="k" cx="19.2" cy="36.4" rx="2.2" ry="3"/><ellipse class="k" cx="44.8" cy="36.4" rx="2.2" ry="3"/>' +
    '<path class="h" fill-opacity=".13" d="M20.6 38.5q1.4 8 11.4 10.4 10-2.4 11.4-10.4-.6 10.6-11.4 12.4-10.8-1.8-11.4-12.4Z"/>' +
    '<path class="h" d="M32 11.5C26 12 21 15.5 19.5 21c-1.2 4.5-1.4 10-2.6 16.5 1.6-.6 2.8-2 3.4-4 .9-4.4 1.2-8.6 2.8-11.6 1.8-3.4 5-5.6 8.9-6.6Z"/>' +
    '<path class="h" d="M32 11.5C38 12 43 15.5 44.5 21c1.2 4.5 1.4 10 2.6 16.5-1.6-.6-2.8-2-3.4-4-.9-4.4-1.2-8.6-2.8-11.6-1.8-3.4-5-5.6-8.9-6.6Z"/>' +
    '<path class="sh" d="M24 14.8c2.4-1.6 5-2.4 7.4-2.6M40 14.8c-1.6-1.1-3.4-1.8-5.2-2.2"/>' +
    '<circle class="er" cx="18.6" cy="40.4" r="1.25"/>' +
    '<path class="ln" stroke-width="1.8" d="M23.4 28.8l5.4-.6M35.2 28.2l5.4.6"/>' +
    '<ellipse class="h" cx="26.4" cy="33.2" rx="2" ry="1.75"/><ellipse class="h" cx="37.6" cy="33.2" rx="2" ry="1.75"/>' +
    '<path class="ln" stroke-width="1.1" d="M23.8 32.2q2.6-1.5 5.2 0M35 32.2q2.6-1.5 5.2 0"/>' +
    '<circle class="w" cx="27.1" cy="32.6" r=".6"/><circle class="w" cx="38.3" cy="32.6" r=".6"/>' +
    '<path class="kd" d="M30.9 37.9q1.1.7 2.2 0l-.5-1.1h-1.2Z"/>' +
    '<ellipse class="b" fill-opacity=".55" cx="22.6" cy="38" rx="2.3" ry="1.2"/><ellipse class="b" fill-opacity=".55" cx="41.4" cy="38" rx="2.3" ry="1.2"/>' +
    '<path class="h" fill-opacity=".88" d="M27.4 41q2.3-1.5 4.6-.5 2.3-1 4.6.5-2.3-.1-4.6.5-2.3-.6-4.6-.5Z"/>' +
    '<path class="m" d="M28.9 42.6q3.3 1.9 6.6-.2-.6 1.6-3.3 1.8-2.6-.1-3.3-1.6Z"/>' +
    '<path class="h" fill-opacity=".82" d="M29.6 45.6q2.4 1.2 4.8 0l-.4 2.6q-2 1.2-4 0Z"/>' +
    '</svg>'
};
const ava = (who, sz) => '<span class="ava"' + (sz ? ' style="--sz:' + sz + 'px"' : '') + '>' + AVA[who] + '</span>';
const REDUCE = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
const IS_IOS = /iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
const STANDALONE = window.navigator.standalone === true || !!(window.matchMedia && window.matchMedia('(display-mode: standalone)').matches);
const BYE = {
  work: 'お仕事がんばってね。また空いてる日をさがそ ♡',
  friend: 'たのしんできてね。またこんど ♡',
  other: 'りょうかい！また決めよう ♡'
};

const pad = (n) => String(n).padStart(2, '0');
const keyOf = (d) => d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate());
const parseKey = (k) => { const a = k.split('-').map(Number); return new Date(a[0], a[1] - 1, a[2]); };
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n);
const mondayOf = (d) => addDays(d, -((d.getDay() + 6) % 7));
const md = (d) => (d.getMonth() + 1) + '/' + d.getDate();
const mdw = (d) => md(d) + '(' + WD[d.getDay()] + ')';
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const isKey = (k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k);
const monthNum = (d) => d.getFullYear() * 12 + d.getMonth();

// 日付はいつも日本時間で数える
function jstToday(){
  const n = new Date(Date.now() + 9 * 3600000);
  return new Date(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}
let TODAY, TODAY_K, MONTHS, THIS_WEEK, NEXT_WEEK;
function setToday(){
  TODAY = jstToday();
  TODAY_K = keyOf(TODAY);
  MONTHS = [0, 1, 2].map((i) => new Date(TODAY.getFullYear(), TODAY.getMonth() + i, 1));
  THIS_WEEK = keyOf(mondayOf(TODAY));
  NEXT_WEEK = keyOf(addDays(mondayOf(TODAY), 7));
}
setToday();

const LS = {
  get(k){ try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : null; } catch (e) { return null; } },
  set(k, v){ try { if (v === null || v === undefined) localStorage.removeItem(k); else localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};

let KEY = null;
{
  const k = new URL(location.href).searchParams.get('k');
  KEY = k || LS.get('futari.key');
}

const state = {
  who: null, month: 0, onlyMatch: !!LS.get('futari.onlyMatch'),
  avail: {}, plans: {},
  open: null, ask: null, justStuck: null, editing: null,
  pop: new Set(),
  mode: 'loading', live: false,
  vapidKey: null, push: 'unknown', pushCount: 0
};

/* ---------- data helpers ---------- */
function av(date, who){ return state.avail[date + '_' + who] || {}; }
function isMatch(date, slot){ return !!(av(date, 'shioka')[slot] && av(date, 'yuto')[slot]); }
function dayMatches(date){ return SLOTS.filter((s) => isMatch(date, s.k)).map((s) => s.k); }
function normAvail(v){ return {asa:!!v.asa, hiru:!!v.hiru, yoru:!!v.yoru, tomari:!!v.tomari}; }
function normPlan(v){
  return {
    date: String(v.date).slice(0, 10),
    slots: Array.isArray(v.slots) ? v.slots.filter((s) => s === 'asa' || s === 'hiru' || s === 'yoru') : [],
    nights: Math.max(0, Math.min(7, Number(v.nights) | 0)),
    title: typeof v.title === 'string' ? v.title.slice(0, 40) : '',
    firm: !!v.firm,
    by: v.by === 'yuto' ? 'yuto' : 'shioka',
    updatedAt: typeof v.updatedAt === 'string' ? v.updatedAt : ''
  };
}
const byOrder = (a, b) => ORDER[a] - ORDER[b];
function firstSlot(p){ const s = p.slots.slice().sort(byOrder)[0]; return s ? ORDER[s] : 9; }
function slotText(p){ return p.slots.slice().sort(byOrder).map((s) => SLOT_L[s]).join('・'); }
function stayText(p){ return p.nights > 0 ? (p.nights === 1 ? '泊まる' : '泊まる（' + p.nights + '泊）') : '泊まらない'; }
function planMeta(p){ return [slotText(p), stayText(p)].filter(Boolean).join(' ・ '); }
function planTitle(p){ return p.title || (p.nights > 0 ? 'お泊まり' : 'デート'); }
function rangeText(p){
  const s = parseKey(p.date);
  if (p.nights > 0) return mdw(s) + '〜' + mdw(addDays(s, p.nights));
  return mdw(s) + (p.slots.length ? ' ' + slotText(p) : '');
}
function planWarn(p){
  const need = p.slots.slice();
  if (p.nights > 0) need.push('tomari');
  const out = [];
  for (const w of WHO){
    const v = state.avail[p.date + '_' + w];
    if (!v) continue;
    const miss = need.filter((s) => !v[s]).map((s) => SLOT_L[s]);
    if (miss.length) out.push(NAME[w] + 'の' + miss.join('・'));
  }
  return out.length ? '都合が変わったかも：' + out.join('、') + 'が空いてないみたい' : '';
}
function rotFor(id){ let h = 0; for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) | 0; return ((Math.abs(h) % 9) - 4) * 0.45; }
function newId(){ return 'p' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

function planIndex(){
  const idx = {};
  for (const id of Object.keys(state.plans)){
    const p = state.plans[id];
    if (!isKey(p.date)) continue;
    const s = parseKey(p.date);
    for (let i = 0; i <= p.nights; i++){
      const k = keyOf(addDays(s, i));
      (idx[k] = idx[k] || []).push({id, p, i});
    }
  }
  for (const k of Object.keys(idx)) idx[k].sort((a, b) => (a.i === 0 ? 0 : 1) - (b.i === 0 ? 0 : 1) || firstSlot(a.p) - firstSlot(b.p));
  return idx;
}
function plansTouching(month){
  const m = monthNum(month);
  return Object.entries(state.plans)
    .filter(([, p]) => isKey(p.date) && monthNum(parseKey(p.date)) <= m && monthNum(addDays(parseKey(p.date), p.nights)) >= m)
    .sort((a, b) => a[1].date.localeCompare(b[1].date));
}
function plansStarting(month){
  const m = monthNum(month);
  return Object.values(state.plans).filter((p) => isKey(p.date) && monthNum(parseKey(p.date)) === m).length;
}
function weeksOfMonth(mi){
  const m = MONTHS[mi];
  const last = new Date(m.getFullYear(), m.getMonth() + 1, 0);
  const out = [];
  for (let w = mondayOf(m); w <= last; w = addDays(w, 7)){
    const end = addDays(w, 6);
    if (end < TODAY) continue;
    const days = [];
    for (let i = 0; i < 7; i++){ const d = addDays(w, i); if (d.getMonth() === m.getMonth() && d >= TODAY) days.push(d); }
    out.push({start: w, end, days});
  }
  return out;
}
function weekInfo(w, idx){
  const met = new Set(); let cand = 0;
  for (let i = 0; i < 7; i++){
    const d = addDays(w.start, i), k = keyOf(d);
    if (idx[k]) idx[k].forEach((x) => met.add(x.id));
    if (d >= TODAY && dayMatches(k).length) cand++;
  }
  return {met: met.size, cand};
}
function deadline(){
  const dl = new Date(TODAY.getFullYear(), TODAY.getMonth() + (TODAY.getDate() <= 5 ? 0 : 1), 5);
  const target = new Date(dl.getFullYear(), dl.getMonth() + 1, 1);
  const days = Math.round((dl - TODAY) / 86400000);
  return {dl, target, days};
}

/* ---------- render ---------- */
let raf = 0;
function scheduleRender(){ if (!raf) raf = requestAnimationFrame(() => { raf = 0; render(); }); }

function render(){
  if (raf){ cancelAnimationFrame(raf); raf = 0; }
  if (!KEY){ showLogin(); return; }
  $('#login').hidden = true;
  $('#main').hidden = false;
  $('#sync').hidden = false;
  const active = document.activeElement;
  const fid = active && active.id && active !== document.body ? active.id : null;
  const idx = planIndex();

  $('#app').dataset.who = state.who || '';
  $('#whoBox').hidden = !state.who;
  if (state.who) $('#meChip').innerHTML = ava(state.who) + esc(NAME[state.who]);

  const sync = $('#sync');
  const st = state.mode === 'loading' ? 'loading' : state.mode === 'offline' ? 'offline' : state.live ? 'live' : 'online';
  sync.dataset.state = st;
  sync.textContent = {loading:'よみこみ中', live:'ふたりで共有中', online:'共有中', offline:'オフライン'}[st];
  const notice = $('#notice');
  const msg = state.mode === 'offline' ? 'つながらないみたい。電波のいいところで開きなおしてね。' : '';
  notice.hidden = !msg; notice.textContent = msg;

  renderPush();
  renderDue();
  renderMonths();
  renderOverview(idx);
  renderHowto();
  renderWeeks(idx);
  $('#onlyMatch').checked = state.onlyMatch;
  $('#newPlan').hidden = !state.who;

  if (fid){
    const el = document.getElementById(fid);
    if (el && el !== document.activeElement) el.focus({preventScroll: true});
  }
  if (state.pop.size) setTimeout(() => state.pop.clear(), 600);
}

function renderPush(){
  let top = '', foot = '';
  switch (state.push){
    case 'install':
      if (!LS.get('futari.hideInstall')){
        top = '<section class="pushcard" aria-labelledby="pcH"><h2 id="pcH">ホーム画面に追加してアプリにしよう</h2>' +
          '<p>Safariの共有ボタン（四角から上向きの矢印が出ているマーク）から「ホーム画面に追加」を選ぶと、アイコンから開けるようになるよ。通知は、ホーム画面のアイコンから開いたときにオンにできるよ。</p>' +
          '<div class="acts"><button type="button" class="btn ghost small" data-push="hideInstall" id="pc-hide">あとで</button></div></section>';
      }
      foot = '<p>ホーム画面に追加すると通知が使えるよ</p>';
      break;
    case 'off':
      top = '<section class="pushcard" aria-labelledby="pcH"><h2 id="pcH">通知をオンにしよう</h2>' +
        '<p>相手が空きを入れたとき、シールを貼った・はがしたとき、シフト〆切の5日前と前日、来週の会う日が決まっていない日曜の夜にお知らせするよ。</p>' +
        '<div class="acts"><button type="button" class="btn sticker-btn small" data-push="on" id="pc-on">通知をオンにする</button></div></section>';
      foot = '<p>通知：オフ <button type="button" class="linkbtn" data-push="on" id="pf-on">オンにする</button></p>';
      break;
    case 'denied':
      foot = '<p>通知が許可されていないよ。iPhoneの「設定」→「通知」→「ふたり予定帳」からオンにしてね</p>';
      break;
    case 'on':
      foot = '<p>通知：オン <button type="button" class="linkbtn" data-push="test" id="pf-test">テスト通知</button><button type="button" class="linkbtn" data-push="off" id="pf-off">この端末はオフ</button></p>';
      break;
    case 'unsupported':
      foot = '<p>このブラウザは通知に対応していないみたい</p>';
      break;
  }
  $('#pushTop').innerHTML = top;
  $('#foot').innerHTML = foot + (state.who ? '<p>' + esc(NAME[state.who]) + 'として使っているよ <button type="button" class="linkbtn" id="logout">ログアウト</button></p>' : '');
}

function renderDue(){
  const {dl, target, days} = deadline();
  const box = $('#due');
  // シフト提出の5日前から〆切当日まで表示
  if (days > 5){ box.hidden = true; box.innerHTML = ''; return; }
  box.hidden = false;
  const tm = target.getMonth() + 1;
  const ti = MONTHS.findIndex((m) => monthNum(m) === monthNum(target));
  const list = plansTouching(target);
  const items = list.map(([, p]) => '<li><span class="due-d">' + esc(rangeText(p)) + '</span><span>' + esc(planTitle(p)) + (p.firm ? '' : '（仮）') + '</span></li>').join('');
  const n = days === 0 ? 'きょうが〆切！' : 'あと<span class="due-n">' + days + '</span>日';
  box.innerHTML =
    '<div class="due-stamp" aria-hidden="true">〆</div>' +
    '<div class="due-body">' +
      '<h2 id="dueH">' + tm + '月のシフト提出まで ' + n + '</h2>' +
      '<p class="due-date">提出日 ' + mdw(dl) + '</p>' +
      '<p class="due-hint">' + tm + '月の旅行やお泊まりは、それまでに決めておけると安心。</p>' +
      '<div class="due-list"><p class="due-cap">' + tm + '月にシフトを空けておきたい日</p>' +
        (list.length ? '<ul>' + items + '</ul>' : '<p class="due-empty">まだシールはないよ</p>') + '</div>' +
      '<div class="due-acts">' +
        (ti >= 0 ? '<button type="button" class="btn ghost small" data-go="' + ti + '" id="due-go">' + tm + '月をひらく</button>' : '') +
        (list.length ? '<button type="button" class="btn ghost small" id="copyMemo">メモをコピー</button>' : '') +
      '</div>' +
    '</div>';
}

function renderMonths(){
  $('#months').innerHTML = MONTHS.map((m, i) => {
    const c = plansStarting(m);
    return '<button type="button" role="tab" id="tab-' + i + '" data-tab="' + i + '" aria-selected="' + (i === state.month) + '" aria-controls="weeks">' +
      (m.getMonth() + 1) + '月' + (c ? '<span class="tc" aria-label="予定' + c + '件">' + HEART + c + '</span>' : '') + '</button>';
  }).join('');
}

function weekLabel(w){
  const k = keyOf(w.start);
  return k === THIS_WEEK ? '今週' : k === NEXT_WEEK ? '来週' : md(w.start) + '〜';
}

function renderOverview(idx){
  const m = MONTHS[state.month];
  const ws = weeksOfMonth(state.month);
  const infos = ws.map((w) => weekInfo(w, idx));
  const met = infos.filter((x) => x.met > 0).length;
  const lead = state.month === 0 ? '今月のこり' + ws.length + '週' : (m.getMonth() + 1) + '月は' + ws.length + '週';
  $('#pace').innerHTML = ws.length
    ? lead + '、会う予定がある週 <b>' + met + '</b>/' + ws.length + (met === ws.length ? '<span class="yay">週1ペースばっちり ♡</span>' : '')
    : 'この月はもう終わりだよ';
  $('#wstrip').innerHTML = ws.map((w, i) => {
    const inf = infos[i];
    const cls = inf.met ? 'met' : inf.cand ? 'cand' : 'none';
    const icon = inf.met ? HEART : inf.cand ? HEART_O : '<span>・</span>';
    const label = md(w.start) + 'からの週：' + (inf.met ? '会う予定あり' : inf.cand ? 'ふたり空き' + inf.cand + '日' : 'まだ合う日なし');
    return '<li><button type="button" class="wp ' + cls + '" data-week="' + keyOf(w.start) + '" id="wp-' + keyOf(w.start) + '" aria-label="' + esc(label) + '"><span>' + esc(weekLabel(w)) + '</span><span class="wp-i">' + icon + '</span></button></li>';
  }).join('');
}

function renderHowto(){
  const box = $('#howto');
  if (!state.who){ box.innerHTML = ''; return; }
  const mine = Object.keys(state.avail).some((k) => k.endsWith('_' + state.who) && Object.values(state.avail[k]).some(Boolean));
  if (mine){ box.innerHTML = ''; return; }
  box.innerHTML = '<div class="howto"><h2>つかいかた</h2><ol>' +
    '<li>空いてるコマ（朝・昼・夜・泊まり）をタップ。もう一回タップで取り消し</li>' +
    '<li>' + (state.who === 'shioka' ? 'ゆうと' : 'しおか') + 'も自分のリンクから同じように入力</li>' +
    '<li>ふたりとも空いてるコマが黄色の♡に。「この日にする」で予定のシールを貼ろう</li>' +
    '</ol></div>';
}

function slotHTML(k, d, sl){
  const sOn = !!av(k, 'shioka')[sl.k], yOn = !!av(k, 'yuto')[sl.k];
  const m = sOn && yOn;
  const me = state.who ? !!av(k, state.who)[sl.k] : false;
  const c = ['slot'];
  if (sl.k === 'tomari') c.push('stay');
  if (me) c.push('mine');
  if (m) c.push('match');
  if (state.pop.has(k + '-' + sl.k)) c.push('pop');
  const label = mdw(d) + ' ' + sl.l + '：しおか ' + (sOn ? '空き' : 'まだ') + '、ゆうと ' + (yOn ? '空き' : 'まだ') + (m ? '。ふたりとも空き' : '');
  return '<button type="button" class="' + c.join(' ') + '" id="s-' + k + '-' + sl.k + '" data-date="' + k + '" data-slot="' + sl.k + '" aria-pressed="' + me + '"' +
    (!state.who ? ' aria-disabled="true"' : '') + ' aria-label="' + esc(label) + '">' +
    '<span class="sl" aria-hidden="true">' + sl.l + '</span>' +
    '<span class="dots" aria-hidden="true"><i class="dot s' + (sOn ? ' on' : '') + '"></i><i class="dot y' + (yOn ? ' on' : '') + '"></i></span>' +
    (m ? '<span class="hz" aria-hidden="true">' + HEART + '</span>' : '') +
    '</button>';
}

function stickerHTML(x){
  const id = x.id, p = x.p, r = rotFor(id);
  if (x.i > 0){
    return '<div class="cont" style="--r:' + (r * 0.6) + 'deg"><span>' + esc(planTitle(p)) + '</span><small>つづき・' + (x.i + 1) + '日目</small></div>';
  }
  const open = state.open === id, ask = state.ask === id;
  const warn = planWarn(p);
  const stamp = p.firm ? '<span class="hanko">決定</span>' : '<span class="kari">仮</span>';
  const inner = '<span class="st-title">' + esc(planTitle(p)) + '</span><span class="st-meta">' + esc(planMeta(p)) + '</span>' + stamp;
  const aria = esc(planTitle(p) + '、' + planMeta(p) + '、' + (p.firm ? '決定' : '仮'));
  let h = '<div class="stk' + (state.justStuck === id ? ' new' : '') + '">';
  h += '<button type="button" class="sticker ' + (p.firm ? 'firm' : 'tent') + '" id="st-' + id + '" data-act="toggle" data-id="' + id + '" aria-expanded="' + (open || ask) + '" style="--r:' + r + 'deg" aria-label="' + aria + '">' + inner + '</button>';
  if (warn) h += '<p class="st-warn">' + esc(warn) + '</p>';
  if (open){
    h += '<div class="st-acts">' +
      '<button type="button" class="mini" data-act="firm" data-id="' + id + '" id="sa-' + id + '-firm">' + (p.firm ? '仮にもどす' : '決定にする') + '</button>' +
      '<button type="button" class="mini" data-act="edit" data-id="' + id + '" id="sa-' + id + '-edit">なおす</button>' +
      '<button type="button" class="mini peel" data-act="ask" data-id="' + id + '" id="sa-' + id + '-ask">はがす</button>' +
      '</div>';
  }
  if (ask){
    h += '<div class="st-ask" role="group" aria-labelledby="sq-' + id + '"><p id="sq-' + id + '">どうしたの？</p><div class="st-reasons">' +
      '<button type="button" class="mini" data-act="bye" data-r="work" data-id="' + id + '" id="sa-' + id + '-work">お仕事が入った</button>' +
      '<button type="button" class="mini" data-act="bye" data-r="friend" data-id="' + id + '" id="sa-' + id + '-friend">友達と予定</button>' +
      '<button type="button" class="mini" data-act="bye" data-r="other" data-id="' + id + '" id="sa-' + id + '-other">ほかの用事</button>' +
      '<button type="button" class="mini ghost" data-act="keep" data-id="' + id + '" id="sa-' + id + '-keep">やっぱり残す</button>' +
      '</div></div>';
  }
  return h + '</div>';
}

function dayHTML(d, idx){
  const k = keyOf(d), dow = d.getDay(), hol = HOLI[k];
  const cls = ['day'];
  if (dow === 6) cls.push('sat');
  if (dow === 0 || hol) cls.push('sun');
  if (k === TODAY_K) cls.push('today');
  const matched = dayMatches(k);
  const plans = idx[k] || [];
  let h = '<li class="' + cls.join(' ') + '">';
  h += '<div class="date"><span class="d">' + d.getDate() + '</span><span class="wd">' + WD[dow] + '</span>' +
    (hol ? '<span class="hol" title="' + esc(hol) + '">祝</span>' : '') +
    (k === TODAY_K ? '<span class="today-tag">きょう</span>' : '') + '</div>';
  h += '<div class="slots">' + SLOTS.map((sl) => slotHTML(k, d, sl)).join('') + '</div>';
  let under = plans.map((x) => stickerHTML(x)).join('');
  if (matched.length && !plans.length && state.who){
    under += '<button type="button" class="make" data-make="' + k + '" id="mk-' + k + '">' + HEART +
      '<span>' + matched.map((s) => SLOT_L[s]).join('・') + ' がふたりとも空いてる</span><b>この日にする</b></button>';
  }
  if (under) h += '<div class="under">' + under + '</div>';
  return h + '</li>';
}

function renderWeeks(idx){
  const ws = weeksOfMonth(state.month);
  if (!ws.length){ $('#weeks').innerHTML = '<p class="wempty">この月の残りはないよ。となりの月を見てね。</p>'; return; }
  $('#weeks').innerHTML = ws.map((w) => {
    const inf = weekInfo(w, idx);
    const t = 't' + (Math.floor(w.start.getTime() / 604800000) % 3 + 3) % 3;
    const label = weekLabel(w);
    const range = md(w.start) + '〜' + md(w.end);
    const plain = label === md(w.start) + '〜';
    const stat = inf.met
      ? '<span class="wstat met"><span class="duo" aria-hidden="true">' + ava('shioka') + ava('yuto') + '</span>会える' + (inf.met > 1 ? ' ×' + inf.met : '') + '</span>'
      : inf.cand ? '<span class="wstat cand">ふたり空き ' + inf.cand + '日</span>'
      : '<span class="wstat none">まだ合う日なし</span>';
    let days = w.days;
    if (state.onlyMatch) days = days.filter((d) => { const k = keyOf(d); return dayMatches(k).length || idx[k]; });
    const body = days.length
      ? '<ol class="days">' + days.map((d) => dayHTML(d, idx)).join('') + '</ol>'
      : '<p class="wempty">' + (state.onlyMatch ? 'この週はふたりの空きがまだ合ってないよ' : 'この週の日にちはとなりの月にあるよ') + '</p>';
    return '<section class="week" id="w-' + keyOf(w.start) + '" aria-label="' + esc(range + 'の週') + '">' +
      '<div class="week-h"><h2 class="tape ' + t + '"><b>' + esc(plain ? range : label) + '</b>' + (plain ? '' : '<small>' + range + '</small>') + '</h2>' + stat + '</div>' +
      body + '</section>';
  }).join('');
}

/* ---------- server ---------- */
function sleep(ms){ return new Promise((r) => setTimeout(r, ms)); }
async function api(method, path, body){
  const opts = {method, headers: {'x-key': KEY}, cache: 'no-store'};
  if (body !== undefined){ opts.headers['content-type'] = 'application/json'; opts.body = JSON.stringify(body); }
  let r;
  try { r = await fetch(path, opts); } catch (e) { throw {code: 'network'}; }
  if (r.status === 401){ logout(true); throw {code: 'unauthorized'}; }
  if (!r.ok) throw {code: 'http', status: r.status};
  return r.json();
}
function retry1(fn){
  return fn().catch((e) => {
    if (e && (e.code === 'network' || (e.code === 'http' && e.status >= 500))) return sleep(700 + Math.random() * 600).then(fn);
    throw e;
  });
}
function writeError(e){
  if (e && e.code === 'unauthorized') return;
  toast(e && e.code === 'network' ? '保存できなかったよ。電波を確認してね' : 'うまく保存できなかったよ。もう一度ためしてね');
  refresh();
}

const pendAvail = new Map();
const pendPlan = new Map();
const chains = {};

function queueAvail(key){
  let p = pendAvail.get(key);
  if (!p){ p = {t: 0, busy: false, again: false}; pendAvail.set(key, p); }
  clearTimeout(p.t);
  p.t = setTimeout(() => flushAvail(key), 400);
}
async function flushAvail(key){
  const p = pendAvail.get(key);
  if (!p) return;
  p.t = 0;
  if (p.busy){ p.again = true; return; }
  p.busy = true;
  try {
    const v = normAvail(state.avail[key] || {});
    await retry1(() => api('PUT', '/api/avail', Object.assign({date: key.slice(0, key.lastIndexOf('_'))}, v)));
  } catch (e) { writeError(e); }
  p.busy = false;
  if (p.again){ p.again = false; flushAvail(key); return; }
  if (!p.t) pendAvail.delete(key);
}
function serial(id, fn){
  pendPlan.set(id, (pendPlan.get(id) || 0) + 1);
  const run = (chains[id] || Promise.resolve())
    .then(() => retry1(fn))
    .catch(writeError)
    .finally(() => {
      const n = (pendPlan.get(id) || 1) - 1;
      if (n <= 0) pendPlan.delete(id); else pendPlan.set(id, n);
    });
  chains[id] = run;
  return run;
}
const writePlan = (id, data, restore) => serial(id, () => api('PUT', '/api/plan/' + encodeURIComponent(id) + (restore ? '?restore=1' : ''), data));
const removePlan = (id, reason) => serial(id, () => api('DELETE', '/api/plan/' + encodeURIComponent(id) + '?reason=' + encodeURIComponent(reason || 'other')));

function applyState(s){
  const avs = {};
  for (const k of Object.keys(s.avail || {})) avs[k] = normAvail(s.avail[k]);
  for (const k of pendAvail.keys()) if (state.avail[k]) avs[k] = state.avail[k];
  const pls = {};
  for (const id of Object.keys(s.plans || {})){ const v = s.plans[id]; if (v && isKey(String(v.date).slice(0, 10))) pls[id] = normPlan(v); }
  for (const id of pendPlan.keys()){ if (state.plans[id]) pls[id] = state.plans[id]; else delete pls[id]; }
  state.avail = avs;
  state.plans = pls;
  if (state.open && !pls[state.open]) state.open = null;
  if (state.ask && !pls[state.ask]) state.ask = null;
  if (s.me) state.who = s.me;
  if (s.vapidKey) state.vapidKey = s.vapidKey;
  if (typeof s.pushCount === 'number') state.pushCount = s.pushCount;
}
async function load(){
  try {
    const s = await retry1(() => api('GET', '/api/state'));
    applyState(s);
    state.mode = 'online';
    render();
    connectWS();
    initPush();
  } catch (e) {
    if (e && e.code === 'unauthorized') return;
    state.mode = 'offline';
    render();
  }
}
let refreshing = false;
async function refresh(){
  if (refreshing || !KEY) return;
  refreshing = true;
  try {
    const s = await api('GET', '/api/state');
    applyState(s);
    state.mode = 'online';
  } catch (e) {
    if (e && e.code === 'network') state.mode = 'offline';
  }
  refreshing = false;
  scheduleRender();
}

/* realtime */
let ws = null, wsTimer = 0, wsBackoff = 1000, pingT = 0;
function connectWS(){
  if (!KEY || document.hidden) return;
  if (ws && (ws.readyState === 0 || ws.readyState === 1)) return;
  try {
    ws = new WebSocket((location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/api/ws?k=' + encodeURIComponent(KEY));
  } catch (e) { return; }
  ws.onopen = () => {
    wsBackoff = 1000; state.live = true; scheduleRender();
    clearInterval(pingT);
    pingT = setInterval(() => { try { ws.send('ping'); } catch (e) {} }, 25000);
  };
  ws.onmessage = (e) => {
    if (e.data === 'pong') return;
    let m; try { m = JSON.parse(e.data); } catch (_) { return; }
    if (m.t === 'avail'){
      if (pendAvail.has(m.key)) return;
      if (m.v) state.avail[m.key] = normAvail(m.v); else delete state.avail[m.key];
    } else if (m.t === 'plan'){
      if (pendPlan.has(m.id)) return;
      if (m.v) state.plans[m.id] = normPlan(m.v);
      else { delete state.plans[m.id]; if (state.open === m.id) state.open = null; if (state.ask === m.id) state.ask = null; }
    } else return;
    scheduleRender();
  };
  ws.onclose = () => {
    state.live = false; clearInterval(pingT); scheduleRender();
    if (!document.hidden){ clearTimeout(wsTimer); wsTimer = setTimeout(connectWS, wsBackoff); wsBackoff = Math.min(wsBackoff * 2, 30000); }
  };
  ws.onerror = () => {};
}
document.addEventListener('visibilitychange', () => {
  if (document.hidden || !KEY || !state.who) return;
  const before = TODAY_K;
  setToday();
  if (before !== TODAY_K) state.month = 0;
  refresh();
  connectWS();
});

/* ---------- push ---------- */
let swReg = null;
function unb64u(s){
  s = s.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  const bin = atob(s), u = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
  return u;
}
async function initPush(){
  if (!('serviceWorker' in navigator)){ state.push = 'unsupported'; render(); return; }
  try { swReg = await navigator.serviceWorker.register('/sw.js'); } catch (e) { state.push = 'unsupported'; render(); return; }
  if (!('PushManager' in window) || !('Notification' in window)){
    state.push = IS_IOS && !STANDALONE ? 'install' : 'unsupported';
    render(); return;
  }
  if (Notification.permission === 'denied'){ state.push = 'denied'; render(); return; }
  let sub = null;
  try { sub = await swReg.pushManager.getSubscription(); } catch (e) {}
  if (sub && Notification.permission === 'granted'){
    state.push = 'on';
    try { const r = await api('PUT', '/api/push', sub.toJSON()); state.pushCount = r.pushCount; } catch (e) {}
  } else {
    state.push = 'off';
  }
  render();
}
async function enablePush(){
  let perm = 'default';
  try { perm = await Notification.requestPermission(); } catch (e) {}
  if (perm !== 'granted'){
    state.push = perm === 'denied' ? 'denied' : 'off';
    render();
    if (perm !== 'denied') toast('通知はまだオフのままだよ');
    return;
  }
  try {
    const reg = swReg || await navigator.serviceWorker.ready;
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: unb64u(state.vapidKey)});
    const r = await api('PUT', '/api/push', sub.toJSON());
    state.push = 'on'; state.pushCount = r.pushCount;
    render();
    toast('通知をオンにしたよ ♡');
  } catch (e) {
    toast('通知をオンにできなかったよ。もう一度ためしてね');
  }
}
async function disablePush(){
  try {
    const reg = swReg || await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.getSubscription();
    if (sub){
      await api('DELETE', '/api/push', {endpoint: sub.endpoint}).catch(() => {});
      await sub.unsubscribe();
    }
    state.push = 'off';
    render();
    toast('この端末の通知をオフにしたよ');
  } catch (e) { toast('うまくオフにできなかったよ'); }
}
async function testPush(){
  try {
    const r = await api('POST', '/api/push/test');
    toast(r.sent ? 'テスト通知を送ったよ' : '通知が届く端末が見つからなかったよ。オンにしなおしてね');
  } catch (e) { toast('テスト通知を送れなかったよ'); }
}

/* ---------- login ---------- */
function showLogin(msg){
  $('#login').hidden = false;
  $('#main').hidden = true;
  $('#whoBox').hidden = true;
  $('#sync').hidden = true;
  const err = $('#loginErr');
  err.hidden = !msg; err.textContent = msg || '';
}
function logout(expired){
  LS.set('futari.key', null);
  KEY = null;
  try { history.replaceState(null, '', '/'); } catch (e) {}
  try { if (ws) ws.close(); } catch (e) {}
  state.who = null;
  showLogin(expired ? 'このリンクは使えないみたい。合言葉をもう一度入れてね' : '');
}
$('#loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  let k = $('#loginKey').value.trim();
  const m = k.match(/[?&]k=([^&#\s]+)/);
  if (m) k = decodeURIComponent(m[1]);
  if (!k){ showLogin('合言葉を入れてね'); return; }
  try {
    const r = await fetch('/api/state', {headers: {'x-key': k}, cache: 'no-store'});
    if (r.status === 401){ showLogin('合言葉がちがうみたい'); return; }
    if (!r.ok) throw new Error('http');
    LS.set('futari.key', k);
    location.replace('/?k=' + encodeURIComponent(k));
  } catch (err) { showLogin('つながらないみたい。電波を確認してね'); }
});

/* ---------- actions ---------- */
function toggleSlot(btn){
  if (btn.getAttribute('aria-disabled') === 'true'){ toast('よみこみ中だよ。少し待ってね'); return; }
  const date = btn.dataset.date, slot = btn.dataset.slot;
  const key = date + '_' + state.who;
  const cur = normAvail(state.avail[key] || {});
  cur[slot] = !cur[slot];
  state.avail[key] = cur;
  if (cur[slot] && isMatch(date, slot)) state.pop.add(date + '-' + slot);
  render();
  queueAvail(key);
}
function setFirm(id){
  const p = state.plans[id];
  if (!p) return;
  const next = Object.assign({}, p, {firm: !p.firm, updatedAt: new Date().toISOString()});
  state.plans[id] = next;
  render();
  toast(next.firm ? '決定のハンコを押したよ' : '仮にもどしたよ');
  writePlan(id, next);
}
function burst(rect){
  const fx = $('#fx');
  const cx = rect.left + rect.width / 2, cy = rect.top + rect.height / 2;
  const colors = ['var(--shioka)', 'var(--yuto)', 'var(--match)'];
  for (let i = 0; i < 10; i++){
    const h = document.createElement('span');
    h.className = 'heart';
    h.innerHTML = HEART;
    h.style.left = (cx - 8 + (Math.random() - .5) * rect.width * .6) + 'px';
    h.style.top = (cy - 7) + 'px';
    h.style.color = colors[i % 3];
    h.style.setProperty('--dx', Math.round((Math.random() - .5) * 170) + 'px');
    h.style.setProperty('--dy', Math.round(-60 - Math.random() * 110) + 'px');
    h.style.setProperty('--rot', Math.round((Math.random() - .5) * 70) + 'deg');
    h.style.animationDelay = Math.round(Math.random() * 160) + 'ms';
    fx.appendChild(h);
    setTimeout(() => h.remove(), 1300);
  }
}
function peelAway(id, reason){
  const p = state.plans[id];
  if (!p) return;
  const el = document.getElementById('st-' + id);
  if (el && !REDUCE){
    const rect = el.getBoundingClientRect();
    const clone = el.cloneNode(true);
    clone.removeAttribute('id');
    clone.classList.add('peeling');
    Object.assign(clone.style, {left: rect.left + 'px', top: rect.top + 'px', width: rect.width + 'px', height: rect.height + 'px'});
    $('#fx').appendChild(clone);
    setTimeout(() => clone.remove(), 900);
    burst(rect);
  }
  if (navigator.vibrate) try { navigator.vibrate(30); } catch (e) {}
  delete state.plans[id];
  state.open = state.ask = null;
  render();
  toast(BYE[reason] || BYE.other, () => {
    state.plans[id] = p;
    state.justStuck = id;
    render();
    setTimeout(() => { if (state.justStuck === id) state.justStuck = null; }, 700);
    writePlan(id, p, true);
  });
  removePlan(id, reason);
}

/* ---------- toast ---------- */
let toastTimer = 0;
function toast(msg, undo){
  const t = $('#toast');
  $('#toastMsg').textContent = msg;
  const b = $('#toastUndo');
  b.hidden = !undo;
  b.onclick = undo ? () => { hideToast(); undo(); } : null;
  t.hidden = false;
  t.classList.remove('show'); void t.offsetWidth; t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(hideToast, undo ? 7000 : 2600);
}
function hideToast(){ $('#toast').hidden = true; clearTimeout(toastTimer); }

/* ---------- sheet ---------- */
const sheet = $('#sheet');
const form = $('#planForm');
function sheetMatchHint(){
  const date = $('#pDate').value;
  const hint = $('#pMatch');
  document.querySelectorAll('#slotChips input').forEach((i) => {
    i.nextElementSibling.innerHTML = SLOT_L[i.value] + (isKey(date) && isMatch(date, i.value) ? HEART : '');
  });
  $('#stayLabel').innerHTML = '泊まる' + (isKey(date) && isMatch(date, 'tomari') ? HEART : '');
  if (!isKey(date)){ hint.textContent = ''; return; }
  const m = dayMatches(date);
  hint.innerHTML = m.length ? 'ふたりとも空いてる：<b>' + m.map((s) => SLOT_L[s]).join('・') + '</b>（♡がついてるよ）' : 'この日はまだ空きが合ってないけど、貼っても大丈夫だよ';
}
function syncNights(){ $('#nightsRow').hidden = form.elements.stay.value !== '1'; }
function openSheet(opts){
  if (!state.who) return;
  const id = opts.id || null;
  const p = id ? state.plans[id] : null;
  const date = p ? p.date : opts.date;
  state.editing = id;
  $('#pDate').value = date;
  $('#pDate').min = TODAY_K;
  $('#pTitle').value = p ? p.title : '';
  const matched = dayMatches(date);
  const slots = p ? p.slots : matched.filter((s) => s !== 'tomari');
  document.querySelectorAll('#slotChips input').forEach((i) => { i.checked = slots.includes(i.value); });
  form.elements.stay.value = (p ? p.nights > 0 : matched.includes('tomari')) ? '1' : '0';
  form.elements.nights.value = String(p && p.nights > 0 ? Math.min(3, p.nights) : 1);
  form.elements.firm.value = p && p.firm ? '1' : '0';
  $('#pErr').hidden = true;
  $('#sheetTitle').textContent = id ? '予定をなおす' : '予定のシールを貼る';
  $('#saveBtn').textContent = id ? 'これでOK' : 'シールを貼る';
  syncNights();
  sheetMatchHint();
  sheet.showModal();
}
form.addEventListener('submit', (e) => {
  e.preventDefault();
  const date = $('#pDate').value;
  const err = $('#pErr');
  if (!isKey(date)){ err.textContent = '日にちを選んでね'; err.hidden = false; return; }
  const slots = Array.from(document.querySelectorAll('#slotChips input:checked')).map((i) => i.value);
  const stay = form.elements.stay.value === '1';
  if (!slots.length && !stay){ err.textContent = '時間帯か「泊まる」をひとつ選んでね'; err.hidden = false; return; }
  const data = {
    date, slots, nights: stay ? (Number(form.elements.nights.value) || 1) : 0,
    title: $('#pTitle').value.trim().slice(0, 40),
    firm: form.elements.firm.value === '1',
    by: state.who,
    updatedAt: new Date().toISOString()
  };
  const editing = state.editing;
  const id = editing || newId();
  state.plans[id] = data;
  state.justStuck = id;
  state.open = state.ask = null;
  const mi = MONTHS.findIndex((m) => monthNum(m) === monthNum(parseKey(date)));
  if (mi >= 0) state.month = mi;
  sheet.close();
  render();
  setTimeout(() => { if (state.justStuck === id) state.justStuck = null; }, 700);
  const el = document.getElementById('st-' + id);
  if (el) el.scrollIntoView({behavior: REDUCE ? 'auto' : 'smooth', block: 'center'});
  toast(editing ? 'なおしたよ' : 'シールを貼ったよ ♡');
  writePlan(id, data);
});
$('#cancelBtn').addEventListener('click', () => sheet.close());
sheet.addEventListener('click', (e) => { if (e.target === sheet) sheet.close(); });
$('#pDate').addEventListener('change', sheetMatchHint);
form.addEventListener('change', (e) => { if (e.target.name === 'stay') syncNights(); $('#pErr').hidden = true; });
$('#quick').addEventListener('click', (e) => {
  const b = e.target.closest('[data-q]');
  if (!b) return;
  $('#pTitle').value = b.dataset.q;
  if (b.dataset.q === '旅行'){ form.elements.stay.value = '1'; syncNights(); }
});

/* ---------- events ---------- */
$('#onlyMatch').addEventListener('change', (e) => { state.onlyMatch = e.target.checked; LS.set('futari.onlyMatch', state.onlyMatch); render(); });
$('#newPlan').addEventListener('click', () => {
  const ws = weeksOfMonth(state.month);
  const idx = planIndex();
  let date = null;
  for (const w of ws) for (const d of w.days){ const k = keyOf(d); if (!date && dayMatches(k).length && !idx[k]) date = k; }
  if (!date) date = ws.length && ws[0].days.length ? keyOf(ws[0].days[0]) : TODAY_K;
  openSheet({date});
});
document.addEventListener('click', (e) => {
  const tab = e.target.closest('[data-tab]');
  if (tab){ state.month = Number(tab.dataset.tab); state.open = state.ask = null; render(); return; }
  const go = e.target.closest('[data-go]');
  if (go){ state.month = Number(go.dataset.go); render(); $('#months').scrollIntoView({behavior: REDUCE ? 'auto' : 'smooth', block: 'start'}); return; }
  const wk = e.target.closest('[data-week]');
  if (wk){ const s = document.getElementById('w-' + wk.dataset.week); if (s) s.scrollIntoView({behavior: REDUCE ? 'auto' : 'smooth', block: 'start'}); return; }
  const pb = e.target.closest('[data-push]');
  if (pb){
    const a = pb.dataset.push;
    if (a === 'on') enablePush();
    else if (a === 'off') disablePush();
    else if (a === 'test') testPush();
    else if (a === 'hideInstall'){ LS.set('futari.hideInstall', true); render(); }
    return;
  }
  if (e.target.closest('#logout')){ logout(false); return; }
  if (e.target.closest('#copyMemo')){ copyMemo(); return; }
});
$('#weeks').addEventListener('click', (e) => {
  const b = e.target.closest('button');
  if (!b) return;
  if (b.classList.contains('slot')){ toggleSlot(b); return; }
  if (b.dataset.make){ openSheet({date: b.dataset.make}); return; }
  const id = b.dataset.id;
  switch (b.dataset.act){
    case 'toggle': state.open = (state.open === id || state.ask === id) ? null : id; state.ask = null; render(); break;
    case 'firm': setFirm(id); break;
    case 'edit': state.open = null; render(); openSheet({id}); break;
    case 'ask': state.ask = id; state.open = null; render(); { const f = document.getElementById('sa-' + id + '-work'); if (f) f.focus(); } break;
    case 'keep': state.ask = null; state.open = id; render(); { const f = document.getElementById('st-' + id); if (f) f.focus(); } break;
    case 'bye': peelAway(id, b.dataset.r); break;
  }
});
function copyMemo(){
  const {target} = deadline();
  const list = plansTouching(target);
  const text = (target.getMonth() + 1) + '月 シフトを空けておきたい日\n' + list.map(([, p]) => rangeText(p) + ' ' + planTitle(p) + (p.firm ? '' : '（仮）')).join('\n');
  try {
    navigator.clipboard.writeText(text).then(() => toast('コピーしたよ'), () => toast('コピーできなかったので、リストを長押しでコピーしてね'));
  } catch (err) { toast('コピーできなかったので、リストを長押しでコピーしてね'); }
}

/* ---------- start ---------- */
$('#pair').innerHTML = ava('shioka') + ava('yuto') + '<span class="ph">' + HEART + '</span>';
if (KEY){ render(); load(); }
else showLogin();
})();
