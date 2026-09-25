// Pemuat aset furnitur GLB (models/furniture/*.glb):
//  - bl_*  : dibuat di Blender (scripts/blender/build_furniture.py), sudah berukuran meter, depan = +z, alas di y=0
//  - ph_*  : Poly Haven (CC0, https://polyhaven.com), dinormalisasi: alas y=0, pusat x/z=0, diskalakan ke ukuran target
// loadAsset(name) → Promise<Object3D> (klon; geometri/material dibagi lewat cache)
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';

// name → { file, height?|width?|depth? (skala seragam ke ukuran target, meter), anchor: 'bottom'|'top'|'center', rotY (koreksi arah depan),
//           pick: RegExp — hanya node/mesh yang namanya cocok yang dipakai (untuk aset berisi beberapa varian berjajar) }
export const ASSETS = {
  // --- Blender (gaya render) ---
  sofa_l: { file: 'bl_sofa_l.glb' },
  bed_single_beige: { file: 'bl_bed_single_beige.glb' },
  bed_queen_dark: { file: 'bl_bed_queen_dark.glb' },
  bed_king_walnut: { file: 'bl_bed_king_walnut.glb' },
  wardrobe_120_cream: { file: 'bl_wardrobe_120_cream.glb' },
  wardrobe_120_mirror: { file: 'bl_wardrobe_120_mirror.glb' },
  wardrobe_100_curved: { file: 'bl_wardrobe_100_curved.glb' },
  desk_white_110: { file: 'bl_desk_white_110.glb' },
  desk_walnut_140: { file: 'bl_desk_walnut_140.glb' },
  vanity: { file: 'bl_vanity.glb' },
  office_chair: { file: 'bl_office_chair.glb' },
  dining_table: { file: 'bl_dining_table.glb' },
  dining_chair: { file: 'bl_dining_chair.glb' },
  tv65: { file: 'bl_tv65.glb' },
  tv_console: { file: 'bl_tv_console.glb' },
  tv_wall: { file: 'bl_tv_wall.glb' },
  wall_panels: { file: 'bl_wall_panels.glb' },
  curtain_dark: { file: 'bl_curtain_dark.glb' },
  curtain_cream: { file: 'bl_curtain_cream.glb' },
  nightstand_float: { file: 'bl_nightstand_float.glb' },
  sideboard: { file: 'bl_sideboard.glb' },
  armchair_cream: { file: 'bl_armchair_cream.glb' },
  round_table_l: { file: 'bl_round_table_l.glb' },
  round_table_s: { file: 'bl_round_table_s.glb' },
  ring_pendant: { file: 'bl_ring_pendant.glb', anchor: 'top' },
  molecule_pendant: { file: 'bl_molecule_pendant.glb', anchor: 'top' },
  // --- Poly Haven CC0 ---
  plant_tree: { file: 'ph_pachira_aquatica_01.glb', height: 1.9, pick: /_d$/ }, // pohon pot tinggi (file berisi 4 varian berjajar; dipakai varian d saja)
  plant_tree2: { file: 'ph_pachira_aquatica_01.glb', height: 1.6, pick: /_b$/ }, // varian b, lebih kecil
  plant_pot: { file: 'ph_potted_plant_02.glb', height: 0.85 },
  plant_small: { file: 'ph_potted_plant_04.glb', height: 0.28 },
  pendant_globe: { file: 'ph_modern_ceiling_lamp_01.glb', height: 0.95, anchor: 'top' },
  cabinet_slat: { file: 'ph_modern_wooden_cabinet.glb', width: 1.8 }, // sideboard walnut ber-slat
  dining_chair_leather: { file: 'ph_dining_chair_02.glb', height: 0.97 },
  coffee_table_round: { file: 'ph_coffee_table_round_01.glb', width: 0.85 },
  side_table_wood: { file: 'ph_side_table_01.glb', width: 0.5 },
  lounge_chair: { file: 'ph_mid_century_lounge_chair.glb', width: 0.95 },
  throw_pillows: { file: 'ph_throw_pillows_01.glb', width: 0.9 },
  picture_frame: { file: 'ph_hanging_picture_frame_01.glb', height: 0.84, anchor: 'center' },
  display_shelves: { file: 'ph_wooden_display_shelves_01.glb', height: 1.56 },
  // --- FurniMesh (furnimesh.com library, gratis; mesh AI dari foto → dinormalisasi ukuran) ---
  fm_sofa_grey: { file: 'fm_sofa_grey.glb', width: 2.4 }, // sofa 3 dudukan abu tua, lurus
  fm_armchair_boucle: { file: 'fm_armchair_boucle.glb', width: 0.9 }, // kursi boucle krem tanpa lengan
  fm_dining_chair_oak: { file: 'fm_dining_chair_oak.glb', height: 0.85 }, // kursi makan dudukan boucle kaki oak
  fm_dining_table_charcoal: { file: 'fm_dining_table_charcoal.glb', width: 1.7 }, // meja charcoal kaki metal ramping
  fm_coffee_table_oak: { file: 'fm_coffee_table_oak.glb', width: 0.9 }, // meja kopi bundar oak gelap
  fm_bed_grey: { file: 'fm_bed_grey.glb', width: 2.0 }, // ranjang upholstered abu-krem (king)
  fm_bed_beige: { file: 'fm_bed_beige.glb', width: 1.8 }, // ranjang upholstered beige (queen)
  fm_bed_darkwood: { file: 'fm_bed_darkwood.glb', width: 1.75 }, // ranjang kayu gelap (queen)
  fm_wardrobe_mirror: { file: 'fm_wardrobe_mirror.glb', height: 2.3 }, // lemari 3 pintu krem, cermin tengah
  fm_wardrobe_grey: { file: 'fm_wardrobe_grey.glb', height: 2.3 }, // lemari 2 pintu abu muda
  fm_tv_console_walnut: { file: 'fm_tv_console_walnut.glb', width: 2.4 }, // konsol TV walnut (melayang: beri y ≈ 0.3)
  fm_desk_walnut: { file: 'fm_desk_walnut.glb', width: 1.4 }, // meja walnut waterfall
  fm_office_chair_mesh: { file: 'fm_office_chair_mesh.glb', height: 1.0 }, // kursi kantor mesh hitam
  fm_dresser_wood: { file: 'fm_dresser_wood.glb', width: 1.4 }, // dresser 3 laci kayu
};

