// Furnitur & aksesori interior mengikuti render konsep DED (hal. 21–40).
//  - Aset GLB (models/furniture): bl_* dibuat di Blender (scripts/blender/build_furniture.py), ph_* Poly Haven CC0,
//    fm_* FurniMesh (furnimesh.com, library gratis) → daftar di src/assets.js
//  - Penempatan per ruang: src/layout/*.js (x, z denah; y tinggi dari lantai; ry radian; depan aset = +z lokal)
//  - Elemen parametrik yang mengikuti geometri rumah tetap dibangun di sini: railing tangga/void motif oval,
//    lemari bawah tangga. (Titik lampu plafon kini ikut lapisan listrik: src/elektrik.js, dari denah instalasi listrik.)
import * as THREE from 'three';
import { LEVELS, STAIRS } from './data.js';
import { placeAsset } from './assets.js';
import ruangKeluarga from './layout/ruang-keluarga.js';
import ruangMakan from './layout/ruang-makan.js';
import kt1 from './layout/kt1.js';
import lt2Keluarga from './layout/lt2-keluarga.js';
import kt2 from './layout/kt2.js';
import ktu from './layout/ktu.js';
import { toiletLt1, toiletLt2 } from './layout/toilet.js';
import { terasBelakang } from './layout/teras-belakang.js';

export const LAYOUT = { lt1: [...ruangKeluarga, ...ruangMakan, ...kt1, ...toiletLt1, ...terasBelakang], lt2: [...lt2Keluarga, ...kt2, ...ktu, ...toiletLt2] };

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
export const FM = {
  cream: std(0xeae3d5, { roughness: 0.6 }),
  doorPanel: std(0xe4d9c3, { roughness: 0.45 }),
  stairSoffit: std(0xeeeae2, { roughness: 0.9 }), // pelat bawah tangga (warna tangga model) // panel pintu lemari krem satin (sedikit lebih gelap & lebih licin dari tembok)
  seam: std(0x8f8477, { roughness: 0.9 }), // celah/nat antar panel
  walnut: std(0x6b4a2f, { roughness: 0.55 }),
  walnutDark: std(0x54392a, { roughness: 0.6 }),
  walnutCab: std(0x5c4332, { roughness: 0.5 }), // pintu kabinet atas dapur (lebih redup dari walnut furnitur)
  black: std(0x17181a, { roughness: 0.45, metalness: 0.5 }),
  blackMatte: std(0x1e1f21, { roughness: 0.8 }),
  brass: std(0xb8925a, { roughness: 0.3, metalness: 0.85 }),
  white: std(0xf5f3ee, { roughness: 0.4 }),
  led: new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffc772, emissiveIntensity: 2.2, roughness: 1 }),
  downlight: new THREE.MeshStandardMaterial({ color: 0xfff4e0, emissive: 0xfff0d0, emissiveIntensity: 4, roughness: 1 }),
  cabWhite: std(0xe9e9e6, { roughness: 0.35 }), // pintu kabinet bawah putih satin (render hal. 29–31)
  marbleDark: std(0x2b2e32, { roughness: 0.45 }), // top & backsplash marmer hitam (render); tidak terlalu mengilap supaya tidak memantulkan langit
  steel: std(0xb9bcc0, { roughness: 0.35, metalness: 0.9 }),
  glassBlack: std(0x0e0f11, { roughness: 0.15, metalness: 0.2 }),
  ledWarm: new THREE.MeshStandardMaterial({ color: 0xffe9c8, emissive: 0xffd9a0, emissiveIntensity: 2.5, roughness: 1 }),
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
  // stringer: panel tipis di sisi terbuka tangga (x 8.855–8.885, menutup sisi balok anak tangga model SKP di x ≥ 8.88)
  // dari garis soffit sampai gerigi trap. Tepi atasnya MENGIKUTI profil anak tangga (riser 20 × injakan 30), bukan garis
  // lurus, supaya sisi tangga rata satu bidang seperti render hal. 25–27 (tidak ada selisih antara panel dan trap).
  // Gigi panel 2 mm di atas permukaan injak dan 2 mm di depan riser → tidak z-fighting dengan balok trap.
  {
    const { run } = STAIRS;
    const rise = 0.2, tread = 0.3, lift = 0.002;
    const topAt = (j) => (run.from - LEVELS.lt1) + rise * (j + 1); // permukaan injak trap j (trap 0: 0.8)
    const zAt = (j) => run.yStart + tread * j; // muka riser trap j (trap 0: 4.56)
    const z1 = from, z2 = to;
    const jFirst = Math.max(0, Math.round((z1 - run.yStart) / tread)); // trap pertama yang risernya di z1
    const jLast = Math.round((z2 - run.yStart) / tread) - 1; // trap terakhir (injakannya berakhir di z2)
    const sh = new THREE.Shape(); // bidang (u = z dunia, v = y)
    sh.moveTo(z1, stairSoffitAt(z1) - 0.025);
    sh.lineTo(z2, stairSoffitAt(z2) - 0.025);
    sh.lineTo(z2, topAt(jLast) + lift);
    for (let j = jLast; j >= jFirst; j--) {
      sh.lineTo(zAt(j) - lift, topAt(j) + lift); // injakan trap j, dari belakang ke depan
      sh.lineTo(zAt(j) - lift, topAt(j - 1) + lift); // riser trap j turun ke injakan trap j−1
    }
    sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.03, bevelEnabled: false });
    const m = mesh(geo, FM.stairSoffit);
    m.rotation.y = -Math.PI / 2; // u → z dunia, tebal ekstrusi → −x
    m.position.x = -0.515; // x 8.885 → 8.855
    g.add(m);
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

  for (const it of LAYOUT.lt1) placeAsset(lt1, it.a, it);
  for (const it of LAYOUT.lt2) placeAsset(lt2, it.a, it);

  put(lt1, underStairCabinet(4.86, 9.06, (z) => stairHeightAt(z) - LEVELS.lt1, 0.98, [6.55, 8.05]), 9.4, 0); // muka lemari x 8.91; bentang = run tangga
  lt1.add(kitchenSet());
  lt1.add(bathFixturesLt1());
  lt2.add(bathFixturesLt2());
  put(lt1, railingOval(0.6, 1.0, 0.4 / 0.6), 8.28, 4.53, 0, 0.2);
  put(lt1, railingOval(9.06 - 4.56, 1.0, (3.8 - 0.6) / (9.06 - 4.56)), 8.86, 4.56, -Math.PI / 2, 0.6);
  put(lt2, railingOval(9.06 - 3.575, 1.0, 0), 8.43, 3.575, -Math.PI / 2);
  put(lt2, railingOval(0.45, 1.0, 0), 8.43, 9.06, 0);

  return { lt1, lt2 };
}

