// Lapisan listrik (tekan E): stop kontak, saklar, box MCB, kWh meter, titik lampu, dan jalur kabel —
// posisinya dari gambar denah instalasi listrik (lihat src/layout/elektrik.js).
// Aset: stop kontak & saklar = "Set switch & socket Simon 82" (BlenderKit, CC0, Agustin Paternoster; pelat tergeletak, muka +y);
//       box MCB, kWh meter, lampu dinding = dibuat di Blender (scripts/blender/build_furniture.py).
import * as THREE from 'three';
import { loadAsset, placeAsset } from './assets.js';
import { downlight } from './furniture.js';
import { PERANGKAT, LAMPU, JALUR } from './layout/elektrik.js';

const RY = { '+z': 0, '+x': Math.PI / 2, '-z': Math.PI, '-x': -Math.PI / 2 };
const NV = { '+z': [0, 1], '+x': [1, 0], '-z': [0, -1], '-x': [-1, 0] };
const MAT = {
  kabel: new THREE.MeshBasicMaterial({ color: 0xff6a00 }),
  data: new THREE.MeshBasicMaterial({ color: 0x1e6fd9 }), // CAT6 CCTV
  trimHitam: new THREE.MeshStandardMaterial({ color: 0x1b1c1e, roughness: 0.6 }),
};

/** Pelat Simon 82 tergeletak dengan muka ke +y → ditegakkan (muka ke +z lokal = normal tembok), punggung bingkai tepat di bidang tembok. */
function tegakkanPelat(obj) {
  const drop = [];
  obj.traverse((o) => { if (o.isMesh && /boolean/i.test(o.name)) drop.push(o); }); // mesh bantu boolean di file asli
  for (const o of drop) o.parent.remove(o);
  // tekstur webp aset asli tidak ikut termuat (material jadi hitam) → ganti material polos: bingkai & tuts putih Simon 82, kontak krom
  const WARNA = { SemiglossMetal: [0xe6e6e3, 0.35, 0.0], WhitePlasticTr: [0xf2f2ef, 0.45, 0.0], WhitePlastic: [0xf6f6f3, 0.4, 0.0], Chorme: [0xc9ccd0, 0.3, 0.9], chromeMater: [0xc9ccd0, 0.3, 0.9], blackplastic: [0x1c1d1f, 0.6, 0.0] };
  obj.traverse((o) => {
    if (!o.isMesh) return;
    const w = WARNA[o.material?.name];
    if (!w) return;
    const m = new THREE.MeshStandardMaterial({ color: w[0], roughness: w[1], metalness: w[2] }); m.name = o.material.name; o.material = m;
  });
  obj.updateWorldMatrix(true, true);
  let back = Infinity;
  obj.traverse((o) => { if (o.isMesh && o.material?.name === 'SemiglossMetal') back = Math.min(back, new THREE.Box3().setFromObject(o).min.y); });
  if (Number.isFinite(back)) obj.position.y -= back;
  const tilt = new THREE.Group(); tilt.rotation.x = Math.PI / 2; tilt.add(obj);
  return tilt;
}
/** Saklar ganda: tuts lebar Simon (mesh WhitePlastic) dibelah jadi dua tuts setengah lebar. */
function belahTuts(obj, n = 2) {
  let rocker = null;
  obj.traverse((o) => { if (!rocker && o.isMesh && o.material?.name === 'WhitePlastic') rocker = o; });
  if (!rocker) return;
  rocker.visible = false;
  const g0 = rocker.geometry; g0.computeBoundingBox();
  const c = g0.boundingBox.getCenter(new THREE.Vector3());
  const offs = n === 3 ? [-1, 0, 1] : [-0.5, 0.5];
  for (const o of offs) {
    const g = g0.clone(); g.translate(-c.x, -c.y, -c.z);
    const m = new THREE.Mesh(g, rocker.material); m.scale.set(n === 3 ? 0.3 : 0.47, 1, 1);
    m.position.copy(c).x += o * (n === 3 ? 0.0185 : 0.029);
    m.castShadow = m.receiveShadow = true;
    rocker.parent.add(m);
  }
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
    if (d.t === 'stopkontak' || d.t === 'saklar1' || d.t === 'saklar2' || d.t === 'saklar3') {
      const name = d.t === 'stopkontak' ? 'simon_socket' : 'simon_switch';
      placeAsset(holder, name, { onLoad: (h) => {
        const obj = h.children[0]; if (!obj) return;
        h.remove(obj);
        if (d.t === 'saklar2') belahTuts(obj, 2);
        if (d.t === 'saklar3') belahTuts(obj, 3);
        h.add(tegakkanPelat(obj));
      } });
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
    else if (d.t === 'sconce') placeAsset(holder, 'sconce', {});
  }
  // --- titik lampu ---
  for (const l of LAMPU) {
    const y = plafon(l.x, l.z, l.lvl);
    const o = l.w === 'out' ? spotOutdoor() : downlight(l.w === 9 ? 0.06 : 0.045);
    o.position.set(l.x, y, l.z); o.name = `lampu-${l.w}`; o.userData.lampu = l;
    grp[l.lvl].add(o);
  }
  // --- jalur kabel ---
  // perangkat terdekat (< 6 cm) di ujung jalur; jalur data hanya mencocokkan kamera/NVR, jalur listrik mengabaikan keduanya
  const dev = (lvl, x, z, data) => PERANGKAT.filter((d) => d.lvl === lvl && (data ? d.t === 'cctv' || d.nvr : d.t !== 'cctv' && !d.nvr) && Math.hypot(d.x - x, d.z - z) < 0.06).sort((a, b) => Math.hypot(a.x - x, a.z - z) - Math.hypot(b.x - x, b.z - z))[0];
  for (const j of JALUR) {
    const g = grp[j.lvl];
    const pts = j.pts.map(([x, z]) => new THREE.Vector3(x, plafon(x, z, j.lvl) - 0.03, z));
    const mat = j.data ? MAT.data : MAT.kabel;
    for (let i = 0; i < pts.length - 1; i++) { const t = tube(pts[i], pts[i + 1], 0.006, mat); if (t) g.add(t); }
    for (const k of [0, pts.length - 1]) {
      const [x, z] = j.pts[k]; const d = dev(j.lvl, x, z, !!j.data);
      if (!d || d.n === 'dn') continue; // perangkat di plafon: kabel berakhir di plafon
      const [nx, nz] = NV[d.n];
      const top = pts[k].clone(); const bot = new THREE.Vector3(d.x + nx * 0.012, d.h + 0.06, d.z + nz * 0.012);
      top.x = bot.x; top.z = bot.z;
      const t = tube(bot, top, 0.006, mat); if (t) g.add(t);
    }
  }
  return grp;
}
