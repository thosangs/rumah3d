#!/usr/bin/env node
// Render semua/sebagian sudut pandang di scripts/views.json ke folder shots/ (PNG 1400×800) lewat Chrome headless.
//   node scripts/shots.mjs                 → semua ruang
//   node scripts/shots.mjs --room=kt1      → satu ruang (bisa dipisah koma)
//   node scripts/shots.mjs --view=kt1-dari-pintu
//   opsi: --out=shots  --size=1400x800  --url=http://localhost:8765  --budget=25000
// Butuh server lokal: python3 serve.py 8765 (dari folder proyek).
import { readFileSync, mkdirSync, existsSync, statSync, rmSync } from 'node:fs';
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

function shot(v) {
  const q = new URLSearchParams({ shot: '1', cam: v.cam.join(','), look: v.look.join(',') });
  if (v.cut) q.set('cut', v.cut);
  if (v.fov) q.set('fov', v.fov);
  if (args.nofur) q.set('nofur', '1');
  const file = join(out, `${v.name}.png`);
  if (existsSync(file)) rmSync(file);
  const profile = `/tmp/rumah-shot-${process.pid}-${v.name}`;
  return new Promise((res) => {
    const p = spawn(chrome, ['--headless=new', '--hide-scrollbars', `--window-size=${w},${h}`, `--screenshot=${file}`, `--virtual-time-budget=${args.budget || 20000}`,
      '--timeout=60000', '--no-first-run', '--disable-extensions', `--user-data-dir=${profile}`, `${base}/?${q}`], { stdio: 'ignore' });
    const t0 = Date.now();
    let stable = 0, last = -1;
    const finish = () => { clearInterval(iv); p.kill('SIGKILL'); rmSync(profile, { recursive: true, force: true }); res({ ...v, file, ok: existsSync(file), secs: ((Date.now() - t0) / 1000).toFixed(1) }); };
    const iv = setInterval(() => {
      if (existsSync(file)) { const sz = statSync(file).size; if (sz > 0 && sz === last) stable++; last = sz; }
      if (stable >= 2 || Date.now() - t0 > 90000) finish();
    }, 400);
    p.on('exit', finish);
  });
}

// jalankan maks --par Chrome sekaligus (default 2)
const results = [];
const queue = [...wanted];
await Promise.all(Array.from({ length: Math.min(PAR, queue.length) }, async () => {
  while (queue.length) {
    const v = queue.shift();
    let r = await shot(v);
    // frame hitam/kosong (glitch Chrome headless, PNG < 60 KB) → ulangi sekali
    if (r.ok && statSync(r.file).size < 60000) { r = await shot(v); r.retry = true; }
    results.push(r); console.log(r.ok ? 'OK ' : 'GAGAL', r.room.padEnd(15), r.name.padEnd(20), `${r.secs}s${r.retry ? ' (ulang)' : ''}`, r.file.replace(root + '/', ''));
  }
}));
if (results.some((r) => !r.ok)) process.exit(1);
