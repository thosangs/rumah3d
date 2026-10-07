// Indeks plafon dari model SKP: hanya segitiga yang menghadap ke BAWAH (plafon, sisi bawah dak/kanopi/tangga),
// dibagi ke sel grid 0,5 m supaya pencarian tinggi plafon di (x, z) murah (raycast ke 200 rb segitiga ±10 ms/titik,
// terlalu lambat untuk menyusuri jalur kabel per 10 cm). Dibangun sekali setelah GLB termuat.
import * as THREE from 'three';

const CELL = 0.5;
const key = (i, j) => i * 4096 + j;

export function buildPlafonIndex(root) {
  const cells = new Map();
  const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3();
  const cb = new THREE.Vector3(), ab = new THREE.Vector3();
  root.updateWorldMatrix(true, true);
  root.traverse((o) => {
    if (!o.isMesh || !o.geometry || o.userData.glbFurniture) return; // kulkas/kitchen set SKP bukan plafon
    const g = o.geometry, pos = g.attributes.position, idx = g.index, m = o.matrixWorld;
    const tri = idx ? idx.count / 3 : pos.count / 3;
    for (let t = 0; t < tri; t++) {
      const i0 = idx ? idx.getX(t * 3) : t * 3, i1 = idx ? idx.getX(t * 3 + 1) : t * 3 + 1, i2 = idx ? idx.getX(t * 3 + 2) : t * 3 + 2;
      a.fromBufferAttribute(pos, i0).applyMatrix4(m); b.fromBufferAttribute(pos, i1).applyMatrix4(m); c.fromBufferAttribute(pos, i2).applyMatrix4(m);
      cb.subVectors(c, b); ab.subVectors(a, b); n.crossVectors(cb, ab);
      const len = n.length(); if (len < 1e-9) continue;
      if (Math.abs(n.y) / len < 0.9) continue; // bukan bidang mendatar (material dua sisi → arah normal tak bisa dipercaya, pakai |y|)
      const tr = [a.x, a.y, a.z, b.x, b.y, b.z, c.x, c.y, c.z];
      const i0c = Math.floor(Math.min(a.x, b.x, c.x) / CELL), i1c = Math.floor(Math.max(a.x, b.x, c.x) / CELL);
      const j0c = Math.floor(Math.min(a.z, b.z, c.z) / CELL), j1c = Math.floor(Math.max(a.z, b.z, c.z) / CELL);
      for (let i = i0c; i <= i1c; i++) for (let j = j0c; j <= j1c; j++) {
        const k = key(i, j); let arr = cells.get(k); if (!arr) { arr = []; cells.set(k, arr); } arr.push(tr);
      }
    }
  });
  /** Semua y bidang mendatar di atas/bawah titik (x, z) — diurutkan naik. */
  const ysAt = (x, z) => {
    const arr = cells.get(key(Math.floor(x / CELL), Math.floor(z / CELL))); if (!arr) return [];
    const out = [];
    for (const t of arr) {
      const [ax, ay, az, bx, by, bz, cx, cy, cz] = t;
      // barycentric di bidang xz
      const d00 = (bx - ax) * (bx - ax) + (bz - az) * (bz - az), d01 = (bx - ax) * (cx - ax) + (bz - az) * (cz - az), d11 = (cx - ax) * (cx - ax) + (cz - az) * (cz - az);
      const d20 = (x - ax) * (bx - ax) + (z - az) * (bz - az), d21 = (x - ax) * (cx - ax) + (z - az) * (cz - az);
      const den = d00 * d11 - d01 * d01; if (Math.abs(den) < 1e-12) continue;
      const v = (d11 * d20 - d01 * d21) / den, w = (d00 * d21 - d01 * d20) / den, u = 1 - v - w;
      if (u < -1e-6 || v < -1e-6 || w < -1e-6) continue;
      out.push(u * ay + v * by + w * cy);
    }
    return out.sort((p, q) => p - q);
  };
  return {
    /** Bidang mendatar terendah di (x, z) dengan y di [yMin, yMax] (dunia), atau null. */
    at(x, z, yMin, yMax) { for (const y of ysAt(x, z)) if (y >= yMin && y <= yMax) return y; return null; },
    ysAt,
    size: cells.size,
  };
}
