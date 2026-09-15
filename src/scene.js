// Membangun geometri rumah dari data.js
import * as THREE from 'three';
import { LEVELS, WALL_T, HALF, WALLS, RAILINGS, STAIRS, SLAB2, SITE, BATHROOMS, FLOOR_AREAS } from './data.js';
import { floorTexture, wallTexture, noiseTexture } from './textures.js';

// Konversi denah (x, y) → dunia (x, z): x sama, z = y (depan rumah = +z)
const P = (x, y) => new THREE.Vector3(x, 0, y);

const MAT = {
  wall: new THREE.MeshStandardMaterial({ color: 0xf2ece2, roughness: 0.9 }),
  wallDark: new THREE.MeshStandardMaterial({ color: 0x5a5d63, roughness: 0.9 }),
  slab: new THREE.MeshStandardMaterial({ color: 0xe8e4dc, roughness: 0.95 }),
  ceiling: new THREE.MeshStandardMaterial({ color: 0xfaf8f3, roughness: 1, side: THREE.DoubleSide }),
  roof: new THREE.MeshStandardMaterial({ color: 0x3b4a66, roughness: 0.7, side: THREE.DoubleSide }),
  wood: new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.8 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x9fc7e8, transparent: true, opacity: 0.35, roughness: 0.1, metalness: 0.2 }),
  rail: new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.5, metalness: 0.6 }),
  stair: new THREE.MeshStandardMaterial({ color: 0xd8d2c6, roughness: 0.8 }),
  fence: new THREE.MeshStandardMaterial({ color: 0xdedbd2, roughness: 0.9 }),
};

function box(w, h, d, mat, x, y, z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
  m.position.set(x, y, z);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Mesh persegi horizontal (rect denah) di elevasi y, dengan material */
export function rectMesh(r, y, mat, uvFromBB = null) {
  const g = new THREE.BufferGeometry();
  const verts = new Float32Array([
    r.x1, y, r.y1, r.x2, y, r.y1, r.x2, y, r.y2, r.x1, y, r.y2,
  ]);
  const bb = uvFromBB || r;
  const u = (x) => (x - bb.x1) / (bb.x2 - bb.x1);
  const v = (yy) => 1 - (yy - bb.y1) / (bb.y2 - bb.y1);
  const uvs = new Float32Array([u(r.x1), v(r.y1), u(r.x2), v(r.y1), u(r.x2), v(r.y2), u(r.x1), v(r.y2)]);
  g.setAttribute('position', new THREE.BufferAttribute(verts, 3));
  g.setAttribute('uv', new THREE.BufferAttribute(uvs, 2));
  g.setIndex([0, 2, 1, 0, 3, 2]);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, mat);
  m.receiveShadow = true;
  return m;
}

// ---------------------------------------------------------------------------
// Lantai granit (dengan tekstur pola)
// ---------------------------------------------------------------------------
export function buildFloors(results, group) {
  const meshes = [];
  for (const f of results.floors) {
    const { texture, bb } = floorTexture(f, f.layout, 110, window.__showLabels ?? false);
    const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: f.outdoor ? 0.9 : 0.35, metalness: 0.02 });
    const g = new THREE.Group();
    g.name = f.id;
    g.userData.area = f;
    for (const r of f.rects) g.add(rectMesh(r, f.level + 0.001, mat, bb));
    group.add(g);
    meshes.push(g);
  }
  return meshes;
}

