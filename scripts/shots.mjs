#!/usr/bin/env node
// Render semua/sebagian sudut pandang di scripts/views.json ke folder shots/ (PNG 1400×800) lewat Chrome headless.
//   node scripts/shots.mjs                 → semua ruang
//   node scripts/shots.mjs --room=kt1      → satu ruang (bisa dipisah koma)
//   node scripts/shots.mjs --view=kt1-dari-pintu
//   opsi: --out=shots  --size=1400x800  --scale=1  --url=http://localhost:8765  --q='wpc=1&noelek'  --noelek  --nofur
// Butuh server lokal: python3 serve.py 8765 (dari folder proyek).
import { readFileSync, writeFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join, resolve } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = Object.fromEntries(process.argv.slice(2).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a.replace(/^--/, ''), true]; }));
const views = JSON.parse(readFileSync(join(root, 'scripts/views.json'), 'utf8')).rooms;
const PAR = Math.max(1, Math.min(4, +args.par || 2));
const out = resolve(root, args.out || 'shots');
mkdirSync(out, { recursive: true });
const base = args.url || 'http://localhost:8765';
const [w, h] = (args.size || '1400x800').split('x').map(Number);
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (!existsSync(chrome)) { console.error('Google Chrome tidak ditemukan di', chrome); process.exit(1); }

const wanted = [];
for (const [room, r] of Object.entries(views)) {
  if (args.room && !args.room.split(',').includes(room)) continue;
  for (const [name, v] of Object.entries(r.views)) {
    if (args.view && !args.view.split(',').includes(name)) continue;
    wanted.push({ room, name, ...v });
  }
}
if (!wanted.length) { console.error('tidak ada view cocok'); process.exit(1); }

// Chrome ≥ 157 tidak lagi menunggu --virtual-time-budget sebelum --screenshot (halaman dipotret sebelum model
// termuat), jadi pemotretan lewat DevTools Protocol: buka halaman, tunggu judul 'SHOT-DONE' (app.js menandai setelah GLB,
// aset furnitur, dan 6 frame tergambar), lalu Page.captureScreenshot.
// Satu Chrome per worker: tab latar belakang di Chrome yang sama tidak menjalankan requestAnimationFrame.
async function startChrome(n) {
  const profile = `/tmp/rumah-shot-${process.pid}-${n}`;
  const proc = spawn(chrome, ['--headless=new', '--hide-scrollbars', '--no-first-run', '--disable-extensions', '--remote-debugging-port=0',
    `--user-data-dir=${profile}`, 'about:blank'], { stdio: ['ignore', 'ignore', 'pipe'] });
  const url = await new Promise((res, rej) => {
    let buf = ''; const t = setTimeout(() => rej(new Error('Chrome tidak memberi alamat DevTools')), 20000);
    proc.stderr.on('data', (d) => { buf += d; const m = buf.match(/DevTools listening on (ws:\/\/\S+)/); if (m) { clearTimeout(t); res(m[1]); } });
  });
  const ws = new WebSocket(url); let msgId = 0; const pending = new Map();
  await new Promise((r) => ws.addEventListener('open', r, { once: true }));
  ws.addEventListener('message', (e) => {
    const m = JSON.parse(e.data);
    if (m.id && pending.has(m.id)) { const { res, rej } = pending.get(m.id); pending.delete(m.id); m.error ? rej(new Error(m.error.message)) : res(m.result); }
  });
  const cdp = (method, params = {}, sessionId) => new Promise((res, rej) => { const id = ++msgId; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params, sessionId })); });
  const kill = () => { try { ws.close(); proc.kill('SIGKILL'); rmSync(profile, { recursive: true, force: true }); } catch {} };
  process.on('exit', kill);
  return { cdp, kill };
}
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function shot(v, { cdp }) {
  const q = new URLSearchParams({ shot: '1', cam: v.cam.join(','), look: v.look.join(',') });
  if (v.cut) q.set('cut', v.cut);
  if (v.fov) q.set('fov', v.fov);
  if (args.nofur) q.set('nofur', '1');
  if (args.noelek || v.noelek) q.set('noelek', '1');
  for (const [k, val] of Object.entries(v.q || {})) q.set(k, val); // parameter tambahan per view (mis. wpc=1)
  if (args.q) for (const kv of String(args.q).split('&')) { const [k, val = '1'] = kv.split('='); q.set(k, val); }
  const file = join(out, `${v.name}.png`);
  if (existsSync(file)) rmSync(file);
  const t0 = Date.now();
  const { targetId } = await cdp('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp('Target.attachToTarget', { targetId, flatten: true });
  let ok = false;
  try {
    await cdp('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: +args.scale || 1, mobile: false }, sessionId);
    await cdp('Page.navigate', { url: `${base}/?${q}` }, sessionId);
    while (Date.now() - t0 < (+args.timeout || 120000)) {
      await sleep(400);
      const r = await cdp('Runtime.evaluate', { expression: 'document.title', returnByValue: true }, sessionId).catch(() => null);
      if (r && r.result && r.result.value === 'SHOT-DONE') { ok = true; break; }
    }
    if (ok) { const { data } = await cdp('Page.captureScreenshot', { format: 'png' }, sessionId); writeFileSync(file, Buffer.from(data, 'base64')); }
    else { const r = await cdp('Runtime.evaluate', { expression: 'JSON.stringify({t: document.title, ready: window.__shotReady, vis: document.visibilityState})', returnByValue: true }, sessionId).catch((e) => ({ result: { value: String(e) } })); console.error('   timeout', v.name, r.result && r.result.value); }
  } finally { await cdp('Target.closeTarget', { targetId }).catch(() => {}); }
  return { ...v, file, ok: ok && existsSync(file), secs: ((Date.now() - t0) / 1000).toFixed(1) };
}

// jalankan maks --par Chrome sekaligus (default 2)
const results = [];
const queue = [...wanted];
await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async (_, n) => {
  const cr = await startChrome(n);
  while (queue.length) {
    const v = queue.shift();
    let r = await shot(v, cr);
    // frame hitam/kosong (glitch Chrome headless, PNG < 60 KB) → ulangi sekali
    if (r.ok && statSync(r.file).size < 60000) { r = await shot(v, cr); r.retry = true; }
    results.push(r); console.log(r.ok ? 'OK ' : 'GAGAL', r.room.padEnd(15), r.name.padEnd(20), `${r.secs}s${r.retry ? ' (ulang)' : ''}`, r.file.replace(root + '/', ''));
  }
  cr.kill();
}));
if (results.some((r) => !r.ok)) process.exit(1);
