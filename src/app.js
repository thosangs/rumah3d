import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { computeAll, DEFAULT_CONFIG } from './calc.js';
import { LEVELS, STAIRS, SLAB2, SITE } from './data.js';
import { buildAll } from './scene.js';
import { renderHitungan, renderGalleries, bindLightbox } from './ui.js';

// ---------------------------------------------------------------------------
// Renderer & scene
// ---------------------------------------------------------------------------
const canvas = document.getElementById('c');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd8ee);
scene.fog = new THREE.Fog(0xbfd8ee, 60, 140);

const camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.05, 300);

const hemi = new THREE.HemisphereLight(0xcfe3ff, 0x7a7466, 0.7);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xfff4e0, 3.2);
sun.position.set(-9, 18, 26); // matahari dari depan-kiri (menyorot fasad & masuk lewat jendela depan)
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
sun.shadow.camera.left = -16; sun.shadow.camera.right = 16;
sun.shadow.camera.top = 16; sun.shadow.camera.bottom = -16;
sun.shadow.camera.near = 1; sun.shadow.camera.far = 70;
sun.shadow.bias = -0.0005;
sun.target.position.set(5, 0, 10);
scene.add(sun, sun.target);
// lampu dalam ruangan supaya interior tidak gelap
for (const [x, y, z] of [[6.5, 3.3, 6], [8.2, 3.3, 11], [4.75, 7.0, 7.5], [8.2, 7.0, 11]]) {
  const pl = new THREE.PointLight(0xfff1dc, 8, 11, 1.6);
  pl.position.set(x, y, z);
  scene.add(pl);
}

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------
let mode = 'walk';
let glbOn = false;
let cfg = { ...DEFAULT_CONFIG, wallZones: { ...DEFAULT_CONFIG.wallZones } };
let results = computeAll(cfg);
let built = null;
let showLabels = false; // label ukuran potongan: tekan L
let hideUpper = false;
let glbRoot = null;

function rebuild() {
  if (built) {
    scene.remove(built.root);
    built.root.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) {
        const ms = Array.isArray(o.material) ? o.material : [o.material];
        for (const m of ms) { if (m.map) m.map.dispose(); }
      }
    });
  }
  results = computeAll(cfg);
  built = buildAll(results);
  scene.add(built.root);
  applyVisibility();
  renderHitungan(results, document.getElementById('tab-hitung'), (areaId) => teleportToArea(areaId));  // no-op kalau panel tak ada
}
function applyVisibility() {
  if (!built) return;
  const on = glbOn && !!glbRoot;
  built.gLt2.visible = !hideUpper;
  built.gRoof.visible = !hideUpper && !on;
  built.gCeil.visible = !hideUpper && mode === 'walk' && !on;
  built.gSite.visible = !on;
  built.gStruct1.visible = !on;
  built.gStruct2.visible = !on;
  // saat model SKP tampil, angkat pola granit 5 cm: lantai model SKP (tekstur 60×60) puncaknya di ±+0,07 m,
  // kalau hanya 2 cm grid 60×60-nya tembus (z-fighting) dan terlihat seperti dua pola bertumpuk
  built.gFloors1.position.y = on ? 0.05 : 0;
  built.gFloors2.position.y = on ? 0.05 : 0;
  if (glbRoot) glbRoot.visible = on;
  if (glbRoot && on && hideUpper) glbRoot.visible = true; // model SKP tidak bisa dipotong per lantai
  const hm = document.getElementById('hud-mode'); if (hm) hm.textContent = on ? 'Model SKP asli + pola granit' : 'Model blok + pola granit';
}
rebuild();

// ---------------------------------------------------------------------------
// Kontrol: jalan (PointerLock + WASD) & orbit
// ---------------------------------------------------------------------------
const plc = new PointerLockControls(camera, document.body);
const orbit = new OrbitControls(camera, renderer.domElement);
orbit.enabled = false;
orbit.target.set(6, 2, 9);
orbit.maxPolarAngle = Math.PI * 0.495;
orbit.minDistance = 1.5;
orbit.maxDistance = 80;

