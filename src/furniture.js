// Furnitur & aksesori interior mengikuti render konsep DED (hal. 21–40).
//  - Aset GLB (models/furniture): bl_* dibuat di Blender (scripts/blender/build_furniture.py), ph_* Poly Haven CC0,
//    fm_* FurniMesh (furnimesh.com, library gratis) → daftar di src/assets.js
//  - Penempatan per ruang: src/layout/*.js (x, z denah; y tinggi dari lantai; ry radian; depan aset = +z lokal)
//  - Elemen parametrik yang mengikuti geometri rumah tetap dibangun di sini: railing tangga/void motif oval,
//    lemari bawah tangga, downlight plafon.
import * as THREE from 'three';
import { LEVELS, STAIRS } from './data.js';
import { placeAsset } from './assets.js';
import ruangKeluarga from './layout/ruang-keluarga.js';
import ruangMakan from './layout/ruang-makan.js';
import kt1 from './layout/kt1.js';
import lt2Keluarga from './layout/lt2-keluarga.js';
import kt2 from './layout/kt2.js';
import ktu from './layout/ktu.js';

export const LAYOUT = { lt1: [...ruangKeluarga, ...ruangMakan, ...kt1], lt2: [...lt2Keluarga, ...kt2, ...ktu] };

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
export const FM = {
  cream: std(0xeae3d5, { roughness: 0.6 }),
  doorPanel: std(0xe4d9c3, { roughness: 0.45 }),
  stairSoffit: std(0xeeeae2, { roughness: 0.9 }), // pelat bawah tangga (warna tangga model) // panel pintu lemari krem satin (sedikit lebih gelap & lebih licin dari tembok)
  seam: std(0x8f8477, { roughness: 0.9 }), // celah/nat antar panel
  walnut: std(0x6b4a2f, { roughness: 0.55 }),
  walnutDark: std(0x54392a, { roughness: 0.6 }),
  black: std(0x17181a, { roughness: 0.45, metalness: 0.5 }),
  blackMatte: std(0x1e1f21, { roughness: 0.8 }),
  brass: std(0xb8925a, { roughness: 0.3, metalness: 0.85 }),
  white: std(0xf5f3ee, { roughness: 0.4 }),
  led: new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffc772, emissiveIntensity: 2.2, roughness: 1 }),
  downlight: new THREE.MeshStandardMaterial({ color: 0xfff4e0, emissive: 0xfff0d0, emissiveIntensity: 4, roughness: 1 }),
};

function mesh(geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  return m;
}
const B = (w, h, d, mat, x, y, z, ry) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry);
const CYL = (rt, rb, h, mat, x, y, z, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);

export function downlight(r = 0.05) {
  const g = new THREE.Group();
  g.add(CYL(r + 0.015, r + 0.015, 0.006, FM.white, 0, -0.003, 0, 20));
  g.add(CYL(r, r, 0.004, FM.downlight, 0, -0.008, 0, 20));
  return g;
}
/** Railing besi hitam motif oval memanjang di sumbu x lokal, dari x=0 ke x=len; slope = kenaikan per meter (0 datar) */
export function railingOval(len, h = 1.0, slope = 0) {
  const g = new THREE.Group();
  const dy = len * slope, L = Math.hypot(len, dy), ang = Math.atan2(dy, len);
  const rail = (y0, th) => { const r = B(L, th, th, FM.black, len / 2, y0 + dy / 2, 0); r.rotation.z = ang; return r; };
  g.add(rail(h, 0.04), rail(0.08, 0.03), rail(h * 0.5, 0.02));
  const nPost = Math.max(2, Math.round(len / 1.2) + 1);
  for (let i = 0; i < nPost; i++) { const x = (i / (nPost - 1)) * len; g.add(B(0.035, h, 0.035, FM.black, x, x * slope + h / 2, 0)); }
  const curve = new THREE.EllipseCurve(0, 0, 0.07, 0.36, 0, Math.PI * 2, false, 0);
  const pts = curve.getPoints(28).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const ovalGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 28, 0.008, 6, true);
  const n = Math.floor(len / 0.2);
  for (let i = 0; i < n; i++) {
    const x = 0.1 + i * 0.2 + (len - n * 0.2) / 2;
    g.add(mesh(ovalGeo, FM.black, x, x * slope + h * 0.52, 0));
  }
  return g;
}
/** Prisma dengan atas miring: alas di y=0, tinggi hLo di z1 dan hHi di z2, lebar depth di sumbu x (pusat x=0). */
function slopedBox(depth, z1, z2, hLo, hHi, mat) {
  const x0 = -depth / 2, x1 = depth / 2;
  const v = [
    [x0, 0, z1], [x1, 0, z1], [x1, 0, z2], [x0, 0, z2], // 0-3 alas
    [x0, hLo, z1], [x1, hLo, z1], [x1, hHi, z2], [x0, hHi, z2], // 4-7 atas (miring)
  ];
  const f = [
    [0, 2, 1], [0, 3, 2], // bawah
    [4, 5, 6], [4, 6, 7], // atas miring
    [0, 1, 5], [0, 5, 4], // sisi z1
    [3, 7, 6], [3, 6, 2], // sisi z2
    [0, 4, 7], [0, 7, 3], // muka -x (depan lemari)
    [1, 2, 6], [1, 6, 5], // muka +x (tembok)
  ];
  const pos = [];
  for (const t of f) for (const k of t) pos.push(...v[k]);
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  g.computeVertexNormals();
  return mesh(g, mat);
}
/** Garis bawah run tangga (soffit) relatif lantai lt1: trap j menempati z [yStart+0.3j, yStart+0.6j... ] dengan alas 0.6+0.2j;
 *  garis melewati sudut dalam tiap trap (ujung +z), jadi selalu ≤ alas trap di setiap z. */
