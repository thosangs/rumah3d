// Canvas → tekstur pola keramik (menunjukkan keping utuh vs potongan)
import * as THREE from 'three';
import { bbox } from './tiles.js';

export const COLORS = {
  polos: { full: '#f3efe7', cut: '#f2c9a3', L: '#d9c3ef', grout: '#b9b2a6' },
  structured: { full: '#cfcac1', cut: '#e5b98f', L: '#c9b6dc', grout: '#8f8a82' },
  bath: { full: '#dfe7ea', cut: '#f2c9a3', L: '#d9c3ef', grout: '#9aa4a8' },
  teraso: { full: '#eceef0', cut: '#e6c8a6', grout: '#a3a8ae', chips: ['#2f5da8', '#4a7fd0', '#1d3f7a', '#7fa3d8', '#c9d6ea', '#5b6f8c'] }, // teraso titik biru
  putih: { full: '#f7f7f4', cut: '#f2c9a3', grout: '#bdbdb8' },
};

function palette(area) {
  if (area.isBathroom) return COLORS.bath;
  if (area.outdoor) return COLORS.structured;
  return COLORS.polos;
}

/**
 * Gambar pola lantai untuk satu area. Mengembalikan {texture, bb}.
 * Canvas menutupi bounding box region; bagian di luar region transparan.
 */
