// Lapisan listrik (tekan E): stop kontak, saklar, box MCB, kWh meter, titik lampu, dan jalur kabel —
// posisinya dari gambar denah instalasi listrik (lihat src/layout/elektrik.js).
// Aset: stop kontak & saklar = kotak inbow Panasonic seri baru (1 stop kontak / 1 saklar / 2 saklar per kotak), box MCB, kWh meter,
//       lampu dinding, kamera CCTV = dibuat di Blender (scripts/blender/build_furniture.py). Tiap kotak diberi label ID (sprite)
//       yang sama dengan ID di denah 2D (docs/denah-listrik-*.svg) dan daftar kotak (docs/daftar-kotak.md).
import * as THREE from 'three';
import { loadAsset, placeAsset } from './assets.js';
import { downlight } from './furniture.js';
import { PERANGKAT, LAMPU, JALUR } from './layout/elektrik.js';

const RY = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 };
const NV = { '+z': [0, 1], '+x': [1, 0], '-z': [0, -1], '-x': [-1, 0] };
const MAT = {
  kabel: new THREE.MeshBasicMaterial({ color: 0xff6a00 }),
  data: new THREE.MeshBasicMaterial({ color: 0x1e6fd9 }), // CAT6 CCTV
  coax: new THREE.MeshBasicMaterial({ color: 0x8e3fb8 }), // coax antena TV (ungu)
  trimHitam: new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.6 }),
};

/** Label ID kotak (sprite kanvas) — putih dengan bingkai; merah = tambahan/perubahan dari DED. */
const _lbl = new Map();
function labelSprite(id, merah, lampu = false) {
  const key = id + (merah ? 'r' : '') + (lampu ? 'L' : '');
  let tex = _lbl.get(key);
  if (!tex) {
    const c = document.createElement('canvas'); c.width = 160; c.height = 72; const g = c.getContext('2d');
    g.fillStyle = lampu ? 'rgba(255,246,214,0.95)' : 'rgba(255,255,255,0.92)'; g.strokeStyle = merah ? '#c8102e' : lampu ? '#b07800' : '#222'; g.lineWidth = 6;
    g.beginPath(); g.roundRect(4, 4, 152, 64, 12); g.fill(); g.stroke();
    g.fillStyle = merah ? '#c8102e' : '#111'; g.font = 'bold 40px system-ui, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
    g.fillText(id, 80, 38);
    tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace; _lbl.set(key, tex);
  }
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: true }));
  sp.scale.set(lampu ? 0.15 : 0.12, lampu ? 0.0675 : 0.054, 1); sp.name = 'label-' + id;
  return sp;
}
function tube(a, b, r = 0.006, mat = MAT.kabel) {
  const d = new THREE.Vector3().subVectors(b, a); const len = d.length();
  if (len < 1e-4) return null;
  const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 6), mat);
  m.position.copy(a).addScaledVector(d, 0.5);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  return m;
}
/** Lampu sorot outdoor di bawah dak/kanopi: trim hitam kecil + lensa menyala. */
function spotOutdoor() {
  const g = new THREE.Group();
  const trim = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 20), MAT.trimHitam); trim.position.y = -0.015; g.add(trim);
  const d = downlight(0.03); d.position.y = -0.03; g.add(d);
  return g;
}