// ---------------------------------------------------------------------------
// Tembok dengan bukaan
// ---------------------------------------------------------------------------
export function buildWalls(group) {
  for (const w of WALLS) {
    const base = w.level === 'lt1' ? LEVELS.lt1 - 0.06 : LEVELS.dak2;
    const dx = w.x2 - w.x1, dy = w.y2 - w.y1;
    const len = Math.hypot(dx, dy);
    const ang = Math.atan2(dx, dy); // rotasi terhadap sumbu z
    const horizontal = Math.abs(dy) < 1e-6;
    const seg = (a, b, y0, h) => {
      // segmen dari jarak a→b sepanjang tembok, dari elevasi y0 dengan tinggi h
      if (b - a < 1e-4 || h < 1e-4) return;
      const cx = w.x1 + (dx / len) * ((a + b) / 2);
      const cz = w.y1 + (dy / len) * ((a + b) / 2);
      const m = horizontal ? box(b - a, h, WALL_T, MAT.wall, cx, y0 + h / 2, cz) : box(WALL_T, h, b - a, MAT.wall, cx, y0 + h / 2, cz);
      group.add(m);
    };
    const ops = [...w.openings].sort((p, q) => p.at - q.at);
    let cursor = 0;
    for (const o of ops) {
      seg(cursor, o.at, base, w.h);
      // bawah bukaan (ambang jendela)
      if (o.sill > 0) seg(o.at, o.at + o.w, base, o.sill);
      // atas bukaan
      seg(o.at, o.at + o.w, base + o.sill + o.h, w.h - o.sill - o.h);
      // kusen + kaca
      const cx = w.x1 + (dx / len) * (o.at + o.w / 2);
      const cz = w.y1 + (dy / len) * (o.at + o.w / 2);
      const isDoor = o.sill === 0;
      const fh = o.h, fy = base + o.sill + o.h / 2;
      if (isDoor) {
        // kusen pintu (bingkai tipis)
        const t = 0.05;
        const mk = (ox, oz, ww, hh, dd) => group.add(box(ww, hh, dd, MAT.wood, cx + ox, fy, cz + oz));
        if (horizontal) {
          mk(-o.w / 2 + t / 2, 0, t, fh, WALL_T + 0.02);
          mk(o.w / 2 - t / 2, 0, t, fh, WALL_T + 0.02);
          group.add(box(o.w, t, WALL_T + 0.02, MAT.wood, cx, base + fh - t / 2, cz));
        } else {
          mk(0, -o.w / 2 + t / 2, WALL_T + 0.02, fh, t);
          mk(0, o.w / 2 - t / 2, WALL_T + 0.02, fh, t);
          group.add(box(WALL_T + 0.02, t, o.w, MAT.wood, cx, base + fh - t / 2, cz));
        }
      } else {
        const gm = horizontal ? box(o.w, fh, 0.02, MAT.glass, cx, fy, cz) : box(0.02, fh, o.w, MAT.glass, cx, fy, cz);
        gm.castShadow = false;
        group.add(gm);
      }
      cursor = o.at + o.w;
    }
    seg(cursor, len, base, w.h);
  }
}

// ---------------------------------------------------------------------------
// Dinding kamar mandi (tekstur 2 motif) — ditempel di sisi dalam tembok
// ---------------------------------------------------------------------------
const BATH_AREA = { 'km-lt1': 'lt1-toilet', 'km-lt2a': 'lt2-toilet-a', 'km-lt2b': 'lt2-toilet-b' };
export function buildBathWalls(results, group) {
  for (const b of results.baths) {
    const area = FLOOR_AREAS.find((a) => a.id === BATH_AREA[b.id]);
    if (!area) continue;
    const r = area.rects[0];
    const base = area.level;
    const off = 0.004;
    // urutan sisi: [belakang(y1), kanan(x2), depan(y2), kiri(x1)]
    const sides = [
      { z: r.y1 + off, x: (r.x1 + r.x2) / 2, rotY: 0, len: r.x2 - r.x1 },
      { x: r.x2 - off, z: (r.y1 + r.y2) / 2, rotY: -Math.PI / 2, len: r.y2 - r.y1 },
      { z: r.y2 - off, x: (r.x1 + r.x2) / 2, rotY: Math.PI, len: r.x2 - r.x1 },
      { x: r.x1 + off, z: (r.y1 + r.y2) / 2, rotY: Math.PI / 2, len: r.y2 - r.y1 },
    ];
    b.walls.forEach((wl, i) => {
      const s = sides[i];
      const { texture, W, H } = wallTexture(wl, results.cfg.wallZones);
      const mat = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, transparent: true });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(W, H), mat);
      m.position.set(s.x, base + H / 2, s.z);
      m.rotation.y = s.rotY;
      m.name = `${b.id}-wall-${i}`;
      group.add(m);
    });
  }
}

