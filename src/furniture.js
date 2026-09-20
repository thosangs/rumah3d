// Furnitur & aksesori interior mengikuti render konsep DED (hal. 21–40):
//  - R. keluarga: TV wall panel krem + LED, konsol walnut melayang, sofa L abu, meja bundar hitam, kursi krem, tanaman, lampu ring
//  - R. makan: meja marmer hitam + kaki besi, 4 kursi beige, lemari bawah tangga krem + niche walnut, lampu molekul
//  - Tangga & void: railing besi hitam motif oval
//  - KT1: headboard beige bantalan, nakas melayang putih, meja kerja; KT2: ranjang gelap + panel slat walnut + LED, lemari cermin;
//    KT utama: headboard panel walnut, lemari lengkung, meja rias cermin bundar; R. keluarga lt2: meja kerja, kursi kantor, sideboard
//  - Gorden abu tua + vitrase, downlight plafon
import * as THREE from 'three';
import { LEVELS } from './data.js';

const std = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o });
export const FM = {
  fabricGrey: std(0x6e6a67, { roughness: 1 }),
  fabricGrey2: std(0x7d7975, { roughness: 1 }),
  fabricCream: std(0xd9cebc, { roughness: 1 }),
  fabricBeige: std(0xc9b79d, { roughness: 1 }),
  fabricDark: std(0x3b3835, { roughness: 1 }),
  fabricTaupe: std(0x9a8f82, { roughness: 1 }),
  white: std(0xf5f3ee, { roughness: 0.4 }),
  cream: std(0xeae3d5, { roughness: 0.6 }),
  creamPanel: std(0xefe8db, { roughness: 0.55 }),
  walnut: std(0x6b4a2f, { roughness: 0.55 }),
  walnutDark: std(0x54392a, { roughness: 0.6 }),
  black: std(0x17181a, { roughness: 0.45, metalness: 0.5 }),
  blackMatte: std(0x1e1f21, { roughness: 0.8 }),
  darkMarble: std(0x2a2c30, { roughness: 0.2, metalness: 0.05 }),
  brass: std(0xb8925a, { roughness: 0.3, metalness: 0.85 }),
  led: new THREE.MeshStandardMaterial({ color: 0xffe2b0, emissive: 0xffc772, emissiveIntensity: 2.2, roughness: 1 }),
  bulb: new THREE.MeshStandardMaterial({ color: 0xfff6e6, emissive: 0xffe9c4, emissiveIntensity: 3, roughness: 1 }),
  downlight: new THREE.MeshStandardMaterial({ color: 0xfff4e0, emissive: 0xfff0d0, emissiveIntensity: 4, roughness: 1 }),
  screen: new THREE.MeshStandardMaterial({ color: 0x0a0b0d, emissive: 0x141a24, emissiveIntensity: 0.6, roughness: 0.15, metalness: 0.3 }),
  rug: std(0x8d8783, { roughness: 1 }),
  rug2: std(0xb5ada2, { roughness: 1 }),
  green: std(0x3d6b38, { roughness: 0.9 }),
  green2: std(0x5b8a4a, { roughness: 0.9 }),
  pot: std(0x77746f, { roughness: 0.9 }),
  potWhite: std(0xf0ede8, { roughness: 0.6 }),
  curtain: std(0x55575b, { roughness: 1, side: THREE.DoubleSide }),
  curtainCream: std(0xc9bfae, { roughness: 1, side: THREE.DoubleSide }),
  sheer: new THREE.MeshStandardMaterial({ color: 0xf1ebe0, roughness: 1, transparent: true, opacity: 0.45, side: THREE.DoubleSide }),
  mirror: new THREE.MeshStandardMaterial({ color: 0xdfe6ec, roughness: 0.05, metalness: 1 }),
  pillow: std(0xf7f5f0, { roughness: 1 }),
  pillowDark: std(0x4a4340, { roughness: 1 }),
  stripe: null, // diisi di bawah (selimut garis)
};
// selimut garis hitam-putih (KT1) — tekstur canvas
{
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 8; const c = cv.getContext('2d');
  for (let i = 0; i < 64; i += 8) { c.fillStyle = i % 16 ? '#f2f0ea' : '#2a2a2c'; c.fillRect(i, 0, 8, 8); }
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(6, 1); t.colorSpace = THREE.SRGBColorSpace;
  FM.stripe = new THREE.MeshStandardMaterial({ map: t, roughness: 1 });
}
// slat walnut (panel kisi) — tekstur canvas garis vertikal
{
  const cv = document.createElement('canvas'); cv.width = 64; cv.height = 8; const c = cv.getContext('2d');
  c.fillStyle = '#6b4a2f'; c.fillRect(0, 0, 64, 8); c.fillStyle = '#2f2017'; for (let i = 0; i < 64; i += 8) c.fillRect(i, 0, 2, 8);
  const t = new THREE.CanvasTexture(cv); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.colorSpace = THREE.SRGBColorSpace;
  FM.slat = new THREE.MeshStandardMaterial({ map: t, roughness: 0.6 });
  FM.slatTex = t;
}