export function stairSoffitAt(z) {
  const { run } = STAIRS;
  const base = run.from - LEVELS.lt1; // +0.6
  return base + (z - (run.yStart + 0.3)) * (0.2 / 0.3);
}
/** Lemari bawah tangga seperti render hal. 25–26: pintu panel krem lebar ±0,62 m dengan celah tipis, atas mengikuti
 *  kemiringan tangga, plin hitam 8 cm, garis horizontal di y 1,0, dan niche walnut 2 baris × 3 kotak berlampu LED.
 *  from..to = bentang z; hAt(z) = tinggi bawah anak tangga (dari lantai); depth = kedalaman (x). Muka lemari di x lokal −depth/2. */
export function underStairCabinet(from, to, hAt, depth = 0.98, nicheAt = [6.55, 8.05]) {
  const g = new THREE.Group();
  const gap = 0.014, plinthH = 0.08;
  const under = (z) => Math.max(0.3, stairSoffitAt(z) - 0.02); // hAt tidak dipakai: garis soffit dihitung dari data tangga
  const face = -depth / 2;
  // badan (satu prisma miring per 30 cm supaya kemiringan halus) mundur 1,5 cm di belakang bidang pintu
  const [q1, q2] = nicheAt, qy1 = 1.05, qy2 = 1.95, qd = 0.35;
  for (let z = from; z < to - 1e-6; z += 0.3) {
    const z2 = Math.min(z + 0.3, to);
    const bodyDepth = depth - 0.03;
    if (z2 > q1 + 1e-6 && z < q2 - 1e-6) {
      // segmen niche: badan bawah (0..qy1), badan atas (qy2..bawah tangga), dan badan belakang niche (di balik kedalaman qd)
      g.add(slopedBox(bodyDepth, z, z2, qy1, qy1, FM.seam)).position.x = 0.015;
      const up = slopedBox(bodyDepth, z, z2, under(z) - qy2, under(z2) - qy2, FM.seam); up.position.set(0.015, qy2, 0); g.add(up);
      const back = slopedBox(bodyDepth - qd, z, z2, qy2 - qy1, qy2 - qy1, FM.seam); back.position.set(0.015 + qd / 2, qy1, 0); g.add(back);
    } else {
      g.add(slopedBox(bodyDepth, z, z2, under(z), under(z2), FM.seam)).position.x = 0.015; // badan gelap → celah antar pintu terbaca sebagai garis
    }
  }
  // pintu-pintu panel krem (lebar ±0,62 m) sebagai prisma tipis di bidang muka, celah 6 mm
  const nDoors = Math.max(1, Math.round((to - from) / 0.62));
  const dw = (to - from) / nDoors;
  for (let i = 0; i < nDoors; i++) {
    const z1 = from + i * dw + gap / 2, z2 = from + (i + 1) * dw - gap / 2;
    const [n1, n2] = nicheAt;
    // bagian bawah pintu (y plin..1.0) & bagian atas (1.0..bawah tangga) dipisah garis horizontal 6 mm; di zona niche
    // bagian atas dilubangi (niche y 1.05–1.95) → sisakan panel atas niche saja
    const p1 = slopedBox(0.02, z1, z2, 1.0 - gap / 2 - plinthH, 1.0 - gap / 2 - plinthH, FM.doorPanel); p1.position.set(face + 0.01, plinthH, 0); g.add(p1);
    const lo = 1.0 + gap / 2;
    const inNiche = z2 > n1 + 1e-6 && z1 < n2 - 1e-6;
    if (inNiche) {
      const top = 1.95 + gap;
      const pTop = slopedBox(0.02, z1, z2, under(z1) - top, under(z2) - top, FM.doorPanel); pTop.position.set(face + 0.01, top, 0); g.add(pTop);
      const pMid = slopedBox(0.02, z1, z2, 1.05 - lo, 1.05 - lo, FM.doorPanel); pMid.position.set(face + 0.01, lo, 0); g.add(pMid);
    } else {
      const p2 = slopedBox(0.02, z1, z2, under(z1) - lo, under(z2) - lo, FM.doorPanel); p2.position.set(face + 0.01, lo, 0); g.add(p2);
    }
  }
  // soffit tangga: pelat miring krem (warna tangga) dari garis bawah trap ke atas 0,19 m — selalu di dalam volume trap
  {
    const sof = slopedBox(1.02, from, to, 0.19, 0.19, FM.stairSoffit); sof.position.set(0.02, 0, 0);
    // geser tiap vertex atas/bawah mengikuti garis miring: pakai dua prisma agar sederhana → bangun langsung
    g.remove(sof);
    const z1 = from, z2 = to, y1 = stairSoffitAt(z1) - 0.005, y2 = stairSoffitAt(z2) - 0.005;
    const geo = new THREE.BufferGeometry();
    const x0 = -0.49, x1 = 0.53; // x lokal: muka lemari −0.49 … tembok +0.53 (lebar run 8.88–9.925 relatif pusat 9.4)
    const v = [[x0, y1, z1], [x1, y1, z1], [x1, y2, z2], [x0, y2, z2], [x0, y1 + 0.19, z1], [x1, y1 + 0.19, z1], [x1, y2 + 0.19, z2], [x0, y2 + 0.19, z2]];
    const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]];
    const pos = []; for (const t of f) for (const k of t) pos.push(...v[k]);
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    g.add(mesh(geo, FM.stairSoffit));
  }
  // stringer: panel tipis di sisi terbuka tangga (x lokal −0.50), dari garis soffit sampai garis nosing (sudut atas-depan trap),
  // menutup gerigi balok anak tangga model SKP supaya sisi tangga rata seperti render
  {
    const { run } = STAIRS;
    const nosing = (z) => (run.from - LEVELS.lt1) + 0.2 + (z - run.yStart) * (0.2 / 0.3);
    const z1 = from, z2 = to;
    const b1 = stairSoffitAt(z1) - 0.025, b2 = stairSoffitAt(z2) - 0.025, t1 = nosing(z1), t2 = nosing(z2);
    const x0 = -0.545, x1 = -0.521; // x 8.855–8.879: tepat di luar balok anak tangga (x ≥ 8.88)
    const v = [[x0, b1, z1], [x1, b1, z1], [x1, b2, z2], [x0, b2, z2], [x0, t1, z1], [x1, t1, z1], [x1, t2, z2], [x0, t2, z2]];
    const f = [[0, 2, 1], [0, 3, 2], [4, 5, 6], [4, 6, 7], [0, 1, 5], [0, 5, 4], [3, 7, 6], [3, 6, 2], [0, 4, 7], [0, 7, 3], [1, 2, 6], [1, 6, 5]];
    const pos = []; for (const t of f) for (const k of t) pos.push(...v[k]);
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); geo.computeVertexNormals();
    g.add(mesh(geo, FM.stairSoffit));
  }
  // plin hitam di kaki lemari
  g.add(B(0.03, plinthH, to - from, FM.blackMatte, face + 0.02, plinthH / 2, (from + to) / 2));
  // niche walnut: kotak masuk 0,35 m, 2 baris × 3 kolom, LED strip di bawah tiap rak
  const [n1, n2] = nicheAt, nw = n2 - n1, ny1 = 1.05, ny2 = 1.95, nd = 0.35;
  g.add(B(0.02, ny2 - ny1, nw, FM.walnutDark, face + nd - 0.01, (ny1 + ny2) / 2, (n1 + n2) / 2)); // panel belakang walnut gelap
  const inner = (w, h, d, x, y, z) => g.add(B(w, h, d, FM.walnut, x, y, z));
  inner(nd, 0.02, nw, face + nd / 2, ny1 + 0.01, (n1 + n2) / 2); // dasar
  inner(nd, 0.02, nw, face + nd / 2, ny2 - 0.01, (n1 + n2) / 2); // langit-langit
  inner(nd, 0.02, nw, face + nd / 2, (ny1 + ny2) / 2, (n1 + n2) / 2); // rak tengah
  for (let c = 0; c <= 3; c++) inner(nd, ny2 - ny1, 0.02, face + nd / 2, (ny1 + ny2) / 2, n1 + (c / 3) * nw); // sekat vertikal
  for (const y of [ny2 - 0.03, (ny1 + ny2) / 2 - 0.03]) g.add(B(0.02, 0.008, nw - 0.06, FM.led, face + 0.03, y, (n1 + n2) / 2)); // LED
  // pajangan kecil: vas & buku
  g.add(CYL(0.05, 0.035, 0.22, FM.cream, face + 0.17, ny1 + 0.13, n1 + nw / 6, 16));
  g.add(CYL(0.035, 0.03, 0.16, FM.blackMatte, face + 0.17, (ny1 + ny2) / 2 + 0.1, n1 + nw / 2, 16));
  g.add(B(0.14, 0.05, 0.2, FM.walnutDark, face + 0.2, (ny1 + ny2) / 2 + 0.045, n1 + (5 / 6) * nw));
  g.add(B(0.14, 0.18, 0.04, FM.cream, face + 0.2, ny1 + 0.11, n1 + (5 / 6) * nw));
  return g;
}