const overlay = document.getElementById('overlay');
const crosshair = document.getElementById('crosshair');
overlay.addEventListener('click', () => { if (mode === 'walk') plc.lock(); else overlay.hidden = true; });
plc.addEventListener('lock', () => { overlay.hidden = true; crosshair.hidden = false; });
plc.addEventListener('unlock', () => { crosshair.hidden = true; if (mode === 'walk' && !panelOpenedByKey) overlay.hidden = false; panelOpenedByKey = false; });
let panelOpenedByKey = false;

const keys = new Set();
const player = { x: 4.75, y: LEVELS.teras, z: 13.2, level: 'lt1', vy: 0 };
const EYE = 1.62;
camera.position.set(player.x, player.y + EYE, player.z);
camera.rotation.set(0, -Math.PI / 2, 0); // hadap ke pintu utama

addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
  keys.add(e.code);
  switch (e.code) {
    case 'Digit1': teleport(4.4, 13.3, 'lt1', -Math.PI / 2); break;
    case 'Digit2': teleport(7.4, 6.0, 'lt2', Math.PI); break;
    case 'Digit3': teleport(6.5, 18.5, 'lt1', 0); break;
    case 'KeyM': setMode(mode === 'walk' ? 'orbit' : 'walk'); break;
    case 'KeyH': setCut(cut === 'none' ? 'lt1' : cut === 'lt1' ? 'lt2' : 'none'); break;
    case 'KeyL': setLabels(!showLabels); break;
    case 'KeyG': if (glbRoot) { glbOn = !glbOn; applyVisibility(); } break;
    case 'KeyP': togglePanel(); break;
  }
});
addEventListener('keyup', (e) => keys.delete(e.code));

