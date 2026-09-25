// Furnitur & aksesori interior mengikuti render konsep DED (hal. 21–40).
//  - Aset GLB (models/furniture): bl_* dibuat di Blender (scripts/blender/build_furniture.py), ph_* Poly Haven CC0,
//    fm_* FurniMesh (furnimesh.com, library gratis) → daftar di src/assets.js
//  - Penempatan per ruang: src/layout/*.js (x, z denah; y tinggi dari lantai; ry radian; depan aset = +z lokal)
//  - Elemen parametrik yang mengikuti geometri rumah tetap dibangun di sini: railing tangga/void motif oval,
//    lemari bawah tangga, downlight plafon.
import * as THREE from 'three';
import { LEVELS } from './data.js';
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
/** Lemari bawah tangga: kotak-kotak krem mengikuti bawah anak tangga, plus niche walnut terbuka */
export function underStairCabinet(from, to, hAt, depth = 0.98, nicheAt = [6.5, 7.6]) {
  const g = new THREE.Group();
  const step = 0.3;
  for (let z = from; z < to - 1e-6; z += step) {
    const z2 = Math.min(z + step, to);
    const hh = Math.max(0.1, hAt(z2) - 0.1);
    const inNiche = z >= nicheAt[0] - 1e-6 && z2 <= nicheAt[1] + 1e-6;
    if (inNiche) {
      g.add(B(depth, 1.1, z2 - z, FM.cream, 0, 0.55, (z + z2) / 2));
      g.add(B(depth, hh - 2.0, z2 - z, FM.cream, 0, 2.0 + (hh - 2.0) / 2, (z + z2) / 2));
      g.add(B(depth - 0.04, 0.9, z2 - z, FM.walnut, -0.02, 1.55, (z + z2) / 2));
      g.add(B(0.4, 0.86, z2 - z - 0.02, FM.walnutDark, -depth / 2 + 0.2, 1.55, (z + z2) / 2));
      g.add(B(0.02, 0.86, 0.02, FM.led, -depth / 2 + 0.41, 1.55, (z + z2) / 2));
    } else g.add(B(depth, hh, z2 - z, FM.cream, 0, hh / 2, (z + z2) / 2));
    g.add(B(0.006, Math.min(hh, 2.3) - 0.06, 0.008, FM.blackMatte, -depth / 2 - 0.003, Math.min(hh, 2.3) / 2, z2 - 0.004));
  }
  g.add(B(0.03, 0.9, 0.03, FM.brass, -depth / 2 + 0.2, 1.55, (nicheAt[0] + nicheAt[1]) / 2));
  g.add(B(depth - 0.1, 0.02, nicheAt[1] - nicheAt[0] - 0.05, FM.walnut, -0.02, 1.55, (nicheAt[0] + nicheAt[1]) / 2));
  return g;
}

export function buildFurniture(stairHeightAt) {
  const lt1 = new THREE.Group(); lt1.name = 'furnitur-lt1';
  const lt2 = new THREE.Group(); lt2.name = 'furnitur-lt2';
  const put = (grp, obj, x, z, ry = 0, y = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; grp.add(obj); return obj; };
  const CEIL1_FRONT = 3.1, CEIL1_BACK = 3.55, CEIL2 = 3.3;

  for (const it of LAYOUT.lt1) placeAsset(lt1, it.a, it);
  for (const it of LAYOUT.lt2) placeAsset(lt2, it.a, it);

  put(lt1, underStairCabinet(5.0, 9.0, (z) => stairHeightAt(z) - LEVELS.lt1, 0.98, [6.5, 7.6]), 9.4, 0);
  put(lt1, railingOval(0.6, 1.0, 0.4 / 0.6), 8.28, 4.53, 0, 0.2);
  put(lt1, railingOval(9.06 - 4.56, 1.0, (3.8 - 0.6) / (9.06 - 4.56)), 8.86, 4.56, -Math.PI / 2, 0.6);
  put(lt2, railingOval(9.06 - 3.575, 1.0, 0), 8.43, 3.575, -Math.PI / 2);
  put(lt2, railingOval(0.45, 1.0, 0), 8.43, 9.06, 0);
  for (const [x, z] of [[7.2, 9.3], [9.3, 9.3], [7.2, 12.6], [9.3, 12.6], [4.0, 9.6], [5.5, 11.2]]) put(lt1, downlight(), x, z, 0, CEIL1_FRONT);
  for (const [x, z] of [[7.3, 4.6], [4.2, 5.2], [7.2, 7.7], [5.6, 6.2]]) put(lt1, downlight(), x, z, 0, CEIL1_BACK);
  for (const [x, z] of [[7.3, 10.0], [9.2, 10.0], [7.3, 12.6], [9.2, 12.6], [7.5, 4.6], [7.5, 7.5], [4.4, 4.6], [5.0, 6.0], [4.0, 9.7], [5.6, 11.2]]) put(lt2, downlight(), x, z, 0, CEIL2);

  return { lt1, lt2 };
}