const loader = new GLTFLoader();
loader.setMeshoptDecoder(MeshoptDecoder);
const cache = new Map();
let pending = 0;
export const assetsPending = () => pending;
const BASE = new URL('../models/furniture/', import.meta.url);

function normalize(root, spec) {
  if (spec.pick) {
    // buang mesh yang namanya tidak cocok (dan induknya, kalau jadi kosong)
    const drop = [];
    root.traverse((o) => { if (o.isMesh && !spec.pick.test(o.name) && !spec.pick.test(o.parent?.name || '')) drop.push(o); });
    for (const o of drop) o.parent?.remove(o);
    let again = true;
    while (again) { again = false; root.traverse((o) => { if (o !== root && !o.isMesh && o.children.length === 0) { o.parent?.remove(o); again = true; } }); }
  }
  root.updateWorldMatrix(true, true);
  const bb = new THREE.Box3().setFromObject(root);
  const size = bb.getSize(new THREE.Vector3());
  let s = 1;
  if (spec.height) s = spec.height / size.y;
  else if (spec.width) s = spec.width / size.x;
  else if (spec.depth) s = spec.depth / size.z;
  const wrap = new THREE.Group();
  wrap.add(root);
  root.scale.setScalar(s);
  if (spec.rotY) root.rotation.y = spec.rotY;
  root.updateWorldMatrix(true, true);
  const bb2 = new THREE.Box3().setFromObject(root);
  const c = bb2.getCenter(new THREE.Vector3());
  const anchor = spec.anchor || 'bottom';
  const y0 = anchor === 'top' ? bb2.max.y : anchor === 'center' ? c.y : bb2.min.y;
  if (spec.file.startsWith('bl_')) root.position.set(0, anchor === 'top' ? 0 : 0, 0); // Blender: sudah di origin yang benar
  else root.position.set(-c.x, -y0, -c.z);
  wrap.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = o.receiveShadow = true;
    const ms = Array.isArray(o.material) ? o.material : [o.material];
    for (const m of ms) { if (m && m.emissive && m.emissiveIntensity > 1) m.toneMapped = false; }
  });
  wrap.userData.asset = spec;
  return wrap;
}

export function loadAsset(name) {
  const spec = ASSETS[name];
  if (!spec) return Promise.reject(new Error(`aset tidak dikenal: ${name}`));
  if (!cache.has(name)) {
    cache.set(name, new Promise((res, rej) => loader.load(new URL(spec.file, BASE).href, (g) => res(normalize(g.scene, spec)), undefined, rej)));
  }
  return cache.get(name).then((proto) => proto.clone());
}

/** Tempatkan aset di grup: pusat alas di (x, y, z), putar ry (radian), sx = -1 untuk cermin */
/** Tempatkan aset di grup: pusat alas di (x, y, z), putar ry (radian), sx = -1 untuk cermin, scale = skala tambahan.
 *  tint = 0xRRGGBB mengalikan warna material (menggelapkan/mewarnai); flat = 0xRRGGBB mengganti tekstur dengan warna polos. */
export function placeAsset(group, name, { x = 0, y = 0, z = 0, ry = 0, sx = 1, scale = 1, tint, flat, onLoad } = {}) {
  const holder = new THREE.Group();
  holder.position.set(x, y, z); holder.rotation.y = ry; holder.scale.set(sx * scale, scale, scale);
  holder.name = `aset-${name}`;
  group.add(holder);
  pending++;
  loadAsset(name).then((obj) => {
    if (tint != null || flat != null) {
      obj.traverse((o) => {
        if (!o.isMesh) return;
        o.material = (Array.isArray(o.material) ? o.material : [o.material]).map((m) => {
          const c = m.clone();
          if (flat != null) { c.map = null; c.color.set(flat); c.roughness = Math.max(c.roughness, 0.8); }
          else c.color.multiply(new THREE.Color(tint));
          return c;
        });
        if (o.material.length === 1) o.material = o.material[0];
      });
    }
    holder.add(obj); if (onLoad) onLoad(holder);
  }).catch((e) => console.warn('gagal muat aset', name, e)).finally(() => { pending--; });
  return holder;
}