function teleport(x, z, level, yaw) {
  player.x = x; player.z = z; player.level = level;
  player.y = groundHeight(x, z, level);
  camera.position.set(x, player.y + EYE, z);
  if (mode === 'walk') {
    camera.rotation.set(0, yaw, 0);
  } else {
    orbit.target.set(x, player.y + 1, z);
    camera.position.set(x + 6, player.y + 8, z + 8);
  }
}
function teleportToArea(areaId) {
  const f = results.floors.find((a) => a.id === areaId);
  if (!f) return;
  const r = f.rects[0];
  const cx = (r.x1 + r.x2) / 2, cz = (r.y1 + r.y2) / 2;
  const level = f.level > 2 ? 'lt2' : 'lt1';
  if (mode === 'orbit') {
    orbit.target.set(cx, f.level, cz);
    camera.position.set(cx, f.level + 9, cz + 2.5); // hampir tegak lurus, depan rumah di bawah layar
  } else {
    teleport(cx, cz, level, 0);
    camera.rotation.set(-0.6, 0, 0);
  }
}
// ---------------------------------------------------------------------------
// Tampilan: preset kamera (animasi), irisan ketinggian (clipping plane), toolbar
// ---------------------------------------------------------------------------
const clipPlane = new THREE.Plane(new THREE.Vector3(0, -1, 0), 1e6); // simpan titik dengan y < konstanta
renderer.clippingPlanes = [clipPlane];
const CUTS = { lt1: LEVELS.dak2 - 0.4, lt2: LEVELS.dakTalang - 0.2, none: 1e6 };
let cut = 'none';
function setCut(c) {
  cut = c;
  clipPlane.constant = CUTS[c];
  document.querySelectorAll('#viewbar [data-cut]').forEach((b) => b.classList.toggle('active', b.dataset.cut === c));
  if (c !== 'none' && mode === 'walk') setView('top');
}
let anim = null;
function flyTo(pos, target, ms = 700) {
  const p0 = camera.position.clone(), t0 = orbit.target.clone();
  const t1 = target.clone(), p1 = pos.clone();
  const start = performance.now();
  anim = () => {
    const k = Math.min(1, (performance.now() - start) / ms);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    camera.position.lerpVectors(p0, p1, e);
    orbit.target.lerpVectors(t0, t1, e);
    if (k >= 1) anim = null;
  };
}
const VIEWS = {
  orbit: { pos: new THREE.Vector3(-7, 12, 26), target: new THREE.Vector3(6, 1, 9) },
  top: { pos: new THREE.Vector3(6.5, 30, 9.6), target: new THREE.Vector3(6.5, 0, 9.5) },
  roof: { pos: new THREE.Vector3(-8, 16, 22), target: new THREE.Vector3(6.5, 4, 8.5) },
};
function setView(v) {
  document.querySelectorAll('#viewbar [data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === v));
  if (v === 'walk') { setMode('walk'); return; }
  const wasWalk = mode === 'walk';
  mode = 'orbit';
  plc.unlock();
  orbit.enabled = true;
  overlay.hidden = true;
  crosshair.hidden = true;
  camera.up.set(0, 1, 0);
  const pv = VIEWS[v];
  if (wasWalk) { camera.position.set(player.x, player.y + EYE, player.z); orbit.target.set(player.x, player.y, player.z - 3); }
  flyTo(pv.pos, pv.target);
  if (v === 'roof' && cut !== 'none') setCut('none');
  applyVisibility();
}
function setMode(m) {
  mode = m;
  if (m === 'orbit') { setView('orbit'); return; }
  anim = null;
  orbit.enabled = false;
  if (cut !== 'none') setCut('none');
  camera.position.set(player.x, player.y + EYE, player.z);
  camera.lookAt(player.x, player.y + EYE, player.z - 3);
  overlay.hidden = false;
  document.querySelectorAll('#viewbar [data-view]').forEach((b) => b.classList.toggle('active', b.dataset.view === 'walk'));
  applyVisibility();
}
document.querySelectorAll('#viewbar [data-view]').forEach((b) => b.addEventListener('click', () => setView(b.dataset.view)));
document.querySelectorAll('#viewbar [data-cut]').forEach((b) => b.addEventListener('click', () => setCut(b.dataset.cut)));
// klik 2× di lantai (mode orbit) → berdiri di sana
renderer.domElement.addEventListener('dblclick', (e) => {
  if (mode !== 'orbit') return;
  const rc = new THREE.Raycaster();
  rc.setFromCamera(new THREE.Vector2((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1), camera);
  const hits = rc.intersectObjects(scene.children, true).filter((h) => h.object.visible && h.point.y <= clipPlane.constant);
  if (!hits.length) return;
  const p = hits[0].point;
  const level = p.y > 2.0 ? 'lt2' : 'lt1';
  setMode('walk');
  teleport(THREE.MathUtils.clamp(p.x, -5, 15), THREE.MathUtils.clamp(p.z, -5, 26), level, 0);
  overlay.hidden = true;
  plc.lock();
});

// ---------------------------------------------------------------------------
// Tinggi lantai di posisi (x, z) untuk level tertentu — termasuk tangga
// ---------------------------------------------------------------------------
const inR = (r, x, z) => x >= r.x1 && x <= r.x2 && z >= r.y1 && z <= r.y2;
function stairHeight(x, z) {
  const { winders, run } = STAIRS;
  const tol = 0.12;
  // anak tangga awal: ramp ke arah +x dari lantai 1 sampai trap lebar
  const w0 = winders[0], w2 = winders[2];
  if (z >= w0.y1 - tol && z <= w0.y2 + tol) {
    if (x >= w0.x1 - tol && x < winders[1].x2) {
      const t = THREE.MathUtils.clamp((x - w0.x1) / (winders[1].x2 - w0.x1), 0, 1);
      return LEVELS.lt1 + (winders[1].top - LEVELS.lt1) * t + 0.1;
    }
    if (x >= w2.x1 && x <= w2.x2 + tol) return w2.top;
  }
  if (x >= run.x1 - tol && x <= run.x2 + tol && z >= run.yStart - tol && z <= run.yEnd + tol) {
    const t = THREE.MathUtils.clamp((z - run.yStart) / (run.yEnd - run.yStart), 0, 1);
    return run.from + (run.to - run.from) * t;
  }
  return null;
}
function groundHeight(x, z, level) {
  const s = stairHeight(x, z);
  if (s !== null) return s;
  if (level === 'lt2') {
    for (const r of SLAB2.rects) if (inR(r, x, z) && !SLAB2.voids.some((v) => inR(v, x, z))) {
      const outdoor = z > 13.5 || x < 3 || z < 3.5;
      return outdoor ? LEVELS.lt2 - 0.02 : LEVELS.lt2;
    }
    return null; // di luar dak → jatuh ke lantai 1
  }
  if (inR({ x1: 3, y1: 3.5, x2: 10, y2: 13.5 }, x, z)) return inR({ x1: 3, y1: 7, x2: 4.75, y2: 8.5 }, x, z) ? LEVELS.teras : LEVELS.lt1;
  if (inR({ x1: 3, y1: 12, x2: 6.5, y2: 13.5 }, x, z)) return LEVELS.teras;
  if (inR({ x1: 3, y1: 13.5, x2: 6.5, y2: 14 }, x, z)) return LEVELS.teras - 0.1;
  if (inR({ x1: 6.5, y1: 2, x2: 10, y2: 3.5 }, x, z)) return LEVELS.teras;
  if (inR(SITE.carport, x, z) || inR(SITE.selasarTapak, x, z) || inR(SITE.jemur, x, z)) return LEVELS.rabat;
  if (inR({ x1: 3, y1: 19.5, x2: 10, y2: 20 }, x, z)) return LEVELS.rabat - 0.05;
  if (inR(SITE.lot, x, z)) return LEVELS.rabat - 0.08;
  return LEVELS.tanah;
}

// ---------------------------------------------------------------------------
// HUD: ruang saat ini
// ---------------------------------------------------------------------------
const hud = document.getElementById('hud');
hud.addEventListener('click', () => hud.classList.toggle('mini'));
const hudRoom = document.getElementById('hud-room');
const hudDetail = document.getElementById('hud-detail');
let lastHudId = null;
function updateHud() {
  const x = player.x, z = player.z;
  let cur = null;
  for (const f of results.floors) {
    const onLevel = (player.level === 'lt2') === f.level > 2;
    if (!onLevel) continue;
    if (f.rects.some((r) => inR(r, x, z))) { cur = f; break; }
  }
  const id = cur ? cur.id : `none-${player.level}`;
  if (id === lastHudId) return;
  lastHudId = id;
  if (!cur) {
    hudRoom.textContent = player.level === 'lt2' ? 'Lantai 2 — di luar area granit' : stairHeight(x, z) !== null ? 'Tangga' : 'Di luar area granit (carport / taman / jalan)';
    hudDetail.innerHTML = 'Toolbar kanan bawah: ganti tampilan & irisan lantai. Mode orbit: klik 2× di lantai untuk berdiri di sana. <b>P</b> panel hitungan, <b>G</b> model SKP/blok.';
    return;
  }
  const L = cur.layout;
  hudRoom.textContent = `${cur.group} · ${cur.name}`;
  hudDetail.innerHTML = `${cur.tileSpec.label} ${cur.finish} · luas bersih <b>${cur.area} m²</b> · utuh <b>${L.full}</b> + potongan <b>${L.cuts} pcs</b> (dari ${L.cutTiles} keping) = <b>${L.total} keping</b><br/>Mulai pasang dari: ${L.name}. Potongan: ${L.cutList.map((c) => `${c.ukuran}×${c.jumlah}`).join(', ') || '-'}`;
}

function setLabels(on) {
  showLabels = on;
  window.__showLabels = on;
  document.querySelectorAll('#viewbar [data-labels]').forEach((b) => b.classList.toggle('active', on));
  rebuildTexturesOnly();
}
async function rebuildTexturesOnly() {
  const { floorTexture, wallTexture } = await import('./textures.js');
  for (const g of built.floors) {
    const f = g.userData.area;
    const { texture } = floorTexture(f, f.layout, 110, showLabels);
    g.children.forEach((m) => { m.material.map.dispose(); m.material.map = texture; m.material.needsUpdate = true; });
  }
  built.root.traverse((m) => {
    const bw = m.userData?.bathWall;
    if (!bw) return;
    const { texture } = wallTexture(bw.wl, bw.zones, 240, showLabels);
    m.material.map.dispose(); m.material.map = texture; m.material.needsUpdate = true;
  });
}
document.querySelectorAll('#viewbar [data-labels]').forEach((b) => b.addEventListener('click', () => setLabels(!showLabels)));

// ---------------------------------------------------------------------------
// Panel & UI
// ---------------------------------------------------------------------------
const $ = (id) => document.getElementById(id);
const panel = document.getElementById('panel'); // absen di build 3D-only
function togglePanel() { if (!panel) return; panel.classList.toggle('open'); if (panel.classList.contains('open')) { panelOpenedByKey = true; plc.unlock(); } }
if (panel) {
  panel.classList.remove('open'); // panel tertutup dulu; buka lewat tombol atau P
  document.getElementById('toggle-panel').addEventListener('click', () => panel.classList.toggle('open'));
  for (const b of document.querySelectorAll('#tabs button')) {
    b.addEventListener('click', () => {
      document.querySelectorAll('#tabs button').forEach((x) => x.classList.toggle('active', x === b));
      document.querySelectorAll('.tab').forEach((t) => t.classList.toggle('active', t.id === `tab-${b.dataset.tab}`));
    });
  }
  renderGalleries(document.getElementById('tab-arsitek'), document.getElementById('tab-render'));
  bindLightbox();
  $('s-apply').addEventListener('click', () => {
    cfg.floorPcsPerBox = +$('s-pcs').value || 2;
    cfg.wallPcsPerBox = +$('s-wpcs').value || 8;
    cfg.wastePct = +$('s-waste').value || 0;
    cfg.bathFloorMode = $('s-bath').value;
    const [b, t] = $('s-zones').value.split('/');
    cfg.wallZones = { bottomH: b === 'beda' ? null : +b / 100, topH: t === 'dak' ? null : +t / 100 };
    cfg.includeOptional = $('s-jemur').checked;
    cfg.layoutMode = $('s-layout').value;
    rebuild();
    lastHudId = null;
    if (glbRoot) {
      glbRoot.scale.setScalar(+$('s-glbscale').value || 1);
      glbRoot.position.set(+$('s-gx').value || 0, +$('s-gy').value || 0, +$('s-gz').value || 0);
    }
    document.querySelector('#tabs button[data-tab="hitung"]').click();
  });
}

function perforatedMaterial() {
  const cv = document.createElement('canvas');
  cv.width = cv.height = 64;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, 64, 64);
  ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(32, 32, 20, 0, Math.PI * 2); ctx.fill(); // lubang ~30% luas
  const alpha = new THREE.CanvasTexture(cv);
  alpha.wrapS = alpha.wrapT = THREE.RepeatWrapping;
  alpha.magFilter = THREE.LinearFilter;
  return new THREE.MeshStandardMaterial({ color: 0x23262a, metalness: 0.7, roughness: 0.45, alphaMap: alpha, alphaTest: 0.5, side: THREE.DoubleSide });
}

// Model SKP asli (export glTF) — models/rumah.glb, dikompres meshopt
const gltfLoader = new GLTFLoader();
gltfLoader.setMeshoptDecoder(MeshoptDecoder);
gltfLoader.load(
  'models/rumah.glb',
  (gltf) => {
    glbRoot = gltf.scene;
    glbRoot.traverse((o) => {
      if (!o.isMesh) return;
      o.receiveShadow = true;
      const mats = Array.isArray(o.material) ? o.material : [o.material];
      o.castShadow = !mats.some((m) => m && m.transparent); // kaca tidak membayang
      if (mats.some((m) => m && m.name === 'Perforated')) {
        // plat besi perforated: lubang lewat alphaMap, UV planar dari posisi (panel sejajar sumbu)
        o.updateWorldMatrix(true, false);
        const pos = o.geometry.attributes.position;
        const uv = new Float32Array(pos.count * 2);
        const v = new THREE.Vector3();
        for (let i = 0; i < pos.count; i++) {
          v.fromBufferAttribute(pos, i).applyMatrix4(o.matrixWorld); // posisi dunia (meter)
          uv[i * 2] = (v.x + v.z) * 12; uv[i * 2 + 1] = v.y * 12; // pitch lubang ±8 cm
        }
        o.geometry.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
        o.material = perforatedMaterial();
        o.castShadow = true;
        return;
      }
      for (const m of mats) {
        if (!m) continue;
        if (m.name === 'Solarflat') {
          // atap solarflat: lembar polikarbonat datar, tembus cahaya (bukan beton)
          m.transparent = true; m.opacity = 0.45; m.depthWrite = false; m.roughness = 0.25; m.metalness = 0; m.side = THREE.DoubleSide;
          continue;
        }
        if (m.transparent) {
          // material kaca yang masih punya alpha → pastikan tembus pandang
          m.transparent = true;
          m.opacity = Math.min(m.opacity ?? 1, 0.35);
          m.depthWrite = false;
          m.roughness = 0.1;
          m.side = THREE.DoubleSide;
        }
      }
    });
    // Model SKP: kavling x 0–10 sama dengan denah, sumbu z = y_denah − 20 (depan rumah di z=0), muka tanah di y=0.
    glbRoot.position.set(0, LEVELS.tanah, 19.5); // model SKP: kavling mulai y=0.5 (bergeser 0,5 m dari DED)
    glbRoot.name = 'glb';
    scene.add(glbRoot);
    glbOn = true;
    applyVisibility();
    const bb = new THREE.Box3().setFromObject(glbRoot);
    const size = bb.getSize(new THREE.Vector3());
    if ($('glb-status')) {
      $('glb-status').innerHTML = `Status: <b>models/rumah.glb dimuat</b> (${Math.round(size.x)} × ${Math.round(size.z)} m, ${gltf.scene.children.length} node). Tekan <kbd>G</kbd> untuk ganti antara model SKP asli dan model blok.`;
      $('s-glbscale').value = '1';
      $('s-gx').value = '0'; $('s-gy').value = LEVELS.tanah.toFixed(2); $('s-gz').value = '19.5';
    }
  },
  undefined,
  () => { if ($('glb-status')) $('glb-status').textContent = 'Status: models/rumah.glb tidak bisa dimuat.'; },
);

// ---------------------------------------------------------------------------
// Loop
// ---------------------------------------------------------------------------
const clock = new THREE.Clock();
const fwd = new THREE.Vector3(), right = new THREE.Vector3();
function animate() {
  const dt = Math.min(clock.getDelta(), 0.05);
  if (mode === 'walk') {
    const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight') ? 5.5 : 2.6) * dt;
    camera.getWorldDirection(fwd); fwd.y = 0; fwd.normalize();
    right.crossVectors(fwd, camera.up).normalize();
    let mx = 0, mz = 0;
    if (keys.has('KeyW') || keys.has('ArrowUp')) { mx += fwd.x; mz += fwd.z; }
    if (keys.has('KeyS') || keys.has('ArrowDown')) { mx -= fwd.x; mz -= fwd.z; }
    if (keys.has('KeyD') || keys.has('ArrowRight')) { mx += right.x; mz += right.z; }
    if (keys.has('KeyA') || keys.has('ArrowLeft')) { mx -= right.x; mz -= right.z; }
    if (mx || mz) {
      const len = Math.hypot(mx, mz);
      player.x += (mx / len) * speed;
      player.z += (mz / len) * speed;
      player.x = THREE.MathUtils.clamp(player.x, -14, 24);
      player.z = THREE.MathUtils.clamp(player.z, -8, 30);
    }
    // level otomatis: naik lewat tangga, turun kalau keluar dak
    const sh = stairHeight(player.x, player.z);
    if (sh !== null) player.level = sh > LEVELS.lt2 - 0.6 ? 'lt2' : 'lt1';
    let gh = groundHeight(player.x, player.z, player.level);
    if (gh === null) { player.level = 'lt1'; gh = groundHeight(player.x, player.z, 'lt1'); }
    if (sh === null && player.level === 'lt2' && Math.abs(player.y - LEVELS.lt2) > 1.2 && player.y < 2.0) player.level = 'lt1';
    player.y += (gh - player.y) * Math.min(1, dt * 10);
    camera.position.set(player.x, player.y + EYE, player.z);
    updateHud();
  } else {
    if (anim) anim();
    orbit.update();
  }
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}
animate();

window.__dbg = { teleport, camera, player, setMode, scene, get results() { return results; }, get glb() { return glbRoot; } };

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