export function floorTexture(area, layout, pxPerM = 110, showLabels = true) {
  const bb = bbox(area.rects);
  const W = bb.x2 - bb.x1;
  const H = bb.y2 - bb.y1;
  const cw = Math.max(8, Math.round(W * pxPerM));
  const ch = Math.max(8, Math.round(H * pxPerM));
  const cv = document.createElement('canvas');
  cv.width = cw;
  cv.height = ch;
  const ctx = cv.getContext('2d');
  const pal = palette(area);
  const X = (x) => (x - bb.x1) * pxPerM;
  const Y = (y) => (y - bb.y1) * pxPerM;

  for (const c of layout.cells) {
    const color = c.full ? pal.full : c.shape === 'L' ? pal.L : pal.cut;
    for (const p of c.parts) {
      ctx.fillStyle = color;
      ctx.fillRect(X(p.x1), Y(p.y1), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
      // tekstur halus untuk granit kasar
      if (area.outdoor) {
        ctx.fillStyle = 'rgba(0,0,0,0.05)';
        for (let k = 0; k < 6; k++) {
          const rx = X(p.x1) + Math.random() * (p.x2 - p.x1) * pxPerM;
          const ry = Y(p.y1) + Math.random() * (p.y2 - p.y1) * pxPerM;
          ctx.fillRect(rx, ry, 2, 2);
        }
      }
    }
    // nat (grout): satu keping = satu garis keliling. Keping yang melintasi batas dua persegi area
    // tersimpan sebagai beberapa 'part'; garis di antara part BUKAN nat, jadi jangan digambar.
    const lw = Math.max(1.5, pxPerM * 0.012);
    ctx.strokeStyle = pal.grout;
    ctx.lineWidth = lw;
    if (c.shape === 'rect' || c.parts.length === 1) {
      ctx.strokeRect(X(c.x1), Y(c.y1), (c.x2 - c.x1) * pxPerM, (c.y2 - c.y1) * pxPerM);
    } else {
      for (const p of c.parts) ctx.strokeRect(X(p.x1), Y(p.y1), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
      // hapus garis di sisi yang berimpit antara dua part (bentuk L)
      ctx.strokeStyle = color;
      ctx.lineWidth = lw + 1;
      for (const a of c.parts) for (const b of c.parts) {
        if (a === b) continue;
        if (Math.abs(a.x2 - b.x1) < 1e-6) { const y1 = Math.max(a.y1, b.y1), y2 = Math.min(a.y2, b.y2); if (y2 > y1) { ctx.beginPath(); ctx.moveTo(X(a.x2), Y(y1) + lw); ctx.lineTo(X(a.x2), Y(y2) - lw); ctx.stroke(); } }
        if (Math.abs(a.y2 - b.y1) < 1e-6) { const x1 = Math.max(a.x1, b.x1), x2 = Math.min(a.x2, b.x2); if (x2 > x1) { ctx.beginPath(); ctx.moveTo(X(x1) + lw, Y(a.y2)); ctx.lineTo(X(x2) - lw, Y(a.y2)); ctx.stroke(); } }
      }
    }
    if (showLabels && !c.full) {
      const lbl = `${Math.round(c.w * 100)}×${Math.round(c.h * 100)}`;
      const fs = Math.min(c.w, c.h) * pxPerM * 0.45;
      if (fs >= 7) {
        ctx.fillStyle = 'rgba(40,30,20,0.85)';
        ctx.font = `${Math.min(fs, pxPerM * 0.16)}px system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(lbl, X((c.x1 + c.x2) / 2), Y((c.y1 + c.y2) / 2));
      }
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return { texture: tex, bb, canvas: cv };
}

/**
 * Tekstur dinding kamar mandi (2 motif). wallLayout dari layoutWall.
 * Canvas: lebar = len, tinggi = totalH. Bukaan pintu transparan.
 */
export function wallTexture(wallLayout, zones, pxPerM = 160, showLabels = false) {
  const W = wallLayout.len;
  const H = zones.bottomH + zones.topH;
  const cv = document.createElement('canvas');
  cv.width = Math.round(W * pxPerM);
  cv.height = Math.round(H * pxPerM);
  const ctx = cv.getContext('2d');
  const X = (x) => x * pxPerM;
  const Y = (y) => (H - y) * pxPerM; // y=0 lantai di bawah canvas
  for (const c of wallLayout.cells) {
    const pal = c.zone === 'bawah' ? COLORS.teraso : COLORS.putih;
    const color = c.full ? pal.full : pal.cut;
    const x = X(c.x1), y = Y(c.y2), w = (c.x2 - c.x1) * pxPerM, h = (c.y2 - c.y1) * pxPerM;
    const parts = c.parts || [c];
    // gambar hanya bagian keping yang ada (keping dicoak bukaan = bentuk L): clip ke union part
    ctx.save();
    ctx.beginPath();
    for (const p of parts) ctx.rect(X(p.x1), Y(p.y2), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
    ctx.clip();
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
    if (c.zone === 'bawah') {
      // motif teraso: serpihan batu acak
      const n = Math.round((w * h) / 45);
      for (let k = 0; k < n; k++) {
        ctx.fillStyle = pal.chips[(Math.random() * pal.chips.length) | 0];
        const s = 0.8 + Math.random() * 2.2; // serpihan 0,5–2 cm
        ctx.beginPath(); ctx.ellipse(x + Math.random() * w, y + Math.random() * h, s, s * (0.6 + Math.random() * 0.6), Math.random() * Math.PI, 0, Math.PI * 2); ctx.fill();
      }
    }
    // nat: keliling kotak pembatas + tepi coakan (setengah garis terpotong clip → tebal 2× lalu 2 px efektif)
    ctx.strokeStyle = pal.grout;
    ctx.lineWidth = 4;
    ctx.strokeRect(x, y, w, h);
    if (parts.length > 1) {
      for (const p of parts) ctx.strokeRect(X(p.x1), Y(p.y2), (p.x2 - p.x1) * pxPerM, (p.y2 - p.y1) * pxPerM);
      // garis antar part bukan nat → timpa dengan warna keping
      ctx.strokeStyle = color;
      ctx.lineWidth = 5;
      for (const a of parts) for (const b of parts) {
        if (a === b) continue;
        if (Math.abs(a.x2 - b.x1) < 1e-6) { const y1 = Math.max(a.y1, b.y1), y2 = Math.min(a.y2, b.y2); if (y2 > y1) { ctx.beginPath(); ctx.moveTo(X(a.x2), Y(y2) + 3); ctx.lineTo(X(a.x2), Y(y1) - 3); ctx.stroke(); } }
        if (Math.abs(a.y2 - b.y1) < 1e-6) { const x1 = Math.max(a.x1, b.x1), x2 = Math.min(a.x2, b.x2); if (x2 > x1) { ctx.beginPath(); ctx.moveTo(X(x1) + 3, Y(a.y2)); ctx.lineTo(X(x2) - 3, Y(a.y2)); ctx.stroke(); } }
      }
    }
    ctx.restore();
    if (showLabels && !c.full && Math.min(w, h) > 10) {
      const txt = `${Math.round(c.w * 100)}×${Math.round(c.h * 100)}`;
      ctx.fillStyle = 'rgba(30,20,10,0.8)';
      ctx.font = `${Math.min(h * 0.45, (w * 0.9) / (txt.length * 0.6), pxPerM * 0.12)}px system-ui, sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(txt, x + w / 2, y + h / 2);
    }
  }
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  return { texture: tex, W, H };
}

/** Tekstur sederhana: beton/rumput/aspal dengan noise */
export function noiseTexture(base, spot, size = 256, density = 400) {
  const cv = document.createElement('canvas');
  cv.width = cv.height = size;
  const ctx = cv.getContext('2d');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = spot;
  for (let i = 0; i < density; i++) ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  return tex;
}