// ---------------------------------------------------------------------------
// Dak lantai 2, plafon, atap, tangga, railing
// ---------------------------------------------------------------------------
/** Kurangi rect dengan daftar lubang → daftar rect sisa */
function subtractRects(rects, holes) {
  let out = [...rects];
  for (const h of holes) {
    const next = [];
    for (const r of out) {
      const ix1 = Math.max(r.x1, h.x1), ix2 = Math.min(r.x2, h.x2), iy1 = Math.max(r.y1, h.y1), iy2 = Math.min(r.y2, h.y2);
      if (ix2 - ix1 <= 1e-6 || iy2 - iy1 <= 1e-6) { next.push(r); continue; }
      if (ix1 > r.x1) next.push({ x1: r.x1, y1: r.y1, x2: ix1, y2: r.y2 });
      if (ix2 < r.x2) next.push({ x1: ix2, y1: r.y1, x2: r.x2, y2: r.y2 });
      if (iy1 > r.y1) next.push({ x1: ix1, y1: r.y1, x2: ix2, y2: iy1 });
      if (iy2 < r.y2) next.push({ x1: ix1, y1: iy2, x2: ix2, y2: r.y2 });
    }
    out = next;
  }
  return out;
}

export function buildSlab(group) {
  const t = 0.12;
  const y = LEVELS.dak2 - t / 2;
  for (const r of subtractRects(SLAB2.rects, SLAB2.voids)) {
    if (r.x2 - r.x1 < 1e-3 || r.y2 - r.y1 < 1e-3) continue;
    group.add(box(r.x2 - r.x1, t, r.y2 - r.y1, MAT.slab, (r.x1 + r.x2) / 2, y, (r.y1 + r.y2) / 2));
  }
}

export function buildCeiling2(group) {
  const y = LEVELS.dakTalang - 0.15;
  const r = { x1: 3, y1: 3.5, x2: 10, y2: 13.5 };
  group.add(box(r.x2 - r.x1, 0.1, r.y2 - r.y1, MAT.ceiling, 6.5, y, 8.5));
}

export function buildRoof(group) {
  // atap limasan di atas lantai 2, overhang 0.6, tinggi bubungan +2.4
  const ov = 0.6;
  const x1 = 3 - ov, x2 = 10 + ov, z1 = 3.5 - ov, z2 = 13.5 + ov;
  const ye = LEVELS.dakTalang + 0.2;
  const yr = ye + 2.6;
  const cx = (x1 + x2) / 2;
  const half = (x2 - x1) / 2;
  const rz1 = z1 + half, rz2 = z2 - half; // bubungan sejajar sumbu z
  const g = new THREE.BufferGeometry();
  const V = [
    x1, ye, z1, x2, ye, z1, x2, ye, z2, x1, ye, z2, // 0-3 tritisan
    cx, yr, rz1, cx, yr, rz2, // 4,5 bubungan
  ];
  g.setAttribute('position', new THREE.Float32BufferAttribute(V, 3));
  g.setIndex([0, 1, 4, 1, 2, 5, 1, 5, 4, 2, 3, 5, 3, 0, 4, 3, 4, 5]);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, MAT.roof);
  m.castShadow = true;
  group.add(m);
  // dinding gewel kecil + lisplang: balok tepi
  group.add(box(x2 - x1, 0.25, 0.08, MAT.wallDark, cx, ye - 0.1, z1));
  group.add(box(x2 - x1, 0.25, 0.08, MAT.wallDark, cx, ye - 0.1, z2));
  group.add(box(0.08, 0.25, z2 - z1, MAT.wallDark, x1, ye - 0.1, (z1 + z2) / 2));
  group.add(box(0.08, 0.25, z2 - z1, MAT.wallDark, x2, ye - 0.1, (z1 + z2) / 2));
  // dak talang datar di atas balkon depan & belakang
  group.add(box(5.0, 0.12, 2.0, MAT.slab, 4.0, LEVELS.dakTalang, 13.0));
  group.add(box(1.5, 0.12, 3.5, MAT.slab, 2.25, LEVELS.dakTalang, 10.25));
  group.add(box(3.5, 0.12, 1.5, MAT.slab, 8.25, LEVELS.dakTalang, 2.75));
}

