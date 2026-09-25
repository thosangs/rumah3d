#!/usr/bin/env node
// Screenshot headless satu sudut pandang: node scripts/shot.mjs out.png --cam=x,y,z --look=x,y,z [--cut=lt1|lt2] [--fov=70] [--size=1400x800] [--url=http://localhost:8765]
// Butuh server lokal (python3 serve.py 8765) & Google Chrome. Aplikasi membaca ?shot=1&cam=&look= (lihat SHOT di src/app.js).
// Chrome dihentikan begitu PNG selesai ditulis (headless=new sering tidak keluar sendiri).
import { existsSync, statSync, rmSync } from 'node:fs';
import { spawn } from 'node:child_process';
const args = Object.fromEntries(process.argv.slice(3).map((a) => { const m = a.match(/^--([^=]+)=(.*)$/); return m ? [m[1], m[2]] : [a, true]; }));
const out = process.argv[2] || 'shot.png';
const base = args.url || 'http://localhost:8765';
const [w, h] = (args.size || '1400x800').split('x').map(Number);
const q = new URLSearchParams({ shot: '1', cam: args.cam || '8.3,1.65,8.6', look: args.look || '8.3,1.4,12' });
if (args.cut) q.set('cut', args.cut);
if (args.fov) q.set('fov', args.fov);
if (args.nofur) q.set('nofur', '1');
const url = `${base}/?${q.toString()}`;
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
if (existsSync(out)) rmSync(out);
const profile = `/tmp/rumah-shot-${process.pid}`;
const p = spawn(chrome, ['--headless=new', '--hide-scrollbars', `--window-size=${w},${h}`, `--screenshot=${out}`, `--virtual-time-budget=${args.budget || 20000}`,
  '--timeout=60000', '--no-first-run', '--no-default-browser-check', '--disable-extensions', `--user-data-dir=${profile}`, url], { stdio: 'ignore' });
const t0 = Date.now();
await new Promise((res) => {
  let stable = 0, last = -1;
  const iv = setInterval(() => {
    const done = Date.now() - t0 > 90000;
    if (existsSync(out)) { const s = statSync(out).size; if (s > 0 && s === last) stable++; last = s; }
    if (stable >= 2 || done) { clearInterval(iv); p.kill('SIGKILL'); res(); }
  }, 400);
  p.on('exit', () => { clearInterval(iv); res(); });
});
rmSync(profile, { recursive: true, force: true });
if (!existsSync(out)) { console.error('gagal: PNG tidak dibuat'); process.exit(1); }
console.log(out, `${((Date.now() - t0) / 1000).toFixed(1)}s`, url);