/** Kitchen set lengkap (menggantikan kotak kitchen set model SKP yang disembunyikan bersama lapisan furnitur, lihat app.js).
 *  Geometri: muka tembok kiri x 3.065, tembok belakang z 3.571; jendela dapur di tembok kiri (raycast SKP): kaca z 5.65–6.60,
 *  y 0.85–1.20 → kusen ±z 5.60–6.65, y 0.80–1.25 (jendela rendah & lebar tepat di atas meja seperti render hal. 29–30).
 *  Gaya render: kabinet bawah putih tanpa handle (alur hitam), kabinet atas walnut, top & backsplash marmer hitam, LED di bawah
 *  kabinet atas, kompor tanam + oven di tembok kiri (z 4.6–5.2), hood di atasnya, microwave di kabinet atas belakang. */
export function kitchenSet() {
  const g = new THREE.Group(); g.name = 'kitchen-set';
  const gap = 0.004, dT = 0.018, H = 0.74, TOP = 0.76; // badan 0.10–0.74, top 0.74–0.76
  const WIN = { z1: 5.60, z2: 6.65, y1: 0.80, y2: 1.25 };
  // --- badan kabinet bawah + plin hitam mundur 5 cm ---
  g.add(B(0.585, H - 0.10, 3.30, FM.cabWhite, 3.3675, 0.10 + (H - 0.10) / 2, 5.25)); // kiri x 3.075–3.66, z 3.60–6.90
  g.add(B(1.78, H - 0.10, 0.585, FM.cabWhite, 4.55, 0.10 + (H - 0.10) / 2, 3.8675)); // belakang x 3.66–5.44, z 3.575–4.16
  g.add(B(0.535, 0.10, 3.25, FM.blackMatte, 3.3425, 0.05, 5.25));
  g.add(B(1.73, 0.10, 0.535, FM.blackMatte, 4.525, 0.05, 3.8425));
  // --- top marmer hitam 2 cm, overhang 2 cm ---
  g.add(B(0.605, 0.02, 3.34, FM.marbleDark, 3.3775, TOP - 0.01, 5.25));
  g.add(B(1.80, 0.02, 0.605, FM.marbleDark, 4.56, TOP - 0.01, 3.8775));
  // --- backsplash marmer 0.76–1.50, jendela dibiarkan terbuka ---
  g.add(B(0.012, 0.74, WIN.z1 - 3.58, FM.marbleDark, 3.071, 0.76 + 0.37, (3.58 + WIN.z1) / 2)); // kiri sebelum jendela
  g.add(B(0.012, 1.50 - WIN.y2, WIN.z2 - WIN.z1, FM.marbleDark, 3.071, (WIN.y2 + 1.50) / 2, (WIN.z1 + WIN.z2) / 2)); // di atas jendela
  g.add(B(0.012, WIN.y1 - 0.76, WIN.z2 - WIN.z1, FM.marbleDark, 3.071, (0.76 + WIN.y1) / 2, (WIN.z1 + WIN.z2) / 2)); // strip bawah jendela 4 cm
  g.add(B(0.012, 0.74, 6.94 - WIN.z2, FM.marbleDark, 3.071, 0.76 + 0.37, (WIN.z2 + 6.94) / 2)); // kiri setelah jendela
  g.add(B(2.36, 0.74, 0.012, FM.marbleDark, 4.26, 0.76 + 0.37, 3.571)); // belakang x 3.08–5.44
  // --- pintu kabinet bawah putih (menonjol 1.8 cm), alur handle hitam di atas pintu ---
  const doorsAlong = (axis, from, to, face, skip = []) => {
    const n = Math.max(1, Math.round((to - from) / 0.6)), w = (to - from) / n;
    for (let i = 0; i < n; i++) {
      const a = from + i * w + gap / 2, b = from + (i + 1) * w - gap / 2, c = (a + b) / 2;
      if (skip.some(([s1, s2]) => c > s1 && c < s2)) continue;
      if (axis === 'z') g.add(B(dT, H - 0.14, b - a, FM.cabWhite, face + dT / 2, 0.11 + (H - 0.14) / 2, c));
      else g.add(B(b - a, H - 0.14, dT, FM.cabWhite, c, 0.11 + (H - 0.14) / 2, face + dT / 2));
    }
  };
  doorsAlong('z', 3.60, 6.90, 3.66, [[4.58, 5.22]]); // kiri; lubang oven z 4.6–5.2
  doorsAlong('x', 3.70, 5.42, 4.16); // belakang
  g.add(B(0.012, 0.03, 3.30, FM.blackMatte, 3.672, H - 0.015, 5.25)); // alur handle kiri
  g.add(B(1.72, 0.03, 0.012, FM.blackMatte, 4.56, H - 0.015, 4.172)); // alur handle belakang
  // --- oven tanam (hitam) + kompor tanam kaca hitam + hood stainless ---
  g.add(B(0.03, 0.58, 0.60, FM.blackMatte, 3.675, 0.42, 4.90));
  g.add(B(0.012, 0.30, 0.52, FM.glassBlack, 3.696, 0.42, 4.90)); // kaca pintu oven
  g.add(B(0.56, 0.02, 0.015, FM.steel, 3.70, 0.655, 4.90, Math.PI / 2)); // handle oven
  g.add(B(0.52, 0.008, 0.58, FM.glassBlack, 3.36, TOP + 0.004, 4.90)); // kompor kaca
  for (const dz of [-0.15, 0.15]) for (const dx of [-0.12, 0.12]) g.add(CYL(0.055, 0.055, 0.012, FM.black, 3.36 + dx, TOP + 0.014, 4.90 + dz, 20));
  g.add(B(0.45, 0.06, 0.60, FM.steel, 3.30, 1.55, 4.90)); // hood badan tipis
  g.add(B(0.30, 0.37, 0.30, FM.steel, 3.225, 1.765, 4.90)); // cerobong hood (sampai 1.95, masuk kabinet pendek)
  // --- kabinet atas walnut y 1.50–2.25 (karkas walnut gelap + pintu walnut 1.5 cm; LED strip di bawah) ---
  const upper = (axis, from, to, yLo, yHi, face, depth = 0.345) => {
    const len = to - from, c = (from + to) / 2, h = yHi - yLo, yc = (yLo + yHi) / 2;
    if (axis === 'z') g.add(B(depth, h, len, FM.walnutDark, face + depth / 2, yc, c));
    else g.add(B(len, h, depth, FM.walnutDark, c, yc, face + depth / 2));
    const n = Math.max(1, Math.round(len / 0.5)), w = len / n;
    for (let i = 0; i < n; i++) {
      const a = from + i * w + gap / 2, b = from + (i + 1) * w - gap / 2, cc = (a + b) / 2;
      if (axis === 'z') g.add(B(0.015, h - 0.01, b - a, FM.walnutCab, face + depth + 0.0075, yc, cc));
      else g.add(B(b - a, h - 0.01, 0.015, FM.walnutCab, cc, yc, face + depth + 0.0075));
    }
    if (axis === 'z') g.add(B(0.03, 0.012, len - 0.04, FM.ledWarm, face + depth - 0.03, yLo - 0.006, c));
    else g.add(B(len - 0.04, 0.012, 0.03, FM.ledWarm, c, yLo - 0.006, face + depth - 0.03));
  };
  upper('z', 3.60, 4.55, 1.50, 2.25, 3.075); // kiri sebelum hood
  upper('z', 4.55, 5.25, 1.95, 2.25, 3.075); // di atas hood (pendek)
  upper('z', 5.25, 6.90, 1.50, 2.25, 3.075); // kiri setelah hood (termasuk di atas jendela: kusen atas 1.25 < 1.50)
  upper('x', 3.42, 4.45, 1.50, 2.25, 3.575); // belakang kiri
  upper('x', 5.10, 5.44, 1.50, 2.25, 3.575); // belakang kanan (sebelah kulkas)
  // niche microwave di kabinet atas belakang x 4.45–5.10
  g.add(B(0.65, 0.75, 0.345, FM.walnutDark, 4.775, 1.875, 3.7475));
  g.add(B(0.60, 0.015, 0.33, FM.walnutCab, 4.775, 1.78, 3.74)); // rak dasar microwave
  g.add(B(0.52, 0.30, 0.34, FM.blackMatte, 4.775, 1.94, 3.75)); // microwave
  g.add(B(0.34, 0.20, 0.01, FM.glassBlack, 4.74, 1.95, 3.925)); // kaca pintu microwave
  g.add(B(0.65, 0.38, 0.015, FM.walnutCab, 4.775, 2.06, 3.9275)); // pintu atas niche (y 1.87–2.25)
  g.add(B(0.65, 0.33, 0.015, FM.walnutCab, 4.775, 1.665, 3.9275)); // pintu bawah niche (y 1.50–1.83)
  g.traverse((o) => { if (o.isMesh) { o.castShadow = o.receiveShadow = true; } });
  return g;
}