export function buildStairs(group) {
  const { winders, run, rise, tread } = STAIRS;
  const base = LEVELS.lt1 - 0.06;
  for (const w of winders) {
    group.add(box(w.x2 - w.x1, w.top - base, w.y2 - w.y1, MAT.stair, (w.x1 + w.x2) / 2, (w.top + base) / 2, (w.y1 + w.y2) / 2));
  }
  const n = Math.round((run.yEnd - run.yStart) / tread);
  const w = run.x2 - run.x1;
  for (let i = 0; i < n; i++) {
    const top = Math.min(run.from + rise * (i + 1), run.to);
    const y0 = run.yStart + tread * i;
    group.add(box(w, top - base, tread, MAT.stair, (run.x1 + run.x2) / 2, (top + base) / 2, y0 + tread / 2));
  }
  // railing sisi dalam (x = run.x1)
  const len = Math.hypot(run.yEnd - run.yStart, run.to - run.from);
  const m = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 8), MAT.rail);
  m.position.set(run.x1 + 0.03, (run.from + run.to) / 2 + 0.95, (run.yStart + run.yEnd) / 2);
  m.rotation.x = Math.atan2(run.yEnd - run.yStart, run.to - run.from);
  group.add(m);
  const k = Math.round(len / 0.5);
  for (let i = 0; i <= k; i++) {
    const t = i / k;
    group.add(box(0.02, 0.95, 0.02, MAT.rail, run.x1 + 0.03, run.from + (run.to - run.from) * t + 0.475, run.yStart + (run.yEnd - run.yStart) * t));
  }
}

export function buildRailings(group) {
  for (const r of RAILINGS) {
    const base = r.level === 'lt2' ? LEVELS.lt2 : LEVELS.lt1;
    const dx = r.x2 - r.x1, dz = r.y2 - r.y1;
    const len = Math.hypot(dx, dz);
    const cx = (r.x1 + r.x2) / 2, cz = (r.y1 + r.y2) / 2;
    const horizontal = Math.abs(dz) < 1e-6;
    const top = horizontal ? box(len, 0.05, 0.05, MAT.rail, cx, base + 1.0, cz) : box(0.05, 0.05, len, MAT.rail, cx, base + 1.0, cz);
    group.add(top);
    const n = Math.max(2, Math.round(len / 0.12));
    for (let i = 0; i <= n; i++) {
      const t = i / n;
      const x = r.x1 + dx * t, z = r.y1 + dz * t;
      group.add(box(0.02, 1.0, 0.02, MAT.rail, x, base + 0.5, z));
    }
  }
}

