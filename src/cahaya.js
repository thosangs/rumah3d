// Simulator cahaya: matahari nyata (lokasi, tanggal, jam, arah hadap rumah), lampu dari daftar titik lampu dengan satuan fisik
// (lumen, Kelvin, sudut sorot), warna cat dinding luar/dalam/plafon/atap, eksposur kamera (manual atau adaptasi mata),
// dan render realistis path tracing (three-gpu-pathtracer). Semua satuan fisik: matahari dalam lux, lampu dalam candela,
// langit dalam nit — supaya terang siang vs lampu malam sebanding seperti aslinya.
import * as THREE from 'three';
import { LEVELS } from './data.js';
import { LAMPU, PERANGKAT } from './layout/elektrik.js';

const KOTA = {
  metro: { n: 'Metro, Lampung (lokasi rumah)', lat: -5.1331, lon: 105.3014, tz: 7 },
  jakarta: { n: 'Jakarta', lat: -6.2, lon: 106.82, tz: 7 },
  bogor: { n: 'Bogor', lat: -6.6, lon: 106.8, tz: 7 },
  bandung: { n: 'Bandung', lat: -6.91, lon: 107.61, tz: 7 },
  semarang: { n: 'Semarang', lat: -6.97, lon: 110.42, tz: 7 },
  yogyakarta: { n: 'Yogyakarta', lat: -7.8, lon: 110.36, tz: 7 },
  surabaya: { n: 'Surabaya', lat: -7.25, lon: 112.75, tz: 7 },
  malang: { n: 'Malang', lat: -7.98, lon: 112.63, tz: 7 },
  medan: { n: 'Medan', lat: 3.6, lon: 98.67, tz: 7 },
  palembang: { n: 'Palembang', lat: -2.98, lon: 104.76, tz: 7 },
  denpasar: { n: 'Denpasar', lat: -8.65, lon: 115.22, tz: 8 },
  makassar: { n: 'Makassar', lat: -5.15, lon: 119.43, tz: 8 },
  balikpapan: { n: 'Balikpapan', lat: -1.27, lon: 116.83, tz: 8 },
};
const ARAH = { U: 0, TL: 45, T: 90, TG: 135, S: 180, BD: 225, B: 270, BL: 315 }; // link lama menyimpan hadap sebagai huruf
// warna cat contoh (perkiraan, bukan kode merek) — tempel kode hex dari situs merek cat untuk warna persis
const CAT = [
  ['#f4f1ea', 'Putih hangat'], ['#ede6d8', 'Broken white'], ['#e9dfcd', 'Krem (default)'], ['#d9cfc0', 'Greige'],
  ['#c9c5bc', 'Abu muda'], ['#b9c2b0', 'Sage'], ['#d8b9a0', 'Terakota muda'], ['#a9b8c4', 'Biru abu'],
  ['#7d7a74', 'Abu tua'], ['#33373d', 'Charcoal (default atap)'], ['#1f2124', 'Hitam doff'],
];
const FINISH = { doff: 0.92, satin: 0.6, gloss: 0.3 };
const WB = { mata: 'Seperti mata (adaptasi sebagian)', hp: 'Kamera HP (white balance otomatis)', siang: 'Tanpa adaptasi (WB siang 5500K)' };
const SOROT = { lebar: [100, 'Downlight lebar 100°'], sedang: [60, 'Downlight 60°'], spot: [36, 'Spotlight 36°'], sempit: [24, 'Spotlight sempit 24°'] };

const DEFAULT = {
  kota: 'metro', hadap: 115.5, tgl: new Date().toISOString().slice(0, 10), jam: 16,
  lampu: true, kDalam: 3000, kGantung: 2700, kLuar: 3000, lmw: 90, sorot: 'lebar',
  cat: { luar: '#e9dfcd', dalam: '#e9dfcd', plafon: '#f4f1ea', atap: '#33373d' }, finish: 'doff',
  auto: true, ev: 12, komp: 0, wb: 'mata',
};
const WALL_HEX = 0xe9dfcd, ROOF_HEX = 0x33373d;
// badan rumah (koordinat dunia) — dipakai untuk memisah muka tembok dalam/luar dan lampu dalam/luar
const RUMAH = new THREE.Box3(new THREE.Vector3(3.0, -0.2, 3.5), new THREE.Vector3(9.95, 7.6, 13.65));