function mesh(geo, mat, x = 0, y = 0, z = 0, ry = 0) {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z); m.rotation.y = ry;
  m.castShadow = m.receiveShadow = true;
  return m;
}
const B = (w, h, d, mat, x, y, z, ry) => mesh(new THREE.BoxGeometry(w, h, d), mat, x, y, z, ry);
const CYL = (rt, rb, h, mat, x, y, z, seg = 24) => mesh(new THREE.CylinderGeometry(rt, rb, h, seg), mat, x, y, z);
function G(x, y, z, ry = 0) { const g = new THREE.Group(); g.position.set(x, y, z); g.rotation.y = ry; return g; }
function slatMat(w) { const m = FM.slat.clone(); m.map = FM.slatTex.clone(); m.map.needsUpdate = true; m.map.repeat.set(w / 0.16, 1); return m; }

// ---------------------------------------------------------------------------
// Elemen
// ---------------------------------------------------------------------------
/** Sofa L abu: badan sepanjang sumbu x lokal, sandaran di −z, chaise di ujung +x menjorok ke +z */
export function sofaL(len = 2.6, depth = 0.95, chaise = 1.6) {
  const g = new THREE.Group();
  const h = 0.42;
  g.add(B(len, 0.16, depth, FM.fabricGrey, 0, 0.26, 0)); // rangka bawah
  for (let i = 0; i < 3; i++) g.add(B(len / 3 - 0.03, 0.14, depth - 0.25, FM.fabricGrey2, -len / 2 + len / 6 + i * (len / 3), 0.41, 0.1)); // bantal duduk
  g.add(B(len, 0.5, 0.22, FM.fabricGrey, 0, 0.6, -depth / 2 + 0.11)); // sandaran
  for (let i = 0; i < 3; i++) g.add(B(len / 3 - 0.06, 0.34, 0.14, FM.fabricGrey2, -len / 2 + len / 6 + i * (len / 3), 0.62, -depth / 2 + 0.28)); // bantal sandaran
  g.add(B(0.2, 0.5, depth, FM.fabricGrey, -len / 2 + 0.1, 0.55, 0)); // lengan kiri
  // chaise: perpanjangan di ujung kanan ke arah +z
  g.add(B(0.9, 0.16, chaise - depth, FM.fabricGrey, len / 2 - 0.45, 0.26, depth / 2 + (chaise - depth) / 2));
  g.add(B(0.85, 0.14, chaise - depth - 0.05, FM.fabricGrey2, len / 2 - 0.45, 0.41, depth / 2 + (chaise - depth) / 2 + 0.02));
  g.add(B(0.2, 0.5, chaise, FM.fabricGrey, len / 2 - 0.1, 0.55, (chaise - depth) / 2)); // lengan kanan memanjang
  for (const [x, z] of [[-len / 2 + 0.15, -depth / 2 + 0.12], [len / 2 - 0.15, -depth / 2 + 0.12], [-len / 2 + 0.15, depth / 2 - 0.12], [len / 2 - 0.15, chaise - depth / 2 - 0.12]]) g.add(CYL(0.02, 0.015, 0.18, FM.black, x, 0.09, z, 8));
  return g;
}
export function armchair() {
  const g = new THREE.Group();
  g.add(CYL(0.4, 0.38, 0.32, FM.fabricCream, 0, 0.32, 0, 28)); // dudukan
  // sandaran melengkung: busur 270°, terbuka di +z (depan)
  const back = mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.42, 28, 1, true, Math.PI * 0.25, Math.PI * 1.5), FM.fabricCream, 0, 0.66, 0);
  back.material = FM.fabricCream.clone(); back.material.side = THREE.DoubleSide; g.add(back);
  const arc = []; for (let i = 0; i <= 28; i++) { const t = Math.PI * 0.25 + (i / 28) * Math.PI * 1.5; arc.push(new THREE.Vector3(Math.sin(t) * 0.4, 0, Math.cos(t) * 0.4)); }
  g.add(mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(arc), 28, 0.06, 10, false), FM.fabricCream, 0, 0.86, 0));
  g.add(CYL(0.36, 0.36, 0.08, FM.fabricBeige, 0, 0.5, 0.02, 28));
  g.add(CYL(0.2, 0.25, 0.16, FM.black, 0, 0.08, 0, 16));
  return g;
}
export function roundTable(r = 0.45, h = 0.42, mat = FM.blackMatte) {
  const g = new THREE.Group();
  g.add(CYL(r, r, 0.04, mat, 0, h - 0.02, 0, 40));
  g.add(CYL(0.06, r * 0.55, h - 0.04, mat, 0, (h - 0.04) / 2, 0, 32));
  return g;
}
export function plant(h = 1.8, potR = 0.28, potMat = FM.pot) {
  const g = new THREE.Group();
  g.add(CYL(potR, potR * 0.85, potR * 1.9, potMat, 0, potR * 0.95, 0, 24));
  g.add(CYL(0.02, 0.03, h - potR * 1.9, FM.walnutDark, 0, potR * 1.9 + (h - potR * 1.9) / 2, 0, 8));
  const seed = h * 7 + potR;
  let s = seed;
  const rnd = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const n = Math.round(h * 16);
  for (let i = 0; i < n; i++) {
    const t = 0.45 + 0.55 * (i / n);
    const y = potR * 1.9 + (h - potR * 1.9) * t;
    const a = rnd() * Math.PI * 2, r = 0.05 + rnd() * 0.22 * (0.6 + t); // daun rapat di sekitar batang
    const leaf = mesh(new THREE.IcosahedronGeometry(0.07 + rnd() * 0.08, 0), rnd() < 0.5 ? FM.green : FM.green2, Math.cos(a) * r, y, Math.sin(a) * r);
    leaf.rotation.set(rnd() * 3, rnd() * 3, rnd() * 3); leaf.scale.set(1.8, 0.4, 1.1);
    g.add(leaf);
  }
  return g;
}
/** Panel TV: bidang lokal menghadap +z (dipasang menempel tembok di belakangnya) */
export function tvWall(w = 3.0, h = 2.7) {
  const g = new THREE.Group();
  const t = 0.06;
  g.add(B(w * 0.62, h - 0.3, t, FM.creamPanel, -w * 0.05, 0.15 + (h - 0.3) / 2, 0.04)); // panel krem utama
  g.add(B(w * 0.2, h - 0.9, t, FM.fabricTaupe, -w * 0.4, 0.5 + (h - 0.9) / 2, 0.02)); // panel abu-taupe kiri
  g.add(B(w * 0.14, h - 1.4, t, FM.fabricTaupe, w * 0.36, 0.9 + (h - 1.4) / 2, 0.02));
  // LED backlight di tepi panel (bidang emissive tipis di belakang)
  g.add(B(w * 0.66, h - 0.24, 0.01, FM.led, -w * 0.05, 0.12 + (h - 0.24) / 2, 0.005));
  g.add(B(w * 0.24, h - 0.84, 0.01, FM.led, -w * 0.4, 0.47 + (h - 0.84) / 2, -0.005));
  // TV
  g.add(B(1.45, 0.82, 0.04, FM.screen, -w * 0.05, 1.45, 0.09));
  g.add(B(1.49, 0.86, 0.03, FM.black, -w * 0.05, 1.45, 0.075));
  // rak ambalan hitam tipis + konsol walnut melayang
  g.add(B(w * 0.5, 0.03, 0.18, FM.black, -w * 0.15, 0.95, 0.16));
  g.add(B(w * 0.8, 0.28, 0.42, FM.walnut, -w * 0.02, 0.5, 0.28));
  g.add(B(w * 0.8, 0.01, 0.42, FM.led, -w * 0.02, 0.355, 0.28)); // LED bawah konsol
  g.add(CYL(0.07, 0.05, 0.16, FM.blackMatte, w * 0.25, 0.72, 0.28, 16)); // vas
  return g;
}
export function diningSet(len = 1.6, wid = 0.8) {
  const g = new THREE.Group();
  g.add(B(len, 0.035, wid, FM.darkMarble, 0, 0.74, 0));
  for (const sx of [-1, 1]) {
    g.add(B(0.05, 0.72, wid - 0.1, FM.black, sx * (len / 2 - 0.08), 0.36, 0).rotateY(0)); // kaki rangka
    g.add(B(0.05, 0.05, wid - 0.1, FM.black, sx * (len / 2 - 0.08), 0.025, 0));
  }
  g.add(B(len - 0.16, 0.05, 0.05, FM.black, 0, 0.71, 0));
  const chair = (x, z, ry) => {
    const c = G(x, 0, z, ry);
    c.add(B(0.44, 0.06, 0.44, FM.fabricBeige, 0, 0.46, 0));
    c.add(B(0.42, 0.42, 0.06, FM.fabricBeige, 0, 0.7, -0.19));
    for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) c.add(CYL(0.012, 0.012, 0.44, FM.black, lx, 0.22, lz, 6));
    return c;
  };
  g.add(chair(-len / 4, wid / 2 + 0.3, Math.PI), chair(len / 4, wid / 2 + 0.3, Math.PI), chair(-len / 4, -wid / 2 - 0.3, 0), chair(len / 4, -wid / 2 - 0.3, 0));
  g.add(CYL(0.04, 0.03, 0.22, FM.white, 0, 0.87, 0, 12)); // vas bunga
  return g;
}
/** Tempat tidur: headboard di −z (menempel tembok), kasur memanjang ke +z */
export function bed(w = 1.6, l = 2.0, style = 'beige') {
  const g = new THREE.Group();
  const frameMat = style === 'dark' ? FM.fabricDark : style === 'walnut' ? FM.walnut : FM.fabricBeige;
  const blanket = style === 'dark' ? FM.fabricDark : style === 'walnut' ? FM.fabricTaupe : FM.stripe;
  g.add(B(w + 0.1, 0.25, l + 0.05, frameMat, 0, 0.125, l / 2)); // dipan
  g.add(B(w, 0.22, l - 0.05, FM.pillow, 0, 0.36, l / 2)); // kasur
  g.add(B(w + 0.02, 0.06, l * 0.62, blanket, 0, 0.5, l * 0.66)); // selimut
  g.add(B(w + 0.02, 0.12, 0.06, blanket, 0, 0.44, l * 0.66 + l * 0.31)); // selimut jatuh di ujung
  for (const sx of [-1, 1]) {
    const p = B(w * 0.42, 0.14, 0.45, FM.pillow, sx * w * 0.24, 0.53, 0.35); p.rotation.x = -0.25; g.add(p);
    if (style === 'beige') { const p2 = B(w * 0.36, 0.12, 0.3, FM.pillowDark, sx * w * 0.24, 0.58, 0.5); p2.rotation.x = -0.35; g.add(p2); }
  }
  // headboard
  if (style === 'beige') {
    const hb = w + 0.3;
    for (let i = 0; i < 6; i++) g.add(B(hb / 6 - 0.02, 1.15, 0.08, FM.fabricBeige, -hb / 2 + hb / 12 + i * (hb / 6), 0.6 + 0.575, -0.04));
  } else if (style === 'dark') {
    g.add(B(w + 0.4, 0.5, 0.06, FM.fabricDark, 0, 0.5, -0.03)); // headboard kain gelap rendah
    const s = B(w + 0.6, 0.9, 0.05, slatMat(w + 0.6), 0, 1.55, -0.03); g.add(s); // panel slat walnut di atas
    g.add(B(w + 0.6, 0.02, 0.06, FM.led, 0, 1.09, -0.02)); // LED bawah panel
    g.add(B(w + 0.6, 0.02, 0.06, FM.led, 0, 2.01, -0.02));
  } else {
    const hw = w + 0.6;
    for (let i = 0; i < 3; i++) g.add(B(hw / 3 - 0.02, 1.2, 0.06, i === 1 ? FM.walnutDark : FM.walnut, -hw / 2 + hw / 6 + i * (hw / 3), 0.6 + 0.4, -0.03));
    for (let i = 0; i < 4; i++) g.add(B(hw / 4 - 0.02, 0.9, 0.06, i % 2 ? FM.cream : FM.creamPanel, -hw / 2 + hw / 8 + i * (hw / 4), 1.65, -0.03)); // panel krem atas
  }
  return g;
}
export function sideTable(w = 0.45, floating = false, mat = FM.white) {
  const g = new THREE.Group();
  g.add(B(w, 0.18, 0.4, mat, 0, floating ? 0.45 : 0.4, 0));
  if (!floating) g.add(B(w - 0.04, 0.3, 0.36, mat, 0, 0.15, 0));
  g.add(B(w - 0.06, 0.012, 0.3, FM.blackMatte, 0, floating ? 0.55 : 0.5, 0)); // garis laci
  return g;
}
export function wardrobe(w = 1.6, h = 2.4, d = 0.6, mat = FM.cream, doors = 3, mirror = false, curved = false) {
  const g = new THREE.Group();
  g.add(B(w, h, d, mat, 0, h / 2, 0));
  for (let i = 1; i < doors; i++) g.add(B(0.012, h - 0.1, 0.01, FM.blackMatte, -w / 2 + i * (w / doors), h / 2, d / 2 + 0.003));
  if (mirror) g.add(B(w / doors - 0.08, h - 0.4, 0.01, FM.mirror, -w / 2 + w / doors / 2, h / 2, d / 2 + 0.006));
  if (curved) g.add(CYL(d / 2, d / 2, h, FM.walnut, w / 2, h / 2, 0, 24)); // sisi lengkung walnut
  for (let i = 0; i < doors; i++) g.add(B(0.02, 0.28, 0.02, FM.blackMatte, -w / 2 + (i + 0.5) * (w / doors) + 0.1, h * 0.45, d / 2 + 0.015)); // handle
  return g;
}
export function shelfUnit(w = 1.2, h = 2.2, d = 0.35) {
  const g = new THREE.Group();
  g.add(B(w, h * 0.35, d, FM.cream, 0, h * 0.175, 0)); // kabinet bawah
  const cols = 3, rows = 4, ch = (h * 0.65) / rows, cw = w / cols;
  for (let r = 0; r <= rows; r++) g.add(B(w, 0.025, d, FM.fabricTaupe, 0, h * 0.35 + r * ch, 0));
  for (let c = 0; c <= cols; c++) g.add(B(0.025, h * 0.65, d, FM.fabricTaupe, -w / 2 + c * cw, h * 0.35 + h * 0.325, 0));
  g.add(B(w, h * 0.65, 0.02, FM.fabricTaupe, 0, h * 0.35 + h * 0.325, -d / 2 + 0.01));
  return g;
}
export function desk(w = 1.2, d = 0.55, topMat = FM.white, frame = FM.black) {
  const g = new THREE.Group();
  g.add(B(w, 0.04, d, topMat, 0, 0.74, 0));
  for (const sx of [-1, 1]) { g.add(B(0.04, 0.72, d - 0.08, frame, sx * (w / 2 - 0.04), 0.36, 0)); }
  g.add(CYL(0.08, 0.08, 0.02, FM.blackMatte, w * 0.25, 0.77, -0.1, 16)); // lampu meja alas
  g.add(CYL(0.008, 0.008, 0.35, FM.blackMatte, w * 0.25, 0.95, -0.1, 6));
  g.add(B(0.4, 0.26, 0.02, FM.black, -w * 0.1, 0.98, -0.12)); // laptop/monitor
  return g;
}
export function chair(mat = FM.fabricCream) {
  const c = new THREE.Group();
  c.add(B(0.44, 0.06, 0.44, mat, 0, 0.46, 0));
  c.add(B(0.42, 0.42, 0.06, mat, 0, 0.7, -0.19));
  for (const [lx, lz] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) c.add(CYL(0.012, 0.012, 0.44, FM.black, lx, 0.22, lz, 6));
  return c;
}
export function officeChair() {
  const c = new THREE.Group();
  c.add(B(0.48, 0.08, 0.48, FM.blackMatte, 0, 0.5, 0));
  c.add(B(0.46, 0.6, 0.07, FM.blackMatte, 0, 0.84, -0.22));
  c.add(CYL(0.025, 0.025, 0.42, FM.black, 0, 0.25, 0, 8));
  for (let i = 0; i < 5; i++) c.add(B(0.3, 0.02, 0.03, FM.black, Math.cos(i * 1.2566) * 0.15, 0.03, Math.sin(i * 1.2566) * 0.15, -i * 1.2566));
  for (const sx of [-1, 1]) c.add(B(0.04, 0.02, 0.3, FM.black, sx * 0.26, 0.72, -0.02));
  return c;
}
export function sideboard(w = 1.6, h = 0.8, d = 0.45) {
  const g = new THREE.Group();
  g.add(B(w * 0.55, h, d, FM.walnut, -w * 0.225, h / 2, 0));
  g.add(B(w * 0.45, h, d, FM.cream, w * 0.275, h / 2, 0));
  g.add(CYL(d / 2, d / 2, h, FM.cream, w / 2, h / 2, 0, 24));
  for (let i = 1; i < 3; i++) g.add(B(w * 0.5, 0.01, 0.005, FM.blackMatte, -w * 0.225, (h / 3) * i, d / 2 + 0.003));
  return g;
}
export function rug(w, d, mat = FM.rug) { return B(w, 0.012, d, mat, 0, 0.006, 0); }
/** Gorden abu tua + vitrase, lebar w, tinggi h, bidang di sumbu x lokal, tembok di −z */
export function curtain(w, h, mat = FM.curtain) {
  const g = new THREE.Group();
  const geo = new THREE.PlaneGeometry(w, h, Math.round(w * 24), 1);
  const p = geo.attributes.position;
  for (let i = 0; i < p.count; i++) p.setZ(i, Math.sin(p.getX(i) * 22) * 0.05);
  geo.computeVertexNormals();
  const m = mesh(geo, mat, 0, h / 2, 0.09); m.castShadow = false; g.add(m);
  const sheerGeo = new THREE.PlaneGeometry(w, h, Math.round(w * 24), 1);
  const sp = sheerGeo.attributes.position;
  for (let i = 0; i < sp.count; i++) sp.setZ(i, Math.cos(sp.getX(i) * 30) * 0.03);
  const s = mesh(sheerGeo, FM.sheer, 0, h / 2, 0.03); s.castShadow = false; g.add(s);
  g.add(B(w + 0.1, 0.06, 0.16, FM.blackMatte, 0, h + 0.02, 0.06)); // rel
  return g;
}
export function ringPendant(drop = 0.9) {
  const g = new THREE.Group(); // titik nol = plafon
  g.add(CYL(0.06, 0.06, 0.03, FM.blackMatte, 0, -0.015, 0, 16));
  const rings = [[0.45, -drop], [0.33, -drop + 0.28], [0.22, -drop + 0.5]];
  for (const [r, y] of rings) {
    const t = mesh(new THREE.TorusGeometry(r, 0.015, 8, 48), FM.brass, 0, y, 0); t.rotation.x = Math.PI / 2 + 0.15; g.add(t);
    const l = mesh(new THREE.TorusGeometry(r, 0.008, 6, 48), FM.bulb, 0, y - 0.01, 0); l.rotation.x = Math.PI / 2 + 0.15; g.add(l);
    g.add(CYL(0.003, 0.003, -y, FM.blackMatte, r * 0.7, y / 2, 0, 4));
  }
  return g;
}
export function moleculePendant(drop = 1.1) {
  const g = new THREE.Group();
  g.add(CYL(0.05, 0.05, 0.03, FM.brass, 0, -0.015, 0, 16));
  g.add(CYL(0.006, 0.006, drop, FM.brass, 0, -drop / 2, 0, 6));
  const bar = B(1.1, 0.02, 0.02, FM.brass, 0, -drop, 0); g.add(bar);
  for (let i = 0; i < 6; i++) {
    const x = -0.5 + i * 0.2, y = -drop + (i % 2 ? 0.16 : -0.16);
    g.add(CYL(0.006, 0.006, 0.16, FM.brass, x, -drop + (i % 2 ? 0.08 : -0.08), 0, 6));
    g.add(mesh(new THREE.SphereGeometry(0.06, 16, 12), FM.bulb, x, y, 0));
  }
  return g;
}
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
  // oval: tabung mengikuti elips 0.14 × 0.7
  const curve = new THREE.EllipseCurve(0, 0, 0.07, 0.36, 0, Math.PI * 2, false, 0);
  const pts = curve.getPoints(28).map((p) => new THREE.Vector3(p.x, p.y, 0));
  const ovalGeo = new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts, true), 28, 0.008, 6, true);
  const n = Math.floor(len / 0.2);
  for (let i = 0; i < n; i++) {
    const x = 0.1 + i * 0.2 + (len - n * 0.2) / 2;
    const o = mesh(ovalGeo, FM.black, x, x * slope + h * 0.52, 0);
    g.add(o);
  }
  return g;
}
/** Lemari bawah tangga: kotak-kotak krem mengikuti bawah anak tangga, plus niche walnut terbuka */
export function underStairCabinet(from, to, hAt, depth = 0.98, nicheAt = [6.5, 7.6]) {
  const g = new THREE.Group(); // koordinat dunia z (denah y), x tetap
  const step = 0.3;
  for (let z = from; z < to - 1e-6; z += step) {
    const z2 = Math.min(z + step, to);
    const hh = Math.max(0.1, hAt(z2) - 0.1);
    const inNiche = z >= nicheAt[0] - 1e-6 && z2 <= nicheAt[1] + 1e-6;
    if (inNiche) {
      g.add(B(depth, 1.1, z2 - z, FM.cream, 0, 0.55, (z + z2) / 2)); // kabinet bawah niche
      g.add(B(depth, hh - 2.0, z2 - z, FM.cream, 0, 2.0 + (hh - 2.0) / 2, (z + z2) / 2)); // atas niche
      g.add(B(depth - 0.04, 0.9, z2 - z, FM.walnut, -0.02, 1.55, (z + z2) / 2)); // dinding niche walnut
      g.add(B(0.4, 0.86, z2 - z - 0.02, FM.walnutDark, -depth / 2 + 0.2, 1.55, (z + z2) / 2)); // rongga (lebih gelap)
      g.add(B(0.02, 0.86, 0.02, FM.led, -depth / 2 + 0.41, 1.55, (z + z2) / 2));
    } else g.add(B(depth, hh, z2 - z, FM.cream, 0, hh / 2, (z + z2) / 2));
    g.add(B(0.006, Math.min(hh, 2.3) - 0.06, 0.008, FM.blackMatte, -depth / 2 - 0.003, Math.min(hh, 2.3) / 2, z2 - 0.004)); // garis pintu
  }
  g.add(B(0.03, 0.9, 0.03, FM.brass, -depth / 2 + 0.2, 1.55, (nicheAt[0] + nicheAt[1]) / 2)); // ambalan tengah niche
  g.add(B(depth - 0.1, 0.02, nicheAt[1] - nicheAt[0] - 0.05, FM.walnut, -0.02, 1.55, (nicheAt[0] + nicheAt[1]) / 2));
  return g;
}
export function decorVase(h = 0.3, mat = FM.blackMatte) { return CYL(0.05, 0.08, h, mat, 0, h / 2, 0, 16); }