// ---------------------------------------------------------------------------
// Tapak / lingkungan
// ---------------------------------------------------------------------------
export function buildSite(group) {
  const grass = noiseTexture('#6f9a4e', '#5b8340', 256, 900);
  grass.repeat.set(8, 8);
  const concrete = noiseTexture('#bdb8ae', '#a8a399', 256, 600);
  concrete.repeat.set(4, 4);
  const asphalt = noiseTexture('#4a4a4c', '#3d3d40', 256, 600);
  asphalt.repeat.set(6, 6);
  const mGrass = new THREE.MeshStandardMaterial({ map: grass, roughness: 1 });
  const mConc = new THREE.MeshStandardMaterial({ map: concrete, roughness: 1 });
  const mAsph = new THREE.MeshStandardMaterial({ map: asphalt, roughness: 1 });
  const mKoral = new THREE.MeshStandardMaterial({ color: 0x9c9587, roughness: 1 });
  // tanah sekitar
  const ground = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), mGrass);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(5, LEVELS.tanah - 0.01, 10);
  ground.receiveShadow = true;
  group.add(ground);
  // jalan depan
  const road = new THREE.Mesh(new THREE.PlaneGeometry(40, 6), mAsph);
  road.rotation.x = -Math.PI / 2;
  road.position.set(5, LEVELS.tanah, 23.2);
  group.add(road);
  // kavling: rabat beton carport & selasar tapak
  group.add(rectMesh(SITE.carport, LEVELS.rabat, mConc));
  group.add(rectMesh(SITE.selasarTapak, LEVELS.rabat, mConc));
  group.add(rectMesh(SITE.jemur, LEVELS.rabat, mConc));
  group.add(rectMesh({ x1: 3, y1: 19.5, x2: 10, y2: 20 }, LEVELS.rabat - 0.05, mConc));
  // taman (rumput gajah mini) & batu koral
  for (const t of SITE.taman) group.add(rectMesh(t, LEVELS.rabat - 0.08, mGrass));
  group.add(rectMesh({ x1: 1.5, y1: 12.0, x2: 3.0, y2: 14.0 }, LEVELS.rabat - 0.05, mKoral));
  // lantai rumah lt1 dasar (di bawah granit) agar tidak bolong
  group.add(rectMesh({ x1: 3, y1: 3.5, x2: 10, y2: 13.5 }, LEVELS.lt1 - 0.01, mConc));
  // pondasi / sloof keliling (tepi lantai terlihat dari luar)
  group.add(box(7, 0.6, 0.15, MAT.wall, 6.5, -0.25, 13.5));
  group.add(box(3.5, 0.6, 0.15, MAT.wall, 4.75, -0.25, 14.0));
  // anak tangga teras depan ke carport (2 trap)
  group.add(box(3.5, 0.1, 0.3, MAT.stair, 4.75, -0.08, 14.15));
  group.add(box(3.5, 0.1, 0.3, MAT.stair, 4.75, -0.18, 14.45));
  // pagar batas kavling kiri/kanan/belakang
  group.add(box(0.15, 2.5, 20, MAT.fence, -0.05, LEVELS.tanah + 1.25, 10));
  group.add(box(0.15, 2.5, 20, MAT.fence, 10.05, LEVELS.tanah + 1.25, 10));
  group.add(box(10.2, 2.5, 0.15, MAT.fence, 5, LEVELS.tanah + 1.25, -0.05));
  // pagar depan rendah + gerbang carport (tiang)
  group.add(box(3.0, 1.2, 0.15, MAT.fence, 1.5, LEVELS.tanah + 0.6, 19.95));
  group.add(box(0.3, 1.8, 0.3, MAT.wallDark, 3.1, LEVELS.tanah + 0.9, 19.9));
  group.add(box(0.3, 1.8, 0.3, MAT.wallDark, 9.9, LEVELS.tanah + 0.9, 19.9));
  // kolom carport & kanopi alderon
  for (const x of [3.0, 10.0]) for (const z of [14.0, 16.5, 19.5]) group.add(box(0.15, 3.2, 0.15, MAT.wallDark, x, LEVELS.rabat + 1.6, z));
  const canopy = new THREE.Mesh(new THREE.BoxGeometry(7.4, 0.06, 5.6), new THREE.MeshStandardMaterial({ color: 0x6c7480, transparent: true, opacity: 0.55 }));
  canopy.position.set(6.5, LEVELS.rabat + 3.2, 16.8);
  group.add(canopy);
}

export function buildAll(results) {
  const root = new THREE.Group();
  const gSite = new THREE.Group(); gSite.name = 'site';
  const gLt1 = new THREE.Group(); gLt1.name = 'lt1';
  const gLt2 = new THREE.Group(); gLt2.name = 'lt2';
  const gRoof = new THREE.Group(); gRoof.name = 'roof';
  const gCeil = new THREE.Group(); gCeil.name = 'ceiling';
  const gFloors1 = new THREE.Group(); gFloors1.name = 'floors1';
  const gFloors2 = new THREE.Group(); gFloors2.name = 'floors2';
  const gStruct1 = new THREE.Group(); gStruct1.name = 'struct1';
  const gStruct2 = new THREE.Group(); gStruct2.name = 'struct2';
  buildSite(gSite);
  const floors = buildFloors(results, root);
  for (const f of floors) (f.userData.area.level > 2 ? gFloors2 : gFloors1).add(f);
  buildWalls(root);
  for (const m of [...root.children]) {
    if (m.isMesh) (m.position.y > LEVELS.dak2 - 0.5 ? gStruct2 : gStruct1).add(m);
  }
  const bw = new THREE.Group();
  buildBathWalls(results, bw);
  for (const m of [...bw.children]) (m.position.y > LEVELS.dak2 ? gStruct2 : gStruct1).add(m);
  buildStairs(gStruct1);
  buildSlab(gStruct2);
  buildRailings(gStruct2);
  buildRoof(gRoof);
  buildCeiling2(gCeil);
  gLt1.add(gFloors1, gStruct1);
  gLt2.add(gFloors2, gStruct2);
  root.add(gSite, gLt1, gLt2, gRoof, gCeil);
  return { root, gSite, gLt1, gLt2, gRoof, gCeil, gFloors1, gFloors2, gStruct1, gStruct2, floors };
}