// ---------------------------------------------------------------------------
// Fisika kecil: posisi matahari, warna Kelvin, langit
// ---------------------------------------------------------------------------
const RAD = Math.PI / 180;
/** Elevasi & azimut matahari (derajat, azimut dari utara searah jarum jam). Algoritma ringkas USNO, galat < 1°. */
export function posisiMatahari(ms, lat, lon) {
  const d = ms / 86400000 + 2440587.5 - 2451545.0;
  const g = (357.529 + 0.98560028 * d) * RAD;
  const q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * RAD;
  const e = (23.439 - 0.00000036 * d) * RAD;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L));
  const dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = 18.697374558 + 24.06570982441908 * d;
  const H = ((gmst + lon / 15) * 15) * RAD - ra;
  const phi = lat * RAD;
  const elev = Math.asin(Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H));
  const az = Math.atan2(-Math.sin(H) * Math.cos(dec), Math.sin(dec) * Math.cos(phi) - Math.cos(dec) * Math.sin(phi) * Math.cos(H));
  return { elev: elev / RAD, az: ((az / RAD) + 360) % 360 };
}
/** Warna cahaya dari suhu warna (Kelvin), linear, luminansi dinormalkan = 1 (terang diatur lumen, bukan warna). */
export function warnaKelvin(k) {
  const t = k / 100;
  const r = t <= 66 ? 255 : 329.698727446 * Math.pow(t - 60, -0.1332047592);
  const g = t <= 66 ? 99.4708025861 * Math.log(t) - 161.1195681661 : 288.1221695283 * Math.pow(t - 60, -0.0755148492);
  const b = t >= 66 ? 255 : t <= 19 ? 0 : 138.5177312231 * Math.log(t - 10) - 305.0447927307;
  const c = new THREE.Color().setRGB(...[r, g, b].map((v) => THREE.MathUtils.clamp(v, 0, 255) / 255), THREE.SRGBColorSpace);
  const y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
  return c.multiplyScalar(1 / y);
}
const suhuMatahari = (elev) => 1900 + 3700 * (1 - Math.exp(-Math.max(Math.sin(elev * RAD), 0) * 3.5));
const PUTIH = new THREE.Color(1, 1, 1);
const smooth = (a, b, x) => { const t = THREE.MathUtils.clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
/** Arah kompas (derajat) → vektor dunia. Depan rumah (+z) menghadap `hadap`; dilihat dari atas +x = hadap − 90°. */
function arahDunia(az, elev, hadap) {
  const d = (az - hadap) * RAD, ce = Math.cos(elev * RAD);
  return new THREE.Vector3(-Math.sin(d) * ce, Math.sin(elev * RAD), Math.cos(d) * ce);
}
/** Iluminansi matahari langsung (lux, tegak lurus berkas) — model massa udara Meinel. */
function luxMatahari(elev) {
  if (elev <= 0) return 0;
  const am = 1 / (Math.sin(elev * RAD) + 0.50572 * Math.pow(elev + 6.07995, -1.6364));
  return 128000 * Math.pow(0.7, Math.pow(am, 0.678)) * smooth(0, 3, elev);
}
/** Langit equirect (nit): biru di zenit, putih di cakrawala, jingga di dekat matahari saat rendah, gelap di malam hari. */
function teksturLangit(tex, sunDir, elev, eSun, wb, pantul = 0) {
  const W = 128, H = 64, data = tex.image.data;
  const s = Math.sin(elev * RAD);
  const siang = smooth(-8, 4, elev);
  const Lz = (1500 + 7000 * Math.max(s, 0)) * siang + 0.05; // radiansi langit rata-rata (nit); malam ≈ cahaya kota
  const senja = 1 - smooth(2, 25, elev);
  const zenit = new THREE.Color(0.32, 0.5, 1.0), cakrawala = new THREE.Color(0.85, 0.9, 1.0), jingga = new THREE.Color(1.0, 0.55, 0.25);
  const malam = new THREE.Color(0.25, 0.3, 0.45);
  const tanah = new THREE.Color(0.42, 0.4, 0.36);
  const eTanah = 0.18 * (eSun * Math.max(s, 0) + Math.PI * Lz) / Math.PI; // pantulan tanah (albedo 18%)
  const c = new THREE.Color(), dir = new THREE.Vector3();
  for (let j = 0; j < H; j++) {
    const th = ((j + 0.5) / H - 0.5) * Math.PI;
    for (let i = 0; i < W; i++) {
      const ph = ((i + 0.5) / W - 0.5) * Math.PI * 2;
      dir.set(Math.cos(th) * Math.cos(ph), Math.sin(th), Math.cos(th) * Math.sin(ph));
      let L;
      if (dir.y >= 0) {
        c.copy(cakrawala).lerp(zenit, Math.pow(dir.y, 0.5));
        const dekat = Math.max(dir.dot(sunDir), 0);
        c.lerp(jingga, senja * Math.pow(dekat, 3) * (1 - dir.y) * 0.9);
        c.lerp(malam, 1 - siang);
        L = Lz * (0.8 + 0.6 * (1 - dir.y)) + siang * Lz * 2 * Math.pow(dekat, 16);
      } else { c.copy(tanah); L = eTanah; }
      c.lerp(PUTIH, pantul).multiply(wb);
      const y = 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b;
      const k = (j * W + i) * 4;
      data[k] = THREE.DataUtils.toHalfFloat(Math.min(c.r / y * L, 60000));
      data[k + 1] = THREE.DataUtils.toHalfFloat(Math.min(c.g / y * L, 60000));
      data[k + 2] = THREE.DataUtils.toHalfFloat(Math.min(c.b / y * L, 60000));
      data[k + 3] = THREE.DataUtils.toHalfFloat(1);
    }
  }
  tex.needsUpdate = true;
}

// ---------------------------------------------------------------------------
// Simulator
// ---------------------------------------------------------------------------
export function initCahaya({ renderer, scene, camera, sun, legacyLights, getGlb }) {
  const st = bacaUrl() || structuredClone(DEFAULT);
  let aktif = false, saved = null, split = null, ui = null;
  let pt = null, ptOn = false, ptBusy = false, ptDirty = false;
  const lastCam = new THREE.Matrix4();
  const teksturBaru = () => {
    const t = new THREE.DataTexture(new Uint16Array(128 * 64 * 4), 128, 64, THREE.RGBAFormat, THREE.HalfFloatType);
    t.mapping = THREE.EquirectangularReflectionMapping; t.magFilter = t.minFilter = THREE.LinearFilter;
    return t;
  };
  const langit = teksturBaru();
  // cahaya langit untuk mode biasa: IBL tidak kenal tembok/atap, jadi di dalam rumah diredam ke ±5% (faktor cahaya siang
  // lewat jendela) dan dinetralkan (sudah memantul di dinding). Path tracer memakai `langit` asli karena menghitung oklusi sendiri.
  const langitIbl = teksturBaru();
  let diDalam = false;
  const lampu = new THREE.Group(); lampu.name = 'lampu-simulasi';
  const emisi = new Map(); // material emissive → intensitas asli
  const ukur = new THREE.WebGLRenderTarget(48, 32, { type: THREE.FloatType });
  const piksel = new Float32Array(48 * 32 * 4);
  let evAuto = st.ev, frame = 0, ukurLagi = 3;

  // ---------- titik lampu dari daftar lampu ----------
  const titik = [];
  for (const l of LAMPU) {
    const y = LEVELS[l.lvl] + l.h;
    const jenis = l.j || 'dl';
    const watt = typeof l.w === 'number' ? l.w : 10;
    const p = new THREE.Vector3(l.x, y, l.z);
    if (jenis === 'gantung') titik.push({ grup: 'gantung', watt, p: new THREE.Vector3(l.x, LEVELS[l.lvl] + (/makan/.test(l.r) ? 1.65 : 2.25), l.z), arah: null });
    else if (jenis === 'uplight' || jenis === 'tanam') titik.push({ grup: 'luar', watt, p: p.setY(y + 0.05), arah: 1, sudut: 30 });
    else titik.push({ grup: RUMAH.containsPoint(p.clone().setY(y - 0.5)) ? 'dalam' : 'luar', watt, p: p.setY(y - 0.03), arah: -1 });
  }
  const NORMAL = { '+x': [1, 0], '-x': [-1, 0], '+z': [0, 1], '-z': [0, -1] };
  for (const s of PERANGKAT) {
    if (s.t !== 'sconce') continue;
    const [nx, nz] = NORMAL[s.n] || [0, 0];
    const p = new THREE.Vector3(s.x + nx * 0.08, LEVELS[s.lvl] + s.h, s.z + nz * 0.08);
    titik.push({ grup: 'luar', watt: 2.5, p, arah: 1, sudut: 20 }, { grup: 'luar', watt: 2.5, p: p.clone(), arah: -1, sudut: 20 });
  }
  for (const t of titik) {
    if (t.arah == null) { t.light = new THREE.PointLight(0xffffff, 1, 0, 2); t.light.position.copy(t.p); }
    else {
      t.light = new THREE.SpotLight(0xffffff, 1, 0, 0.5, 0.5, 2);
      t.light.position.copy(t.p);
      t.light.target.position.copy(t.p).add(new THREE.Vector3(0, t.arah, 0));
      t.light.radius = 0.035; // bukaan armatur (bayangan lembut di path tracer)
      lampu.add(t.light.target);
    }
    lampu.add(t.light);
  }

  function aturLampu() {
    const beam = SOROT[st.sorot][0];
    for (const t of titik) {
      const k = { dalam: st.kDalam, gantung: st.kGantung, luar: st.kLuar }[t.grup];
      t.light.color.copy(warnaKelvin(k)).multiply(wbMul);
      const lm = st.lampu ? t.watt * st.lmw : 0;
      if (t.light.isSpotLight) {
        const half = ((t.grup === 'dalam' ? beam : t.sudut) / 2) * RAD;
        t.light.angle = Math.min(half * 1.25, Math.PI / 2 - 0.01);
        t.light.penumbra = 0.6;
        t.light.intensity = lm / (2 * Math.PI * (1 - Math.cos(half))); // candela = lumen / sudut ruang berkas
      } else t.light.intensity = lm / (4 * Math.PI);
    }
    aturEmisi();
  }
  /** Mode biasa: hanya MAKS_SPOT lampu sorot terdekat kamera yang menyala (jumlah tetap → shader tidak dikompilasi ulang,
   *  tetap ringan di HP). Path tracer memakai semua lampu. */
  const MAKS_SPOT = 16;
  function pilihLampu(semua) {
    const spots = titik.filter((t) => t.light.isSpotLight);
    if (!semua) spots.sort((a, b) => a.p.distanceToSquared(camera.position) - b.p.distanceToSquared(camera.position));
    spots.forEach((t, i) => { t.light.visible = semua || i < MAKS_SPOT; });
  }
  /** Permukaan lampu (armatur SKP, LED strip, lampu gantung) diterangkan ke ±7000 nit, mati saat lampu dimatikan. */
  function aturEmisi() {
    scene.traverse((o) => {
      if (!o.material || o.parent === lampu) return;
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        if (!m.emissive || (!emisi.has(m) && (m.emissiveIntensity === 0 || m.emissive.getHex() === 0))) continue;
        if (!emisi.has(m)) emisi.set(m, m.emissiveIntensity);
        m.emissiveIntensity = aktif ? (st.lampu ? emisi.get(m) * 2800 : 0) : emisi.get(m);
      }
    });
  }

  /** White balance (von Kries sederhana): semua sumber cahaya dikali 1/warna putih acuan. Mata beradaptasi sebagian
   *  ke sumber cahaya utama, kamera HP hampir penuh, tanpa adaptasi = acuan cahaya siang. */
  let wbMul = new THREE.Color(1, 1, 1);
  function aturWb(elev) {
    const utama = elev > 5 ? suhuMatahari(elev) : st.lampu ? st.kDalam : 5500;
    const f = { mata: 0.6, hp: 0.9, siang: 0 }[st.wb];
    const ref = warnaKelvin(5500 + (utama - 5500) * f);
    const d65 = warnaKelvin(5500);
    wbMul = new THREE.Color(d65.r / ref.r, d65.g / ref.g, d65.b / ref.b);
  }
  function aturMatahari() {
    const kota = KOTA[st.kota];
    const [y, mo, d] = st.tgl.split('-').map(Number);
    const ms = Date.UTC(y, mo - 1, d) + (st.jam - kota.tz) * 3600e3;
    const { elev, az } = posisiMatahari(ms, kota.lat, kota.lon);
    const dir = arahDunia(az, elev, +st.hadap);
    const e = luxMatahari(elev);
    aturWb(elev);
    sun.position.copy(sun.target.position).addScaledVector(dir, 40);
    sun.intensity = e;
    sun.color.copy(warnaKelvin(suhuMatahari(elev))).multiply(wbMul);
    sun.visible = e > 0;
    teksturLangit(langit, dir, elev, e, wbMul);
    teksturLangit(langitIbl, dir, elev, e, wbMul, diDalam ? 0.7 : 0);
    scene.environment = ptOn ? langit : langitIbl;
    scene.environmentIntensity = !ptOn && diDalam ? 0.05 : 1;
    return { elev, az };
  }

  /** Pisah cat tembok model SKP jadi tiga: muka luar, muka dalam, plafon (menurut arah muka & badan rumah). */
  function pisahTembok(root) {
    const mats = { luar: null, dalam: null, plafon: null, atap: [] };
    const a = new THREE.Vector3(), b = new THREE.Vector3(), c = new THREE.Vector3(), n = new THREE.Vector3(), p = new THREE.Vector3();
    const base = new Map();
    root.traverse((o) => {
      if (!o.isMesh || Array.isArray(o.material)) return;
      const m = o.material, hex = m.color && m.color.getHex();
      if (hex === ROOF_HEX && !m.map) { mats.atap.push(m); return; }
      if (hex !== WALL_HEX || m.map || m.transparent) return;
      if (!base.has(m)) base.set(m, { luar: m.clone(), dalam: m.clone(), plafon: m.clone() });
      const set = base.get(m);
      const g = o.geometry.clone(); o.geometry = g;
      const pos = g.attributes.position, idx = g.index ? g.index.array : [...Array(pos.count).keys()];
      const buckets = [[], [], []];
      for (let t = 0; t < idx.length; t += 3) {
        a.fromBufferAttribute(pos, idx[t]).applyMatrix4(o.matrixWorld);
        b.fromBufferAttribute(pos, idx[t + 1]).applyMatrix4(o.matrixWorld);
        c.fromBufferAttribute(pos, idx[t + 2]).applyMatrix4(o.matrixWorld);
        n.subVectors(c, b).cross(p.subVectors(a, b)).normalize();
        p.copy(a).add(b).add(c).multiplyScalar(1 / 3).addScaledVector(n, 0.3);
        const k = !RUMAH.containsPoint(p) ? 0 : n.y < -0.7 ? 2 : 1;
        buckets[k].push(idx[t], idx[t + 1], idx[t + 2]);
      }
      g.setIndex([...buckets[0], ...buckets[1], ...buckets[2]]);
      g.clearGroups();
      let s = 0;
      buckets.forEach((bk, i) => { g.addGroup(s, bk.length, i); s += bk.length; });
      o.material = [set.luar, set.dalam, set.plafon];
    });
    for (const set of base.values()) {
      (mats.luarList ||= []).push(set.luar); (mats.dalamList ||= []).push(set.dalam); (mats.plafonList ||= []).push(set.plafon);
    }
    return mats;
  }
  function aturCat() {
    const glb = getGlb();
    if (!glb) return;
    if (!split) { glb.updateWorldMatrix(true, true); split = pisahTembok(glb); }
    const r = FINISH[st.finish];
    for (const [key, list] of [['luar', split.luarList], ['dalam', split.dalamList], ['plafon', split.plafonList], ['atap', split.atap]]) {
      for (const m of list || []) { m.color.set(st.cat[key]); if (key !== 'atap') m.roughness = key === 'plafon' ? 0.95 : r; }
    }
  }

  // ---------- eksposur ----------
  const evKeExposure = (ev) => 1.44 * Math.pow(2, -ev); // EV100: abu-abu 18% → 0,18 sebelum tone mapping
  function ukurEv() {
    renderer.setRenderTarget(ukur); renderer.render(scene, camera); renderer.setRenderTarget(null); // render target: tanpa tone mapping
    renderer.readRenderTargetPixels(ukur, 0, 0, 48, 32, piksel);
    let s = 0, nn = 0;
    for (let i = 0; i < piksel.length; i += 4) { const y = 0.2126 * piksel[i] + 0.7152 * piksel[i + 1] + 0.0722 * piksel[i + 2]; if (isFinite(y)) { s += Math.log(1e-3 + y); nn++; } }
    const lavg = Math.exp(s / Math.max(nn, 1));
    return THREE.MathUtils.clamp(Math.log2(Math.max(lavg, 1e-3) / 0.125), 1, 16);
  }

  // ---------- path tracer ----------
  async function mulaiPt() {
    if (ptBusy) return;
    ptBusy = true; status('Menyiapkan path tracer (bisa 10–30 detik)…');
    try {
      if (!pt) {
        const { WebGLPathTracer } = await import('../vendor/pathtracer/three-gpu-pathtracer.module.js');
        pt = new WebGLPathTracer(renderer);
        pt.bounces = 6; pt.filterGlossyFactor = 0.5; pt.minSamples = 1; pt.renderScale = Math.min(1, 1.25 / renderer.getPixelRatio());
        pt.tiles.set(2, 2); pt.dynamicLowRes = true; pt.lowResScale = 0.25;
      }
      if (st.auto) { evAuto = ukurEv(); renderer.toneMappingExposure = evKeExposure(evAuto + st.komp); }
      await new Promise((r) => setTimeout(r, 30));
      pilihLampu(true);
      scene.environment = langit; scene.environmentIntensity = 1;
      pt.setScene(scene, camera);
      lastCam.copy(camera.matrixWorld);
      ptOn = true; ptDirty = false;
    } catch (err) { console.error(err); status('Path tracer gagal dimuat di browser ini.'); ptOn = false; }
    ptBusy = false; syncUi();
  }
  function stopPt() { ptOn = false; pilihLampu(false); if (aktif) aturMatahari(); status(''); syncUi(); }

  // ---------- aktif / nonaktif ----------
  function aktifkan(on) {
    if (on === aktif) return;
    aktif = on;
    if (on) {
      saved = {
        env: scene.environment, envI: scene.environmentIntensity, bg: scene.background, bgI: scene.backgroundIntensity, fog: scene.fog,
        tm: renderer.toneMapping, exp: renderer.toneMappingExposure, sun: [sun.intensity, sun.color.clone(), sun.position.clone(), sun.visible],
      };
      for (const l of legacyLights) l.visible = false;
      diDalam = RUMAH.containsPoint(camera.position);
      scene.background = langit; scene.backgroundIntensity = 1;
      scene.fog = null;
      renderer.toneMapping = THREE.NeutralToneMapping; // tidak menggeser rona warna cat seperti ACES
      scene.add(lampu);
      pilihLampu(false);
      terapkan();
    } else {
      stopPt();
      scene.remove(lampu);
      for (const l of legacyLights) l.visible = true;
      Object.assign(scene, { environment: saved.env, environmentIntensity: saved.envI, background: saved.bg, backgroundIntensity: saved.bgI, fog: saved.fog });
      renderer.toneMapping = saved.tm; renderer.toneMappingExposure = saved.exp;
      [sun.intensity] = saved.sun; sun.color.copy(saved.sun[1]); sun.position.copy(saved.sun[2]); sun.visible = saved.sun[3];
      aturEmisi();
    }
    syncUi();
  }
  function terapkan() {
    if (!aktif) return;
    const info = aturMatahari();
    aturLampu(); aturCat();
    if (!st.auto) renderer.toneMappingExposure = evKeExposure(st.ev);
    tulisUrl();
    if (ui) ui.sunInfo.textContent = info.elev > 0 ? `matahari ${info.elev.toFixed(0)}° di atas cakrawala, arah ${kompas(info.az)} (${info.az.toFixed(0)}°)` : 'matahari sudah terbenam';
    if (ptOn) ptDirty = true;
    ukurLagi = 2;
  }
  const kompas = (az) => ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'][Math.round(az / 45) % 8];

  /** Dipanggil tiap frame dari loop app. true = frame sudah digambar di sini (path tracing). */
  function render() {
    if (!aktif) return false;
    frame++;
    if (frame % 120 === 0) aturEmisi(); // furnitur GLB termuat belakangan
    if (!ptOn && frame % 15 === 0) {
      pilihLampu(false);
      if (RUMAH.containsPoint(camera.position) !== diDalam) { diDalam = !diDalam; aturMatahari(); ukurLagi = 2; }
    }
    if (st.auto && !ptOn && (ukurLagi > 0 || frame % 20 === 0)) {
      evAuto += (ukurEv() - evAuto) * (ukurLagi-- > 0 ? 1 : 0.5);
      renderer.toneMappingExposure = evKeExposure(evAuto + st.komp);
      if (ui) ui.evVal.textContent = `EV ${(evAuto + st.komp).toFixed(1)}`;
    }
    if (!ptOn) return false;
    if (ptDirty) { pt.updateLights(); pt.updateMaterials(); pt.updateEnvironment(); ptDirty = false; }
    if (!lastCam.equals(camera.matrixWorld)) { pt.updateCamera(); lastCam.copy(camera.matrixWorld); }
    pt.renderSample();
    if (frame % 10 === 0) status(`Render realistis: ${Math.floor(pt.samples)} sampel — makin lama makin halus. Gerakkan kamera = mulai ulang.`);
    return true;
  }

  // ---------- URL: setelan bisa dibagikan lewat link ----------
  function tulisUrl() {
    const q = new URLSearchParams(location.hash.slice(1));
    q.set('cahaya', btoa(JSON.stringify(st)));
    history.replaceState(null, '', '#' + q.toString());
  }
  function bacaUrl() {
    try {
      const v = new URLSearchParams(location.hash.slice(1)).get('cahaya');
      if (!v) return null;
      const s = { ...structuredClone(DEFAULT), ...JSON.parse(atob(v)) };
      s.cat = { ...DEFAULT.cat, ...s.cat };
      if (s.hadap in ARAH) s.hadap = ARAH[s.hadap];
      if (!KOTA[s.kota]) s.kota = DEFAULT.kota;
      return s;
    } catch { return null; }
  }

  // ---------- panel ----------
  function status(t) { if (ui) ui.status.textContent = t; }
  function syncUi() {
    document.querySelectorAll('[data-cahaya]').forEach((b) => b.classList.toggle('active', aktif));
    if (!ui) return;
    ui.root.hidden = !aktif;
    ui.pt.textContent = ptOn ? '⏹ Stop render' : ptBusy ? '…' : '📷 Render realistis';
  }
  function buatPanel() {
    const root = document.createElement('aside');
    root.id = 'cahaya'; root.hidden = true;
    const opt = (o, v) => Object.entries(o).map(([k, n]) => `<option value="${k}"${k === v ? ' selected' : ''}>${n}</option>`).join('');
    const catRow = (key, label) => `<label class="cat">${label}<input type="color" data-cat="${key}" value="${st.cat[key]}" /><input type="text" data-cathex="${key}" value="${st.cat[key]}" maxlength="7" spellcheck="false" /></label>`;
    const kRow = (key, label) => `<label>${label} <output data-out="${key}"></output><input type="range" min="2200" max="6500" step="100" data-k="${key}" value="${st[key]}" /></label>`;
    root.innerHTML = `
      <header><b>💡 Simulator cahaya</b><button data-tutup title="Tutup">✕</button></header>
      <section>
        <h4>☀️ Matahari</h4>
        <label>Kota <select data-f="kota">${opt(Object.fromEntries(Object.entries(KOTA).map(([k, v]) => [k, v.n])), st.kota)}</select></label>
        <label>Depan rumah menghadap <output data-out="hadap"></output><input type="number" min="0" max="360" step="0.5" data-f="hadap" value="${st.hadap}" /></label>
        <label>Tanggal <input type="date" data-f="tgl" value="${st.tgl}" /></label>
        <label>Jam <output data-out="jam"></output><input type="range" min="5" max="22" step="0.25" data-f="jam" value="${st.jam}" /></label>
        <div class="chips">${[7, 10, 12, 15, 17.5, 18.25, 20].map((j) => `<button data-jam="${j}">${fmtJam(j)}</button>`).join('')}</div>
        <p class="muted" data-suninfo></p>
      </section>
      <section>
        <h4>💡 Lampu <label class="inline"><input type="checkbox" data-f="lampu" ${st.lampu ? 'checked' : ''}/> nyala</label></h4>
        ${kRow('kDalam', 'Downlight dalam')}
        ${kRow('kGantung', 'Lampu gantung')}
        ${kRow('kLuar', 'Lampu luar & taman')}
        <label>Efikasi LED <output data-out="lmw"></output><input type="range" min="50" max="150" step="5" data-f="lmw" value="${st.lmw}" /></label>
        <label>Jenis sorot downlight <select data-f="sorot">${opt(Object.fromEntries(Object.entries(SOROT).map(([k, v]) => [k, v[1]])), st.sorot)}</select></label>
        <p class="muted">2700K kuning hangat · 3000K warm white · 4000K natural · 6500K putih kebiruan. Daya tiap titik dari daftar lampu (5 W / 9 W).</p>
      </section>
      <section>
        <h4>🎨 Cat</h4>
        ${catRow('luar', 'Dinding luar & pagar')}
        ${catRow('dalam', 'Dinding dalam')}
        ${catRow('plafon', 'Plafon')}
        ${catRow('atap', 'Atap & list')}
        <label>Hasil akhir dinding <select data-f="finish">${opt({ doff: 'Doff / matt', satin: 'Satin / eggshell', gloss: 'Gloss' }, st.finish)}</select></label>
        <div class="swatches">${CAT.map(([h, n]) => `<button style="background:${h}" title="${n} ${h}" data-sw="${h}"></button>`).join('')}</div>
        <p class="muted">Klik kotak warna lalu klik contoh di atas, atau tempel kode hex dari situs merek cat. Warna contoh hanya perkiraan.</p>
      </section>
      <section>
        <h4>📷 Kamera</h4>
        <label class="inline"><input type="checkbox" data-f="auto" ${st.auto ? 'checked' : ''}/> Eksposur otomatis (seperti mata/kamera HP) <output data-ev></output></label>
        <label>Adaptasi warna <select data-f="wb">${opt(WB, st.wb)}</select></label>
        <label>Kompensasi <output data-out="komp"></output><input type="range" min="-3" max="3" step="0.25" data-f="komp" value="${st.komp}" /></label>
        <label>EV manual <output data-out="ev"></output><input type="range" min="2" max="16" step="0.25" data-f="ev" value="${st.ev}" /></label>
        <div class="row"><button class="btn" data-pt>📷 Render realistis</button><button class="btn ghost" data-link>🔗 Salin link</button><button class="btn ghost" data-reset>Reset</button></div>
        <p class="muted" data-status></p>
      </section>`;
    document.body.appendChild(root);
    const $ = (s) => root.querySelector(s), $$ = (s) => root.querySelectorAll(s);
    let catAktif = 'dalam';
    const tulisOut = () => {
      $('[data-out="jam"]').textContent = fmtJam(st.jam) + ' ' + ['WIB', 'WITA', 'WIT'][KOTA[st.kota].tz - 7];
      $('[data-out="hadap"]').textContent = `° dari utara (${kompas(+st.hadap)})`;
      $('[data-out="lmw"]').textContent = `${st.lmw} lm/W → 9 W ≈ ${9 * st.lmw} lm`;
      for (const k of ['kDalam', 'kGantung', 'kLuar']) $(`[data-out="${k}"]`).textContent = `${st[k]} K`;
      $('[data-out="komp"]').textContent = `${st.komp > 0 ? '+' : ''}${st.komp} EV`;
      $('[data-out="ev"]').textContent = st.auto ? '(otomatis)' : st.ev;
      $('[data-f="ev"]').disabled = st.auto; $('[data-f="komp"]').disabled = !st.auto;
      for (const k of Object.keys(st.cat)) { $(`[data-cat="${k}"]`).value = st.cat[k]; $(`[data-cathex="${k}"]`).value = st.cat[k]; }
      $$('[data-cat]').forEach((el) => el.parentElement.classList.toggle('sel', el.dataset.cat === catAktif));
    };
    root.addEventListener('input', (e) => {
      const el = e.target;
      if (el.dataset.f) st[el.dataset.f] = el.type === 'checkbox' ? el.checked : el.type === 'range' || el.type === 'number' ? +el.value : el.value;
      else if (el.dataset.k) st[el.dataset.k] = +el.value;
      else if (el.dataset.cat) { st.cat[el.dataset.cat] = el.value; catAktif = el.dataset.cat; }
      else if (el.dataset.cathex) { if (!/^#[0-9a-f]{6}$/i.test(el.value)) return; st.cat[el.dataset.cathex] = el.value.toLowerCase(); }
      tulisOut(); terapkan();
    });
    root.addEventListener('focusin', (e) => { const k = e.target.dataset.cat || e.target.dataset.cathex; if (k) { catAktif = k; tulisOut(); } });
    root.addEventListener('click', (e) => {
      const el = e.target.closest('button');
      if (!el) return;
      if (el.dataset.jam) { st.jam = +el.dataset.jam; $('[data-f="jam"]').value = st.jam; }
      else if (el.dataset.sw) st.cat[catAktif] = el.dataset.sw;
      else if (el.hasAttribute('data-tutup')) return aktifkan(false);
      else if (el.hasAttribute('data-pt')) return ptOn ? stopPt() : mulaiPt();
      else if (el.hasAttribute('data-link')) { tulisUrl(); navigator.clipboard?.writeText(location.href); status('Link setelan disalin.'); return; }
      else if (el.hasAttribute('data-reset')) { Object.assign(st, structuredClone(DEFAULT)); root.remove(); ui = null; buatPanel(); syncUi(); terapkan(); return; }
      else return;
      tulisOut(); terapkan();
    });
    root.addEventListener('keydown', (e) => e.stopPropagation()); // ketik di panel tidak menggerakkan pemain
    ui = { root, status: $('[data-status]'), pt: $('[data-pt]'), sunInfo: $('[data-suninfo]'), evVal: $('[data-ev]') };
    tulisOut();
  }
  buatPanel();
  document.querySelectorAll('[data-cahaya]').forEach((b) => b.addEventListener('click', () => aktifkan(!aktif)));

  return {
    render,
    get aktif() { return aktif; },
    toggle: () => aktifkan(!aktif),
    /** model SKP termuat → cat bisa dipisah & diterapkan; aktifkan otomatis kalau link berisi setelan cahaya */
    onGlb() { if (aktif) terapkan(); else if (bacaUrl()) aktifkan(true); },
  };
}
const fmtJam = (j) => `${String(Math.floor(j)).padStart(2, '0')}.${String(Math.round((j % 1) * 60)).padStart(2, '0')}`;
