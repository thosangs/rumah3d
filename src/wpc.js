// Lapisan WPC (tombol J, ?wpc=1): plafon luar, gimbal atap, tutup tiang teras depan.
// Data bidang = src/layout/wpc.js (sama dengan hitungan kebutuhan). Papan digambar sebagai tekstur kayu prosedural
// dengan alur tiap lebar efektif produk (atau tiap 5 cm untuk Modern 50x3) dan warna contoh dari katalog.
// Pilih produk: ?wpcp=m50 | m100 | m150 | n200 | t150 (default m100), warna: ?wpcc=C2 | BT | … atau #rrggbb.
import * as THREE from 'three';
import { PRODUK, AREA, WARNA } from './layout/wpc.js';
import { LEVELS } from './data.js';

const PANJANG_TEX = 2.0; // panjang papan yang diwakili satu ulangan tekstur (m)
const LAJUR_TEX = 4; // jumlah papan melintang dalam satu ulangan tekstur

function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const hex = (c) => new THREE.Color(c);

/** Tekstur kayu: sumbu u (lebar kanvas) = panjang papan, sumbu v = melintang; alur gelap di tepi tiap papan. */
function teksturPapan(warna, eff) {
  const W = 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); const r = rng(7);
  const base = hex(warna), lajurPx = H / LAJUR_TEX;
  const alurPx = Math.max(2, Math.round((0.006 / (eff * LAJUR_TEX)) * H)); // alur ±6 mm
  for (let i = 0; i < LAJUR_TEX; i++) {
    const c = base.clone().offsetHSL(0, (r() - 0.5) * 0.04, (r() - 0.5) * 0.06); // tiap papan sedikit beda nada
    g.fillStyle = `#${c.getHexString()}`; g.fillRect(0, i * lajurPx, W, lajurPx);
    // serat memanjang
    for (let k = 0; k < 70; k++) {
      const y = i * lajurPx + alurPx + r() * (lajurPx - 2 * alurPx), x0 = r() * W, len = 200 + r() * 700, amp = 1 + r() * 3;
      const d = c.clone().offsetHSL(0, 0, (r() < 0.6 ? -1 : 1) * (0.03 + r() * 0.07));
      g.strokeStyle = `#${d.getHexString()}`; g.globalAlpha = 0.35 + r() * 0.4; g.lineWidth = 0.6 + r() * 1.6;
      g.beginPath(); g.moveTo(x0, y); for (let x = 0; x <= len; x += 40) g.lineTo(x0 + x, y + Math.sin((x0 + x) * 0.01 + k) * amp); g.stroke();
    }
    g.globalAlpha = 1;
    // alur antar papan + sorot tipis di tepi atas papan
    g.fillStyle = `#${base.clone().multiplyScalar(0.32).getHexString()}`; g.fillRect(0, i * lajurPx, W, alurPx);
    g.fillStyle = 'rgba(255,255,255,0.10)'; g.fillRect(0, i * lajurPx + alurPx, W, 1);
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = 8;
  return t;
}

/** Quad dari 4 titik (berurutan) dengan UV: u sepanjang papan, v melintang (dalam ulangan tekstur). */
function quad(p, uv) {
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(p.flat(), 3));
  g.setAttribute('uv', new THREE.Float32BufferAttribute(uv.flat(), 2));
  g.setIndex([0, 1, 2, 0, 2, 3]); g.computeVertexNormals();
  return g;
}

/** ceilingAt(x, z, lvl) → tinggi plafon relatif lantai lvl (raycast model SKP) atau null. */
export function buildWpc(ceilingAt, opts = {}) {
  const P = PRODUK[opts.produk] || PRODUK.m100;
  const warna = WARNA[String(opts.warna || '').toUpperCase()] || opts.warna || P.contoh; // kode Duma (C2, BT, …) atau #rrggbb
  const alur = P.alur || P.eff; // jarak alur yang tampak
  const mat = new THREE.MeshStandardMaterial({ map: teksturPapan(warna, alur), roughness: 0.72, metalness: 0, side: THREE.DoubleSide });
  const U = (m) => m / PANJANG_TEX, V = (m) => m / (alur * LAJUR_TEX);
  const grp = new THREE.Group(); grp.name = 'wpc';
  const add = (geom, nama) => { const m = new THREE.Mesh(geom, mat); m.name = nama; m.receiveShadow = true; m.castShadow = false; grp.add(m); };
  for (const a of AREA) {
    for (const [i, r] of a.render.entries()) {
      const nama = `wpc-${a.id}-${i}`;
      if (a.jenis === 'plafon') {
        // tinggi tetap dari data (raycast plafon salah ambil untuk overstek & strip di atas atap carport); cadangan: raycast
        const c = r.y != null ? r.y - LEVELS[a.lvl] : ceilingAt ? ceilingAt((r.x0 + r.x1) / 2, (r.z0 + r.z1) / 2, a.lvl) : null;
        if (c == null) continue;
        const y = LEVELS[a.lvl] + c - 0.008; // 8 mm di bawah plafon model
        const P4 = [[r.x0, y, r.z0], [r.x1, y, r.z0], [r.x1, y, r.z1], [r.x0, y, r.z1]];
        const uv = P4.map(([x, , z]) => (r.arah === 'z' ? [U(z - r.z0), V(x - r.x0)] : [U(x - r.x0), V(z - r.z0)]));
        add(quad(P4, uv), nama);
      } else if (r.kotak) {
        const { x0, x1, z0, z1, y0, y1 } = r;
        const muka = [[[x0, z1], [x1, z1]], [[x1, z1], [x1, z0]], [[x1, z0], [x0, z0]], [[x0, z0], [x0, z1]]];
        muka.forEach(([[ax, az], [bx, bz]], k) => {
          const w = Math.hypot(bx - ax, bz - az);
          add(quad([[ax, y0, az], [bx, y0, bz], [bx, y1, bz], [ax, y1, az]], [[U(0), V(0)], [U(0), V(w)], [U(y1 - y0), V(w)], [U(y1 - y0), V(0)]]), `${nama}-${k}`);
        });
      } else { // bidang tegak, papan berdiri
        const { bidang, pada, a0, a1, y0, y1 } = r; const w = a1 - a0;
        const pt = (s, y) => (bidang === 'z' ? [a0 + s, y, pada] : [pada, y, a0 + s]);
        add(quad([pt(0, y0), pt(w, y0), pt(w, y1), pt(0, y1)], [[U(0), V(0)], [U(0), V(w)], [U(y1 - y0), V(w)], [U(y1 - y0), V(0)]]), nama);
      }
    }
  }
  grp.userData.produk = P.nama;
  return grp;
}