/** Perlengkapan kamar mandi (lantai toilet lt1 = −0,08 relatif lt1; lt2 = −0,02 relatif lt2). Kloset & wastafel = aset Blender
 *  (di layout/toilet.js); di sini: shower set, kran, floor drain, rak sabun. Posisi: shower di pojok depan-kiri (tembok z 7.095 × x 3.095),
 *  water heater di tembok depan (z 7.095) kanan shower, stop kontak IP44 ≥ 0,6 m dari kepala shower. */
function showerSet(g, x, z, y0, ry) {
  const h = new THREE.Group(); h.position.set(x, y0, z); h.rotation.y = ry; // muka +z lokal = ke ruang
  h.add(B(0.16, 0.06, 0.06, FM.steel, 0, 1.0, 0.03)); // mixer
  for (const dx of [-0.055, 0.055]) h.add(CYL(0.016, 0.016, 0.05, FM.steel, dx, 1.0, 0.075, 16).rotateX(Math.PI / 2));
  h.add(CYL(0.012, 0.012, 0.90, FM.steel, 0, 1.45, 0.03, 12)); // rel geser
  h.add(B(0.05, 0.06, 0.05, FM.steel, 0, 1.85, 0.045)); // holder
  const hs = CYL(0.012, 0.012, 0.22, FM.steel, 0, 1.78, 0.075, 12); hs.rotation.z = 0.25; h.add(hs); // hand shower
  h.add(CYL(0.035, 0.03, 0.03, FM.steel, 0.04, 1.9, 0.075, 20)); // kepala hand shower
  h.add(B(0.25, 0.015, 0.10, FM.steel, 0, 1.25, 0.05)); // rak sabun
  g.add(h);
}
function floorDrain(g, x, z, y0) { g.add(B(0.10, 0.004, 0.10, FM.steel, x, y0 + 0.002, z)); g.add(B(0.07, 0.003, 0.07, FM.blackMatte, x, y0 + 0.004, z)); }
function jetWasher(g, x, z, y0, ry) { const t = new THREE.Group(); t.position.set(x, y0, z); t.rotation.y = ry; t.add(B(0.05, 0.06, 0.03, FM.steel, 0, 0.75, 0.015)); t.add(CYL(0.01, 0.01, 0.07, FM.steel, 0, 0.72, 0.05, 12).rotateX(Math.PI / 2)); t.add(CYL(0.014, 0.014, 0.10, FM.steel, 0, 0.82, 0.03, 12)); t.add(CYL(0.02, 0.02, 0.03, FM.steel, 0, 0.78, 0.07, 12)); const hose = CYL(0.006, 0.006, 0.55, FM.blackMatte, 0, 0.45, 0.04, 8); t.add(hose); g.add(t); }
function wallTap(g, x, z, y0, ry) { const t = new THREE.Group(); t.position.set(x, y0, z); t.rotation.y = ry; t.add(CYL(0.012, 0.012, 0.09, FM.steel, 0, 0.45, 0.045, 12).rotateX(Math.PI / 2)); t.add(CYL(0.02, 0.02, 0.03, FM.steel, 0, 0.46, 0.09, 16)); g.add(t); }
export function bathFixturesLt1() {
  const g = new THREE.Group(); g.name = 'bath-lt1'; const y0 = -0.08; // lantai toilet lt1
  showerSet(g, 3.40, 7.095, y0, 0); // shower di tembok depan (sisi r. makan), pojok kiri
  floorDrain(g, 3.40, 7.55, y0);
  wallTap(g, 3.5, 8.405, y0, Math.PI); // kran tembok belakang (gayung/bak)
  wallTap(g, 9.876, 2.95, -0.10, -Math.PI / 2); // teras belakang: kran mesin cuci di tembok kanan (lantai teras −0,10)
  floorDrain(g, 9.2, 2.6, -0.10);
  g.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return g;
}
export function bathFixturesLt2() {
  const g = new THREE.Group(); g.name = 'bath-lt2'; const y0 = -0.02;
  showerSet(g, 3.40, 7.095, y0, 0); // toilet KTU: shower pojok depan-kiri
  floorDrain(g, 3.45, 7.60, y0);
  jetWasher(g, 4.655, 8.0, y0, -Math.PI / 2); // toilet KTU: jet washer di tembok kanan, samping kloset (z 7.75–8.15)
  showerSet(g, 5.05, 7.095, y0, 0); // toilet kanan: shower pojok depan-kiri (x 4.825 tembok kiri)
  floorDrain(g, 5.10, 7.60, y0);
  jetWasher(g, 6.0, 8.405, y0, Math.PI); // toilet kanan: jet washer di tembok belakang, kanan kloset (x 5.45–5.85)
  wallTap(g, 6.405, 8.1, y0, -Math.PI / 2); // kran tembok kanan (z 7.775–8.405 bebas pintu)
  g.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
  return g;
}