/** Downlight tempel (outbow) silinder hitam ⌀10 × 14 cm — untuk kanopi beratap spandek yang tidak bisa ditanami downlight. */
function silinder() {
  const g = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.14, 24), MAT.trimHitam); body.position.y = -0.07; g.add(body);
  const d = downlight(0.04); d.position.y = -0.14; g.add(d);
  return g;
}
/** Lampu sorot tanam lantai: cincin stainless ⌀11 cm rata lantai + lensa menyala menghadap ke atas. */
function sorotTanam() {
  const g = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.012, 32), new THREE.MeshStandardMaterial({ color: 0xb9bcc0, roughness: 0.3, metalness: 0.9 }));
  ring.position.y = 0.006; g.add(ring);
  const lens = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.004, 32), new THREE.MeshStandardMaterial({ color: 0xfff4e0, emissive: 0xfff0d0, emissiveIntensity: 4, roughness: 1 }));
  lens.position.y = 0.013; g.add(lens);
  return g;
}
/** Berkas cahaya hangat transparan berbentuk kerucut terbalik (1,6 m) di atas lampu sorot ke atas. */
const _berkas = new THREE.MeshBasicMaterial({ color: 0xffd9a0, transparent: true, opacity: 0.14, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending });
function berkasKeAtas() {
  const H = 1.6, m = new THREE.Mesh(new THREE.ConeGeometry(0.32, H, 24, 1, true), _berkas);
  m.rotation.x = Math.PI; m.position.y = H / 2 + 0.02; m.name = 'berkas-sorot'; m.raycast = () => {};
  return m;
}
/** Titik lampu gantung: roset fitting putih di plafon (armatur lampu gantungnya ada di furnitur, ikut tombol F). */
function roset() {
  const g = new THREE.Group();
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 24), new THREE.MeshStandardMaterial({ color: 0xf3f2ee, roughness: 0.5 }));
  m.position.y = -0.01; g.add(m);
  return g;
}
/** ceilingAt(x, z, lvl) → tinggi plafon/dak di atas titik itu relatif lantai lvl, atau null kalau tidak ada (luar). */
export function buildElektrik(ceilingAt) {
  const grp = { lt1: new THREE.Group(), lt2: new THREE.Group() };
  grp.lt1.name = 'elektrik-lt1'; grp.lt2.name = 'elektrik-lt2';
  const plafon = (x, z, lvl) => {
    const c = ceilingAt ? ceilingAt(x, z, lvl) : null;
    if (c != null) return c;
    if (lvl === 'lt2') return z < 3.5 || z > 13.5 || x < 3 ? 2.4 : 3.4; // balkon / dalam
    return z > 13.5 ? 2.8 : z < 3.5 ? 3.45 : 3.6; // carport / teras belakang / dalam (bawah dak)
  };

  // --- perangkat dinding ---
  for (const d of PERANGKAT) {
    const g = grp[d.lvl];
    const holder = new THREE.Group(); holder.position.set(d.x, d.h, d.z); holder.rotation.y = RY[d.n] ?? 0;
    holder.name = `elek-${d.t}`; holder.userData.elek = d; g.add(holder);
    if (d.t === 'stopkontak' || d.t === 'saklar1' || d.t === 'saklar2' || d.t === 'antena') {
      placeAsset(holder, d.t === 'stopkontak' ? 'pn_socket' : d.t === 'saklar1' ? 'pn_sw1' : d.t === 'saklar2' ? 'pn_sw2' : 'pn_tv', {});
      if (d.id) { // label; kotak berdampingan (< 15 cm) → label kotak kedua dinaikkan supaya tidak saling tutup
        const tetangga = PERANGKAT.filter((q) => q.lvl === d.lvl && q.id && q !== d && Math.hypot(q.x - d.x, q.z - d.z) < 0.15);
        const naik = tetangga.some((q) => q.id < d.id);
        const sp = labelSprite(d.id, !!(d.baru || d.rev)); sp.position.set(0, naik ? 0.145 : 0.085, 0.03); holder.add(sp);
      }
    } else if (d.t === 'cctv') {
      // kamera: pelat bracket di bidang pasang; kepala ('head') diputar. Tembok: yaw relatif normal + pitch. Plafon ('dn'):
      // holder diputar Y(yaw dunia) lalu X(+90°) supaya lengan menggantung; kepala ditegakkan −(90°−pitch).
      if (d.n === 'dn') { holder.position.y = plafon(d.x, d.z, d.lvl); holder.rotation.order = 'YXZ'; holder.rotation.y = d.yaw; holder.rotation.x = Math.PI / 2; }
      placeAsset(holder, 'cctv_bullet', { onLoad: (h) => {
        const head = h.getObjectByName('head'); if (!head) return;
        head.rotation.order = 'YXZ';
        if (d.n === 'dn') head.rotation.x = -(Math.PI / 2 - d.pitch);
        else { head.rotation.y = d.yaw; head.rotation.x = d.pitch; }
      } });
    } else if (d.t === 'mcb') placeAsset(holder, 'mcb_box', {});
    else if (d.t === 'kwh') placeAsset(holder, 'kwh_meter', {});
    else if (d.t === 'sconce') {
      if (!d.skp) placeAsset(holder, 'sconce', {}); // skp: armatur sudah ada di model SKP
      if (d.lid) { const sp = labelSprite(d.lid, !!(d.baru || d.rev), true); sp.position.set(0, 0.14, 0.06); holder.add(sp); }
    }
  }
  // --- titik lampu ---
  for (const l of LAMPU) {
    const c = ceilingAt ? ceilingAt(l.x, l.z, l.lvl) : null;
    const keAtas = l.j === 'uplight' || l.j === 'tanam';
    const y = keAtas ? l.h : c ?? l.h ?? plafon(l.x, l.z, l.lvl); // sorot ke atas: di lantai/tanah, bukan plafon
    // skp: armatur sudah ada di model SKP → tidak digambar dobel (hanya label ID)
    const o = l.skp ? new THREE.Group() : l.j === 'tempel' ? silinder() : l.j === 'gantung' ? roset() : l.j === 'tanam' ? sorotTanam() : l.w === 'out' ? spotOutdoor() : downlight(l.w === 9 ? 0.06 : 0.045);
    o.position.set(l.x, y, l.z); o.name = `lampu-${l.lid || l.w}`; o.userData.lampu = l;
    if (l.lid) { const sp = labelSprite(l.lid, !!(l.baru || l.rev), true); sp.position.set(0, l.j === 'tempel' ? -0.22 : keAtas ? 0.18 : -0.1, 0); o.add(sp); }
    if (keAtas) o.add(berkasKeAtas()); // berkas cahaya tipis ke atas: arah sorot terlihat di 3D
    grp[l.lvl].add(o);
  }
  // --- jalur kabel ---
  // perangkat terdekat (< 6 cm) di ujung jalur; jalur data hanya mencocokkan kamera/NVR, jalur listrik mengabaikan keduanya
  // jenis jalur: 'data' hanya kamera/NVR, 'coax' hanya stop kontak antena, 'listrik' sisanya
  const cocok = { data: (d) => d.t === 'cctv' || d.nvr, coax: (d) => d.t === 'antena', listrik: (d) => d.t !== 'cctv' && !d.nvr && d.t !== 'antena' };
  const dev = (lvl, x, z, jenis) => PERANGKAT.filter((d) => d.lvl === lvl && cocok[jenis](d) && Math.hypot(d.x - x, d.z - z) < 0.06).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
  // Jalur disusuri per 10 cm mengikuti profil plafon hasil indeks SKP: di titik tanpa plafon (dalam tembok, di atas
  // tangga/void) tinggi terakhir dipertahankan, dan perubahan tinggi (balok, kanopi balkon, bordes) digambar sebagai
  // tangga — datar lalu turun/naik tegak di tempat plafon berubah — bukan garis diagonal menembus ruang.
  // JUMP 8 cm: riak atap spandek/usuk kanopi (3–7 cm) diabaikan; balok/kanopi/bordes (≥ 20 cm) tetap jadi anak tangga.
  // Tinggi sampel difilter median-3 supaya satu sampel nyasar (tepi balok, lis) tidak jadi tonjolan 10 cm.
  const STEP = 0.1, JUMP = 0.08;
  for (const j of JALUR) {
    const g = grp[j.lvl];
    const jenis = j.data ? 'data' : j.coax ? 'coax' : 'listrik';
    const mat = MAT[jenis === 'listrik' ? 'kabel' : jenis];
    const ceil = (x, z) => { const c = ceilingAt ? ceilingAt(x, z, j.lvl) : null; return c == null ? null : c - 0.03; };
    // tinggi awal: plafon di titik pertama, kalau tidak ada → titik valid pertama di sepanjang jalur, kalau tidak ada → nilai fallback
    let y = ceil(j.pts[0][0], j.pts[0][1]);
    if (y == null) {
      for (let i = 0; i < j.pts.length - 1 && y == null; i++) {
        const [x0, z0] = j.pts[i], [x1, z1] = j.pts[i + 1]; const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / STEP));
        for (let k = 1; k <= n && y == null; k++) y = ceil(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n);
      }
      if (y == null) y = plafon(j.pts[0][0], j.pts[0][1], j.lvl) - 0.03;
    }
    if (j.pts[0][2] != null) y = j.pts[0][2];
    const poly = [new THREE.Vector3(j.pts[0][0], y, j.pts[0][1])];
    for (let i = 0; i < j.pts.length - 1; i++) {
      const [x0, z0] = j.pts[i], [x1, z1, h1] = j.pts[i + 1];
      if (h1 != null) { // tinggi tetap: naik/turun tegak di awal ruas, lalu datar
        if (Math.abs(h1 - y) > 1e-3) { y = h1; poly.push(new THREE.Vector3(x0, y, z0)); }
        poly.push(new THREE.Vector3(x1, y, z1)); continue;
      }
      const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, z1 - z0) / STEP));
      const sm = []; // sampel 1..n, null → tinggi terakhir yang diketahui
      let last = y;
      for (let k = 1; k <= n; k++) { const c = ceil(x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n); if (c != null) last = c; sm.push(last); }
      for (let k = 1; k <= n; k++) {
        const w = [sm[Math.max(0, k - 2)], sm[k - 1], sm[Math.min(n - 1, k)]].sort((p, q) => p - q); const c = w[1]; // median-3
        if (Math.abs(c - y) > JUMP) { const x = x0 + (x1 - x0) * k / n, z = z0 + (z1 - z0) * k / n; poly.push(new THREE.Vector3(x, y, z)); y = c; poly.push(new THREE.Vector3(x, y, z)); }
      }
      poly.push(new THREE.Vector3(x1, y, z1));
    }
    for (let i = 0; i < poly.length - 1; i++) { const t = tube(poly[i], poly[i + 1], 0.006, mat); if (t) g.add(t); }
    const ends = [[0, poly[0]], [j.pts.length - 1, poly[poly.length - 1]]];
    for (const [k, p] of ends) {
      const [x, z] = j.pts[k]; const d = dev(j.lvl, x, z, jenis);
      if (!d || d.n === 'dn') continue; // perangkat di plafon: kabel berakhir di plafon
      const [nx, nz] = NV[d.n];
      const top = p.clone(); const bot = new THREE.Vector3(d.x + nx * 0.012, d.h + 0.06, d.z + nz * 0.012);
      top.x = bot.x; top.z = bot.z;
      const t = tube(bot, top, 0.006, mat); if (t) g.add(t);
    }
  }
  return grp;
}