export function buildFurniture(stairHeightAt) {
  const lt1 = new THREE.Group(); lt1.name = 'furnitur-lt1';
  const lt2 = new THREE.Group(); lt2.name = 'furnitur-lt2';
  const put = (grp, obj, x, z, ry = 0, y = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; grp.add(obj); return obj; };
  const CEIL1_FRONT = 3.1, CEIL1_BACK = 3.55, CEIL2 = 3.3;

  for (const it of LAYOUT.lt1) placeAsset(lt1, it.a, it);
  for (const it of LAYOUT.lt2) placeAsset(lt2, it.a, it);

  put(lt1, underStairCabinet(4.86, 9.06, (z) => stairHeightAt(z) - LEVELS.lt1, 0.98, [6.55, 8.05]), 9.4, 0); // muka lemari x 8.91; bentang = run tangga
  put(lt1, railingOval(0.6, 1.0, 0.4 / 0.6), 8.28, 4.53, 0, 0.2);
  put(lt1, railingOval(9.06 - 4.56, 1.0, (3.8 - 0.6) / (9.06 - 4.56)), 8.86, 4.56, -Math.PI / 2, 0.6);
  put(lt2, railingOval(9.06 - 3.575, 1.0, 0), 8.43, 3.575, -Math.PI / 2);
  put(lt2, railingOval(0.45, 1.0, 0), 8.43, 9.06, 0);
  for (const [x, z] of [[7.2, 9.3], [9.3, 9.3], [7.2, 12.6], [9.3, 12.6], [4.0, 9.6], [5.5, 11.2]]) put(lt1, downlight(), x, z, 0, CEIL1_FRONT);
  for (const [x, z] of [[7.3, 4.6], [4.2, 5.2], [7.2, 7.7], [5.6, 6.2]]) put(lt1, downlight(), x, z, 0, CEIL1_BACK);
  for (const [x, z] of [[7.3, 10.0], [9.2, 10.0], [7.3, 12.6], [9.2, 12.6], [7.5, 4.6], [7.5, 7.5], [4.4, 4.6], [5.0, 6.0], [4.0, 9.7], [5.6, 11.2]]) put(lt2, downlight(), x, z, 0, CEIL2);

  return { lt1, lt2 };
}
