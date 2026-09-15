// Bangun situs 3D-only untuk GitHub Pages → folder dist/.
// Hanya tampilan 3D (walkthrough + orbit + irisan), tanpa panel hitungan/gambar/download.
// Jalankan: node scripts/build-pages.mjs   lalu deploy isi dist/ ke GitHub Pages.
import { rm, mkdir, cp, writeFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');

await rm(dist, { recursive: true, force: true });
await mkdir(dist, { recursive: true });

// aset yang dibutuhkan tampilan 3D saja
await cp(join(root, 'src'), join(dist, 'src'), { recursive: true });
await cp(join(root, 'vendor'), join(dist, 'vendor'), { recursive: true });
await cp(join(root, 'styles.css'), join(dist, 'styles.css'));
await mkdir(join(dist, 'models'), { recursive: true });
await cp(join(root, 'models', 'rumah.glb'), join(dist, 'models', 'rumah.glb'));
// TIDAK disalin: drawings/ (7,9 MB PDF), models/rumah-raw.glb (96 MB), *.skp (31 MB)

await writeFile(join(dist, '.nojekyll'), ''); // cegah Jekyll mengabaikan folder

const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Rumah Mbak Alfi — Walkthrough 3D</title>
<link rel="stylesheet" href="styles.css" />
<script type="importmap">
{ "imports": { "three": "./vendor/three/three.module.js", "three/addons/": "./vendor/three/" } }
</script>
</head>
<body>
<canvas id="c"></canvas>

<div id="hud" class="mini" title="Klik untuk buka/tutup info">
  <div id="hud-mode" class="muted"></div>
  <div id="hud-room">—</div>
  <div id="hud-detail"></div>
</div>

<div id="crosshair" hidden></div>

<div id="overlay">
  <div class="card">
    <h1>Rumah Mbak Alfi <span>walkthrough 3D</span></h1>
    <p><b>Klik untuk mulai jalan</b> · <kbd>W</kbd><kbd>A</kbd><kbd>S</kbd><kbd>D</kbd> + mouse · <kbd>Shift</kbd> lari · <kbd>Esc</kbd> lepas</p>
    <p class="muted"><kbd>1</kbd>/<kbd>2</kbd>/<kbd>3</kbd> teras · lantai 2 · depan rumah &nbsp; <kbd>M</kbd> orbit &nbsp; <kbd>H</kbd> irisan lantai &nbsp; <kbd>G</kbd> model SKP/blok</p>
    <p class="muted">Toolbar kanan bawah: ganti tampilan (Jalan / Orbit / Atas / Atap) &amp; irisan lantai. Di mode orbit, klik 2× di lantai untuk berdiri di sana.</p>
  </div>
</div>

<div id="viewbar">
  <div class="grp">
    <button data-view="walk" class="active" title="Jalan kaki (WASD)">🚶 Jalan</button>
    <button data-view="orbit" title="Putar bebas: drag = putar, scroll = zoom, klik 2× di lantai = berdiri di sana">🛸 Orbit</button>
    <button data-view="top" title="Tegak lurus dari atas (denah)">⬆ Atas</button>
    <button data-view="roof" title="Pandangan drone: atap & fasad">🏠 Atap</button>
  </div>
  <div class="grp">
    <span class="lbl">Irisan</span>
    <button data-cut="lt1" title="Potong: lihat lantai 1 dari atas">Lt 1</button>
    <button data-cut="lt2" title="Potong: buka atap, lihat lantai 2">Lt 2</button>
    <button data-cut="none" class="active" title="Model utuh">Utuh</button>
  </div>
</div>

<script type="module" src="src/app.js"></script>
</body>
</html>
`;
await writeFile(join(dist, 'index.html'), html);

// laporan ukuran
async function du(p) { try { return (await stat(p)).size; } catch { return 0; } }
const glb = await du(join(dist, 'models', 'rumah.glb'));
console.log('dist/ siap.');
console.log(`  index.html 3D-only, models/rumah.glb ${(glb / 1048576).toFixed(1)} MB`);
console.log('  Deploy: publish isi folder dist/ ke GitHub Pages (lihat README).');