// ---------------------------------------------------------------------------
// Penempatan sesuai denah (x = sumbu x denah, z = sumbu y denah)
// ---------------------------------------------------------------------------
export function buildFurniture(stairHeightAt) {
  const lt1 = new THREE.Group(); lt1.name = 'furnitur-lt1';
  const lt2 = new THREE.Group(); lt2.name = 'furnitur-lt2';
  const put = (grp, obj, x, z, ry = 0, y = 0) => { obj.position.set(x, y, z); obj.rotation.y = ry; grp.add(obj); return obj; };
  const CEIL1_FRONT = 3.1; // plafon zona depan lt1 (model: +3,15) — relatif lantai
  const CEIL1_BACK = 3.55; // bawah dak
  const y2 = 0; // grup lt1/lt2 sudah diposisikan di elevasi lantainya masing-masing

  // Ukuran ranjang: KT1 single 120×200, KT2 queen 160×200, KT utama king 180×200. Kamar 3,35 × 3,35 m → furnitur dibuat
  // seperlunya (ranjang + 1 nakas + lemari ≤ 1,2 m + 1 meja) supaya ada ruang jalan ≥ 60 cm.

  // ---- Ruang keluarga lt1 (x 6.575–9.925, z 8.425–13.425) ----
  put(lt1, tvWall(3.0, 3.0), 6.575 + 0.03, 10.9, Math.PI / 2); // menempel tembok KT1, menghadap +x
  put(lt1, sofaL(2.6, 0.95, 1.7), 9.4, 10.6, -Math.PI / 2); // sandaran ke tembok kanan (x=10), chaise di ujung depan menjorok ke ruang
  put(lt1, roundTable(0.42, 0.42), 7.95, 10.45);
  put(lt1, roundTable(0.28, 0.5), 7.7, 11.45);
  put(lt1, armchair(), 8.3, 12.8, Math.PI + 0.5); // di depan jendela depan, menghadap sofa/TV
  put(lt1, plant(1.9, 0.3), 9.55, 8.85);
  put(lt1, plant(1.3, 0.22), 7.05, 8.8);
  put(lt1, curtain(1.9, 2.95), 9.9, 9.75, -Math.PI / 2); // jendela kanan belakang (z 9–10.5)
  put(lt1, curtain(1.9, 2.95), 9.9, 11.75, -Math.PI / 2); // jendela kanan depan (z 11–12.5)
  put(lt1, curtain(2.0, 2.95), 9.1, 13.38, Math.PI); // jendela depan (x 8.3–10)
  put(lt1, ringPendant(0.65), 8.3, 10.9, 0, CEIL1_FRONT);
  for (const [x, z] of [[7.2, 9.3], [9.3, 9.3], [7.2, 12.6], [9.3, 12.6]]) put(lt1, downlight(), x, z, 0, CEIL1_FRONT);

  // ---- Ruang makan (x 6.5–8.3, z 4.6–7.0) + lemari bawah tangga ----
  put(lt1, diningSet(1.5, 0.8), 7.3, 6.0, Math.PI / 2); // meja memanjang searah tangga
  put(lt1, moleculePendant(1.2), 7.3, 6.0, Math.PI / 2, CEIL1_BACK);
  put(lt1, underStairCabinet(5.0, 9.0, (z) => stairHeightAt(z) - LEVELS.lt1, 0.98, [6.5, 7.6]), 9.4, 0); // x 8.91–9.89
  put(lt1, plant(1.6, 0.28), 8.0, 3.9);
  put(lt1, downlight(), 7.3, 4.6, 0, CEIL1_BACK); put(lt1, downlight(), 4.2, 5.2, 0, CEIL1_BACK); put(lt1, downlight(), 7.2, 7.7, 0, CEIL1_BACK);
  // railing tangga: sisi terbuka run (x 8.88, z 4.56→9.06, naik 0,2/0,3) + bordes winder (z 3.575–4.56 di x 8.28)
  put(lt1, railingOval(9.06 - 4.56, 1.0, 0.2 / 0.3), 8.86, 4.56, -Math.PI / 2, 0.6); // lokal +x → +z dunia, mulai dari bordes +0,6
  put(lt1, railingOval(0.9, 1.0, 0), 8.28, 3.62, -Math.PI / 2, 0); // pengaman winder sisi dapur (x 8.28)

  // ---- KT1 (x 3.075–6.425, z 8.575–11.925) — single 120×200, headboard di tembok belakang ----
  put(lt1, bed(1.2, 2.0, 'beige'), 3.85, 8.62, 0);
  put(lt1, sideTable(0.4, true), 4.9, 8.85);
  put(lt1, desk(1.1, 0.5), 4.75, 11.6, Math.PI); // di bawah jendela depan
  put(lt1, chair(FM.fabricCream), 4.75, 11.05, 0);
  put(lt1, wardrobe(1.2, 2.4, 0.55, FM.cream, 2, false), 6.13, 10.5, -Math.PI / 2); // tembok kanan
  put(lt1, curtain(1.7, 2.95, FM.curtainCream), 3.17, 10.75, Math.PI / 2); // jendela kiri z 10–11.5
  put(lt1, downlight(), 4.0, 9.6, 0, CEIL1_FRONT); put(lt1, downlight(), 5.5, 11.2, 0, CEIL1_FRONT);

  // ---- Lantai 2: r. keluarga / kerja (x 6.575–9.925, z 9.06–13.425) ----
  put(lt2, desk(1.4, 0.6, FM.walnut), 8.6, 12.55, Math.PI, y2);
  put(lt2, officeChair(), 8.6, 11.85, 0, y2);
  put(lt2, sideboard(1.6, 0.8, 0.45), 9.65, 10.9, -Math.PI / 2, y2);
  put(lt2, plant(1.7, 0.26, FM.potWhite), 6.95, 9.7, 0, y2);
  put(lt2, plant(1.4, 0.24, FM.potWhite), 9.6, 12.95, 0, y2);
  put(lt2, curtain(2.0, 2.9), 9.1, 13.38, Math.PI, y2);
  put(lt2, curtain(2.0, 2.9), 9.9, 11.4, -Math.PI / 2, y2);
  for (const [x, z] of [[7.3, 10.0], [9.2, 10.0], [7.3, 12.6], [9.2, 12.6], [7.5, 4.6], [7.5, 7.5]]) put(lt2, downlight(), x, z, 0, y2 + 3.3);
  // railing void (x 8.43, z 3.575–9.06) + ujung tangga tiba (z 9.06, x 8.43–8.88)
  put(lt2, railingOval(9.06 - 3.575, 1.0, 0), 8.43, 3.575, -Math.PI / 2, y2);
  put(lt2, railingOval(0.45, 1.0, 0), 8.43, 9.06, 0, y2);

  // ---- KT2 (x 3.075–6.425, z 3.575–6.925) — queen 160×200, ranjang gelap, headboard di tembok toilet (z 6.925) ----
  put(lt2, bed(1.6, 2.0, 'dark'), 4.3, 6.88, Math.PI, y2); // headboard di −z lokal → menghadap tembok z=6.925
  put(lt2, sideTable(0.4, false, FM.white), 5.4, 6.65, 0, y2);
  put(lt2, desk(1.0, 0.5, FM.white), 3.4, 4.4, Math.PI / 2, y2); // tembok kiri
  put(lt2, officeChair(), 3.95, 4.4, -Math.PI / 2, y2);
  put(lt2, B(0.9, 1.3, 0.03, FM.black, 0, 0, 0), 3.12, 4.4, Math.PI / 2, y2 + 1.75); // rak ambalan hitam di atas meja
  for (let i = 0; i < 3; i++) put(lt2, B(0.8, 0.02, 0.22, FM.walnut, 0, 0, 0), 3.22, 4.4, Math.PI / 2, y2 + 1.35 + i * 0.35);
  put(lt2, wardrobe(1.2, 2.4, 0.55, FM.cream, 2, true), 5.8, 3.87, 0, y2); // tembok belakang, samping jendela
  put(lt2, curtain(1.2, 2.9, FM.curtainCream), 4.55, 3.66, 0, y2); // jendela belakang x 4–5.2
  put(lt2, downlight(), 4.4, 5.6, 0, y2 + 3.3); put(lt2, downlight(), 5.6, 4.3, 0, y2 + 3.3);

  // ---- KT utama (x 3.075–6.425, z 8.575–11.925) — king 180×200, headboard walnut di tembok kanan (x 6.425) ----
  put(lt2, bed(1.8, 2.0, 'walnut'), 6.38, 10.65, -Math.PI / 2, y2); // headboard −z lokal → +x dunia; bebas dari ayunan pintu (z 8.7–9.6)
  put(lt2, wardrobe(1.3, 2.4, 0.55, FM.creamPanel, 3, false, true), 4.6, 8.86, 0, y2); // tembok belakang, antara pintu toilet & pintu kamar
  put(lt2, desk(1.0, 0.45, FM.cream, FM.walnut), 3.32, 10.7, Math.PI / 2, y2); // meja rias tembok kiri
  put(lt2, chair(FM.fabricCream), 3.88, 10.7, -Math.PI / 2, y2);
  const mirror = mesh(new THREE.CylinderGeometry(0.38, 0.38, 0.02, 40), FM.mirror, 3.13, y2 + 1.55, 10.7); mirror.rotation.z = Math.PI / 2; lt2.add(mirror);
  const mirrorRim = mesh(new THREE.TorusGeometry(0.39, 0.02, 8, 40), FM.walnut, 3.12, y2 + 1.55, 10.7); mirrorRim.rotation.y = Math.PI / 2; lt2.add(mirrorRim);
  put(lt2, B(1.0, 2.6, 0.04, slatMat(1.0), 0, 0, 0), 3.11, 10.7, Math.PI / 2, 1.3); // panel slat walnut di belakang meja rias
  put(lt2, curtain(2.4, 2.9), 4.8, 11.83, Math.PI, y2); // jendela depan x 3.6–6.0
  put(lt2, downlight(), 4.0, 9.7, 0, y2 + 3.3); put(lt2, downlight(), 5.6, 11.2, 0, y2 + 3.3);

  return { lt1, lt2 };
}
